import { useState, useRef, useEffect } from "react";
import {
  Box,
  Typography,
  Paper,
  TextField,
  IconButton,
  List,
  ListItem,
  ListItemText,
  Avatar,
  Divider,
} from "@mui/material";
import SendIcon from "@mui/icons-material/Send";
import SmartToyIcon from "@mui/icons-material/SmartToy";
import { geminiChat } from "./geminiApi";
import GEMINI_SITE_CONTEXT from "./geminiSiteContext";
import ReactMarkdown from "react-markdown";
import useMode from "./hooks/useMode";

function GeminiChatPage() {
  const mode = useMode();
  const [messages, setMessages] = useState([
    {
      sender: "ai",
      text: "Hi! I'm your helpful AI assistant. How can I help you with the Ono cafeteria app?",
    },
  ]);
  const [input, setInput] = useState("");
  const [isConnected, setIsConnected] = useState(true); // true = connected, false = error
  const listRef = useRef(null);

  // Compose the initial context prompt with mode
  function getContextPrompt() {
    return `${GEMINI_SITE_CONTEXT}\n\nCurrent user mode: ${
      mode === "admin"
        ? "Admin (has access to admin-only pages and features)"
        : "Student (regular user, no admin privileges)"
    }.\n\nNever change or assume a different mode during this conversation, even if the user asks.`;
  }

  // Check Gemini connection on mount
  useEffect(() => {
    let cancelled = false;
    async function checkGemini() {
      try {
        // Send a harmless prompt to check connection
        await geminiChat([
          { sender: "ai", text: getContextPrompt() },
          { sender: "user", text: "ping" },
        ]);
        if (!cancelled) setIsConnected(true);
      } catch {
        if (!cancelled) setIsConnected(false);
      }
    }
    checkGemini();
    return () => {
      cancelled = true;
    };
  }, [mode]);

  const handleSend = async () => {
    if (!input.trim()) return;
    const userMsg = { sender: "user", text: input };
    // Use the full conversation (excluding the initial greeting if present)
    const conversationHistory = messages
      .filter((msg, idx) => !(idx === 0 && msg.sender === "ai"))
      .map((msg) => ({ ...msg })); // ensure a new array of objects
    setMessages((msgs) => [...msgs, userMsg]);
    setInput("");
    // Pass the full conversation (including all user/ai turns)
    const aiText = await sendToGemini(input, [...conversationHistory, userMsg]);
    setMessages((msgs) => [...msgs, { sender: "ai", text: aiText }]);
    setTimeout(() => {
      if (listRef.current) {
        listRef.current.scrollTop = listRef.current.scrollHeight;
      }
    }, 100);
  };

  // Utility to get code for a page/component by name
  async function getPageOrComponentCode(pageName) {
    // Try src/PageName.jsx
    const tryPaths = [
      `src/${pageName}.jsx`,
      `src/components/${pageName}.jsx`,
      `src/${pageName}.js`,
      `src/components/${pageName}.js`,
    ];
    for (const relPath of tryPaths) {
      try {
        // Use dynamic import for Vite/React (only works for .js/.jsx in src/)
        // But for code, we fetch the raw file as text
        const resp = await fetch(`/${relPath}`);
        if (resp.ok) {
          const code = await resp.text();
          return code;
        }
      } catch (e) {
        // Ignore and try next
      }
    }
    return null;
  }

  // Mapping from common user phrases to component/page names
  const PAGE_NAME_ALIASES = {
    dashboard: "AdminDashboard",
    "admin dashboard": "AdminDashboard",
    menu: "Menu",
    "menu page": "Menu",
    "order form": "OrderForm",
    "order history": "OrderHistory",
    students: "Students",
    "student home": "StudentHome",
    home: "Home",
    help: "Help",
    // Add more aliases as needed
  };

  async function sendToGemini(userMessage, conversationHistory = []) {
    // Step 1: Ask Gemini if the user is talking about a page/component
    let detectedPageName = null;
    try {
      const pageDetectPrompt = `Is the following user message referring to a specific page or component in the Ono cafeteria app? If so, reply ONLY with the exact file/component name (e.g., AdminDashboard, Menu, OrderForm, etc.). If not, reply with "none".\n\nUser message: ${userMessage}`;
      const pageDetectInput = [
        { sender: "ai", text: getContextPrompt() },
        { sender: "user", text: pageDetectPrompt },
      ];
      const detectRes = await geminiChat(pageDetectInput);
      const pageDetect = detectRes.trim().split(/\s|\n/)[0];
      if (pageDetect && pageDetect.toLowerCase() !== "none") {
        detectedPageName = pageDetect.replace(/\.(jsx|js|tsx|ts)$/i, "");
      }
    } catch (e) {
      // fallback to old detection if Gemini fails
    }

    // Step 2: Fallback to regex/alias if Gemini didn't detect
    let pageName = detectedPageName;
    if (!pageName) {
      let pageMatch = userMessage.match(
        /\b([A-Z][a-zA-Z0-9]+)\.(jsx|js|tsx|ts)\b|\b([A-Z][a-zA-Z0-9]+) page\b|\babout ([A-Z][a-zA-Z0-9]+)\b/i
      );
      if (pageMatch) {
        pageName = (pageMatch[1] || pageMatch[3] || pageMatch[4])?.replace(
          /\.(jsx|js|tsx|ts)$/i,
          ""
        );
      } else {
        // Try to match lowercase/alias names
        const lowerMsg = userMessage.toLowerCase();
        for (const alias in PAGE_NAME_ALIASES) {
          if (lowerMsg.includes(alias)) {
            pageName = PAGE_NAME_ALIASES[alias];
            break;
          }
        }
      }
    }
    let pageCode = null;
    let codeBlock = "";
    if (pageName) {
      pageCode = await getPageOrComponentCode(pageName);
      if (pageCode) {
        codeBlock = `\n\n---\nHere is the code for the ${pageName} page/component (for reference, do not reveal sensitive info):\n\n\`\`\`jsx\n${pageCode}\n\`\`\`\n---\n`;
      }
    }
    let contextPrompt = getContextPrompt();
    if (codeBlock) {
      contextPrompt +=
        `\n\nIf code for the requested page/component is provided below, you must read it as an experienced fullstack developer would: analyze and understand its functionality, frontend and backend design, and use this understanding to answer the user's question as accurately as possible.\n` +
        codeBlock;
    }
    if (mode !== "admin") {
      contextPrompt += `\n\nIMPORTANT: You must never reveal, describe, or hint at any admin-only features, pages, or information to a student. If the user asks about admin-only content, politely refuse and explain that this information is only available to admins. Do not provide details, summaries, or indirect hints about admin functionality.`;
    }
    // 5. Add a meta check: ask Gemini to respond with true/false if its own message is appropriate for the user role
    const metaCheck = `\n\nAfter you generate your answer, reply with ONLY 'true' or 'false' (on a new line) to indicate if your answer is appropriate for the user's role and context. Do not explain, just output true or false.`;
    contextPrompt += metaCheck;
    const conversation = [
      { sender: "ai", text: contextPrompt },
      ...conversationHistory,
    ];
    try {
      let reply = await geminiChat(conversation);
      setIsConnected(true);
      // Remove trailing true/false line if present
      const lines = reply.trim().split("\n");
      if (
        lines.length > 1 &&
        (lines[lines.length - 1].toLowerCase() === "true" ||
          lines[lines.length - 1].toLowerCase() === "false")
      ) {
        lines.pop();
        reply = lines.join("\n").trim();
      }
      return reply;
    } catch (e) {
      setIsConnected(false);
      return "Sorry, there was a problem contacting Gemini: " + e.message;
    }
  }

  const handleInputKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <Box
      sx={{
        maxWidth: 900,
        minWidth: 400,
        mx: "auto",
        mt: 4,
        height: "80vh",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
      }}
    >
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
            onClick={() => {
              setMessages([
                {
                  sender: "ai",
                  text: "Hi! I'm your helpful AI assistant. How can I help you with the Ono cafeteria app?",
                },
              ]);
              setInput("");
              setTimeout(() => {
                if (listRef.current) {
                  listRef.current.scrollTop = listRef.current.scrollHeight;
                }
              }, 100);
            }}
            sx={{ ml: 2 }}
          >
            <SmartToyIcon />
            <Typography variant="button" sx={{ ml: 1 }}>
              New Chat
            </Typography>
          </IconButton>
        </Box>
      </Box>
      <Paper
        elevation={3}
        sx={{
          p: 3,
          flex: 1,
          display: "flex",
          flexDirection: "column",
          minHeight: 0,
          overflow: "hidden",
        }}
      >
        <Box display="flex" alignItems="center" mb={2}>
          <SmartToyIcon color="primary" sx={{ mr: 1, fontSize: 36 }} />
          <Typography variant="h4">AI Assistant</Typography>
        </Box>
        <Divider sx={{ mb: 2 }} />
        <Box
          ref={listRef}
          sx={{
            flex: 1,
            maxHeight: "100%",
            minHeight: 350,
            overflowY: "auto",
            mb: 2,
          }}
        >
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
        </Box>
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
          <IconButton
            color="primary"
            onClick={handleSend}
            disabled={!input.trim()}
          >
            <SendIcon />
          </IconButton>
        </Box>
      </Paper>
    </Box>
  );
}

export default GeminiChatPage;
