import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

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
    const transporter = createTransporter();

    const mailOptions = {
        from: `"SkillSync Support" <${process.env.EMAIL_USER}>`,
        to: options.email,
        subject: options.subject,
        html: options.message,
    };

    // Retry once for transient SMTP/provider issues to improve first-send reliability.
    try {
        await transporter.sendMail(mailOptions);
    } catch (firstErr) {
        const msg = String(firstErr?.message || '').toLowerCase();
        const isConfigError = msg.includes('not set');
        if (isConfigError) {
            throw firstErr;
        }

        await sleep(1200);
        await transporter.sendMail(mailOptions);
    }
};

export default sendEmail;
