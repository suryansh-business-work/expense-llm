import express from "express";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { SSEServerTransport } from "@modelcontextprotocol/sdk/server/sse.js";
import cors from "cors";
import { z } from "zod";

const server = new McpServer({
  name: "example-server",
  version: "1.0.0"
});

// ... set up server resources, tools, and prompts ...

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

server.tool(
  "multiplyTwoNumbers",
  "for multiply two numbers",
  {
    a: z.number(),
    b: z.number()
  },
  async (arg) => {
    const { a, b } = arg;
    return {
      content: [
        {
          type: "text",
          text: `The multiply of ${a} and ${b} is ${a * b}`
        }
      ]
    }
  }
)

server.tool(
  "whoAmI",
  "Who am I?",
  async () => {
    return {
      content: [
        {
          type: "text",
          text: `You are Suryansh, a software engineer and AI enthusiast. You are currently working on the Model Context Protocol (MCP) project, which aims to create a standardized way for AI models to interact with each other and with users.`
        }
      ]
    }
  }
)

// to support multiple simultaneous connections we have a lookup object from
// sessionId to transport
const transports = {};

app.get("/mcp/sse", async (req, res) => {
  const transport = new SSEServerTransport('/messages', res);
  transports[transport.sessionId] = transport;
  res.on("close", () => {
    delete transports[transport.sessionId];
  });
  await server.connect(transport);
});

app.post("/messages", async (req, res) => {
  const sessionId = req.query.sessionId;
  const transport = transports[sessionId];
  if (transport) {
    await transport.handlePostMessage(req, res, req.body); // Pass req.body as third argument
  } else {
    res.status(400).send('No transport found for sessionId');
  }
});

app.listen(3001, () => {
  console.log("Server is running on http://localhost:3001");
});
