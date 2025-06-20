import React from "react";
import {
  Paper,
  Stack,
  Typography,
  TextField,
  IconButton,
  Box,
  Button,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";

interface NetworkProps {
  values?: {
    internalPorts?: number[];
    externalPort?: number;
  };
  onChange?: (values: { internalPorts: number[]; externalPort: number }) => void;
}

const defaultValues = {
  internalPorts: [3000],
  externalPort: 80,
};

const Network: React.FC<NetworkProps> = ({
  values = defaultValues,
  onChange,
}) => {
  const [internalPorts, setInternalPorts] = React.useState<number[]>(
    values.internalPorts ?? [3000]
  );
  const [externalPort, setExternalPort] = React.useState<number>(
    values.externalPort ?? 80
  );
  const [newPort, setNewPort] = React.useState<string>("");

  React.useEffect(() => {
    if (onChange) onChange({ internalPorts, externalPort });
    // eslint-disable-next-line
  }, [internalPorts, externalPort]);

  const handleAddPort = () => {
    const port = parseInt(newPort, 10);
    if (
      !isNaN(port) &&
      port > 0 &&
      port < 65536 &&
      !internalPorts.includes(port)
    ) {
      setInternalPorts([...internalPorts, port]);
      setNewPort("");
    }
  };

  const handleDeletePort = (port: number) => {
    setInternalPorts(internalPorts.filter((p) => p !== port));
  };

  return (
    <Paper
      elevation={0}
      sx={{
        p: { xs: 2, sm: 4 },
        bgcolor: "#fff",
        borderRadius: 2,
        border: (theme) => `1px solid ${theme.palette.divider}`,
        maxWidth: 500,
        mx: "auto",
      }}
    >
      <Stack spacing={4}>
        <Typography variant="h6" fontWeight={700} textAlign="center">
          Network
        </Typography>

        {/* External Port */}
        <Box>
          <Typography fontWeight={600} sx={{ mb: 1 }}>
            External Port
          </Typography>
          <TextField
            type="number"
            label="External Port"
            value={externalPort}
            onChange={(e) => {
              const val = parseInt(e.target.value, 10);
              if (!isNaN(val) && val > 0 && val < 65536) setExternalPort(val);
              else if (e.target.value === "") setExternalPort(0);
            }}
            inputProps={{ min: 1, max: 65535 }}
            fullWidth
          />
        </Box>

        {/* Internal Ports */}
        <Box>
          <Typography fontWeight={600} sx={{ mb: 1 }}>
            Internal Ports
          </Typography>
          <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
            <TextField
              type="number"
              label="Add Internal Port"
              value={newPort}
              onChange={(e) => setNewPort(e.target.value.replace(/[^0-9]/g, ""))}
              inputProps={{ min: 1, max: 65535 }}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleAddPort();
                }
              }}
              size="small"
            />
            <Button
              variant="contained"
              onClick={handleAddPort}
              disabled={
                !newPort ||
                isNaN(Number(newPort)) ||
                Number(newPort) < 1 ||
                Number(newPort) > 65535 ||
                internalPorts.includes(Number(newPort))
              }
              sx={{ textTransform: "capitalize" }}
            >
              Add
            </Button>
          </Stack>
          <Stack spacing={1}>
            {internalPorts.map((port) => (
              <Box
                key={port}
                sx={{
                  display: "flex",
                  alignItems: "center",
                  bgcolor: "#f5f5f5",
                  borderRadius: 1,
                  px: 2,
                  py: 1,
                  mb: 0.5,
                }}
              >
                <Typography sx={{ flex: 1 }}>{port}</Typography>
                <IconButton
                  aria-label="delete"
                  onClick={() => handleDeletePort(port)}
                  size="small"
                  disabled={internalPorts.length === 1}
                >
                  <DeleteIcon fontSize="small" />
                </IconButton>
              </Box>
            ))}
          </Stack>
        </Box>
      </Stack>
    </Paper>
  );
};

export default Network;