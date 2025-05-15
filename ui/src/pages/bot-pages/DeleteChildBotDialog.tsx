import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
} from "@mui/material";
import { useState } from "react";

interface DeleteChildBotDialogProps {
  open: boolean;
  onClose: () => void;
  botId: string | null;
  botName?: string;
  onDeleted: (botId: string) => void;
}

export default function DeleteChildBotDialog({
  open,
  onClose,
  botId,
  botName,
  onDeleted,
}: DeleteChildBotDialogProps) {
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    if (!botId) return;
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(
        `http://localhost:3000/bot/delete/child-bot/${botId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: token ? `Bearer ${token}` : "",
          },
          credentials: "include",
        }
      );
      const result = await res.json();
      if (res.ok && result.status === "success") {
        onDeleted(botId);
        onClose();
      } else {
        alert(result.message || "Failed to delete bot");
      }
    } catch (err) {
      alert("Network error");
    }
    setLoading(false);
  };

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Delete Bot</DialogTitle>
      <DialogContent>
        <Typography>
          Are you sure you want to delete the bot{" "}
          <b>{botName || "this bot"}</b>?
        </Typography>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={loading}>
          Cancel
        </Button>
        <Button
          onClick={handleDelete}
          color="error"
          variant="contained"
          disabled={loading}
        >
          {loading ? "Deleting..." : "Delete"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}