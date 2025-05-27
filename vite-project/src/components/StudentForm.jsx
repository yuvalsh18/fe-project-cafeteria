import React from "react";
import { TextField, Button, Stack, Typography } from "@mui/material";
import SaveIcon from "@mui/icons-material/Save";
import CancelIcon from "@mui/icons-material/Cancel";
import PersonAddAltIcon from "@mui/icons-material/PersonAddAlt";

export default function StudentForm({
  form,
  editingId,
  error,
  onChange,
  onAdd,
  onUpdate,
  onCancel,
}) {
  return (
    <>
      {error && (
        <Typography color="error" sx={{ mb: 2 }}>
          {error}
        </Typography>
      )}
      <Stack
        direction={{ xs: "column", sm: "row" }}
        spacing={2}
        alignItems="center"
        justifyContent="center"
      >
        <TextField
          name="studentId"
          label="Student ID"
          value={form.studentId}
          onChange={onChange}
          size="small"
        />
        <TextField
          name="firstName"
          label="First Name"
          value={form.firstName}
          onChange={onChange}
          size="small"
        />
        <TextField
          name="lastName"
          label="Last Name"
          value={form.lastName}
          onChange={onChange}
          size="small"
        />
        <TextField
          name="phone"
          label="Phone"
          value={form.phone}
          onChange={onChange}
          size="small"
        />
        <TextField
          name="email"
          label="Email"
          value={form.email}
          onChange={onChange}
          size="small"
        />
        {editingId ? (
          <>
            <Button
              variant="contained"
              color="success"
              startIcon={<SaveIcon />}
              onClick={onUpdate}
            >
              Update
            </Button>
            <Button
              variant="outlined"
              color="inherit"
              startIcon={<CancelIcon />}
              onClick={onCancel}
            >
              Cancel
            </Button>
          </>
        ) : (
          <Button
            variant="contained"
            color="primary"
            startIcon={<PersonAddAltIcon />}
            onClick={onAdd}
          >
            Add
          </Button>
        )}
      </Stack>
    </>
  );
}
