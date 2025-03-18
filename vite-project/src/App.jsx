import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import '@mui/material'
import { Typography } from '@mui/material'
import Header from './Header'
import { Route, Routes } from 'react-router-dom'
import Home from './Home'

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <Header />

      <Routes>
        <Route path='/' element={<Home />} />
        {/* <Route path="/help" element={<Help />} /> */}
      </Routes>

      <Typography variant='p'>
        This is the first page of our cafeteria. We are using React with Vite.
        <br />
        Project by benji and shamir.
      </Typography>
    </>
  )
}

export default App
