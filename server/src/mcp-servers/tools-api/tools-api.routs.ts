import { Router } from "express";
import * as ctrl from "./tools-api.controllers";
import { authenticateJWT } from "../../auth/auth.middleware";

const router = Router();

// All routes require authentication
router.post("/create", authenticateJWT, ctrl.createTool);
router.get("/list/:mcpServerId", authenticateJWT, ctrl.listTools);
router.get("/get/:id", authenticateJWT, ctrl.getTool);
router.patch("/update/:id", authenticateJWT, ctrl.updateTool);
router.delete("/delete/:id", authenticateJWT, ctrl.deleteTool);
router.get("/count/:mcpServerId", authenticateJWT, ctrl.getToolCount);

export default router;