import { analyzeMatch } from './services/aiService.js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(process.cwd(), '.env') });

// A public sample PDF URL for testing
const SAMPLE_PDF_URL = 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf';

async function testPdfParsing() {
    console.log('Testing AI Match with PDF extraction...');

    const job = {
        title: 'Software Engineer',
        description: 'Need someone who knows about dummy PDFs and web accessibility.',
        skills: ['JavaScript', 'Web Standards']
    };

    const candidate = {
        name: 'Test Candidate',
        skills: ['JavaScript'],
        experience: '2 years of making dummy files.',
        coverLetter: 'I love dummies.',
        resumeUrl: SAMPLE_PDF_URL
    };

    try {
        console.log('Fetching and analyzing...');
        const result = await analyzeMatch(job, candidate);
        console.log('✅ Result:', JSON.stringify(result, null, 2));
    } catch (err) {
        console.error('❌ Test failed:', err.message);
    }
}

testPdfParsing();
