import { Box, TextField, IconButton } from "@mui/material";
import SendIcon from "@mui/icons-material/Send";

function ChatInput({ input, setInput, handleSend, handleInputKeyDown }) {
  return (
    <Box display="flex" alignItems="center" gap={1}>
      <TextField
        fullWidth
        multiline
        minRows={1}
        maxRows={4}
        placeholder="Type your question..."
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={handleInputKeyDown}
        variant="outlined"
        size="small"
      />
      <IconButton color="primary" onClick={handleSend} disabled={!input.trim()}>
        <SendIcon />
      </IconButton>
    </Box>
  );
}

export default ChatInput;
