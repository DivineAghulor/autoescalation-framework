# AI Auto-Escalation Backend

Node.js Express backend for the AI Auto-Escalation framework.

## Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Environment Variables:**
   Copy `.env` and fill in your actual values:
   - `SUPABASE_URL`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `GOOGLE_API_KEY`
   - `SLACK_BOT_TOKEN`
   - `SLACK_SIGNING_SECRET`
   - Email provider keys (Resend or SendGrid)

3. **Database Setup:**
   Run the migration files in Supabase SQL Editor in order:
   - `migrations/001_initial_schema.sql`
   - `migrations/002_seed_data.sql`
   - `migrations/003_rls_policies.sql`

4. **Start the server:**
   ```bash
   npm start
   ```

## API Endpoints

### Issues
- `POST /api/issues` - Create issue from web form (multipart/form-data)
- `PATCH /api/issues/:id/timer` - Extend resolution deadline

### Webhooks
- `POST /webhooks/email` - Process inbound support emails
- `POST /webhooks/slack` - Handle Slack interactive actions

### Health Check
- `GET /health` - Server health status

## Features Implemented

- ✅ AI-powered issue classification using Google Gemini
- ✅ Slack integration with alerts and interactive buttons
- ✅ Email webhook processing
- ✅ Automatic SLA monitoring and escalation
- ✅ File attachment support via Supabase Storage
- ✅ Comprehensive audit logging
- ✅ Row Level Security policies
- ✅ Confidence-based routing

## Architecture

- **Services:** Modular business logic (AI, Slack, SLA)
- **Routes:** RESTful API endpoints
- **Database:** PostgreSQL via Supabase with RLS
- **External Integrations:** Google Gemini, Slack, Email providers

## Cron Jobs

- SLA breach check runs every 5 minutes
- Automatically escalates overdue issues and extends deadlines