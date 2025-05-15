import { useForm, Controller } from "react-hook-form";
import { joiResolver } from "@hookform/resolvers/joi";
import Joi from "joi";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Chip,
  Box,
  Stack,
  Typography,
} from "@mui/material";
import { useState } from "react";

const schema = Joi.object({
  name: Joi.string().min(2).max(50).required().label("Bot Name"),
  description: Joi.string().max(200).allow("").label("Description"),
  tags: Joi.array().items(Joi.string().max(20)).label("Tags"),
  category: Joi.string().max(50).allow("").label("Category"), // not required
});

interface CreateChildBotDialogProps {
  open: boolean;
  onClose: () => void;
  onCreated: (bot: any) => void;
  type: string; // from url param
}

export default function CreateChildBotDialog({ open, onClose, onCreated, type }: CreateChildBotDialogProps) {
  const [loading, setLoading] = useState(false);
  const {
    control,
    handleSubmit,
    reset,
    setValue,
    getValues,
    formState: { errors },
  } = useForm({
    resolver: joiResolver(schema),
    defaultValues: {
      name: "",
      description: "",
      tags: [] as string[],
      category: "",
    },
  });

  const [tagInput, setTagInput] = useState("");

  const handleAddTag = () => {
    const tags = getValues("tags") || [];
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setValue("tags", [...tags, tagInput.trim()]);
      setTagInput("");
    }
  };

  const handleDeleteTag = (tagToDelete: string) => {
    const tags = getValues("tags") || [];
    setValue("tags", tags.filter((tag) => tag !== tagToDelete));
  };

  const onSubmit = async (data: any) => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("http://localhost:3000/bot/create/child-bot", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: token ? `Bearer ${token}` : "",
        },
        body: JSON.stringify({ ...data, type }),
        credentials: "include",
      });
      const result = await res.json();
      if (res.ok && result.status === "success") {
        onCreated(result.data.bot);
        reset();
        onClose();
      } else {
        alert(result.message || "Failed to create bot");
      }
    } catch (err) {
      alert("Network error");
    }
    setLoading(false);
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Create a New Bot</DialogTitle>
      <form onSubmit={handleSubmit(onSubmit)} autoComplete="off">
        <DialogContent>
          <Controller
            name="name"
            control={control}
            render={({ field }) => (
              <TextField
                label="Bot Name"
                fullWidth
                margin="dense"
                {...field}
                error={!!errors.name}
                helperText={errors.name?.message as string}
                autoFocus
              />
            )}
          />
          <Controller
            name="description"
            control={control}
            render={({ field }) => (
              <TextField
                label="Description"
                fullWidth
                margin="dense"
                {...field}
                error={!!errors.description}
                helperText={errors.description?.message as string}
              />
            )}
          />
          <Controller
            name="category"
            control={control}
            render={({ field }) => (
              <TextField
                label="Category"
                fullWidth
                margin="dense"
                {...field}
                error={!!errors.category}
                helperText={errors.category?.message as string}
              />
            )}
          />
          <Box mt={2}>
            <Typography variant="subtitle2" sx={{ mb: 1 }}>
              Tags
            </Typography>
            <Stack direction="row" spacing={1} sx={{ flexWrap: "wrap", mb: 1 }}>
              <Controller
                name="tags"
                control={control}
                render={({ field }) => (
                  <>
                    {(field.value || []).map((tag: string) => (
                      <Chip
                        key={tag}
                        label={tag}
                        onDelete={() => handleDeleteTag(tag)}
                        sx={{ mb: 0.5 }}
                      />
                    ))}
                  </>
                )}
              />
            </Stack>
            <Box display="flex" gap={1}>
              <TextField
                label="Add Tag"
                value={tagInput}
                onChange={e => setTagInput(e.target.value)}
                onKeyDown={e => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleAddTag();
                  }
                }}
                size="small"
                sx={{ flex: 1 }}
              />
              <Button variant="outlined" onClick={handleAddTag} disabled={!tagInput.trim()}>
                Add
              </Button>
            </Box>
            {errors.tags && (
              <Typography color="error" variant="caption">
                {errors.tags.message as string}
              </Typography>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose} disabled={loading}>Cancel</Button>
          <Button type="submit" variant="contained" color="primary" disabled={loading}>
            {loading ? "Creating..." : "Create"}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}