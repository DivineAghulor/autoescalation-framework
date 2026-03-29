const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const dotenv = require('dotenv');
const cron = require('node-cron');
const { createClient } = require('@supabase/supabase-js');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const { WebClient } = require('@slack/web-api');
const multer = require('multer');
const path = require('path');

// Load environment variables
dotenv.config();

// Initialize clients
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);
const slack = new WebClient(process.env.SLACK_BOT_TOKEN);

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

// Import routes (to be created)
const issueRoutes = require('./routes/issues');
const webhookRoutes = require('./routes/webhooks');

// Import services
const { checkSLABreaches } = require('./services/slaService');

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

module.exports = { app, supabase, genAI, slack };