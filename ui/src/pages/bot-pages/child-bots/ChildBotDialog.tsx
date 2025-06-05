import { useEffect, useRef, useState } from "react";
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
import { useForm, Controller } from "react-hook-form";
import Joi from "joi";
import { joiResolver } from "@hookform/resolvers/joi";

const schema = Joi.object({
  name: Joi.string().min(2).max(50).required().label("Bot Name"),
  description: Joi.string().max(200).allow("").label("Description"),
  tags: Joi.array().items(Joi.string().max(20)).label("Tags"),
  category: Joi.string().max(50).allow("").label("Category"),
});

interface ChildBotDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmitSuccess: (bot: any) => void;
  type: string;
  mode: "create" | "update";
  bot?: any;
}

export default function ChildBotDialog({
  open,
  onClose,
  onSubmitSuccess,
  type,
  mode,
  bot,
}: ChildBotDialogProps) {
  const [loading, setLoading] = useState(false);
  const [tagInput, setTagInput] = useState("");
  const tagInputRef = useRef<HTMLInputElement>(null);

  const {
    control,
    handleSubmit,
    setValue,
    getValues,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: joiResolver(schema),
    defaultValues: {
      name: "",
      description: "",
      tags: [] as string[],
      category: "",
    },
  });

  useEffect(() => {
    if (mode === "update" && bot) {
      setValue("name", bot.name || bot.bot?.name || "");
      setValue("description", bot.description || bot.bot?.description || "");
      setValue("tags", bot.tags || bot.bot?.tags || []);
      setValue("category", bot.category || bot.bot?.category || "");
    } else {
      reset();
    }
    setTagInput("");
    // eslint-disable-next-line
  }, [bot, open, mode]);

  const handleAddTag = () => {
    const value = tagInput.trim();
    if (value && !(getValues("tags") || []).includes(value)) {
      setValue("tags", [...(getValues("tags") || []), value]);
      setTagInput("");
      if (tagInputRef.current) tagInputRef.current.value = "";
    }
  };

  const handleTagInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAddTag();
    }
  };

  const handleDeleteTag = (tagToDelete: string) => {
    setValue(
      "tags",
      (getValues("tags") || []).filter((tag: string) => tag !== tagToDelete)
    );
  };

  const onSubmit = async (data: any) => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      let url = "";
      let method: "POST" | "PATCH" = "POST";
      let payload: any = { ...data, type };

      if (mode === "create") {
        url = "http://localhost:3000/bot/create/child-bot";
        method = "POST";
      } else {
        const botId = bot.botId || bot.id;
        url = `http://localhost:3000/bot/update/child-bot/${botId}`;
        method = "PATCH";
      }

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: token ? `Bearer ${token}` : "",
        },
        body: JSON.stringify(payload),
        credentials: "include",
      });
      const result = await res.json();
      if (res.ok && result.status === "success") {
        onSubmitSuccess(result.data.bot || { ...bot, ...data });
        reset();
        onClose();
      } else {
        alert(result.message || `Failed to ${mode === "create" ? "create" : "update"} bot`);
      }
    } catch (err) {
      alert("Network error");
    }
    setLoading(false);
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>
        {mode === "create" ? "Create a New Bot" : "Update Bot"}
      </DialogTitle>
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
                        color="primary"
                        size="small"
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
                onKeyDown={handleTagInputKeyDown}
                size="small"
                sx={{ flex: 1 }}
                inputRef={tagInputRef}
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
          <Button onClick={onClose} disabled={loading || isSubmitting}>Cancel</Button>
          <Button type="submit" variant="contained" color="primary" disabled={loading || isSubmitting}>
            {loading || isSubmitting
              ? mode === "create"
                ? "Creating..."
                : "Saving..."
              : mode === "create"
              ? "Create"
              : "Save"}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}