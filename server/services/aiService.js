import { genAI, supabase } from '../index.js';
import { Type } from '@google/genai';

/**
 * Helper function to fetch an image URL and convert it to Gemini's inlineData format
 */
async function urlToGenerativePart(url) {
    const response = await fetch(url);
    const buffer = await response.arrayBuffer();
    return {
        inlineData: {
            data: Buffer.from(buffer).toString("base64"),
            mimeType: response.headers.get("content-type") || "image/jpeg",
        },
    };
}

/**
 * Classifies an issue using Google Gemini AI
 * @param {string} text - The issue description text
 * @param {string[]} imageUrls - Array of image URLs (if any)
 * @returns {Promise<Object>} - Classification result with team, feature, severity, title, confidence
 */
export async function classifyIssue(text, imageUrls = []) {
    try {
        // Get reference data for prompt
        const { data: teams } = await supabase.from('teams').select('name');
        const { data: features } = await supabase.from('features').select('name, team_id, teams(name)');

        const teamNames = teams.map(t => t.name).join(', ');
        const featureList = features.map(f => `${f.name} (${f.teams.name})`).join(', ');

        // Prepare the optimized prompt
        const prompt = `
You are an expert technical triage agent for a fintech company. Your task is to analyze customer support issues and classify them accurately to ensure fast routing.

### Reference Data
- Available Teams: [${teamNames}]
- Available Features (mapped by team): [${featureList}]

### Severity Rubric
- CRITICAL: System-wide outages, widespread financial loss, or severe security breaches.
- HIGH: Individual user completely blocked from core financial flows (e.g., cannot transfer funds, account locked).
- MEDIUM: Non-blocking bugs, degraded performance, or workflow friction.
- LOW: Cosmetic issues, feature requests, or general "how-to" inquiries.

### Issue Details
Description: ${text}

Analyze the issue and return a JSON classification. Ensure the "feature" you select strictly belongs to the "team" you select.
`;

        // Process image URLs into Gemini Part objects
        const imageParts = await Promise.all(imageUrls.map(urlToGenerativePart));

        // Combine text prompt and image parts into the content array
        const contents = [prompt, ...imageParts];

        // Define the JSON Schema for guaranteed structural output
        const responseSchema = {
            type: Type.OBJECT,
            properties: {
                team: { type: Type.STRING, description: "One of the available teams" },
                feature: { type: Type.STRING, description: "One of the available features for the selected team" },
                severity: { type: Type.STRING, enum: ["LOW", "MEDIUM", "HIGH", "CRITICAL"] },
                title: { type: Type.STRING, description: "A short summary title (max 100 characters)" },
                confidence: { type: Type.NUMBER, description: "Confidence score from 0.0 to 1.0" }
            },
            required: ["team", "feature", "severity", "title", "confidence"]
        };

        const response = await genAI.models.generateContent({
            model: 'gemini-2.5-flash-lite',
            contents: contents,
            config: {
                responseMimeType: "application/json",
                responseJsonSchema: responseSchema
            }
        });

        const responseText = response.text;
        
        console.log('AI response:', responseText);
        
        // No need to strip markdown backticks because responseMimeType guarantees pure JSON
        const classification = JSON.parse(responseText);

        return classification;
    } catch (error) {
        console.error('Error in classifyIssue:', error);
        throw error;
    }
}

/**
 * Handles AI ingestion failure by storing raw payload
 * @param {Object} rawPayload - The raw payload that failed processing
 * @param {string} errorMessage - The error message
 */
export async function handleIngestionFailure(rawPayload, errorMessage) {
    try {
        await supabase.from('ai_ingestion_failures').insert({
            raw_payload: rawPayload,
            error_message: errorMessage,
            processed_status: 'PENDING_MANUAL_REVIEW'
        });
    } catch (error) {
        console.error('Error storing ingestion failure:', error);
    }
}