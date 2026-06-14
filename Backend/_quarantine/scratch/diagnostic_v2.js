import sendEmail from '../utils/sendEmail.js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../.env') });

async function test() {
    console.log('--- SkillSync Email Diagnostic ---');
    console.log('Testing connection with updated IPv4 settings...');
    try {
        await sendEmail({
            email: process.env.EMAIL_USER,
            subject: 'SkillSync Diagnostic - Day 2',
            message: '<h1>Diagnostic Test</h1><p>Checking if SMTP transport is still working with the new IPv4 fixes.</p>'
        });
        console.log('✅ Success! The credentials and code are working perfectly.');
    } catch (error) {
        console.error('❌ Diagnostic Failed:');
        console.error(error);
    }
}

test();
