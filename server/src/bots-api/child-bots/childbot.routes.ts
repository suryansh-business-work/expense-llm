import { Router } from 'express';
import * as ctrl from './childbot.controllers';
import { authenticateJWT } from '../../auth/auth.middleware';

const router = Router();

router.post('/create/child-bot', authenticateJWT, ctrl.createChildBot);
router.patch('/update/child-bot/:id', authenticateJWT, ctrl.updateChildBot);
router.delete('/delete/child-bot/:id', authenticateJWT, ctrl.deleteChildBot);
router.post('/child-bots', authenticateJWT, ctrl.listChildBotsByType);

export default router;
