import { useForm, Controller, useWatch } from "react-hook-form";
import { joiResolver } from "@hookform/resolvers/joi";
import Joi from "joi";
import {
  Box,
  MenuItem,
  Button,
  InputLabel,
  Select,
  FormControl,
  TextField,
  Typography,
  Paper,
  Snackbar,
  Alert,
  Skeleton,
  CircularProgress,
} from "@mui/material";
import { useParams } from "react-router-dom";
import axios from "axios";
import { useEffect, useState } from "react";
import API_LIST from "../../apiList";

const schema = Joi.object({
  font: Joi.string().required(),
  background: Joi.string().required(),
  botBg: Joi.string().required(),
  botColor: Joi.string().required(),
  userBg: Joi.string().required(),
  userColor: Joi.string().required(),
});

const fonts = ["Roboto", "Arial", "Courier New", "Georgia"];

const ChatAppearanceSettings = () => {
  const { chatBotId } = useParams<{ chatBotId: string }>();
  const { control, handleSubmit, formState: { errors }, reset } = useForm({
    resolver: joiResolver(schema),
    defaultValues: {
      font: "Roboto",
      background: "#f5f7fa",
      botBg: "#e3f2fd",
      botColor: "#1976d2",
      userBg: "#fff",
      userColor: "#222",
    },
  });

  // Watch for live preview
  const font = useWatch({ control, name: "font" });
  const background = useWatch({ control, name: "background" });
  const botBg = useWatch({ control, name: "botBg" });
  const botColor = useWatch({ control, name: "botColor" });
  const userBg = useWatch({ control, name: "userBg" });
  const userColor = useWatch({ control, name: "userColor" });

  const token = localStorage.getItem("token");
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: "success" | "error" }>({
    open: false,
    message: "",
    severity: "success",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Fetch appearance settings on load
  useEffect(() => {
    const fetchSettings = async () => {
      if (!chatBotId) return;
      setLoading(true);
      try {
        const res = await axios.get(
          API_LIST.GET_CHAT_SETTING(chatBotId),
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );
        const appearance = res?.data?.data?.setting?.appearance;
        if (appearance) {
          reset({
            font: appearance.font || "Roboto",
            background: appearance.chatBackground || "#f5f7fa",
            botBg: appearance.bot?.bubble?.background || "#e3f2fd",
            botColor: appearance.bot?.bubble?.textColor || "#1976d2",
            userBg: appearance.user?.bubble?.background || "#fff",
            userColor: appearance.user?.bubble?.textColor || "#222",
          });
        }
      } catch (err: any) {
        setSnackbar({ open: true, message: "Failed to load appearance settings", severity: "error" });
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
    // eslint-disable-next-line
  }, [chatBotId]);

  const onSubmit = async (data: any) => {
    if (!chatBotId) {
      setSnackbar({ open: true, message: "ChatBot ID not found in URL!", severity: "error" });
      return;
    }
    const payload = {
      appearance: {
        font: data.font,
        chatBackground: data.background,
        bot: {
          bubble: {
            background: data.botBg,
            textColor: data.botColor,
            borderRadius: "10px",
            borderWidth: "1px",
            borderColor: "#e0e0e0",
          },
          avatar: {
            url: "",
            shape: "circle",
            size: "50px",
          },
        },
        user: {
          bubble: {
            background: data.userBg,
            textColor: data.userColor,
            borderRadius: "10px",
            borderWidth: "1px",
            borderColor: "#e0e0e0",
          },
          avatar: {
            url: "",
            shape: "circle",
            size: "50px",
          },
        },
      },
    };
    setSaving(true);
    try {
      await axios.patch(
        API_LIST.UPDATE_CHAT_SETTING(chatBotId),
        payload,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setSnackbar({ open: true, message: "Appearance updated successfully!", severity: "success" });
    } catch (err: any) {
      setSnackbar({
        open: true,
        message: "Failed to update appearance: " + (err?.response?.data?.message || err.message),
        severity: "error"
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div className="row">
        <div className="col-md-7 mb-3">
          {loading ? (
            <Box display="flex" flexDirection="column" gap={3}>
              <Skeleton variant="rectangular" height={56} />
              <Skeleton variant="rectangular" height={56} />
              <Skeleton variant="rectangular" height={56} />
              <Skeleton variant="rectangular" height={40} width={120} sx={{ mt: 2 }} />
            </Box>
          ) : (
            <Box display="flex" flexDirection="column" gap={3}>
              <FormControl fullWidth>
                <InputLabel>Font</InputLabel>
                <Controller
                  name="font"
                  control={control}
                  render={({ field }) => (
                    <Select {...field} label="Font" error={!!errors.font}>
                      {fonts.map((font) => (
                        <MenuItem key={font} value={font}>{font}</MenuItem>
                      ))}
                    </Select>
                  )}
                />
              </FormControl>
              <Box display="flex" gap={2} flexWrap="wrap">
                <Controller
                  name="background"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Chat Background"
                      type="color"
                      sx={{ width: 180 }}
                      InputLabelProps={{ shrink: true }}
                    />
                  )}
                />
                <Controller
                  name="botBg"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Bot Bubble Background"
                      type="color"
                      sx={{ width: 180 }}
                      InputLabelProps={{ shrink: true }}
                    />
                  )}
                />
                <Controller
                  name="botColor"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Bot Bubble Text"
                      type="color"
                      sx={{ width: 180 }}
                      InputLabelProps={{ shrink: true }}
                    />
                  )}
                />
                <Controller
                  name="userBg"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="User Bubble Background"
                      type="color"
                      sx={{ width: 180 }}
                      InputLabelProps={{ shrink: true }}
                    />
                  )}
                />
                <Controller
                  name="userColor"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="User Bubble Text"
                      type="color"
                      sx={{ width: 180 }}
                      InputLabelProps={{ shrink: true }}
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
                {saving ? "Saving..." : "Save Appearance"}
              </Button>
            </Box>
          )}
        </div>
        <div className="col-md-5 mb-3">
          <Typography variant="subtitle2" sx={{ mb: 1 }}>
            Chat Preview
          </Typography>
          <Paper
            elevation={3}
            sx={{
              p: 2,
              minHeight: 220,
              background: background,
              borderRadius: 2,
              fontFamily: font,
              transition: "all 0.2s",
            }}
          >
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                gap: 2,
                alignItems: "flex-start",
              }}
            >
              <Box
                sx={{
                  background: botBg,
                  color: botColor,
                  px: 2,
                  py: 1,
                  borderRadius: 2,
                  maxWidth: "80%",
                  fontFamily: font,
                  fontSize: 16,
                  boxShadow: 1,
                  transition: "all 0.2s",
                }}
              >
                Hello! How can I help you today?
              </Box>
              <Box
                sx={{
                  background: userBg,
                  color: userColor,
                  px: 2,
                  py: 1,
                  borderRadius: 2,
                  maxWidth: "80%",
                  alignSelf: "flex-end",
                  fontFamily: font,
                  fontSize: 16,
                  boxShadow: 1,
                  border: "1px solid #e0e0e0",
                  transition: "all 0.2s",
                }}
              >
                I want to know about your features.
              </Box>
            </Box>
          </Paper>
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

export default ChatAppearanceSettings;