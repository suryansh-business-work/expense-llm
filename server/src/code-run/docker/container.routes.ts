import express from "express";
import {
  listContainers,
  createContainer,
  startContainer,
  stopContainer,
  restartContainer,
  deleteContainer,
  renameContainer,
  inspectContainer,
} from "../docker/container.controller.js";

const router = express.Router();

router.get("/", listContainers);
router.post("/", createContainer);
router.post("/:id/start", startContainer);
router.post("/:id/stop", stopContainer);
router.post("/:id/restart", restartContainer);
router.delete("/:id", deleteContainer);
router.patch("/:id/rename", renameContainer);
router.get("/:id", inspectContainer);

export default router;
