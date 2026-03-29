const express = require('express');
const crypto = require('crypto');
const { supabase } = require('../index');
const { classifyIssue, handleIngestionFailure } = require('../services/aiService');
const { sendIssueAlert, replyToIssueThread } = require('../services/slackService');

const router = express.Router();

/**
 * POST /webhooks/email
 * Email webhook for inbound support emails
 */
router.post('/email', async (req, res) => {
    try {
        // Verify webhook signature (implement based on your email provider)
        // For Resend: check req.headers['x-resend-signature']
        // For SendGrid: check req.headers['x-twilio-email-event-webhook-signature']

        const { from, subject, text, html, attachments } = req.body;

        if (!from || !text) {
            return res.status(400).json({ error: 'Invalid email payload' });
        }

        // Extract sender email
        const senderEmail = from.email || from;

        // Find merchant by email
        const { data: merchant } = await supabase
            .from('merchants')
            .select('id')
            .eq('contact_email', senderEmail)
            .single();

        if (!merchant) {
            console.warn(`No merchant found for email: ${senderEmail}`);
            return res.status(200).json({ message: 'Email received but merchant not found' });
        }

        // Extract images from attachments or inline
        const imageUrls = [];
        if (attachments) {
            // Process attachments (implementation depends on provider)
            // For now, assume URLs are provided
        }

        // Classify the issue
        let classification;
        try {
            classification = await classifyIssue(text || html, imageUrls);
        } catch (error) {
            console.error('Classification failed for email:', error);
            await handleIngestionFailure(req.body, error.message);
            return res.status(200).json({ message: 'Email received but processing failed. Queued for manual review.' });
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
        const status = classification.confidence >= 0.75 ? 'UNASSIGNED' : 'UNASSIGNED';
        const teamId = classification.confidence >= 0.75 ? team?.id : null;

        // Set resolution deadline
        const resolutionDeadline = new Date();
        resolutionDeadline.setHours(resolutionDeadline.getHours() + 48);

        // Create the issue
        const { data: issue, error: issueError } = await supabase
            .from('issues')
            .insert({
                title: classification.title,
                description: text || html,
                status,
                severity: classification.severity,
                team_id: teamId,
                feature_id: feature?.id,
                reporter_email: senderEmail,
                source: 'SUPPORT_EMAIL',
                resolution_deadline: resolutionDeadline.toISOString(),
                ai_confidence: classification.confidence
            })
            .select()
            .single();

        if (issueError) {
            console.error('Issue creation error from email:', issueError);
            return res.status(500).json({ error: 'Failed to create issue from email' });
        }

        // Log the creation
        await supabase
            .from('issue_audit_logs')
            .insert({
                issue_id: issue.id,
                action_type: 'CREATED',
                notes: `Issue created from support email (confidence: ${classification.confidence})`
            });

        // Send Slack alert if confidence is high enough
        if (classification.confidence >= 0.75 && teamId) {
            await sendIssueAlert(issue);
        }

        res.status(200).json({ message: 'Email processed successfully', issueId: issue.id });
    } catch (error) {
        console.error('Error processing email webhook:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

/**
 * POST /webhooks/slack
 * Slack interactive webhook for button actions
 */
router.post('/slack', async (req, res) => {
    try {
        // Verify Slack signature
        const timestamp = req.headers['x-slack-request-timestamp'];
        const signature = req.headers['x-slack-signature'];
        const body = req.rawBody || JSON.stringify(req.body);

        const baseString = `v0:${timestamp}:${body}`;
        const hmac = crypto.createHmac('sha256', process.env.SLACK_SIGNING_SECRET);
        hmac.update(baseString);
        const expectedSignature = `v0=${hmac.digest('hex')}`;

        if (signature !== expectedSignature) {
            return res.status(401).json({ error: 'Invalid signature' });
        }

        const payload = JSON.parse(req.body.payload);
        const { type, actions, user, trigger_id } = payload;

        if (type !== 'block_actions') {
            return res.status(200).json({ message: 'Ignored' });
        }

        const action = actions[0];
        const issueId = action.value;

        // Handle different actions
        switch (action.action_id) {
            case 'acknowledge_issue':
                await handleAcknowledge(issueId, user.id);
                break;
            case 'change_severity':
                // For simplicity, cycle through severities
                await handleChangeSeverity(issueId);
                break;
            case 'mark_resolved':
                await handleMarkResolved(issueId);
                break;
            default:
                console.warn(`Unknown action: ${action.action_id}`);
        }

        res.status(200).json({ message: 'Action processed' });
    } catch (error) {
        console.error('Error processing Slack webhook:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

/**
 * Handle acknowledge action
 */
async function handleAcknowledge(issueId, slackUserId) {
    // Find user by Slack ID
    const { data: user } = await supabase
        .from('users')
        .select('id')
        .eq('slack_user_id', slackUserId)
        .single();

    if (!user) {
        await replyToIssueThread(issueId, '❌ User not found in system');
        return;
    }

    // Update issue
    const { error } = await supabase
        .from('issues')
        .update({
            status: 'IN_PROGRESS',
            assignee_id: user.id
        })
        .eq('id', issueId);

    if (error) {
        console.error('Error acknowledging issue:', error);
        await replyToIssueThread(issueId, '❌ Failed to acknowledge issue');
        return;
    }

    // Log the change
    await supabase
        .from('issue_audit_logs')
        .insert({
            issue_id: issueId,
            user_id: user.id,
            action_type: 'STATUS_CHANGED',
            old_value: 'UNASSIGNED',
            new_value: 'IN_PROGRESS',
            notes: 'Issue acknowledged via Slack'
        });

    await replyToIssueThread(issueId, `✅ Issue acknowledged by <@${slackUserId}> and moved to IN_PROGRESS`);
}

/**
 * Handle change severity action (simplified)
 */
async function handleChangeSeverity(issueId) {
    // For demo, cycle LOW -> MEDIUM -> HIGH -> CRITICAL -> LOW
    const { data: issue } = await supabase
        .from('issues')
        .select('severity')
        .eq('id', issueId)
        .single();

    const severities = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];
    const currentIndex = severities.indexOf(issue.severity);
    const newSeverity = severities[(currentIndex + 1) % severities.length];

    const { error } = await supabase
        .from('issues')
        .update({ severity: newSeverity })
        .eq('id', issueId);

    if (error) {
        console.error('Error changing severity:', error);
        await replyToIssueThread(issueId, '❌ Failed to change severity');
        return;
    }

    // Log the change
    await supabase
        .from('issue_audit_logs')
        .insert({
            issue_id: issueId,
            action_type: 'STATUS_CHANGED',
            old_value: issue.severity,
            new_value: newSeverity,
            notes: 'Severity changed via Slack'
        });

    await replyToIssueThread(issueId, `🔄 Severity changed from ${issue.severity} to ${newSeverity}`);
}

/**
 * Handle mark resolved action
 */
async function handleMarkResolved(issueId) {
    const { error } = await supabase
        .from('issues')
        .update({
            status: 'RESOLVED',
            resolved_at: new Date().toISOString()
        })
        .eq('id', issueId);

    if (error) {
        console.error('Error resolving issue:', error);
        await replyToIssueThread(issueId, '❌ Failed to mark issue as resolved');
        return;
    }

    // Log the change
    await supabase
        .from('issue_audit_logs')
        .insert({
            issue_id: issueId,
            action_type: 'STATUS_CHANGED',
            old_value: 'IN_PROGRESS',
            new_value: 'RESOLVED',
            notes: 'Issue marked as resolved via Slack'
        });

    await replyToIssueThread(issueId, '✅ Issue marked as resolved!');
}

module.exports = router;