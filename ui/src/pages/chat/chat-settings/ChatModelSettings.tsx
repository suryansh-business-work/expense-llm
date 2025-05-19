import { useForm, Controller } from "react-hook-form";
import { joiResolver } from "@hookform/resolvers/joi";
import Joi from "joi";
import {
  Box, TextField, MenuItem, Slider, Button, InputLabel, Select, FormControl, Typography, Snackbar, Alert, Skeleton, CircularProgress
} from "@mui/material";
import { useParams } from "react-router-dom";
import axios from "axios";
import { useEffect, useState } from "react";
import API_LIST from "../../apiList"; // <-- Add this import at the top (adjust path if needed)

const schema = Joi.object({
  model: Joi.string().required(),
  tokenSize: Joi.number().min(1).max(4096).required(),
  fileSize: Joi.number().min(1).max(100).required(),
});

const models = [
  { label: "ChatGPT", value: "gpt-3.5-turbo" },
  { label: "DeepSeek", value: "deepseek" },
];

const modelMeta = {
  "gpt-3.5-turbo": {
    modelName: "gpt-3.5-turbo",
    modelType: "chat",
    modelDescription: "GPT-3.5 Turbo is a variant of the GPT-3 model that is optimized for chat-based applications.",
    modelVersion: {
      version: "v1",
      description: "The latest version of the GPT-3.5 Turbo model.",
      date: "2023-10-01",
      releaseNotes: {
        url: "https://platform.openai.com/docs/guides/gpt/release-notes",
        description: "Release notes for the latest version of the GPT-3.5 Turbo model.",
        label: "Release Notes",
        labelDescription: "Label for the link to the release notes for the latest version of the GPT-3.5 Turbo model.",
        labelDate: "2023-10-01"
      }
    }
  },
  "deepseek": {
    modelName: "deepseek",
    modelType: "chat",
    modelDescription: "DeepSeek is a powerful AI model for advanced chat and search.",
    modelVersion: {
      version: "v1",
      description: "The latest version of the DeepSeek model.",
      date: "2023-10-01",
      releaseNotes: {
        url: "https://deepseek.com/release-notes",
        description: "Release notes for the latest version of DeepSeek.",
        label: "Release Notes",
        labelDescription: "Label for the link to the release notes for DeepSeek.",
        labelDate: "2023-10-01"
      }
    }
  }
};

type ModelKey = keyof typeof modelMeta;

interface FormData {
  model: ModelKey;
  tokenSize: number;
  fileSize: number;
}

const ChatModelSettings = () => {
  const { chatBotId } = useParams<{ chatBotId: string }>();
  const { control, handleSubmit, formState: { errors }, watch, reset } = useForm<FormData>({
    resolver: joiResolver(schema),
    defaultValues: {
      model: "gpt-3.5-turbo",
      tokenSize: 512,
      fileSize: 10,
    },
  });

  const fileSize = watch("fileSize");
  const token = localStorage.getItem("token");

  // Snackbar state
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: "success" | "error" }>({
    open: false,
    message: "",
    severity: "success",
  });

  // Store only the modelSetting object
  const [, setModelSettings] = useState<any>(null);

  // Loader states
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Fetch modelSetting on load
  useEffect(() => {
    const fetchSettings = async () => {
      if (!chatBotId) return;
      setLoading(true);
      try {
        const res = await axios.get(
          API_LIST.GET_CHAT_SETTING(chatBotId), // <-- Use API_LIST here
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );
        const modelSetting = res?.data?.data?.setting?.modelSetting;
        setModelSettings(modelSetting); // Save only modelSetting
        if (modelSetting) {
          reset({
            model: modelSetting.model,
            tokenSize: modelSetting.maxTokens,
            fileSize: modelSetting.fileUpload?.maxSize,
          });
        }
      } catch (err: any) {
        setSnackbar({ open: true, message: "Failed to load settings", severity: "error" });
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
    // eslint-disable-next-line
  }, [chatBotId]);

  const onSubmit = async (data: FormData) => {
    if (!chatBotId) {
      setSnackbar({ open: true, message: "ChatBot ID not found in URL!", severity: "error" });
      return;
    }
    const meta = modelMeta[data.model];
    const payload = {
      modelSetting: {
        model: data.model,
        modelName: meta.modelName,
        modelType: meta.modelType,
        modelDescription: meta.modelDescription,
        modelVersion: meta.modelVersion,
        maxTokens: data.tokenSize,
        fileUpload: {
          maxSize: data.fileSize,
          unit: "MB",
          valueInBytes: data.fileSize * 1024 * 1024,
        }
      }
    };
    setSaving(true);
    try {
      await axios.patch(
        API_LIST.UPDATE_CHAT_SETTING(chatBotId), // <-- Use API_LIST here
        payload,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setModelSettings(payload.modelSetting); // Update local state
      setSnackbar({ open: true, message: "Settings updated successfully!", severity: "success" });
    } catch (err: any) {
      setSnackbar({
        open: true,
        message: "Failed to update settings: " + (err?.response?.data?.message || err.message),
        severity: "error"
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      {loading ? (
        <Box display="flex" flexDirection="column" gap={3}>
          <Skeleton variant="rectangular" height={56} />
          <Skeleton variant="rectangular" height={56} />
          <Skeleton variant="rectangular" height={56} />
          <Skeleton variant="rectangular" height={40} width={120} sx={{ mt: 2 }} />
        </Box>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)}>
          <Box display="flex" flexDirection="column" gap={3}>
            <FormControl fullWidth>
              <InputLabel>AI Model</InputLabel>
              <Controller
                name="model"
                control={control}
                render={({ field }) => (
                  <Select {...field} label="AI Model" error={!!errors.model}>
                    {models.map((m) => (
                      <MenuItem key={m.value} value={m.value}>{m.label}</MenuItem>
                    ))}
                  </Select>
                )}
              />
            </FormControl>
            <Controller
              name="tokenSize"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Message Token Size"
                  type="number"
                  error={!!errors.tokenSize}
                  helperText={errors.tokenSize?.message as string}
                  fullWidth
                />
              )}
            />
            <Box>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                <InputLabel>File Upload Max Size</InputLabel>
                <Typography variant="body2" color="text.secondary">
                  {fileSize} MB
                </Typography>
              </Box>
              <Controller
                name="fileSize"
                control={control}
                render={({ field }) => (
                  <Slider
                    {...field}
                    value={field.value || 1}
                    valueLabelDisplay="on"
                    min={1}
                    max={100}
                    sx={{ mt: 2 }}
                  />
                )}
              />
            </Box>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              disabled={saving}
              startIcon={saving ? <CircularProgress size={20} color="inherit" /> : null}
            >
              {saving ? "Saving..." : "Save Settings"}
            </Button>
          </Box>
        </form>
      )}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar(s => ({ ...s, open: false }))}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert
          onClose={() => setSnackbar(s => ({ ...s, open: false }))}
          severity={snackbar.severity}
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
};

export default ChatModelSettings;