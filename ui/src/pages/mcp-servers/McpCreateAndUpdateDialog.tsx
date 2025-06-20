import React, { useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogActions,
  DialogContent,
  Box,
  TextField,
  Button,
  Typography,
  ToggleButtonGroup,
  ToggleButton,
  Tooltip,
  IconButton,
  Chip,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  FormLabel,
  Stack,
  useTheme,
  alpha,
  InputAdornment,
  CircularProgress,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import InfoIcon from "@mui/icons-material/Info";
import StorageIcon from "@mui/icons-material/Storage";
import BusinessIcon from "@mui/icons-material/Business";
import CodeIcon from "@mui/icons-material/Code";
import SettingsIcon from "@mui/icons-material/Settings";
import BuildIcon from "@mui/icons-material/Build";
import TerminalIcon from "@mui/icons-material/Terminal";
import ErrorIcon from "@mui/icons-material/Error";
import axios from "axios";
import { useUserContext } from "../../providers/UserProvider";
import { useDynamicSnackbar } from "../../hooks/useDynamicSnackbar";
import { useMcpServers } from "./context/McpServerContext";
import { useForm, Controller } from "react-hook-form";
import Joi from "joi";
import { joiResolver } from "@hookform/resolvers/joi";
import { motion, AnimatePresence } from "framer-motion";
import CreateAndUpdateOrganization from "../organization/CreateAndUpdateOrganization";
import AddIcon from "@mui/icons-material/Add";
import ListItemIcon from "@mui/material/ListItemIcon";
import { createContainer } from "./docker-container/default-config.nodejs";
import { AdvanceContainerConfig } from "./AdvanceContainerConfig";

const API_BASE = "http://localhost:3000/v1/api/mcp-server";
const ORGANIZATION_API_BASE = "http://localhost:3000/v1/api/organization";

// Animated MUI components
const MotionDialog = motion(Dialog);
const MotionBox = motion(Box);
const MotionFormControl = motion(FormControl);

const toolLanguages = [
  { langId: "1", langName: "Node JS", langSlug: "node_js", disabled: false, icon: <CodeIcon /> },
  { langId: "2", langName: "Python", langSlug: "python", disabled: false, icon: <TerminalIcon /> },
];

const toolTemplates = [
  { templateLangSlug: "node_js", templateName: "Node Template 1", templateId: "t1", icon: <BuildIcon /> },
  { templateLangSlug: "python", templateName: "Python Template 1", templateId: "t2", icon: <BuildIcon /> }
];

const serverContainerConfigs: any = [
  { serverContainerConfigId: "c1", profileName: "Config 1", icon: <StorageIcon /> },
  { serverContainerConfigId: "c2", profileName: "custom", icon: <SettingsIcon /> },
];

// Joi validation schema
const schema = Joi.object({
  company: Joi.string().required().label("Company"),
  serverName: Joi.string()
    .regex(/^[a-z_]+$/)
    .required()
    .label("MCP Server Name")
    .messages({
      "string.pattern.base":
        "Only lowercase letters and underscores allowed. No spaces, numbers, or special characters.",
    }),
  toolLang: Joi.string().required().label("Tool Language"),
  toolTemplate: Joi.string().required().label("Tool Template"),
  containerConfig: Joi.string().required().label("Container Config"),
});

interface FormValues {
  company: string;
  serverName: string;
  toolLang: string;
  toolTemplate: string;
  containerConfig: string;
}

interface McpCreateAndUpdateDialogProps {
  open: boolean;
  onClose: () => void;
  editServer: any | null;
}

// Animation variants
const fadeIn = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.3 } }
};

const slideUp = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      duration: 0.5,
      staggerChildren: 0.08,
      ease: "easeOut"
    }
  }
};

const itemAnimation = {
  hidden: { opacity: 0, y: 15 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.25, ease: "easeOut" } }
};

const errorAnimation = {
  hidden: { opacity: 0, height: 0 },
  visible: { opacity: 1, height: "auto", transition: { duration: 0.2 } },
  exit: { opacity: 0, height: 0, transition: { duration: 0.2 } }
};

// Improved toggle button styling with lighter selection style
const getToggleButtonStyle = (selected: boolean, theme: any) => ({
  borderRadius: 3,
  border: selected
    ? `1px solid ${theme.palette.primary.main}`
    : `1px solid ${theme.palette.divider}`,
  backgroundColor: selected
    ? alpha(theme.palette.primary.main, 0.12) // Lighter blue background
    : theme.palette.background.paper,
  color: selected ? theme.palette.primary.main : theme.palette.text.primary,
  fontWeight: selected ? 600 : 400,
  boxShadow: selected ? `0 0 0 1px ${alpha(theme.palette.primary.main, 0.2)}` : "none",
  transition: "all 0.2s cubic-bezier(0.25, 0.1, 0.25, 1.0)",
  minWidth: 140,
  height: 44,
  padding: "6px 16px",
  margin: "2px",
  "&:hover": {
    backgroundColor: selected
      ? alpha(theme.palette.primary.main, 0.18) // Slightly darker on hover, still light
      : alpha(theme.palette.primary.light, 0.08),
    color: selected ? theme.palette.primary.dark : theme.palette.primary.main,
    borderColor: selected ? theme.palette.primary.main : theme.palette.primary.light,
    transform: "translateY(-1px)",
    boxShadow: selected
      ? `0 2px 5px 0 ${alpha(theme.palette.primary.main, 0.2)}`
      : theme.shadows[1],
  },
  "&:active": {
    transform: "translateY(0px)",
    boxShadow: "none",
  },
  "& .MuiBox-root": {
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
    maxWidth: "150px",
  }
});

const McpCreateAndUpdateDialog: React.FC<McpCreateAndUpdateDialogProps> = ({
  open,
  onClose,
  editServer,
}) => {
  const theme = useTheme();
  const { user } = useUserContext();
  const showSnackbar = useDynamicSnackbar();
  const { invalidateServers } = useMcpServers();

  const [organizations, setOrganizations] = React.useState<{ organizationId: string; organizationName: string }[]>([]);
  const [orgLoading, setOrgLoading] = React.useState(false);
  const [openCreateOrg, setOpenCreateOrg] = React.useState(false);
  const [newlyCreatedOrgId, setNewlyCreatedOrgId] = React.useState<string | null>(null);

  // Default values to prevent UI jumping
  const defaultToolLang = "1"; // Node JS
  const defaultContainerConfig = "c1"; // Server Config 1

  // Use useForm as before, but remove defaultCompany from here
  const {
    control,
    handleSubmit,
    watch,
    reset,
    trigger,
    setValue,
    formState: { errors, isValid, dirtyFields, isDirty },
  } = useForm<FormValues>({
    resolver: joiResolver(schema),
    mode: "onChange",
    defaultValues: {
      company: "", // Will set after organizations load
      serverName: "",
      toolLang: defaultToolLang,
      toolTemplate: toolTemplates[0].templateId,
      containerConfig: defaultContainerConfig,
    },
  });

  const containerConfig = watch("containerConfig");
  const toolLang = watch("toolLang");
  const serverName = watch("serverName");

  // Real-time server name validation
  const isServerNameValid = serverName && /^[a-z_]+$/.test(serverName);

  useEffect(() => {
    if (open) {
      reset({
        company: organizations[0]?.organizationId || "",
        serverName: editServer?.mcpServerName || "",
        toolLang: defaultToolLang,
        toolTemplate: toolTemplates[0].templateId,
        containerConfig: defaultContainerConfig,
      });
      setTimeout(() => {
        trigger();
      }, 100);
    }
    // eslint-disable-next-line
  }, [editServer, open, reset, organizations]);

  // Fetch organizations from API
  const fetchOrganizations = async (selectOrgId?: string) => {
    setOrgLoading(true);
    const token = localStorage.getItem("token");
    try {
      const response = await axios.get(`${ORGANIZATION_API_BASE}/list`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const orgs = response.data.data || [];
      setOrganizations(orgs);

      // Auto-select logic
      if (orgs.length > 0) {
        if (selectOrgId) {
          setValue("company", selectOrgId, { shouldValidate: true });
        } else if (!watch("company")) {
          setValue("company", orgs[0].organizationId, { shouldValidate: true });
        }
      }
    } catch {
      setOrganizations([]);
    }
    setOrgLoading(false);
  };

  // On open or after org creation, fetch orgs and handle auto-select
  React.useEffect(() => {
    fetchOrganizations(newlyCreatedOrgId || undefined);
    // Reset the flag after using it
    if (newlyCreatedOrgId) setNewlyCreatedOrgId(null);
    // eslint-disable-next-line
  }, [open, openCreateOrg]);

  const onSubmit = async (data: FormValues) => {
    const token = localStorage.getItem("token");
    if (!user?.userId || !token) {
      showSnackbar("User not authenticated", "error");
      return;
    }
    try {
      if (editServer) {
        await axios.patch(
          `${API_BASE}/update/${editServer.mcpServerId}`,
          { mcpServerName: data.serverName },
          { headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" } }
        );
        showSnackbar("MCP Server updated successfully!", "success");
      } else {
        await createContainer(data.serverName).then(async (res) => {
          await axios.post(
            `${API_BASE}/create`,
            {
              userId: user.userId,
              mcpServerCreatorId: user.userId,
              mcpServerName: data.serverName,
            },
            { headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" } }
          );
          showSnackbar("MCP Server created successfully!", "success");
        }).catch((err) => {
          showSnackbar(`Failed to create Docker container: ${err.message}`, "error");
        });

      }
      invalidateServers();
      onClose();
    } catch (err: any) {
      showSnackbar(
        `Failed to ${editServer ? "update" : "create"} MCP Server: ` +
        (err.response?.data?.message || err.message),
        "error"
      );
    }
  };

  // Prevent deselecting all in ToggleButtonGroup
  const handleToggleChange = (field: any, value: string) => {
    if (value) field.onChange(value);
  };

  // Error message component
  const ErrorMessage = ({ error }: { error?: any }) => (
    <AnimatePresence>
      {error && (
        <motion.div
          initial="hidden"
          animate="visible"
          exit="exit"
          variants={errorAnimation}
          style={{ overflow: "hidden" }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, mt: 0.5 }}>
            <ErrorIcon fontSize="small" color="error" />
            <Typography color="error.main" variant="caption" fontWeight={500}>
              {error.message}
            </Typography>
          </Box>
        </motion.div>
      )}
    </AnimatePresence>
  );

  return (
    <MotionDialog
      open={open}
      onClose={() => onClose()}
      maxWidth={false}
      fullWidth
      PaperProps={{
        sx: {
          background: theme.palette.background.default,
          width: "1000px",
          maxWidth: "100%",
          overflow: "hidden",
          boxShadow: theme.shadows[10],
        }
      }}
      initial="hidden"
      animate="visible"
      variants={fadeIn}
    >
      <DialogTitle sx={{
        fontWeight: 700,
        pb: 1,
        display: "flex",
        alignItems: "center",
        gap: 1,
        borderBottom: `1px solid ${alpha(theme.palette.divider, 0.6)}`
      }}>
        <BusinessIcon sx={{ color: theme.palette.primary.main, mr: 1 }} />
        {editServer ? "Update MCP Server" : "Create MCP Server"}
      </DialogTitle>
      <DialogContent sx={{ pt: 2 }}>
        <MotionBox
          p={3}
          variants={slideUp}
          initial="hidden"
          animate="visible"
        >
          <Stack spacing={3}>
            {/* 1. Select Organization */}
            <MotionFormControl
              variants={itemAnimation}
              fullWidth
              required
              error={!!errors.company}
              sx={{
                transition: "all 0.2s",
                minHeight: 100, // Reserve space for loader/validation
              }}
            >
              <Box sx={{ display: "flex", alignItems: "center", mb: 0.5 }}>
                <InputLabel id="company-label" sx={{ flex: 1 }}>
                  Select Organization
                </InputLabel>
              </Box>
              {orgLoading ? (
                <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: 56 }}>
                  <CircularProgress size={22} sx={{ mr: 1 }} />
                  <Typography variant="body2" color="text.secondary">
                    Loading organizations...
                  </Typography>
                </Box>
              ) : (
                <Box sx={{ minHeight: 56 }}>
                  <Controller
                    name="company"
                    control={control}
                    render={({ field }) => (
                      <Select
                        {...field}
                        labelId="company-label"
                        label="Select Organization"
                        fullWidth
                        startAdornment={<BusinessIcon sx={{ mr: 1 }} />}
                        sx={{ mb: 0.8 }}
                        disabled={orgLoading}
                        MenuProps={{
                          PaperProps: {
                            sx: { maxHeight: 320 }
                          }
                        }}
                      >
                        {organizations.length === 0 && (
                          <MenuItem value="">
                            <Typography variant="body2">No organizations found</Typography>
                          </MenuItem>
                        )}
                        {organizations.map((org) => (
                          <MenuItem key={org.organizationId} value={org.organizationId}>
                            {org.organizationName}
                          </MenuItem>
                        ))}
                        <MenuItem
                          value="__create__"
                          onClick={e => {
                            e.stopPropagation();
                            setOpenCreateOrg(true);
                            // Prevent select from closing
                          }}
                          sx={{
                            borderTop: "1px solid",
                            borderColor: theme.palette.divider,
                            mt: 1,
                            color: theme.palette.primary.main,
                            fontWeight: 600,
                          }}
                        >
                          <ListItemIcon>
                            <AddIcon color="primary" />
                          </ListItemIcon>
                          Create Organization
                        </MenuItem>
                      </Select>
                    )}
                  />
                  <ErrorMessage error={errors.company} />
                </Box>
              )}
            </MotionFormControl>
            <CreateAndUpdateOrganization
              open={openCreateOrg}
              onClose={(refresh?: boolean, createdOrg?: { organizationId: string }) => {
                setOpenCreateOrg(false);
                if (refresh && createdOrg?.organizationId) {
                  setNewlyCreatedOrgId(createdOrg.organizationId);
                } else if (refresh) {
                  fetchOrganizations();
                }
              }}
              organization={null}
            />

            {/* 2. Server name */}
            <MotionFormControl
              variants={itemAnimation}
              fullWidth
              required
              error={!!errors.serverName}
              sx={{
                transition: "all 0.2s",
              }}
            >
              <Controller
                name="serverName"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="MCP Server Name"
                    autoFocus
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <CodeIcon fontSize="small" />
                        </InputAdornment>
                      ),
                      endAdornment: (
                        <Tooltip title="Only lowercase letters and underscores allowed. No spaces, numbers, or special characters.">
                          <IconButton size="small">
                            <InfoIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      ),
                    }}
                    error={!!errors.serverName && dirtyFields.serverName}
                    helperText={
                      (dirtyFields.serverName && errors.serverName)
                        ? errors.serverName.message
                        : "Only lowercase letters and underscores allowed."
                    }
                    FormHelperTextProps={{
                      sx: {
                        color: (dirtyFields.serverName && errors.serverName) ? "error.main" : "text.secondary",
                        display: "flex",
                        alignItems: "center",
                        mt: 0.5
                      }
                    }}
                    inputProps={{ maxLength: 32 }}
                    required
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        transition: "all 0.2s cubic-bezier(0.25, 0.1, 0.25, 1.0)",
                      },
                      "& .MuiOutlinedInput-notchedOutline": {
                        borderColor: (dirtyFields.serverName && !isServerNameValid && serverName)
                          ? theme.palette.error.main
                          : undefined
                      }
                    }}
                  />
                )}
              />
              {dirtyFields.serverName && !isServerNameValid && serverName && (
                <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, mt: 0.5 }}>
                  <ErrorIcon fontSize="small" color="error" />
                  <Typography color="error.main" variant="caption" fontWeight={500}>
                    MCP Server Name: Only lowercase letters and underscores allowed
                  </Typography>
                </Box>
              )}
            </MotionFormControl>

            {/* 3. Tool Language */}
            <Box
              component={motion.div}
              variants={itemAnimation}
              sx={{ mb: 1 }}
            >
              <FormLabel sx={{
                fontWeight: 600,
                mb: 1.5,
                display: "flex",
                alignItems: "center",
                gap: 1
              }}>
                <TerminalIcon sx={{ mr: 1 }} />
                Tool Language
              </FormLabel>
              <Controller
                name="toolLang"
                control={control}
                render={({ field }) => (
                  <>
                    <ToggleButtonGroup
                      value={field.value}
                      exclusive
                      onChange={(_, v) => handleToggleChange(field, v)}
                      sx={{
                        width: "100%",
                        display: "flex",
                        flexWrap: "nowrap",
                        overflow: "auto",
                        justifyContent: "flex-start",
                        mt: 0.5,
                        mb: 1,
                        "&::-webkit-scrollbar": {
                          height: 6,
                          background: alpha(theme.palette.background.default, 0.7),
                        },
                        "&::-webkit-scrollbar-thumb": {
                          background: alpha(theme.palette.primary.main, 0.2),
                          borderRadius: 3,
                          "&:hover": {
                            background: alpha(theme.palette.primary.main, 0.3),
                          }
                        }
                      }}
                    >
                      {toolLanguages.map((lang) => (
                        <ToggleButton
                          key={lang.langId}
                          value={lang.langId}
                          disabled={lang.disabled}
                          sx={getToggleButtonStyle(field.value === lang.langId, theme)}
                        >
                          {lang.icon}
                          <Box component="span" sx={{
                            ml: 1,
                            whiteSpace: "nowrap",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                          }}>
                            {lang.langName}
                          </Box>
                          {lang.disabled && (
                            <Chip
                              label="Coming Soon"
                              size="small"
                              color="warning"
                              sx={{
                                ml: 1,
                                height: 20,
                                fontSize: '0.65rem',
                              }}
                            />
                          )}
                        </ToggleButton>
                      ))}
                    </ToggleButtonGroup>
                    <ErrorMessage error={errors.toolLang} />
                  </>
                )}
              />
            </Box>

            {/* 4. Tool Template */}
            <Box
              component={motion.div}
              variants={itemAnimation}
              sx={{ mb: 1 }}
            >
              <FormLabel sx={{
                fontWeight: 600,
                mb: 1.5,
                display: "flex",
                alignItems: "center",
                gap: 1
              }}>
                <BuildIcon sx={{ mr: 1 }} />
                Tool Template
              </FormLabel>
              <Controller
                name="toolTemplate"
                control={control}
                render={({ field }) => (
                  <>
                    <AnimatePresence mode="wait">
                      <motion.div
                        key={toolLang}
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -5 }}
                        transition={{ duration: 0.25, ease: "easeOut" }}
                      >
                        <ToggleButtonGroup
                          value={field.value}
                          exclusive
                          onChange={(_, v) => handleToggleChange(field, v)}
                          sx={{
                            width: "100%",
                            display: "flex",
                            flexWrap: "nowrap",
                            overflow: "auto",
                            justifyContent: "flex-start",
                            mt: 0.5,
                            mb: 1,
                            "&::-webkit-scrollbar": {
                              height: 6,
                              background: alpha(theme.palette.background.default, 0.7),
                            },
                            "&::-webkit-scrollbar-thumb": {
                              background: alpha(theme.palette.primary.main, 0.2),
                              borderRadius: 3,
                              "&:hover": {
                                background: alpha(theme.palette.primary.main, 0.3),
                              }
                            }
                          }}
                        >
                          {toolTemplates
                            .filter((tpl) =>
                              toolLanguages.find((l) => l.langId === toolLang)?.langSlug === tpl.templateLangSlug
                            )
                            .map((tpl) => (
                              <ToggleButton
                                key={tpl.templateId}
                                value={tpl.templateId}
                                sx={getToggleButtonStyle(field.value === tpl.templateId, theme)}
                              >
                                {tpl.icon}
                                <Box component="span" sx={{
                                  ml: 1,
                                  whiteSpace: "nowrap",
                                  overflow: "hidden",
                                  textOverflow: "ellipsis",
                                }}>
                                  {tpl.templateName}
                                </Box>
                              </ToggleButton>
                            ))}
                        </ToggleButtonGroup>
                      </motion.div>
                    </AnimatePresence>
                    <ErrorMessage error={errors.toolTemplate} />
                  </>
                )}
              />
            </Box>

            {/* 5. Container Config */}
            <Box
              component={motion.div}
              variants={itemAnimation}
              sx={{ mb: 1 }}
            >
              <FormLabel sx={{
                fontWeight: 600,
                mb: 1.5,
                display: "flex",
                alignItems: "center",
                gap: 1
              }}>
                <StorageIcon sx={{ mr: 1 }} />
                Container Config
              </FormLabel>
              <Controller
                name="containerConfig"
                control={control}
                render={({ field }) => (
                  <>
                    <ToggleButtonGroup
                      value={field.value}
                      exclusive
                      onChange={(_, v) => handleToggleChange(field, v)}
                      sx={{
                        width: "100%",
                        display: "flex",
                        flexWrap: "nowrap",
                        overflow: "auto",
                        justifyContent: "flex-start",
                        mt: 0.5,
                        mb: 1,
                        "&::-webkit-scrollbar": {
                          height: 6,
                          background: alpha(theme.palette.background.default, 0.7),
                        },
                        "&::-webkit-scrollbar-thumb": {
                          background: alpha(theme.palette.primary.main, 0.2),
                          borderRadius: 3,
                          "&:hover": {
                            background: alpha(theme.palette.primary.main, 0.3),
                          }
                        }
                      }}
                    >
                      {serverContainerConfigs.map((cfg: any) => (
                        <ToggleButton
                          key={cfg.serverContainerConfigId}
                          value={cfg.serverContainerConfigId}
                          disabled={cfg.disabled}
                          sx={getToggleButtonStyle(field.value === cfg.serverContainerConfigId, theme)}
                        >
                          {cfg.icon}
                          <Box component="span" sx={{
                            ml: 1,
                            whiteSpace: "nowrap",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                          }}>
                            {cfg.profileName}
                          </Box>
                          {cfg.disabled && (
                            <Chip
                              label="Coming Soon"
                              size="small"
                              color="warning"
                              sx={{
                                ml: 1,
                                height: 20,
                                fontSize: '0.65rem',
                              }}
                            />
                          )}
                        </ToggleButton>
                      ))}
                    </ToggleButtonGroup>
                    <ErrorMessage error={errors.containerConfig} />
                  </>
                )}
              />
            </Box>
          </Stack>
        </MotionBox>

        {/* Advanced Settings Accordion */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.4 }}
        >
          <Accordion
            expanded={containerConfig === "c2"}
            disabled={containerConfig !== "c2"}
            sx={{
              mt: 2,
              borderRadius: 2,
              background: containerConfig === "c2"
                ? alpha(theme.palette.secondary.main, 0.06)
                : theme.palette.background.paper,
              boxShadow: containerConfig === "c2" ? theme.shadows[1] : "none",
              border: containerConfig === "c2"
                ? `1px solid ${alpha(theme.palette.secondary.main, 0.5)}`
                : `1px solid ${theme.palette.divider}`,
              transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
              opacity: containerConfig === "c2" ? 1 : 0.7,
              overflow: "hidden"
            }}
          >
            <AccordionSummary
              expandIcon={<ExpandMoreIcon />}
              sx={{
                transition: "all 0.2s",
                "&:hover": {
                  backgroundColor: alpha(theme.palette.secondary.main, 0.05)
                }
              }}
            >
              <Typography variant="h6" sx={{ fontWeight: 700, color: theme.palette.secondary.main, alignItems: "center", display: "flex" }}>
                <SettingsIcon sx={{ mr: 1 }} />
                Advanced Settings
              </Typography>
            </AccordionSummary>
            <AccordionDetails>
              <AdvanceContainerConfig />
            </AccordionDetails>
          </Accordion>
        </motion.div>
      </DialogContent>

      <DialogActions sx={{
        px: 3,
        py: 2,
        borderTop: `1px solid ${alpha(theme.palette.divider, 0.6)}`
      }}>
        <Button
          onClick={onClose}
          sx={{
            fontWeight: 500,
            transition: "all 0.2s cubic-bezier(0.25, 0.1, 0.25, 1.0)",
            "&:hover": {
              transform: "translateY(-1px)",
              boxShadow: theme.shadows[1]
            }
          }}
        >
          CANCEL
        </Button>
        <Button
          variant="contained"
          onClick={handleSubmit(onSubmit)}
          disabled={!isValid || (editServer && !isDirty)}
          sx={{
            fontWeight: 500,
            transition: "all 0.2s cubic-bezier(0.25, 0.1, 0.25, 1.0)",
            "&:hover": {
              transform: !isValid ? "none" : "translateY(-1px)",
              boxShadow: !isValid ? "none" : theme.shadows[3]
            },
            "&.Mui-disabled": {
              backgroundColor: alpha(theme.palette.primary.main, 0.4),
              color: "white",
            }
          }}
        >
          {editServer ? "UPDATE" : "CREATE"}
        </Button>
      </DialogActions>
    </MotionDialog>
  );
};

export default McpCreateAndUpdateDialog;
