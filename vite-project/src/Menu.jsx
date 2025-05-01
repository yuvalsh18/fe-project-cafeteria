import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import { Typography, Button, Box } from '@mui/material';
import { collection, onSnapshot, doc, deleteDoc } from "firebase/firestore";
import { db } from "./firebase";
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';

export default function Menu() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true); // loading state
  const navigate = useNavigate();

  useEffect(() => {
    const handleStorageChange = () => {
      const mode = localStorage.getItem('mode');
      setIsAdmin(mode === 'admin');
    };

    // Initial check
    handleStorageChange();

    // Listen for changes to localStorage (cross-tab)
    window.addEventListener('storage', handleStorageChange);

    // Listen for changes in this tab
    const origSetItem = localStorage.setItem;
    localStorage.setItem = function(key, value) {
      origSetItem.apply(this, arguments);
      if (key === 'mode') handleStorageChange();
    };

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      localStorage.setItem = origSetItem;
    };
  }, []);

  useEffect(() => {
    // Listen to Firestore menuItems collection
    const unsubscribe = onSnapshot(
      collection(db, "menuItems"),
      (snapshot) => {
        const menuData = snapshot.docs.map(doc => {
          const d = doc.data();
          return {
            itemId: d.ID || doc.id,
            item: d.Item,
            price: d.Price,
            availability: d.Availability ? "Available" : "Out of Stock",
            category: d.Category
          };
        });
        setRows(menuData);
        setLoading(false); // data loaded
      }
    );
    return () => unsubscribe();
  }, []);

  // Categorize rows
  const snacks = rows.filter(row => row.category === "Snack");
  const food = rows.filter(row => row.category === "Food");
  const beverage = rows.filter(row => row.category === "Beverage");
  const other = rows.filter(
    row => row.category !== "Snack" && row.category !== "Food" && row.category !== "Beverage"
  );

  // Helper to render a table for a category
  const renderTable = (title, data) => (
    <>
      <Typography variant="h6" sx={{ mt: 3, mb: 1 }}>{title}</Typography>
      <TableContainer component={Paper} sx={{ mb: 2 }}>
        <Table sx={{ minWidth: 650 }} aria-label={`${title} table`}>
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: 'bold' }}>Item</TableCell>
              <TableCell align="right" sx={{ fontWeight: 'bold' }}>Price</TableCell>
              <TableCell align="right" sx={{ fontWeight: 'bold' }}>Availability</TableCell>
              <TableCell align="right" sx={{ fontWeight: 'bold' }}>Category</TableCell>
              {isAdmin && <TableCell align="right" sx={{ fontWeight: 'bold' }}>Actions</TableCell>}
            </TableRow>
          </TableHead>
          <TableBody>
            {data.map((row) => (
              <TableRow
                key={row.itemId}
                sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
              >
                <TableCell component="th" scope="row">
                  {row.item}
                </TableCell>
                <TableCell align="right">
                  ₪{row.price}
                </TableCell>
                <TableCell align="right">{row.availability}</TableCell>
                <TableCell align="right">{row.category}</TableCell>
                {isAdmin && (
                  <TableCell align="right">
                    <Button 
                      variant="contained"
                      color="primary"
                      onClick={() => navigate(`/editMenuItem/${row.itemId}`)}
                      sx={{ minWidth: 0, p: 1, mr: 1 }}
                    >
                      <EditIcon />
                    </Button>
                    <Button 
                      variant="contained"
                      color="error"
                      onClick={() => handleDelete(row.itemId)}
                      data-itemid={row.itemId}
                      sx={{ minWidth: 0, p: 1, ml: 1 }}
                    >
                      <DeleteIcon />
                    </Button>
                  </TableCell>
                )}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </>
  );

  const handleDelete = async (itemId) => {
    // Accept both string and number for itemId
    try {
      const { getDocs, collection } = await import('firebase/firestore');
      const snapshot = await getDocs(collection(db, "menuItems"));
      let docIdToDelete = null;
      snapshot.forEach(docSnap => {
        const data = docSnap.data();
        // Compare as string to avoid type mismatch
        if (String(data.ID) === String(itemId)) {
          docIdToDelete = docSnap.id;
        }
      });
      if (!docIdToDelete) {
        console.error('No Firestore document found for itemId:', itemId);
        alert('Failed to delete item: No matching Firestore document.');
        return;
      }
      if (window.confirm('Are you sure you want to delete this item?')) {
        await deleteDoc(doc(db, "menuItems", docIdToDelete));
        alert('Item deleted successfully.');
      }
    } catch (error) {
      console.error('Error deleting item:', error, 'Item ID:', itemId);
      alert('Failed to delete item. Please try again.');
    }
  };

  return (
    <> 
      <Box sx={{ mt: 10 }}> {/* Add margin-top to push content below header */}
        <Typography variant="h4">Menu page</Typography>
        <Box sx={{ textAlign: 'left' }}>
          {isAdmin && (
            <Button 
              variant="contained" 
              color="primary" 
              onClick={() => navigate('/addMenuItem')}
              style={{ marginBottom: '16px' }}
            >
              New Item
            </Button>
          )}
        </Box>
        {loading ? (
          <Typography variant="body1" sx={{ textAlign: 'center', marginTop: 2 }}>
            Loading...
          </Typography>
        ) : (
          <>
            {renderTable("Snacks", snacks)}
            {renderTable("Food", food)}
            {renderTable("Beverage", beverage)}
            {renderTable("Other", other)}
          </>
        )}
      </Box>
    </>
  );
}