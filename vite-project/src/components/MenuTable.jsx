import React from 'react';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Button, Typography } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';

export default function MenuTable({ title, data, isAdmin, onEdit, onDelete }) {
  if (!data || data.length === 0) return null;
  return (
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
              <TableRow key={row.itemId} sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                <TableCell component="th" scope="row">{row.item}</TableCell>
                <TableCell align="right">₪{row.price}</TableCell>
                <TableCell align="right">{row.availability}</TableCell>
                <TableCell align="right">{row.category}</TableCell>
                {isAdmin && (
                  <TableCell align="right">
                    <Button variant="contained" color="primary" onClick={() => onEdit(row.itemId)} sx={{ minWidth: 0, p: 1, mr: 1 }}><EditIcon /></Button>
                    <Button variant="contained" color="error" onClick={() => onDelete(row.itemId)} data-itemid={row.itemId} sx={{ minWidth: 0, p: 1, ml: 1 }}><DeleteIcon /></Button>
                  </TableCell>
                )}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </>
  );
}
