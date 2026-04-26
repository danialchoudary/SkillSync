import { chat } from '../services/ragService.js';

/**
 * POST /rag/chat
 * Body: { message: string, history?: Array<{role: string, content: string}> }
 * Response: { reply: string }
 */
export async function handleChat(req, res) {
    try {
        if (!req.user || req.user.role !== 'recruiter') {
            return res.status(403).json({ error: 'Access denied. Recruiter role required.' });
        }

        const { message, history } = req.body;

        if (!message || typeof message !== 'string' || message.trim().length === 0) {
            return res.status(400).json({ error: 'Message is required.' });
        }

        if (history && !Array.isArray(history)) {
            return res.status(400).json({ error: 'History must be an array.' });
        }

        const reply = await chat(req.user._id, message.trim(), history || []);

        return res.json({ reply });
    } catch (err) {
        console.error('[RAG Controller] Chat error:', err);

        // Surface a specific message for rate-limit errors
        if (err.status === 429 || err.statusText === 'Too Many Requests') {
            return res.status(429).json({
                error: 'AI service is temporarily busy. Please wait 30 seconds and try again.',
            });
        }

        return res.status(500).json({ error: 'Failed to process your question. Please try again.' });
    }
}
