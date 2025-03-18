import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import '@mui/material'
import { Typography } from '@mui/material'


function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <header>
        <Typography variant="h1">Welcome to ono cafeteria!</Typography>
      </header>

      <Typography variant='p'>
        This is the first page of our cafeteria. We are using React with Vite.
        <br />
        Project by benji and shamir.
      </Typography>
    </>
  )
}

export default App
