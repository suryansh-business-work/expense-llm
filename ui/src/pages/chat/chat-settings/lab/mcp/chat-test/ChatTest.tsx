import React, { useState, useRef, useEffect } from "react";
import {
  TextField, Button, Paper, Box, Typography, CircularProgress, Alert,
  Divider, IconButton, Tooltip, MenuItem, Select, FormControl, InputLabel
} from "@mui/material";
import SendIcon from "@mui/icons-material/Send";
import RestartAltIcon from "@mui/icons-material/RestartAlt";
import axios from "axios";
import { CHAT_GPT_KEY } from "../../../../../../utils/config";

const OPENAI_API_KEY = `${CHAT_GPT_KEY}`; // Replace with your key

const LLM_MODELS: Record<string, string[]> = {
  "chatgpt": ["gpt-3.5-turbo", "gpt-4"]
};

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

  // LLM/model selection state
  const [llm, setLlm] = useState<"chatgpt">("chatgpt");
  const [model, setModel] = useState<string>(LLM_MODELS["chatgpt"][0]);

  // Update model when LLM changes
  useEffect(() => {
    setModel(LLM_MODELS[llm][0]);
  }, [llm]);

  // Clear chat history if tools array becomes empty
  useEffect(() => {
    if (!tools || tools.length === 0) {
      setMessages([]);
      setThinking([]);
      setError(null);
      setPendingTool(null);
    }
  }, [tools]);

  // Clear chat history if model changes
  useEffect(() => {
    setMessages([]);
    setThinking([]);
    setError(null);
    setPendingTool(null);
  }, [model]);

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
        model,
        messages: [
          { role: 'system', content: sysPrompt },
        ],
        max_tokens: 1000,
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
      console.log("Extracted args:", args);
      const requiredParams = Object.keys(pendingTool.inputSchema?.properties || {});
      const missing = requiredParams.filter(k => !args || args[k] === undefined || args[k] === "");
      console.log("Missing params:", missing);
      console.log("pendingTool.inputSchema?.properties:", pendingTool.inputSchema?.properties);
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
      setError("Connect to Event Source to enable chat test tool.");
      setMessages(msgs => [
        ...msgs,
        { role: "assistant", content: "Connect to Event Source to enable chat test tool." }
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
          model,
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
    console.log("Matched tool:", matchedTool);
    if (matchedTool && mcpClient && typeof mcpClient.callTool === "function") {
      setThinking(th => [...th, `Extracting arguments for "${matchedTool.name}"...`]);
      const args = await extractArgsWithChatGPT(matchedTool, prompt);
      console.log("Extracted args:", args);
      const requiredParams = Object.keys(matchedTool.inputSchema?.properties || {});
      const missing = requiredParams.filter(k => !args || args[k] === undefined || args[k] === "");
      console.log("Missing params:", missing);
      console.log("matchedTool.inputSchema?.properties:", matchedTool.inputSchema?.properties);
      
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
            model,
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
        <Typography variant="h6" gutterBottom>Chat Test</Typography>
        <Box sx={{ minHeight: 200, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Alert severity="info" sx={{ width: "100%", textAlign: "center" }}>
            Connect to Event Source to enable chat test tool.
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
      {/* LLM and Model selection */}
      <Box display="flex" gap={2} mb={2}>
        <FormControl size="small" sx={{ minWidth: 120 }}>
          <InputLabel id="llm-select-label">LLM</InputLabel>
          <Select
            labelId="llm-select-label"
            value={llm}
            label="LLM"
            onChange={e => setLlm(e.target.value as "chatgpt")}
          >
            <MenuItem value="chatgpt">ChatGPT</MenuItem>
          </Select>
        </FormControl>
        <FormControl size="small" sx={{ minWidth: 160 }}>
          <InputLabel id="model-select-label">Model</InputLabel>
          <Select
            labelId="model-select-label"
            value={model}
            label="Model"
            onChange={e => setModel(e.target.value)}
          >
            {LLM_MODELS[llm].map(m => (
              <MenuItem key={m} value={m}>{m}</MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>
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
          onKeyDown={e => {
            if (e.key === "Enter" && !loading && prompt.trim()) {
              e.preventDefault();
              handleSend();
            }
          }}
          fullWidth
          placeholder="Type your prompt..."
          disabled={loading}
          autoFocus
          type="text"
          multiline={false}
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
