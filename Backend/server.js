import 'dotenv/config';
import http from 'http';
import app from './app.js';
import { initSocket } from './socket/index.js';
import { validateEnv } from './utils/validateEnv.js';
import { connectMongo } from './utils/mongoConnection.js';
import { verifyEmailTransport } from './utils/sendEmail.js';

const PORT = process.env.PORT || 5000;

// Create HTTP server and attach Socket.IO
const httpServer = http.createServer(app);
initSocket(httpServer);

validateEnv();

connectMongo()
  .then(() => {
    httpServer.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);

      // Background SMTP check — does NOT block startup
      verifyEmailTransport()
        .then(() => console.log('[Email] SMTP connection verified OK'))
        .catch((err) => {
          const isAuthError = err?.code === 'EAUTH' || String(err?.message || '').toLowerCase().includes('invalid login');
          if (isAuthError) {
            console.error('\n[Email] ============================================================');
            console.error('[Email] CRITICAL: Gmail SMTP authentication FAILED (EAUTH).');
            console.error('[Email] EMAIL_PASS app password is invalid or expired.');
            console.error('[Email] Fix: Generate a new Gmail App Password and update EMAIL_PASS.');
            console.error('[Email] ============================================================\n');
          } else {
            console.warn('[Email] SMTP connectivity warning:', err.message);
          }
        });
    });
  })
  .catch((err) => {
    console.error('MongoDB error:', err);
    process.exit(1);
  });

// Global Error Handlers
process.on('unhandledRejection', (reason, promise) => {
  console.error('[Unhandled Rejection] at:', promise, 'reason:', reason);
});

process.on('uncaughtException', (err) => {
  console.error('[Uncaught Exception] thrown:', err);
});
