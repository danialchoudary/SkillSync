import { verifyEmailTransport } from '../utils/sendEmail.js';

export async function checkEmailHealth() {
  await verifyEmailTransport();
}
