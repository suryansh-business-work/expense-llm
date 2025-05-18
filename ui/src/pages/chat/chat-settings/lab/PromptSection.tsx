import { Typography, TextField, Button } from "@mui/material";
import { useForm, Controller } from "react-hook-form";
import { joiResolver } from "@hookform/resolvers/joi";
import Joi from "joi";

const promptSchema = Joi.object({
  prompt: Joi.string().min(5).required().label("Prompt"),
});

const PromptSection = () => {
  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    resolver: joiResolver(promptSchema),
    defaultValues: { prompt: "" },
  });

  const handlePromptSave = (data: any) => {
    alert("Prompt Saved:\n" + data.prompt);
    reset();
  };

  return (
    <form onSubmit={handleSubmit(handlePromptSave)}>
      <Typography variant="h6" gutterBottom>
        Manage Prompt
      </Typography>
      <Controller
        name="prompt"
        control={control}
        render={({ field }) => (
          <TextField
            {...field}
            label="Prompt"
            multiline
            minRows={4}
            fullWidth
            error={!!errors.prompt}
            helperText={errors.prompt?.message as string}
            sx={{ mb: 3 }}
          />
        )}
      />
      <Button type="submit" variant="contained">
        Save Prompt
      </Button>
    </form>
  );
};

export default PromptSection;