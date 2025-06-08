import { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  IconButton,
  Box,
  Typography,
  Alert,
  CircularProgress,
  Divider,
  Paper,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  SelectChangeEvent,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import CloseIcon from "@mui/icons-material/Close";
import SaveIcon from "@mui/icons-material/Save";

interface ToolParam {
  paramName: string;
  paramType: string;
}

interface ToolFormData {
  mcpServerId: string;
  toolName: string;
  toolDescription?: string;
  toolParams: ToolParam[];
}

interface CreateAndUpdateToolDialogProps {
  open: boolean;
  onClose: () => void;
  mcpServerId: string;
  tool?: any; // For editing an existing tool
  onSuccess?: () => void;
}

const paramTypes = ["string", "number", "boolean", "array", "object", "date"];

const CreateAndUpdateToolDialog = ({
  open,
  onClose,
  mcpServerId,
  tool,
  onSuccess,
}: CreateAndUpdateToolDialogProps) => {
  const isEditMode = !!tool;
  
  // Form state
  const [formData, setFormData] = useState<ToolFormData>({
    mcpServerId,
    toolName: "",
    toolDescription: "",
    toolParams: [{ paramName: "", paramType: "string" }],
  });
  
  // Loading and error states
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Initialize form with tool data when editing
  useEffect(() => {
    if (tool) {
      setFormData({
        mcpServerId,
        toolName: tool.toolName || "",
        toolDescription: tool.toolDescription || "",
        toolParams: tool.toolParams?.length
          ? tool.toolParams
          : [{ paramName: "", paramType: "string" }],
      });
    } else {
      // Reset form when opening in create mode
      setFormData({
        mcpServerId,
        toolName: "",
        toolDescription: "",
        toolParams: [{ paramName: "", paramType: "string" }],
      });
    }
  }, [tool, mcpServerId, open]);
  
  // Handle field changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  // Handle param field changes
  const handleParamChange = (index: number, field: keyof ToolParam, value: string) => {
    const updatedParams = [...formData.toolParams];
    updatedParams[index] = {
      ...updatedParams[index],
      [field]: value
    };
    
    setFormData(prev => ({
      ...prev,
      toolParams: updatedParams
    }));
  };
  
  // Handle param type selection
  const handleParamTypeChange = (index: number, event: SelectChangeEvent) => {
    handleParamChange(index, "paramType", event.target.value);
  };
  
  // Add new parameter
  const addParam = () => {
    setFormData(prev => ({
      ...prev,
      toolParams: [...prev.toolParams, { paramName: "", paramType: "string" }]
    }));
  };
  
  // Remove parameter
  const removeParam = (index: number) => {
    if (formData.toolParams.length <= 1) {
      return; // Keep at least one parameter field
    }
    
    const updatedParams = [...formData.toolParams];
    updatedParams.splice(index, 1);
    
    setFormData(prev => ({
      ...prev,
      toolParams: updatedParams
    }));
  };
  
  // Form validation
  const isFormValid = () => {
    if (!formData.toolName.trim()) return false;
    
    // Check if all parameter names are filled
    const allParamsValid = formData.toolParams.every(param => 
      param.paramName.trim() !== "" && param.paramType !== ""
    );
    
    return allParamsValid;
  };
  
  // Handle form submit
  const handleSubmit = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const token = localStorage.getItem("token");
      const url = isEditMode 
        ? `http://localhost:3000/v1/api/mcp-server/tool/update/${tool.toolId}`
        : `http://localhost:3000/v1/api/mcp-server/tool/create`;
      
      const method = isEditMode ? "PATCH" : "POST";
      
      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });
      
      if (!res.ok) {
        throw new Error(`Server responded with status: ${res.status}`);
      }
      
      const result = await res.json();
      
      if (result.status === "success") {
        onClose();
        if (onSuccess) onSuccess();
      } else {
        setError(result.message || "Failed to save tool");
      }
    } catch (err: any) {
      console.error("Error saving tool:", err);
      setError(err.message || "An error occurred while saving the tool");
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <Dialog 
      open={open} 
      onClose={loading ? undefined : onClose}
      fullWidth
      maxWidth="md"
      PaperProps={{
        sx: {
          borderRadius: 2,
          boxShadow: "0 8px 32px rgba(0,0,0,0.1)"
        }
      }}
    >
      <DialogTitle sx={{ pb: 1 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h5" fontWeight={600}>
            {isEditMode ? "Update Tool" : "Create New Tool"}
          </Typography>
          {!loading && (
            <IconButton onClick={onClose} size="small">
              <CloseIcon />
            </IconButton>
          )}
        </Box>
      </DialogTitle>
      
      <DialogContent sx={{ pt: 3 }}>
        {error && (
          <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
            {error}
          </Alert>
        )}
        
        {/* Tool basic info */}
        <Typography variant="subtitle2" fontWeight={600} mb={0.5}>
          Tool Name*
        </Typography>
        <TextField
          name="toolName"
          value={formData.toolName}
          onChange={handleChange}
          fullWidth
          variant="outlined"
          placeholder="Enter a name for your tool"
          size="small"
          sx={{ mb: 3 }}
          disabled={loading}
          required
        />
        
        <Typography variant="subtitle2" fontWeight={600} mb={0.5}>
          Description
        </Typography>
        <TextField
          name="toolDescription"
          value={formData.toolDescription}
          onChange={handleChange}
          fullWidth
          variant="outlined"
          placeholder="Describe what this tool does"
          multiline
          rows={3}
          sx={{ mb: 3 }}
          disabled={loading}
        />
        
        {/* Tool parameters */}
        <Box sx={{ mb: 2 }}>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
            <Typography variant="subtitle2" fontWeight={600}>
              Tool Parameters
            </Typography>
            <Button 
              size="small" 
              startIcon={<AddIcon />} 
              onClick={addParam}
              disabled={loading}
            >
              Add Parameter
            </Button>
          </Box
          >
          
          <Divider sx={{ mb: 2 }} />
          
          {formData.toolParams.map((param, index) => (
            <Paper 
              key={index} 
              elevation={0} 
              sx={{ 
                p: 2, 
                mb: 2, 
                border: "1px solid #edf2f7",
                borderRadius: 2,
                background: "#f9fafc"
              }}
            >
              <Box 
                display="flex" 
                flexDirection={{ xs: "column", sm: "row" }}
                alignItems={{ xs: "stretch", sm: "center" }}
                gap={2}
              >
                <TextField
                  label="Parameter Name"
                  value={param.paramName}
                  onChange={(e) => handleParamChange(index, "paramName", e.target.value)}
                  fullWidth
                  variant="outlined"
                  size="small"
                  disabled={loading}
                  required
                  placeholder="e.g., apiKey, query, maxResults"
                />
                
                <FormControl sx={{ minWidth: 180 }} size="small">
                  <InputLabel>Parameter Type</InputLabel>
                  <Select
                    value={param.paramType}
                    onChange={(e) => handleParamTypeChange(index, e)}
                    label="Parameter Type"
                    disabled={loading}
                  >
                    {paramTypes.map(type => (
                      <MenuItem key={type} value={type}>
                        {type}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                
                <IconButton 
                  color="error" 
                  onClick={() => removeParam(index)}
                  disabled={loading || formData.toolParams.length <= 1}
                  sx={{ 
                    width: 40, 
                    height: 40,
                    alignSelf: { xs: "flex-end", sm: "center" }
                  }}
                >
                  <DeleteIcon />
                </IconButton>
              </Box>
            </Paper>
          ))}
          
          <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: "block" }}>
            Define the parameters that this tool accepts for operation.
          </Typography>
        </Box>
      </DialogContent>
      
      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button 
          variant="outlined" 
          onClick={onClose}
          sx={{ borderRadius: 2 }}
          disabled={loading}
        >
          Cancel
        </Button>
        <Button
          variant="contained"
          startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <SaveIcon />}
          onClick={handleSubmit}
          disabled={!isFormValid() || loading}
          sx={{ 
            borderRadius: 2,
            px: 3,
            py: 1,
            fontWeight: 600,
            boxShadow: "0 4px 12px rgba(25,118,210,0.12)",
          }}
        >
          {loading ? "Saving..." : isEditMode ? "Update Tool" : "Create Tool"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CreateAndUpdateToolDialog;

