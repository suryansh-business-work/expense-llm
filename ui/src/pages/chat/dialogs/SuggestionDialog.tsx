import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Box, Typography, Avatar, TextField } from "@mui/material";
import { useForm, Controller } from "react-hook-form";
import Joi from "joi";
import { joiResolver } from "@hookform/resolvers/joi";
import React, { useState } from "react";

const schema = Joi.object({
  suggestion: Joi.string().required().label("Suggestion"),
});

export default function SuggestionDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [submitted, setSubmitted] = useState(false);
  const { control, handleSubmit, reset, formState: { errors } } = useForm({
    resolver: joiResolver(schema),
    defaultValues: { suggestion: "" }
  });

  const onSubmit = (data: any) => {
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      reset();
      onClose();
    }, 2000);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Box display="flex" alignItems="center" gap={1}>
          <Avatar sx={{ bgcolor: "primary.main" }}>🤖</Avatar>
          Suggestion
        </Box>
      </DialogTitle>
      <DialogContent>
        {submitted ? (
          <Typography color="success.main" sx={{ mt: 2 }}>Thank you! We will get back to you after 24-48 hrs over the mail.</Typography>
        ) : (
          <form id="suggestion-form" onSubmit={handleSubmit(onSubmit)}>
            <Box sx={{ mb: 2 }}>
              <Typography>What would you like to suggest?</Typography>
              <Controller
                name="suggestion"
                control={control}
                render={({ field }) => (
                  <TextField {...field} multiline minRows={3} fullWidth placeholder="Your suggestion..." />
                )}
              />
              {errors.suggestion && <Typography color="error">{errors.suggestion.message as string}</Typography>}
            </Box>
          </form>
        )}
      </DialogContent>
      {!submitted && (
        <DialogActions>
          <Button onClick={onClose}>Cancel</Button>
          <Button type="submit" form="suggestion-form" variant="contained">Submit</Button>
        </DialogActions>
      )}
    </Dialog>
  );
}
