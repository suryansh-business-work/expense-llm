import { Request, Response } from "express";
import Docker from "dockerode";

export interface RenameContainerRequest {
  newName: string;
}

const docker = new Docker();

export async function listContainers(req: Request, res: Response) {
  try {
    const containers = await docker.listContainers({ all: true });
    res.json(containers);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
}

export async function createContainer(req: Request, res: Response) {
  try {
    const config = req.body;
    const container = await docker.createContainer(config);
    await container.start();
    res.json({ id: container.id });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
}

export async function startContainer(req: Request, res: Response) {
  try {
    const container = docker.getContainer(req.params.id);
    await container.start();
    res.json({ started: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
}

export async function stopContainer(req: Request, res: Response) {
  try {
    const container = docker.getContainer(req.params.id);
    await container.stop();
    res.json({ stopped: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
}

export async function restartContainer(req: Request, res: Response) {
  try {
    const container = docker.getContainer(req.params.id);
    await container.restart();
    res.json({ restarted: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
}

export async function deleteContainer(req: Request, res: Response) {
  try {
    const container = docker.getContainer(req.params.id);
    await container.remove({ force: true });
    res.json({ deleted: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
}

export async function renameContainer(
  req: Request<{ id: string }, {}, RenameContainerRequest>,
  res: Response
) {
  try {
    const container = docker.getContainer(req.params.id);
    await container.rename({ name: req.body.newName });
    res.json({ renamed: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
}

export async function inspectContainer(req: Request, res: Response) {
  try {
    const container = docker.getContainer(req.params.id);
    const info = await container.inspect();
    res.json(info);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
}
