import React, { useState, useEffect } from 'react';
import { collection, onSnapshot, addDoc, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from './firebase';
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TextField,
  Button,
  IconButton,
  Stack
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import PersonAddAltIcon from '@mui/icons-material/PersonAddAlt';
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Cancel';

function Students() {
  const [students, setStudents] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({ studentId: '', firstName: '', lastName: '', phone: '', email: '' });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'students'), (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setStudents(data);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const validateForm = () => {
    if (!form.studentId || !form.firstName || !form.lastName || !form.phone || !form.email) {
      setError('All fields are required.');
      return false;
    }
    // Simple validation for email and phone
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phoneRegex = /^\d{9,15}$/;
    if (!emailRegex.test(form.email)) {
      setError('Invalid email format.');
      return false;
    }
    if (!phoneRegex.test(form.phone)) {
      setError('Phone must be 9-15 digits.');
      return false;
    }
    setError('');
    return true;
  };

  const isDuplicate = () => {
    return students.some(s =>
      (s.studentId === form.studentId || s.phone === form.phone || s.email === form.email) &&
      (!editingId || s.id !== editingId)
    );
  };

  const handleAdd = async () => {
    if (!validateForm()) return;
    if (isDuplicate()) {
      setError('Duplicate Student ID, phone, or email.');
      return;
    }
    await addDoc(collection(db, 'students'), { ...form });
    setForm({ studentId: '', firstName: '', lastName: '', phone: '', email: '' });
    setError('');
  };

  const handleEdit = (student) => {
    setEditingId(student.id);
    setForm({
      studentId: student.studentId || '',
      firstName: student.firstName || '',
      lastName: student.lastName || '',
      phone: student.phone || '',
      email: student.email || ''
    });
  };

  const handleUpdate = async () => {
    if (!validateForm()) return;
    if (isDuplicate()) {
      setError('Duplicate Student ID, phone, or email.');
      return;
    }
    await updateDoc(doc(db, 'students', editingId), { ...form });
    setEditingId(null);
    setForm({ studentId: '', firstName: '', lastName: '', phone: '', email: '' });
    setError('');
  };

  const handleDelete = async (id) => {
    await deleteDoc(doc(db, 'students', id));
  };

  return (
    <Box sx={{ p: 4 }}>
      <Typography variant="h4" gutterBottom>Students</Typography>
      {error && (
        <Typography color="error" sx={{ mb: 2 }}>{error}</Typography>
      )}
      <Paper sx={{ p: 2, maxWidth: 900, mx: 'auto', mb: 3 }} elevation={3}>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems="center" justifyContent="center">
          <TextField
            name="studentId"
            label="Student ID"
            value={form.studentId}
            onChange={handleChange}
            size="small"
          />
          <TextField
            name="firstName"
            label="First Name"
            value={form.firstName}
            onChange={handleChange}
            size="small"
          />
          <TextField
            name="lastName"
            label="Last Name"
            value={form.lastName}
            onChange={handleChange}
            size="small"
          />
          <TextField
            name="phone"
            label="Phone"
            value={form.phone}
            onChange={handleChange}
            size="small"
          />
          <TextField
            name="email"
            label="Email"
            value={form.email}
            onChange={handleChange}
            size="small"
          />
          {editingId ? (
            <>
              <Button
                variant="contained"
                color="success"
                startIcon={<SaveIcon />}
                onClick={handleUpdate}
              >
                Update
              </Button>
              <Button
                variant="outlined"
                color="inherit"
                startIcon={<CancelIcon />}
                onClick={() => { setEditingId(null); setForm({ studentId: '', firstName: '', lastName: '', phone: '', email: '' }); }}
              >
                Cancel
              </Button>
            </>
          ) : (
            <Button
              variant="contained"
              color="primary"
              startIcon={<PersonAddAltIcon />}
              onClick={handleAdd}
            >
              Add
            </Button>
          )}
        </Stack>
      </Paper>
      {loading ? (
        <Typography>Loading...</Typography>
      ) : (
        <TableContainer component={Paper} sx={{ mb: 3 }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Student ID</TableCell>
                <TableCell>First Name</TableCell>
                <TableCell>Last Name</TableCell>
                <TableCell>Phone</TableCell>
                <TableCell>Email</TableCell>
                <TableCell align="center">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {students.map((student) => (
                <TableRow key={student.id}>
                  <TableCell>{student.studentId}</TableCell>
                  <TableCell>{student.firstName}</TableCell>
                  <TableCell>{student.lastName}</TableCell>
                  <TableCell>{student.phone}</TableCell>
                  <TableCell>{student.email}</TableCell>
                  <TableCell align="center">
                    <IconButton color="primary" onClick={() => handleEdit(student)}>
                      <EditIcon />
                    </IconButton>
                    <IconButton color="error" onClick={() => handleDelete(student.id)}>
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  );
}

export default Students;
