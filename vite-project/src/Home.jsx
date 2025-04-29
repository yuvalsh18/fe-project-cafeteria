import { Typography, Box } from '@mui/material'
import React, { useEffect, useState } from 'react'
import AdminHome from './AdminHome';
import StudentHome from './StudentHome';

export default function Home() {
  const [mode, setMode] = useState(() => localStorage.getItem('mode') || 'student');

  useEffect(() => {
    // Listen for changes to mode in localStorage (from Header)
    const onStorage = () => {
      setMode(localStorage.getItem('mode') || 'student');
    };
    window.addEventListener('storage', onStorage);

    // Listen for changes in the same tab (Header changes state, not storage event)
    const origSetItem = localStorage.setItem;
    localStorage.setItem = function(key, value) {
      origSetItem.apply(this, arguments);
      if (key === 'mode') {
        window.dispatchEvent(new Event('mode-changed'));
      }
    };
    const onModeChanged = () => setMode(localStorage.getItem('mode') || 'student');
    window.addEventListener('mode-changed', onModeChanged);

    return () => {
      window.removeEventListener('storage', onStorage);
      window.removeEventListener('mode-changed', onModeChanged);
      localStorage.setItem = origSetItem;
    };
  }, []);

  return (
    <Box sx={{ mt: 4, textAlign: 'center' }}>
      {mode === 'student' && (
        <>
          < StudentHome />
        </>
      )}
      {mode === 'admin' && (
        <>
          < AdminHome />
        </>
      )}
    </Box>
  );
}
