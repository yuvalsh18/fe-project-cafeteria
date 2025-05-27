import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import {
  Box,
  Container,
  IconButton,
  Menu,
  MenuItem,
  ToggleButton,
  ToggleButtonGroup,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import { useNavigate } from "react-router-dom";
import useMode from "./hooks/useMode";
import { useState } from "react";
import LogoutIcon from "@mui/icons-material/Logout";
import { signOut } from "firebase/auth";
import { auth } from "./firebase";

function Header() {
  const navigate = useNavigate();
  const [anchorElNav, setAnchorElNav] = useState(null);
  const mode = useMode();
  const pages =
    mode === "admin"
      ? ["Menu", "Help", "Students", "Dashboard"]
      : ["Menu", "Help"];

  const handleOpenNavMenu = (event) => {
    setAnchorElNav(event.currentTarget);
  };

  const handleCloseNavMenu = () => {
    setAnchorElNav(null);
  };

  const handleModeChange = (event, newMode) => {
    if (newMode && newMode !== mode) {
      localStorage.setItem("mode", newMode);
      window.dispatchEvent(new Event("mode-changed"));
    }
  };

  return (
    <AppBar>
      <Container maxWidth="xl">
        <Toolbar disableGutters>
          <Typography
            variant="h6"
            noWrap
            component="a"
            sx={{
              mr: 2,
              display: { xs: "none", md: "flex" },
              fontFamily: "monospace",
              fontWeight: 700,
              letterSpacing: ".3rem",
              color: "inherit",
              textDecoration: "none",
              "&:hover": {
                color: "inherit", // Ensure color remains the same on hover
              },
            }}
            onClick={() => navigate("/")}
          >
            Ono Cafeteria
          </Typography>

          <Box sx={{ flexGrow: 1, display: { xs: "flex", md: "none" } }}>
            <IconButton
              size="large"
              aria-label="account of current user"
              aria-controls="menu-appbar"
              aria-haspopup="true"
              onClick={handleOpenNavMenu}
              color="inherit"
              sx={{
                outline: "none", // Remove border on click
                "&:focus": {
                  outline: "none", // Remove border on focus
                },
              }}
            >
              <MenuIcon />
            </IconButton>
            <Menu
              id="menu-appbar"
              anchorEl={anchorElNav}
              anchorOrigin={{
                vertical: "bottom",
                horizontal: "left",
              }}
              keepMounted
              transformOrigin={{
                vertical: "top",
                horizontal: "left",
              }}
              open={Boolean(anchorElNav)}
              onClose={handleCloseNavMenu}
              sx={{ display: { xs: "block", md: "none" } }}
            >
              {pages.map((page) => (
                <MenuItem
                  key={page}
                  onClick={() => {
                    handleCloseNavMenu();
                    navigate(
                      "/" +
                        (page === "Dashboard"
                          ? "admin/dashboard"
                          : page.toLowerCase())
                    );
                  }}
                >
                  <Typography sx={{ textAlign: "center" }}>{page} </Typography>
                </MenuItem>
              ))}
            </Menu>
          </Box>
          <Typography
            variant="h5"
            noWrap
            component="a"
            sx={{
              mr: 2,
              display: { xs: "flex", md: "none" },
              flexGrow: 1,
              fontFamily: "monospace",
              fontWeight: 700,
              letterSpacing: ".3rem",
              color: "inherit",
              textDecoration: "none",
              "&:hover": {
                color: "inherit", // Ensure color remains the same on hover
              },
            }}
            onClick={() => navigate("/")}
          >
            Ono Cafeteria
          </Typography>
          <Box sx={{ flexGrow: 1, display: { xs: "none", md: "flex" } }}>
            {pages.map((page) => (
              <Button
                key={page}
                onClick={() => {
                  handleCloseNavMenu();
                  navigate(
                    "/" +
                      (page === "Dashboard"
                        ? "admin/dashboard"
                        : page.toLowerCase())
                  );
                }}
                sx={{
                  my: 2,
                  color: "white",
                  display: "block",
                  outline: "none",
                  "&:focus": {
                    outline: "none",
                  },
                }}
              >
                {page}
              </Button>
            ))}
          </Box>
          {/* Mode Switcher */}
          <Box sx={{ ml: 2, display: "flex", alignItems: "center" }}>
            <ToggleButtonGroup
              value={mode}
              exclusive
              onChange={handleModeChange}
              size="small"
              aria-label="mode switcher"
              sx={{
                background: "#1976d2",
                borderRadius: 2,
                boxShadow: 1,
                border: "1px solid #1976d2",
              }}
            >
              <ToggleButton
                value="student"
                aria-label="student mode"
                sx={{
                  color: mode === "student" ? "#1976d2" : "#fff",
                  backgroundColor: mode === "student" ? "#fff" : "#1976d2",
                  fontWeight: 700,
                  border: "none",
                  "&.Mui-selected, &.Mui-selected:hover": {
                    color: "#1976d2",
                    backgroundColor: "#fff",
                  },
                  "&:hover": {
                    backgroundColor: "#1565c0",
                    color: "#fff",
                  },
                }}
              >
                Student
              </ToggleButton>
              <ToggleButton
                value="admin"
                aria-label="admin mode"
                sx={{
                  color: mode === "admin" ? "#1976d2" : "#fff",
                  backgroundColor: mode === "admin" ? "#fff" : "#1976d2",
                  fontWeight: 700,
                  border: "none",
                  "&.Mui-selected, &.Mui-selected:hover": {
                    color: "#1976d2",
                    backgroundColor: "#fff",
                  },
                  "&:hover": {
                    backgroundColor: "#1565c0",
                    color: "#fff",
                  },
                }}
              >
                Admin
              </ToggleButton>
            </ToggleButtonGroup>
            <IconButton
              color="inherit"
              aria-label="logout"
              sx={{ ml: 1 }}
              onClick={() => signOut(auth)}
            >
              <LogoutIcon />
            </IconButton>
          </Box>
        </Toolbar>
      </Container>
    </AppBar>
  );
}

export default Header;
