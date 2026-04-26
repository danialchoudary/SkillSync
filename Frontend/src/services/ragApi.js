import api from './api';

/**
 * Sends a message to the Recruiter AI Assistant.
 * @param {string} message - The recruiter's question.
 * @param {Array<{role: string, content: string}>} history - Conversation history.
 * @returns {Promise<{reply: string}>}
 */
export async function sendRAGMessage(message, history = []) {
    const response = await api.post('/rag/chat', { message, history });
    return response.data;
}
