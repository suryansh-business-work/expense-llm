import React, { useState } from "react";
import {
  Box,
  Typography,
  Paper,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Tooltip,
  Stack,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
} from "@mui/material";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";

const dummyCredentials = [
  {
    id: 1,
    name: "ChatGPT API Key",
    value: "sk-********************",
    type: "OpenAI",
  },
  {
    id: 2,
    name: "MongoDB Key",
    value: "mongo-****************",
    type: "Database",
  },
  {
    id: 3,
    name: "Gemini Key",
    value: "gemini-****************",
    type: "Google AI",
  },
  {
    id: 4,
    name: "XYZ Key",
    value: "xyz-****************",
    type: "Other",
  },
];

type Credential = typeof dummyCredentials[0];

const ManageCredentials: React.FC = () => {
  const [credentials, setCredentials] = useState(dummyCredentials);

  // Dialog state
  const [openCreate, setOpenCreate] = useState(false);
  const [openEdit, setOpenEdit] = useState<Credential | null>(null);
  const [openDelete, setOpenDelete] = useState<Credential | null>(null);

  // Form state for create/edit
  const [form, setForm] = useState({ name: "", value: "", type: "" });

  // Handlers
  const handleOpenCreate = () => {
    setForm({ name: "", value: "", type: "" });
    setOpenCreate(true);
  };

  const handleCreate = () => {
    setCredentials([
      ...credentials,
      {
        id: Date.now(),
        name: form.name,
        value: form.value,
        type: form.type,
      },
    ]);
    setOpenCreate(false);
  };

  const handleOpenEdit = (cred: Credential) => {
    setForm({ name: cred.name, value: cred.value, type: cred.type });
    setOpenEdit(cred);
  };

  const handleEdit = () => {
    setCredentials((prev) =>
      prev.map((c) =>
        c.id === openEdit?.id
          ? { ...c, name: form.name, value: form.value, type: form.type }
          : c
      )
    );
    setOpenEdit(null);
  };

  const handleOpenDelete = (cred: Credential) => setOpenDelete(cred);

  const handleDelete = () => {
    setCredentials((prev) => prev.filter((c) => c.id !== openDelete?.id));
    setOpenDelete(null);
  };

  return (
    <Box sx={{ py: 4, px: { xs: 1, md: 4 } }}>
      <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
        <Typography variant="h5" fontWeight={700}>
          Manage Credentials
        </Typography>
        <Box sx={{ flex: 1 }} />
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddCircleOutlineIcon />}
          sx={{ borderRadius: 2, fontWeight: 600, px: 2 }}
          onClick={handleOpenCreate}
        >
          Create Credential
        </Button>
      </Box>
      <Paper elevation={2} sx={{ p: 0, borderRadius: 3 }}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 700 }}>Name</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Type</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Key</TableCell>
                <TableCell sx={{ fontWeight: 700 }} align="right">
                  Actions
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {credentials.map((cred) => (
                <TableRow key={cred.id}>
                  <TableCell>{cred.name}</TableCell>
                  <TableCell>{cred.type}</TableCell>
                  <TableCell>
                    <Stack direction="row" alignItems="center" spacing={1}>
                      <VisibilityOffIcon fontSize="small" color="disabled" />
                      <Typography variant="body2" sx={{ letterSpacing: 1 }}>
                        {cred.value}
                      </Typography>
                      <Tooltip title="Copy Key">
                        <IconButton size="small">
                          <ContentCopyIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Stack>
                  </TableCell>
                  <TableCell align="right">
                    <Tooltip title="Edit">
                      <IconButton
                        size="small"
                        color="primary"
                        onClick={() => handleOpenEdit(cred)}
                      >
                        <EditIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete">
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => handleOpenDelete(cred)}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))}
              {credentials.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} align="center">
                    <Typography color="text.secondary">
                      No credentials found.
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* Create Credential Dialog */}
      <Dialog
        open={openCreate}
        onClose={() => setOpenCreate(false)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>Create Credential</DialogTitle>
        <DialogContent>
          <TextField
            margin="normal"
            label="Name"
            fullWidth
            value={form.name}
            onChange={(e) =>
              setForm((f) => ({ ...f, name: e.target.value }))
            }
          />
          <TextField
            margin="normal"
            label="Type"
            fullWidth
            value={form.type}
            onChange={(e) =>
              setForm((f) => ({ ...f, type: e.target.value }))
            }
          />
          <TextField
            margin="normal"
            label="Key"
            fullWidth
            value={form.value}
            onChange={(e) =>
              setForm((f) => ({ ...f, value: e.target.value }))
            }
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenCreate(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleCreate}
            disabled={!form.name || !form.type || !form.value}
          >
            Create
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit Credential Dialog */}
      <Dialog
        open={!!openEdit}
        onClose={() => setOpenEdit(null)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>Edit Credential</DialogTitle>
        <DialogContent>
          <TextField
            margin="normal"
            label="Name"
            fullWidth
            value={form.name}
            onChange={(e) =>
              setForm((f) => ({ ...f, name: e.target.value }))
            }
          />
          <TextField
            margin="normal"
            label="Type"
            fullWidth
            value={form.type}
            onChange={(e) =>
              setForm((f) => ({ ...f, type: e.target.value }))
            }
          />
          <TextField
            margin="normal"
            label="Key"
            fullWidth
            value={form.value}
            onChange={(e) =>
              setForm((f) => ({ ...f, value: e.target.value }))
            }
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenEdit(null)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleEdit}
            disabled={!form.name || !form.type || !form.value}
          >
            Save
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Credential Dialog */}
      <Dialog
        open={!!openDelete}
        onClose={() => setOpenDelete(null)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>Delete Credential</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete <b>{openDelete?.name}</b>?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDelete(null)}>Cancel</Button>
          <Button variant="contained" color="error" onClick={handleDelete}>
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ManageCredentials;