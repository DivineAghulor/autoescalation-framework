-- Row Level Security (RLS) Policies
-- Run this after schema and seed data

-- Enable RLS on all tables
ALTER TABLE merchants ENABLE ROW LEVEL SECURITY;
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE features ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE issues ENABLE ROW LEVEL SECURITY;
ALTER TABLE attachments ENABLE ROW LEVEL SECURITY;
ALTER TABLE issue_audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_ingestion_failures ENABLE ROW LEVEL SECURITY;

-- Service role bypasses RLS (for backend operations)
-- This is handled by Supabase automatically for the service role

-- Policies for users table
-- Users can read their own record
CREATE POLICY "Users can read own record" ON users
    FOR SELECT USING (auth.uid() = id);

-- Admins can read all users
CREATE POLICY "Admins can read all users" ON users
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM users u
            WHERE u.id = auth.uid() AND u.role = 'ADMIN'
        )
    );

-- Policies for teams table
-- All authenticated users can read teams
CREATE POLICY "All users can read teams" ON teams FOR SELECT TO authenticated USING (true);

-- Admins can manage teams
CREATE POLICY "Admins can manage teams" ON teams FOR ALL TO authenticated USING (
    EXISTS (
        SELECT 1 FROM users u
        WHERE u.id = auth.uid() AND u.role = 'ADMIN'
    )
);

-- Policies for features table
-- All authenticated users can read features
CREATE POLICY "All users can read features" ON features FOR SELECT TO authenticated USING (true);

-- Admins can manage features
CREATE POLICY "Admins can manage features" ON features FOR ALL TO authenticated USING (
    EXISTS (
        SELECT 1 FROM users u
        WHERE u.id = auth.uid() AND u.role = 'ADMIN'
    )
);

-- Policies for issues table
-- Merchant Success can read all issues
CREATE POLICY "Merchant Success can read all issues" ON issues
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM users u
            WHERE u.id = auth.uid() AND u.role = 'MERCHANT_SUCCESS'
        )
    );

-- PMs and Engineers can read issues for their team
CREATE POLICY "Team members can read team issues" ON issues
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM users u
            WHERE u.id = auth.uid()
            AND (u.role IN ('PM', 'ENGINEER'))
            AND u.team_id = issues.team_id
        )
    );

-- Users can insert issues (for web form)
CREATE POLICY "Users can insert issues" ON issues FOR INSERT TO authenticated WITH CHECK (true);

-- Team members can update issues for their team
CREATE POLICY "Team members can update team issues" ON issues
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM users u
            WHERE u.id = auth.uid()
            AND (u.role IN ('PM', 'ENGINEER') AND u.team_id = issues.team_id)
            OR u.role IN ('MERCHANT_SUCCESS', 'ADMIN')
        )
    );

-- Policies for attachments table
-- Users can read attachments for issues they can access
CREATE POLICY "Users can read accessible attachments" ON attachments
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM issues i
            WHERE i.id = attachments.issue_id
            AND (
                EXISTS (
                    SELECT 1 FROM users u
                    WHERE u.id = auth.uid() AND u.role = 'MERCHANT_SUCCESS'
                )
                OR EXISTS (
                    SELECT 1 FROM users u
                    WHERE u.id = auth.uid()
                    AND (u.role IN ('PM', 'ENGINEER'))
                    AND u.team_id = i.team_id
                )
            )
        )
    );

-- Users can insert attachments for issues they can access
CREATE POLICY "Users can insert accessible attachments" ON attachments
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM issues i
            WHERE i.id = attachments.issue_id
            AND (
                EXISTS (
                    SELECT 1 FROM users u
                    WHERE u.id = auth.uid() AND u.role = 'MERCHANT_SUCCESS'
                )
                OR EXISTS (
                    SELECT 1 FROM users u
                    WHERE u.id = auth.uid()
                    AND (u.role IN ('PM', 'ENGINEER'))
                    AND u.team_id = i.team_id
                )
            )
        )
    );

-- Policies for issue_audit_logs table
-- Users can read audit logs for issues they can access
CREATE POLICY "Users can read accessible audit logs" ON issue_audit_logs
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM issues i
            WHERE i.id = issue_audit_logs.issue_id
            AND (
                EXISTS (
                    SELECT 1 FROM users u
                    WHERE u.id = auth.uid() AND u.role = 'MERCHANT_SUCCESS'
                )
                OR EXISTS (
                    SELECT 1 FROM users u
                    WHERE u.id = auth.uid()
                    AND (u.role IN ('PM', 'ENGINEER'))
                    AND u.team_id = i.team_id
                )
            )
        )
    );

-- Users can insert audit logs for issues they can access
CREATE POLICY "Users can insert accessible audit logs" ON issue_audit_logs
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM issues i
            WHERE i.id = issue_audit_logs.issue_id
            AND (
                EXISTS (
                    SELECT 1 FROM users u
                    WHERE u.id = auth.uid() AND u.role = 'MERCHANT_SUCCESS'
                )
                OR EXISTS (
                    SELECT 1 FROM users u
                    WHERE u.id = auth.uid()
                    AND (u.role IN ('PM', 'ENGINEER'))
                    AND u.team_id = i.team_id
                )
            )
        )
    );

-- Policies for ai_ingestion_failures table
-- Only admins and Merchant Success can access
CREATE POLICY "Admins and Merchant Success can access AI failures" ON ai_ingestion_failures
    FOR ALL TO authenticated USING (
        EXISTS (
            SELECT 1 FROM users u
            WHERE u.id = auth.uid() AND u.role IN ('ADMIN', 'MERCHANT_SUCCESS')
        )
    );

-- Policies for merchants table
-- Merchant Success and Admins can read merchants
CREATE POLICY "Merchant Success and Admins can read merchants" ON merchants
    FOR SELECT TO authenticated USING (
        EXISTS (
            SELECT 1 FROM users u
            WHERE u.id = auth.uid() AND u.role IN ('ADMIN', 'MERCHANT_SUCCESS')
        )
    );

-- Admins can manage merchants
CREATE POLICY "Admins can manage merchants" ON merchants FOR ALL TO authenticated USING (
    EXISTS (
        SELECT 1 FROM users u
        WHERE u.id = auth.uid() AND u.role = 'ADMIN'
    )
);