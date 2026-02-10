import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from 'dotenv';

dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

/**
 * Analyzes the match between a job and a candidate using Gemini AI.
 * @param {Object} job - Job data (title, description, skills)
 * @param {Object} candidate - Candidate data (name, skills, experience, coverLetter)
 * @returns {Promise<Object>} - Match score and analysis
 */
export const analyzeMatch = async (job, candidate) => {
    try {
        const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });

        const prompt = `
        You are an expert recruiter. Analyze the match between the following job and candidate.
        
        Job Title: ${job.title}
        Job Description: ${job.description}
        Required Skills: ${job.skills.join(', ')}
        
        Candidate Name: ${candidate.name}
        Candidate Skills: ${candidate.skills?.join(', ') || 'Not specified'}
        Candidate Experience: ${candidate.experience || 'Not specified'}
        Candidate Cover Letter: ${candidate.coverLetter || 'None'}

        Provide a response in strict JSON format with exactly two keys:
        1. "score": An integer between 0 and 100 representing the match percentage.
        2. "analysis": A concise 2-3 sentence summary explaining the score based on skills, experience, and fit.

        JSON Response:
        `;

        const result = await model.generateContent(prompt);
        const responseText = result.response.text();

        // Clean the response text in case Gemini adds markdown code blocks
        const cleanJson = responseText.replace(/```json|```/g, '').trim();
        return JSON.parse(cleanJson);
    } catch (error) {
        console.error('[AI Service] Match analysis error:', error);
        throw new Error('Failed to analyze candidate match');
    }
};
