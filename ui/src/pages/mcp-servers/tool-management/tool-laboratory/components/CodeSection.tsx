import React from 'react';
import {
  Box,
  FormControl,
  Select,
  MenuItem,
  Typography,
  IconButton,
  Tooltip,
  Paper
} from "@mui/material";
import Editor from "@monaco-editor/react";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import CircularProgress from "@mui/material/CircularProgress";
import { useToolContext } from '../context/ToolContext';

const CodeSection: React.FC = () => {
  const {
    language,
    setLanguage,
    code,
    handleCodeChange
  } = useToolContext();

  const handleLanguageChange = (event: any) => {
    setLanguage(event.target.value as "nodejs" | "python");
  };

  return (
    <Paper
      elevation={0}
      sx={{
        borderRadius: 2,
        bgcolor: "#fff",
        boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
        pb: 3,
        mb: 4
      }}
    >
      {/* Language selector and actions */}
      <Box
        sx={{
          p: 2,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderBottom: '1px solid #eee'
        }}
      >
        <FormControl sx={{ minWidth: 150 }} size="small">
          <Select
            value={language}
            onChange={handleLanguageChange}
            displayEmpty
            sx={{ borderRadius: 1 }}
          >
            <MenuItem value="nodejs">
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <i className="fa-brands fa-node-js me-2"></i>
                Node.js
              </Box>
            </MenuItem>
            <MenuItem value="python">
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <i className="fa-brands fa-python me-2"></i>
                Python
              </Box>
            </MenuItem>
          </Select>
        </FormControl>
        
        <Tooltip title="Copy code">
          <IconButton onClick={() => navigator.clipboard.writeText(code[language])}>
            <ContentCopyIcon />
          </IconButton>
        </Tooltip>
      </Box>
      
      {/* Monaco Editor */}
      <Box sx={{ height: 500, border: '1px solid #eee', position: 'relative' }}>
        <Editor
          height="100%"
          defaultLanguage={language === "nodejs" ? "javascript" : "python"}
          theme="vs-dark"
          value={code[language]}
          onChange={handleCodeChange}
          options={{
            fontSize: 14,
            minimap: { enabled: true },
            scrollBeyondLastLine: false,
            automaticLayout: true,
            tabSize: 2,
            wordWrap: 'on',
            lineNumbers: 'on',
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
              <CircularProgress color="info" size={40} />
            </Box>
          }
        />
      </Box>
      
      {/* Package dependencies information */}
      <Box 
        sx={{ 
          mt: 2, 
          p: 2, 
          borderRadius: 1, 
          bgcolor: 'rgba(0,0,0,0.03)',
          border: '1px dashed rgba(0,0,0,0.1)'
        }}
      >
        <Typography variant="subtitle2" fontWeight={600} mb={1}>
          {language === 'nodejs' ? 'Node.js Package Dependencies' : 'Python Package Dependencies'}
        </Typography>
        <Typography variant="body2" sx={{ mb: 1 }}>
          {language === 'nodejs' ? (
            <>
              Basic functionality: No additional packages required. <br/>
              HTTP requests: <code>npm install axios</code> <br/>
              Database: <code>npm install mongoose</code> (MongoDB) or <code>npm install pg</code> (PostgreSQL)
            </>
          ) : (
            <>
              Basic functionality: No additional packages required. <br/>
              HTTP requests: <code>pip install requests</code> <br/>
              Data processing: <code>pip install pandas numpy</code> <br/>
              Machine learning: <code>pip install scikit-learn</code>
            </>
          )}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          <i>Note: Install packages using npm/pip in your MCP server's environment before using them.</i>
        </Typography>
      </Box>
    </Paper>
  );
};

export default CodeSection;