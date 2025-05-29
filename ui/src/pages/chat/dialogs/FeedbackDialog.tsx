import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Box, Typography, Rating, TextField } from "@mui/material";
import { useForm, Controller } from "react-hook-form";
import Joi from "joi";
import { joiResolver } from "@hookform/resolvers/joi";
import { useState } from "react";

const schema = Joi.object({
  uiux: Joi.number().min(1).max(5).required().label("UI & UX"),
  replyTime: Joi.number().min(1).max(5).required().label("Reply Time"),
  feedback: Joi.string().required().label("Feedback"),
});

export default function FeedbackDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [submitted, setSubmitted] = useState(false);
  const { control, handleSubmit, reset, formState: { errors } } = useForm({
    resolver: joiResolver(schema),
    defaultValues: { uiux: 0, replyTime: 0, feedback: "" }
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
      <DialogTitle>Feedback</DialogTitle>
      <DialogContent>
        {submitted ? (
          <Typography color="success.main" sx={{ mt: 2 }}>Thank you! We will get back to you after 24-48 hrs over the mail.</Typography>
        ) : (
          <form id="feedback-form" onSubmit={handleSubmit(onSubmit)}>
            <Box sx={{ mb: 2 }}>
              <Typography>UI & UX</Typography>
              <Controller
                name="uiux"
                control={control}
                render={({ field }) => (
                  <Rating {...field} value={field.value} onChange={(_, v) => field.onChange(v)} />
                )}
              />
              {errors.uiux && <Typography color="error">{errors.uiux.message as string}</Typography>}
            </Box>
            <Box sx={{ mb: 2 }}>
              <Typography>Reply Time</Typography>
              <Controller
                name="replyTime"
                control={control}
                render={({ field }) => (
                  <Rating {...field} value={field.value} onChange={(_, v) => field.onChange(v)} />
                )}
              />
              {errors.replyTime && <Typography color="error">{errors.replyTime.message as string}</Typography>}
            </Box>
            <Box sx={{ mb: 2 }}>
              <Typography>Feedback</Typography>
              <Controller
                name="feedback"
                control={control}
                render={({ field }) => (
                  <TextField {...field} multiline minRows={3} fullWidth placeholder="Your feedback..." />
                )}
              />
              {errors.feedback && <Typography color="error">{errors.feedback.message as string}</Typography>}
            </Box>
          </form>
        )}
      </DialogContent>
      {!submitted && (
        <DialogActions>
          <Button onClick={onClose}>Cancel</Button>
          <Button type="submit" form="feedback-form" variant="contained">Submit</Button>
        </DialogActions>
      )}
    </Dialog>
  );
}