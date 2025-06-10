import { Router } from "express";
import * as ctrl from "./tool-code.controllers";
import { authenticateJWT } from "../../auth/auth.middleware";

const router = Router();

router.post("/save", authenticateJWT, ctrl.createTool);
router.get("/get/:toolId", authenticateJWT, ctrl.getTool);
router.delete("/delete/:toolId", authenticateJWT, ctrl.deleteTool);

export default router;
