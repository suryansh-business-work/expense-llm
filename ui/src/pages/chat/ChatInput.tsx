import React, { useRef, useState } from "react";
import {
  Popover,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Button,
  Chip,
  Typography,
  ButtonGroup,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import ChatBotSetting from "./ChatBoxSetting";

interface ChatInputProps {
  userInput: string;
  setUserInput: (val: string) => void;
  handleSendMessage: () => void;
  wsConnected: boolean;
}

const FILE_ACCEPT: Record<string, string> = {
  image: "image/*",
  doc: ".pdf,.doc,.docx,.txt,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/pdf,text/plain",
  audio: "audio/*",
};

const FILE_TYPE_LABEL: Record<string, string> = {
  image: "Image",
  doc: "Document",
  audio: "Audio",
};

const ChatInput: React.FC<ChatInputProps> = ({
  userInput,
  setUserInput,
  handleSendMessage,
  wsConnected,
}) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [settingsAnchorEl, setSettingsAnchorEl] = useState<null | HTMLElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const docInputRef = useRef<HTMLInputElement>(null);
  const audioInputRef = useRef<HTMLInputElement>(null);

  // State to keep track of selected files and errors
  const [selectedFiles, setSelectedFiles] = useState<
    { name: string; type: string; file?: File; error?: boolean }[]
  >([]);
  const [fileError, setFileError] = useState<string | null>(null);

  // Dialog state for file preview
  const [previewFile, setPreviewFile] = useState<{ file: File; type: string; name: string } | null>(null);
  const [confirmDeleteIdx, setConfirmDeleteIdx] = useState<number | null>(null);

  // Check if any selected file has error
  const hasInvalidFile = selectedFiles.some((file) => file.error);

  const handleAttachClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClosePopover = () => {
    setAnchorEl(null);
  };

  const handleFileSelect = (type: "image" | "doc" | "audio") => {
    handleClosePopover();
    if (type === "image") imageInputRef.current?.click();
    if (type === "doc") docInputRef.current?.click();
    if (type === "audio") audioInputRef.current?.click();
  };

  const validateFile = (file: File, type: string) => {
    if (type === "image" && !file.type.startsWith("image/")) return false;
    if (type === "audio" && !file.type.startsWith("audio/")) return false;
    if (
      type === "doc" &&
      !(
        file.type === "application/pdf" ||
        file.type === "text/plain" ||
        file.type === "application/msword" ||
        file.type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
        file.name.match(/\.(pdf|doc|docx|txt)$/i)
      )
    )
      return false;
    return true;
  };

  const handleFileChange = (
    event: React.ChangeEvent<HTMLInputElement>,
    type: string
  ) => {
    const file = event.target.files?.[0];
    if (file) {
      const isValid = validateFile(file, type);
      setSelectedFiles((prev) => [
        ...prev,
        { name: file.name, type, file, error: !isValid },
      ]);
      setFileError(
        isValid
          ? null
          : `Invalid file selected for ${FILE_TYPE_LABEL[type]}.`
      );
    }
    event.target.value = "";
  };

  const handleRemoveFile = (index: number) => {
    setConfirmDeleteIdx(index);
  };

  const confirmRemoveFile = () => {
    if (confirmDeleteIdx !== null) {
      setSelectedFiles((prev) => prev.filter((_, i) => i !== confirmDeleteIdx));
      setFileError(null);
      setConfirmDeleteIdx(null);
    }
  };

  const cancelRemoveFile = () => {
    setConfirmDeleteIdx(null);
  };

  // Settings popover handlers
  const handleSettingsClick = (event: React.MouseEvent<HTMLElement>) => {
    setSettingsAnchorEl(event.currentTarget);
  };
  const handleSettingsClose = () => {
    setSettingsAnchorEl(null);
  };

  // File preview dialog content
  const renderPreviewContent = () => {
    if (!previewFile) return null;
    const url = URL.createObjectURL(previewFile.file);
    if (previewFile.type === "image") {
      return <img src={url} alt={previewFile.name} style={{ maxWidth: "100%", maxHeight: 400 }} />;
    }
    if (previewFile.type === "audio") {
      return (
        <audio controls style={{ width: "100%" }}>
          <source src={url} />
          Your browser does not support the audio element.
        </audio>
      );
    }
    // For docs, just show file name and download option
    return (
      <div>
        <Typography variant="subtitle1">{previewFile.name}</Typography>
        <Button
          href={url}
          download={previewFile.name}
          variant="outlined"
          sx={{ mt: 2 }}
        >
          Download
        </Button>
      </div>
    );
  };

  return (
    <div className="container-fluid">
      {selectedFiles.length > 0 && (
        <div style={{ background: '#ffffff' }} className="chat-selected-files-container row align-items-center px-2 py-2">
          <div className="col-auto">
            {selectedFiles.length > 0 && (
              <Typography variant="subtitle2" sx={{ mb: 1 }}>
                Selected File{selectedFiles.length > 1 ? "s" : ""}
              </Typography>
            )}
            {selectedFiles.map((file, idx) => (
              <Chip
                key={idx}
                label={`${file.name} (${FILE_TYPE_LABEL[file.type] || file.type})`}
                onDelete={() => handleRemoveFile(idx)}
                onClick={() => file.file && setPreviewFile({ file: file.file, type: file.type, name: file.name })}
                sx={{
                  mr: 1,
                  mb: 1,
                  color: file.error ? "error.main" : undefined,
                  borderColor: file.error ? "error.main" : undefined,
                  background: file.error ? "#ffebee" : undefined,
                  cursor: file.file ? "pointer" : "default",
                }}
                color={file.error ? "error" : "info"}
                variant="outlined"
              />
            ))}
            {fileError && (
              <Typography color="error" variant="caption" sx={{ display: "block" }}>
                {fileError}
              </Typography>
            )}
          </div>
        </div>
      )}

      {/* Confirm Delete Dialog */}
      <Dialog open={confirmDeleteIdx !== null} onClose={cancelRemoveFile}>
        <DialogTitle>Remove File</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to remove{' '}
            <b>
              {confirmDeleteIdx !== null && selectedFiles[confirmDeleteIdx]?.name}
            </b>
            ?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={cancelRemoveFile}>Cancel</Button>
          <Button onClick={confirmRemoveFile} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* File Preview Dialog */}
      <Dialog open={!!previewFile} onClose={() => setPreviewFile(null)} maxWidth="sm" fullWidth>
        <DialogTitle>
          File Preview
          <IconButton
            aria-label="close"
            onClick={() => setPreviewFile(null)}
            sx={{ position: "absolute", right: 8, top: 8 }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers>{renderPreviewContent()}</DialogContent>
        <DialogActions>
          <Button onClick={() => setPreviewFile(null)} variant="contained">
            Close
          </Button>
        </DialogActions>
      </Dialog>

      <div className="chat-input-container row">
        {/* Attach Button */}
        <div className="col-auto">
          <ButtonGroup variant="contained" aria-label="Basic button group" size="large">
            <Button
              onClick={handleSettingsClick}
              aria-label="settings"
            >
              <i className="fa fa-cog" />
            </Button>
            <Button
              onClick={handleAttachClick}
              disabled={!wsConnected}
            >
              <i className="fa fa-paperclip"></i>
            </Button>
          </ButtonGroup>
          <Popover
            open={Boolean(settingsAnchorEl)}
            anchorEl={settingsAnchorEl}
            onClose={handleSettingsClose}
            anchorOrigin={{ vertical: "top", horizontal: "left" }}
            transformOrigin={{ vertical: "bottom", horizontal: "left" }}
          >
            <ChatBotSetting />
          </Popover>
          <Popover
            open={Boolean(anchorEl)}
            anchorEl={anchorEl}
            onClose={handleClosePopover}
            anchorOrigin={{ vertical: "top", horizontal: "left" }}
            transformOrigin={{ vertical: "bottom", horizontal: "left" }}
          >
            <List dense style={{ minWidth: 150 }}>
              <ListItem disablePadding>
                <ListItemButton onClick={() => handleFileSelect("image")}>
                  <i className="fa fa-image me-2 text-primary" />
                  <ListItemText primary="Image" />
                </ListItemButton>
              </ListItem>
              <ListItem disablePadding>
                <ListItemButton onClick={() => handleFileSelect("doc")}>
                  <i className="fa fa-file-alt me-2 text-success" />
                  <ListItemText primary="Document" />
                </ListItemButton>
              </ListItem>
              <ListItem disablePadding>
                <ListItemButton onClick={() => handleFileSelect("audio")}>
                  <i className="fa fa-microphone me-2 text-danger" />
                  <ListItemText primary="Audio" />
                </ListItemButton>
              </ListItem>
            </List>
          </Popover>
          <input
            ref={imageInputRef}
            type="file"
            accept={FILE_ACCEPT.image}
            style={{ display: "none" }}
            onChange={(e) => handleFileChange(e, "image")}
          />
          <input
            ref={docInputRef}
            type="file"
            accept={FILE_ACCEPT.doc}
            style={{ display: "none" }}
            onChange={(e) => handleFileChange(e, "doc")}
          />
          <input
            ref={audioInputRef}
            type="file"
            accept={FILE_ACCEPT.audio}
            style={{ display: "none" }}
            onChange={(e) => handleFileChange(e, "audio")}
          />
        </div>
        <div className="col">
          <input
            className="form-control"
            type="text"
            style={{ width: "100%", height: "40px" }}
            placeholder="Type your message here..."
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !hasInvalidFile && wsConnected) handleSendMessage();
            }}
            disabled={!wsConnected || hasInvalidFile}
          />
        </div>
        <div className="col-auto">
          <Button
            onClick={handleSendMessage}
            disabled={!wsConnected || hasInvalidFile}
            size="large"
            variant="contained"
          >
            <i className="fa-solid fa-paper-plane"></i>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ChatInput;
