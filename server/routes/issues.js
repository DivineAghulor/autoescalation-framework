import express from 'express';
import { supabase } from '../index.js';
import { classifyIssue, handleIngestionFailure } from '../services/aiService.js';
import { sendIssueAlert } from '../services/slackService.js';
import multer from 'multer';

const router = express.Router();

// Configure multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({ storage: storage, limits: { fileSize: 10 * 1024 * 1024 } }); // 10MB limit

/**
 * POST /api/issues
 * Web form API for creating issues
 */
router.post('/', upload.array('files', 5), async (req, res) => {
    try {
        const { description, productTeam, reporterUserId } = req.body;
        const files = req.files || [];

        if (!description) {
            return res.status(400).json({ error: 'Description is required' });
        }

        // Upload files to Supabase Storage
        const attachmentUrls = [];
        for (const file of files) {
            const fileName = `${Date.now()}-${file.originalname}`;
            const { data, error } = await supabase.storage
                .from('attachments')
                .upload(fileName, file.buffer, {
                    contentType: file.mimetype,
                    upsert: false
                });

            if (error) {
                console.error('File upload error:', error);
                continue;
            }

            const { data: { publicUrl } } = supabase.storage
                .from('attachments')
                .getPublicUrl(fileName);

            attachmentUrls.push(publicUrl);
        }

        // Classify the issue
        let classification;
        try {
            classification = await classifyIssue(description, attachmentUrls);
        } catch (error) {
            console.error('Classification failed:', error);
            await handleIngestionFailure({ description, files: attachmentUrls }, error.message);
            return res.status(500).json({ error: 'Failed to process issue. It has been queued for manual review.' });
        }

        // Get team and feature IDs
        const { data: team } = await supabase
            .from('teams')
            .select('id')
            .eq('name', classification.team)
            .single();

        const { data: feature } = await supabase
            .from('features')
            .select('id')
            .eq('name', classification.feature)
            .eq('team_id', team?.id)
            .single();

        // Determine status based on confidence
        const status = classification.confidence >= 0.75 ? 'UNASSIGNED' : 'UNASSIGNED'; // Both go to unassigned for now
        const teamId = classification.confidence >= 0.75 ? team?.id : null;

        // Set resolution deadline (48 hours from now)
        const resolutionDeadline = new Date();
        resolutionDeadline.setHours(resolutionDeadline.getHours() + 48);

        // Create the issue
        const { data: issue, error: issueError } = await supabase
            .from('issues')
            .insert({
                title: classification.title,
                description,
                status,
                severity: classification.severity,
                team_id: teamId,
                feature_id: feature?.id,
                reporter_email: null, // From web form, no email
                source: 'WEB_FORM',
                resolution_deadline: resolutionDeadline.toISOString(),
                ai_confidence: classification.confidence
            })
            .select()
            .single();

        if (issueError) {
            console.error('Issue creation error:', issueError);
            return res.status(500).json({ error: 'Failed to create issue' });
        }

        // Create attachments
        if (attachmentUrls.length > 0) {
            const attachments = attachmentUrls.map(url => ({
                issue_id: issue.id,
                filename: url.split('/').pop(),
                url
            }));

            await supabase.from('attachments').insert(attachments);
        }

        // Log the creation
        await supabase
            .from('issue_audit_logs')
            .insert({
                issue_id: issue.id,
                action_type: 'CREATED',
                notes: `Issue created via web form with AI classification (confidence: ${classification.confidence})`
            });

        // Send Slack alert if confidence is high enough
        if (classification.confidence >= 0.75 && teamId) {
            await sendIssueAlert(issue);
        }

        res.status(201).json({ issueId: issue.id });
    } catch (error) {
        console.error('Error creating issue:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

/**
 * PATCH /api/issues/:id/timer
 * Extend resolution deadline (for PMs)
 */
router.patch('/:id/timer', async (req, res) => {
    try {
        const { id } = req.params;
        const { extensionHours = 48 } = req.body;

        // Update the deadline
        const newDeadline = new Date();
        newDeadline.setHours(newDeadline.getHours() + extensionHours);

        const { error } = await supabase
            .from('issues')
            .update({ resolution_deadline: newDeadline.toISOString() })
            .eq('id', id);

        if (error) {
            console.error('Timer extension error:', error);
            return res.status(500).json({ error: 'Failed to extend timer' });
        }

        // Log the extension
        await supabase
            .from('issue_audit_logs')
            .insert({
                issue_id: id,
                action_type: 'TIMER_EXTENDED',
                notes: `Resolution deadline extended by ${extensionHours} hours to ${newDeadline.toISOString()}`
            });

        res.json({ message: 'Timer extended successfully', newDeadline: newDeadline.toISOString() });
    } catch (error) {
        console.error('Error extending timer:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

export default router;