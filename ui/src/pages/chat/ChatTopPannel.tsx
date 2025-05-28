import { Box, IconButton, Tooltip } from "@mui/material";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";

const ChatTopPannel = () => (
  <Box
    className="chat-top-panel d-flex align-items-center justify-content-between"
    sx={{
      width: "100%",
      px: 2,
      py: 0.5,
      borderBottom: "1px solid #e0e0e0",
      background: "#ffffff",
      minHeight: 30,
    }}
  >
    <Tooltip title="Chat information and tips">
      <IconButton>
        <InfoOutlinedIcon />
      </IconButton>
    </Tooltip>
  </Box>
);

export default ChatTopPannel;
