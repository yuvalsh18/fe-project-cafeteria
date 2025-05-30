import React from "react";
import { FormControl, InputLabel, Select, MenuItem } from "@mui/material";

export default function StudentSelector({
  students,
  selectedStudentId,
  setSelectedStudentId,
  sx = {},
}) {
  return (
    <FormControl
      fullWidth
      variant="outlined"
      sx={{
        background: "#fff",
        borderRadius: 2,
        boxShadow: 2,
        p: 1,
        mt: 3,
        ...sx,
      }}
    >
      <InputLabel id="student-filter-label" sx={{ fontSize: 20 }}>
        Select Student
      </InputLabel>
      <Select
        labelId="student-filter-label"
        id="student-filter-select"
        value={selectedStudentId || ""}
        label="Select Student"
        onChange={(e) => setSelectedStudentId(e.target.value)}
        sx={{ fontSize: 20, minHeight: 56 }}
        MenuProps={{ PaperProps: { sx: { fontSize: 20 } } }}
        InputLabelProps={{ shrink: true }}
      >
        <MenuItem value="" disabled sx={{ fontSize: 20, py: 2 }}>
          Please select a student
        </MenuItem>
        {students.map((s) => {
          const fullName =
            s.firstName && s.lastName ? `${s.firstName} ${s.lastName}` : s.name;
          const label = fullName
            ? `${fullName} (${s.studentId || s.id})`
            : s.studentId || s.id;
          return (
            <MenuItem key={s.id} value={s.id} sx={{ fontSize: 20, py: 2 }}>
              {label}
            </MenuItem>
          );
        })}
      </Select>
    </FormControl>
  );
}
