import { useForm, Controller } from "react-hook-form";
import { joiResolver } from "@hookform/resolvers/joi";
import Joi from "joi";
import {
  Box, TextField, MenuItem, Slider, Button, InputLabel, Select, FormControl
} from "@mui/material";

const schema = Joi.object({
  model: Joi.string().required(),
  tokenSize: Joi.number().min(1).max(4096).required(),
  token: Joi.string().required(),
  fileSize: Joi.number().min(1).max(100).required(),
});

const models = [
  { label: "ChatGPT", value: "gpt-3.5-turbo" },
  { label: "DeepSeek", value: "deepseek" },
];

const ChatModelSettings = () => {
  const { control, handleSubmit, formState: { errors } } = useForm({
    resolver: joiResolver(schema),
    defaultValues: {
      model: "gpt-3.5-turbo",
      tokenSize: 512,
      fileSize: 10,
    },
  });

  const onSubmit = (data: any) => {
    // Save settings logic here
    alert(JSON.stringify(data, null, 2));
  };

  return (
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
          <InputLabel>File Upload Max Size (MB)</InputLabel>
          <Controller
            name="fileSize"
            control={control}
            render={({ field }) => (
              <Slider
                {...field}
                valueLabelDisplay="auto"
                min={1}
                max={100}
                marks
                sx={{ mt: 2 }}
              />
            )}
          />
        </Box>
        <Button type="submit" variant="contained" color="primary">
          Save Settings
        </Button>
      </Box>
    </form>
  );
};

export default ChatModelSettings;