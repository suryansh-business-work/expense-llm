import { Drawer, Box, Typography, Button, TextField } from "@mui/material";
import MonacoEditor from "@monaco-editor/react";

const PromptTestDrawer = ({
  open,
  onClose,
  getDrawerPromptName,
  promptValues,
  testDrawer,
  testUserInput,
  setTestUserInput,
  testOutput,
  setTestOutput,
  testLoadingDrawer,
  handleTestPrompt,
  testResult,
  apiOutput
}: {
  open: boolean;
  onClose: () => void;
  getDrawerPromptName: () => string;
  promptValues: any;
  testDrawer: { open: boolean; idx: number | null };
  testUserInput: string;
  setTestUserInput: (v: string) => void;
  testOutput: string;
  setTestOutput: (v: string) => void;
  testLoadingDrawer: boolean;
  handleTestPrompt: () => void;
  testResult: "pass" | "fail" | null;
  apiOutput: string;
}) => (
  <Drawer
    anchor="right"
    open={open}
    onClose={() => {}}
    hideBackdrop={false}
    slotProps={{
      paper: {
        sx: { width: "40vw", p: 0, boxShadow: 6 }
      }
    }}
    ModalProps={{
      keepMounted: true,
    }}
  >
    <Box sx={{ p: 0, height: "100%", display: "flex", flexDirection: "column" }}>
      <Box
        sx={{
          p: 3,
          pb: 2,
          borderBottom: "1px solid #e0e0e0",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          background: "#f5faff"
        }}
      >
        <Box>
          <Typography variant="h6" sx={{ fontWeight: 700 }}>
            Test Prompt
          </Typography>
          <Typography variant="subtitle2" color="text.secondary">
            {getDrawerPromptName()}
          </Typography>
        </Box>
        <Button onClick={onClose} color="error" variant="outlined">
          Close
        </Button>
      </Box>
      <Box sx={{ p: 3, flex: 1, overflowY: "auto" }}>
        {/* Prompt Section */}
        <Box sx={{ mb: 3, background: "#e3f2fd", borderRadius: 2, p: 2 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
            Prompt
          </Typography>
          <Typography
            variant="body2"
            sx={{ whiteSpace: "pre-wrap", color: "#1976d2" }}
          >
            {typeof testDrawer.idx === "number" && promptValues?.[testDrawer.idx]?.prompt}
          </Typography>
        </Box>
        {/* Output Response Section */}
        <Box sx={{ mb: 3, background: "#f0f4c3", borderRadius: 2, p: 2 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
            Output Response
          </Typography>
          <MonacoEditor
            height="100px"
            language="json"
            theme="vs-dark"
            value={
              typeof testDrawer.idx === "number"
                ? promptValues?.[testDrawer.idx]?.output || ""
                : ""
            }
            options={{
              minimap: { enabled: false },
              fontSize: 14,
              scrollBeyondLastLine: false,
              wordWrap: "on",
              readOnly: true,
            }}
          />
        </Box>
        {/* User Input Section */}
        <Box sx={{ mb: 3, background: "#f5f5f5", borderRadius: 2, p: 2 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
            User Input
          </Typography>
          <TextField
            label="Enter user input for testing"
            placeholder="Type your test user input here (e.g. 'Scrape emails from https://example.com')"
            value={testUserInput}
            onChange={e => setTestUserInput(e.target.value)}
            fullWidth
            multiline
            minRows={2}
            sx={{ mb: 1 }}
            helperText="This is the user input that will be sent to the prompt for testing."
          />
        </Box>
        {/* Test Output Section */}
        <Box sx={{ mb: 3, background: "#e3f2fd", borderRadius: 2, p: 2 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
            Test Output (Expected JSON)
          </Typography>
          <MonacoEditor
            height="100px"
            language="json"
            theme="vs-dark"
            value={testOutput}
            onChange={v => setTestOutput(v || "")}
            options={{
              minimap: { enabled: false },
              fontSize: 14,
              scrollBeyondLastLine: false,
              wordWrap: "on",
            }}
          />
          <Typography variant="caption" color="text.secondary">
            Enter the expected JSON output you want to compare with the API response.
          </Typography>
        </Box>
        {/* Response JSON Section */}
        <Box sx={{ mb: 2, background: "#f8f9fa", borderRadius: 2, p: 2 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
            Response JSON (from API)
          </Typography>
          <MonacoEditor
            height="100px"
            language="json"
            theme="vs-dark"
            value={testResult === "fail" && !apiOutput ? "" : apiOutput || ""}
            options={{
              minimap: { enabled: false },
              fontSize: 14,
              scrollBeyondLastLine: false,
              wordWrap: "on",
              readOnly: true,
            }}
          />
          <Typography variant="caption" color="text.secondary">
            This is the actual JSON response returned by the API.
          </Typography>
        </Box>
        <Button
          variant="contained"
          color="primary"
          onClick={handleTestPrompt}
          disabled={testLoadingDrawer}
          sx={{ mt: 1 }}
          fullWidth
        >
          {testLoadingDrawer ? "Testing..." : "Test"}
        </Button>
        {testResult && (
          <Box sx={{ mt: 2 }}>
            <Typography
              variant="subtitle1"
              color={testResult === "pass" ? "success.main" : "error.main"}
              fontWeight={600}
            >
              {testResult === "pass" ? "Test Passed" : "Test Failed"}
            </Typography>
          </Box>
        )}
      </Box>
    </Box>
  </Drawer>
);

export default PromptTestDrawer;