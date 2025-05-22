import { Router } from "express";
import * as ctrl from "./subscription-usage.controllers";

const router = Router();

router.post("/", ctrl.createUsage);
router.get("/user/:botOwnerUserId", ctrl.getUsageByUser);
router.get("/bot/:botId", ctrl.getUsageByBot);
router.get("/user/:botOwnerUserId/date-range", ctrl.getUsageByDateRange);

export default router;
