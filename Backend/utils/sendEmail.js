import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const RETRY_DELAYS_MS = [0, 1500, 4000];

const createTransporter = () => {
    const host = process.env.EMAIL_HOST;
    const user = process.env.EMAIL_USER;
    const pass = process.env.EMAIL_PASS;

    if (!host) throw new Error('EMAIL_HOST not set');
    if (!user || !pass) throw new Error('EMAIL_USER/EMAIL_PASS not set');

    const port = Number(process.env.EMAIL_PORT || 587);
    const secure = process.env.EMAIL_SECURE
        ? process.env.EMAIL_SECURE === 'true'
        : port === 465;

    return nodemailer.createTransport({
        host,
        port,
        secure, // true for 465, false for other ports
        connectionTimeout: 15000,
        greetingTimeout: 15000,
        socketTimeout: 30000,
        auth: {
            user,
            pass,
        },
    });
};

export const verifyEmailTransport = async () => {
    const transporter = createTransporter();
    await transporter.verify();
};

const sendEmail = async (options) => {
    const mailOptions = {
        from: `"SkillSync Support" <${process.env.EMAIL_USER}>`,
        to: options.email,
        subject: options.subject,
        html: options.message,
    };

    let lastErr = null;
    for (let attempt = 0; attempt < RETRY_DELAYS_MS.length; attempt += 1) {
        const delay = RETRY_DELAYS_MS[attempt];
        if (delay > 0) {
            await sleep(delay);
        }

        const transporter = createTransporter();
        try {
            const info = await transporter.sendMail(mailOptions);
            const accepted = Array.isArray(info?.accepted) ? info.accepted : [];
            const rejected = Array.isArray(info?.rejected) ? info.rejected : [];

            if (accepted.length === 0 && rejected.length > 0) {
                const error = new Error('Email rejected by SMTP server');
                error.code = 'EENVELOPE';
                throw error;
            }

            return;
        } catch (err) {
            lastErr = err;
            const code = String(err?.code || '');
            const msg = String(err?.message || '').toLowerCase();
            const isConfigError =
                msg.includes('not set') ||
                code === 'EAUTH' ||
                code === 'EENVELOPE';

            if (isConfigError) {
                break;
            }
        } finally {
            if (typeof transporter.close === 'function') {
                transporter.close();
            }
        }
    }

    throw lastErr || new Error('Failed to send email');
};

export default sendEmail;
