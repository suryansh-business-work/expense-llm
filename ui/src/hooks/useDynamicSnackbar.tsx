import { createContext, useContext, useState, ReactNode } from "react";
import { Snackbar, Alert } from "@mui/material";

type SnackbarState = {
  open: boolean;
  message: string;
  severity: "success" | "error" | "info" | "warning";
};

type SnackbarContextType = {
  showSnackbar: (message: string, severity?: SnackbarState["severity"]) => void;
};

const SnackbarContext = createContext<SnackbarContextType | undefined>(undefined);

export const useDynamicSnackbar = () => {
  const ctx = useContext(SnackbarContext);
  if (!ctx) throw new Error("useDynamicSnackbar must be used within DynamicSnackbarProvider");
  return ctx.showSnackbar;
};

export const DynamicSnackbarProvider = ({ children }: { children: ReactNode }) => {
  const [snackbar, setSnackbar] = useState<SnackbarState>({
    open: false,
    message: "",
    severity: "info",
  });

  const showSnackbar = (message: string, severity: SnackbarState["severity"] = "info") => {
    setSnackbar({ open: true, message, severity });
  };

  const handleClose = () => setSnackbar(s => ({ ...s, open: false }));

  return (
    <SnackbarContext.Provider value={{ showSnackbar }}>
      {children}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={handleClose}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert onClose={handleClose} severity={snackbar.severity} sx={{ width: "100%" }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </SnackbarContext.Provider>
  );
};