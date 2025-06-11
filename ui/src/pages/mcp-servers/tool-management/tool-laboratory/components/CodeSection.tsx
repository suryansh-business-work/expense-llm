import React, { useEffect, useState, useRef } from 'react';
import { useParams } from 'react-router-dom';
import {
  Box, Typography, IconButton, Tooltip, Paper, Snackbar,
  Alert, Button, TextField, Dialog, DialogTitle,
  DialogContent, DialogActions, CircularProgress,
  Chip, InputAdornment, FormControl, InputLabel, Select, MenuItem,
  useTheme, alpha
} from "@mui/material";
import Editor, { Monaco } from "@monaco-editor/react";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import SaveIcon from '@mui/icons-material/Save';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import InfoIcon from '@mui/icons-material/Info';
import CodeIcon from '@mui/icons-material/Code';
import CloseIcon from '@mui/icons-material/Close';
import FullscreenIcon from '@mui/icons-material/Fullscreen';
import FullscreenExitIcon from '@mui/icons-material/FullscreenExit';
import CheckIcon from '@mui/icons-material/Check';
import KeyboardIcon from '@mui/icons-material/Keyboard';
import { motion, AnimatePresence, MotionConfig } from "framer-motion";
import axios from "axios";
import * as monaco from 'monaco-editor';
import { CHAT_GPT_KEY } from "../../../../../utils/config";

const API_BASE = "http://localhost:3000/v1/api/mcp-server/tool-code";
const TOOLS_API_BASE = "http://localhost:3000/v1/api/mcp-server/tool";

// Default code template with placeholder for tool parameters
// const DEFAULT_CODE_TEMPLATE = `/**
//  * Tool implementation using vanilla JavaScript
//  * 
//  * @param {Object} input - The input parameters from the user
//  * @returns {string} - The result to be returned to the user
//  */
// global.registeredTool = (input) => {
//   // Your code here - input parameters are directly available

//   // Make sure to return a string value
//   return "Tool executed successfully";
// };`;

// Helper to get auth headers
const getAuthHeaders = () => {
  const token = localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
};

const CodeSection: React.FC = () => {
  // Get parameters from URL
  const { mcpServerId, toolId } = useParams<{ mcpServerId: string; toolId: string }>();

  // Monaco editor instance ref
  const monacoRef = useRef<Monaco | null>(null);
  const editorRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(null);

  // Local state management
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [toolParams, setToolParams] = useState<any[]>([]);
  const [toolName, setToolName] = useState("");
  const [toolDescription, setToolDescription] = useState("");
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: "success" | "error" | "info" }>({
    open: false,
    message: "",
    severity: "success"
  });

  // AI generation state
  const [promptDialogOpen, setPromptDialogOpen] = useState(false);
  const [promptValue, setPromptValue] = useState("");
  const [generatingCode, setGeneratingCode] = useState(false);
  const [selectedModel, setSelectedModel] = useState("gpt-3.5-turbo");

  // New state for animations
  const [fullscreen, setFullscreen] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [showMetadata, setShowMetadata] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [animationReady, setAnimationReady] = useState(false);
  const [shortcutsOpen, setShortcutsOpen] = useState(false);
  const theme = useTheme();

  // Add this ref to target the element for fullscreen
  const editorContainerRef = useRef<HTMLDivElement>(null);

  // Add these functions to handle fullscreen
  const enterFullscreen = () => {
    const element = editorContainerRef.current;
    if (!element) return;

    const requestMethod = element.requestFullscreen ||
      (element as any).webkitRequestFullscreen ||
      (element as any).mozRequestFullScreen ||
      (element as any).msRequestFullscreen;
      
    if (requestMethod) {
      requestMethod.call(element).catch(err => {
        console.error('Error attempting to enable fullscreen:', err);
      });
    } else {
      setSnackbar({
        open: true,
        message: "Fullscreen API not supported in your browser",
        severity: "error"
      });
    }
  };

  const exitFullscreen = () => {
    const exitMethod = document.exitFullscreen ||
      (document as any).webkitExitFullscreen ||
      (document as any).mozCancelFullScreen ||
      (document as any).msExitFullscreen;
      
    if (exitMethod) {
      exitMethod.call(document).catch(err => {
        console.error('Error attempting to exit fullscreen:', err);
      });
    }
  };

  // Update the fullscreen toggle handler
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      enterFullscreen();
    } else {
      exitFullscreen();
    }
  };

  // Listen for fullscreen changes with vendor prefixes
  useEffect(() => {
    const handleFullscreenChange = () => {
      const fullscreenElement = 
        document.fullscreenElement ||
        (document as any).webkitFullscreenElement ||
        (document as any).mozFullScreenElement ||
        (document as any).msFullscreenElement;
        
      setFullscreen(!!fullscreenElement);
    };
    
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    document.addEventListener('mozfullscreenchange', handleFullscreenChange);
    document.addEventListener('MSFullscreenChange', handleFullscreenChange);
    
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
      document.removeEventListener('mozfullscreenchange', handleFullscreenChange);
      document.removeEventListener('MSFullscreenChange', handleFullscreenChange);
    };
  }, []);

  // Fetch tool details and code from API when component mounts
  useEffect(() => {
    if (!toolId) return;

    const fetchToolDetails = async () => {
      setLoading(true);
      try {
        // Fetch tool details to get parameters
        const toolDetailsRes = await axios.get(`${TOOLS_API_BASE}/get/${toolId}`, {
          headers: getAuthHeaders()
        });

        if (toolDetailsRes.data?.data) {
          const toolData = toolDetailsRes.data.data;
          setToolParams(toolData.toolParams || []);
          setToolName(toolData.toolName || "");
          setToolDescription(toolData.toolDescription || "");
        }

        // Fetch tool code
        const codeRes = await axios.get(`${API_BASE}/get/${toolId}`, {
          headers: getAuthHeaders()
        });

        if (codeRes.data?.data?.toolCode) {
          setCode(codeRes.data.data.toolCode);
        } else {
          // If no code exists, set default template
          setCode(generateDefaultTemplate(toolParams));
        }
      } catch (error) {
        setSnackbar({
          open: true,
          message: "Failed to fetch tool details or code",
          severity: "error"
        });
      } finally {
        setLoading(false);
      }
    };

    fetchToolDetails();
  }, [toolId]);

  // Generate default code template based on tool parameters
  const generateDefaultTemplate = (params: any[]) => {
    const paramComments = params.map(param =>
      ` * @param {${param.paramType || 'any'}} input.${param.paramName} - ${param.paramDescription || 'No description'}`
    ).join('\n');

    const paramDefaults = params.length > 0
      ? `\n  // Access input parameters:\n` +
      params.map(param => {
        const paramName = param.paramName;
        // Handle different types properly in the default template
        switch (param.paramType?.toLowerCase()) {
          case 'string':
            return `  const ${paramName} = input.${paramName} || '';`;
          case 'number':
            return `  const ${paramName} = input.${paramName} || 0;`;
          case 'boolean':
            return `  const ${paramName} = input.${paramName} === true;`;
          default:
            return `  const ${paramName} = input.${paramName};`;
        }
      }).join('\n')
      : '';

    const sampleReturn = params.length > 0
      ? '  return ' +
      params.map(param => `'${param.paramName}: ' + ${param.paramName}`).join(' + \', \' + ')
      : '  return "Tool executed successfully"';

    return `/**
 * ${toolName || 'Tool Implementation'}
 * ${toolDescription ? '\n * ' + toolDescription : ''}
 * 
 * @param {Object} input - The input parameters from the user
${paramComments ? paramComments : ' * No parameters defined for this tool'}
 * @returns {string} - The result to be returned to the user
 */
global.registeredTool = (input) => {${paramDefaults}
  
  // Your implementation goes here
  
${sampleReturn};
};`;
  };

  // Configure editor on mount
  const handleEditorDidMount = (editor: any, monaco: Monaco) => {
    editorRef.current = editor;
    monacoRef.current = monaco;

    // Add JavaScript intellisense
    monaco.languages.typescript.javascriptDefaults.setDiagnosticsOptions({
      noSemanticValidation: false,
      noSyntaxValidation: false
    });

    monaco.languages.typescript.javascriptDefaults.setCompilerOptions({
      target: monaco.languages.typescript.ScriptTarget.ES2020,
      allowNonTsExtensions: true,
      moduleResolution: monaco.languages.typescript.ModuleResolutionKind.NodeJs,
      module: monaco.languages.typescript.ModuleKind.CommonJS,
      noEmit: true,
      esModuleInterop: true,
      jsx: monaco.languages.typescript.JsxEmit.React,
      reactNamespace: "React",
      allowJs: true,
      typeRoots: ["node_modules/@types"]
    });

    // Add custom libraries for better intellisense
    monaco.languages.typescript.javascriptDefaults.addExtraLib(`
      interface Input {
        ${toolParams.map(param => `${param.paramName}?: ${mapParamTypeToTsType(param.paramType)};`).join('\n        ')}
      }
      
      declare namespace global {
        function registeredTool(input: Input): string;
      }
    `, 'ts:filename/global.d.ts');

    // Add API method declarations for common utilities
    monaco.languages.typescript.javascriptDefaults.addExtraLib(`
      declare function fetch(url: string, options?: any): Promise<any>;
      declare function setTimeout(callback: Function, ms: number): number;
      declare function clearTimeout(id: number): void;
      
      // JSON utilities
      declare namespace JSON {
        function parse(text: string): any;
        function stringify(value: any): string;
      }
    `, 'ts:filename/apis.d.ts');
  };

  // Map tool parameter types to TypeScript types
  const mapParamTypeToTsType = (paramType: string = 'string') => {
    switch (paramType.toLowerCase()) {
      case 'number': return 'number';
      case 'boolean': return 'boolean';
      case 'array': return 'any[]';
      case 'object': return 'Record<string, any>';
      case 'date': return 'string /* ISO date string */';
      default: return 'string';
    }
  };

  // Add keyboard shortcut for Ctrl+S
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Check for Ctrl+S or Cmd+S (Mac)
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault(); // Prevent browser's save dialog
        handleSave();
      }
    };

    // Add event listener
    window.addEventListener('keydown', handleKeyDown);

    // Cleanup
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [code, toolId, mcpServerId]);

  // Handle code changes
  const handleCodeChange = (value: string | undefined) => {
    setCode(value || "");
  };

  // Handle save
  const handleSave = async () => {
    if (!toolId || !mcpServerId || loading) return;

    // Validate code has return statement
    if (!code.includes('return')) {
      setSnackbar({
        open: true,
        message: "Code must include a return statement",
        severity: "error"
      });
      return;
    }

    setLoading(true);
    setIsSaving(true);
    try {
      // Save code
      await axios.post(`${API_BASE}/save`, {
        toolId,
        toolCode: code
      }, {
        headers: getAuthHeaders()
      });

      // Show success animation
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 1200);
      
      setSnackbar({
        open: true,
        message: "Code saved successfully",
        severity: "success"
      });
    } catch (error) {
      setSnackbar({
        open: true,
        message: "Failed to save code",
        severity: "error"
      });
    } finally {
      setLoading(false);
      setTimeout(() => setIsSaving(false), 300);
    }
  };

  // Function to check if user is requesting server-side code
  const isServerSideRequest = (prompt: string): boolean => {
    // Keywords and phrases associated with server-side code
    const serverSideKeywords = [
      // Node.js ecosystem
      'node', 'express', 'koa', 'fastify', 'hapi', 'nest.js',
      // Database related
      'database', 'mongodb', 'mongoose', 'sequelize', 'mysql', 'postgres', 'sql',
      'sqlite', 'redis', 'firestore',
      // File system operations
      'filesystem', 'fs.', 'readfile', 'writefile', 'fs.read', 'fs.write',
      // Server concepts
      'server side', 'backend', 'api server', 'middleware',
      // Common Node.js modules
      'require(', 'import fs', 'import http', 'import path', 'import os',
      'child_process', 'spawn', 'exec',
      // Environment
      'process.env', '.env', 'dotenv',
    ];

    const promptLower = prompt.toLowerCase();

    // Check for server-side keywords
    for (const keyword of serverSideKeywords) {
      if (promptLower.includes(keyword)) {
        return true;
      }
    }

    // Check for common server-side request patterns
    if (
      promptLower.includes('connect to') &&
      (promptLower.includes('database') || promptLower.includes('server'))
    ) {
      return true;
    }

    if (
      promptLower.includes('save') &&
      (promptLower.includes('file') || promptLower.includes('disk'))
    ) {
      return true;
    }

    return false;
  };

  // Add this function to validate prompt using ChatGPT before attempting code generation
  const validatePromptWithChatGPT = async (prompt: string): Promise<{isValid: boolean, reason?: string}> => {
    try {
      // Create a system prompt to evaluate the user's request
      const validationPrompt = `
You are a code request validator with expertise in JavaScript development environments.
Your task is to determine if the following code request can be fulfilled using only vanilla client-side JavaScript running in a browser.

Request: "${prompt}"

Rules for validation:
1. VALID requests are those that can be implemented with vanilla JavaScript in a browser environment
2. INVALID requests are those requiring Node.js, server-side APIs, database connections, or file system access
3. If the request involves HTTP requests to external APIs, it's still VALID as fetch() is available in the browser

Respond with ONLY a JSON object in this format:
{
  "isValid": true/false,
  "reason": "Brief explanation of why this is valid or invalid"
}`;

      // Make API request to check if prompt requires server-side code
      const res = await axios.post(
        'https://api.openai.com/v1/chat/completions',
        {
          model: "gpt-3.5-turbo",
          messages: [
            { role: 'system', content: validationPrompt },
            { role: 'user', content: prompt }
          ],
          max_tokens: 2000,
          temperature: 0.1,
        },
        {
          headers: {
            'Authorization': `Bearer ${CHAT_GPT_KEY || ""}`,
            'Content-Type': 'application/json',
          },
        }
      );

      // Extract and parse the response
      const content = res.data.choices[0].message.content.trim();
      console.log("Validation response:", content);
      
      let validation = {isValid: false, reason: "Could not validate request"};
      
      try {
        validation = JSON.parse(content);
      } catch (error) {
        console.error("Failed to parse validation response:", error);
        // If we can't parse the JSON, check for keywords as fallback
        validation = {
          isValid: !content.toLowerCase().includes("invalid"),
          reason: "Based on keyword analysis"
        };
      }
      
      return validation;
    } catch (error) {
      console.error("Error validating prompt:", error);
      // Fallback to the existing method if ChatGPT validation fails
      return {
        isValid: !isServerSideRequest(prompt),
        reason: "Based on local pattern detection"
      };
    }
  };

  // Update the generateCodeWithAI function
  const generateCodeWithAI = async () => {
    if (!promptValue.trim()) return;
    
    setGeneratingCode(true);
    
    try {
      // First, validate the prompt using ChatGPT
      const validation = await validatePromptWithChatGPT(promptValue);
      
      if (!validation.isValid) {
        setSnackbar({
          open: true,
          message: `Cannot generate server-side code. ${validation.reason || 'Only vanilla JavaScript is supported.'}`,
          severity: "info"
        });
        setGeneratingCode(false);
        return;
      }
      
      const token = localStorage.getItem("token");
      if (!token) throw new Error("Authentication token not found");
      
      // Get tool parameters for more precise code generation
      let paramInfo = "No parameters available";
      if (toolParams.length > 0) {
        paramInfo = toolParams.map(p =>
          `${p.paramName} (${p.paramType || 'any'}): ${p.paramDescription || 'No description'}`
        ).join('\n');
      }
      
      // Create system prompt with tool details
      const sysPrompt = `You are a JavaScript expert helping to create code for a tool function.
The tool name is: "${toolName}"
Description: "${toolDescription}"

The tool has these parameters:
${paramInfo}

The code should follow these requirements:
1. Must be vanilla browser JavaScript only - NO server-side or Node.js code
2. The function must be assigned to global.registeredTool = (input) => { ... }
3. Must return a response as a string (not an object)
4. Should include comments explaining the code
5. Input parameters are available directly on the input object (no parsing needed)
6. Keep code simple and efficient
7. Do not include any database access, file system operations, or server-side APIs

Based on the user's prompt, create ONLY the JavaScript code without any explanations.`;

      // Make AI request
      const res = await axios.post(
        'https://api.openai.com/v1/chat/completions',
        {
          model: selectedModel,
          messages: [
            { role: 'system', content: sysPrompt },
            { role: 'user', content: promptValue }
          ],
          max_tokens: 1000,
          temperature: 0.2,
        },
        {
          headers: {
            'Authorization': `Bearer ${CHAT_GPT_KEY || ""}`,
            'Content-Type': 'application/json',
          },
        }
      );
      
      // Extract code from response
      const content = res.data.choices[0].message.content;
      let generatedCode = content;
      
      // Check for code blocks and extract just the code
      const codeMatch = content.match(/```(javascript|js)?\s*([\s\S]*?)```/i);
      if (codeMatch) {
        generatedCode = codeMatch[2];
      }
      
      // Set the code and close the dialog
      setCode(generatedCode);
      setPromptDialogOpen(false);
      
      setSnackbar({
        open: true,
        message: "Code generated successfully! Review before saving.",
        severity: "success"
      });
      
    } catch (error: any) {
      setSnackbar({
        open: true,
        message: `Failed to generate code: ${error.message || 'Unknown error'}`,
        severity: "error"
      });
    } finally {
      setGeneratingCode(false);
    }
  };

  // Handle model selection change
  const handleModelChange = (event: any) => {
    setSelectedModel(event.target.value as string);
  };

  // Add this useEffect to handle fullscreen mode body styles and escape key
  useEffect(() => {
    // Prevent body scrolling when in fullscreen mode
    if (fullscreen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    
    // Add escape key handler to exit fullscreen
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && fullscreen) {
        setFullscreen(false);
      }
    };
    
    window.addEventListener('keydown', handleEsc);
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleEsc);
    };
  }, [fullscreen]);

  // Initialize animation readiness after a small delay
  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimationReady(true);
    }, 100);
    
    return () => clearTimeout(timer);
  }, []);

  return (
    <MotionConfig transition={{ 
      type: "spring", 
      stiffness: 300, 
      damping: 30,
      mass: 1
    }}>
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ 
          opacity: animationReady ? 1 : 0, 
          y: animationReady ? 0 : 15 
        }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        style={{ width: '100%', willChange: 'opacity, transform' }}
      >
        <div ref={editorContainerRef} style={{ width: '100%' }}>
          {/* Editor Paper with enhanced styling */}
          <Paper
            elevation={0}
            sx={{
              borderRadius: fullscreen ? 0 : 2,
              bgcolor: "#1e1e1e",
              overflow: 'hidden',
              position: fullscreen ? 'fixed' : 'relative',
              top: fullscreen ? 0 : 'auto',
              left: fullscreen ? 0 : 'auto',
              right: fullscreen ? 0 : 'auto',
              bottom: fullscreen ? 0 : 'auto',
              width: fullscreen ? '100%' : '100%',
              height: fullscreen ? '100vh' : 'auto',
              m: fullscreen ? 0 : undefined,
              mb: fullscreen ? 0 : 4,
              boxShadow: fullscreen ? 'none' : "0 4px 20px rgba(0,0,0,0.15)",
              border: '1px solid rgba(255,255,255,0.07)',
              zIndex: fullscreen ? 9999 : 'auto',
              transition: 'all 0.3s cubic-bezier(0.22, 1, 0.36, 1)'
            }}
          >
            {/* Header with enhanced UI */}
            <motion.div
              animate={{ 
                backgroundColor: saveSuccess 
                  ? alpha(theme.palette.success.main, 0.2) 
                  : "#2d2d2d",
              }}
              transition={{ duration: 0.5 }}
            >
              <Box
                sx={{
                  p: 1.5,
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  borderBottom: '1px solid rgba(255,255,255,0.07)'
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <motion.div 
                    whileHover={{ scale: 1.05 }} 
                    whileTap={{ scale: 0.95 }}
                  >
                    <Box 
                      sx={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        color: '#f0db4f',
                        bgcolor: 'rgba(240, 219, 79, 0.15)',
                        px: 1.5,
                        py: 0.7,
                        borderRadius: 1.5
                      }}
                    >
                      <motion.div
                        initial={{ rotate: 0 }}
                        animate={{ rotate: animationReady ? 360 : 0 }}
                        transition={{ duration: 0.7, delay: 0.3 }}
                      >
                        <i className="fa-brands fa-js" style={{ fontSize: '1.2rem', marginRight: '8px' }}></i>
                      </motion.div>
                      <Typography variant="body2" fontWeight="600" color="#f0db4f">
                        Vanilla JavaScript
                      </Typography>
                    </Box>
                  </motion.div>

                  <AnimatePresence mode="wait">
                    {showMetadata && toolParams.length > 0 && (
                      <motion.div
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -10 }}
                        transition={{ duration: 0.35, ease: "easeInOut" }}
                      >
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center' }}>
                          <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ delay: 0.1, duration: 0.3 }}
                          >
                            <Typography 
                              variant="caption" 
                              sx={{ 
                                mr: 1, 
                                px: 1.5, 
                                py: 0.5, 
                                bgcolor: 'rgba(255,255,255,0.07)', 
                                borderRadius: 1,
                                color: 'rgba(255,255,255,0.7)',
                              }}
                            >
                              Parameters
                            </Typography>
                          </motion.div>
                          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                            {toolParams.map((param, idx) => (
                              <motion.div
                                key={idx}
                                initial={{ scale: 0.8, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                transition={{ delay: 0.2 + idx * 0.05, duration: 0.3 }}
                                style={{ transformOrigin: 'left center' }}
                              >
                                <Tooltip
                                  title={`${param.paramDescription || 'No description'} (${param.paramType || 'any'})`}
                                  placement="top"
                                >
                                  <Chip
                                    size="small"
                                    label={param.paramName}
                                    sx={{ 
                                      fontSize: '0.75rem',
                                      bgcolor: 'rgba(97, 175, 254, 0.15)',
                                      color: '#61affe',
                                      borderColor: 'rgba(97, 175, 254, 0.3)',
                                      transition: 'all 0.2s ease',
                                      '&:hover': {
                                        bgcolor: 'rgba(97, 175, 254, 0.25)',
                                        transform: 'translateY(-1px)'
                                      }
                                    }}
                                    variant="outlined"
                                  />
                                </Tooltip>
                              </motion.div>
                            ))}
                          </Box>
                        </Box>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <IconButton 
                      onClick={() => setShowMetadata(!showMetadata)} 
                      sx={{ 
                        color: showMetadata ? 'rgba(97, 175, 254, 0.8)' : 'rgba(255,255,255,0.6)',
                        mr: 0.5,
                        transition: 'color 0.3s ease'
                      }}
                      size="small"
                    >
                      <InfoIcon fontSize="small" />
                    </IconButton>
                  </motion.div>
                  
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <IconButton 
                      onClick={() => setShortcutsOpen(true)} 
                      sx={{ 
                        color: 'rgba(255,255,255,0.6)',
                        mr: 0.5,
                        transition: 'color 0.3s ease',
                        '&:hover': { color: 'rgba(255,255,255,0.9)' }
                      }}
                      size="small"
                    >
                      <KeyboardIcon fontSize="small" />
                    </IconButton>
                  </motion.div>
                
                  <motion.div 
                    whileHover={{ scale: 1.05 }} 
                    whileTap={{ scale: 0.95 }}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.4, duration: 0.3 }}
                  >
                    <Button
                      startIcon={<SmartToyIcon />}
                      variant="outlined"
                      size="small"
                      onClick={() => setPromptDialogOpen(true)}
                      sx={{ 
                        mr: 1.5,
                        color: '#61affe',
                        borderColor: 'rgba(97, 175, 254, 0.4)',
                        transition: 'all 0.2s ease',
                        '&:hover': {
                          borderColor: '#61affe',
                          bgcolor: 'rgba(97, 175, 254, 0.1)',
                          transform: 'translateY(-1px)',
                          boxShadow: '0 3px 10px rgba(97, 175, 254, 0.15)'
                        }
                      }}
                    >
                      Generate
                    </Button>
                  </motion.div>
                
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Tooltip title="Copy code">
                      <IconButton 
                        onClick={() => {
                          navigator.clipboard.writeText(code);
                          setSnackbar({
                            open: true,
                            message: "Code copied to clipboard",
                            severity: "success"
                          });
                        }}
                        sx={{ 
                          color: 'rgba(255,255,255,0.7)',
                          mr: 0.5,
                          transition: 'all 0.2s ease',
                          '&:hover': {
                            color: 'rgba(255,255,255,1)',
                            bgcolor: 'rgba(255,255,255,0.05)',
                          }
                        }}
                      >
                        <ContentCopyIcon />
                      </IconButton>
                    </Tooltip>
                  </motion.div>
                
                  <motion.div 
                    whileHover={{ scale: 1.05 }} 
                    whileTap={{ scale: 0.95 }}
                    animate={{ rotate: fullscreen ? 180 : 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Tooltip title={fullscreen ? "Exit fullscreen" : "Enter fullscreen"}>
                      <IconButton 
                        onClick={toggleFullscreen}
                        sx={{ 
                          color: 'rgba(255,255,255,0.7)', 
                          mr: 1,
                          transition: 'transform 0.3s ease'
                        }}
                      >
                        {fullscreen ? <FullscreenExitIcon /> : <FullscreenIcon />}
                      </IconButton>
                    </Tooltip>
                  </motion.div>
                
                  <motion.div 
                    whileHover={{ scale: 1.03 }} 
                    whileTap={{ scale: 0.97 }}
                    style={{ position: 'relative', transformOrigin: 'center' }}
                  >
                    <Button
                      variant="contained"
                      color={saveSuccess ? "success" : "primary"}
                      size="small"
                      onClick={handleSave}
                      disabled={loading}
                      sx={{ 
                        position: 'relative',
                        minWidth: 80,
                        height: 36, // Fixed height prevents jumping
                        overflow: 'hidden'
                      }}
                    >
                      <AnimatePresence mode="wait">
                        {isSaving ? (
                          <motion.div
                            key="saving"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.3 }}
                            style={{ 
                              display: 'flex', 
                              alignItems: 'center',
                              justifyContent: 'center', 
                              position: 'absolute',
                              top: 0,
                              left: 0,
                              right: 0,
                              bottom: 0,
                              width: '100%'  // Ensure full width
                            }}
                          >
                            <CircularProgress size={16} sx={{ mr: 1, color: 'white' }} />
                            Saving
                          </motion.div>
                        ) : saveSuccess ? (
                          <motion.div
                            key="saved"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.3 }}
                            style={{ 
                              display: 'flex', 
                              alignItems: 'center',
                              justifyContent: 'center',
                              position: 'absolute',
                              top: 0,
                              left: 0,
                              right: 0,
                              bottom: 0,
                              width: '100%'
                            }}
                          >
                            <CheckIcon sx={{ mr: 0.5 }} />
                            Saved!
                          </motion.div>
                        ) : (
                          <motion.div
                            key="save"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.3 }}
                            style={{ 
                              display: 'flex', 
                              alignItems: 'center',
                              justifyContent: 'center',
                              position: 'absolute',
                              top: 0,
                              left: 0,
                              right: 0,
                              bottom: 0,
                              width: '100%'
                            }}
                          >
                            <SaveIcon sx={{ mr: 0.5 }} />
                            Save
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </Button>
                  </motion.div>
                </Box>
              </Box>
            </motion.div>
            
            {/* Tool info */}
            <AnimatePresence mode="wait">
              {showMetadata && (toolName || toolDescription) && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ 
                    height: "auto", 
                    opacity: 1,
                    transition: { 
                      height: { duration: 0.4 },
                      opacity: { duration: 0.3, delay: 0.15 }  // Delay opacity until height animation is underway
                    }
                  }}
                  exit={{ 
                    height: 0, 
                    opacity: 0,
                    transition: { 
                      height: { duration: 0.3, delay: 0.05 }, 
                      opacity: { duration: 0.2 } 
                    }
                  }}
                  style={{ overflow: 'hidden', willChange: 'height, opacity' }}
                >
                  <Box sx={{ 
                    px: 3, 
                    py: 2, 
                    bgcolor: 'rgba(255,255,255,0.03)', 
                    borderBottom: '1px solid rgba(255,255,255,0.05)'
                  }}>
                    {toolName && (
                      <Typography variant="subtitle2" sx={{ display: 'flex', alignItems: 'center', color: 'rgba(255,255,255,0.9)' }}>
                        <CodeIcon fontSize="small" sx={{ mr: 1, opacity: 0.7 }} />
                        {toolName}
                      </Typography>
                    )}
                    {toolDescription && (
                      <Typography variant="body2" sx={{ mt: 0.5, color: 'rgba(255,255,255,0.6)' }}>
                        {toolDescription}
                      </Typography>
                    )}
                  </Box>
                </motion.div>
              )}
            </AnimatePresence>
            
            {/* Monaco Editor */}
            <motion.div
              style={{ 
                position: 'relative', 
                willChange: 'height',
                height: fullscreen ? 'calc(100vh - 120px)' : 'calc(80vh - 170px)' // Directly set height
              }}
            >
              <Editor
                height="100%" // This will now fill the container
                defaultLanguage="javascript"
                theme="vs-dark"
                value={code}
                onChange={handleCodeChange}
                onMount={handleEditorDidMount}
                options={{
                  fontSize: 15,
                  minimap: { enabled: true },
                  scrollBeyondLastLine: false,
                  automaticLayout: true, // Important for proper resizing in fullscreen
                  tabSize: 2,
                  wordWrap: 'on',
                  lineNumbers: 'on',
                  renderValidationDecorations: 'on',
                  fontLigatures: true,
                  fontFamily: "'Fira Code', 'Consolas', monospace",
                  smoothScrolling: true,
                  cursorBlinking: "smooth",
                  cursorSmoothCaretAnimation: "on",
                  suggest: {
                    showKeywords: true,
                    showSnippets: true,
                    showMethods: true,
                    showVariables: true,
                    showClasses: true
                  }
                }}
                loading={
                  <Box sx={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    bgcolor: '#1e1e1e'
                  }}>
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.5 }}
                    >
                      <CircularProgress color="info" size={50} />
                    </motion.div>
                  </Box>
                }
              />
            </motion.div>

            {/* Footer with tips - only shown when not in fullscreen */}
            <AnimatePresence mode="wait">
              {!fullscreen && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ 
                    duration: 0.4,
                    delay: fullscreen ? 0 : 0.3  // Add delay when appearing
                  }}
                >
                  <Box 
                    sx={{ 
                      px: 2, 
                      py: 1.5, 
                      height: 44, // Fixed height
                      borderTop: '1px solid rgba(255,255,255,0.07)',
                      display: 'flex', 
                      alignItems: 'center',
                      bgcolor: 'rgba(255,255,255,0.02)'
                    }}
                  >
                    <InfoIcon fontSize="small" sx={{ mr: 1, color: '#61affe' }} />
                    <Typography variant="caption" color="rgba(255,255,255,0.65)">
                      <strong>Tips:</strong> Press <kbd style={{ background: 'rgba(255,255,255,0.1)', padding: '2px 4px', borderRadius: 3 }}>Ctrl+S</kbd> to save. 
                      Use <code style={{ background: 'rgba(255,255,255,0.1)', padding: '2px 4px', borderRadius: 3 }}>input</code> to access parameters. 
                      Always include a <code style={{ background: 'rgba(255,255,255,0.1)', padding: '2px 4px', borderRadius: 3 }}>return</code> statement.
                    </Typography>
                  </Box>
                </motion.div>
              )}
            </AnimatePresence>
          </Paper>
        </div>

        {/* Snackbar for notifications */}
        <Snackbar
          open={snackbar.open}
          autoHideDuration={4000}
          onClose={() => setSnackbar({ ...snackbar, open: false })}
        >
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
          >
            <Alert severity={snackbar.severity} sx={{ width: '100%' }}>
              {snackbar.message}
            </Alert>
          </motion.div>
        </Snackbar>

        {/* AI Prompt Dialog */}
        <Dialog
          open={promptDialogOpen}
          onClose={() => !generatingCode && setPromptDialogOpen(false)}
          maxWidth="md"
          fullWidth
          slotProps={{
            paper: {
              style: {
                borderRadius: 12,
                boxShadow: '0 10px 40px rgba(0,0,0,0.2)',
                willChange: 'opacity, transform'
              }
            }
          }}
        >
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <DialogTitle>
              Generate Tool Code with AI
              <IconButton
                aria-label="close"
                onClick={() => !generatingCode && setPromptDialogOpen(false)}
                sx={{
                  position: 'absolute',
                  right: 8,
                  top: 8
                }}
                disabled={generatingCode}
              >
                <CloseIcon />
              </IconButton>
            </DialogTitle>
            <DialogContent>
              <Box sx={{ mb: 2, mt: 1 }}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Describe what you want this tool to do, and AI will generate JavaScript code for you.
                </Typography>

                {/* Model selection dropdown */}
                <FormControl fullWidth variant="outlined" size="small" sx={{ mb: 2 }}>
                  <InputLabel id="model-select-label">AI Model</InputLabel>
                  <Select
                    labelId="model-select-label"
                    id="model-select"
                    value={selectedModel}
                    onChange={handleModelChange}
                    label="AI Model"
                    disabled={generatingCode}
                  >
                    <MenuItem value="gpt-3.5-turbo">GPT-3.5 Turbo (Faster)</MenuItem>
                    <MenuItem value="gpt-4">GPT-4 (More Capable)</MenuItem>
                    <MenuItem value="gpt-4-turbo">GPT-4 Turbo (Latest)</MenuItem>
                  </Select>
                </FormControl>

                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2, duration: 0.3 }}
                >
                  <Box sx={{ bgcolor: 'rgba(97, 175, 254, 0.1)', p: 1.5, borderRadius: 1, mb: 2, border: '1px solid rgba(97, 175, 254, 0.2)' }}>
                    <Typography variant="subtitle2" gutterBottom sx={{ color: '#61affe' }}>Tool Parameters:</Typography>
                    {toolParams.length > 0 ? (
                      <Box component="ul" sx={{ m: 0, pl: 2 }}>
                        {toolParams.map((param, idx) => (
                          <motion.div
                            key={idx}
                            initial={{ x: -10, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            transition={{ delay: 0.2 + idx * 0.1, duration: 0.3 }}
                          >
                            <Typography component="li" key={idx} variant="body2">
                              <strong>{param.paramName}</strong> ({param.paramType || 'any'}): {param.paramDescription || 'No description'}
                            </Typography>
                          </motion.div>
                        ))}
                      </Box>
                    ) : (
                      <Typography variant="body2">No parameters defined for this tool</Typography>
                    )}
                  </Box>
                </motion.div>
              </Box>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3, duration: 0.4 }}
              >
                <TextField
                  autoFocus
                  label="Describe what you want the code to do"
                  multiline
                  rows={4}
                  fullWidth
                  variant="outlined"
                  value={promptValue}
                  onChange={(e) => setPromptValue(e.target.value)}
                  disabled={generatingCode}
                  placeholder="Example: Create a tool that calculates the total expense amount and formats it as a summary"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SmartToyIcon color="action" />
                      </InputAdornment>
                    ),
                  }}
                />
              </motion.div>
            </DialogContent>
            <DialogActions sx={{ px: 3, pb: 2 }}>
              <Button
                onClick={() => setPromptDialogOpen(false)}
                disabled={generatingCode}
              >
                Cancel
              </Button>
              <motion.div
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
              >
                <Button
                  onClick={generateCodeWithAI}
                  variant="contained"
                  disabled={!promptValue.trim() || generatingCode}
                  sx={{
                    position: 'relative',
                    overflow: 'hidden'
                  }}
                >
                  <AnimatePresence mode="wait">
                    {generatingCode ? (
                      <motion.div
                        key="generating"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        style={{ display: 'flex', alignItems: 'center' }}
                      >
                        <CircularProgress size={18} sx={{ mr: 1 }} color="inherit" />
                        Generating...
                      </motion.div>
                    ) : (
                      <motion.div
                        key="generate"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        style={{ display: 'flex', alignItems: 'center' }}
                      >
                        <CodeIcon sx={{ mr: 1 }} />
                        Generate Code
                      </motion.div>
                    )}
                  </AnimatePresence>
                </Button>
              </motion.div>
            </DialogActions>
          </motion.div>
        </Dialog>

        {/* Shortcuts Dialog */}
        <Dialog
          open={shortcutsOpen}
          onClose={() => setShortcutsOpen(false)}
          maxWidth="sm"
          fullWidth
          slotProps={{
            paper: {
              style: {
                borderRadius: 12,
                boxShadow: '0 10px 40px rgba(0,0,0,0.2)',
                willChange: 'opacity, transform'
              }
            }
          }}
        >
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <DialogTitle>
              Keyboard Shortcuts
              <IconButton
                aria-label="close"
                onClick={() => setShortcutsOpen(false)}
                sx={{
                  position: 'absolute',
                  right: 8,
                  top: 8
                }}
              >
                <CloseIcon />
              </IconButton>
            </DialogTitle>
            <DialogContent>
              <Box sx={{ mb: 2, mt: 1 }}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Use these keyboard shortcuts to speed up your workflow:
                </Typography>

                <Box component="ul" sx={{ pl: 2, mb: 2 }}>
                  <motion.li
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center' }}>
                      <KeyboardIcon fontSize="small" sx={{ mr: 1, color: '#61affe' }} />
                      <strong>Ctrl + S</strong>: Save the tool code
                    </Typography>
                  </motion.li>

                </Box>

                <Typography variant="caption" color="text.secondary">
                  Note: Some shortcuts may not work on all browsers or operating systems.
                </Typography>
              </Box>
            </DialogContent>
            <DialogActions sx={{ px: 3, pb: 2 }}>
              <Button
                onClick={() => setShortcutsOpen(false)}
              >
                Close
              </Button>
            </DialogActions>
          </motion.div>
        </Dialog>
      </motion.div>
    </MotionConfig>
  );
};

export default CodeSection;
