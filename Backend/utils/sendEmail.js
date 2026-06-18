import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

const RETRY_DELAYS_MS = [0];

function getEmailSettings() {
    const host = process.env.EMAIL_HOST;
    const user = process.env.EMAIL_USER;
    let pass = process.env.EMAIL_PASS;

    if (!host) throw new Error('EMAIL_HOST not set');
    if (!user || !pass) throw new Error('EMAIL_USER/EMAIL_PASS not set');

    if (host.includes('gmail.com')) {
        pass = pass.replace(/\s+/g, '');
    }

    return { host, user, pass };
}

function uniqueConfigs(configs) {
    const seen = new Set();
    return configs.filter((config) => {
        const key = `${config.service || config.host}:${config.port || ''}:${config.secure || false}`;
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
    });
}

function buildTransportConfigs() {
  const { host } = getEmailSettings();
  const port = Number(process.env.EMAIL_PORT || 587);
  const secure = process.env.EMAIL_SECURE
        ? process.env.EMAIL_SECURE === 'true'
        : port === 465;

  const configured = { host, port, secure };
  const configs = [];

  if (host.includes('gmail.com')) {
    configs.push(
      {
        host: '74.125.143.108',
        port: 587,
        secure: false,
        servername: 'smtp.gmail.com',
      },
      configured,
    );
  } else {
    configs.push(configured);
  }

    return uniqueConfigs(configs);
}

function describeConfig(config) {
    if (config.service) return `service:${config.service}`;
    return `${config.host}:${config.port}`;
}

const createTransporter = (transportConfig) => {
    const { user, pass } = getEmailSettings();

    // Deep clone to avoid mutating the original config
    const config = { ...transportConfig };

    return nodemailer.createTransport({
        ...config,
        connectionTimeout: 8000,
        greetingTimeout: 8000,
        socketTimeout: 12000,
        auth: {
            user,
            pass,
        },
        tls: {
            rejectUnauthorized: false, 
            servername: config.host || 'smtp.gmail.com'
        }
    });
};

export const verifyEmailTransport = async () => {
    let lastErr = null;
    const tried = [];

    for (const config of buildTransportConfigs()) {
        const transporter = createTransporter(config);
        tried.push(describeConfig(config));

        try {
            await transporter.verify();
            return;
        } catch (err) {
            lastErr = err;
        } finally {
            if (typeof transporter.close === 'function') {
                transporter.close();
            }
        }
    }

    if (lastErr) {
        lastErr.message = `${lastErr.message} (tried ${tried.join(', ')})`;
    }
    throw lastErr || new Error('Email transport verification failed');
};

const sendEmail = async (options) => {
    const { user } = getEmailSettings();
    const mailOptions = {
        from: `"SkillSync Support" <${user}>`,
        to: options.email,
        subject: options.subject,
        html: options.message,
    };

    console.log(`[Email] Starting send attempt to ${options.email}`);
    let lastErr = null;
    for (let attempt = 0; attempt < RETRY_DELAYS_MS.length; attempt += 1) {
        const configs = buildTransportConfigs();
        for (let i = 0; i < configs.length; i++) {
            const config = configs[i];
            const configDesc = describeConfig(config);
            console.log(`[Email] Trying config ${i + 1}/${configs.length}: ${configDesc}`);
            
            const transporter = createTransporter(config);
            try {
                const startTime = Date.now();
                const info = await transporter.sendMail(mailOptions);
                const duration = Date.now() - startTime;
                
                const accepted = Array.isArray(info?.accepted) ? info.accepted : [];
                const rejected = Array.isArray(info?.rejected) ? info.rejected : [];

                if (accepted.length === 0 && rejected.length > 0) {
                    const error = new Error('Email rejected by SMTP server');
                    error.code = 'EENVELOPE';
                    throw error;
                }

                console.log(`[Email] Success! Sent via ${configDesc} in ${duration}ms`);
                return;
            } catch (err) {
                lastErr = err;
                console.warn(`[Email] Failed via ${configDesc}: ${err.message} (code: ${err.code})`);
                const code = String(err?.code || '');
                const msg = String(err?.message || '').toLowerCase();
                const isConfigError =
                    msg.includes('not set') ||
                    code === 'EAUTH' ||
                    code === 'EENVELOPE';

                if (isConfigError) {
                    console.error(`[Email] Fatal config error, stopping: ${err.message}`);
                    throw lastErr;
                }
            } finally {
                if (typeof transporter.close === 'function') {
                    transporter.close();
                }
            }
        }        
    }

    console.error(`[Email] All attempts failed. Last error: ${lastErr?.message}`);
    throw lastErr || new Error('Failed to send email');
};

export default sendEmail;
