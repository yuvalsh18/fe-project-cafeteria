import React, { useEffect, useState } from "react";
import { db } from "./firebase";
import { collection, getDocs } from "firebase/firestore";
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  CircularProgress,
} from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import useMode from "./hooks/useMode";
import usePageTitle from "./hooks/usePageTitle";
import OrderRow from "./components/OrderRow";
import OrderDetailsModal from "./components/OrderDetailsModal";
import TableSortLabel from "@mui/material/TableSortLabel";
import StudentSelector from "./components/StudentSelector";

export default function OrderHistory() {
  usePageTitle(
    { "/orderHistory": "Order History - Ono cafeteria" },
    "Ono cafeteria"
  );
  const mode = useMode();
  const [students, setStudents] = useState([]);
  const [selectedStudentId, setSelectedStudentId] = useState("");
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [orderBy, setOrderBy] = useState("ordertimestamp");
  const [orderDirection, setOrderDirection] = useState("desc");

  useEffect(() => {
    async function fetchStudents() {
      const snap = await getDocs(collection(db, "students"));
      const data = snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setStudents(data);
      let current = localStorage.getItem("studentId");
      let found = data.find((s) => s.studentId === current) || data[0];
      setSelectedStudentId(found ? found.id : "");
    }
    if (mode === "student") fetchStudents();
  }, [mode]);

  useEffect(() => {
    async function fetchOrders() {
      setLoading(true);
      if (mode === "admin") {
        // Admin: fetch all orders for all students
        const studentsSnap = await getDocs(collection(db, "students"));
        let allOrders = [];
        for (const studentDoc of studentsSnap.docs) {
          const studentId = studentDoc.id;
          const studentData = studentDoc.data();
          const ordersSnap = await getDocs(
            collection(db, `students/${studentId}/orders`)
          );
          ordersSnap.forEach((orderDoc) => {
            allOrders.push({
              ...orderDoc.data(),
              id: orderDoc.id,
              studentId: studentData.studentId || studentId,
            });
          });
        }
        setOrders(allOrders);
      } else if (mode === "student" && selectedStudentId) {
        // Student: fetch orders for selected student
        const ordersSnap = await getDocs(
          collection(db, `students/${selectedStudentId}/orders`)
        );
        setOrders(
          ordersSnap.docs.map((doc) => ({ ...doc.data(), id: doc.id }))
        );
      }
      setLoading(false);
    }
    if (mode === "admin" || (mode === "student" && selectedStudentId))
      fetchOrders();
  }, [mode, selectedStudentId]);

  const handleRowClick = (order) => {
    setSelectedOrder(order);
    setModalOpen(true);
  };

  const handleModalClose = () => {
    setModalOpen(false);
    setSelectedOrder(null);
  };

  // Only show orders with status 'done'
  const doneOrders = orders.filter((order) => order.status === "done");

  // Sorting logic
  const handleSort = (property) => {
    const isAsc = orderBy === property && orderDirection === "asc";
    setOrderDirection(isAsc ? "desc" : "asc");
    setOrderBy(property);
  };
  const sortedOrders = [...doneOrders].sort((a, b) => {
    let aValue = a[orderBy];
    let bValue = b[orderBy];
    if (orderBy === "ordertimestamp") {
      aValue = a.ordertimestamp?.seconds || 0;
      bValue = b.ordertimestamp?.seconds || 0;
    }
    if (orderDirection === "asc") {
      return aValue > bValue ? 1 : aValue < bValue ? -1 : 0;
    } else {
      return aValue < bValue ? 1 : aValue > bValue ? -1 : 0;
    }
  });

  return (
    <Box sx={{ mt: 10, maxWidth: 1200, mx: "auto" }}>
      <Typography
        variant="h3"
        align="center"
        gutterBottom
        fontWeight={700}
        letterSpacing={2}
      >
        Orders History
      </Typography>
      {mode === "student" && (
        <Box sx={{ maxWidth: 400, mx: "auto", mb: 3 }}>
          <StudentSelector
            students={students}
            selectedStudentId={selectedStudentId}
            setSelectedStudentId={setSelectedStudentId}
          />
        </Box>
      )}
      <Paper
        elevation={4}
        sx={{ p: 3, borderRadius: 4, bgcolor: "#fff", boxShadow: 6 }}
      >
        {loading ? (
          <Box
            display="flex"
            justifyContent="center"
            alignItems="center"
            minHeight="30vh"
          >
            <CircularProgress />
          </Box>
        ) : (
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell
                    sortDirection={orderBy === "id" ? orderDirection : false}
                  >
                    <TableSortLabel
                      active={orderBy === "id"}
                      direction={orderBy === "id" ? orderDirection : "asc"}
                      onClick={() => handleSort("id")}
                    >
                      ID
                    </TableSortLabel>
                  </TableCell>
                  {mode === "admin" && (
                    <TableCell
                      sortDirection={
                        orderBy === "studentId" ? orderDirection : false
                      }
                    >
                      <TableSortLabel
                        active={orderBy === "studentId"}
                        direction={
                          orderBy === "studentId" ? orderDirection : "asc"
                        }
                        onClick={() => handleSort("studentId")}
                      >
                        Student ID
                      </TableSortLabel>
                    </TableCell>
                  )}
                  <TableCell
                    sortDirection={
                      orderBy === "ordertimestamp" ? orderDirection : false
                    }
                  >
                    <TableSortLabel
                      active={orderBy === "ordertimestamp"}
                      direction={
                        orderBy === "ordertimestamp" ? orderDirection : "desc"
                      }
                      onClick={() => handleSort("ordertimestamp")}
                    >
                      Order Date
                    </TableSortLabel>
                  </TableCell>
                  {mode === "student" && (
                    <TableCell
                      sortDirection={
                        orderBy === "pickupOrDelivery" ? orderDirection : false
                      }
                    >
                      <TableSortLabel
                        active={orderBy === "pickupOrDelivery"}
                        direction={
                          orderBy === "pickupOrDelivery"
                            ? orderDirection
                            : "asc"
                        }
                        onClick={() => handleSort("pickupOrDelivery")}
                      >
                        Pickup/Delivery
                      </TableSortLabel>
                    </TableCell>
                  )}
                </TableRow>
              </TableHead>
              <TableBody>
                {sortedOrders.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={mode === "admin" ? 4 : 3}
                      align="center"
                    >
                      No orders found.
                    </TableCell>
                  </TableRow>
                ) : (
                  sortedOrders.map((order) => (
                    <OrderRow
                      key={order.id}
                      order={order}
                      mode={mode}
                      onClick={() => handleRowClick(order)}
                    />
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Paper>
      <OrderDetailsModal
        open={modalOpen}
        order={selectedOrder}
        onClose={handleModalClose}
        mode={mode}
      />
    </Box>
  );
}
