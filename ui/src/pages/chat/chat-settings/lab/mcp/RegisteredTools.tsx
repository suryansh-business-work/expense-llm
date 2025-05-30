import React, { useState, useMemo } from "react";
import {
  Paper, Typography, TextField, InputAdornment,
  Accordion, AccordionSummary, AccordionDetails, Table, TableHead, TableRow, TableCell, TableBody
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import SearchIcon from "@mui/icons-material/Search";

interface RegisteredToolsProps {
  tools: any[];
}

const RegisteredTools: React.FC<RegisteredToolsProps> = ({ tools }) => {
  const [toolSearch, setToolSearch] = useState("");

  const filteredTools = useMemo(
    () =>
      tools.filter(tool =>
        tool.name.toLowerCase().includes(toolSearch.toLowerCase()) ||
        (tool.description && tool.description.toLowerCase().includes(toolSearch.toLowerCase()))
      ),
    [tools, toolSearch]
  );

  const connected = tools && tools.length > 0;

  return (
    <Paper variant="outlined" sx={{ p: 2 }}>
      <Typography variant="h6" gutterBottom>Registered Tools</Typography>
      <TextField
        value={toolSearch}
        onChange={e => setToolSearch(e.target.value)}
        placeholder="Search tools..."
        size="small"
        fullWidth
        sx={{ mb: 2 }}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon />
            </InputAdornment>
          ),
        }}
        disabled={!connected}
      />
      {!connected ? (
        <Typography variant="body2" color="text.secondary">
          Connect to Event Source to view tools.
        </Typography>
      ) : filteredTools.length === 0 ? (
        <Typography variant="body2" color="text.secondary">
          No tools found.
        </Typography>
      ) : (
        <div>
          {filteredTools.map((tool, idx) => (
            <Accordion key={tool.name || idx} sx={{ mb: 1 }}>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography fontWeight="bold">{tool.name}</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Typography variant="subtitle2" gutterBottom>Description</Typography>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  {tool.description || "No description"}
                </Typography>
                {tool.inputSchema?.properties && (
                  <>
                    <Typography variant="subtitle2" gutterBottom>Parameters</Typography>
                    <Table size="small" sx={{ mb: 1 }}>
                      <TableHead>
                        <TableRow>
                          <TableCell>Name</TableCell>
                          <TableCell>Type</TableCell>
                          <TableCell>Description</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {Object.entries(tool.inputSchema.properties).map(([key, value]: any) => (
                          <TableRow key={key}>
                            <TableCell>{key}</TableCell>
                            <TableCell>{value.type}</TableCell>
                            <TableCell>{value.description}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </>
                )}
              </AccordionDetails>
            </Accordion>
          ))}
        </div>
      )}
    </Paper>
  );
};

export default RegisteredTools;
