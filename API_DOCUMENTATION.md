# AI Auto-Escalation API Documentation

## Overview

The AI Auto-Escalation API provides endpoints for creating and managing customer support issues with AI-powered classification, Slack integration, and automatic escalation.

Base URL: `http://your-domain.com`

## Authentication

All endpoints require proper webhook signatures or are protected by Supabase RLS policies.

## Endpoints

### Issues

#### Create Issue (Web Form)
**POST** `/api/issues`

Creates a new issue from a web form with optional file attachments.

**Request:**
- Content-Type: `multipart/form-data`
- Body:
  - `description` (string, required): Issue description
  - `productTeam` (string, optional): Product team name
  - `reporterUserId` (string, optional): Reporter user ID
  - `files` (file[], optional): Up to 5 files (max 10MB each)

**Response:**
```json
{
  "issueId": "uuid"
}
```

**Status Codes:**
- `201`: Issue created successfully
- `400`: Missing required fields
- `500`: Server error or AI classification failure

#### Extend Resolution Timer
**PATCH** `/api/issues/:id/timer`

Extends the resolution deadline for an issue.

**Request:**
```json
{
  "extensionHours": 48
}
```

**Response:**
```json
{
  "message": "Timer extended successfully",
  "newDeadline": "2024-01-01T12:00:00.000Z"
}
```

**Status Codes:**
- `200`: Timer extended
- `500`: Server error

### Webhooks

#### Email Webhook
**POST** `/webhooks/email`

Processes inbound support emails from Resend or SendGrid.

**Request Headers:**
- Signature verification headers (provider-specific)

**Request Body:** (Provider-specific format)
```json
{
  "from": {"email": "user@example.com"},
  "subject": "Issue title",
  "text": "Issue description",
  "html": "<p>Issue description</p>",
  "attachments": []
}
```

**Response:**
```json
{
  "message": "Email processed successfully",
  "issueId": "uuid"
}
```

**Status Codes:**
- `200`: Email processed
- `400`: Invalid payload
- `500`: Processing error

#### Slack Interactive Webhook
**POST** `/webhooks/slack`

Handles Slack button interactions (acknowledge, change severity, mark resolved).

**Request Headers:**
- `X-Slack-Signature`: HMAC signature
- `X-Slack-Request-Timestamp`: Timestamp

**Request Body:**
```json
{
  "payload": {
    "type": "block_actions",
    "actions": [{"action_id": "acknowledge_issue", "value": "issue-uuid"}],
    "user": {"id": "slack-user-id"},
    "trigger_id": "trigger-id"
  }
}
```

**Response:**
```json
{
  "message": "Action processed"
}
```

**Status Codes:**
- `200`: Action processed
- `401`: Invalid signature
- `500`: Server error

### Health Check

#### Get Health Status
**GET** `/health`

Returns server health information.

**Response:**
```json
{
  "status": "OK",
  "timestamp": "2024-01-01T12:00:00.000Z"
}
```

## Data Models

### Issue
```json
{
  "id": "uuid",
  "title": "string",
  "description": "string",
  "status": "UNASSIGNED|IN_PROGRESS|RESOLVED|CLOSED_WONT_FIX",
  "severity": "LOW|MEDIUM|HIGH|CRITICAL",
  "team_id": "uuid|null",
  "feature_id": "uuid|null",
  "assignee_id": "uuid|null",
  "reporter_email": "string|null",
  "source": "WEB_FORM|SUPPORT_EMAIL",
  "resolution_deadline": "timestamp|null",
  "slack_thread_ts": "string|null",
  "escalation_count": "integer",
  "ai_confidence": "decimal",
  "created_at": "timestamp",
  "updated_at": "timestamp",
  "resolved_at": "timestamp|null"
}
```

### Attachment
```json
{
  "id": "uuid",
  "issue_id": "uuid",
  "filename": "string",
  "url": "string",
  "created_at": "timestamp"
}
```

### Audit Log
```json
{
  "id": "uuid",
  "issue_id": "uuid",
  "user_id": "uuid|null",
  "action_type": "string",
  "old_value": "string|null",
  "new_value": "string|null",
  "notes": "string|null",
  "created_at": "timestamp"
}
```

## Error Handling

All endpoints return appropriate HTTP status codes and error messages in JSON format:

```json
{
  "error": "Error description"
}
```

## Rate Limiting

- General: 100 requests per 15 minutes per IP
- Applied to all endpoints except webhooks

## File Upload Limits

- Maximum 5 files per issue
- Maximum 10MB per file
- Supported formats: All (stored in Supabase Storage)

## Webhook Security

### Slack Webhooks
- HMAC-SHA256 signature verification
- Timestamp validation (within 5 minutes)

### Email Webhooks
- Provider-specific signature verification
- Implement based on your email provider's documentation

## Background Jobs

### SLA Monitoring
- Runs every 5 minutes
- Checks for breached resolution deadlines
- Automatically escalates and extends deadlines
- Sends Slack notifications

## Dependencies

- Node.js 16+
- Express.js
- Supabase (PostgreSQL)
- Google Generative AI (Gemini)
- Slack Web API
- Multer (file uploads)
- Node-cron (scheduled jobs)

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `SUPABASE_URL` | Supabase project URL | Yes |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key | Yes |
| `GOOGLE_API_KEY` | Google AI API key | Yes |
| `SLACK_BOT_TOKEN` | Slack bot token | Yes |
| `SLACK_SIGNING_SECRET` | Slack signing secret | Yes |
| `RESEND_API_KEY` | Resend API key (if using Resend) | Optional |
| `SENDGRID_API_KEY` | SendGrid API key (if using SendGrid) | Optional |
| `PORT` | Server port (default: 3000) | Optional |

## Deployment Considerations

- Use PM2 or similar for production
- Set up proper logging
- Configure database connection pooling
- Implement monitoring and alerting
- Set up SSL/TLS
- Configure firewall rules for webhooks