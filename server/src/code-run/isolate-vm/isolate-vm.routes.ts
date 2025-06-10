import express from 'express';
import { executeTool } from './isolate-vm.controller';


const router = express.Router();

// Register new tool
// router.post('/:serverId/register/tool/:toolId', registerTool);

// Call dynamic tool
router.post('/:serverId/execute/tool/:toolId', executeTool);

export default router;
