import React from "react";
import { TableRow, TableCell } from "@mui/material";

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

export default function OrderRow({ order, mode, onClick }) {
  const orderDate = order.ordertimestamp
    ? formatDateTime(order.ordertimestamp)
    : "-";
  return (
    <TableRow hover sx={{ cursor: "pointer" }} onClick={onClick}>
      <TableCell>{order.orderID ? order.orderID : order.id}</TableCell>
      {mode === "admin" && <TableCell>{order.studentId}</TableCell>}
      <TableCell>{orderDate}</TableCell>
      {mode === "student" && <TableCell>{order.pickupOrDelivery}</TableCell>}
    </TableRow>
  );
}
