import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <h1>Ono Cafeteria</h1>
      <p>
        This is the first page of our cafeteria. We are using React with Vite. 
        project by benji and shamir.
      </p>
    </>
  )
}

export default App
