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

async function fetchTool(toolId: any) {
  try {
    const response = await fetch(`http://localhost:3000/v1/api/mcp-server/tool-code/get/${toolId}`, {
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI5MjE2NTc2NC1iYTRmLTRhMTctODBmNy1hZjY5ZTZiOTUxMjgiLCJpYXQiOjE3NDk0NjE1OTd9.GQxJLA7qwVua6LFbGrUsuvA2LJ72xkYJc2mlfl7OOMw`
      }
    });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch tool listings: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error("Error fetching tool listings:", error);
    throw error;
  }
}

export const executeTool = async (req: Request, res: any) => {
  const { serverId, toolId } = req.params;
  
  try {
    // Fetch tool code directly
    const tool = await fetchTool(toolId);
    
    if (!tool || !tool.data || !tool.data.toolCode) {     
      return res.status(404).json({ error: `Tool with ID ${toolId} not found` });
    }
    
    const code = tool.data.toolCode;
    console.log('Executing tool code:', code);
    
    // Initialize isolate if not exists
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
    
    const { isolate, context } = servers[serverId];
    
    // Compile and run the code to register the function
    const script = await isolate.compileScript(code);
    await script.run(context);
    
    // Get the registered tool function
    const toolFn = await context.global.get('registeredTool');
    
    if (typeof toolFn !== 'function') {
      return res.status(400).json({ 
        error: 'Tool code did not register a valid function',
        codeType: typeof toolFn
      });
    }
    
    // Prepare isolated input copy
    const inputCopy = new ivm.ExternalCopy(req.body);
    
    // Execute the function with input
    const result = await toolFn.apply(undefined, [inputCopy.copyInto()], { 
      timeout: 5000,  // Increased timeout for long-running tools
      arguments: { result: 'copy' }  // Ensure result is properly copied out
    });
    
    res.json({ result });
  } catch (err: any) {
    console.error('Error executing tool:', err);
    res.status(500).json({ error: err.message });
  }
};
