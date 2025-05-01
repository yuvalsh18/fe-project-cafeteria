import { Typography, Button, Box } from '@mui/material'
import React from 'react'
import { useNavigate } from 'react-router-dom'

export default function StudentHome() {
  const navigate = useNavigate();
  return (
    <Box sx={{ textAlign: 'center', mt: 4 }}>
      <Typography variant="h4">Student Home page</Typography>
      <Button
        variant="contained"
        color="primary"
        sx={{ mt: 3 }}
        onClick={() => navigate('/newOrder')}
      >
        New Order
      </Button>
    </Box>
  )
}
