import sendEmail from '../utils/sendEmail.js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../.env') });

async function test() {
    console.log('Testing email sending...');
    try {
        await sendEmail({
            email: process.env.EMAIL_USER, // Send to self
            subject: 'SkillSync Email Test',
            message: '<h1>Test Email</h1><p>This is a test email from SkillSync diagnostic script.</p>'
        });
        console.log('✅ Email sent successfully!');
    } catch (error) {
        console.error('❌ Failed to send email:');
        console.error(error);
    }
}

test();
