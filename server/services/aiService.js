import { genAI, supabase } from '../index.js';

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

        // Prepare the prompt
        const prompt = `
You are an AI assistant that classifies customer support issues for a fintech company.

Available teams: ${teamNames}

Available features by team:
${featureList}

Analyze the following issue description and classify it. Return a JSON object with the following structure:
{
  "team": "one of the available teams",
  "feature": "one of the available features for that team",
  "severity": "LOW" | "MEDIUM" | "HIGH" | "CRITICAL",
  "title": "a short summary title (max 100 characters)",
  "confidence": 0.0 to 1.0 (decimal)
}

Issue description: ${text}

${imageUrls.length > 0 ? `Screenshots: ${imageUrls.join(', ')}` : ''}

Respond only with valid JSON, no additional text.
`;

        // Use Gemini to classify
        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const classification = JSON.parse(response.text());

        // Validate the response
        if (!classification.team || !classification.feature || !classification.severity || !classification.title || typeof classification.confidence !== 'number') {
            throw new Error('Invalid classification response from AI');
        }

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