import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom'; // Import useNavigate
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import { Typography, Button, Box } from '@mui/material'; // Import Button and Box

function createData(itemId, item, price, availability, category) {
  return { itemId, item, price, availability, category };
}

export default function Info() {
  const [rows, setRows] = useState([]);
  const navigate = useNavigate(); // Initialize navigate

  useEffect(() => {
    const storedMenu = localStorage.getItem('menu');
    if (storedMenu) {
      setRows(JSON.parse(storedMenu));
    } else {
      const defaultMenu = [
        createData(1, 'Coffee', '$2.50', 'Available', 'Beverage'),
        createData(2, 'Sandwich', '$5.00', 'Available', 'Food'),
        createData(3, 'Salad', '$4.00', 'Out of Stock', 'Food'),
        createData(4, 'Juice', '$3.00', 'Available', 'Beverage'),
        createData(5, 'Cookie', '$1.50', 'Available', 'Snack'),
      ];
      localStorage.setItem('menu', JSON.stringify(defaultMenu));
      setRows(defaultMenu);
    }
  }, []);

  return (
    <> 
      <Typography variant="h4">Info page</Typography>
      <Box sx={{ textAlign: 'left' }}> {/* Replaced div with Box */}
        <Button 
          variant="contained" 
          color="primary" 
          onClick={() => navigate('/addMenuItem')} // Navigate to addMenuItem
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
