import React, { useEffect, useState } from 'react';
import { Box, Typography, Paper, Grid, CircularProgress, Alert, Chip, Stack } from '@mui/material';
import { db } from '../firebase';
import { collection, getCountFromServer } from 'firebase/firestore';
import PeopleIcon from '@mui/icons-material/People';
import RestaurantMenuIcon from '@mui/icons-material/RestaurantMenu';
import AssignmentIcon from '@mui/icons-material/Assignment';

export default function AdminDashboard() {
  const [stats, setStats] = useState({ students: 0, menuItems: 0, orders: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [firestoreStatus, setFirestoreStatus] = useState('checking');

  useEffect(() => {
    let unsub = null;
    async function fetchStats() {
      setLoading(true);
      setError(null);
      console.log('[AdminDashboard] Fetching stats...');
      try {
        unsub = db && collection(db, 'students');
        console.log('[AdminDashboard] Checking Firestore connectivity...', unsub);
        let studentsCount, menuItemsCount;
        let orderStatusCounts = {
          new: 0,
          inMaking: 0,
          inDelivery: 0,
          waitingForPickup: 0,
          done: 0
        };
        // Students count
        try {
          const studentsSnap = await getCountFromServer(collection(db, 'students'));
          studentsCount = studentsSnap.data().count;
        } catch (err) {
          console.warn('[AdminDashboard] getCountFromServer failed for students:', err);
          const { getDocs } = await import('firebase/firestore');
          const studentsSnap = await getDocs(collection(db, 'students'));
          studentsCount = studentsSnap.size;
        }
        // Menu items count
        try {
          const menuSnap = await getCountFromServer(collection(db, 'menuItems'));
          menuItemsCount = menuSnap.data().count;
        } catch (err) {
          console.warn('[AdminDashboard] getCountFromServer failed for menuItems:', err);
          const { getDocs } = await import('firebase/firestore');
          const menuSnap = await getDocs(collection(db, 'menuItems'));
          menuItemsCount = menuSnap.size;
        }
        // Orders count by status
        try {
          const { getDocs, collection } = await import('firebase/firestore');
          const studentsSnap = await getDocs(collection(db, 'students'));
          for (const studentDoc of studentsSnap.docs) {
            const ordersSnap = await getDocs(collection(db, 'students', studentDoc.id, 'orders'));
            ordersSnap.forEach(orderDoc => {
              const status = (orderDoc.data().status || '').toLowerCase();
              if (status === 'new') orderStatusCounts.new++;
              else if (status === 'in making' || status === 'inmaking') orderStatusCounts.inMaking++;
              else if (status === 'in delivery' || status === 'indelivery') orderStatusCounts.inDelivery++;
              else if (status === 'waiting for pickup' || status === 'waitingforpickup') orderStatusCounts.waitingForPickup++;
              else if (status === 'done') orderStatusCounts.done++;
            });
          }
        } catch (err) {
          console.warn('[AdminDashboard] Counting orders in subcollections failed:', err);
        }
        setFirestoreStatus('connected');
        setStats({
          students: studentsCount,
          menuItems: menuItemsCount,
          orders: orderStatusCounts,
        });
      } catch (err) {
        console.error('[AdminDashboard] Error fetching stats:', err);
        setError('Failed to fetch statistics or connect to Firestore.');
        setFirestoreStatus('disconnected');
      } finally {
        setLoading(false);
        console.log('[AdminDashboard] Fetching stats complete.');
      }
    }
    fetchStats();
    return () => { unsub && (unsub = null); };
  }, []);

  return (
    <Box sx={{ p: 4, minHeight: '100vh', bgcolor: '#181a20' }}>
      <Typography variant="h3" gutterBottom sx={{ color: '#fff', fontWeight: 700, textAlign: 'center', mb: 4, letterSpacing: 2 }}>
        Admin Dashboard
      </Typography>
      <Grid container spacing={4} justifyContent="center">
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3, mb: 4, borderRadius: 3, boxShadow: 3 }}>
            <Typography variant="h6" gutterBottom>Firestore Connectivity</Typography>
            {firestoreStatus === 'checking' && <CircularProgress size={20} />}
            {firestoreStatus === 'connected' && <Alert severity="success">Connected to Firestore</Alert>}
            {firestoreStatus === 'disconnected' && <Alert severity="error">Not connected to Firestore</Alert>}
          </Paper>
        </Grid>
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 4, borderRadius: 3, boxShadow: 3, bgcolor: '#23272f' }}>
            <Typography variant="h5" gutterBottom sx={{ color: '#fff', fontWeight: 600, mb: 3 }}>Website Statistics</Typography>
            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 120 }}>
                <CircularProgress />
              </Box>
            ) : error ? (
              <Alert severity="error">{error}</Alert>
            ) : (
              <Grid container spacing={4}>
                <Grid item xs={12} sm={4}>
                  <Paper sx={{ p: 3, textAlign: 'center', borderRadius: 2, boxShadow: 2, bgcolor: '#21242b' }}>
                    <PeopleIcon sx={{ fontSize: 40, color: '#1976d2', mb: 1 }} />
                    <Typography variant="h3" sx={{ color: '#fff', fontWeight: 700 }}>{stats.students}</Typography>
                    <Typography sx={{ color: '#b0b3b8', fontWeight: 500 }}>Students</Typography>
                  </Paper>
                </Grid>
                <Grid item xs={12} sm={4}>
                  <Paper sx={{ p: 3, textAlign: 'center', borderRadius: 2, boxShadow: 2, bgcolor: '#21242b' }}>
                    <RestaurantMenuIcon sx={{ fontSize: 40, color: '#43a047', mb: 1 }} />
                    <Typography variant="h3" sx={{ color: '#fff', fontWeight: 700 }}>{stats.menuItems}</Typography>
                    <Typography sx={{ color: '#b0b3b8', fontWeight: 500 }}>Menu Items</Typography>
                  </Paper>
                </Grid>
                <Grid item xs={12} sm={4}>
                  <Paper sx={{ p: 3, textAlign: 'center', borderRadius: 2, boxShadow: 2, bgcolor: '#21242b' }}>
                    <AssignmentIcon sx={{ fontSize: 40, color: '#fbc02d', mb: 1 }} />
                    <Typography variant="h5" sx={{ color: '#fff', fontWeight: 700, mb: 1 }}>Orders</Typography>
                    <Stack spacing={1} sx={{ mb: 1 }}>
                      <Chip label={`New: ${stats.orders.new}`} color="primary" variant="filled" size="small" sx={{ bgcolor: '#1976d2', color: '#fff', fontWeight: 600 }} />
                      <Chip label={`In Making: ${stats.orders.inMaking}`} color="info" variant="filled" size="small" sx={{ bgcolor: '#0288d1', color: '#fff', fontWeight: 600 }} />
                      <Chip label={`In Delivery: ${stats.orders.inDelivery}`} color="warning" variant="filled" size="small" sx={{ bgcolor: '#fbc02d', color: '#fff', fontWeight: 600 }} />
                      <Chip label={`Waiting for Pickup: ${stats.orders.waitingForPickup}`} color="secondary" variant="filled" size="small" sx={{ bgcolor: '#7c4dff', color: '#fff', fontWeight: 600 }} />
                      <Chip label={`Done: ${stats.orders.done}`} color="success" variant="filled" size="small" sx={{ bgcolor: '#43a047', color: '#fff', fontWeight: 600 }} />
                    </Stack>
                    <Typography sx={{ color: '#fff', fontWeight: 700, mt: 2, fontSize: 18 }}>Total: {Object.values(stats.orders).reduce((a, b) => a + b, 0)}</Typography>
                  </Paper>
                </Grid>
              </Grid>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}
