import { Request, Response } from 'express';
import ivm from 'isolated-vm';

type ServerRegistry = Record<
  string,
  {
    isolate: ivm.Isolate;
    context: ivm.Context;
    tools: Map<string, ivm.Reference<Function>>;
  }
>;

const servers: ServerRegistry = {};

function wrapCodeIfNeeded(code: string) {
  // Quick check if code looks like a function already
  const trimmed = code.trim();

  // If it starts with '(', 'function', or 'async' treat as function expression
  if (
    trimmed.startsWith('(') ||
    trimmed.startsWith('function') ||
    trimmed.startsWith('async')
  ) {
    return code;
  }

  // Otherwise, wrap code into an arrow function with input param
  return `(input) => { ${code} }`;
}

export const registerTool = async (req: Request, res: any) => {
  const { serverId } = req.params;
  let { toolName, code } = req.body;

  if (typeof code !== 'string' || typeof toolName !== 'string') {
    return res.status(400).json({ error: 'Invalid toolName or code' });
  }

  // Auto-wrap code if needed
  code = wrapCodeIfNeeded(code);

  // Initialize isolate per server if not exists
  if (!servers[serverId]) {
    const isolate = new ivm.Isolate({ memoryLimit: 128 });
    const context = await isolate.createContext();
    const jail = context.global;
    await jail.set('global', jail.derefInto());

    servers[serverId] = {
      isolate,
      context,
      tools: new Map(),
    };
  }

  const { isolate, context, tools } = servers[serverId];

  try {
    // Set code as a global function named registeredTool
    const wrappedCode = `global.registeredTool = ${code};`;
    console.log('Wrapped code:', wrappedCode);

    const script = await isolate.compileScript(wrappedCode);
    await script.run(context, { timeout: 1000 });

    const toolRef = await context.global.get('registeredTool');
    console.log('Tool type:', typeof toolRef);

    if (typeof toolRef !== 'function') {
      return res.status(400).json({ 
        error: 'Provided code did not return a function', 
        codeType: typeof toolRef,
        wrappedCode: wrappedCode
      });
    }

    tools.set(toolName, toolRef);
    res.json({ message: `Tool '${toolName}' registered for server '${serverId}'` });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

export const executeTool = async (req: Request, res: any) => {
  const { serverId, toolName } = req.params;
  const server = servers[serverId];

  if (!server || !server.tools.has(toolName)) {
    return res.status(404).json({ error: 'Tool not found' });
  }

  try {
    const { tools } = server;
    const toolFn = tools.get(toolName)!;

    // Prepare isolated input copy
    const inputCopy = new ivm.ExternalCopy(req.body);

    // Run tool function inside isolate with input
    const result = await toolFn.apply(undefined, [inputCopy.copyInto()], { timeout: 1000 });

    res.json({ result });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};
