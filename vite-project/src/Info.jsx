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
import { collection, onSnapshot } from "firebase/firestore";
import { db } from "./firebase";

export default function Info() {
  const [rows, setRows] = useState([]);
  const navigate = useNavigate();

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
      }
    );
    return () => unsubscribe();
  }, []);

  return (
    <> 
      <Typography variant="h4">Info page</Typography>
      <Box sx={{ textAlign: 'left' }}>
        <Button 
          variant="contained" 
          color="primary" 
          onClick={() => navigate('/addMenuItem')}
          style={{ marginBottom: '16px' }}
        >
          New Item
        </Button>
      </Box>
      <TableContainer component={Paper}>
        <Table sx={{ minWidth: 650 }} aria-label="simple table">
          <TableHead>
            <TableRow>
              <TableCell>Item</TableCell>
              <TableCell align="right">Price</TableCell>
              <TableCell align="right">Availability</TableCell>
              <TableCell align="right">Category</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.map((row) => (
              <TableRow
                key={row.itemId}
                sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
              >
                <TableCell component="th" scope="row">
                  {row.item}
                </TableCell>
                <TableCell align="right">{row.price}</TableCell>
                <TableCell align="right">{row.availability}</TableCell>
                <TableCell align="right">{row.category}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </>
  );
}
