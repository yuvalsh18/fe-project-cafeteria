import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Typography, Button, Box } from "@mui/material";
import { collection, onSnapshot, doc, deleteDoc } from "firebase/firestore";
import { db } from "./firebase";
import useMode from "./hooks/useMode";
import MenuTable from "./components/MenuTable";
import usePageTitle from "./hooks/usePageTitle";

export default function Menu() {
  usePageTitle({ "/menu": "Menu - Ono cafeteria" }, "Ono cafeteria");
  const isAdmin = useMode() === "admin";
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true); // loading state
  const navigate = useNavigate();

  useEffect(() => {
    // Listen to Firestore menuItems collection
    const unsubscribe = onSnapshot(collection(db, "menuItems"), (snapshot) => {
      const menuData = snapshot.docs.map((doc) => {
        const d = doc.data();
        return {
          itemId: d.ID || doc.id,
          item: d.Item,
          price: d.Price,
          availability: d.Availability ? "Available" : "Out of Stock",
          category: d.Category,
        };
      });
      setRows(menuData);
      setLoading(false); // data loaded
    });
    return () => unsubscribe();
  }, []);

  // Categorize rows
  const snacks = rows.filter((row) => row.category === "Snack");
  const food = rows.filter((row) => row.category === "Food");
  const beverage = rows.filter((row) => row.category === "Beverage");
  const other = rows.filter(
    (row) =>
      row.category !== "Snack" &&
      row.category !== "Food" &&
      row.category !== "Beverage"
  );

  const handleEdit = (itemId) => navigate(`/editMenuItem/${itemId}`);

  const handleDelete = async (itemId) => {
    // Accept both string and number for itemId
    try {
      const { getDocs, collection } = await import("firebase/firestore");
      const snapshot = await getDocs(collection(db, "menuItems"));
      let docIdToDelete = null;
      snapshot.forEach((docSnap) => {
        const data = docSnap.data();
        // Compare as string to avoid type mismatch
        if (String(data.ID) === String(itemId)) {
          docIdToDelete = docSnap.id;
        }
      });
      if (!docIdToDelete) {
        console.error("No Firestore document found for itemId:", itemId);
        alert("Failed to delete item: No matching Firestore document.");
        return;
      }
      if (window.confirm("Are you sure you want to delete this item?")) {
        await deleteDoc(doc(db, "menuItems", docIdToDelete));
        alert("Item deleted successfully.");
      }
    } catch (error) {
      console.error("Error deleting item:", error, "Item ID:", itemId);
      alert("Failed to delete item. Please try again.");
    }
  };

  return (
    <>
      <Box
        sx={{
          mt: { xs: 6, sm: 8, md: 10 },
          px: { xs: 1, sm: 2, md: 4 },
          width: { xs: "100%", sm: "90%", md: "80%" },
          maxWidth: 1200,
          mx: "auto",
          minHeight: { xs: "calc(100vh - 56px)", sm: "calc(100vh - 64px)" },
        }}
      >
        <Typography
          variant="h4"
          sx={{ fontSize: { xs: "1.5rem", sm: "2rem", md: "2.25rem" } }}
        >
          Menu page
        </Typography>
        <Box sx={{ textAlign: "left", mb: { xs: 1, sm: 2 } }}>
          {isAdmin && (
            <Button
              variant="contained"
              color="primary"
              onClick={() => navigate("/addMenuItem")}
              sx={{
                mb: { xs: 1.5, sm: 2 },
                fontSize: { xs: "0.9rem", sm: "1rem" },
                px: { xs: 2, sm: 3 },
              }}
            >
              New Item
            </Button>
          )}
        </Box>
        {loading ? (
          <Typography variant="body1" sx={{ textAlign: "center", mt: 2 }}>
            Loading...
          </Typography>
        ) : (
          <Box>
            <Box sx={{ overflowX: "auto", mb: { xs: 2, sm: 3 } }}>
              <MenuTable
                title="Snacks"
                data={snacks}
                isAdmin={isAdmin}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            </Box>
            <Box sx={{ overflowX: "auto", mb: { xs: 2, sm: 3 } }}>
              <MenuTable
                title="Food"
                data={food}
                isAdmin={isAdmin}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            </Box>
            <Box sx={{ overflowX: "auto", mb: { xs: 2, sm: 3 } }}>
              <MenuTable
                title="Beverage"
                data={beverage}
                isAdmin={isAdmin}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            </Box>
            <Box sx={{ overflowX: "auto", mb: { xs: 2, sm: 3 } }}>
              <MenuTable
                title="Other"
                data={other}
                isAdmin={isAdmin}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            </Box>
          </Box>
        )}
      </Box>
    </>
  );
}
