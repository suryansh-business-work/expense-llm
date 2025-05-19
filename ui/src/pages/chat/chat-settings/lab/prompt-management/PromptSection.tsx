import {
  Typography,
  TextField,
  Button,
  IconButton,
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Skeleton,
  CircularProgress,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Checkbox,
  FormControlLabel,
  Drawer,
  Divider
} from "@mui/material";
import { Add, Delete, ExpandMore } from "@mui/icons-material";
import { useForm, Controller, useFieldArray, useWatch } from "react-hook-form";
import { joiResolver } from "@hookform/resolvers/joi";
import Joi from "joi";
import { useParams } from "react-router-dom";
import axios from "axios";
import { useEffect, useState, useMemo } from "react";
import API_LIST from "../../../../apiList";
import MonacoEditor from "@monaco-editor/react";
import { useDynamicSnackbar } from "../../../../../hooks/useDynamicSnackbar";
import { encode } from "gpt-tokenizer";

const promptSchema = Joi.object({
  prompt: Joi.array()
    .items(
      Joi.object({
        name: Joi.string().min(1).required().label("Name"),
        prompt: Joi.string().min(5).required().label("Prompt"),
        output: Joi.string().allow("").label("Output"),
        isUseForChat: Joi.boolean().required().label("Use for chat"),
      })
    )
    .min(1)
    .required()
    .custom((arr, helpers) => {
      // Only one can be true
      if (arr.filter((p: any) => p.isUseForChat).length > 1) {
        return helpers.error("any.invalid");
      }
      return arr;
    }, "Only one prompt can be used for chat"),
});

const MAX_PROMPTS = 5;

const defaultPrompt = { name: "", prompt: "", output: "", isUseForChat: false };

const PromptSection = () => {
  const { chatBotId } = useParams<{ chatBotId: string }>();
  const token = localStorage.getItem("token");
  const showSnackbar = useDynamicSnackbar();

  const {
    control,
    handleSubmit,
    formState: { errors, isDirty },
    reset
  } = useForm({
    resolver: joiResolver(promptSchema),
    defaultValues: { prompt: [defaultPrompt] },
    mode: "onChange",
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "prompt",
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [expanded, setExpanded] = useState<number | false>(0);
  const [deleteIdx, setDeleteIdx] = useState<number | null>(null);

  // Test dialog state
  const [testDialog, setTestDialog] = useState<{ open: boolean; idx: number | null }>({ open: false, idx: null });
  const [testInputs, setTestInputs] = useState<{ [idx: number]: string[] }>({});
  const [, setTestOutputs] = useState<{ [idx: number]: string[] }>({});
  const [testLoading, setTestLoading] = useState<{ [idx: number]: boolean[] }>({});

  // Drawer state for test
  const [testDrawer, setTestDrawer] = useState<{ open: boolean; idx: number | null }>({ open: false, idx: null });
  const [testUserInput, setTestUserInput] = useState<string>("");
  const [testOutput, setTestOutput] = useState<string>("{}");
  const [testLoadingDrawer, setTestLoadingDrawer] = useState<boolean>(false);
  const [testResult, setTestResult] = useState<"pass" | "fail" | null>(null);
  const [apiOutput, setApiOutput] = useState<string>("");

  // Watch all prompt fields for real-time token calculation and output validation
  const promptValues = useWatch({ control, name: "prompt" });

  // Track JSON validity for each output
  const [outputJsonErrors, setOutputJsonErrors] = useState<{ [idx: number]: string }>({});

  // Validate output JSON in real time
  useEffect(() => {
    if (!promptValues) return;
    const errors: { [idx: number]: string } = {};
    promptValues.forEach((p: any, idx: number) => {
      if (p?.output?.trim()) {
        try {
          JSON.parse(p.output);
        } catch (e: any) {
          errors[idx] = "Output is not valid JSON";
        }
      }
    });
    setOutputJsonErrors(errors);
  }, [promptValues]);

  // Calculate token size for each prompt+output in real time
  const tokenSizes = useMemo(() => {
    if (!promptValues) return [];
    return promptValues.map((p: any) => {
      try {
        const promptStr = p?.prompt || "";
        const outputStr = p?.output || "";
        const totalStr = promptStr + "\n" + outputStr;
        return encode(totalStr).length;
      } catch {
        return 0;
      }
    });
  }, [promptValues]);

  // Fetch prompts on load
  useEffect(() => {
    const fetchPrompts = async () => {
      if (!chatBotId) return;
      setLoading(true);
      try {
        const res = await axios.get(
          API_LIST.GET_PROMPT(chatBotId),
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );
        let prompts = res.data?.prompt || res.data?.data?.prompt;
        if (Array.isArray(prompts) && prompts.length > 0) {
          prompts = prompts.map(({ name, prompt, output, isUseForChat }) => ({
            name,
            prompt,
            output: output || "",
            isUseForChat: !!isUseForChat,
          }));
          reset({ prompt: prompts });
          // Open the one with isUseForChat: true, else first
          const idx = prompts.findIndex((p: any) => p.isUseForChat);
          setExpanded(idx !== -1 ? idx : 0);
        } else {
          reset({ prompt: [defaultPrompt] });
          setExpanded(0);
        }
      } catch (err: any) {
        showSnackbar("Failed to load prompts", "error");
        reset({ prompt: [defaultPrompt] });
        setExpanded(0);
      } finally {
        setLoading(false);
      }
    };
    fetchPrompts();
    // eslint-disable-next-line
  }, [chatBotId]);

  const onSubmit = async (data: any) => {
    if (!chatBotId) {
      showSnackbar("ChatBot ID not found in URL!", "error");
      return;
    }
    setSaving(true);
    try {
      await axios.patch(
        API_LIST.UPDATE_PROMPT(chatBotId),
        { prompt: data.prompt },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      showSnackbar("Prompts saved successfully!", "success");
      reset(data);
    } catch (err: any) {
      showSnackbar("Failed to save prompts: " + (err?.response?.data?.message || err.message), "error");
    } finally {
      setSaving(false);
    }
  };

  const onError = () => {
    showSnackbar("Please fix the form errors before saving.", "error");
  };

  const handleAccordionChange = (panel: number) => (_event: React.SyntheticEvent, isExpanded: boolean) => {
    setExpanded(isExpanded ? panel : false);
  };

  // Only one can be true for isUseForChat
  const handleSelectPrompt = (idx: number) => {
    const updatedPrompts = promptValues.map((p: any, i: number) => ({
      ...p,
      isUseForChat: i === idx,
    }));
    reset({ prompt: updatedPrompts });
    setExpanded(idx);
  };

  const handleDeletePrompt = (idx: number) => {
    setDeleteIdx(idx);
  };
  const confirmDeletePrompt = () => {
    if (deleteIdx !== null) {
      remove(deleteIdx);
      setDeleteIdx(null);
      // After delete, open the one with isUseForChat: true, else first
      setTimeout(() => {
        const updated = promptValues.filter((_: any, i: number) => i !== deleteIdx);
        const idx = updated.findIndex((p: any) => p.isUseForChat);
        setExpanded(idx !== -1 ? idx : 0);
      }, 0);
    }
  };

  // Disable save if any form error or any output JSON is invalid
  const isSaveDisabled =
    saving ||
    loading ||
    !isDirty ||
    Object.keys(errors.prompt || {}).length > 0 ||
    Object.keys(outputJsonErrors).length > 0;

  const closeTestDialog = () => setTestDialog({ open: false, idx: null });

  // Add a new test input row
  const handleAddTestInput = (idx: number) => {
    setTestInputs((prev) => ({
      ...prev,
      [idx]: [...(prev[idx] || []), ""],
    }));
    setTestOutputs((prev) => ({
      ...prev,
      [idx]: [...(prev[idx] || []), ""],
    }));
    setTestLoading((prev) => ({
      ...prev,
      [idx]: [...(prev[idx] || []), false],
    }));
  };

  // Update test input value
  const handleTestInputChange = (idx: number, row: number, value: string) => {
    setTestInputs((prev) => {
      const arr = [...(prev[idx] || [])];
      arr[row] = value;
      return { ...prev, [idx]: arr };
    });
  };

  // Test prompt (simulate API call)
  const handleTestPromptDialog = async (idx: number, row: number) => {
    setTestLoading((prev) => {
      const arr = [...(prev[idx] || [])];
      arr[row] = true;
      return { ...prev, [idx]: arr };
    });
    try {
      // Simulate test API call (replace with your actual test API if needed)
      const prompt = promptValues?.[idx]?.prompt || "";
      const userInput = testInputs[idx]?.[row] || "";
      // Example: just concatenate for demo
      const result = `Prompt: ${prompt}\nUser: ${userInput}`;
      await new Promise((res) => setTimeout(res, 500)); // Simulate delay
      setTestOutputs((prev) => {
        const arr = [...(prev[idx] || [])];
        arr[row] = result;
        return { ...prev, [idx]: arr };
      });
    } catch (e) {
      setTestOutputs((prev) => {
        const arr = [...(prev[idx] || [])];
        arr[row] = "Test failed";
        return { ...prev, [idx]: arr };
      });
    } finally {
      setTestLoading((prev) => {
        const arr = [...(prev[idx] || [])];
        arr[row] = false;
        return { ...prev, [idx]: arr };
      });
    }
  };

  // Open test drawer for a prompt
  const openTestDrawer = (idx: number) => {
    setTestDrawer({ open: true, idx });
    setTestUserInput("");
    setTestOutput("{}");
    setTestResult(null);
  };
  const closeTestDrawer = () => {
    setTestDrawer({ open: false, idx: null });
    setTestUserInput("");
    setTestOutput("{}");
    setTestResult(null);
  };

  // Test API call and compare output
  const handleTestPrompt = async () => {
    if (testDrawer.idx === null) return;
    setTestLoadingDrawer(true);
    setTestResult(null);
    setApiOutput(""); // clear previous
    try {
      const prompt = promptValues?.[testDrawer.idx]?.prompt || "";
      const token = localStorage.getItem("token");
      const resp = await axios.post(
        "http://localhost:3000/chat-gpt/prompt",
        { userInput: prompt + "\n" + testUserInput },
        {
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
        }
      );
      const apiRaw = resp.data?.data?.prompt;
      setApiOutput(apiRaw || "");
      let expected, actual;
      try {
        expected = JSON.parse(testOutput);
        actual = JSON.parse(apiRaw);
      } catch {
        setTestResult("fail");
        showSnackbar("Invalid JSON in output or API response.", "error");
        setTestLoadingDrawer(false);
        return;
      }
      const isEqual = JSON.stringify(expected) === JSON.stringify(actual);
      setTestResult(isEqual ? "pass" : "fail");
      if (!isEqual) {
        showSnackbar("Output does not match API response.", "error");
      }
    } catch (e: any) {
      setTestResult("fail");
      setApiOutput("");
      showSnackbar("Test failed: " + (e?.response?.data?.message || e.message), "error");
    } finally {
      setTestLoadingDrawer(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit, onError)}>
      <Typography variant="h6" gutterBottom>
        Manage Prompts
      </Typography>
      <div className="row mb-3">
        <div className="col-12">
          <Button
            variant="outlined"
            startIcon={<Add />}
            onClick={() => {
              if (fields.length >= MAX_PROMPTS) {
                showSnackbar(`You can add up to ${MAX_PROMPTS} prompts only.`, "info");
                return;
              }
              append(defaultPrompt);
              setExpanded(fields.length);
            }}
            sx={{ mb: 2 }}
            disabled={fields.length >= MAX_PROMPTS}
          >
            Add Prompt
          </Button>
        </div>
      </div>
      {loading ? (
        <Box display="flex" flexDirection="column" gap={2} className="mb-3">
          <Skeleton variant="rectangular" height={56} />
          <Skeleton variant="rectangular" height={56} />
        </Box>
      ) : (
        <div className="container-fluid">
          {fields.map((item, idx) => (
            <Accordion
              expanded={expanded === idx}
              onChange={handleAccordionChange(idx)}
              key={item.id}
              className="mb-3"
              sx={{
                background: promptValues?.[idx]?.isUseForChat
                  ? "#e6f9ec"
                  : "#fff5f5",
                border: promptValues?.[idx]?.isUseForChat
                  ? "1.5px solid #4caf50"
                  : "1.5px solid #ffcdd2",
                transition: "background 0.2s, border 0.2s"
              }}
            >
              <AccordionSummary expandIcon={<ExpandMore />}>
                <div className="container-fluid w-100">
                  <div className="row align-items-center">
                    <div className="col">
                      <Typography>
                        {`Prompt ${idx + 1}: `}
                        <Controller
                          name={`prompt.${idx}.name`}
                          control={control}
                          render={({ field }) => (
                            <span style={{ fontWeight: 600 }}>
                              {field.value || "Untitled"}
                            </span>
                          )}
                        />
                      </Typography>
                      {/* Show error below the prompt name in sub-header */}
                      {(errors.prompt?.[idx]?.name || errors.prompt?.[idx]?.prompt || outputJsonErrors[idx] || (errors.prompt && errors.prompt.message)) && (
                        <Typography variant="caption" color="error" sx={{ display: "block", mt: 0.5 }}>
                          {errors.prompt?.[idx]?.name?.message ||
                            errors.prompt?.[idx]?.prompt?.message ||
                            outputJsonErrors[idx] ||
                            (errors.prompt && errors.prompt.message)}
                        </Typography>
                      )}
                    </div>
                    <div className="col-auto d-flex align-items-center justify-content-center">
                      {/* Approx token size in the middle */}
                      <Typography
                        variant="caption"
                        sx={{
                          background: "#e3f2fd",
                          color: "#1976d2",
                          borderRadius: "8px",
                          px: 2,
                          py: 0.5,
                          fontWeight: 600,
                          fontSize: 14,
                          mx: 2,
                          minWidth: 90,
                          textAlign: "center"
                        }}
                      >
                        {`~${tokenSizes[idx] || 0} tokens`}
                      </Typography>
                    </div>
                    <div className="col-auto d-flex align-items-center">
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={!!promptValues?.[idx]?.isUseForChat}
                            onChange={() => handleSelectPrompt(idx)}
                            color="success"
                          />
                        }
                        label="Use for chat"
                        sx={{ mr: 2, userSelect: "none" }}
                      />
                      <IconButton
                        aria-label="delete"
                        color="error"
                        onClick={e => {
                          e.stopPropagation();
                          handleDeletePrompt(idx);
                        }}
                        disabled={fields.length === 1}
                        size="small"
                      >
                        <Delete />
                      </IconButton>
                    </div>
                  </div>
                </div>
              </AccordionSummary>
              <AccordionDetails>
                <div className="row">
                  <div className="col-12 col-md-6 mb-3">
                    <Controller
                      name={`prompt.${idx}.name`}
                      control={control}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          label="Name"
                          error={!!errors.prompt?.[idx]?.name}
                          helperText={errors.prompt?.[idx]?.name?.message as string}
                          fullWidth
                        />
                      )}
                    />
                  </div>
                  <div className="col-12 col-md-6 mb-3">
                    <Controller
                      name={`prompt.${idx}.prompt`}
                      control={control}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          label="Prompt"
                          multiline
                          minRows={2}
                          error={!!errors.prompt?.[idx]?.prompt}
                          helperText={errors.prompt?.[idx]?.prompt?.message as string}
                          fullWidth
                        />
                      )}
                    />
                  </div>
                  <div className="col-12 mb-3">
                    <Controller
                      name={`prompt.${idx}.output`}
                      control={control}
                      render={({ field }) => (
                        <div>
                          <label style={{ fontWeight: 500, marginBottom: 4, display: "block" }}>Output Response</label>
                          <MonacoEditor
                            height="120px"
                            language="json"
                            theme="vs-dark"
                            value={field.value}
                            onChange={field.onChange}
                            options={{
                              minimap: { enabled: false },
                              fontSize: 14,
                              scrollBeyondLastLine: false,
                              wordWrap: "on",
                            }}
                          />
                        </div>
                      )}
                    />
                  </div>
                  <div className="col-12 d-flex justify-content-end">
                    <Button
                      variant="outlined"
                      color="primary"
                      onClick={() => openTestDrawer(idx)}
                      sx={{ mt: 1 }}
                    >
                      Test
                    </Button>
                  </div>
                </div>
              </AccordionDetails>
            </Accordion>
          ))}
        </div>
      )}
      <div className="row">
        <div className="col-12">
          <Button
            type="submit"
            variant="contained"
            disabled={isSaveDisabled}
            startIcon={saving ? <CircularProgress size={20} color="inherit" /> : null}
          >
            {saving ? "Saving..." : "Save Prompts"}
          </Button>
        </div>
      </div>
      {/* Delete confirmation dialog */}
      <Dialog open={deleteIdx !== null} onClose={() => setDeleteIdx(null)}>
        <DialogTitle>Delete Prompt</DialogTitle>
        <DialogContent>
          Are you sure you want to delete this prompt?
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteIdx(null)} color="primary">
            Cancel
          </Button>
          <Button
            onClick={confirmDeletePrompt}
            color="error"
            variant="contained"
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Test Dialog (NUI react in MUI, no backdrop) */}
      <Dialog
        open={testDialog.open}
        onClose={closeTestDialog}
        hideBackdrop
        maxWidth="md"
        PaperProps={{
          style: { minWidth: 500, background: "#fff" }
        }}
      >
        <DialogTitle>
          Test Prompt
          <Button
            onClick={closeTestDialog}
            color="error"
            style={{ float: "right" }}
          >
            Close
          </Button>
        </DialogTitle>
        <DialogContent>
          {typeof testDialog.idx === "number" && (
            <div>
              {(testInputs[testDialog.idx] || []).map((input, row) => (
                <div className="row align-items-center mb-2" key={row}>
                  <div className="col">
                    <TextField
                      label="User Prompt"
                      value={input}
                      onChange={e => handleTestInputChange(testDialog.idx!, row, e.target.value)}
                      size="small"
                      fullWidth
                    />
                  </div>
                  <div className="col-auto">
                    <Button
                      variant="contained"
                      size="small"
                      onClick={() => handleTestPromptDialog(testDialog.idx!, row)}
                      disabled={typeof testDialog.idx === "number" ? testLoading[testDialog.idx]?.[row] : false}
                    >
                      {typeof testDialog.idx === "number" && testLoading[testDialog.idx]?.[row] ? "Testing..." : "Test"}
                    </Button>
                  </div>
                  {/* Optionally, show pass/fail status here in the future */}
                </div>
              ))}
              <Button
                variant="outlined"
                onClick={() => handleAddTestInput(testDialog.idx!)}
                sx={{ mt: 2 }}
              >
                Add Test Row
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Test Drawer */}
      <Drawer
        anchor="right"
        open={testDrawer.open}
        onClose={closeTestDrawer}
        hideBackdrop
        PaperProps={{
          sx: { width: 420, p: 2 }
        }}
      >
        <Box sx={{ p: 2, height: "100%", display: "flex", flexDirection: "column" }}>
          <Box display="flex" alignItems="center" justifyContent="space-between">
            <Typography variant="h6">Test Prompt</Typography>
            <Button onClick={closeTestDrawer} color="error">Close</Button>
          </Box>
          <Divider sx={{ my: 2 }} />
          <TextField
            label="User Input"
            value={testUserInput}
            onChange={e => setTestUserInput(e.target.value)}
            fullWidth
            multiline
            minRows={2}
            sx={{ mb: 2 }}
          />
          <Typography variant="subtitle2" sx={{ mb: 1 }}>Test Output (JSON)</Typography>
          <MonacoEditor
            height="120px"
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
          <Typography variant="subtitle2" sx={{ mt: 2, mb: 1 }}>Response JSON (from API)</Typography>
          <MonacoEditor
            height="120px"
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
          <Button
            variant="contained"
            color="primary"
            onClick={handleTestPrompt}
            disabled={testLoadingDrawer}
            sx={{ mt: 2 }}
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
      </Drawer>
    </form>
  );
};

export default PromptSection;
