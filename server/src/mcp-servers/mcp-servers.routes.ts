import { Router } from "express";
import * as ctrl from "./mcp-servers.controllers";
import { authenticateJWT } from "../auth/auth.middleware";

const router = Router();

router.post("/create", authenticateJWT, ctrl.createMcpServer);
router.get("/list", authenticateJWT, ctrl.listMcpServersByUser);
router.delete("/delete/:id", authenticateJWT, ctrl.deleteMcpServer);
router.patch("/update/:id", authenticateJWT, ctrl.updateMcpServer);
router.get("/get/:id", ctrl.getMcpServerDetails);


router.post("/details", authenticateJWT, ctrl.createMcpServerDetails);
router.patch("/details/:id", authenticateJWT, ctrl.updateMcpServerDetails);
router.post("/pricing", authenticateJWT, ctrl.createMcpServerPricing);
router.patch("/pricing/:id", authenticateJWT, ctrl.updateMcpServerPricing);

export default router;
