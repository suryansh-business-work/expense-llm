import React from "react";
import {
  Dialog, DialogTitle, DialogContent, DialogActions, Button,
  TextField, Box, MenuItem, IconButton
} from "@mui/material";
import { useForm, Controller } from "react-hook-form";
import CloseIcon from "@mui/icons-material/Close";

const categories = [
  { value: "finance", label: "Finance" },
  { value: "daily-life", label: "Daily Life" },
  { value: "professional", label: "Professional" },
  { value: "education", label: "Education" },
  { value: "health", label: "Health & Fitness" },
  { value: "travel", label: "Travel" },
  { value: "productivity", label: "Productivity" },
  { value: "entertainment", label: "Entertainment" },
  { value: "shopping", label: "Shopping" },
  { value: "food", label: "Food & Cooking" },
  { value: "news", label: "News & Media" },
  { value: "sports", label: "Sports" },
  { value: "weather", label: "Weather" },
  { value: "utilities", label: "Utilities" },
  { value: "communication", label: "Communication" },
  { value: "games", label: "Games" },
  { value: "music", label: "Music" },
  { value: "art", label: "Art & Design" },
  { value: "science", label: "Science" },
  { value: "history", label: "History" },
  { value: "language", label: "Language Learning" },
  { value: "kids", label: "Kids" },
  { value: "parenting", label: "Parenting" },
  { value: "business", label: "Business" },
  { value: "marketing", label: "Marketing" },
  { value: "legal", label: "Legal" },
  { value: "real-estate", label: "Real Estate" },
  { value: "finance-planning", label: "Financial Planning" },
  { value: "mental-health", label: "Mental Health" },
  { value: "career", label: "Career" },
  { value: "other", label: "Other" },
];

const defaultValues = {
  name: "",
  description: "",
  category: "other",
};

const CreateBotDialog: React.FC<{ open: boolean; onClose: () => void; onSubmit: (data: any) => void }> = ({
  open, onClose, onSubmit
}) => {
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm({
    defaultValues,
    mode: "onTouched",
  });

  const handleDialogClose = () => {
    reset(defaultValues);
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleDialogClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        Create Bot
        <IconButton
          aria-label="close"
          onClick={handleDialogClose}
          sx={{ position: "absolute", right: 8, top: 8 }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent dividers>
        <Box display="flex" flexDirection="column" gap={2} mt={1}>
          <Controller
            name="name"
            control={control}
            rules={{ required: "Bot Name is required" }}
            render={({ field }) => (
              <TextField
                {...field}
                label="Bot Name *"
                error={!!errors.name}
                helperText={errors.name?.message as string}
                fullWidth
              />
            )}
          />
          <Controller
            name="description"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label="Bot Description"
                fullWidth
                multiline
                minRows={2}
              />
            )}
          />
          <Controller
            name="category"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                select
                label="Bot Category"
                fullWidth
              >
                {categories.map((cat) => (
                  <MenuItem key={cat.value} value={cat.value}>{cat.label}</MenuItem>
                ))}
              </TextField>
            )}
          />
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleDialogClose}>Cancel</Button>
        <Button
          onClick={handleSubmit((data) => {
            onSubmit(data);
            reset(defaultValues);
            onClose();
          })}
          variant="contained"
        >
          Create Bot
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CreateBotDialog;