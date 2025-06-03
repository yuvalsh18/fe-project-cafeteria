import { useState, useEffect } from "react";
import reactLogo from "./assets/react.svg";
import "./App.css";
import "@mui/material";
import Header from "./Header";
import { Route, Routes, useParams, useLocation } from "react-router-dom";
import {
  collection,
  onSnapshot,
  addDoc,
  serverTimestamp,
} from "firebase/firestore";
import Home from "./Home";
import Help from "./Help";
import Menu from "./Menu";
import usePageTitle from "./hooks/usePageTitle";
import MenuItemForm from "./MenuItemForm";
import Students from "./Students";
import OrderForm from "./OrderForm";
import AdminDashboard from "./AdminDashboard";
import useMode from "./hooks/useMode";
import AdminHome from "./AdminHome";
import RequireAuth from "./RequireAuth";
import OrderHistory from "./OrderHistory";
import GeminiChatPage from "./GeminiChatPage";

const titleMap = {
  "/": "Home - Ono cafeteria",
  "/Help": "Help - Ono cafeteria",
  "/Menu": "Menu - Ono cafeteria",
  "/addMenuItem": "New Menu Item - Ono cafeteria",
  "/editMenuItem/:itemId": "Edit Menu Item - Ono cafeteria",
  "/students": "Students - Ono cafeteria",
  "/newOrder": "New Order - Ono cafeteria",
  "/ai-assistant": "AI Assistant - Ono cafeteria",
};

function App() {
  usePageTitle(titleMap, "Ono cafeteria");
  const mode = useMode();
  const location = useLocation();

  // Helper to get studentId from query string
  function getStudentIdFromQuery() {
    const params = new URLSearchParams(location.search);
    return params.get("studentId") || undefined;
  }

  return (
    <>
      <RequireAuth>
        <Header />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/help" element={<Help />} />
          <Route path="/menu" element={<Menu />} />
          <Route path="/addMenuItem" element={<MenuItemForm />} />
          <Route
            path="/editMenuItem/:itemId"
            element={<MenuItemForm editMode={true} />}
          />
          <Route path="/students" element={<Students />} />
          <Route
            path="/newOrder"
            element={<OrderForm fixedStudentId={getStudentIdFromQuery()} />}
          />
          <Route
            path="/editOrder/:studentDocId/:orderId"
            element={<EditOrderWrapper />}
          />
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/orderHistory" element={<OrderHistory />} />
          <Route path="/ai-assistant" element={<GeminiChatPage />} />
        </Routes>
      </RequireAuth>
    </>
  );
}

function EditOrderWrapper() {
  const { studentDocId, orderId } = useParams();
  return (
    <OrderForm mode="edit" studentDocId={studentDocId} orderId={orderId} />
  );
}

export default App;
