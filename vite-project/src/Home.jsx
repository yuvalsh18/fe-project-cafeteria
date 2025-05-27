import { Typography, Box } from "@mui/material";
import React from "react";
import AdminHome from "./AdminHome";
import StudentHome from "./StudentHome";
import useMode from "./hooks/useMode";
import usePageTitle from "./hooks/usePageTitle";

export default function Home() {
  // Use custom hook for mode
  const mode = useMode();
  usePageTitle({ "/": "Home - Ono cafeteria" }, "Ono cafeteria");

  return (
    <Box
      sx={{
        mt: { xs: 2, md: 4 },
        textAlign: "center",
        px: { xs: 1, sm: 2, md: 0 },
        width: "100%",
        minHeight: { xs: "calc(100vh - 56px)", md: "calc(100vh - 64px)" },
      }}
    >
      {/* Render the appropriate home page based on mode */}
      {mode === "student" && <StudentHome />}
      {mode === "admin" && <AdminHome />}
    </Box>
  );
}
