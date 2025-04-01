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
} from '@mui/material';
import { useNavigate } from 'react-router-dom';

export default function MenuItemForm() {
  const [itemName, setItemName] = useState('');
  const [price, setPrice] = useState('');
  const [availability, setAvailability] = useState('Available');
  const [category, setCategory] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (event) => {
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

    // Create FormData object
    const formData = new FormData();
    formData.append('itemName', itemName);
    formData.append('price', price);
    formData.append('availability', availability);
    formData.append('category', category);

    // Get existing menu from local storage
    const storedMenu = localStorage.getItem('menu');
    const currentMenu = storedMenu ? JSON.parse(storedMenu) : [];

    // Determine the next available item ID
    let nextItemId = 1;
    if (currentMenu.length > 0) {
      const lastItem = currentMenu[currentMenu.length - 1];
      nextItemId = lastItem.itemId + 1;
    }

    // Create the new item object
    const newItem = {
      itemId: nextItemId,
      item: formData.get('itemName'), // Get values from FormData
      price: `$${parseFloat(formData.get('price')).toFixed(2)}`, // Format price
      availability: formData.get('availability'),
      category: formData.get('category'),
    };

    // Add new item to the menu
    const updatedMenu = [...currentMenu, newItem];

    // Save updated menu to local storage
    localStorage.setItem('menu', JSON.stringify(updatedMenu));

    // Reset form fields
    setItemName('');
    setPrice('');
    setAvailability('Available');
    setCategory('');

    // Navigate back to the info page
    navigate('/info');

    // Log FormData for debugging (optional)
    for (const pair of formData.entries()) {
      console.log(`${pair[0]}, ${pair[1]}`);
    }
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, maxWidth: 400, mx: 'auto', mt: 4, p:2, border:'1px solid #ccc', borderRadius:'5px' }}>
      <Typography variant="h4">New Menu Item</Typography>
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
