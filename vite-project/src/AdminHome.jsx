import { Typography } from '@mui/material'
import React from 'react'
import usePageTitle from './hooks/usePageTitle';

export default function AdminHome() {
  usePageTitle({ '/admin': 'Admin Home - Ono cafeteria' }, 'Ono cafeteria');
  return (
    <Typography variant="h4">Admin Home page</Typography>
  )
}
