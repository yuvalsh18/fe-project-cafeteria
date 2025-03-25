import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import { Box } from '@mui/material';
import { useNavigate } from 'react-router-dom';

export default function Header() {
    const navigate = useNavigate();

    return (
      <AppBar>
        <Toolbar>
          <Typography variant="h5" component="div" onClick={() => navigate('/')}>
            Ono Cafetefia
          </Typography>
          <Button 
            color="inherit" 
            onClick={() => navigate('/info')} 
            sx={{ '&:focus': { outline: 'none' } }}
          >
            Info
          </Button>
          <Box sx={{ mx: 1 }}>|</Box>
          <Button 
            color="inherit" 
            onClick={() => navigate('/help')} 
            sx={{ '&:focus': { outline: 'none' } }}
          >
            Help
          </Button>
          <Box sx={{ flexGrow: 1 }} />
        </Toolbar>
      </AppBar>
    );
   }