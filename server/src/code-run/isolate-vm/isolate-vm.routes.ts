import express from 'express';
import { executeTool, registerTool } from './isolate-vm.controller';


const router = express.Router();

// Register new tool
router.post('/:serverId/register', registerTool);

// Call dynamic tool
router.post('/:serverId/tools/:toolName', executeTool);

export default router;
