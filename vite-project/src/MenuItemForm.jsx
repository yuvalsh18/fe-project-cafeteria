import React, { useState, useEffect } from 'react';
import {
  Typography,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Box,
  colors,
  InputAdornment, // added
} from '@mui/material';
import { useNavigate, useParams } from 'react-router-dom';
import { doc, getDoc, updateDoc, collection, addDoc, getDocs, query, where } from "firebase/firestore";
import { db } from "./firebase";
import usePageTitle from './hooks/usePageTitle';

export default function MenuItemForm({ editMode = false }) {
  usePageTitle(
    editMode
      ? { '/editMenuItem/:itemId': 'Edit Menu Item - Ono cafeteria' }
      : { '/addMenuItem': 'New Menu Item - Ono cafeteria' },
    'Ono cafeteria'
  );
  const { itemId } = useParams();
  const [itemName, setItemName] = useState('');
  const [price, setPrice] = useState('');
  const [availability, setAvailability] = useState('Available');
  const [category, setCategory] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Fetch item data in edit mode
  useEffect(() => {
    if (editMode && itemId) {
      setLoading(true);
      (async () => {
        // Find the Firestore doc with matching ID
        const q = query(collection(db, "menuItems"), where("ID", "==", Number(itemId)));
        const snapshot = await getDocs(q);
        if (!snapshot.empty) {
          const data = snapshot.docs[0].data();
          setItemName(data.Item || '');
          setPrice(data.Price || '');
          setAvailability(data.Availability ? 'Available' : 'Out of Stock');
          setCategory(data.Category || '');
        }
        setLoading(false);
      })();
    }
  }, [editMode, itemId]);

  const handleSubmit = async (event) => {
    event.preventDefault();

    // Basic validation
    if (!itemName || !price || !category) {
      alert('Please fill in all fields.');
      return;
    }

    // Check if price is a valid number
    if (isNaN(parseFloat(price)) || parseFloat(price) <= 0) {
      alert('Please enter a valid price.');
      return;
    }

    try {
      if (editMode && itemId) {
        // Find the Firestore doc with matching ID
        const q = query(collection(db, "menuItems"), where("ID", "==", Number(itemId)));
        const snapshot = await getDocs(q);
        if (!snapshot.empty) {
          const docRef = snapshot.docs[0].ref;
          await updateDoc(docRef, {
            Item: itemName,
            Price: parseFloat(price),
            Availability: availability === "Available",
            Category: category
          });
          navigate('/menu');
        } else {
          alert('Item not found.');
        }
        return;
      }

      // Generate a unique random ID for the item
      let newItemId;
      let exists = true;
      while (exists) {
        newItemId = Math.floor(Math.random() * 1000000000);
        const q = query(collection(db, "menuItems"), where("ID", "==", newItemId));
        const snapshot = await getDocs(q);
        exists = !snapshot.empty;
      }

      await addDoc(collection(db, "menuItems"), {
        ID: newItemId,
        Item: itemName,
        Price: parseFloat(price),
        Availability: availability === "Available",
        Category: category
      });

      setItemName('');
      setPrice('');
      setAvailability('Available');
      setCategory('');
      navigate('/menu');
    } catch (error) {
      alert("Failed to add item: " + error.message);
    }
  };

  return (
    loading ? (
      <Box sx={{ textAlign: 'center', mt: 4 }}>
        <Typography variant="h6">Loading...</Typography>
      </Box>
    ) : (
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, maxWidth: 400, mx: 'auto', mt: 4, p:2, border:'1px solid #ccc', borderRadius:'5px', background: '#fff' }}>
        <Typography variant="h4" sx={{ color: 'black' }}>{editMode ? 'Edit Item Details' : 'New Menu Item'}</Typography>
        <form onSubmit={handleSubmit}>
          <Box sx={{mb:2}}>
            <TextField
              label="Item Name"
              variant="outlined"
              fullWidth
              value={itemName}
              onChange={(e) => setItemName(e.target.value)}
              required
            />
          </Box>
          <Box sx={{mb:2}}>
            <TextField
              label="Price"
              variant="outlined"
              fullWidth
              type="number"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              required
              InputProps={{
                endAdornment: <InputAdornment position="end">₪</InputAdornment>
              }}
            />
          </Box>
          <Box sx={{mb:2}}>
            <FormControl fullWidth>
              <InputLabel id="availability-label">Availability</InputLabel>
              <Select
                labelId="availability-label"
                id="availability"
                value={availability}
                label="Availability"
                onChange={(e) => setAvailability(e.target.value)}
              >
                <MenuItem value="Available">Available</MenuItem>
                <MenuItem value="Out of Stock">Out of Stock</MenuItem>
              </Select>
            </FormControl>
          </Box>
          <Box sx={{mb:2}}>
            <FormControl fullWidth>
              <InputLabel id="category-label">Category</InputLabel>
              <Select
                labelId="category-label"
                id="category"
                value={category}
                label="Category"
                onChange={(e) => setCategory(e.target.value)}
                required
              >
                <MenuItem value="Beverage">Beverage</MenuItem>
                <MenuItem value="Food">Food</MenuItem>
                <MenuItem value="Snack">Snack</MenuItem>
                <MenuItem value="Other">Other</MenuItem>
              </Select>
            </FormControl>
          </Box>
          <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
            <Button type="submit" variant="contained" color="primary">
              {editMode ? 'Submit Edit' : 'Add Item'}
            </Button>
            <Button
              type="button"
              variant="contained"
              color="inherit"
              sx={{
                border: '1px solid #ccc',
                color: '#333',
                backgroundColor: '#f5f5f5',
                '&:hover': {
                  backgroundColor: '#e0e0e0',
                }
              }}
              onClick={() => navigate('/menu')}
            >
              Cancel
            </Button>
          </Box>
        </form>
      </Box>
    )
  );
}
