import React, { useState } from "react";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { SSEClientTransport } from "@modelcontextprotocol/sdk/client/sse.js";
import { TextField, Button, Paper, Typography, Box } from "@mui/material";

export default function MCPClient() {
  const [url, setUrl] = useState("http://localhost:3001/sse");
  const [inputUrl, setInputUrl] = useState(url);
  const [status, setStatus] = useState<"idle" | "connecting" | "connected" | "error">("idle");
  const [error, setError] = useState<string | null>(null);
  const [tools, setTools] = useState<any[]>([]);
  const [consoleLines, setConsoleLines] = useState<string[]>([]);

  // Connect and fetch tools
  const connectToMCP = async () => {
    setStatus("connecting");
    setError(null);
    setConsoleLines([]);
    setTools([]);
    try {
      setConsoleLines(lines => [...lines, `Connecting to MCP server at ${inputUrl}...`]);
      const mcpClient = new Client({
        name: "example-client",
        version: "1.0.0",
      });
      await mcpClient.connect(new SSEClientTransport(new URL(inputUrl)));
      setStatus("connected");
      setConsoleLines(lines => [...lines, "✅ Connection established."]);
      setConsoleLines(lines => [...lines, "Fetching registered tools..."]);
      const toolList = (await mcpClient.listTools()).tools;
      setTools(toolList);
      setConsoleLines(lines => [
        ...lines,
        `Found ${toolList.length} tool(s):`,
        ...toolList.map(
          t => `• ${t.name}: ${t.description || "No description"}`
        ),
      ]);
    } catch (err: any) {
      setStatus("error");
      setError(err.message || String(err));
      setConsoleLines(lines => [...lines, `❌ Error: ${err.message || String(err)}`]);
    }
  };

  // Only connect when user clicks the button
  const handleConnect = (e: React.FormEvent) => {
    e.preventDefault();
    setUrl(inputUrl);
    connectToMCP();
  };

  return (
    <div className="container py-4">
      <div className="row mb-4">
        <div className="col-12 col-md-8">
          <form onSubmit={handleConnect} className="d-flex align-items-center gap-2">
            <TextField
              label="MCP SSE URL"
              variant="outlined"
              size="small"
              value={inputUrl}
              onChange={e => setInputUrl(e.target.value)}
              fullWidth
            />
            <Button
              type="submit"
              variant="contained"
              color="primary"
              disabled={status === "connecting"}
            >
              {status === "connecting" ? "Connecting..." : "Connect"}
            </Button>
          </form>
        </div>
      </div>
      <div className="row">
        {/* Console Output */}
        <div className="col-12 col-md-8 mb-3">
          <Paper variant="outlined" sx={{ background: "#181818", color: "#b9f" }}>
            <Box p={2} style={{ minHeight: 200, fontFamily: "monospace", fontSize: 15 }}>
              {consoleLines.length === 0
                ? <span style={{ color: "#888" }}>Console output will appear here...</span>
                : consoleLines.map((line, idx) => (
                  <div key={idx}>{line}</div>
                ))}
            </Box>
          </Paper>
        </div>
        {/* Tool List */}
        <div className="col-12 col-md-4">
          <Paper variant="outlined" sx={{ background: "#222", color: "#fff" }}>
            <Box p={2}>
              <Typography variant="h6" gutterBottom>
                Registered Tools
              </Typography>
              {tools.length === 0 ? (
                <Typography variant="body2" color="text.secondary">
                  No tools found.
                </Typography>
              ) : (
                <ul style={{ paddingLeft: 18 }}>
                  {tools.map((tool, idx) => (
                    <li key={tool.name || idx}>
                      <b>{tool.name}</b>
                      <div style={{ fontSize: 13, color: "#aaa" }}>
                        {tool.description || "No description"}
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </Box>
          </Paper>
        </div>
      </div>
      {error && (
        <div className="row mt-3">
          <div className="col-12">
            <Paper variant="outlined" sx={{ background: "#330000", color: "#fff" }}>
              <Box p={2}>
                <Typography color="error" variant="body2">
                  {error}
                </Typography>
              </Box>
            </Paper>
          </div>
        </div>
      )}
    </div>
  );
}


// import { Client } from "@modelcontextprotocol/sdk/client/index.js";
// import { SSEClientTransport } from "@modelcontextprotocol/sdk/client/sse.js";
// import { useEffect } from "react";

// export default function MCPClient() {
//   const mcpClient = new Client({
//     name: "example-client",
//     version: "1.0.0",
//   });

//   useEffect(() => {
//     console.log("Connecting to MCP server...");
//     mcpClient.connect(new SSEClientTransport(new URL("http://localhost:3001/sse")))
//       .then(async () => {
//         console.log("Connected to mcp server");
//         const tools = (await mcpClient.listTools()).tools.map(tool => {
//           console.log("Tool: ", tool.name, tool.description, tool.inputSchema);
//           return tool;
//         });

//         console.log(tools, 'tools')
//         // Example: Call the first tool with dummy arguments based on its schema
//         if (tools.length > 0) {
//           try {
//             const result = await mcpClient.callTool({
//               name: "addTwoNumbers",
//               arguments: { a: 5, b: 7 }
//             });
//             console.log("Tool call result:", result);
//           } catch (err) {
//             console.error("Tool call error:", err);
//           }
//         }
//       })
//       .catch(err => {
//         console.error("Failed to connect to MCP server:", err);
//       });
//   }, []);

//   return <>Hello SSE</>;
// }
