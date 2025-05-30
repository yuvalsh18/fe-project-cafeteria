import { List, ListItem, ListItemText, Avatar, Box } from "@mui/material";
import SmartToyIcon from "@mui/icons-material/SmartToy";
import ReactMarkdown from "react-markdown";

function ChatMessageList({ messages }) {
  return (
    <List>
      {messages.map((msg, idx) => (
        <ListItem
          key={idx}
          alignItems={msg.sender === "ai" ? "flex-start" : "center"}
        >
          <Avatar
            sx={{
              bgcolor: msg.sender === "ai" ? "primary.main" : "grey.400",
              mr: 2,
            }}
          >
            {msg.sender === "ai" ? <SmartToyIcon /> : "U"}
          </Avatar>
          <ListItemText
            primary={
              <Box
                sx={{
                  whiteSpace: "pre-line",
                  wordBreak: "break-word",
                }}
              >
                <ReactMarkdown
                  components={{
                    p: ({ node, ...props }) => <span {...props} />,
                  }}
                >
                  {msg.text}
                </ReactMarkdown>
              </Box>
            }
            primaryTypographyProps={{
              sx: {
                bgcolor: msg.sender === "ai" ? "#e3f2fd" : "#f5f5f5",
                p: 1.5,
                borderRadius: 2,
                maxWidth: 400,
                display: "inline-block",
                fontSize: 16,
                lineHeight: 1.7,
                fontFamily: "inherit",
              },
            }}
          />
        </ListItem>
      ))}
    </List>
  );
}

export default ChatMessageList;
