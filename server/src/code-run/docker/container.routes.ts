import express from "express";
import {
  listContainers,
  createContainer,
  startContainer,
  stopContainer,
  restartContainer,
  deleteContainer,
  renameContainer,
  inspectContainer
} from "./container.controller";

const router = express.Router();

router.get("/docker/containers", listContainers);
router.post("/docker/container/create", createContainer);
router.post("/docker/container/:id/start", startContainer);
router.post("/docker/container/:id/stop", stopContainer);
router.post("/docker/container/:id/restart", restartContainer);
router.delete("/docker/container/:id", deleteContainer);
router.patch("/docker/container/:id/rename", renameContainer);
router.get("/docker/container/:id", inspectContainer);

export default router;
