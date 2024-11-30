import React, { useState } from 'react';
import { Box, Container, Typography, AppBar, Toolbar, Drawer, List, ListItem, ListItemIcon, ListItemText, CssBaseline } from '@mui/material';
import {
  Map as MapIcon,
  Event as EventIcon,
  Chat as ChatIcon,
  Assignment as TaskIcon,
  Dashboard as DashboardIcon,
  CalendarMonth as CalendarIcon
} from '@mui/icons-material';
import { ThemeProvider } from '@mui/material/styles';
import theme from './theme';

// Import existing pages
import Dashboard from './pages/Dashboard';
import DoorToDoor from './pages/DoorToDoor';
import Events from './pages/Events';
import Tasks from './pages/Tasks';
import Chat from './pages/Chat';
import Calendar from './pages/Calendar';

const drawerWidth = 240;

function App() {
  const [selectedSection, setSelectedSection] = useState('dashboard');

  const menuItems = [
    { id: 'dashboard', text: 'Dashboard', icon: <DashboardIcon />, component: <Dashboard /> },
    { id: 'districts', text: 'Wahlbezirke', icon: <MapIcon />, component: <DoorToDoor /> },
    { id: 'events', text: 'Veranstaltungen', icon: <EventIcon />, component: <Events /> },
    { id: 'tasks', text: 'Aufgaben', icon: <TaskIcon />, component: <Tasks /> },
    { id: 'calendar', text: 'Kalender', icon: <CalendarIcon />, component: <Calendar /> },
    { id: 'chat', text: 'Team Chat', icon: <ChatIcon />, component: <Chat /> },
  ];

  const renderContent = () => {
    const item = menuItems.find(item => item.id === selectedSection);
    return item ? item.component : null;
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ display: 'flex' }}>
        <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
          <Toolbar>
            <Typography variant="h6" noWrap component="div">
              Wahlkreis 113 Kampagnenmanager
            </Typography>
          </Toolbar>
        </AppBar>
        
        <Drawer
          variant="permanent"
          sx={{
            width: drawerWidth,
            flexShrink: 0,
            '& .MuiDrawer-paper': {
              width: drawerWidth,
              boxSizing: 'border-box',
            },
          }}
        >
          <Toolbar />
          <Box sx={{ overflow: 'auto' }}>
            <List>
              {menuItems.map((item) => (
                <ListItem 
                  button 
                  key={item.id}
                  selected={selectedSection === item.id}
                  onClick={() => setSelectedSection(item.id)}
                >
                  <ListItemIcon>
                    {item.icon}
                  </ListItemIcon>
                  <ListItemText primary={item.text} />
                </ListItem>
              ))}
            </List>
          </Box>
        </Drawer>

        <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
          <Toolbar />
          {renderContent()}
        </Box>
      </Box>
    </ThemeProvider>
  );
}

export default App;