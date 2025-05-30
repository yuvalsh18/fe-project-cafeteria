import React from "react";
import { Card, CardContent, Typography } from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";

// Status color and icon maps (should be imported or passed as props in real use)
const STATUS_COLORS = {
  new: "#1976d2",
  "in making": "#fb8c00",
  "in delivery": "#00897b",
  "waiting for pickup": "#7e57c2",
  done: "#388e3c",
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

export default function OrderCard({
  order,
  status,
  onClick,
  mode = "student",
}) {
  return (
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
        cursor: onClick ? "pointer" : "default",
      }}
      onClick={onClick}
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
          #{order.orderID || order.id}
        </Typography>
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ fontSize: 16 }}
        >
          <b>Items:</b> {order.menuItems?.map((i) => i.name).join(", ")}
        </Typography>
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ fontSize: 16 }}
        >
          <b>
            {order.pickupOrDelivery === "delivery"
              ? "Delivery Time"
              : "Pickup Time"}
            :
          </b>{" "}
          {order.requiredTime ? formatDateTime24(order.requiredTime) : ""}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          <b>Order Date:</b>{" "}
          {order.ordertimestamp ? formatDateTime24(order.ordertimestamp) : ""}
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
        {/* You can add more fields or admin-specific actions here using the mode prop */}
      </CardContent>
    </Card>
  );
}
