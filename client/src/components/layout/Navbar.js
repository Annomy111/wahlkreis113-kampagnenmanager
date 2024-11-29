import React from 'react';
import { Link } from 'react-router-dom';
import { makeStyles } from '@material-ui/core/styles';
import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Badge,
  Menu,
  MenuItem,
  Avatar
} from '@material-ui/core';
import {
  Notifications as NotificationsIcon,
  AccountCircle,
  ExitToApp
} from '@material-ui/icons';

const useStyles = makeStyles((theme) => ({
  root: {
    flexGrow: 1,
  },
  toolbar: {
    backgroundColor: '#E3000F', // SPD Red
  },
  title: {
    flexGrow: 1,
    textDecoration: 'none',
    color: 'white',
    '&:hover': {
      color: 'white',
    },
  },
  userInfo: {
    display: 'flex',
    alignItems: 'center',
    marginRight: theme.spacing(2),
  },
  userName: {
    marginRight: theme.spacing(1),
  },
  avatar: {
    backgroundColor: theme.palette.secondary.main,
  },
  badge: {
    marginRight: theme.spacing(2),
  },
}));

const Navbar = ({ user, notifications, onLogout }) => {
  const classes = useStyles();
  const [anchorEl, setAnchorEl] = React.useState(null);

  const handleMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    handleClose();
    onLogout();
  };

  return (
    <div className={classes.root}>
      <AppBar position="static">
        <Toolbar className={classes.toolbar}>
          <Typography
            component={Link}
            to="/"
            variant="h6"
            className={classes.title}
          >
            Wahlkreis 113 Kampagnenmanager
          </Typography>

          {user && (
            <>
              <IconButton color="inherit" className={classes.badge}>
                <Badge badgeContent={notifications?.length || 0} color="secondary">
                  <NotificationsIcon />
                </Badge>
              </IconButton>

              <div className={classes.userInfo}>
                <Typography variant="body1" className={classes.userName}>
                  {user.firstName} {user.lastName}
                </Typography>
                <IconButton
                  aria-label="account of current user"
                  aria-controls="menu-appbar"
                  aria-haspopup="true"
                  onClick={handleMenu}
                  color="inherit"
                >
                  {user.avatar ? (
                    <Avatar
                      alt={`${user.firstName} ${user.lastName}`}
                      src={user.avatar}
                      className={classes.avatar}
                    />
                  ) : (
                    <AccountCircle />
                  )}
                </IconButton>
                <Menu
                  id="menu-appbar"
                  anchorEl={anchorEl}
                  anchorOrigin={{
                    vertical: 'top',
                    horizontal: 'right',
                  }}
                  keepMounted
                  transformOrigin={{
                    vertical: 'top',
                    horizontal: 'right',
                  }}
                  open={Boolean(anchorEl)}
                  onClose={handleClose}
                >
                  <MenuItem
                    component={Link}
                    to="/profile"
                    onClick={handleClose}
                  >
                    Profil
                  </MenuItem>
                  <MenuItem onClick={handleLogout}>
                    <ExitToApp fontSize="small" style={{ marginRight: 8 }} />
                    Abmelden
                  </MenuItem>
                </Menu>
              </div>
            </>
          )}
        </Toolbar>
      </AppBar>
    </div>
  );
};

export default Navbar;
