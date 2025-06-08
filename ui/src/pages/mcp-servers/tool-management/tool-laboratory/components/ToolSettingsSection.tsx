import React from 'react';
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
  IconButton
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import { useToolContext } from '../context/ToolContext';

const ToolSettingsSection: React.FC = () => {
  const {
    toolName,
    setToolName,
    toolDescription,
    setToolDescription,
    toolParameters,
    handleAddParameter,
    handleRemoveParameter,
    handleParameterChange,
    setIsDirty
  } = useToolContext();

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
      {toolParameters.length === 0 ? (
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
        toolParameters.map((param, index) => (
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
            <div className="row g-2 align-items-start">
              <div className="col-12 col-md-3">
                <TextField
                  label="Name"
                  fullWidth
                  size="small"
                  value={param.name}
                  onChange={(e) => handleParameterChange(index, 'name', e.target.value)}
                  variant="outlined"
                />
              </div>
              <div className="col-12 col-md-2">
                <FormControl fullWidth size="small">
                  <InputLabel>Type</InputLabel>
                  <Select
                    value={param.type}
                    onChange={(e) => handleParameterChange(index, 'type', e.target.value)}
                    label="Type"
                  >
                    <MenuItem value="string">String</MenuItem>
                    <MenuItem value="number">Number</MenuItem>
                    <MenuItem value="boolean">Boolean</MenuItem>
                    <MenuItem value="object">Object</MenuItem>
                    <MenuItem value="array">Array</MenuItem>
                  </Select>
                </FormControl>
              </div>
              <div className="col-12 col-md-4">
                <TextField
                  label="Description"
                  fullWidth
                  size="small"
                  value={param.description}
                  onChange={(e) => handleParameterChange(index, 'description', e.target.value)}
                  variant="outlined"
                />
              </div>
              <div className="col-6 col-md-2">
                <FormControl fullWidth size="small">
                  <InputLabel>Required</InputLabel>
                  <Select
                    value={param.required ? "true" : "false"}
                    onChange={(e) => handleParameterChange(index, 'required', e.target.value === "true")}
                    label="Required"
                  >
                    <MenuItem value="true">Yes</MenuItem>
                    <MenuItem value="false">No</MenuItem>
                  </Select>
                </FormControl>
              </div>
              <div className="col-6 col-md-1 d-flex justify-content-center align-items-center">
                <IconButton 
                  color="error" 
                  onClick={() => handleRemoveParameter(index)}
                  size="small"
                >
                  <DeleteIcon />
                </IconButton>
              </div>
            </div>
          </Paper>
        ))
      )}
    </Paper>
  );
};

export default ToolSettingsSection;