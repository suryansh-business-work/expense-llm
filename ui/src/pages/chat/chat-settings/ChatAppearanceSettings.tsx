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
} from "@mui/material";

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
  const { control, handleSubmit, formState: { errors } } = useForm({
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

  const onSubmit = (data: any) => {
    alert(JSON.stringify(data, null, 2));
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div className="row">
        <div className="col-md-7 mb-3">
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
            <Button type="submit" variant="contained" color="primary">
              Save Appearance
            </Button>
          </Box>
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
    </form>
  );
};

export default ChatAppearanceSettings;