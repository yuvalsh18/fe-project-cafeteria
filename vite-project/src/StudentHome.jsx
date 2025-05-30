import React, { useEffect, useState } from "react";
import { db } from "./firebase";
import { collection, getDocs } from "firebase/firestore";
import {
  Box,
  Typography,
  Card,
  CardContent,
  Paper,
  Grid,
  Button,
} from "@mui/material";
import usePageTitle from "./hooks/usePageTitle";
import { useNavigate } from "react-router-dom";
import AssignmentIcon from "@mui/icons-material/Assignment";
import BuildCircleIcon from "@mui/icons-material/BuildCircle";
import LocalShippingIcon from "@mui/icons-material/LocalShipping";
import HourglassBottomIcon from "@mui/icons-material/HourglassBottom";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import StudentSelector from "./components/StudentSelector";
import OrderDetailsModal from "./components/OrderDetailsModal";

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

  const handleOrderCardClick = (order) => {
    setDetailsOrder(order);
    setDetailsModalOpen(true);
  };
  const handleDetailsModalClose = () => {
    setDetailsModalOpen(false);
    setDetailsOrder(null);
  };

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
          width: "100%",
          maxWidth: 700,
          mx: "auto",
          mb: 3,
          display: { xs: "none", md: "block" },
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
          onClick={() => navigate("/newOrder")}
        >
          NEW ORDER
        </Button>
      </Box>
      <Paper
        elevation={4}
        sx={{
          maxWidth: 1100,
          minWidth: 700,
          mx: "auto",
          p: 4,
          borderRadius: 5,
          mt: 3,
          bgcolor: "#fff",
          boxShadow: 6,
        }}
      >
        {loading ? (
          <Box
            display="flex"
            justifyContent="center"
            alignItems="center"
            minHeight="40vh"
          >
            <Typography variant="h6">Loading orders...</Typography>
          </Box>
        ) : (
          <Box>
            {ORDER_STATUSES.map((status) => (
              <Paper
                key={status}
                elevation={2}
                sx={{
                  mb: 6,
                  p: 3,
                  borderRadius: 4,
                  bgcolor: STATUS_BG[status],
                  borderLeft: `8px solid ${STATUS_COLORS[status]}`,
                  boxShadow: 3,
                }}
              >
                <Box display="flex" alignItems="center" mb={2}>
                  {React.cloneElement(STATUS_ICONS[status], {
                    style: { color: STATUS_COLORS[status], marginRight: 12 },
                  })}
                  <Typography
                    variant="h5"
                    sx={{
                      fontWeight: 700,
                      color: STATUS_COLORS[status],
                      letterSpacing: 1,
                      fontSize: 28,
                    }}
                  >
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </Typography>
                </Box>
                <Grid container spacing={3}>
                  {ordersByStatus[status] &&
                  ordersByStatus[status].length > 0 ? (
                    ordersByStatus[status].map((order) => (
                      <Grid item xs={12} sm={6} md={4} key={order.id}>
                        <Card
                          sx={{
                            bgcolor: "#fff",
                            boxShadow: 6,
                            borderRadius: 4,
                            borderLeft: `6px solid ${STATUS_COLORS[status]}`,
                            minWidth: 260,
                            maxWidth: 340,
                            mx: "auto",
                            my: 1,
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            position: "relative",
                            zIndex: 1,
                          }}
                          onClick={() => handleOrderCardClick(order)}
                        >
                          <CardContent sx={{ width: "100%", px: 2 }}>
                            <Typography
                              variant="overline"
                              fontWeight={700}
                              color={STATUS_COLORS[status]}
                              sx={{ fontSize: 16 }}
                            >
                              ORDER
                            </Typography>
                            <Typography
                              variant="subtitle1"
                              fontWeight={700}
                              gutterBottom
                              sx={{
                                wordBreak: "break-all",
                                color: STATUS_COLORS[status],
                                textAlign: "center",
                                fontSize: 20,
                              }}
                            >
                              #{order.id}
                            </Typography>
                            <Typography
                              variant="body2"
                              color="text.secondary"
                              sx={{ fontSize: 16 }}
                            >
                              <b>Items:</b>{" "}
                              {order.menuItems?.map((i) => i.name).join(", ")}
                            </Typography>
                            <Typography
                              variant="body2"
                              color="text.secondary"
                              sx={{ fontSize: 16 }}
                            >
                              <b>Time:</b>{" "}
                              {order.requiredTime
                                ? new Date(order.requiredTime).toLocaleString()
                                : ""}
                            </Typography>
                            <Typography
                              variant="body2"
                              fontWeight={600}
                              sx={{
                                color: STATUS_COLORS[status],
                                display: "inline",
                                fontSize: 16,
                              }}
                            >
                              <b>Price:</b> ₪{order.finalPrice}
                            </Typography>
                            {status === "done" && (
                              <Typography
                                variant="body2"
                                fontWeight={600}
                                sx={{
                                  color: STATUS_COLORS["done"],
                                  display: "inline",
                                  ml: 2,
                                  fontSize: 16,
                                }}
                              >
                                <CheckCircleIcon
                                  sx={{
                                    fontSize: 18,
                                    verticalAlign: "middle",
                                    color: STATUS_COLORS["done"],
                                    mr: 0.5,
                                  }}
                                />
                                Done
                              </Typography>
                            )}
                          </CardContent>
                        </Card>
                      </Grid>
                    ))
                  ) : (
                    <Grid item xs={12}>
                      <Typography
                        variant="body2"
                        color="text.disabled"
                        align="center"
                        sx={{ fontSize: 18 }}
                      >
                        No orders
                      </Typography>
                    </Grid>
                  )}
                </Grid>
              </Paper>
            ))}
          </Box>
        )}
      </Paper>
      <OrderDetailsModal
        open={detailsModalOpen}
        order={detailsOrder}
        onClose={handleDetailsModalClose}
        mode={"student"}
        editable={false}
      />
    </Box>
  );
}
