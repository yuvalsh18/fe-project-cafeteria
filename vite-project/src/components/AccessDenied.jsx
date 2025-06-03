import { Box, Typography } from "@mui/material";
import HighlightOffIcon from "@mui/icons-material/HighlightOff";
import Header from "../Header";

export default function AccessDenied() {
  return (
    <>
      <Header />
      <Box
        sx={{
          p: 5,
          borderRadius: 5,
          maxWidth: 420,
          mx: "auto",
          textAlign: "center",
          boxShadow: 4,
          bgcolor: "white",
        }}
      >
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            mb: 2,
          }}
        >
          <HighlightOffIcon sx={{ fontSize: 64, color: "error.main", mb: 1 }} />
          <Typography variant="h4" color="error" fontWeight={600} gutterBottom>
            Access Denied
          </Typography>
        </Box>
        <Typography variant="subtitle1" color="text.secondary" gutterBottom>
          Oops! This page is for admins only.
        </Typography>
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ mt: 2, mb: 1, lineHeight: 1.7 }}
        >
          Looks like you tried to sneak into the admin lounge.
          <br />
          But don’t worry, we won’t tell anyone.{" "}
          <span role="img" aria-label="shushing face">
            🤫
          </span>
        </Typography>
      </Box>
    </>
  );
}
