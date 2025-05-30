import React, { useState, useRef, useEffect } from "react";
import {
  TextField, Button, Paper, Box, Typography, CircularProgress, Alert,
  Divider, IconButton, Tooltip
} from "@mui/material";
import SendIcon from "@mui/icons-material/Send";
import RestartAltIcon from "@mui/icons-material/RestartAlt";
import axios from "axios";

const OPENAI_API_KEY = ""; // Replace with your key

interface ChatTestProps {
  tools: any[];
  mcpClient?: any;
}

const ChatTest: React.FC<ChatTestProps> = ({ tools, mcpClient }) => {
  const [prompt, setPrompt] = useState("");
  const [messages, setMessages] = useState<{ role: string, content: string }[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [thinking, setThinking] = useState<string[]>([]);
  const [pendingTool, setPendingTool] = useState<any>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom on new message
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  // Helper: Ask ChatGPT to extract arguments for a tool from a prompt
  async function extractArgsWithChatGPT(tool: any, prompt: string) {
    const paramList = Object.entries(tool.inputSchema?.properties || {})
      .map(([key, val]: [string, any]) => `${key}: ${val.type}`)
      .join(", ");
    const sysPrompt = `You are a function argument extractor. Given a user prompt and a tool definition, extract the arguments as a JSON object. 
      Tool: ${tool.name}
      Description: ${tool.description}
      Parameters: ${paramList}
      User prompt: "${prompt}"
      Return only a JSON object with the arguments.`;

    const res = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: 'gpt-4',
        messages: [
          { role: 'system', content: sysPrompt },
        ],
        max_tokens: 100,
        temperature: 0,
      },
      {
        headers: {
          'Authorization': `Bearer ${OPENAI_API_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );
    const content = res.data.choices[0].message.content;
    try {
      const jsonMatch = content.match(/```json\s*([\s\S]*?)```/i);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[1]);
      }
      return JSON.parse(content);
    } catch {
      return null;
    }
  }

  const handleSend = async () => {
    if (!prompt.trim()) return;
    setLoading(true);
    setError(null);
    setThinking([]);
    setMessages(msgs => [...msgs, { role: "user", content: prompt }]);

    // If waiting for missing arguments from user
    if (pendingTool) {
      setThinking(th => [...th, `Trying to extract arguments for "${pendingTool.name}" from your reply...`]);
      const args = await extractArgsWithChatGPT(pendingTool, prompt);
      const requiredParams = Object.keys(pendingTool.inputSchema?.properties || {});
      const missing = requiredParams.filter(k => !args || args[k] === undefined || args[k] === "");
      if (missing.length === 0) {
        // All arguments present, call tool
        try {
          const result = await mcpClient.callTool({
            name: pendingTool.name,
            arguments: args
          });
          setThinking(th => [...th, "Tool called successfully."]);
          setMessages(msgs => [
            ...msgs,
            { role: "tool", content: result?.content?.[0]?.text || JSON.stringify(result) }
          ]);
          setPendingTool(null);
        } catch (err: any) {
          setThinking(th => [...th, "❌ MCP tool error: " + (err.message || String(err))]);
          setError("MCP tool error: " + (err.message || String(err)));
          setMessages(msgs => [
            ...msgs,
            { role: "tool", content: "MCP tool error: " + (err.message || String(err)) }
          ]);
        }
      } else {
        // Still missing arguments, ask again
        setThinking(th => [...th, `Still missing arguments: ${missing.join(", ")}. Asking user...`]);
        setMessages(msgs => [
          ...msgs,
          { role: "assistant", content: `Please provide the following information: ${missing.join(", ")}` }
        ]);
        setPendingTool(pendingTool);
      }
      setPrompt('');
      setLoading(false);
      return;
    }

    // Normal flow: tool selection
    if (!tools || tools.length === 0) {
      setThinking([]);
      setError("Connect to Event Source to view tools.");
      setMessages(msgs => [
        ...msgs,
        { role: "assistant", content: "Connect to Event Source to view tools." }
      ]);
      setLoading(false);
      setPrompt('');
      return;
    }

    setThinking(th => [...th, "Asking ChatGPT to select the best tool..."]);
    const toolNames = tools.map(t => t.name).join(", ");
    const toolSelectPrompt = `
You are an AI assistant. Given the following user prompt and available tools, reply ONLY with the best tool name to use (or "none" if no tool is suitable).
Available tools: ${toolNames}
User prompt: "${prompt}"
Reply with only the tool name or "none".
    `;

    let selectedToolName = "none";
    try {
      const res = await axios.post(
        'https://api.openai.com/v1/chat/completions',
        {
          model: 'gpt-4',
          messages: [
            { role: 'system', content: toolSelectPrompt }
          ],
          max_tokens: 20,
          temperature: 0,
        },
        {
          headers: {
            'Authorization': `Bearer ${OPENAI_API_KEY}`,
            'Content-Type': 'application/json',
          },
        }
      );
      selectedToolName = res.data.choices[0].message.content.trim().replace(/["'.]/g, "");
      setThinking(th => [...th, `ChatGPT selected tool: ${selectedToolName}`]);
    } catch (err: any) {
      setThinking(th => [...th, "❌ Failed to select tool with ChatGPT."]);
      selectedToolName = "none";
    }

    const matchedTool = tools.find(t => t.name.toLowerCase() === selectedToolName.toLowerCase());
    if (matchedTool && mcpClient && typeof mcpClient.callTool === "function") {
      setThinking(th => [...th, `Extracting arguments for "${matchedTool.name}"...`]);
      const args = await extractArgsWithChatGPT(matchedTool, prompt);
      const requiredParams = Object.keys(matchedTool.inputSchema?.properties || {});
      const missing = requiredParams.filter(k => !args || args[k] === undefined || args[k] === "");
      if (missing.length === 0) {
        // All arguments present, call tool
        try {
          const result = await mcpClient.callTool({
            name: matchedTool.name,
            arguments: args
          });
          setThinking(th => [...th, "Tool called successfully."]);
          setMessages(msgs => [
            ...msgs,
            { role: "tool", content: result?.content?.[0]?.text || JSON.stringify(result) }
          ]);
        } catch (err: any) {
          setThinking(th => [...th, "❌ MCP tool error: " + (err.message || String(err))]);
          setError("MCP tool error: " + (err.message || String(err)));
          setMessages(msgs => [
            ...msgs,
            { role: "tool", content: "MCP tool error: " + (err.message || String(err)) }
          ]);
        }
      } else {
        // Missing arguments, ask user
        setThinking(th => [...th, `Missing arguments: ${missing.join(", ")}. Asking user...`]);
        setMessages(msgs => [
          ...msgs,
          { role: "assistant", content: `Please provide the following information: ${missing.join(", ")}` }
        ]);
        setPendingTool(matchedTool);
      }
    } else {
      // No tool, fallback to ChatGPT
      setThinking(th => [...th, "No relevant tool found. Asking ChatGPT..."]);
      try {
        const res = await axios.post(
          'https://api.openai.com/v1/chat/completions',
          {
            model: 'gpt-4',
            messages: [
              { role: 'system', content: 'You are a helpful assistant.' },
              { role: 'user', content: prompt }
            ],
          },
          {
            headers: {
              'Authorization': `Bearer ${OPENAI_API_KEY}`,
              'Content-Type': 'application/json',
            },
          }
        );
        setThinking(th => [...th, "ChatGPT responded."]);
        const gptResponse = res.data.choices[0].message.content;
        setMessages(msgs => [
          ...msgs,
          { role: "assistant", content: gptResponse }
        ]);
      } catch (err: any) {
        setThinking(th => [...th, "❌ ChatGPT error: " + (err.message || String(err))]);
        setError("ChatGPT error: " + (err.message || String(err)));
        setMessages(msgs => [
          ...msgs,
          { role: "assistant", content: "ChatGPT error: " + (err.message || String(err)) }
        ]);
      }
    }
    setPrompt('');
    setLoading(false);
  };

  const handleReset = () => {
    setMessages([]);
    setPrompt('');
    setError(null);
    setThinking([]);
  };

  // If tools array is empty, show message and disable chat UI
  if (!tools || tools.length === 0) {
    return (
      <Paper variant="outlined" sx={{ minHeight: 350, p: 2 }}>
        <Typography variant="h6" gutterBottom>Chat</Typography>
        <Box sx={{ minHeight: 200, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Alert severity="info" sx={{ width: "100%", textAlign: "center" }}>
            Connect to Event Source to view tools.
          </Alert>
        </Box>
        <Box mt={2} display="flex" gap={1}>
          <TextField
            value=""
            placeholder="Type your prompt..."
            fullWidth
            disabled
          />
          <Button variant="contained" disabled>
            <SendIcon />
          </Button>
        </Box>
      </Paper>
    );
  }

  return (
    <Paper variant="outlined" sx={{ minHeight: 350, p: 2, background: "#fafbfc" }}>
      <Box display="flex" alignItems="center" justifyContent="space-between" mb={1}>
        <Typography variant="h5" gutterBottom>
          Chat Test{" "}
          <span style={{ fontSize: '12px', color: '#7a7a7a' }}>
            {`Tool available count: ${tools.length}`}
          </span>
        </Typography>
        <Tooltip title="Clear chat">
          <IconButton onClick={handleReset} size="small">
            <RestartAltIcon />
          </IconButton>
        </Tooltip>
      </Box>
      <Divider />
      <Box
        sx={{
          minHeight: 200,
          maxHeight: 320,
          overflowY: "auto",
          background: "#f5f5f5",
          borderRadius: 2,
          p: 2,
          mt: 1,
          mb: 1,
        }}
      >
        {messages.length === 0 && (
          <Typography color="text.secondary" align="center" sx={{ mt: 8 }}>
            Start chatting with ChatGPT or use a tool!
          </Typography>
        )}
        {messages.map((msg, idx) => (
          <div key={idx} style={{
            textAlign: msg.role === "user" ? "right" : "left",
            margin: "8px 0"
          }}>
            <span
              style={{
                background: msg.role === "user" ? "#e0e0e0" : msg.role === "tool" ? "#d1ffd1" : "#f0f0ff",
                padding: "8px 12px",
                borderRadius: 8,
                display: "inline-block",
                maxWidth: "80%",
                wordBreak: "break-word"
              }}
            >
              <b>{msg.role === "user" ? "You" : msg.role === "tool" ? "MCP Tool" : "ChatGPT"}:</b> {msg.content}
            </span>
          </div>
        ))}
        <div ref={chatEndRef} />
        {loading && (
          <Box display="flex" justifyContent="center" mt={2}>
            <CircularProgress size={28} />
          </Box>
        )}
        {error && (
          <Box mt={2}>
            <Alert severity="error">{error}</Alert>
          </Box>
        )}
      </Box>
      <Box mt={2} display="flex" gap={1}>
        <TextField
          value={prompt}
          onChange={e => setPrompt(e.target.value)}
          onKeyDown={e => { if (e.key === "Enter") handleSend(); }}
          fullWidth
          placeholder="Type your prompt..."
          disabled={loading}
          autoFocus
        />
        <Button
          variant="contained"
          onClick={handleSend}
          disabled={loading || !prompt.trim()}
          sx={{ minWidth: 48, minHeight: 48 }}
        >
          <SendIcon />
        </Button>
      </Box>
      <Box sx={{ minHeight: 40, mt: 2 }}>
        <Typography variant="subtitle2" color="text.secondary">AI Thinking Process:</Typography>
        <ul style={{ margin: 0, paddingLeft: 18 }}>
          {thinking.map((step, idx) => (
            <li key={idx} style={{ fontSize: 14 }}>{step}</li>
          ))}
        </ul>
      </Box>
    </Paper>
  );
};

export default ChatTest;