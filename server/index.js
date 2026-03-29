import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import cron from 'node-cron';
import { createClient } from '@supabase/supabase-js';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { WebClient } from '@slack/web-api';
import multer from 'multer';
import path from 'path';
import issueRoutes from './routes/issues.js';
import webhookRoutes from './routes/webhooks.js';
import { checkSLABreaches } from './services/slaService.js';

// Load environment variables
dotenv.config();

// Initialize clients
export const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
export const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);
export const slack = new WebClient(process.env.SLACK_BOT_TOKEN);

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Raw body middleware for webhook signature verification
app.use('/webhooks/slack', express.raw({ type: 'application/x-www-form-urlencoded', limit: '10mb' }));

// Rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    message: 'Too many requests from this IP, please try again later.'
});
app.use(limiter);

// Multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({ storage: storage, limits: { fileSize: 10 * 1024 * 1024 } }); // 10MB limit

// Routes
app.use('/api/issues', issueRoutes);
app.use('/webhooks', webhookRoutes);

// Health check
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Something went wrong!' });
});

// Start server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

// Cron job for SLA breaches (Phase 5.2)
cron.schedule('*/5 * * * *', async () => {
    console.log('Running SLA breach check...');
    try {
        await checkSLABreaches();
    } catch (error) {
        console.error('Error in SLA breach check:', error);
    }
});

export { app };