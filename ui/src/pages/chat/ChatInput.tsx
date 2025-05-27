import React, { useRef, useState } from "react";
import { Popover, List, ListItem, ListItemButton, ListItemText, Button } from "@mui/material";

interface ChatInputProps {
  userInput: string;
  setUserInput: (val: string) => void;
  handleSendMessage: () => void;
  wsConnected: boolean;
}

const ChatInput: React.FC<ChatInputProps> = ({
  userInput,
  setUserInput,
  handleSendMessage,
  wsConnected,
}) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const docInputRef = useRef<HTMLInputElement>(null);
  const audioInputRef = useRef<HTMLInputElement>(null);

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

  const handleFileChange = (
    event: React.ChangeEvent<HTMLInputElement>,
    type: string
  ) => {
    const file = event.target.files?.[0];
    if (file) {
      console.log("Selected file:", file, "Type:", type);
    }
    event.target.value = "";
  };

  return (
    <div className="container-fluid">
      <div className="chat-input-container row align-items-center px-2 py-2">
        {/* Attach Button */}
        <div className="col-auto">
          <Button
            className="btn btn-light"
            type="button"
            onClick={handleAttachClick}
            disabled={!wsConnected}
            style={{ padding: "6px 10px", backgroundColor: "#0c1b32" }}
          >
            <i className="fa fa-paperclip"></i>
          </Button>
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
          {/* Hidden file inputs */}
          <input
            ref={imageInputRef}
            type="file"
            accept="image/*"
            style={{ display: "none" }}
            onChange={(e) => handleFileChange(e, "image")}
          />
          <input
            ref={docInputRef}
            type="file"
            accept=".pdf,.doc,.docx,.txt,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/pdf,text/plain"
            style={{ display: "none" }}
            onChange={(e) => handleFileChange(e, "doc")}
          />
          <input
            ref={audioInputRef}
            type="file"
            accept="audio/*"
            style={{ display: "none" }}
            onChange={(e) => handleFileChange(e, "audio")}
          />
        </div>
        {/* Text input */}
        <div className="col px-0">
          <input
            className="form-control"
            type="text"
            style={{width: "100%", height: "40px"}}
            placeholder="Type your message here..."
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleSendMessage();
            }}
            disabled={!wsConnected}
          />
        </div>
        {/* Send Button */}
        <div className="col-auto">
          <button
            className="btn btn-primary"
            onClick={handleSendMessage}
            disabled={!wsConnected}
            style={{ padding: "6px 14px" }}
          >
            <i className="fa-solid fa-paper-plane"></i>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatInput;