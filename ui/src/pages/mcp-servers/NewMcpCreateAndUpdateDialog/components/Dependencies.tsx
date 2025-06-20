import React from "react";
import {
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Checkbox,
  ListItemText,
  Chip,
  OutlinedInput,
  Stack,
  Typography,
  Paper,
  FormHelperText,
  FormControlLabel,
  ToggleButton,
  ToggleButtonGroup,
  Tooltip,
} from "@mui/material";
import { useFormik } from "formik";
import * as Yup from "yup";
import TerminalIcon from "@mui/icons-material/Terminal";
import AdbIcon from "@mui/icons-material/Adb";
import LayersIcon from "@mui/icons-material/Layers";
import StorageIcon from "@mui/icons-material/Storage";

// Machine types with icons
const MACHINE_TYPES = [
  { value: "ubuntu", label: "Ubuntu", icon: <TerminalIcon sx={{ color: "#e95420" }} /> },
  { value: "debian", label: "Debian", icon: <AdbIcon sx={{ color: "#a80030" }} /> },
  { value: "alpine", label: "Alpine", icon: <LayersIcon sx={{ color: "#0d597f" }} /> },
  { value: "centos", label: "CentOS", icon: <StorageIcon sx={{ color: "#262577" }} /> },
];

// All dependencies (add as many as you want)
const ALL_DEPENDENCIES = [
  { value: "sudo", label: "sudo", required: true },
  { value: "gnupg", label: "gnupg", required: true },
  { value: "mongodb-org", label: "mongodb-org", required: false },
  { value: "nodejs:22", label: "nodejs:22", required: false },
  { value: "mongodb:8.0", label: "mongodb:8.0", required: false },
  { value: "npm", label: "npm", required: false },
  { value: "git", label: "git", required: false },
  { value: "curl", label: "curl", required: false },
  { value: "lsof", label: "lsof", required: false },
  { value: "netstat", label: "netstat", required: false },
  // Add more dependencies here...
];

const REQUIRED_DEPENDENCIES = ALL_DEPENDENCIES.filter(d => d.required).map(d => d.value);

const validationSchema = Yup.object({
  machineType: Yup.string().required("Machine type is required"),
  dependencies: Yup.array().of(Yup.string()).min(REQUIRED_DEPENDENCIES.length, "Select at least required dependencies"),
  consent: Yup.boolean().oneOf([true], "You must consent to install the dependencies"),
});

export interface DependenciesValues {
  machineType: string;
  dependencies: string[];
  consent: boolean;
}

interface DependenciesProps {
  initialValues?: DependenciesValues;
  onChange?: (values: DependenciesValues) => void;
}

const Dependencies: React.FC<DependenciesProps> = ({
  initialValues = {
    machineType: "",
    dependencies: REQUIRED_DEPENDENCIES,
    consent: false,
  },
  onChange,
}) => {
  const formik = useFormik<DependenciesValues>({
    initialValues,
    validationSchema,
    validateOnMount: true,
    onSubmit: () => {},
    enableReinitialize: true,
  });

  // Notify parent on value change
  React.useEffect(() => {
    if (onChange) onChange(formik.values);
    // eslint-disable-next-line
  }, [formik.values]);

  // Prevent removing required dependencies
  const handleDependenciesChange = (event: any) => {
    let value = event.target.value as string[];
    // Always include required dependencies
    value = Array.from(new Set([...REQUIRED_DEPENDENCIES, ...value]));
    formik.setFieldValue("dependencies", value);
  };

  // Remove dependency (only if not required)
  const handleDelete = (dep: string) => {
    if (REQUIRED_DEPENDENCIES.includes(dep)) return;
    formik.setFieldValue(
      "dependencies",
      formik.values.dependencies.filter((d) => d !== dep)
    );
  };

  // ToggleButton handler for machine type
  const handleMachineTypeChange = (_: React.MouseEvent<HTMLElement>, val: string) => {
    if (val) {
      formik.setFieldValue("machineType", val);
    }
  };

  return (
    <Paper
      elevation={0}
      sx={{
        p: { xs: 2, sm: 3 },
        bgcolor: "#fff",
        borderRadius: 2,
        border: (theme) => `1px solid ${theme.palette.divider}`,
        maxWidth: 600,
        mx: "auto",
      }}
    >
      <form>
        <Stack spacing={3}>
          <Typography variant="h6" fontWeight={700} textAlign="center" sx={{ mb: 1 }}>
            Dependencies & Machine Type
          </Typography>

          {/* Machine Type Toggle Button */}
          <FormControl
            fullWidth
            error={formik.touched.machineType && Boolean(formik.errors.machineType)}
            sx={{ mb: 1 }}
          >
            <Typography fontWeight={600} sx={{ mb: 1 }}>
              Machine Type
            </Typography>
            <ToggleButtonGroup
              color="primary"
              exclusive
              value={formik.values.machineType}
              onChange={handleMachineTypeChange}
              sx={{ width: "100%", gap: 2, flexWrap: "wrap" }}
            >
              {MACHINE_TYPES.map((type) => (
                <ToggleButton
                  key={type.value}
                  value={type.value}
                  sx={{
                    flex: 1,
                    minWidth: 120,
                    minHeight: 48,
                    textTransform: "capitalize",
                    display: "flex",
                    alignItems: "center",
                    gap: 1.5,
                    fontWeight: 600,
                  }}
                >
                  <Tooltip title={type.label}>{type.icon}</Tooltip>
                  {type.label}
                </ToggleButton>
              ))}
            </ToggleButtonGroup>
            <FormHelperText>
              {formik.touched.machineType && formik.errors.machineType}
            </FormHelperText>
          </FormControl>

          {/* Dependencies Multi-select */}
          <FormControl
            fullWidth
            error={formik.touched.dependencies && Boolean(formik.errors.dependencies)}
          >
            <InputLabel id="dependencies-label">Dependencies</InputLabel>
            <Select
              labelId="dependencies-label"
              multiple
              value={formik.values.dependencies}
              onChange={handleDependenciesChange}
              input={<OutlinedInput label="Dependencies" />}
              renderValue={(selected) => (
                <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                  {(selected as string[]).map((value) => {
                    const dep = ALL_DEPENDENCIES.find((d) => d.value === value);
                    return (
                      <Chip
                        key={value}
                        label={dep?.label || value}
                        color={REQUIRED_DEPENDENCIES.includes(value) ? "primary" : "default"}
                        onDelete={
                          REQUIRED_DEPENDENCIES.includes(value)
                            ? undefined
                            : () => handleDelete(value)
                        }
                        sx={{
                          fontWeight: REQUIRED_DEPENDENCIES.includes(value) ? 700 : 400,
                          opacity: REQUIRED_DEPENDENCIES.includes(value) ? 0.8 : 1,
                        }}
                        variant={REQUIRED_DEPENDENCIES.includes(value) ? "filled" : "outlined"}
                      />
                    );
                  })}
                </Box>
              )}
              MenuProps={{
                PaperProps: {
                  style: { maxHeight: 320 },
                },
              }}
            >
              {ALL_DEPENDENCIES.map((dep) => (
                <MenuItem key={dep.value} value={dep.value} disabled={dep.required}>
                  <Checkbox checked={formik.values.dependencies.indexOf(dep.value) > -1} />
                  <ListItemText primary={dep.label} />
                  {dep.required && (
                    <Typography variant="caption" color="primary" sx={{ ml: 1 }}>
                      Required
                    </Typography>
                  )}
                </MenuItem>
              ))}
            </Select>
            <FormHelperText>
              {formik.touched.dependencies && formik.errors.dependencies}
            </FormHelperText>
          </FormControl>

          {/* Consent Checkbox */}
          <FormControl
            error={formik.touched.consent && Boolean(formik.errors.consent)}
            sx={{ mt: 1 }}
          >
            <FormControlLabel
              control={
                <Checkbox
                  checked={formik.values.consent}
                  onChange={formik.handleChange}
                  name="consent"
                  color="primary"
                />
              }
              label={
                <Typography variant="body2">
                  I consent to install the selected dependencies to my container by default.
                </Typography>
              }
            />
            <FormHelperText>
              {formik.touched.consent && formik.errors.consent}
            </FormHelperText>
          </FormControl>
        </Stack>
      </form>
    </Paper>
  );
};

export default Dependencies;