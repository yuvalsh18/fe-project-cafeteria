import React, { useState } from "react";
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

const ORDER_STATUSES = [
  "new",
  "in making",
  "in delivery",
  "waiting for pickup",
  "done",
];

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

  const handleStatusUpdate = () => {
    if (onStatusChange && order) {
      onStatusChange(order, status);
    }
  };

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
            <b>Order ID:</b> {order.id}
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
            <b>Order Date:</b> {orderDate}
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
                  {ORDER_STATUSES.map((s) => (
                    <MenuItem key={s} value={s}>
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
