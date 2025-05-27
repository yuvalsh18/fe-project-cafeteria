import React, { useEffect, useState } from "react";
import { db } from "./firebase";
import {
  collection,
  addDoc,
  Timestamp,
  getDocs,
  doc,
  getDoc,
  updateDoc,
} from "firebase/firestore";
import {
  Box,
  Button,
  Typography,
  TextField,
  MenuItem,
  Select,
  InputLabel,
  FormControl,
  Checkbox,
  ListItemText,
  OutlinedInput,
} from "@mui/material";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import DeliveryDiningIcon from "@mui/icons-material/DeliveryDining";
import RoomIcon from "@mui/icons-material/Room";
import NotesIcon from "@mui/icons-material/Notes";
import AttachMoneyIcon from "@mui/icons-material/AttachMoney";
import Autocomplete from "@mui/material/Autocomplete";
import { DateTimePicker } from "@mui/x-date-pickers/DateTimePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import PersonIcon from "@mui/icons-material/Person";
import CancelIcon from "@mui/icons-material/Cancel";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ListSubheader from "@mui/material/ListSubheader";
import OrderConfirmationDialog from "./components/OrderConfirmationDialog";
import usePageTitle from "./hooks/usePageTitle";
import useMode from "./hooks/useMode";

export default function OrderForm({ mode = "new", studentDocId, orderId }) {
  usePageTitle(
    mode === "edit"
      ? { "/editOrder/:studentDocId/:orderId": "Edit Order - Ono cafeteria" }
      : { "/newOrder": "New Order - Ono cafeteria" },
    "Ono cafeteria"
  );
  const [menuItems, setMenuItems] = useState([]);
  const [selectedItems, setSelectedItems] = useState([]);
  const [pickupOrDelivery, setPickupOrDelivery] = useState("pickup");
  const [deliveryRoom, setDeliveryRoom] = useState("");
  const [requiredTime, setRequiredTime] = useState(null);
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [studentIdInput, setStudentIdInput] = useState("");
  const [students, setStudents] = useState([]);
  const [orderStatus, setOrderStatus] = useState("new");
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pendingOrder, setPendingOrder] = useState(null);
  const [statusChanged, setStatusChanged] = useState(false);
  const userMode = useMode();

  // Fetch menu items from Firestore
  useEffect(() => {
    async function fetchMenuItems() {
      const snapshot = await getDocs(collection(db, "menuItems"));
      const items = snapshot.docs.map((doc) => {
        const d = doc.data();
        return {
          id: d.ID || doc.id,
          name: d.Item,
          price: d.Price,
          availability: d.Availability,
          category: d.Category || "Other",
        };
      });
      setMenuItems(items.filter((i) => i.availability));
    }
    fetchMenuItems();
  }, []);

  // Fetch students for autocomplete
  useEffect(() => {
    async function fetchStudents() {
      const snapshot = await getDocs(collection(db, "students"));
      setStudents(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
    }
    fetchStudents();
  }, []);

  // For edit mode: fetch order and prefill fields
  useEffect(() => {
    if (mode === "edit" && studentDocId && orderId) {
      (async () => {
        // Find the student by doc.id and set studentIdInput
        const student = students.find((s) => s.id === studentDocId);
        if (student) {
          setStudentIdInput(student.studentId || "");
        }
        const orderRef = doc(db, `students/${studentDocId}/orders/${orderId}`);
        const orderSnap = await getDoc(orderRef);
        if (orderSnap.exists()) {
          const data = orderSnap.data();
          setSelectedItems(
            data.menuItems ? data.menuItems.map((i) => i.id) : []
          );
          setPickupOrDelivery(data.pickupOrDelivery || "pickup");
          setDeliveryRoom(data.deliveryRoom || "");
          setRequiredTime(
            data.requiredTime ? new Date(data.requiredTime) : null
          );
          setNotes(data.notes || "");
          setOrderStatus(data.status || "new");
        }
      })();
    }
  }, [mode, studentDocId, orderId, students]);

  // Calculate final price
  const finalPrice = selectedItems.reduce((sum, id) => {
    const item = menuItems.find((i) => String(i.id) === String(id));
    return sum + (item ? Number(item.price) : 0);
  }, 0);

  // Helper: check if all required fields are filled
  const isFormValid = () => {
    if (!requiredTime || selectedItems.length === 0 || !pickupOrDelivery)
      return false;
    if (mode === "new" && !studentIdInput) return false;
    if (pickupOrDelivery === "delivery" && !deliveryRoom) return false;
    if (pickupOrDelivery === "pickup" && deliveryRoom) return false;
    return true;
  };

  // Auto-clear deliveryRoom if pickup is selected
  useEffect(() => {
    if (pickupOrDelivery === "pickup" && deliveryRoom) {
      setDeliveryRoom("");
    }
  }, [pickupOrDelivery]);

  const handleFormSubmit = (e) => {
    e.preventDefault();
    setError("");
    setSuccess(false);
    // Validation for all required fields
    if (!isFormValid()) {
      if (!requiredTime) setError("Please select required time.");
      else if (selectedItems.length === 0)
        setError("Please select at least one menu item.");
      else if (mode === "new" && !studentIdInput)
        setError("Student ID is required.");
      else if (pickupOrDelivery === "delivery" && !deliveryRoom)
        setError("Please enter delivery room.");
      else if (pickupOrDelivery === "pickup" && deliveryRoom)
        setError("Room must be empty for pickup.");
      else setError("Please fill all required fields.");
      return;
    }
    // For edit mode, check if only status changed and skip confirmation dialog
    if (mode === "edit") {
      (async () => {
        const orderRef = doc(db, `students/${studentDocId}/orders/${orderId}`);
        const orderSnap = await getDoc(orderRef);
        if (orderSnap.exists()) {
          const prev = orderSnap.data();
          const prevStatus = prev.status || "new";
          const fieldsToCheck = [
            "menuItems",
            "pickupOrDelivery",
            "deliveryRoom",
            "requiredTime",
            "notes",
            "finalPrice",
          ];
          const onlyStatusChanged =
            prevStatus !== orderStatus &&
            fieldsToCheck.every((f) => {
              if (f === "menuItems") {
                const prevIds = (prev.menuItems || []).map((i) => i.id).sort();
                const currIds = selectedItems.slice().sort();
                return JSON.stringify(prevIds) === JSON.stringify(currIds);
              }
              if (f === "requiredTime") {
                const prevTime = prev.requiredTime
                  ? new Date(prev.requiredTime).toISOString()
                  : "";
                const currTime = requiredTime ? requiredTime.toISOString() : "";
                return prevTime === currTime;
              }
              if (f === "finalPrice") {
                return Number(prev.finalPrice) === Number(finalPrice);
              }
              return (prev[f] || "") === (eval(f) || "");
            });
          if (onlyStatusChanged) {
            // Directly update status and show short confirmation, skip dialog
            await updateDoc(orderRef, { ...prev, status: orderStatus });
            setStatusChanged(true);
            setTimeout(() => setStatusChanged(false), 2000);
            return;
          }
        }
        // If not only status changed, show confirmation dialog as usual
        const order = {
          requiredTime: requiredTime ? requiredTime.toISOString() : "",
          finalPrice,
          menuItems: selectedItems
            .map((id) => {
              const item = menuItems.find((i) => String(i.id) === String(id));
              return item
                ? { id: item.id, name: item.name, price: item.price }
                : null;
            })
            .filter(Boolean),
          pickupOrDelivery,
          deliveryRoom: pickupOrDelivery === "delivery" ? deliveryRoom : "",
          notes,
          studentId: studentIdInput,
        };
        setPendingOrder(order);
        setConfirmOpen(true);
      })();
      return;
    }
    // For new orders, show confirmation dialog as usual
    const order = {
      requiredTime: requiredTime ? requiredTime.toISOString() : "",
      finalPrice,
      menuItems: selectedItems
        .map((id) => {
          const item = menuItems.find((i) => String(i.id) === String(id));
          return item
            ? { id: item.id, name: item.name, price: item.price }
            : null;
        })
        .filter(Boolean),
      pickupOrDelivery,
      deliveryRoom: pickupOrDelivery === "delivery" ? deliveryRoom : "",
      notes,
      studentId: studentIdInput,
    };
    setPendingOrder(order);
    setConfirmOpen(true);
  };

  const handleConfirm = async () => {
    setSubmitting(true);
    setError("");
    setSuccess(false);
    setConfirmOpen(false);
    let studentDocIdToUse = studentDocId;
    if (mode === "new") {
      const selectedStudent = students.find(
        (s) => s.studentId === studentIdInput
      );
      if (!selectedStudent) {
        setError("Student ID is required and must match a student.");
        setSubmitting(false);
        return;
      }
      studentDocIdToUse = selectedStudent.id;
    }
    try {
      let onlyStatusChanged = false;
      let prev = null;
      if (mode === "edit" && studentDocId && orderId) {
        // Fetch current order data
        const orderRef = doc(db, `students/${studentDocId}/orders/${orderId}`);
        const orderSnap = await getDoc(orderRef);
        if (orderSnap.exists()) {
          prev = orderSnap.data();
          // Check if only status changed
          const prevStatus = prev.status || "new";
          const fieldsToCheck = [
            "menuItems",
            "pickupOrDelivery",
            "deliveryRoom",
            "requiredTime",
            "notes",
            "finalPrice",
          ];
          onlyStatusChanged =
            prevStatus !== orderStatus &&
            fieldsToCheck.every((f) => {
              if (f === "menuItems") {
                const prevIds = (prev.menuItems || []).map((i) => i.id).sort();
                const currIds = selectedItems.slice().sort();
                return JSON.stringify(prevIds) === JSON.stringify(currIds);
              }
              if (f === "requiredTime") {
                const prevTime = prev.requiredTime
                  ? new Date(prev.requiredTime).toISOString()
                  : "";
                const currTime = requiredTime ? requiredTime.toISOString() : "";
                return prevTime === currTime;
              }
              if (f === "finalPrice") {
                return Number(prev.finalPrice) === Number(finalPrice);
              }
              return (prev[f] || "") === (eval(f) || "");
            });
        }
      }
      const order = {
        ordertimestamp: Timestamp.now(),
        requiredTime: requiredTime ? requiredTime.toISOString() : "",
        finalPrice,
        menuItems: selectedItems
          .map((id) => {
            const item = menuItems.find((i) => String(i.id) === String(id));
            return item
              ? { id: item.id, name: item.name, price: item.price }
              : null;
          })
          .filter(Boolean),
        pickupOrDelivery,
        deliveryRoom: pickupOrDelivery === "delivery" ? deliveryRoom : "",
        notes,
        status: mode === "edit" ? orderStatus : "new",
      };
      if (mode === "edit" && studentDocId && orderId) {
        const orderRef = doc(db, `students/${studentDocId}/orders/${orderId}`);
        await updateDoc(orderRef, order);
        if (onlyStatusChanged) {
          setStatusChanged(true);
          setSuccess(false); // Don't show the full success message
          setTimeout(() => setStatusChanged(false), 2000);
        } else {
          setSuccess(true);
        }
      } else {
        await addDoc(
          collection(db, `students/${studentDocIdToUse}/orders`),
          order
        );
        setSuccess(true);
      }
      setSelectedItems([]);
      setPickupOrDelivery("pickup");
      setDeliveryRoom("");
      setRequiredTime(null);
      setNotes("");
      setStudentIdInput("");
    } catch (err) {
      setError("Failed to submit order.");
    }
    setSubmitting(false);
  };

  // Only read-only if not admin and editing a non-new order
  const isReadOnly =
    userMode !== "admin" && mode === "edit" && orderStatus !== "new";

  return (
    <Box
      sx={{
        maxWidth: 500,
        mx: "auto",
        mt: 5,
        p: 3,
        bgcolor: "background.default",
        color: "text.primary",
        borderRadius: 2,
        boxShadow: 3,
      }}
    >
      <Box display="flex" alignItems="center" gap={1} mb={2}>
        <ShoppingCartIcon color="primary" />
        <Typography variant="h5" sx={{ fontWeight: "bold" }}>
          {mode === "edit" ? "Edit Order" : "New Order"}
        </Typography>
      </Box>
      <form onSubmit={handleFormSubmit}>
        <Autocomplete
          options={students}
          getOptionLabel={(option) =>
            option.studentId ? String(option.studentId) : ""
          }
          value={students.find((s) => s.studentId === studentIdInput) || null}
          onChange={(_, newValue) =>
            mode === "edit"
              ? null
              : setStudentIdInput(newValue ? newValue.studentId : "")
          }
          renderInput={(params) => (
            <TextField
              {...params}
              label="Student ID"
              fullWidth
              required
              sx={{ mb: 2 }}
              disabled={mode === "edit" || isReadOnly}
            />
          )}
          isOptionEqualToValue={(option, value) =>
            option.studentId === value.studentId
          }
          disabled={mode === "edit" || isReadOnly}
        />
        <FormControl fullWidth sx={{ mb: 2 }} disabled={isReadOnly}>
          <InputLabel id="menu-items-label">
            <ShoppingCartIcon
              fontSize="small"
              sx={{ mr: 1, verticalAlign: "middle" }}
            />
            Menu Items
          </InputLabel>
          <Select
            labelId="menu-items-label"
            multiple
            value={selectedItems}
            onChange={(e) => setSelectedItems(e.target.value)}
            input={<OutlinedInput label="Menu Items" />}
            renderValue={(selected) =>
              selected
                .map((id) => {
                  const item = menuItems.find(
                    (i) => String(i.id) === String(id)
                  );
                  return item ? item.name : "";
                })
                .join(", ")
            }
            disabled={isReadOnly}
          >
            {["Food", "Snack", "Beverage", "Other"].map((category) => {
              const itemsInCategory = menuItems.filter(
                (item) => item.category === category
              );
              if (itemsInCategory.length === 0) return null;
              return [
                <ListSubheader key={category}>{category}</ListSubheader>,
                ...itemsInCategory.map((item) => (
                  <MenuItem key={item.id} value={item.id} disabled={isReadOnly}>
                    <Checkbox
                      checked={selectedItems.indexOf(item.id) > -1}
                      disabled={isReadOnly}
                    />
                    <ListItemText primary={`${item.name} (₪${item.price})`} />
                  </MenuItem>
                )),
              ];
            })}
          </Select>
        </FormControl>
        <LocalizationProvider dateAdapter={AdapterDateFns}>
          <DateTimePicker
            label={
              <span>
                <AccessTimeIcon
                  fontSize="small"
                  sx={{ mr: 1, verticalAlign: "middle" }}
                />
                Required Pickup/Delivery Time
              </span>
            }
            value={requiredTime}
            onChange={setRequiredTime}
            textField={(params) => (
              <TextField
                {...params}
                fullWidth
                sx={{ mb: 2 }}
                required
                disabled={isReadOnly}
              />
            )}
            sx={{ mb: 2, width: "100%" }}
            disabled={isReadOnly}
          />
        </LocalizationProvider>
        <FormControl fullWidth sx={{ mb: 2 }} disabled={isReadOnly}>
          <InputLabel id="pickup-delivery-label">
            <DeliveryDiningIcon
              fontSize="small"
              sx={{ mr: 1, verticalAlign: "middle" }}
            />
            Pickup or Delivery
          </InputLabel>
          <Select
            labelId="pickup-delivery-label"
            value={pickupOrDelivery}
            label="Pickup or Delivery"
            onChange={(e) => setPickupOrDelivery(e.target.value)}
            disabled={isReadOnly}
          >
            <MenuItem value="pickup">Pickup</MenuItem>
            <MenuItem value="delivery">Delivery</MenuItem>
          </Select>
        </FormControl>
        {/* Order Status Select for Edit Mode */}
        {mode === "edit" && (
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel id="order-status-label">Order Status</InputLabel>
            <Select
              labelId="order-status-label"
              value={orderStatus}
              label="Order Status"
              onChange={(e) => setOrderStatus(e.target.value)}
              disabled={userMode !== "admin"}
            >
              <MenuItem value="new">New</MenuItem>
              <MenuItem value="in making">In Making</MenuItem>
              <MenuItem value="in delivery">In Delivery</MenuItem>
              <MenuItem value="waiting for pickup">Waiting for Pickup</MenuItem>
              <MenuItem value="done">Done</MenuItem>
            </Select>
          </FormControl>
        )}
        {statusChanged && (
          <Typography color="success.main" sx={{ mb: 2, fontWeight: 500 }}>
            Order status updated
          </Typography>
        )}
        {success && !statusChanged && (
          <Typography color="primary" sx={{ mb: 2 }}>
            Order submitted!
          </Typography>
        )}
        {pickupOrDelivery === "delivery" && (
          <TextField
            label={
              <span>
                <RoomIcon
                  fontSize="small"
                  sx={{ mr: 1, verticalAlign: "middle" }}
                />
                Delivery Room
              </span>
            }
            value={deliveryRoom}
            onChange={(e) => setDeliveryRoom(e.target.value)}
            fullWidth
            sx={{ mb: 2 }}
            disabled={isReadOnly}
          />
        )}
        <TextField
          label={
            <span>
              <NotesIcon
                fontSize="small"
                sx={{ mr: 1, verticalAlign: "middle" }}
              />
              Notes
            </span>
          }
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          fullWidth
          multiline
          minRows={2}
          sx={{ mb: 2 }}
          disabled={isReadOnly}
        />
        <Box display="flex" alignItems="center" gap={1} mb={2}>
          <AttachMoneyIcon color="success" />
          <Typography variant="subtitle1">
            Final Price: ₪{finalPrice}
          </Typography>
        </Box>
        {error && (
          <Typography color="error" sx={{ mb: 2 }}>
            {error}
          </Typography>
        )}
        {success && !statusChanged && (
          <Typography color="primary" sx={{ mb: 2 }}>
            Order submitted!
          </Typography>
        )}
        <Button
          type="submit"
          variant="contained"
          color="primary"
          fullWidth
          disabled={submitting || isReadOnly}
          startIcon={<ShoppingCartIcon />}
        >
          {mode === "edit" ? "Update Order" : "Submit Order"}
        </Button>
      </form>
      <OrderConfirmationDialog
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={handleConfirm}
        order={pendingOrder}
      />
    </Box>
  );
}
