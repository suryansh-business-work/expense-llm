import express from "express";
import { SSEServerTransport } from "@modelcontextprotocol/sdk/server/sse.js";
import { setupMcpServer, storeTransport, removeTransport, getTransport } from "../managers/mcp-server.js";
import { optionalAuthMiddleware } from "../middleware/auth.js";

const router = express.Router();

/**
 * Route with serverId parameter for SSE connection
 */
router.get("/:serverId/mcp/sse", optionalAuthMiddleware, async (req, res) => {
  const { serverId } = req.params;
  const token = req.token;

  if (!serverId) {
    return res.status(400).send('Missing serverId parameter');
  }

  // Set up the MCP server for this serverId - force refresh!
  try {
    // Always force refresh on SSE connection to get latest data
    const mcpServer = await setupMcpServer(serverId, token, true);

    // Create transport for this connection
    const transport = new SSEServerTransport(`/${serverId}/messages`, res);
    const transportKey = storeTransport(serverId, transport);
    
    res.on("close", () => {
      removeTransport(transportKey);
    });

    await mcpServer.connect(transport);
  } catch (error) {
    console.error(`Error setting up SSE for server ${serverId}:`, error);
    res.status(500).send('Failed to set up SSE connection');
  }
});

/**
 * Route with serverId parameter for handling messages
 */
router.post("/:serverId/messages", optionalAuthMiddleware, async (req, res) => {
  const { serverId } = req.params;
  const { sessionId } = req.query;
  
  if (!serverId || !sessionId) {
    return res.status(400).send('Missing serverId or sessionId parameter');
  }

  const transportData = getTransport(serverId, sessionId);

  if (transportData && transportData.transport) {
    try {
      await transportData.transport.handlePostMessage(req, res, req.body);
    } catch (error) {
      console.error(`Error handling post message for server ${serverId}:`, error);
      res.status(500).send('Error processing message');
    }
  } else {
    res.status(400).send(`No transport found for serverId: ${serverId}, sessionId: ${sessionId}`);
  }
});

export default router;
