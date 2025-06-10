import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { fetchServerDetails, fetchToolListings, executeTool } from "../services/api.js";
import { buildZodSchema } from "../utils/schema.js";

// Store servers by serverId
const servers = {};
const transports = {};

/**
 * Initialize the MCP server for a specific server ID
 * @param {string} serverId - Server ID
 * @param {string} token - Authentication token
 * @param {boolean} forceRefresh - Whether to force refresh of server data
 * @returns {Promise<Object>} MCP server instance
 */
export async function setupMcpServer(serverId, token, forceRefresh = false) {
  try {
    // Check if server is already initialized and refresh is not forced
    if (servers[serverId] && !forceRefresh) {
      return servers[serverId];
    }

    // Fetch server details first
    const serverResponse = await fetchServerDetails(serverId, token);
    const tools = await fetchToolListings(serverId, token);
    const serverDetails = serverResponse.data;

    // If a server instance already exists, update it rather than creating a new one
    let mcpServer;
    if (servers[serverId] && forceRefresh) {
      mcpServer = servers[serverId];
      // console.log(`Refreshing server ${serverId} with latest data`);
    } else {
      mcpServer = new McpServer({
        name: serverDetails.mcpServerName || "Default Server Name",
        version: "1.0.0"
      });
    }

    const toolsData = tools?.data;

    if (toolsData && Array.isArray(toolsData)) {
      // Clear existing tools if this is a refresh
      if (forceRefresh) {
        // There's no direct way to clear tools in McpServer,
        // so we're replacing the entire instance
        mcpServer = new McpServer({
          name: serverDetails.mcpServerName || "Default Server Name",
          version: "1.0.0"
        });
      }

      toolsData.forEach(tool => {
        const schema = buildZodSchema(tool.toolParams);
        mcpServer.tool(
          tool?.toolName || "Default Tool Name",
          tool?.toolDescription || "No description provided",
          schema,
          async (arg) => {
            try {
              // Always use current token for execution
              const result = await executeTool(serverId, tool.toolId, arg, token);
              
              let parsedResult = result;
              if (typeof result === 'object') {
                parsedResult = result.result || JSON.stringify(result);
              }
              
              return {
                content: [
                  {
                    type: "text",
                    text: parsedResult
                  }
                ]
              };
            } catch (error) {
              console.error("Tool execution error:", error);
              return {
                content: [
                  {
                    type: "text",
                    text: `Error executing tool: ${error.message}`
                  }
                ]
              };
            }
          }
        );
      });
    }

    // Cache server instance
    servers[serverId] = mcpServer;

    return mcpServer;
  } catch (error) {
    console.error(`Failed to set up MCP server for ${serverId}:`, error);

    // Fall back to a default server if API fails
    const defaultServer = new McpServer({
      name: `Default Server for ${serverId}`,
      version: "1.0.0"
    });

    // Cache the default server
    servers[serverId] = defaultServer;

    return defaultServer;
  }
}

/**
 * Store a transport for a specific server ID and session ID
 * @param {string} serverId - Server ID
 * @param {Object} transport - Transport instance
 * @returns {string} Transport key
 */
export function storeTransport(serverId, transport) {
  const transportKey = `${serverId}:${transport.sessionId}`;
  transports[transportKey] = {
    transport,
    serverId
  };
  return transportKey;
}

/**
 * Remove a transport by key
 * @param {string} transportKey - Transport key
 */
export function removeTransport(transportKey) {
  delete transports[transportKey];
}

/**
 * Get a transport by server ID and session ID
 * @param {string} serverId - Server ID
 * @param {string} sessionId - Session ID
 * @returns {Object|null} Transport or null if not found
 */
export function getTransport(serverId, sessionId) {
  const transportKey = `${serverId}:${sessionId}`;
  return transports[transportKey];
}
