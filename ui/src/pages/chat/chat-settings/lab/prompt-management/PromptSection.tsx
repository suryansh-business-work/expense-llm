import {
  Typography,
  Button,
  Box,
  Skeleton,
  CircularProgress
} from "@mui/material";
import { Add } from "@mui/icons-material";
import { useForm, useFieldArray, useWatch } from "react-hook-form";
import { joiResolver } from "@hookform/resolvers/joi";
import Joi from "joi";
import { useParams } from "react-router-dom";
import axios from "axios";
import { useEffect, useState, useMemo } from "react";
import API_LIST from "../../../../apiList";
import { useDynamicSnackbar } from "../../../../../hooks/useDynamicSnackbar";
import { encode } from "gpt-tokenizer";

// Split components
import PromptAccordionList from "./PromptAccordionList";
import PromptDeleteDialog from "./PromptDeleteDialog";
import PromptTestDrawer from "./PromptTestDrawer";

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
    formState: { errors },
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
      setTimeout(() => {
        const updated = promptValues.filter((_: any, i: number) => i !== deleteIdx);
        const idx = updated.findIndex((p: any) => p.isUseForChat);
        setExpanded(idx !== -1 ? idx : 0);
      }, 0);
    }
  };

  // Drawer helpers
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
  const getDrawerPromptName = () => {
    if (typeof testDrawer.idx === "number" && promptValues?.[testDrawer.idx]) {
      return promptValues[testDrawer.idx].name || `Prompt ${testDrawer.idx + 1}`;
    }
    return "";
  };

  // Test API call and compare output
  const handleTestPrompt = async () => {
    if (testDrawer.idx === null) return;
    setTestLoadingDrawer(true);
    setTestResult(null);
    setApiOutput("");
    try {
      const prompt = promptValues?.[testDrawer.idx]?.prompt || "";
      const token = localStorage.getItem("token");
      const resp = await axios.post(
        "http://localhost:3000/chat-gpt/prompt",
        { userInput: prompt + "\n" + testUserInput },
        {
          headers:
          {
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
    <div className="mb-3">
      <form onSubmit={handleSubmit(onSubmit, onError)}>
        <Typography variant="h5" gutterBottom>
          Manage Prompts
        </Typography>
        <Typography
          variant="subtitle1"
          sx={{
            mb: 2,
            color: "#6c757d",
            display: "flex",
            alignItems: "center",
            gap: 1,
            fontWeight: 400,
            fontSize: 16,
            background: "#f5faff",
            borderRadius: 1,
            px: 2,
            py: 1,
            textTransform: "none", // ensure normal case
          }}
        >
          <span style={{ color: "#1976d2", marginRight: 8, display: "flex", alignItems: "center" }}>
            <i className="fa fa-info-circle" style={{ fontSize: 20, marginRight: 6 }} />
          </span>
          If you do not enable this, the chat will use default chatgpt behavior. enable and customize a prompt here to make the assistant interpret user input and call functions as you define—this acts as the system prompt for your bot's advanced logic.
        </Typography>
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
        {loading ? (
          <Box display="flex" flexDirection="column" gap={2} className="mb-3">
            <Skeleton variant="rectangular" height={56} />
            <Skeleton variant="rectangular" height={56} />
          </Box>
        ) : (
          <PromptAccordionList
            fields={fields}
            expanded={expanded}
            onAccordionChange={handleAccordionChange}
            control={control}
            errors={errors}
            outputJsonErrors={outputJsonErrors}
            promptValues={promptValues}
            tokenSizes={tokenSizes}
            handleSelectPrompt={handleSelectPrompt}
            handleDeletePrompt={handleDeletePrompt}
            openTestDrawer={openTestDrawer}
          />
        )}
        <PromptDeleteDialog
          open={deleteIdx !== null}
          onCancel={() => setDeleteIdx(null)}
          onConfirm={confirmDeletePrompt}
        />
        <PromptTestDrawer
          open={testDrawer.open}
          onClose={closeTestDrawer}
          getDrawerPromptName={getDrawerPromptName}
          promptValues={promptValues}
          testDrawer={testDrawer}
          testUserInput={testUserInput}
          setTestUserInput={setTestUserInput}
          testOutput={testOutput}
          setTestOutput={setTestOutput}
          testLoadingDrawer={testLoadingDrawer}
          handleTestPrompt={handleTestPrompt}
          testResult={testResult}
          apiOutput={apiOutput}
        />
        <Button
          type="submit"
          variant="contained"
          disabled={
            (
              (
                saving ||
                loading ||
                Object.keys(errors.prompt || {}).length > 0 ||
                Object.keys(outputJsonErrors).length > 0
              )
              // || (!isDirty && !isOnlyUseForChatDirty)
            )
          }
          startIcon={saving ? <CircularProgress size={20} color="inherit" /> : null}
          sx={{ mb: 2 }}
        >
          {saving ? "Saving..." : "Save Prompts"}
        </Button>
      </form>
    </div>
  );
};

export default PromptSection;
