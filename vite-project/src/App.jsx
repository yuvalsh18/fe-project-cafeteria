import { useState, useEffect } from 'react';
import reactLogo from './assets/react.svg';
import './App.css';
import '@mui/material';
import { Typography } from '@mui/material';
import Header from './Header';
import { Route, Routes, useParams } from 'react-router-dom';
import { collection, onSnapshot, addDoc, serverTimestamp } from "firebase/firestore";
import Home from './Home';
import Help from './Help';
import Menu from './Menu';
import usePageTitle from './hooks/usePageTitle';
import MenuItemForm from './MenuItemForm';
import { db } from "./firebase";
import Students from './Students';
import OrderForm from './OrderForm';
import AdminDashboard from './components/AdminDashboard';
import useMode from './hooks/useMode';
import AdminHome from './AdminHome';
import RequireAuth from './RequireAuth';

const titleMap = {
  '/': 'Home - Ono cafeteria',
  '/Help': 'Help - Ono cafeteria',
  '/Menu': 'Menu - Ono cafeteria',
  '/addMenuItem': 'New Menu Item - Ono cafeteria',
  '/editMenuItem/:itemId': 'Edit Menu Item - Ono cafeteria',
  '/students': 'Students - Ono cafeteria',
  '/newOrder': 'New Order - Ono cafeteria',
};

function App() {
  usePageTitle(titleMap, 'Ono cafeteria')
  const mode = useMode();

  return (
    <> 
      <RequireAuth>
        <Header />
        <Routes>
          <Route path='/' element={<Home mode={mode} />} />
          <Route path="/help" element={<Help />} />
          <Route path="/menu" element={<Menu />} />
          <Route path="/addMenuItem" element={<MenuItemForm />} />
          <Route path="/editMenuItem/:itemId" element={<MenuItemForm editMode={true} />} />
          <Route path="/students" element={<Students />} />
          <Route path="/newOrder" element={<OrderForm studentId={"demo-student-id"} />} />
          <Route path="/editOrder/:studentDocId/:orderId" element={<EditOrderWrapper />} />
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/admin" element={<AdminHome />} />
        </Routes>
      </RequireAuth>    
    </>
  )
}

function EditOrderWrapper() {
  const { studentDocId, orderId } = useParams();
  return <OrderForm mode="edit" studentDocId={studentDocId} orderId={orderId} />;
}

export default App
