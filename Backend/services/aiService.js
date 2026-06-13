import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from 'dotenv';
import { extractTextFromPdf } from '../utils/pdfUtils.js';

dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

/**
 * Analyzes the match between a job and a candidate using Gemini AI.
 * @param {Object} job - Job data (title, description, skills)
 * @param {Object} candidate - Candidate data (name, skills, experience, coverLetter, resumeUrl)
 * @returns {Promise<Object>} - Match score and analysis
 */
export const analyzeMatch = async (job, candidate) => {
    try {
        const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });

        // Extract text from resume if available
        const resumeText = candidate.resumeUrl ? await extractTextFromPdf(candidate.resumeUrl) : "";

        const prompt = `
        You are an expert recruiter. Analyze the match between the following job and candidate.
        
        ### Job Details
        Title: ${job.title}
        Description: ${job.description}
        Required Skills: ${job.skills.join(', ')}
        
        ### Candidate Details
        Name: ${candidate.name}
        Profile Skills: ${candidate.skills?.join(', ') || 'Not specified'}
        Profile Experience: ${candidate.experience || 'Not specified'}
        Cover Letter: ${candidate.coverLetter || 'None'}
        ${resumeText ? `### Resume Content\n${resumeText.substring(0, 10000)}` : '### Resume Content\nNot provided'}

        Provide a response in strict JSON format with exactly two keys:
        1. "score": An integer between 0 and 100 representing the match percentage.
        2. "analysis": A concise 2-3 sentence summary explaining the score based on skills, experience, and fit. Be specific if you found details in the resume.

        JSON Response:
        `;

        const result = await model.generateContent(prompt);
        const responseText = result.response.text();

        const cleanJson = responseText.replace(/```json|```/g, '').trim();
        return JSON.parse(cleanJson);
    } catch (error) {
        console.error('[AI Service] Match analysis error:', error);
        throw new Error('Failed to analyze candidate match');
    }
};

/**
 * Generates a tailored cover letter using Gemini AI.
 * @param {Object} job - Job data (title, description, skills, company)
 * @param {Object} candidate - Candidate data (name, skills, experience, resumeUrl)
 * @returns {Promise<string>} - The generated cover letter
 */
export const generateCoverLetter = async (job, candidate) => {
    try {
        const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });

        const resumeText = candidate.resumeUrl ? await extractTextFromPdf(candidate.resumeUrl) : "";

        const prompt = `
        You are an expert career coach writing a professional cover letter for a candidate applying for a job.
        
        ### Job Details
        Title: ${job.title}
        Company: ${job.company || 'the company'}
        Description: ${job.description}
        Required Skills: ${job.skills?.join(', ') || 'Not specified'}
        
        ### Candidate Details
        Name: ${candidate.name}
        Profile Skills: ${candidate.skills?.join(', ') || 'Not specified'}
        Profile Experience: ${candidate.experience || 'Not specified'}
        ${resumeText ? `### Resume Content\n${resumeText.substring(0, 5000)}` : ''}

        Write a concise, compelling cover letter (around 150-250 words) from the perspective of the candidate. 
        It should highlight their relevant skills and experience matching the job description.
        Do not include placeholders like "[Your Phone Number]" or headers, just the body of the letter and the sign-off with their name.
        Keep it professional, confident, and direct.

        Cover Letter:
        `;

        const result = await model.generateContent(prompt);
        return result.response.text().trim();
    } catch (error) {
        console.error('[AI Service] Cover letter generation error:', error);
        throw new Error('Failed to generate cover letter');
    }
};
