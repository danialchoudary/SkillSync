import express from 'express';
import { authMiddleware } from '../middleware/authMiddleware.js';
import {
  getAgentStatus,
  updateAgentPreferences,
  triggerAgentRun,
  approveDraft,
  rejectDraft,
} from '../controllers/agentController.js';

const router = express.Router();

// All agent routes require authentication
router.use(authMiddleware);

router.get('/status', getAgentStatus);
router.patch('/preferences', updateAgentPreferences);
router.post('/run', triggerAgentRun);
router.post('/drafts/:draftId/approve', approveDraft);
router.post('/drafts/:draftId/reject', rejectDraft);

export default router;
