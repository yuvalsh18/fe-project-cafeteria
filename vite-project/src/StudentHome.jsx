import React, { useEffect, useState } from "react";
import { db } from "./firebase";
import { collection, getDocs } from "firebase/firestore";
import { Box, Typography, Button } from "@mui/material";
import usePageTitle from "./hooks/usePageTitle";
import { useNavigate } from "react-router-dom";
import StudentSelector from "./components/StudentSelector";
import OrderDetailsModal from "./components/OrderDetailsModal";
import { useOrderStatusUpdater } from "./hooks/useOrderStatusUpdater";
import OrderCard from "./components/OrderCard";
import OrdersTablePaper from "./components/OrdersTablePaper";
import AssignmentIcon from "@mui/icons-material/Assignment";
import BuildCircleIcon from "@mui/icons-material/BuildCircle";
import LocalShippingIcon from "@mui/icons-material/LocalShipping";
import HourglassBottomIcon from "@mui/icons-material/HourglassBottom";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";

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
  new: "#1976d2",
  "in making": "#fb8c00",
  "in delivery": "#00897b",
  "waiting for pickup": "#7e57c2",
  done: "#388e3c",
};

const STATUS_BG = {
  new: "#e3f0fa",
  "in making": "#fff0e0",
  "in delivery": "#e0f7f4",
  "waiting for pickup": "#ede7f6",
  done: "#e6f4ea",
};

export default function StudentHome() {
  usePageTitle({ "/student": "Student Home - Ono cafeteria" }, "Ono cafeteria");
  const navigate = useNavigate();
  const [students, setStudents] = useState([]);
  const [selectedStudentId, setSelectedStudentId] = useState("");
  const [ordersByStatus, setOrdersByStatus] = useState({});
  const [loading, setLoading] = useState(true);
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [detailsOrder, setDetailsOrder] = useState(null);

  // Fetch students for filter
  useEffect(() => {
    async function fetchStudents() {
      const snap = await getDocs(collection(db, "students"));
      const data = snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setStudents(data);
      // Try to select current student from localStorage, else first
      let current = localStorage.getItem("studentId");
      let found = data.find((s) => s.studentId === current) || data[0];
      setSelectedStudentId(found ? found.id : "");
    }
    fetchStudents();
  }, []);

  // Fetch orders for selected student
  useEffect(() => {
    if (!selectedStudentId) return;
    async function fetchOrders() {
      setLoading(true);
      const ordersSnap = await getDocs(
        collection(db, `students/${selectedStudentId}/orders`)
      );
      const orders = ordersSnap.docs.map((doc) => ({
        ...doc.data(),
        id: doc.id,
      }));
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
    }
    fetchOrders();
  }, [selectedStudentId]);

  // Hook to refresh orders after status change
  const handleStatusChange = useOrderStatusUpdater(() => {
    // re-fetch orders for the selected student
    if (!selectedStudentId) return;
    async function fetchOrders() {
      setLoading(true);
      const ordersSnap = await getDocs(
        collection(db, `students/${selectedStudentId}/orders`)
      );
      const orders = ordersSnap.docs.map((doc) => ({
        ...doc.data(),
        id: doc.id,
      }));
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
    }
    fetchOrders();
  });

  const handleOrderCardClick = (order) => {
    setDetailsOrder(order);
    setDetailsModalOpen(true);
  };
  const handleDetailsModalClose = () => {
    setDetailsModalOpen(false);
    setDetailsOrder(null);
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

  return (
    <Box sx={{ mt: 10 }}>
      <Typography
        variant="h3"
        align="center"
        gutterBottom
        fontWeight={700}
        letterSpacing={2}
      >
        My Orders
      </Typography>
      <Box
        sx={{
          width: "60%",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          mx: "auto",
          mb: 3,
        }}
      >
        <StudentSelector
          students={students}
          selectedStudentId={selectedStudentId}
          setSelectedStudentId={setSelectedStudentId}
        />
      </Box>
      <Box sx={{ textAlign: "center", mb: 3 }}>
        <Button
          variant="contained"
          color="primary"
          size="large"
          sx={{ fontSize: 20, px: 5, py: 1.5, borderRadius: 2, boxShadow: 2 }}
          onClick={() => {
            const selectedStudent = students.find(
              (s) => s.id === selectedStudentId
            );
            if (selectedStudent) {
              navigate(`/newOrder?studentId=${selectedStudent.studentId}`);
            } else {
              navigate("/newOrder");
            }
          }}
        >
          New Order
        </Button>
      </Box>
      <Box sx={{ width: "100%", display: "flex", justifyContent: "center" }}>
        <OrdersTablePaper
          loading={loading}
          ordersByStatus={ordersByStatus}
          ORDER_STATUSES={ORDER_STATUSES}
          STATUS_ICONS={STATUS_ICONS}
          STATUS_COLORS={STATUS_COLORS}
          STATUS_BG={STATUS_BG}
          mode="student"
          sx={{
            width: "100%",
            maxWidth: 1600,
            minWidth: 1200,
            p: { xs: 2, sm: 4 },
            borderRadius: 5,
            mt: 3,
            bgcolor: "#f8fafc",
          }}
          renderOrderCard={(order, status) => (
            <OrderCard
              order={order}
              status={status}
              onClick={() => handleOrderCardClick(order)}
              mode="student"
            />
          )}
        />
      </Box>
      <OrderDetailsModal
        open={detailsModalOpen}
        order={detailsOrder}
        onClose={handleDetailsModalClose}
        mode={"student"}
        editable={false}
        onStatusChange={handleStatusChange}
      />
    </Box>
  );
}
