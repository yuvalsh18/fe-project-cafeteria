import React, { useEffect, useState } from "react";
import { db } from "./firebase";
import { collection, getDocs, doc, updateDoc } from "firebase/firestore";
import {
  Box,
  Typography,
  Card,
  CardContent,
  CardActions,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions as MuiDialogActions,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Grid,
} from "@mui/material";
import usePageTitle from "./hooks/usePageTitle";
import { useNavigate } from "react-router-dom";
import AssignmentIcon from "@mui/icons-material/Assignment";
import BuildCircleIcon from "@mui/icons-material/BuildCircle";
import LocalShippingIcon from "@mui/icons-material/LocalShipping";
import HourglassBottomIcon from "@mui/icons-material/HourglassBottom";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import Paper from "@mui/material/Paper";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import PersonIcon from "@mui/icons-material/Person";
import ListAltIcon from "@mui/icons-material/ListAlt";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import AttachMoneyIcon from "@mui/icons-material/AttachMoney";
import EditNoteIcon from "@mui/icons-material/EditNote";
import OrderDetailsModal from "./components/OrderDetailsModal";
import { useOrderStatusUpdater } from "./hooks/useOrderStatusUpdater";

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
      <Paper
        elevation={4}
        sx={{
          maxWidth: 1600,
          minWidth: 1200,
          mx: "auto",
          p: { xs: 2, sm: 4 },
          borderRadius: 5,
          mt: 3,
          bgcolor: "#f8fafc",
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
                            cursor: "pointer",
                            bgcolor: STATUS_BG[status],
                            boxShadow: 8,
                            borderRadius: 4,
                            borderLeft: `6px solid ${STATUS_COLORS[status]}`,
                            transition: "transform 0.18s, box-shadow 0.18s",
                            "&:hover": {
                              transform: "scale(1.04)",
                              boxShadow: 16,
                            },
                            minWidth: 240,
                            maxWidth: 320,
                            mx: "auto",
                            my: 1,
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            position: "relative",
                            zIndex: 1,
                          }}
                          onClick={() => handleCardClick(order)}
                        >
                          <CardContent sx={{ width: "100%", px: 2 }}>
                            <Typography
                              variant="overline"
                              fontWeight={700}
                              color={STATUS_COLORS[status]}
                            >
                              Order
                            </Typography>
                            <Typography
                              variant="subtitle1"
                              fontWeight={700}
                              gutterBottom
                              sx={{
                                wordBreak: "break-all",
                                color: STATUS_COLORS[status],
                                textAlign: "center",
                              }}
                            >
                              #{order.id}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              <b>Student:</b>{" "}
                              {order.student?.name ||
                                order.student?.studentId ||
                                order.studentDocId}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              <b>Items:</b>{" "}
                              {order.menuItems?.map((i) => i.name).join(", ")}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
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
        mode={"admin"}
        editable={true}
        onStatusChange={handleOrderStatusChange}
      />
    </>
  );
}
