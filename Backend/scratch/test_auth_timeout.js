import sendEmail from '../utils/sendEmail.js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../.env') });

const EMAIL_SEND_TIMEOUT_MS = 15000;

async function sendVerificationEmailWithTimeout({ email, subject, message }) {
  const emailPromise = sendEmail({ email, subject, message })
    .then(() => ({ sent: true }))
    .catch((error) => ({ sent: false, error }));

  const timeoutPromise = new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        sent: false,
        error: new Error(`Verification email timed out after ${EMAIL_SEND_TIMEOUT_MS}ms`),
      });
    }, EMAIL_SEND_TIMEOUT_MS);
  });

  return Promise.race([emailPromise, timeoutPromise]);
}

async function test() {
    console.log('Testing email sending with timeout (simulating AuthController)...');
    try {
        const result = await sendVerificationEmailWithTimeout({
            email: process.env.EMAIL_USER,
            subject: 'SkillSync Timeout Test',
            message: '<h1>Test</h1>'
        });
        
        if (result.sent) {
            console.log('✅ Email sent successfully within timeout!');
        } else {
            console.error('❌ Email failed or timed out:');
            console.error(result.error);
        }
    } catch (error) {
        console.error('❌ Unexpected error:');
        console.error(error);
    }
}

test();
