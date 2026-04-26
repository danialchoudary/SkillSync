import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';
import Job from '../models/Job.js';
import JobApplication from '../models/JobApplication.js';
import { extractTextFromPdf } from '../utils/pdfUtils.js';

dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const SYSTEM_PROMPT = `You are an expert AI recruiting assistant for SkillSync. You help recruiters analyze and query their applicant pool using natural language.

Your capabilities:
- Answer questions about applicants, their skills, experience, and resumes
- Compare candidates against each other or against job requirements
- Identify top candidates for specific roles or skill sets
- Provide summaries and insights about the applicant pipeline
- Suggest which candidates to prioritize for interviews

Rules:
- Only reference candidates that exist in the provided data. Never invent candidates.
- Be specific — cite candidate names, skills, and experience when answering.
- If asked about something not in the data, say so clearly.
- Keep responses concise and actionable — recruiters are busy.
- Format responses with markdown for readability (bullet points, bold names, etc).
- When comparing candidates, use a structured format (table or ranked list).`;

/**
 * Builds a structured plain-text context document from a recruiter's applicant data.
 * @param {string} recruiterId - The recruiter's user ID.
 * @returns {Promise<string>} - Formatted context string.
 */
export async function buildApplicantContext(recruiterId) {
    // 1. Fetch all jobs posted by this recruiter
    const jobs = await Job.find({ recruiter: recruiterId }).lean();

    if (jobs.length === 0) {
        return 'No jobs found for this recruiter. The recruiter has not posted any jobs yet.';
    }

    const jobIds = jobs.map((j) => j._id);

    // 2. Fetch all applications for those jobs, populated with user and job data
    const applications = await JobApplication.find({ jobId: { $in: jobIds } })
        .populate('jobSeekerId', 'name email skills experience resumeLink profilePicture')
        .populate('jobId', 'title description skills experience salary location company')
        .lean();

    if (applications.length === 0) {
        return buildJobsOnlyContext(jobs);
    }

    // 3. Extract resume text for each applicant (limit to first 3000 chars per resume)
    const resumeTexts = await Promise.all(
        applications.map(async (app) => {
            const resumeUrl = app.resumeUrl || app.jobSeekerId?.resumeLink;
            if (!resumeUrl) return '';
            try {
                const text = await extractTextFromPdf(resumeUrl);
                return text.substring(0, 3000);
            } catch {
                return '';
            }
        }),
    );

    // 4. Assemble the context document
    const lines = ['=== RECRUITER APPLICANT DATA ===\n'];

    // Group applications by job
    const jobMap = new Map();
    for (const job of jobs) {
        jobMap.set(String(job._id), { job, applications: [] });
    }

    for (let i = 0; i < applications.length; i++) {
        const app = applications[i];
        const jobId = String(app.jobId?._id || app.jobId);
        if (jobMap.has(jobId)) {
            jobMap.get(jobId).applications.push({ app, resumeText: resumeTexts[i] });
        }
    }

    for (const [, { job, applications: jobApps }] of jobMap) {
        lines.push(`--- JOB: ${job.title} ---`);
        lines.push(`Company: ${job.company}`);
        lines.push(`Location: ${job.location}`);
        lines.push(`Salary: ${job.salary}`);
        lines.push(`Required Skills: ${job.skills?.join(', ') || 'Not specified'}`);
        lines.push(`Required Experience: ${job.experience || 0} years`);
        lines.push(`Description: ${job.description}`);
        lines.push(`Number of applicants: ${jobApps.length}`);
        lines.push('');

        if (jobApps.length === 0) {
            lines.push('  No applicants for this job.\n');
            continue;
        }

        for (const { app, resumeText } of jobApps) {
            const seeker = app.jobSeekerId || {};
            lines.push(`  APPLICANT: ${seeker.name || 'Unknown'}`);
            lines.push(`    Email: ${seeker.email || 'N/A'}`);
            lines.push(`    Application ID: ${app._id}`);
            lines.push(`    Status: ${app.status || 'applied'}`);
            lines.push(`    Applied: ${app.appliedAt ? new Date(app.appliedAt).toLocaleDateString() : 'N/A'}`);
            lines.push(`    Profile Skills: ${seeker.skills?.join(', ') || 'Not specified'}`);
            lines.push(`    Profile Experience: ${seeker.experience || 'Not specified'}`);
            lines.push(`    Cover Letter: ${app.coverLetter || 'None'}`);
            if (resumeText) {
                lines.push(`    Resume Summary:\n${resumeText.split('\n').map((l) => `      ${l}`).join('\n')}`);
            } else {
                lines.push('    Resume: Not available');
            }
            lines.push('');
        }
    }

    return lines.join('\n');
}

/**
 * Builds a minimal context when the recruiter has jobs but no applicants.
 */
function buildJobsOnlyContext(jobs) {
    const lines = ['=== RECRUITER APPLICANT DATA ===\n'];
    lines.push('No applicants have applied to any of your jobs yet.\n');
    lines.push('Your current job postings:');
    for (const job of jobs) {
        lines.push(`  - ${job.title} (${job.company}, ${job.location})`);
    }
    return lines.join('\n');
}

// Fallback model chain — quotas are per-model, so if one is exhausted we try the next
const MODEL_CHAIN = [
    'gemini-2.0-flash',        // Primary (if available and quota allows)
    'gemini-1.5-flash-latest', // Fallback 1
    'gemini-flash-latest',     // Fallback 2 (known to work in aiService.js)
];

/**
 * Tries generating content across a chain of models.
 * If a model hits a 429 rate limit or 404 not found, moves to the next model.
 * @param {string} prompt - The full prompt to send.
 * @returns {Promise<*>} - The Gemini result.
 */
async function generateWithFallback(prompt) {
    let lastError;

    for (const modelName of MODEL_CHAIN) {
        try {
            const model = genAI.getGenerativeModel({ model: modelName });
            const result = await model.generateContent(prompt);
            return result;
        } catch (err) {
            lastError = err;
            const isRetryable = err.status === 429 || err.status === 404;

            if (isRetryable) {
                console.log(`[RAG Service] Model ${modelName} failed (${err.status}), trying next model...`);
                continue;
            }

            // Non-retryable error — throw immediately
            throw err;
        }
    }

    // All models exhausted
    throw lastError;
}


/**
 * Sends a chat message to Gemini with the recruiter's applicant context.
 * @param {string} recruiterId - The recruiter's user ID.
 * @param {string} userMessage - The recruiter's question.
 * @param {Array<{role: string, content: string}>} conversationHistory - Previous messages.
 * @returns {Promise<string>} - The AI response text.
 */
export async function chat(recruiterId, userMessage, conversationHistory = []) {
    // Build the applicant context
    const context = await buildApplicantContext(recruiterId);

    // Construct the full prompt with history
    const historyText = conversationHistory
        .map((msg) => `${msg.role === 'user' ? 'Recruiter' : 'Assistant'}: ${msg.content}`)
        .join('\n\n');

    const prompt = `${SYSTEM_PROMPT}

${context}

${historyText ? `=== CONVERSATION HISTORY ===\n${historyText}\n` : ''}=== CURRENT QUESTION ===
Recruiter: ${userMessage}

Respond helpfully and concisely:`;

    const result = await generateWithFallback(prompt);
    return result.response.text();
}
