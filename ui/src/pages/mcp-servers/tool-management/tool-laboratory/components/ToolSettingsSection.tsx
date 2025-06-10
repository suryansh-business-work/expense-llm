import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import {
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton,
  CircularProgress,
  Alert,
  Snackbar
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import SaveIcon from "@mui/icons-material/Save";
import axios from 'axios';

interface Parameter {
  name: string;
  type: string;
  description: string;
  required: boolean;
}

const ToolSettingsSection: React.FC = () => {
  const { mcpServerId, toolId } = useParams<{ mcpServerId: string; toolId: string }>();
  
  // Local state management
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [toolName, setToolName] = useState("");
  const [toolDescription, setToolDescription] = useState("");
  const [parameters, setParameters] = useState<Parameter[]>([]);
  const [isDirty, setIsDirty] = useState(false);
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: "success" | "error" }>({
    open: false,
    message: "",
    severity: "success"
  });

  // Fetch tool data
  useEffect(() => {
    const fetchToolData = async () => {
      if (!toolId) return;
      
      try {
        const token = localStorage.getItem("token");
        if (!token) throw new Error("Authentication required");
        
        const headers = { Authorization: `Bearer ${token}` };
        
        const response = await axios.get(
          `http://localhost:3000/v1/api/mcp-server/tool/get/${toolId}`,
          { headers }
        );
        
        const data = response.data?.data;
        if (data) {
          setToolName(data.toolName || "");
          setToolDescription(data.toolDescription || "");
          
          // Map API parameter structure to our component structure
          if (Array.isArray(data.toolParams)) {
            const mappedParams = data.toolParams.map((param: any) => ({
              name: param.paramName || "",
              type: param.paramType || "string",
              description: "",  // API might not provide this
              required: true    // API might not provide this
            }));
            setParameters(mappedParams);
          }
        }
      } catch (err: any) {
        setError(err.message || "Failed to load tool data");
      } finally {
        setLoading(false);
      }
    };
    
    fetchToolData();
  }, [toolId]);

  // Handle save
  const handleSave = async () => {
    if (!toolId || !mcpServerId) return;
    
    setSaving(true);
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("Authentication required");
      
      // Map our parameters back to API format
      const apiParams = parameters.map(param => ({
        paramName: param.name,
        paramType: param.type
      }));
      
      // Update tool data
      await axios.patch(
        `http://localhost:3000/v1/api/mcp-server/tool/update/${toolId}`,
        {
          toolName,
          toolDescription,
          toolParams: apiParams
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      
      setIsDirty(false);
      setSnackbar({
        open: true,
        message: "Tool settings saved successfully",
        severity: "success"
      });
    } catch (err: any) {
      setSnackbar({
        open: true,
        message: err.message || "Failed to save tool settings",
        severity: "error"
      });
    } finally {
      setSaving(false);
    }
  };

  // Add parameter
  const handleAddParameter = () => {
    setParameters([
      ...parameters,
      { name: "", type: "string", description: "", required: false }
    ]);
    setIsDirty(true);
  };

  // Remove parameter
  const handleRemoveParameter = (index: number) => {
    setParameters(parameters.filter((_, i) => i !== index));
    setIsDirty(true);
  };

  // Update parameter
  const handleParameterChange = (index: number, field: keyof Parameter, value: any) => {
    const updatedParams = [...parameters];
    updatedParams[index] = { ...updatedParams[index], [field]: value };
    setParameters(updatedParams);
    setIsDirty(true);
  };

  if (loading) {
    return (
      <Box sx={{ textAlign: 'center', py: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return <Alert severity="error">{error}</Alert>;
  }

  return (
    <Paper
      elevation={0}
      sx={{
        p: 3,
        borderRadius: 2,
        bgcolor: "#fff",
        boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
        mb: 4
      }}
    >
      {/* Save button */}
      <Box display="flex" justifyContent="flex-end" mb={2}>
        <Button
          variant="contained"
          startIcon={<SaveIcon />}
          onClick={handleSave}
          disabled={saving || !isDirty}
          sx={{ 
            borderRadius: 2,
            bgcolor: isDirty ? "primary.main" : "grey.400",
            boxShadow: isDirty ? "0 4px 10px rgba(25,118,210,0.15)" : "none"
          }}
        >
          {saving ? "Saving..." : "Save Changes"}
        </Button>
      </Box>
      
      <Typography variant="h6" fontWeight={600} mb={3}>
        Basic Information
      </Typography>
      
      <div className="row g-3">
        <div className="col-12 col-md-6">
          <TextField
            label="Tool Name"
            fullWidth
            value={toolName}
            onChange={(e) => {
              setToolName(e.target.value);
              setIsDirty(true);
            }}
            variant="outlined"
            margin="normal"
            helperText="A descriptive name for your tool"
          />
        </div>
        <div className="col-12">
          <TextField
            label="Description"
            fullWidth
            value={toolDescription}
            onChange={(e) => {
              setToolDescription(e.target.value);
              setIsDirty(true);
            }}
            variant="outlined"
            margin="normal"
            multiline
            rows={3}
            helperText="Describe what your tool does and how to use it"
          />
        </div>
      </div>

      <Box mt={4} mb={2} display="flex" justifyContent="space-between" alignItems="center">
        <Typography variant="h6" fontWeight={600}>
          Parameters
        </Typography>
        <Button 
          startIcon={<AddIcon />}
          onClick={handleAddParameter}
          variant="outlined"
          sx={{ borderRadius: 2 }}
        >
          Add Parameter
        </Button>
      </Box>
      
      {/* Parameters list */}
      {parameters.length === 0 ? (
        <Box sx={{ 
          p: 3, 
          textAlign: 'center',
          border: '1px dashed #ccc',
          borderRadius: 2,
          bgcolor: '#fafafa'
        }}>
          <Typography color="text.secondary">
            No parameters defined. Add parameters to make your tool more flexible.
          </Typography>
        </Box>
      ) : (
        parameters.map((param, index) => (
          <Paper
            key={index}
            elevation={0}
            sx={{
              p: 2,
              mb: 2,
              border: '1px solid #eee',
              borderRadius: 2
            }}
          >
            <Box display="flex" justifyContent="space-between" alignItems="center">
              <Typography variant="subtitle2" fontWeight={600}>
                Parameter {index + 1}
              </Typography>
              <IconButton 
                color="error" 
                onClick={() => handleRemoveParameter(index)}
                size="small"
              >
                <DeleteIcon fontSize="small" />
              </IconButton>
            </Box>
            
            <Box mt={1}>
              <div className="row g-2">
                <div className="col-12 col-md-6">
                  <TextField
                    label="Name"
                    fullWidth
                    size="small"
                    value={param.name}
                    onChange={(e) => handleParameterChange(index, 'name', e.target.value)}
                  />
                </div>
                <div className="col-12 col-md-6">
                  <FormControl fullWidth size="small">
                    <InputLabel>Type</InputLabel>
                    <Select
                      value={param.type}
                      label="Type"
                      onChange={(e) => handleParameterChange(index, 'type', e.target.value)}
                    >
                      <MenuItem value="string">String</MenuItem>
                      <MenuItem value="number">Number</MenuItem>
                      <MenuItem value="boolean">Boolean</MenuItem>
                      <MenuItem value="object">Object</MenuItem>
                      <MenuItem value="array">Array</MenuItem>
                    </Select>
                  </FormControl>
                </div>
              </div>
            </Box>
          </Paper>
        ))
      )}
      
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Paper>
  );
};

export default ToolSettingsSection;
