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
} from "@mui/material";
import { useForm, Controller } from "react-hook-form";
import Joi from "joi";
import { joiResolver } from "@hookform/resolvers/joi";

interface UpdateChildBotDialogProps {
  open: boolean;
  onClose: () => void;
  bot: any;
  onUpdated: (updatedBot: any) => void;
  type: string;
}

const schema = Joi.object({
  name: Joi.string().trim().required().label("Manage Name"),
  description: Joi.string().allow("").label("Description"),
  tags: Joi.array().items(Joi.string()).label("Tags"),
  category: Joi.string().allow("").label("Category"), // not required
});

const UpdateChildBotDialog = ({
  open,
  onClose,
  bot,
  onUpdated,
  type,
}: UpdateChildBotDialogProps) => {
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

  const [tagInput, setTagInput] = useState("");
  const tagInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (bot) {
      setValue("name", bot.name || bot.bot?.name || "");
      setValue("description", bot.description || bot.bot?.description || "");
      setValue("tags", bot.tags || bot.bot?.tags || []);
      setValue("category", bot.category || bot.bot?.category || "");
    } else {
      reset();
    }
    setTagInput("");
    // eslint-disable-next-line
  }, [bot, open]);

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
    try {
      const token = localStorage.getItem("token");
      const botId = bot.botId || bot.id;
      // Only send category if filled
      const payload: any = {
        name: data.name,
        type,
        description: data.description,
        tags: data.tags,
      };
      if (data.category) payload.category = data.category;

      const res = await fetch(
        `http://localhost:3000/bot/update/child-bot/${botId}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: token ? `Bearer ${token}` : "",
          },
          body: JSON.stringify(payload),
        }
      );
      const result = await res.json();
      if (res.ok && result.status === "success") {
        onUpdated(result.data.bot || { ...bot, ...data });
        onClose();
      } else {
        alert(result.message || "Failed to update bot.");
      }
    } catch {
      alert("Failed to update bot.");
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle>Update Bot</DialogTitle>
      <form onSubmit={handleSubmit(onSubmit)} autoComplete="off">
        <DialogContent>
          <Controller
            name="name"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                autoFocus
                margin="dense"
                label="Manage Name"
                fullWidth
                required
                error={!!errors.name}
                helperText={errors.name?.message?.toString()}
              />
            )}
          />
          <Controller
            name="description"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                margin="dense"
                label="Description"
                fullWidth
                error={!!errors.description}
                helperText={errors.description?.message?.toString()}
              />
            )}
          />
          <Box mt={2}>
            <TextField
              label="Add Tag"
              inputRef={tagInputRef}
              value={tagInput}
              onChange={e => setTagInput(e.target.value)}
              onKeyDown={handleTagInputKeyDown}
              fullWidth
            />
            <Controller
              name="tags"
              control={control}
              render={({ field }) => (
                <Box sx={{ mt: 1, display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                  {(field.value || []).map((tag: string) => (
                    <Chip
                      key={tag}
                      label={tag}
                      onDelete={() => handleDeleteTag(tag)}
                      color="primary"
                      size="small"
                    />
                  ))}
                </Box>
              )}
            />
          </Box>
          <Controller
            name="category"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                margin="dense"
                label="Category"
                fullWidth
                error={!!errors.category}
                helperText={errors.category?.message?.toString()}
              />
            )}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose} disabled={isSubmitting}>Cancel</Button>
          <Button type="submit" color="primary" disabled={isSubmitting}>
            Save
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default UpdateChildBotDialog;