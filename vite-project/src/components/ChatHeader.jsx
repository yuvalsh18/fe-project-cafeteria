import { Box, Typography, IconButton } from "@mui/material";
import SmartToyIcon from "@mui/icons-material/SmartToy";

function ChatHeader({ isConnected, onNewChat }) {
  return (
    <Box
      display="flex"
      alignItems="center"
      justifyContent="space-between"
      mb={1}
    >
      <Box display="flex" alignItems="center" gap={1}>
        <Box
          sx={{
            width: 10,
            height: 10,
            bgcolor: isConnected ? "#00e676" : "#f44336",
            borderRadius: "50%",
          }}
        />
        <Typography
          variant="caption"
          color={isConnected ? "success.main" : "error.main"}
        >
          {isConnected
            ? "Connected to Google Gemini"
            : "Not connected to Google Gemini"}
        </Typography>
      </Box>
      <Box>
        <IconButton
          color="primary"
          aria-label="Start new chat"
          onClick={onNewChat}
          sx={{ ml: 2 }}
        >
          <SmartToyIcon />
          <Typography variant="button" sx={{ ml: 1 }}>
            New Chat
          </Typography>
        </IconButton>
      </Box>
    </Box>
  );
}

export default ChatHeader;
