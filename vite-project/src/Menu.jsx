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
      <Box sx={{ mt: 10 }}>
        {" "}
        {/* Add margin-top to push content below header */}
        <Typography variant="h4">Menu page</Typography>
        <Box sx={{ textAlign: "left" }}>
          {isAdmin && (
            <Button
              variant="contained"
              color="primary"
              onClick={() => navigate("/addMenuItem")}
              style={{ marginBottom: "16px" }}
            >
              New Item
            </Button>
          )}
        </Box>
        {loading ? (
          <Typography
            variant="body1"
            sx={{ textAlign: "center", marginTop: 2 }}
          >
            Loading...
          </Typography>
        ) : (
          <>
            <MenuTable
              title="Snacks"
              data={snacks}
              isAdmin={isAdmin}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
            <MenuTable
              title="Food"
              data={food}
              isAdmin={isAdmin}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
            <MenuTable
              title="Beverage"
              data={beverage}
              isAdmin={isAdmin}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
            <MenuTable
              title="Other"
              data={other}
              isAdmin={isAdmin}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          </>
        )}
      </Box>
    </>
  );
}
