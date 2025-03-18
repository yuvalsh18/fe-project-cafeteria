import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import '@mui/material'
import { Typography } from '@mui/material'
import Header from './Header'
import { Route, Routes } from 'react-router-dom'
import Home from './Home'
import Help from './Help'
import Info from './Info'

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <Header />

      <Routes>
        <Route path='/' element={<Home />} />
        <Route path="/help" element={<Help />} />
        <Route path="/info" element={<Info />} />
      </Routes>

      
    </>
  )
}

export default App
