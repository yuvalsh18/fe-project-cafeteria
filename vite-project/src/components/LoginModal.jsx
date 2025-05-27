import React, { useState, useEffect } from "react";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import CircularProgress from "@mui/material/CircularProgress";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebase";
import { useAuthState } from "react-firebase-hooks/auth";

export default function LoginModal() {
  const [user, loadingAuth, errorAuth] = useAuthState(auth);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loginLoading, setLoginLoading] = useState(false); // renamed to avoid conflict
  const [error, setError] = useState("");

  const handleLogin = async () => {
    setLoginLoading(true);
    setError("");
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoginLoading(false);
    }
  };

  // Only show modal if not authenticated
  return (
    <Dialog open={!user}>
      <DialogTitle>Login</DialogTitle>
      <DialogContent>
        <TextField
          autoFocus
          margin="dense"
          label="Email Address"
          type="email"
          fullWidth
          variant="standard"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <TextField
          margin="dense"
          label="Password"
          type="password"
          fullWidth
          variant="standard"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        {error && <div style={{ color: "red", marginTop: 8 }}>{error}</div>}
        {loginLoading && (
          <CircularProgress size={24} style={{ marginTop: 8 }} />
        )}
      </DialogContent>
      <DialogActions>
        <Button
          onClick={handleLogin}
          disabled={loginLoading || !email || !password}
          variant="contained"
        >
          Login
        </Button>
      </DialogActions>
    </Dialog>
  );
}
