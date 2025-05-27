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
    <Box sx={{ mt: 4, textAlign: "center" }}>
      {/* Render the appropriate home page based on mode */}
      {mode === "student" && <StudentHome />}
      {mode === "admin" && <AdminHome />}
    </Box>
  );
}
