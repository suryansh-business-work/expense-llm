import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Box, Typography, Accordion, AccordionSummary, AccordionDetails, TextField } from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { useForm, Controller } from "react-hook-form";
import Joi from "joi";
import { joiResolver } from "@hookform/resolvers/joi";
import React, { useState } from "react";

const schema = Joi.object({
  message: Joi.string().required().label("Message"),
  email: Joi.string().email({ tlds: false }).required().label("Email"),
});

const FAQ = [
  { q: "How do I use the chat?", a: "Just type your message and press send." },
  { q: "How do I attach a file?", a: "Click the paperclip icon to attach files." },
  { q: "How do I get support?", a: "Use this form or email us at support@example.com." },
];

export default function HelpDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [submitted, setSubmitted] = useState(false);
  const { control, handleSubmit, reset, formState: { errors } } = useForm({
    resolver: joiResolver(schema),
    defaultValues: { message: "", email: "" }
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
      <DialogTitle>Help & FAQ</DialogTitle>
      <DialogContent>
        <Box sx={{ mb: 2 }}>
          {FAQ.map((item, idx) => (
            <Accordion key={idx}>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography>{item.q}</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Typography>{item.a}</Typography>
              </AccordionDetails>
            </Accordion>
          ))}
        </Box>
        {submitted ? (
          <Typography color="success.main" sx={{ mt: 2 }}>Thank you! We will get back to you after 24-48 hrs over the mail.</Typography>
        ) : (
          <form id="help-form" onSubmit={handleSubmit(onSubmit)}>
            <Box sx={{ mb: 2 }}>
              <Typography>Email</Typography>
              <Controller
                name="email"
                control={control}
                render={({ field }) => (
                  <TextField {...field} fullWidth placeholder="Your email" />
                )}
              />
              {errors.email && <Typography color="error">{errors.email.message as string}</Typography>}
            </Box>
            <Box sx={{ mb: 2 }}>
              <Typography>Your Message</Typography>
              <Controller
                name="message"
                control={control}
                render={({ field }) => (
                  <TextField {...field} multiline minRows={3} fullWidth placeholder="How can we help you?" />
                )}
              />
              {errors.message && <Typography color="error">{errors.message.message as string}</Typography>}
            </Box>
          </form>
        )}
      </DialogContent>
      {!submitted && (
        <DialogActions>
          <Button onClick={onClose}>Cancel</Button>
          <Button type="submit" form="help-form" variant="contained">Submit</Button>
        </DialogActions>
      )}
    </Dialog>
  );
}