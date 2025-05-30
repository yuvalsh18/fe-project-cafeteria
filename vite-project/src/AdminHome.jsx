import React, { useEffect, useState } from "react";
import { db } from "./firebase";
import { collection, getDocs, doc, updateDoc } from "firebase/firestore";
import { Box, Typography, Button } from "@mui/material";
import usePageTitle from "./hooks/usePageTitle";
import { useNavigate } from "react-router-dom";
import OrderDetailsModal from "./components/OrderDetailsModal";
import { useOrderStatusUpdater } from "./hooks/useOrderStatusUpdater";
import OrderCard from "./components/OrderCard";
import AssignmentIcon from "@mui/icons-material/Assignment";
import BuildCircleIcon from "@mui/icons-material/BuildCircle";
import LocalShippingIcon from "@mui/icons-material/LocalShipping";
import HourglassBottomIcon from "@mui/icons-material/HourglassBottom";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import OrdersTablePaper from "./components/OrdersTablePaper";

const ORDER_STATUSES = [
  "new",
  "in making",
  "in delivery",
  "waiting for pickup",
  "done",
];

const STATUS_ICONS = {
  new: <AssignmentIcon color="primary" sx={{ fontSize: 32 }} />,
  "in making": <BuildCircleIcon color="warning" sx={{ fontSize: 32 }} />,
  "in delivery": <LocalShippingIcon color="info" sx={{ fontSize: 32 }} />,
  "waiting for pickup": (
    <HourglassBottomIcon color="secondary" sx={{ fontSize: 32 }} />
  ),
  done: <CheckCircleIcon color="success" sx={{ fontSize: 32 }} />,
};

const STATUS_COLORS = {
  new: "#1976d2", // blue
  "in making": "#fb8c00", // deep orange
  "in delivery": "#00897b", // teal dark
  "waiting for pickup": "#7e57c2", // deep purple
  done: "#388e3c", // dark green
};

const STATUS_BG = {
  new: "#e3f0fa", // lighter blue
  "in making": "#fff0e0", // lighter orange
  "in delivery": "#e0f7f4", // lighter teal
  "waiting for pickup": "#ede7f6", // lighter purple
  done: "#e6f4ea", // lighter green
};

// Helper to format date as dd/MM/yyyy and time as HH:mm (24-hour)
function formatDateTime24(date) {
  if (!date) return "-";
  const d = new Date(date.seconds ? date.seconds * 1000 : date);
  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const year = d.getFullYear();
  const hours = String(d.getHours()).padStart(2, "0");
  const minutes = String(d.getMinutes()).padStart(2, "0");
  return `${day}/${month}/${year} ${hours}:${minutes}`;
}

export default function AdminHome() {
  usePageTitle({ "/admin": "Admin Home - Ono cafeteria" }, "Ono cafeteria");
  const [ordersByStatus, setOrdersByStatus] = useState({});
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(true);
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [detailsOrder, setDetailsOrder] = useState(null);
  const navigate = useNavigate();

  // Refetch orders logic for useOrderStatusUpdater
  const fetchOrders = async () => {
    setLoading(true);
    const studentsSnap = await getDocs(collection(db, "students"));
    const orders = [];
    for (const studentDoc of studentsSnap.docs) {
      const studentId = studentDoc.id;
      const studentData = studentDoc.data();
      const ordersSnap = await getDocs(
        collection(db, `students/${studentId}/orders`)
      );
      ordersSnap.forEach((orderDoc) => {
        orders.push({
          ...orderDoc.data(),
          id: orderDoc.id,
          studentDocId: studentId,
          student: studentData,
        });
      });
    }
    // Group by status
    const grouped = {};
    for (const status of ORDER_STATUSES) grouped[status] = [];
    for (const order of orders) {
      const s = order.status || "new";
      if (!grouped[s]) grouped[s] = [];
      grouped[s].push(order);
    }
    setOrdersByStatus(grouped);
    setLoading(false);
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  // Integrate useOrderStatusUpdater
  const handleStatusChange = useOrderStatusUpdater(fetchOrders);

  const handleCardClick = (order) => {
    setDetailsOrder(order);
    setDetailsModalOpen(true);
  };
  const handleDetailsModalClose = () => {
    setDetailsModalOpen(false);
    setDetailsOrder(null);
  };

  // Update to use handleStatusChange for status updates
  const handleOrderStatusChange = async (order, newStatus) => {
    if (!order) return;
    const orderRef = doc(
      db,
      `students/${order.studentDocId}/orders/${order.id}`
    );
    await updateDoc(orderRef, { status: newStatus });
    setDetailsOrder({ ...order, status: newStatus });
    await handleStatusChange(order, newStatus); // Refresh order lists after status change
  };

  const handleEditOrder = () => {
    if (selectedOrder) {
      navigate(`/editOrder/${selectedOrder.studentDocId}/${selectedOrder.id}`);
    }
  };

  return (
    <>
      <Typography
        variant="h3"
        align="center"
        gutterBottom
        fontWeight={700}
        letterSpacing={2}
        sx={{ mt: 10 }}
      >
        Admin Orders
      </Typography>
      <Box display="flex" justifyContent="center" mb={2}>
        <Button
          variant="contained"
          color="primary"
          size="large"
          sx={{ fontSize: 20, px: 5, py: 1.5, borderRadius: 2, boxShadow: 2 }}
          onClick={() => navigate("/newOrder")}
        >
          New Order
        </Button>
      </Box>
      <OrdersTablePaper
        loading={loading}
        ordersByStatus={ordersByStatus}
        ORDER_STATUSES={ORDER_STATUSES}
        STATUS_ICONS={STATUS_ICONS}
        STATUS_COLORS={STATUS_COLORS}
        STATUS_BG={STATUS_BG}
        mode="admin"
        renderOrderCard={(order, status) => (
          <OrderCard
            order={order}
            status={status}
            onClick={() => handleCardClick(order)}
            mode="admin"
          />
        )}
      />
      <OrderDetailsModal
        open={detailsModalOpen}
        order={detailsOrder}
        onClose={handleDetailsModalClose}
        mode={"admin"}
        editable={true}
        onStatusChange={handleOrderStatusChange}
      />
    </>
  );
}
