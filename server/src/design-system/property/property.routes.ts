import { Router } from "express";
import * as propertyCtrl from "./property.controllers";

const router = Router();

router.post("/", propertyCtrl.createProperty);
router.get("/:themeId", propertyCtrl.getProperties);
router.get("/detail/:propertyId", propertyCtrl.getProperty);
router.patch("/:propertyId", propertyCtrl.updateProperty);
router.delete("/:propertyId", propertyCtrl.deleteProperty);
router.post("/:propertyId/values", propertyCtrl.addPropertyValues);
router.delete("/:propertyId/values", propertyCtrl.removePropertyValue);

export default router;