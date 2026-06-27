import 'dotenv/config';
import http from 'http';
import app from './app.js';
import { initSocket } from './socket/index.js';
import { validateEnv } from './utils/validateEnv.js';
import { connectMongo } from './utils/mongoConnection.js';
import { runAgentSweep } from './services/agentService.js';

const PORT = process.env.PORT || 5000;
const AGENT_SWEEP_INTERVAL_MS = Number(process.env.AGENT_SWEEP_INTERVAL_MS || 60 * 60 * 1000);
const RUN_AGENT_SWEEP_ON_START = process.env.AGENT_RUN_ON_START !== 'false';

// Create HTTP server and attach Socket.IO
const httpServer = http.createServer(app);
initSocket(httpServer);

validateEnv();

connectMongo()
  .then(() => {
    httpServer.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });

    if (RUN_AGENT_SWEEP_ON_START) {
      void runAgentSweep().catch((err) => {
        console.error('[AgentSweep] Initial sweep failed:', err);
      });
    }

    if (Number.isFinite(AGENT_SWEEP_INTERVAL_MS) && AGENT_SWEEP_INTERVAL_MS > 0) {
      setInterval(() => {
        void runAgentSweep().catch((err) => {
          console.error('[AgentSweep] Scheduled sweep failed:', err);
        });
      }, AGENT_SWEEP_INTERVAL_MS);
    }
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
