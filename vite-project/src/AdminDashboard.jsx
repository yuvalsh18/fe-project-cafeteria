import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Paper,
  Grid,
  CircularProgress,
  Alert,
  LinearProgress,
} from "@mui/material";
import { db } from "./firebase";
import { collection, getCountFromServer } from "firebase/firestore";
import PeopleIcon from "@mui/icons-material/People";
import RestaurantMenuIcon from "@mui/icons-material/RestaurantMenu";
import AssignmentIcon from "@mui/icons-material/Assignment";
import HighlightOffIcon from "@mui/icons-material/HighlightOff";
import useMode from "./hooks/useMode";
import Header from "./Header";
import FirestoreStatus from "./components/FirestoreStatus";
import StatsCards from "./components/StatsCards";
import OrdersByStatusProgress from "./components/OrdersByStatusProgress";
import AccessDenied from "./components/AccessDenied";

export default function AdminDashboard() {
  const [stats, setStats] = useState({ students: 0, menuItems: 0, orders: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [firestoreStatus, setFirestoreStatus] = useState("checking");

  const mode = useMode();
  const [_, setRerender] = useState(0);
  useEffect(() => {
    const handleModeChanged = () => setRerender((r) => r + 1);
    window.addEventListener("mode-changed", handleModeChanged);
    return () => window.removeEventListener("mode-changed", handleModeChanged);
  }, []);

  useEffect(() => {
    if (mode !== "admin") return;
    let unsub = null;
    async function fetchStats() {
      setLoading(true);
      setError(null);
      console.log("[AdminDashboard] Fetching stats...");
      try {
        unsub = db && collection(db, "students");
        console.log(
          "[AdminDashboard] Checking Firestore connectivity...",
          unsub
        );
        let studentsCount, menuItemsCount;
        let orderStatusCounts = {
          new: 0,
          inMaking: 0,
          inDelivery: 0,
          waitingForPickup: 0,
          done: 0,
        };
        // Students count
        try {
          const studentsSnap = await getCountFromServer(
            collection(db, "students")
          );
          studentsCount = studentsSnap.data().count;
        } catch (err) {
          console.warn(
            "[AdminDashboard] getCountFromServer failed for students:",
            err
          );
          const { getDocs } = await import("firebase/firestore");
          const studentsSnap = await getDocs(collection(db, "students"));
          studentsCount = studentsSnap.size;
        }
        // Menu items count
        try {
          const menuSnap = await getCountFromServer(
            collection(db, "menuItems")
          );
          menuItemsCount = menuSnap.data().count;
        } catch (err) {
          console.warn(
            "[AdminDashboard] getCountFromServer failed for menuItems:",
            err
          );
          const { getDocs } = await import("firebase/firestore");
          const menuSnap = await getDocs(collection(db, "menuItems"));
          menuItemsCount = menuSnap.size;
        }
        // Orders count by status
        try {
          const { getDocs, collection } = await import("firebase/firestore");
          const studentsSnap = await getDocs(collection(db, "students"));
          for (const studentDoc of studentsSnap.docs) {
            const ordersSnap = await getDocs(
              collection(db, "students", studentDoc.id, "orders")
            );
            ordersSnap.forEach((orderDoc) => {
              const status = (orderDoc.data().status || "").toLowerCase();
              if (status === "new") orderStatusCounts.new++;
              else if (status === "in making" || status === "inmaking")
                orderStatusCounts.inMaking++;
              else if (status === "in delivery" || status === "indelivery")
                orderStatusCounts.inDelivery++;
              else if (
                status === "waiting for pickup" ||
                status === "waitingforpickup"
              )
                orderStatusCounts.waitingForPickup++;
              else if (status === "done") orderStatusCounts.done++;
            });
          }
        } catch (err) {
          console.warn(
            "[AdminDashboard] Counting orders in subcollections failed:",
            err
          );
        }
        setFirestoreStatus("connected");
        setStats({
          students: studentsCount,
          menuItems: menuItemsCount,
          orders: orderStatusCounts,
        });
      } catch (err) {
        console.error("[AdminDashboard] Error fetching stats:", err);
        setError("Failed to fetch statistics or connect to Firestore.");
        setFirestoreStatus("disconnected");
      } finally {
        setLoading(false);
        console.log("[AdminDashboard] Fetching stats complete.");
      }
    }
    fetchStats();
    return () => {
      unsub && (unsub = null);
    };
  }, [mode]);

  if (mode === "student") {
    return <AccessDenied />;
  }

  const totalOrders = Object.values(stats.orders).reduce((a, b) => a + b, 0);
  const orderStatusLabels = [
    { label: "New", value: stats.orders.new, color: "#1976d2" },
    { label: "In Making", value: stats.orders.inMaking, color: "#43a047" },
    { label: "In Delivery", value: stats.orders.inDelivery, color: "#fbc02d" },
    {
      label: "Waiting for Pickup",
      value: stats.orders.waitingForPickup,
      color: "#ff9800",
    },
    { label: "Done", value: stats.orders.done, color: "#4caf50" },
  ];

  return (
    <Box sx={{ p: 4, minHeight: "100vh", bgcolor: "#181a20" }}>
      <Typography
        variant="h3"
        gutterBottom
        sx={{
          color: "#fff",
          fontWeight: 700,
          textAlign: "center",
          mb: 4,
          letterSpacing: 2,
          mt: 2,
        }}
      >
        Admin Dashboard
      </Typography>
      <Grid container spacing={4} justifyContent="center">
        <Grid item xs={12} md={8}>
          <FirestoreStatus firestoreStatus={firestoreStatus} />
        </Grid>
        <Grid item xs={12} md={8}>
          <Paper
            sx={{ p: 4, borderRadius: 3, boxShadow: 3, bgcolor: "#23272f" }}
          >
            <Typography
              variant="h5"
              gutterBottom
              sx={{
                color: "#fff",
                fontWeight: 600,
                mb: 3,
                textAlign: "center",
                letterSpacing: 1,
              }}
            >
              Website Statistics
            </Typography>
            {loading ? (
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  minHeight: 120,
                }}
              >
                <CircularProgress />
              </Box>
            ) : error ? (
              <Alert severity="error">{error}</Alert>
            ) : (
              <>
                <StatsCards stats={stats} totalOrders={totalOrders} />
                <Grid item xs={12}>
                  <OrdersByStatusProgress
                    orderStatusLabels={orderStatusLabels}
                    totalOrders={totalOrders}
                  />
                </Grid>
              </>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}
