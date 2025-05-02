import { Typography, Box } from '@mui/material';
import React, { useEffect, useState } from 'react';
import Dialog from '@mui/material/Dialog';
import useMode from './hooks/useMode';
import usePageTitle from './hooks/usePageTitle';
import studentMenuImg from './images/student-menu.png';
import adminMenuImg from './images/admin-menu.png';
import studentsMngImg from './images/students-mng.png';
import placeNewOrderImg from './images/place-new-order.png';
import confirmOrderImg from './images/confirm-order.png';
import adminDashboardImg from './images/admin-dashboard.png';
import adminsOrdersImg from './images/admins-orders-page.png';
import studentsOrdersImg from './images/students-orders-page.png';
import adminOrderDialogImg from './images/admin-order-dialog.png';

export default function Help() {
  usePageTitle({ '/help': 'Help - Ono cafeteria' }, 'Ono cafeteria');
  const mode = useMode();
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
            <Typography variant="h6" gutterBottom>4. Track Your Orders</Typography>
            <Typography variant="body1" paragraph>
              On the Student Home page, you can view all your orders grouped by their status (New, In Making, In Delivery, Waiting for Pickup, Done). This helps you keep track of your order progress.
            </Typography>
            {renderImage(studentsOrdersImg, "Student Orders Page Screenshot")}
            <Typography variant="h6" gutterBottom>5. Get Help</Typography>
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
              Check the orders placed by students and update their status as needed to ensure smooth operations. The Admin Orders page shows all orders grouped by their status for easy management.
            </Typography>
            {renderImage(adminsOrdersImg, "Admin Orders Page Screenshot")}
            <Typography variant="h6" gutterBottom>4. View and Edit Order Details</Typography>
            <Typography variant="body1" paragraph>
              Click on any order card to open the order dialog box. Here you can view all order details, change the order status, or edit the order if needed.
            </Typography>
            {renderImage(adminOrderDialogImg, "Admin Order Dialog Screenshot")}
            <Typography variant="h6" gutterBottom>5. Use the Admin Dashboard</Typography>
            <Typography variant="body1" paragraph>
              The <b>Admin Dashboard</b> provides a quick overview of the system's key statistics:
              <ul>
                <li><b>Students</b>: Total number of registered students.</li>
                <li><b>Menu Items</b>: Total number of items available in the menu.</li>
                <li><b>Orders</b>: See a breakdown of all orders by their status (New, In Making, In Delivery, Waiting for Pickup, Done) and the total number of orders.</li>
                <li>Dashboard cards use color and icons for easy recognition. Use this page to monitor cafeteria activity at a glance.</li>
                <li>If the dashboard shows a connection error, check your internet connection or Firestore permissions.</li>
              </ul>
            </Typography>
            {renderImage(adminDashboardImg, "Admin Dashboard Screenshot")}
            <Typography variant="h6" gutterBottom>6. System Maintenance</Typography>
            <Typography variant="body1" paragraph>
              Regularly check for system updates or issues and address them promptly to maintain efficiency.
            </Typography>
          </Box>
        </>
      )}
    </Box>
  );
}
