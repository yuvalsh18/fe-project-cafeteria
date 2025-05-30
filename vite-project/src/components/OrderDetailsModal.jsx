import React, { useState, useCallback } from "react";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import Button from "@mui/material/Button";
import {
  Box,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import PersonIcon from "@mui/icons-material/Person";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import DeliveryDiningIcon from "@mui/icons-material/DeliveryDining";
import RoomIcon from "@mui/icons-material/Room";
import NotesIcon from "@mui/icons-material/Notes";
import AttachMoneyIcon from "@mui/icons-material/AttachMoney";
import { isBefore, startOfDay } from "date-fns";

const ORDER_STATUSES = [
  "new",
  "in making",
  "in delivery",
  "waiting for pickup",
  "done",
];

// Add status colors for use in the modal
const STATUS_COLORS = {
  new: "#1976d2",
  "in making": "#fb8c00",
  "in delivery": "#00897b",
  "waiting for pickup": "#7e57c2",
  done: "#388e3c",
};

export default function OrderDetailsModal({
  open,
  order,
  onClose,
  mode,
  editable = false,
  onStatusChange,
}) {
  const [status, setStatus] = useState(order?.status || "new");
  React.useEffect(() => {
    setStatus(order?.status || "new");
  }, [order]);

  // Fix: keep status in sync with prop changes
  React.useEffect(() => {
    if (order && order.status !== status) {
      setStatus(order.status);
    }
  }, [order?.status]);

  const handleStatusUpdate = async () => {
    if (onStatusChange && order) {
      await onStatusChange(order, status);
      onClose(); // Close the modal after status update
    }
  };

  // Filter statuses based on order type
  let allowedStatuses = ORDER_STATUSES;
  if (order && order.pickupOrDelivery === "pickup") {
    // For pickup orders, do not allow any 'delivery' status
    allowedStatuses = ORDER_STATUSES.filter((s) => s !== "in delivery");
  } else if (order && order.pickupOrDelivery === "delivery") {
    // For delivery orders, do not allow any 'pickup' status
    allowedStatuses = ORDER_STATUSES.filter((s) => s !== "waiting for pickup");
  }

  // Helper to format date as dd/MM/yyyy and time as HH:mm
  function formatDateTime(date) {
    if (!date) return "-";
    const d = new Date(date.seconds ? date.seconds * 1000 : date);
    const day = String(d.getDate()).padStart(2, "0");
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const year = d.getFullYear();
    const hours = String(d.getHours()).padStart(2, "0");
    const minutes = String(d.getMinutes()).padStart(2, "0");
    return `${day}/${month}/${year} ${hours}:${minutes}`;
  }

  if (!order) return null;
  const orderDate = order.ordertimestamp
    ? new Date(order.ordertimestamp.seconds * 1000).toLocaleString()
    : "-";
  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <ShoppingCartIcon
          sx={{ mr: 1, verticalAlign: "middle" }}
          color="primary"
        />
        Order Details
      </DialogTitle>
      <DialogContent>
        <Box sx={{ mb: 2 }}>
          <Typography>
            <PersonIcon
              sx={{ mr: 1, verticalAlign: "middle" }}
              fontSize="small"
            />
            <b>Order ID:</b> {order.orderID ? order.orderID : order.id}
          </Typography>
          {mode === "admin" && (
            <Typography>
              <PersonIcon
                sx={{ mr: 1, verticalAlign: "middle" }}
                fontSize="small"
              />
              <b>Student ID:</b> {order.studentId}
            </Typography>
          )}
          <Typography>
            <AccessTimeIcon
              sx={{ mr: 1, verticalAlign: "middle" }}
              fontSize="small"
            />
            <b>Order Created At:</b> {formatDateTime(order.ordertimestamp)}
          </Typography>
          <Typography>
            <AccessTimeIcon
              sx={{ mr: 1, verticalAlign: "middle" }}
              fontSize="small"
            />
            <b>
              {order.pickupOrDelivery === "delivery" ? "Delivery" : "Pickup"}{" "}
              Time:
            </b>{" "}
            {formatDateTime(order.requiredTime)}
          </Typography>
          <Typography>
            <DeliveryDiningIcon
              sx={{ mr: 1, verticalAlign: "middle" }}
              fontSize="small"
            />
            <b>Type:</b> {order.pickupOrDelivery}
          </Typography>
          {order.pickupOrDelivery === "delivery" && (
            <Typography>
              <RoomIcon
                sx={{ mr: 1, verticalAlign: "middle" }}
                fontSize="small"
              />
              <b>Room:</b> {order.deliveryRoom}
            </Typography>
          )}
          <Typography>
            <b>Menu Items:</b> {order.menuItems?.map((i) => i.name).join(", ")}
          </Typography>
          <Typography>
            <AttachMoneyIcon
              sx={{ mr: 1, verticalAlign: "middle" }}
              fontSize="small"
            />
            <b>Price:</b> ₪{order.finalPrice}
          </Typography>
          {order.notes && (
            <Typography>
              <NotesIcon
                sx={{ mr: 1, verticalAlign: "middle" }}
                fontSize="small"
              />
              <b>Notes:</b> {order.notes}
            </Typography>
          )}
          {/* Status section */}
          <Box sx={{ mt: 2 }}>
            {editable ? (
              <FormControl fullWidth>
                <InputLabel id="status-label">Status</InputLabel>
                <Select
                  labelId="status-label"
                  value={status}
                  label="Status"
                  onChange={(e) => setStatus(e.target.value)}
                >
                  {allowedStatuses.map((s) => (
                    <MenuItem
                      key={s}
                      value={s}
                      // Only disable for non-admins if requiredTime is in the past
                      disabled={
                        mode !== "admin" &&
                        order.requiredTime &&
                        isBefore(new Date(order.requiredTime), new Date())
                      }
                    >
                      {s.charAt(0).toUpperCase() + s.slice(1)}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            ) : (
              <Typography sx={{ mt: 1 }}>
                <b>Status:</b> {order.status}
              </Typography>
            )}
          </Box>
        </Box>
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
          #{order.orderID || order.id}
        </Typography>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="primary" variant="contained">
          Close
        </Button>
        {editable && (
          <Button
            onClick={handleStatusUpdate}
            color="success"
            variant="contained"
          >
            Update Status
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
}

// Custom hook to refresh orders after status change
export function useOrderStatusUpdater(fetchOrders) {
  // fetchOrders: a function that reloads the orders from Firestore
  return useCallback(
    async (order, newStatus) => {
      // You can add any additional logic here if needed
      await fetchOrders();
    },
    [fetchOrders]
  );
}
