import { z } from "zod";

/**
 * Build Zod schema from tool parameters
 * @param {Array} toolParams - Array of tool parameters
 * @returns {Object} Zod schema object
 */
export function buildZodSchema(toolParams) {
  const schema = {};
  if (!toolParams || !Array.isArray(toolParams)) {
    return schema; // Return empty schema if no parameters
  }
  
  toolParams.forEach(param => {
    const { paramName, paramType } = param;
    if (paramName) {
      switch (paramType?.toLowerCase()) {
        case 'string':
          schema[paramName] = z.string();
          break;
        case 'number':
          schema[paramName] = z.number();
          break;
        case 'boolean':
          schema[paramName] = z.boolean();
          break;
        case 'date':
          schema[paramName] = z.string().datetime();
          break;
        case 'array':
          schema[paramName] = z.array(z.any());
          break;
        case 'object':
          schema[paramName] = z.record(z.any());
          break;
        default:
          // Default to any for unknown types
          schema[paramName] = z.any();
      }
    }
  });

  return schema;
}