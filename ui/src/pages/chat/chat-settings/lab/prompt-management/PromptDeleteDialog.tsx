import { Dialog, DialogTitle, DialogContent, DialogActions, Button } from "@mui/material";

interface PromptDeleteDialogProps {
  open: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}

const PromptDeleteDialog = ({ open, onCancel, onConfirm }: PromptDeleteDialogProps) => (
  <Dialog open={open} onClose={onCancel}>
    <DialogTitle>Delete Prompt</DialogTitle>
    <DialogContent>
      Are you sure you want to delete this prompt?
    </DialogContent>
    <DialogActions>
      <Button onClick={onCancel} color="primary">
        Cancel
      </Button>
      <Button onClick={onConfirm} color="error" variant="contained">
        Delete
      </Button>
    </DialogActions>
  </Dialog>
);

export default PromptDeleteDialog;
