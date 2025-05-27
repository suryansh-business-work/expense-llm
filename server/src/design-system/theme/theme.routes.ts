import { Router } from "express";
import * as themeCtrl from "./theme.controller";

const router = Router();

router.post("/create", themeCtrl.createTheme);
router.get("/get", themeCtrl.getThemes);
router.get("/get/:themeId", themeCtrl.getTheme);
router.patch("/update/:themeId", themeCtrl.updateTheme);
router.delete("/delete/:themeId", themeCtrl.deleteTheme);

export { router as themeRoutes };
