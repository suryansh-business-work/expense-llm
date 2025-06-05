import { Router } from 'express';
import * as ctrl from './bots.controllers';
import { authenticateJWT } from '../auth/auth.middleware';

const router = Router();

router.post('/create/bot', authenticateJWT, ctrl.createBot);
router.patch('/update/bot/:id', authenticateJWT, ctrl.updateBot);
router.delete('/delete/bot/:id', authenticateJWT, ctrl.deleteBot);
router.post('/bots', authenticateJWT, ctrl.listBotsByCategory);
router.get('/bot-info/:id', authenticateJWT, ctrl.getBotById);

export default router;
