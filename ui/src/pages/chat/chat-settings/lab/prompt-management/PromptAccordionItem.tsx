import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Typography,
  TextField,
  Button,
  IconButton,
  Checkbox,
  FormControlLabel
} from "@mui/material";
import { ExpandMore, Delete } from "@mui/icons-material";
import MonacoEditor from "@monaco-editor/react";
import { Controller } from "react-hook-form";

const PromptAccordionItem = ({
  idx,
  item,
  expanded,
  onAccordionChange,
  control,
  errors,
  outputJsonErrors,
  promptValues,
  tokenSizes,
  handleSelectPrompt,
  handleDeletePrompt,
  openTestDrawer,
  fields
}: {
  idx: number;
  item: any;
  expanded: number | false;
  onAccordionChange: (panel: number) => (_event: React.SyntheticEvent, isExpanded: boolean) => void;
  control: any;
  errors: any;
  outputJsonErrors: any;
  promptValues: any;
  tokenSizes: any;
  handleSelectPrompt: (idx: number) => void;
  handleDeletePrompt: (idx: number) => void;
  openTestDrawer: (idx: number) => void;
  fields: any[];
}) => {
  const isDisabled = !promptValues?.[idx]?.isUseForChat;

  return (
    <Accordion
      expanded={expanded === idx}
      onChange={onAccordionChange(idx)}
      key={item.id}
      className="mb-3"
      sx={{
        background: promptValues?.[idx]?.isUseForChat ? "#e6f9ec" : "#fff5f5",
        border: promptValues?.[idx]?.isUseForChat ? "1.5px solid #4caf50" : "1.5px solid #ffcdd2",
        transition: "background 0.2s, border 0.2s"
      }}
    >
      <AccordionSummary expandIcon={<ExpandMore />}>
        <div className="container-fluid w-100">
          <div className="row align-items-center">
            <div className="col">
              <Typography>
                {`Prompt ${idx + 1}: `}
                <Controller
                  name={`prompt.${idx}.name`}
                  control={control}
                  render={({ field }) => (
                    <span style={{ fontWeight: 600 }}>
                      {field.value || "Untitled"}
                    </span>
                  )}
                />
              </Typography>
              {(errors.prompt?.[idx]?.name || errors.prompt?.[idx]?.prompt || outputJsonErrors[idx] || (errors.prompt && errors.prompt.message)) && (
                <Typography variant="caption" color="error" sx={{ display: "block", mt: 0.5 }}>
                  {errors.prompt?.[idx]?.name?.message ||
                    errors.prompt?.[idx]?.prompt?.message ||
                    outputJsonErrors[idx] ||
                    (errors.prompt && errors.prompt.message)}
                </Typography>
              )}
            </div>
            <div className="col-auto d-flex align-items-center justify-content-center">
              <Typography
                variant="caption"
                sx={{
                  background: "#e3f2fd",
                  color: "#1976d2",
                  borderRadius: "8px",
                  px: 2,
                  py: 0.5,
                  fontWeight: 600,
                  fontSize: 14,
                  mx: 2,
                  minWidth: 90,
                  textAlign: "center"
                }}
              >
                {`~${tokenSizes[idx] || 0} tokens`}
              </Typography>
            </div>
            <div className="col-auto d-flex align-items-center">
              <FormControlLabel
                control={
                  <Checkbox
                    checked={!!promptValues?.[idx]?.isUseForChat}
                    onChange={() => handleSelectPrompt(idx)}
                    color="success"
                  />
                }
                label="Use for chat"
                sx={{ mr: 2, userSelect: "none" }}
              />
            </div>
          </div>
        </div>
      </AccordionSummary>
      <AccordionDetails>
        <div className="row">
          <div className="col-12 col-md-12 mb-3">
            <IconButton
              aria-label="delete"
              color="error"
              onClick={e => {
                e.stopPropagation();
                handleDeletePrompt(idx);
              }}
              disabled={fields.length === 1}
              size="small"
            >
              <Delete />
            </IconButton>
          </div>
          <div className="col-12 col-md-6 mb-3">
            <Controller
              name={`prompt.${idx}.name`}
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Name"
                  error={!!errors.prompt?.[idx]?.name}
                  helperText={errors.prompt?.[idx]?.name?.message as string}
                  fullWidth
                  disabled={isDisabled}
                />
              )}
            />
          </div>
          <div className="col-12 col-md-6 mb-3">
            <Controller
              name={`prompt.${idx}.prompt`}
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Prompt"
                  multiline
                  minRows={2}
                  error={!!errors.prompt?.[idx]?.prompt}
                  helperText={errors.prompt?.[idx]?.prompt?.message as string}
                  fullWidth
                  disabled={isDisabled}
                />
              )}
            />
          </div>
          <div className="col-12 mb-3">
            <Controller
              name={`prompt.${idx}.output`}
              control={control}
              render={({ field }) => (
                <div>
                  <label style={{ fontWeight: 500, marginBottom: 4, display: "block" }}>Output Response</label>
                  <MonacoEditor
                    height="120px"
                    language="json"
                    theme="vs-dark"
                    value={field.value}
                    onChange={field.onChange}
                    options={{
                      minimap: { enabled: false },
                      fontSize: 14,
                      scrollBeyondLastLine: false,
                      wordWrap: "on",
                      readOnly: isDisabled,
                    }}
                  />
                </div>
              )}
            />
          </div>
          <div className="col-12 d-flex justify-content-end">
            <Button
              variant="outlined"
              color="primary"
              onClick={() => openTestDrawer(idx)}
              sx={{ mt: 1 }}
              disabled={isDisabled}
              title={
                promptValues?.[idx]?.isUseForChat
                  ? "Test this prompt"
                  : "Select 'Use for chat' to enable testing"
              }
            >
              Test
            </Button>
          </div>
        </div>
      </AccordionDetails>
    </Accordion>
  );
};

export default PromptAccordionItem;
