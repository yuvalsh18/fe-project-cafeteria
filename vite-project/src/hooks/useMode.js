import { useEffect, useState } from "react";

// Custom hook to sync mode (student/admin) across tabs and components
export default function useMode(defaultMode = "student") {
  const [mode, setMode] = useState(
    () => localStorage.getItem("mode") || defaultMode
  );

  useEffect(() => {
    const handleStorageChange = () => {
      setMode(localStorage.getItem("mode") || defaultMode);
    };
    const handleModeChanged = () => {
      setMode(localStorage.getItem("mode") || defaultMode);
    };
    window.addEventListener("storage", handleStorageChange);
    window.addEventListener("mode-changed", handleModeChanged);
    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("mode-changed", handleModeChanged);
    };
  }, [defaultMode]);

  return mode;
}
