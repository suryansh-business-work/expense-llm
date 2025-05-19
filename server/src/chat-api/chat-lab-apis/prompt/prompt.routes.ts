import { Router } from 'express';
import * as ctrl from './prompt.controllers';
import { authenticateJWT } from '../../../auth/auth.middleware';

const router = Router();

router.patch('/prompt/:chatBotId', authenticateJWT, ctrl.updatePrompt);
router.get('/prompt/:chatBotId', authenticateJWT, ctrl.getPrompt);

export default router;
