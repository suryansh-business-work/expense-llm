import React, { useState } from "react";
import {
  Dialog, DialogTitle, DialogContent, DialogActions, Button,
  TextField, Box, MenuItem, IconButton, CircularProgress, Chip
} from "@mui/material";
import { useForm, Controller } from "react-hook-form";
import CloseIcon from "@mui/icons-material/Close";
import axios from "axios";
import { API_URL, CHAT_GPT_KEY } from "../../../utils/config";

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
  category: { value: "other", label: "Other" },
  tags: [],
};

type CreateOrUpdateBotDialogProps = {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  initialData?: any;
  token: string | null;
};

const API_BASE = `${API_URL}/bot`;
const OPENAI_API_KEY = `${CHAT_GPT_KEY}`;
const OPENAI_MODEL = "gpt-3.5-turbo"; // Or any model you want

const CreateOrUpdateBotDialog: React.FC<CreateOrUpdateBotDialogProps> = ({
  open, onClose, onSuccess, initialData, token
}) => {
  const isEdit = Boolean(initialData);
  const [loading, setLoading] = useState(false);
  const [autoFillLoading, setAutoFillLoading] = useState(false);
  const [autoFillError, setAutoFillError] = useState<string | null>(null);

  // Normalize initialData for tags as array
  const normalizedInitialData = initialData
    ? {
        ...initialData,
        tags: Array.isArray(initialData.tags)
          ? initialData.tags
          : typeof initialData.tags === "string" && initialData.tags.length > 0
            ? initialData.tags.split(",").map((t: string) => t.trim()).filter(Boolean)
            : [],
      }
    : defaultValues;

  const {
    control,
    handleSubmit,
    reset,
    setValue,
    getValues,
    watch,
    formState: { errors, isDirty }
  } = useForm({
    defaultValues: normalizedInitialData,
    mode: "onTouched",
  });

  React.useEffect(() => {
    reset(normalizedInitialData);
  }, [initialData, open, reset]);

  const handleDialogClose = () => {
    reset(defaultValues);
    onClose();
  };

  // Tag input state for current value
  const [tagInput, setTagInput] = useState("");

  // Add tag on comma or enter
  const handleTagInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value.includes(",")) {
      const tagsToAdd = value
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean);
      if (tagsToAdd.length) {
        const currentTags = getValues("tags") || [];
        setValue("tags", [...currentTags, ...tagsToAdd], { shouldDirty: true });
      }
      setTagInput("");
    } else {
      setTagInput(value);
    }
  };

  // Add tag on Enter
  const handleTagInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if ((e.key === "Enter" || e.key === "Tab") && tagInput.trim()) {
      e.preventDefault();
      const currentTags = getValues("tags") || [];
      if (!currentTags.includes(tagInput.trim())) {
        setValue("tags", [...currentTags, tagInput.trim()], { shouldDirty: true });
      }
      setTagInput("");
    }
  };

  // Remove tag
  const handleDeleteTag = (tagToDelete: string) => {
    const currentTags = getValues("tags") || [];
    setValue(
      "tags",
      currentTags.filter((tag: string) => tag !== tagToDelete),
      { shouldDirty: true }
    );
  };

  // Auto-fill logic
  const handleAutoFill = async () => {
    setAutoFillError(null);
    setAutoFillLoading(true);
    try {
      const botName = getValues("name");
      if (!botName) {
        setAutoFillError("Please enter a bot name first.");
        setAutoFillLoading(false);
        return;
      }

      // Prepare system prompt for OpenAI
      const sysPrompt = `You are a bot assistant. Given a bot name, generate a relevant bot description, category (from this list: ${categories.map(c => `"${c.value}"`).join(", ")}), and up to 5 tags as an array of strings. 
If the bot name is not understandable or not relevant, reply with: {"error": "Bot name is not understandable, please fill the data manually"}.
Return only a JSON object with the following keys: description, category, tags. 
category should be the value string from the list above. Example: {"description": "...", "category": "finance", "tags": ["tag1","tag2"]}.
Bot name: "${botName}"`;

      const res = await axios.post(
        'https://api.openai.com/v1/chat/completions',
        {
          model: OPENAI_MODEL,
          messages: [
            { role: 'system', content: sysPrompt },
          ],
          max_tokens: 200,
          temperature: 0.2,
        },
        {
          headers: {
            'Authorization': `Bearer ${OPENAI_API_KEY}`,
            'Content-Type': 'application/json',
          },
        }
      );
      const content = res.data.choices[0].message.content;
      let json: any = null;
      try {
        const jsonMatch = content.match(/```json\s*([\s\S]*?)```/i);
        if (jsonMatch) {
          json = JSON.parse(jsonMatch[1]);
        } else {
          json = JSON.parse(content);
        }
      } catch {
        setAutoFillError("Could not parse AI response. Please fill manually.");
        setAutoFillLoading(false);
        return;
      }

      if (json && json.error) {
        setAutoFillError(json.error);
        setAutoFillLoading(false);
        return;
      }

      // Set values in form
      if (json) {
        setValue("description", json.description || "", { shouldDirty: true });
        // Find category object by value
        const catObj = categories.find(c => c.value === json.category) || categories[categories.length - 1];
        setValue("category", catObj, { shouldDirty: true });
        setValue("tags", Array.isArray(json.tags) ? json.tags : [], { shouldDirty: true });
      }
    } catch (err) {
      setAutoFillError("Failed to fetch from AI. Please try again.");
    }
    setAutoFillLoading(false);
  };

  // API logic
  const handleFormSubmit = async (data: any) => {
    setLoading(true);
    try {
      const { type, ...cleanData } = data;
      const url = isEdit
        ? `${API_BASE}/update/bot/${initialData.botId || initialData.bot?.botId}`
        : `${API_BASE}/create/bot`;
      const method = isEdit ? "PATCH" : "POST";
      const payload = {
        ...cleanData,
        tags: data.tags || [],
        category: {
          value: data.category.value,
          label: data.category.label
        }
      };
      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        reset(defaultValues);
        onSuccess();
      }
    } finally {
      setLoading(false);
    }
  };

  const botName = watch("name");

  return (
    <Dialog open={open} onClose={handleDialogClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        {isEdit ? "Edit Bot" : "Create Bot"}
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
                disabled={loading}
              />
            )}
          />
          {/* Autofill button below Bot Name */}
          <Box display="flex" alignItems="center" gap={2}>
            <Button
              variant="text"
              onClick={handleAutoFill}
              size="small"
              disabled={!botName || autoFillLoading}
              startIcon={autoFillLoading ? <CircularProgress size={18} /> : null}
              sx={{ mt: 1, mb: 1 }}
            >
              Auto Fill below fields
            </Button>
            {autoFillError && (
              <span style={{ color: "red", fontSize: 13 }}>{autoFillError}</span>
            )}
          </Box>
          <Controller
            name="description"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label="Bot Description"
                error={!!errors.description}
                helperText={errors.description?.message as string}
                fullWidth
                multiline
                minRows={2}
                disabled={loading}
              />
            )}
          />
          <Controller
            name="category"
            control={control}
            rules={{ required: "Category is required" }}
            render={({ field }) => (
              <TextField
                select
                label="Bot Category *"
                error={!!errors.category}
                helperText={errors.category?.message as string}
                fullWidth
                value={field.value.value}
                onChange={e => {
                  const selected = categories.find(c => c.value === e.target.value);
                  field.onChange(selected ? { value: selected.value, label: selected.label } : { value: e.target.value, label: e.target.value });
                }}
                disabled={loading}
              >
                {categories.map((cat) => (
                  <MenuItem key={cat.value} value={cat.value}>{cat.label}</MenuItem>
                ))}
              </TextField>
            )}
          />
          {/* Tags as chips */}
          <Controller
            name="tags"
            control={control}
            render={({ field }) => (
              <Box>
                <TextField
                  label="Tags (comma or enter to add)"
                  value={tagInput}
                  onChange={handleTagInputChange}
                  onKeyDown={handleTagInputKeyDown}
                  disabled={loading}
                  fullWidth
                  placeholder="Add a tag and press comma or enter"
                />
                <Box mt={1} display="flex" flexWrap="wrap" gap={1}>
                  {(field.value || []).map((tag: string) => (
                    <Chip
                      key={tag}
                      label={tag}
                      onDelete={() => handleDeleteTag(tag)}
                      sx={{ m: 0.2 }}
                    />
                  ))}
                </Box>
              </Box>
            )}
          />
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleDialogClose} disabled={loading}>Cancel</Button>
        <Button
          onClick={handleSubmit(handleFormSubmit)}
          variant="contained"
          disabled={loading || !isDirty}
          startIcon={loading ? <CircularProgress size={18} /> : null}
        >
          {isEdit ? "Update Bot" : "Create Bot"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CreateOrUpdateBotDialog;