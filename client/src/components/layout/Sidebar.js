import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { makeStyles } from '@material-ui/core/styles';
import {
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Typography,
  Box
} from '@material-ui/core';
import {
  Dashboard as DashboardIcon,
  Assignment as TaskIcon,
  Event as EventIcon,
  Map as MapIcon,
  Chat as ChatIcon,
  School as SchoolIcon,
  Assessment as StatsIcon,
  EmojiEvents as GamificationIcon
} from '@material-ui/icons';

const drawerWidth = 240;

const useStyles = makeStyles((theme) => ({
  drawer: {
    width: drawerWidth,
    flexShrink: 0,
  },
  drawerPaper: {
    width: drawerWidth,
    backgroundColor: '#f5f5f5',
  },
  toolbar: {
    ...theme.mixins.toolbar,
    display: 'flex',
    alignItems: 'center',
    padding: theme.spacing(2),
  },
  logo: {
    width: 40,
    marginRight: theme.spacing(1),
  },
  listItem: {
    borderRadius: theme.spacing(1),
    margin: theme.spacing(0.5, 1),
    '&.active': {
      backgroundColor: theme.palette.primary.main,
      color: theme.palette.primary.contrastText,
      '& .MuiListItemIcon-root': {
        color: theme.palette.primary.contrastText,
      },
    },
  },
  section: {
    margin: theme.spacing(2, 0),
  },
  sectionTitle: {
    padding: theme.spacing(0, 2),
    marginBottom: theme.spacing(1),
    fontWeight: 500,
  },
}));

const menuItems = [
  {
    section: 'Hauptnavigation',
    items: [
      { title: 'Dashboard', icon: <DashboardIcon />, path: '/' },
      { title: 'Aufgaben', icon: <TaskIcon />, path: '/tasks' },
      { title: 'Veranstaltungen', icon: <EventIcon />, path: '/events' },
      { title: 'Tür-zu-Tür', icon: <MapIcon />, path: '/door-to-door' },
    ],
  },
  {
    section: 'Kommunikation',
    items: [
      { title: 'Chat', icon: <ChatIcon />, path: '/chat' },
      { title: 'Schulungen', icon: <SchoolIcon />, path: '/training' },
    ],
  },
  {
    section: 'Analyse & Motivation',
    items: [
      { title: 'Statistiken', icon: <StatsIcon />, path: '/statistics' },
      { title: 'Gamification', icon: <GamificationIcon />, path: '/gamification' },
    ],
  },
];

const Sidebar = ({ user }) => {
  const classes = useStyles();
  const location = useLocation();

  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <Drawer
      className={classes.drawer}
      variant="permanent"
      classes={{
        paper: classes.drawerPaper,
      }}
    >
      <div className={classes.toolbar}>
        <img
          src="/spd-logo.png"
          alt="SPD Logo"
          className={classes.logo}
        />
        <Typography variant="h6" color="primary">
          WK 113
        </Typography>
      </div>

      <Box p={2}>
        <Typography variant="body2" color="textSecondary">
          Willkommen,
        </Typography>
        <Typography variant="h6">
          {user?.firstName} {user?.lastName}
        </Typography>
      </Box>

      <Divider />

      {menuItems.map((section) => (
        <div key={section.section} className={classes.section}>
          <Typography
            variant="subtitle2"
            color="textSecondary"
            className={classes.sectionTitle}
          >
            {section.section}
          </Typography>
          <List>
            {section.items.map((item) => (
              <ListItem
                button
                component={Link}
                to={item.path}
                key={item.title}
                className={`${classes.listItem} ${
                  isActive(item.path) ? 'active' : ''
                }`}
              >
                <ListItemIcon>{item.icon}</ListItemIcon>
                <ListItemText primary={item.title} />
              </ListItem>
            ))}
          </List>
          <Divider />
        </div>
      ))}
    </Drawer>
  );
};

export default Sidebar;
