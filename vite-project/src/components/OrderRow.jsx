import React from "react";
import { TableRow, TableCell } from "@mui/material";

export default function OrderRow({ order, mode, onClick }) {
  const orderDate = order.ordertimestamp
    ? new Date(order.ordertimestamp.seconds * 1000).toLocaleString()
    : "-";
  return (
    <TableRow hover sx={{ cursor: "pointer" }} onClick={onClick}>
      <TableCell>{order.id}</TableCell>
      {mode === "admin" && <TableCell>{order.studentId}</TableCell>}
      <TableCell>{orderDate}</TableCell>
      {mode === "student" && <TableCell>{order.pickupOrDelivery}</TableCell>}
    </TableRow>
  );
}
