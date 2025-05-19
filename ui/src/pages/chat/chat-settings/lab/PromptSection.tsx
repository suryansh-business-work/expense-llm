import {
  Typography,
  TextField,
  Button,
  IconButton,
  Box,
  Snackbar,
  Alert,
  Skeleton,
  CircularProgress
} from "@mui/material";
import { Add, Delete } from "@mui/icons-material";
import { useForm, Controller, useFieldArray } from "react-hook-form";
import { joiResolver } from "@hookform/resolvers/joi";
import Joi from "joi";
import { useParams } from "react-router-dom";
import axios from "axios";
import { useEffect, useState } from "react";
import API_LIST from "../../../apiList";

const promptSchema = Joi.object({
  prompt: Joi.array()
    .items(
      Joi.object({
        name: Joi.string().min(1).required().label("Name"),
        prompt: Joi.string().min(5).required().label("Prompt"),
      })
    )
    .min(1)
    .required(),
});

const defaultPrompt = { name: "", prompt: "" };

const PromptSection = () => {
  const { chatBotId } = useParams<{ chatBotId: string }>();
  const token = localStorage.getItem("token");

  const {
    control,
    handleSubmit,
    formState: { errors, isDirty },
    reset,
  } = useForm({
    resolver: joiResolver(promptSchema),
    defaultValues: { prompt: [defaultPrompt] },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "prompt",
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: "success" | "error" }>({
    open: false,
    message: "",
    severity: "success",
  });

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
          // Remove _id from each prompt
          prompts = prompts.map(({ name, prompt }) => ({ name, prompt }));
          reset({ prompt: prompts });
        } else {
          reset({ prompt: [defaultPrompt] });
        }
      } catch (err: any) {
        setSnackbar({ open: true, message: "Failed to load prompts", severity: "error" });
        reset({ prompt: [defaultPrompt] });
      } finally {
        setLoading(false);
      }
    };
    fetchPrompts();
    // eslint-disable-next-line
  }, [chatBotId]);

  const onSubmit = async (data: any) => {
    if (!chatBotId) {
      setSnackbar({ open: true, message: "ChatBot ID not found in URL!", severity: "error" });
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
      setSnackbar({ open: true, message: "Prompts saved successfully!", severity: "success" });
      reset(data); // <-- This resets the dirty state after save
    } catch (err: any) {
      setSnackbar({
        open: true,
        message: "Failed to save prompts: " + (err?.response?.data?.message || err.message),
        severity: "error"
      });
    } finally {
      setSaving(false);
    }
  };

  const onError = (errors: any) => {
    // You can log or handle errors here for debugging
    console.log("Validation errors:", errors);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit, onError)}>
      <Typography variant="h6" gutterBottom>
        Manage Prompts
      </Typography>
      {loading ? (
        <Box display="flex" flexDirection="column" gap={2} className="mb-3">
          <Skeleton variant="rectangular" height={56} />
          <Skeleton variant="rectangular" height={56} />
        </Box>
      ) : (
        <div className="container-fluid">
          {fields.map((item, idx) => (
            <div className="row mb-2" key={item.id}>
              <div className="col-md-3 col-12 mb-2 mb-md-0">
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
              <div className="col-md-7 col-12 mb-2 mb-md-0">
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
              <div className="col-md-2 col-12 d-flex align-items-start">
                <IconButton
                  aria-label="delete"
                  color="error"
                  onClick={() => remove(idx)}
                  disabled={fields.length === 1}
                  sx={{ mt: 1 }}
                >
                  <Delete />
                </IconButton>
              </div>
            </div>
          ))}
          <div className="row mb-3">
            <div className="col-12">
              <Button
                variant="outlined"
                startIcon={<Add />}
                onClick={() => append(defaultPrompt)}
                sx={{ mb: 2 }}
              >
                Add Prompt
              </Button>
            </div>
          </div>
        </div>
      )}
      <div className="row">
        <div className="col-12">
          <Button
            type="submit"
            variant="contained"
            disabled={saving || loading || !isDirty}
            startIcon={saving ? <CircularProgress size={20} color="inherit" /> : null}
          >
            {saving ? "Saving..." : "Save Prompts"}
          </Button>
        </div>
      </div>
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
    </form>
  );
};

export default PromptSection;