import React from "react";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import Button from "@mui/material/Button";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import PersonIcon from "@mui/icons-material/Person";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import DeliveryDiningIcon from "@mui/icons-material/DeliveryDining";
import RoomIcon from "@mui/icons-material/Room";
import NotesIcon from "@mui/icons-material/Notes";
import AttachMoneyIcon from "@mui/icons-material/AttachMoney";
import CancelIcon from "@mui/icons-material/Cancel";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import { Box, Typography } from "@mui/material";

export default function OrderConfirmationDialog({
  open,
  onClose,
  onConfirm,
  order,
}) {
  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>
        <ShoppingCartIcon
          sx={{ mr: 1, verticalAlign: "middle" }}
          color="primary"
        />
        Confirm Order
      </DialogTitle>
      <DialogContent>
        {order && (
          <Box>
            <Typography>
              <b>
                <span style={{ display: "inline-flex", alignItems: "center" }}>
                  <PersonIcon sx={{ mr: 0.5 }} fontSize="small" />
                  Student ID:
                </span>
              </b>{" "}
              {order.studentId}
            </Typography>
            <Typography>
              <b>
                <span style={{ display: "inline-flex", alignItems: "center" }}>
                  <ShoppingCartIcon sx={{ mr: 0.5 }} fontSize="small" />
                  Menu Items:
                </span>
              </b>{" "}
              {order.menuItems.map((i) => `${i.name} (₪${i.price})`).join(", ")}
            </Typography>
            <Typography>
              <b>
                <span style={{ display: "inline-flex", alignItems: "center" }}>
                  <AccessTimeIcon sx={{ mr: 0.5 }} fontSize="small" />
                  Required Time:
                </span>
              </b>{" "}
              {order.requiredTime
                ? new Date(order.requiredTime).toLocaleString()
                : ""}
            </Typography>
            <Typography>
              <b>
                <span style={{ display: "inline-flex", alignItems: "center" }}>
                  <DeliveryDiningIcon sx={{ mr: 0.5 }} fontSize="small" />
                  Type:
                </span>
              </b>{" "}
              {order.pickupOrDelivery}
            </Typography>
            {order.pickupOrDelivery === "delivery" && (
              <Typography>
                <b>
                  <span
                    style={{ display: "inline-flex", alignItems: "center" }}
                  >
                    <RoomIcon sx={{ mr: 0.5 }} fontSize="small" />
                    Room:
                  </span>
                </b>{" "}
                {order.deliveryRoom}
              </Typography>
            )}
            {order.notes && (
              <Typography>
                <b>
                  <span
                    style={{ display: "inline-flex", alignItems: "center" }}
                  >
                    <NotesIcon sx={{ mr: 0.5 }} fontSize="small" />
                    Notes:
                  </span>
                </b>{" "}
                {order.notes}
              </Typography>
            )}
            <Typography>
              <b>
                <span style={{ display: "inline-flex", alignItems: "center" }}>
                  <AttachMoneyIcon sx={{ mr: 0.5 }} fontSize="small" />
                  Final Price:
                </span>
              </b>{" "}
              ₪{order.finalPrice}
            </Typography>
          </Box>
        )}
      </DialogContent>
      <DialogActions>
        <Button
          onClick={onClose}
          variant="outlined"
          color="error"
          startIcon={<CancelIcon />}
        >
          Cancel
        </Button>
        <Button
          onClick={onConfirm}
          color="primary"
          variant="contained"
          startIcon={<CheckCircleIcon />}
        >
          Confirm
        </Button>
      </DialogActions>
    </Dialog>
  );
}
