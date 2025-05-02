import React, { useState, useEffect } from 'react';
import { collection, onSnapshot, addDoc, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from './firebase';
import {
  Box,
  Typography,
  Paper
} from '@mui/material';
import StudentForm from './components/StudentForm';
import StudentTable from './components/StudentTable';
import usePageTitle from './hooks/usePageTitle';

function Students() {
  usePageTitle({ '/students': 'Students - Ono cafeteria' }, 'Ono cafeteria');
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
      <Paper sx={{ p: 2, maxWidth: 900, mx: 'auto', mb: 3 }} elevation={3}>
        <StudentForm
          form={form}
          editingId={editingId}
          error={error}
          onChange={handleChange}
          onAdd={handleAdd}
          onUpdate={handleUpdate}
          onCancel={() => { setEditingId(null); setForm({ studentId: '', firstName: '', lastName: '', phone: '', email: '' }); }}
        />
      </Paper>
      {loading ? (
        <Typography>Loading...</Typography>
      ) : (
        <StudentTable students={students} onEdit={handleEdit} onDelete={handleDelete} />
      )}
    </Box>
  );
}

export default Students;
