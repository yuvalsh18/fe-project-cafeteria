import { useState, useEffect } from 'react';
import reactLogo from './assets/react.svg';
import viteLogo from '/vite.svg';
import './App.css';
import '@mui/material';
import { Typography } from '@mui/material';
import Header from './Header';
import { Route, Routes } from 'react-router-dom';
import { collection, onSnapshot, addDoc, serverTimestamp } from "firebase/firestore";
import Home from './Home';
import Help from './Help';
import Menu from './Menu';
import usePageTitle from './usePageTitle';
import MenuItemForm from './MenuItemForm';
import { db } from "./firebase";
import Students from './Students';


const titleMap = {
  '/': 'Home - Ono cafeteria',
  '/Help': 'Help - Ono cafeteria',
  '/Menu': 'Menu - Ono cafeteria',
  '/addMenuItem': 'New Menu Item - Ono cafeteria',
  '/editMenuItem/:itemId': 'Edit Menu Item - Ono cafeteria',
  '/students': 'Students - Ono cafeteria'
};

function App() {
  usePageTitle(titleMap, 'Ono cafeteria')

  return (
    <>
      <Header />

      <Routes>
        <Route path='/' element={<Home />} />
        <Route path="/help" element={<Help />} />
        <Route path="/menu" element={<Menu />} />
        <Route path="/addMenuItem" element={<MenuItemForm />} />
        {/* Add edit route */}
        <Route path="/editMenuItem/:itemId" element={<MenuItemForm editMode={true} />} />
        <Route path="/students" element={<Students />} />
      </Routes>    
    </>
  )
}

export default App
