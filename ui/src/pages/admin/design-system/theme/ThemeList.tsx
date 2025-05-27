import { useState, useEffect } from "react";
import axios from "axios";
import {
  Typography,
  Box,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  CircularProgress,
  Snackbar,
  Alert,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import Table from "../components/Table";
import Button from "../components/Button";

const API_BASE = "http://localhost:3000/design-system";

export default function ThemeList({
  selectedThemeId,
  setSelectedThemeId,
}: {
  selectedThemeId: string;
  setSelectedThemeId: (id: string) => void;
}) {
  const [themes, setThemes] = useState<{ themeId: string; themeName: string }[]>([]);
  const [themeInputs, setThemeInputs] = useState<{ [id: string]: string }>({});
  const [newThemeName, setNewThemeName] = useState("");
  const [themeError, setThemeError] = useState<string | null>(null);
  const [themeSuccess, setThemeSuccess] = useState<string | null>(null);

  // For delete dialog
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [themeToDelete, setThemeToDelete] = useState<{ themeId: string; themeName: string } | null>(null);

  // Loader
  const [loading, setLoading] = useState(false);
  const [updatingThemeId, setUpdatingThemeId] = useState<string | null>(null);

  // Fetch all themes on mount
  useEffect(() => {
    fetchThemes();
    // eslint-disable-next-line
  }, []);

  const fetchThemes = async () => {
    setLoading(true);
    setThemeError(null);
    try {
      const res = await axios.get(`${API_BASE}/get`);
      if (Array.isArray(res.data.data)) {
        setThemes(res.data.data);
        // Set input values for editing
        const inputMap: { [id: string]: string } = {};
        (res.data.data || []).forEach((t: any) => {
          inputMap[t.themeId] = t.themeName;
        });
        setThemeInputs(inputMap);
      } else {
        setThemes([]);
      }
      if (res.data.message && res.data.status === "no-data-found") {
        setThemeError(res.data.message);
      }
    } catch (err: any) {
      setThemeError(err?.response?.data?.message || "Failed to load themes");
      setThemes([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTheme = async () => {
    if (!newThemeName.trim()) return;
    setLoading(true);
    try {
      const res = await axios.post(`${API_BASE}/create`, { themeName: newThemeName.trim() });
      setThemeSuccess(res.data?.message || "Theme created");
      setThemeError(null);
      setNewThemeName("");
      fetchThemes();
    } catch (err: any) {
      setThemeError(err?.response?.data?.message || "Failed to create theme");
    } finally {
      setLoading(false);
    }
  };

  // Update input value and debounce update
  const handleThemeInputChange = (themeId: string, value: string) => {
    setThemeInputs((prev) => ({ ...prev, [themeId]: value }));
  };

  const handleUpdateTheme = async (themeId: string) => {
    setUpdatingThemeId(themeId);
    try {
      const res = await axios.patch(`${API_BASE}/update/${themeId}`, {
        themeName: themeInputs[themeId],
      });
      setThemeSuccess(res.data?.message || "Theme updated");
      setThemeError(null);
      fetchThemes();
    } catch (err: any) {
      setThemeError(err?.response?.data?.message || "Failed to update theme");
    } finally {
      setUpdatingThemeId(null);
    }
  };

  const handleDeleteTheme = async (themeId: string) => {
    setLoading(true);
    try {
      const res = await axios.delete(`${API_BASE}/delete/${themeId}`);
      setThemeSuccess(res.data?.message || "Theme deleted");
      setThemeError(null);
      fetchThemes();
      if (selectedThemeId === themeId) setSelectedThemeId("");
    } catch (err: any) {
      setThemeError(err?.response?.data?.message || "Failed to delete theme");
    } finally {
      setLoading(false);
    }
  };

  // Open delete dialog
  const openDeleteDialog = (theme: { themeId: string; themeName: string }) => {
    setThemeToDelete(theme);
    setDeleteDialogOpen(true);
  };

  // Confirm delete
  const confirmDelete = async () => {
    if (themeToDelete) {
      await handleDeleteTheme(themeToDelete.themeId);
      setDeleteDialogOpen(false);
      setThemeToDelete(null);
    }
  };

  // Cancel delete
  const cancelDelete = () => {
    setDeleteDialogOpen(false);
    setThemeToDelete(null);
  };

  // Snackbar close
  const handleSnackbarClose = () => {
    setThemeError(null);
    setThemeSuccess(null);
  };

  // Table columns
  const columns = [
    {
      key: "themeName",
      label: "Theme Name",
      render: (row: { themeId: string; themeName: string }) => (
        <TextField
          value={themeInputs[row.themeId] ?? row.themeName}
          onChange={e => handleThemeInputChange(row.themeId, e.target.value)}
          size="small"
          disabled={loading || updatingThemeId === row.themeId}
          fullWidth
        />
      ),
    },
    {
      key: "actions",
      label: "Actions",
      render: (row: { themeId: string; themeName: string }) => {
        const inputValue = themeInputs[row.themeId] ?? row.themeName;
        const isChanged = inputValue !== row.themeName;
        return (
          <Box sx={{ display: "flex", gap: 1 }}>
            <Button
              size="small"
              color="primary"
              variant="contained"
              loading={updatingThemeId === row.themeId}
              onClick={() => handleUpdateTheme(row.themeId)}
              disabled={
                loading ||
                updatingThemeId === row.themeId ||
                !isChanged ||
                !inputValue.trim()
              }
            >
              Update
            </Button>
            <Button
              size="small"
              color="error"
              variant="outlined"
              onClick={() => openDeleteDialog(row)}
              disabled={loading}
            >
              Delete
            </Button>
          </Box>
        );
      },
    },
  ];

  return (
    <>
      <Typography variant="h6" sx={{ mb: 2 }}>
        Themes
      </Typography>
      <div className="container-fluid">
        <div className="row">
          <div className="col-3">
            <Box sx={{ display: "flex", gap: 2, mb: 2 }}>
              <TextField
                label="New Theme Name"
                value={newThemeName}
                onChange={e => setNewThemeName(e.target.value)}
                size="small"
              />
              <Button
                variant="contained"
                size="small"
                startIcon={<AddIcon />}
                onClick={handleCreateTheme}
                disabled={!newThemeName.trim() || loading}
              >
                {loading ? <CircularProgress size={20} color="inherit" /> : "Create Theme"}
              </Button>
            </Box>

            <Box sx={{ mt: 2 }}>
              <Table
                columns={columns}
                data={themes}
                rowKey={row => row.themeId}
              />
            </Box>
          </div>
        </div>
      </div>

      <Dialog open={deleteDialogOpen} onClose={cancelDelete}>
        <DialogTitle>Delete Theme</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete the theme{" "}
            <b>{themeToDelete?.themeName}</b>?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={cancelDelete} color="primary">
            Cancel
          </Button>
          <Button onClick={confirmDelete} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={!!themeError || !!themeSuccess}
        autoHideDuration={3000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert
          severity={themeError ? "error" : "success"}
          onClose={handleSnackbarClose}
          sx={{ width: "100%" }}
        >
          {themeError || themeSuccess}
        </Alert>
      </Snackbar>
    </>
  );
}
