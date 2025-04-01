import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import '@mui/material'
import { Menu, Typography } from '@mui/material'
import Header from './Header'
import { Route, Routes } from 'react-router-dom'
import Home from './Home'
import Help from './Help'
import Info from './Info'
import usePageTitle from './usePageTitle';
import MenuItemForm from './MenuItemForm'

const titleMap = {
  '/': 'Home - Ono cafeteria',
  '/Help': 'Help - Ono cafeteria',
  '/Info': 'Info - Ono cafeteria',
  '/addMenuItem': 'New Menu Item - Ono cafeteria'
};

function App() {
  usePageTitle(titleMap, 'Ono cafeteria')

  return (
    <>
      <Header />

      <Routes>
        <Route path='/' element={<Home />} />
        <Route path="/help" element={<Help />} />
        <Route path="/info" element={<Info />} />
        <Route path="/addMenuItem" element={<MenuItemForm />} />
      </Routes>    
    </>
  )
}

export default App
