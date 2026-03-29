Here's a comprehensive, phased implementation plan for the AI Auto-Escalation framework. I'll start with a high-level architecture diagram, then walk through each phase in detail.Here's your full phased implementation plan:

---

## Phase 0 — External setup & project scaffold

_Before writing a single line of app code, get your infrastructure in place._

**Step 0.1 — Supabase project** 🔧 _Outside code_ Create a new project at supabase.com. This gives you a hosted PostgreSQL database, auto-generated REST API, and Auth. Grab your `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` from the project settings.

**Step 0.2 — Anthropic API key** 🔧 _Outside code_ Sign up at console.anthropic.com and generate an API key. You'll use `claude-sonnet-4-20250514` for classification. Store this as `ANTHROPIC_API_KEY` in your `.env`.

**Step 0.3 — Slack App** 🔧 _Outside code_ Create a new Slack App at api.slack.com/apps. Enable Bot Token Scopes: `chat:write`, `channels:read`, `users:read`. Enable Interactivity (for quick-action buttons) and set your Request URL to your backend's `/webhooks/slack` endpoint. Save your `SLACK_BOT_TOKEN` and `SLACK_SIGNING_SECRET`.

**Step 0.4 — Email ingestion service** 🔧 _Outside code_ Use either Resend (resend.com) or SendGrid with Inbound Parse. Configure your support@ domain so inbound emails POST their parsed body/attachments to your `/webhooks/email` endpoint as JSON.


**Step 0.5 — File storage** 🔧 _Outside code_ Enable Supabase Storage and create a bucket called `attachments`. Set an RLS policy that only your service role can upload. This replaces the AWS S3 reference in the PRD for simplicity.

**Step 0.6 — Monorepo scaffold** Initialize a Node.js/Express backend (`/server`) and a React + Vite frontend (`/client`) in a single repo. Set up a shared `.env`. Install core dependencies: `express`, `@supabase/supabase-js`, `@anthropic-ai/sdk`, `@slack/web-api`, `@slack/bolt`, `pg`, `node-cron`.

---

## Phase 1 — Database schema

_Lay the foundation everything else builds on._

**Step 1.1 — Run migrations in Supabase** Use the Supabase SQL Editor or a migration tool like `db-migrate` to execute the schema from your PRD document: `merchants`, `users`, `teams`, `features`, `issues`, `attachments`, `issue_audit_logs`, `ai_ingestion_failures`. Add indexes on `issues.status`, `issues.team_id`, `issues.resolution_deadline`, and `issues.created_at` — these are the columns your dashboard filters and timer queries will hit constantly.

**Step 1.2 — Seed reference data** Insert the five product teams (`DASHBOARD`, `TRADING_API_3_0`, `BASQET`, `AXECRAFT`, `RAMP`) and their known features into the `teams` and `features` tables. This seed data is what the AI uses as its classification target list.

**Step 1.3 — Set up Row Level Security (RLS)** Enable RLS on all tables. Define policies so that Merchant Success users can read all issues, PMs and Engineers can only read issues for their `team_id`, and the service role (used by your backend) bypasses RLS entirely.

---

## Phase 2 — AI triage engine

_The core intelligence of the product._

**Step 2.1 — Classification service** Build a `classifyIssue(text, imageUrls[])` function that sends the issue description and any screenshot base64 data to the Anthropic API. The prompt should instruct Claude to return a structured JSON object containing `team` (one of your five team enums), `feature` (matched against your seed list), `severity` (`LOW`/`MEDIUM`/`HIGH`/`CRITICAL`), `title` (a short AI-generated summary), and `confidence` (0.0–1.0). Use `claude-sonnet-4-20250514` with a system prompt that includes the full list of teams and features as reference.

**Step 2.2 — Confidence routing** After classification, check `confidence`. If it's above your threshold (e.g. `0.75`), write directly to `issues` with the AI-populated fields. If it's below, write to `issues` with `status = UNASSIGNED` and `team_id = null`, so Merchant Success sees it in the review queue. Either way, write an `issue_audit_logs` entry with `action_type = CREATED`.

**Step 2.3 — Ingestion failure safety net** Wrap the entire classification call in a try/catch. On any error, write the raw payload to `ai_ingestion_failures` with `processed_status = PENDING_MANUAL_REVIEW`. This ensures no client email ever silently vanishes.

---

## Phase 3 — Intake APIs

_The two entry points for issues coming into the system._

**Step 3.1 — Web form API (`POST /api/issues`)** Accept multipart form data: description, product team, reporter user ID, and optional file uploads. Upload files to Supabase Storage, get back their URLs, then call `classifyIssue()`. Write the resulting issue and attachments to the database. Return the new issue ID.

**Step 3.2 — Email webhook (`POST /webhooks/email`)** Receive the inbound parse payload from Resend/SendGrid. Extract sender email, body text, and any inline images. Identify the merchant by matching `sender_email` against `merchants.contact_email`. Call `classifyIssue()` with the email body and images. Write the issue, setting `source = SUPPORT_EMAIL` and `reporter_email` from the sender.

**Step 3.3 — Webhook signature verification** Both the email and Slack webhooks must verify request signatures before processing. For Slack, use `@slack/bolt`'s built-in verification. For email providers, verify the webhook secret header. Reject unverified requests with a 401.

---

## Phase 4 — Slack integration

_Real-time coordination for internal teams._

**Step 4.1 — Alert dispatcher** Build a `sendIssueAlert(issue)` function using `@slack/web-api`. Look up the team's `slack_channel_id` from the `teams` table and the assignee's `slack_user_id` from `users`. Post a structured Block Kit message that includes the issue title, severity, feature, description excerpt, and a link to the dashboard. Store the returned `ts` (timestamp) in `issues.slack_thread_ts` — this is essential for all future replies to land in the same thread.

**Step 4.2 — Interactive quick-action buttons** Add three Block Kit Action buttons to each alert: "Acknowledge" (sets `status = IN_PROGRESS` and assigns the clicker as `assignee_id`), "Change severity" (opens a modal with a dropdown), and "Mark resolved" (sets `status = RESOLVED` and stamps `resolved_at`). Each button includes the `issue_id` in its `value` so your webhook knows which record to update.

**Step 4.3 — Slack action webhook (`POST /webhooks/slack`)** Handle incoming `block_actions` payloads from Bolt. Parse the action, update the database, write an `issue_audit_logs` entry, and reply in the issue's thread confirming the change. This is what keeps Slack and the dashboard in sync without polling.

---

## Phase 5 — Timer & auto-escalation

_The accountability layer._

**Step 5.1 — Resolution timer on issue creation** When an issue is created, set `resolution_deadline = created_at + 48 hours`. Expose a `PATCH /api/issues/:id/timer` endpoint that lets PMs extend the deadline; this should write a `TIMER_EXTENDED` audit log entry.

**Step 5.2 — Cron job for SLA breaches** Set up a `node-cron` job running every 5 minutes. It queries `issues` where `status NOT IN ('RESOLVED', 'CLOSED_WONT_FIX') AND resolution_deadline < NOW()`. For each result, it sends a re-ping in the issue's Slack thread (using `slack_thread_ts` to reply in-thread), increments `escalation_count`, writes an `SLA_BREACHED_ESCALATED` audit log, and updates `resolution_deadline` to the current time + 48 hours to avoid spamming.

**Step 5.3 — SLA colour calculation** Build a helper `getSLAStatus(issue)` that returns `GREEN`, `YELLOW`, or `RED` based on how much of the resolution window remains: more than 50% left = green, 10–50% = yellow, under 10% or already breached = red. This is a pure function called on the frontend and also used by the Slack alert to include an emoji indicator.

---

## Phase 6 — Dashboard (frontend)

_The central visibility layer for all internal users._

**Step 6.1 — Authentication** Use Supabase Auth (email + password). On login, read the user's `role` and `team_id` from the `users` table. Store this in a React context. Gate routes: PMs and Engineers only see their team's views; Merchant Success and Admins see all.

**Step 6.2 — Global overview page** Fetch a 7-day lookback using a Supabase query grouped by `DATE(created_at)` and `status`. Display a simple bar chart (resolved vs. unresolved per day) and top-level KPI cards: total open, critical issues, average time to resolution.

**Step 6.3 — Team pages** A page per product team (linked from a nav bar). Each page shows: issues grouped by feature sorted by unresolved count descending, and a "Recent activity" card showing the 5 most recent issues. This maps directly to section 4.2 of the PRD.

**Step 6.4 — Master issue list with filters** A full table of all issues, sortable by date, with dropdown filters for Severity, Status, Date Added, and Feature. Filter state lives in URL query params so links are shareable. Each row shows the SLA colour indicator computed by your `getSLAStatus()` helper.

**Step 6.5 — Issue detail page** A dedicated page per issue showing the full description, attachments, audit log timeline (every status change, timer extension, escalation), and a form for Merchant Success to log a client communication note. Changing status or severity from this page should fire your backend API, which in turn updates Slack.

---

## Phase 7 — Deployment

_Getting it live._ 🔧 _Outside code_

**Step 7.1 — Deploy backend** Use Railway (railway.app) or Render (render.com) — both support Node.js with zero-config deploys from GitHub. Add all your `.env` variables as environment variables in the dashboard. Set the start command to `node server/index.js`.

**Step 7.2 — Deploy frontend** Deploy the Vite React app to Vercel or Netlify. Set `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` as build-time environment variables.

**Step 7.3 — Update webhook URLs** Once your backend has a live URL, update the Slack App's Interactivity Request URL and the email provider's inbound webhook URL with the production address.

**Step 7.4 — Supabase connection pooling** In production, enable Supabase's built-in PgBouncer connection pooling. Update your `DATABASE_URL` to use the pooler port (6543 instead of 5432) to handle concurrent requests efficiently.

---

## Key environment variables summary

|Variable|Where to get it|
|---|---|
|`SUPABASE_URL`|Supabase project settings|
|`SUPABASE_SERVICE_ROLE_KEY`|Supabase project settings|
|`SUPABASE_ANON_KEY`|Supabase project settings|
|`ANTHROPIC_API_KEY`|console.anthropic.com|
|`SLACK_BOT_TOKEN`|api.slack.com/apps → OAuth|
|`SLACK_SIGNING_SECRET`|api.slack.com/apps → Basic Info|
|`EMAIL_WEBHOOK_SECRET`|Resend/SendGrid dashboard|
|`VITE_SUPABASE_URL`|Same as `SUPABASE_URL` (frontend)|
|`VITE_SUPABASE_ANON_KEY`|Same as anon key (frontend)|

---

The natural build order is **0 → 1 → 2 → 3 → 4 → 5 → 6 → 7**, but for a hackathon you can parallelize: get Phase 1 and 3 working first (issues can be created), then Phase 2 (they get classified), then Phases 4 and 5 together (Slack + timers), and finally Phase 6 (dashboard). Let me know which phase you want to dive into first and I can write the actual code.