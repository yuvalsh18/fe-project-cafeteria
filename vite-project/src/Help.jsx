import { Typography, Box } from '@mui/material';
import React, { useEffect, useState } from 'react';
import Dialog from '@mui/material/Dialog';
import studentMenuImg from './images/student-menu.png';
import adminMenuImg from './images/admin-menu.png';
import studentsMngImg from './images/students-mng.png';
import placeNewOrderImg from './images/place-new-order.png';
import confirmOrderImg from './images/confirm-order.png';

export default function Help() {
  const [mode, setMode] = useState(() => localStorage.getItem('mode') || 'student');
  const [openImg, setOpenImg] = useState(null); // Track which image is open

  useEffect(() => {
    const handleStorageChange = () => {
      setMode(localStorage.getItem('mode') || 'student');
    };
    const handleModeChanged = () => {
      setMode(localStorage.getItem('mode') || 'student');
    };
    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('mode-changed', handleModeChanged);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('mode-changed', handleModeChanged);
    };
  }, []);

  // Helper to render an image with enlarge-on-click
  const renderImage = (src, alt) => (
    <>
      <img
        src={src}
        alt={alt}
        style={{ width: '100%', maxWidth: 400, marginBottom: 16, cursor: 'pointer', borderRadius: 8, boxShadow: '0 2px 8px rgba(0,0,0,0.12)' }}
        onClick={() => setOpenImg(src)}
      />
      <Dialog open={openImg === src} onClose={() => setOpenImg(null)} maxWidth="md">
        <img src={src} alt={alt} style={{ width: '100%', maxWidth: 800, display: 'block' }} />
      </Dialog>
    </>
  );

  return (
    <Box sx={{ p: 4, mt: 4 }}>
      {mode === 'student' ? (
        <>
          <Typography variant="h4" gutterBottom>Student Step-by-Step Guide</Typography>
          <Box sx={{ textAlign: 'left' }}>
            <Typography variant="body1" paragraph>
              Welcome to the student guide! Follow these steps to use the website effectively:
            </Typography>
            <Typography variant="h6" gutterBottom>1. Explore the Menu</Typography>
            <Typography variant="body1" paragraph>
              Navigate to the "Menu" page to browse the available food and drink items. You can view item details, prices, and availability.
            </Typography>
            {renderImage(studentMenuImg, "Menu Page Screenshot")}
            <Typography variant="h6" gutterBottom>2. Place a New Order</Typography>
            <Typography variant="body1" paragraph>
              Go to the "New Order" page, select your desired items, and specify the required details like pickup or delivery time.
            </Typography>
            {renderImage(placeNewOrderImg, "New Order Page Screenshot")}
            <Typography variant="h6" gutterBottom>3. Confirm Your Order</Typography>
            <Typography variant="body1" paragraph>
              Review your order details and confirm your submission. You will see a confirmation message once the order is placed successfully.
            </Typography>
            {renderImage(confirmOrderImg, "Order Confirmation Screenshot")}
            <Typography variant="h6" gutterBottom>4. Get Help</Typography>
            <Typography variant="body1" paragraph>
              If you encounter any issues, contact the cafeteria staff for assistance.
            </Typography>
          </Box>
        </>
      ) : (
        <>
          <Typography variant="h4" gutterBottom>Admin Step-by-Step Guide</Typography>
          <Box sx={{ textAlign: 'left' }}>
            <Typography variant="body1" paragraph>
              Welcome to the admin guide! Follow these steps to manage the website effectively:
            </Typography>
            <Typography variant="h6" gutterBottom>1. Manage the Menu</Typography>
            <Typography variant="body1" paragraph>
              Navigate to the "Menu" page to add, edit, or delete menu items. Ensure all items have accurate details.
            </Typography>
            {renderImage(adminMenuImg, "Admin Menu Page Screenshot")}
            <Typography variant="h6" gutterBottom>2. Manage Student Records</Typography>
            <Typography variant="body1" paragraph>
              Go to the "Students" page to add, update, or delete student records. Keep the information up-to-date.
            </Typography>
            {renderImage(studentsMngImg, "Students Page Screenshot")}
            <Typography variant="h6" gutterBottom>3. Monitor and Update Orders</Typography>
            <Typography variant="body1" paragraph>
              Check the orders placed by students and update their status as needed to ensure smooth operations.
            </Typography>
            {/* <img src="/path/to/filler-image-orders.png" alt="Orders Page Screenshot" style={{ width: '100%', marginBottom: '16px' }} /> */}
            <Typography variant="h6" gutterBottom>4. System Maintenance</Typography>
            <Typography variant="body1" paragraph>
              Regularly check for system updates or issues and address them promptly to maintain efficiency.
            </Typography>
          </Box>
        </>
      )}
    </Box>
  );
}
