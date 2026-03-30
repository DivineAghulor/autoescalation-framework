import { slack, supabase } from '../index.js';

/**
 * Sends an issue alert to the appropriate Slack channel
 * @param {Object} issue - The issue object with all details
 */
export async function sendIssueAlert(issue) {
    try {
        // Get team details
        const { data: team } = await supabase
            .from('teams')
            .select('slack_channel_id')
            .eq('id', issue.team_id)
            .single();

        if (!team?.slack_channel_id) {
            console.warn(`No Slack channel configured for team ${issue.team_id}`);
            return;
        }

        // Get assignee details if any
        let assigneeMention = '';
        if (issue.assignee_id) {
            const { data: assignee } = await supabase
                .from('users')
                .select('slack_user_id')
                .eq('id', issue.assignee_id)
                .single();

            if (assignee?.slack_user_id) {
                assigneeMention = `<@${assignee.slack_user_id}> `;
            }
        }

        // Calculate SLA status
        const slaStatus = getSLAStatus(issue);
        const slaEmoji = slaStatus === 'GREEN' ? '🟢' : slaStatus === 'YELLOW' ? '🟡' : '🔴';

        // Prepare the message
        const blocks = [
            {
                type: 'header',
                text: {
                    type: 'plain_text',
                    text: `🚨 New Issue: ${issue.title}`
                }
            },
            {
                type: 'section',
                fields: [
                    {
                        type: 'mrkdwn',
                        text: `*Severity:* ${issue.severity}`
                    },
                    {
                        type: 'mrkdwn',
                        text: `*Status:* ${issue.status}`
                    },
                    {
                        type: 'mrkdwn',
                        text: `*Team:* ${team.name || 'Unassigned'}`
                    },
                    {
                        type: 'mrkdwn',
                        text: `*Assignee:* ${assigneeMention || 'Unassigned'}` 
                    },
                    {
                        type: 'mrkdwn',
                        text: `*SLA:* ${slaEmoji} ${slaStatus}`
                    }
                ]
            },
            {
                type: 'section',
                text: {
                    type: 'mrkdwn',
                    text: `*Description:*\n${issue.description.substring(0, 500)}${issue.description.length > 500 ? '...' : ''}`
                }
            },
            {
                type: 'actions',
                elements: [
                    {
                        type: 'button',
                        text: {
                            type: 'plain_text',
                            text: 'Acknowledge'
                        },
                        action_id: 'acknowledge_issue',
                        value: issue.id
                    },
                    {
                        type: 'button',
                        text: {
                            type: 'plain_text',
                            text: 'Change Severity'
                        },
                        action_id: 'change_severity',
                        value: issue.id
                    },
                    {
                        type: 'button',
                        text: {
                            type: 'plain_text',
                            text: 'Mark Resolved'
                        },
                        action_id: 'mark_resolved',
                        value: issue.id
                    }
                ]
            }
        ];

        // Send the message
        const result = await slack.chat.postMessage({
            channel: team.slack_channel_id,
            text: `New issue: ${issue.title}`, // Fallback text
            blocks: blocks
        });

        // Store the thread timestamp
        await supabase
            .from('issues')
            .update({ slack_thread_ts: result.ts })
            .eq('id', issue.id);

        console.log(`Alert sent to Slack for issue ${issue.id}`);
    } catch (error) {
        console.error('Error sending Slack alert:', error);
    }
}

/**
 * Replies to an issue's Slack thread
 * @param {string} issueId - The issue ID
 * @param {string} message - The message to send
 */
export async function replyToIssueThread(issueId, message) {
    try {
        const { data: issue } = await supabase
            .from('issues')
            .select('slack_thread_ts, team_id, teams(slack_channel_id)')
            .eq('id', issueId)
            .single();

        if (!issue?.slack_thread_ts || !issue.teams?.slack_channel_id) {
            console.warn(`No Slack thread or channel for issue ${issueId}`);
            return;
        }

        await slack.chat.postMessage({
            channel: issue.teams.slack_channel_id,
            thread_ts: issue.slack_thread_ts,
            text: message
        });

        console.log(`Reply sent to Slack thread for issue ${issueId}`);
    } catch (error) {
        console.error('Error replying to Slack thread:', error);
    }
}

/**
 * Calculates SLA status for an issue
 * @param {Object} issue - The issue object
 * @returns {string} - 'GREEN', 'YELLOW', or 'RED'
 */
export function getSLAStatus(issue) {
    if (!issue.resolution_deadline) return 'GREEN';

    const now = new Date();
    const deadline = new Date(issue.resolution_deadline);
    const created = new Date(issue.created_at);
    const totalTime = deadline - created;
    const elapsed = now - created;
    const remainingPercent = (totalTime - elapsed) / totalTime;

    if (remainingPercent > 0.5) return 'GREEN';
    if (remainingPercent > 0.1) return 'YELLOW';
    return 'RED';
}