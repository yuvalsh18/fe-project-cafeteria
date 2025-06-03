import { CircularProgress, Alert, Typography, Paper } from "@mui/material";

export default function FirestoreStatus({ firestoreStatus }) {
  return (
    <Paper sx={{ p: 3, mb: 4, borderRadius: 3, boxShadow: 3 }}>
      <Typography variant="h6" gutterBottom sx={{ mb: 2 }}>
        Firestore Connectivity
      </Typography>
      {firestoreStatus === "checking" && <CircularProgress size={20} />}
      {firestoreStatus === "connected" && (
        <Alert severity="success">Connected to Firestore</Alert>
      )}
      {firestoreStatus === "disconnected" && (
        <Alert severity="error">Not connected to Firestore</Alert>
      )}
    </Paper>
  );
}
