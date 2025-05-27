import React, { useState, useEffect } from "react";
import {
  collection,
  onSnapshot,
  addDoc,
  doc,
  updateDoc,
  deleteDoc,
} from "firebase/firestore";
import { db } from "./firebase";
import { Box, Typography, Paper } from "@mui/material";
import HighlightOffIcon from "@mui/icons-material/HighlightOff";
import StudentForm from "./components/StudentForm";
import StudentTable from "./components/StudentTable";
import usePageTitle from "./hooks/usePageTitle";
import useMode from "./hooks/useMode";
import Header from "./Header";

function Students() {
  usePageTitle({ "/students": "Students - Ono cafeteria" }, "Ono cafeteria");
  const [students, setStudents] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({
    studentId: "",
    firstName: "",
    lastName: "",
    phone: "",
    email: "",
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const mode = useMode();
  const [_, setRerender] = useState(0);
  useEffect(() => {
    const handleModeChanged = () => setRerender((r) => r + 1);
    window.addEventListener("mode-changed", handleModeChanged);
    return () => window.removeEventListener("mode-changed", handleModeChanged);
  }, []);

  useEffect(() => {
    if (mode !== "admin") return;
    const unsubscribe = onSnapshot(collection(db, "students"), (snapshot) => {
      const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setStudents(data);
      setLoading(false);
    });
    return () => unsubscribe();
  }, [mode]);

  if (mode === "student") {
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
            <HighlightOffIcon
              sx={{ fontSize: 64, color: "error.main", mb: 1 }}
            />
            <Typography
              variant="h4"
              color="error"
              fontWeight={600}
              gutterBottom
            >
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

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const validateForm = () => {
    if (
      !form.studentId ||
      !form.firstName ||
      !form.lastName ||
      !form.phone ||
      !form.email
    ) {
      setError("All fields are required.");
      return false;
    }
    // Simple validation for email and phone
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phoneRegex = /^\d{9,15}$/;
    if (!emailRegex.test(form.email)) {
      setError("Invalid email format.");
      return false;
    }
    if (!phoneRegex.test(form.phone)) {
      setError("Phone must be 9-15 digits.");
      return false;
    }
    setError("");
    return true;
  };

  const isDuplicate = () => {
    return students.some(
      (s) =>
        (s.studentId === form.studentId ||
          s.phone === form.phone ||
          s.email === form.email) &&
        (!editingId || s.id !== editingId)
    );
  };

  const handleAdd = async () => {
    if (!validateForm()) return;
    if (isDuplicate()) {
      setError("Duplicate Student ID, phone, or email.");
      return;
    }
    await addDoc(collection(db, "students"), { ...form });
    setForm({
      studentId: "",
      firstName: "",
      lastName: "",
      phone: "",
      email: "",
    });
    setError("");
  };

  const handleEdit = (student) => {
    setEditingId(student.id);
    setForm({
      studentId: student.studentId || "",
      firstName: student.firstName || "",
      lastName: student.lastName || "",
      phone: student.phone || "",
      email: student.email || "",
    });
  };

  const handleUpdate = async () => {
    if (!validateForm()) return;
    if (isDuplicate()) {
      setError("Duplicate Student ID, phone, or email.");
      return;
    }
    await updateDoc(doc(db, "students", editingId), { ...form });
    setEditingId(null);
    setForm({
      studentId: "",
      firstName: "",
      lastName: "",
      phone: "",
      email: "",
    });
    setError("");
  };

  const handleDelete = async (id) => {
    await deleteDoc(doc(db, "students", id));
  };

  return (
    <Box sx={{ p: 4 }}>
      <Typography variant="h4" gutterBottom>
        Students
      </Typography>
      <Paper sx={{ p: 2, maxWidth: 900, mx: "auto", mb: 3 }} elevation={3}>
        <StudentForm
          form={form}
          editingId={editingId}
          error={error}
          onChange={handleChange}
          onAdd={handleAdd}
          onUpdate={handleUpdate}
          onCancel={() => {
            setEditingId(null);
            setForm({
              studentId: "",
              firstName: "",
              lastName: "",
              phone: "",
              email: "",
            });
          }}
        />
      </Paper>
      {loading ? (
        <Typography>Loading...</Typography>
      ) : (
        <StudentTable
          students={students}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      )}
    </Box>
  );
}

export default Students;
