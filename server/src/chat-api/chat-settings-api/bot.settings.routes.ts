import { Router } from 'express';
import * as ctrl from './bot.settings.controller';
import { authenticateJWT } from '../../auth/auth.middleware';

const router = Router();

router.post('/chat-setting', authenticateJWT, ctrl.createChatSetting);
router.get('/chat-setting/:botId', authenticateJWT, ctrl.getChatSetting);
router.patch('/chat-setting/:botId', authenticateJWT, ctrl.updateChatSetting);
router.delete('/chat-setting/:botId', authenticateJWT, ctrl.deleteChatSetting);

export default router;
