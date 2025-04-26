import React, { useState } from 'react';
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
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { collection, addDoc, getDocs, query, where } from "firebase/firestore";
import { db } from "./firebase";

export default function MenuItemForm() {
  const [itemName, setItemName] = useState('');
  const [price, setPrice] = useState('');
  const [availability, setAvailability] = useState('Available');
  const [category, setCategory] = useState('');
  const navigate = useNavigate();

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
      // Generate a unique random ID for the item
      let itemId;
      let exists = true;
      while (exists) {
        itemId = Math.floor(Math.random() * 1000000000);
        const q = query(collection(db, "menuItems"), where("ID", "==", itemId));
        const snapshot = await getDocs(q);
        exists = !snapshot.empty;
      }

      await addDoc(collection(db, "menuItems"), {
        ID: itemId,
        Item: itemName,
        Price: parseFloat(price),
        Availability: availability === "Available",
        Category: category
      });

      setItemName('');
      setPrice('');
      setAvailability('Available');
      setCategory('');
      navigate('/info');
    } catch (error) {
      alert("Failed to add item: " + error.message);
    }
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, maxWidth: 400, mx: 'auto', mt: 4, p:2, border:'1px solid #ccc', borderRadius:'5px', background: '#f3f6fa' }}>
      <Typography variant="h4" sx={{ color: 'black' }}>New Menu Item</Typography>
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
        <Button type="submit" variant="contained" color="primary">
          Add Item
        </Button>
      </form>
    </Box>
  );
}
