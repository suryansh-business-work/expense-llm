import Joi from 'joi';
import { ContainerConfig } from '../models/container.model';

const containerConfigSchema = Joi.object({
  name: Joi.string().pattern(/^[a-zA-Z0-9_-]+$/).min(3).max(63),
  baseImage: Joi.string().required(),
  ports: Joi.array().items(Joi.string().pattern(/^\d+(?::\d+)?(?:\/(?:tcp|udp))?$/)),
  env: Joi.object().pattern(
    Joi.string(),
    Joi.string()
  ),
  volumes: Joi.array().items(Joi.string().pattern(/^[^:]+:.+$/)),
  memory: Joi.string().pattern(/^\d+[bkmgBKMG]?$/),
  cpu: Joi.number().min(0.1).max(16),
  dependencies: Joi.array().items(
    Joi.string().pattern(/^[a-zA-Z0-9_-]+(?::[a-zA-Z0-9_.]+)?$/)
  ),
  command: Joi.array().items(Joi.string()),
  restartPolicy: Joi.string().valid('no', 'always', 'on-failure', 'unless-stopped')
});

export function validateContainerConfig(config: ContainerConfig) {
  return containerConfigSchema.validate(config, { abortEarly: false });
}