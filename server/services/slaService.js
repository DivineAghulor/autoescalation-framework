const { supabase } = require('../index');
const { replyToIssueThread } = require('./slackService');

/**
 * Checks for SLA breaches and escalates issues
 */
async function checkSLABreaches() {
    try {
        const now = new Date().toISOString();

        // Find issues that have breached SLA
        const { data: breachedIssues, error } = await supabase
            .from('issues')
            .select('id, escalation_count, resolution_deadline')
            .not('status', 'in', '("RESOLVED","CLOSED_WONT_FIX")')
            .lt('resolution_deadline', now);

        if (error) {
            console.error('Error fetching breached issues:', error);
            return;
        }

        for (const issue of breachedIssues) {
            // Increment escalation count
            const newEscalationCount = (issue.escalation_count || 0) + 1;

            // Extend deadline by another 48 hours
            const newDeadline = new Date();
            newDeadline.setHours(newDeadline.getHours() + 48);

            // Update the issue
            await supabase
                .from('issues')
                .update({
                    escalation_count: newEscalationCount,
                    resolution_deadline: newDeadline.toISOString()
                })
                .eq('id', issue.id);

            // Log the escalation
            await supabase
                .from('issue_audit_logs')
                .insert({
                    issue_id: issue.id,
                    action_type: 'SLA_BREACHED_ESCALATED',
                    notes: `SLA breached, extended deadline to ${newDeadline.toISOString()}, escalation count: ${newEscalationCount}`
                });

            // Send Slack notification
            const message = `🚨 *SLA BREACH ALERT* 🚨\n\nThis issue has breached its resolution deadline and has been automatically escalated.\n\nEscalation Count: ${newEscalationCount}\nNew Deadline: ${newDeadline.toLocaleString()}\n\nPlease prioritize resolution.`;
            await replyToIssueThread(issue.id, message);

            console.log(`Escalated issue ${issue.id}, new deadline: ${newDeadline.toISOString()}`);
        }

        console.log(`Checked ${breachedIssues.length} breached issues`);
    } catch (error) {
        console.error('Error in checkSLABreaches:', error);
    }
}

module.exports = {
    checkSLABreaches
};