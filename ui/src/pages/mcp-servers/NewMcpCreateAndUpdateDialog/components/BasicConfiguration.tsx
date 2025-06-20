import React from "react";
import {
  TextField,
  FormControl,
  FormHelperText,
  Stack,
  Typography,
  Paper,
  ToggleButton,
  ToggleButtonGroup,
} from "@mui/material";
import { useFormik } from "formik";
import * as Yup from "yup";

const TECHNOLOGIES = [
  { value: "Node JS", label: "Node JS" },
  { value: "Python", label: "Python" },
];

const TEMPLATES = {
  "Node JS": [
    { value: "basic", label: "Basic Template" },
    { value: "advance", label: "Advance Template" },
  ],
  Python: [
    { value: "basic", label: "Basic Template" },
    { value: "advance", label: "Advance Template" },
  ],
};

const validationSchema = Yup.object({
  serverName: Yup.string()
    .min(3, "Must be at least 3 characters")
    .max(32, "Must be at most 32 characters")
    .required("MCP Server Name is required"),
  technology: Yup.string().oneOf(["Node JS", "Python"]).required("Technology is required"),
  template: Yup.string().required("Template is required"),
});

export interface BasicConfigValues {
  serverName: string;
  technology: "Node JS" | "Python" | "";
  template: string;
}

interface BasicConfigurationProps {
  initialValues?: BasicConfigValues;
  onChange?: (values: BasicConfigValues) => void;
}

const BasicConfiguration: React.FC<BasicConfigurationProps> = ({
  initialValues = {
    serverName: "",
    technology: "Node JS", // Auto-select Node JS by default
    template: "basic",     // Auto-select Basic Template by default
  },
  onChange,
}) => {
  const formik = useFormik<BasicConfigValues>({
    initialValues,
    validationSchema,
    validateOnMount: true,
    onSubmit: () => {},
    enableReinitialize: true, // Allow initialValues to be respected on mount
  });

  // Notify parent on value change
  React.useEffect(() => {
    if (onChange) onChange(formik.values);
    // eslint-disable-next-line
  }, [formik.values]);

  // Prevent deselection for technology
  const handleTechnologyChange = (_: React.MouseEvent<HTMLElement>, val: string) => {
    if (val) {
      formik.setFieldValue("technology", val);
      formik.setFieldValue("template", "");
    }
  };

  // Prevent deselection for template
  const handleTemplateChange = (_: React.MouseEvent<HTMLElement>, val: string) => {
    if (val) {
      formik.setFieldValue("template", val);
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
            Basic Configuration
          </Typography>
          <TextField
            fullWidth
            label="MCP Server Name"
            name="serverName"
            autoFocus
            value={formik.values.serverName}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={formik.touched.serverName && Boolean(formik.errors.serverName)}
            helperText={formik.touched.serverName && formik.errors.serverName}
            autoComplete="off"
            inputProps={{ maxLength: 32 }}
          />

          <FormControl
            fullWidth
            error={formik.touched.technology && Boolean(formik.errors.technology)}
          >
            <Typography fontWeight={600} sx={{ mb: 1 }}>
              Technology
            </Typography>
            <ToggleButtonGroup
              color="primary"
              exclusive
              value={formik.values.technology}
              onChange={handleTechnologyChange}
              sx={{ width: "100%" }}
            >
              {TECHNOLOGIES.map((tech) => (
                <ToggleButton
                  key={tech.value}
                  value={tech.value}
                  sx={{ flex: 1, textTransform: "capitalize", minHeight: 44 }}
                >
                  {tech.label}
                </ToggleButton>
              ))}
            </ToggleButtonGroup>
            <FormHelperText>
              {formik.touched.technology && formik.errors.technology}
            </FormHelperText>
          </FormControl>

          <FormControl
            fullWidth
            error={formik.touched.template && Boolean(formik.errors.template)}
            disabled={!formik.values.technology}
          >
            <Typography fontWeight={600} sx={{ mb: 1 }}>
              Template
            </Typography>
            <ToggleButtonGroup
              color="primary"
              exclusive
              value={formik.values.template}
              onChange={handleTemplateChange}
              sx={{ width: "100%" }}
            >
              {formik.values.technology &&
                TEMPLATES[formik.values.technology as "Node JS" | "Python"].map((tpl) => (
                  <ToggleButton
                    key={tpl.value}
                    value={tpl.value}
                    sx={{ flex: 1, textTransform: "capitalize", minHeight: 44 }}
                  >
                    {tpl.label}
                  </ToggleButton>
                ))}
            </ToggleButtonGroup>
            <FormHelperText>
              {formik.touched.template && formik.errors.template}
            </FormHelperText>
          </FormControl>
        </Stack>
      </form>
    </Paper>
  );
};

export default BasicConfiguration;