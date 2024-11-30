import React from 'react';
import { styled } from '@mui/material/styles';
import {
  Grid,
  Paper,
  Typography,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Chip,
  Avatar,
  Button,
  Box
} from '@mui/material';
import {
  Event as EventIcon,
  EmojiEvents as TrophyIcon
} from '@mui/icons-material';

const useStyles = styled((theme) => ({
  root: {
    flexGrow: 1,
    padding: theme.spacing(3),
  },
  paper: {
    padding: theme.spacing(3),
    height: '100%',
  },
  title: {
    marginBottom: theme.spacing(2),
  },
  progressSection: {
    marginBottom: theme.spacing(2),
  },
  chip: {
    margin: theme.spacing(0.5),
  },
  listItem: {
    padding: theme.spacing(1, 0),
  },
  eventDate: {
    color: theme.palette.text.secondary,
    fontSize: '0.875rem',
  },
  statsValue: {
    fontWeight: 'bold',
    fontSize: '2rem',
    color: theme.palette.primary.main,
  },
  badge: {
    marginRight: theme.spacing(1),
    width: 80,
    height: 80,
  },
}));

const Dashboard = () => {
  const classes = useStyles();

  // Beispieldaten
  const stats = {
    visitedHouses: 1250,
    completedTasks: 45,
    upcomingEvents: 3,
    points: 850,
    rank: 3,
  };

  const badges = [
    { name: 'Türöffner', icon: '🚪', level: 'Gold' },
    { name: 'Teamplayer', icon: '👥', level: 'Silber' },
    { name: 'Organisator', icon: '📋', level: 'Bronze' },
  ];

  const upcomingEvents = [
    {
      title: 'Wahlkampfstand Marktplatz',
      date: '2024-03-15 10:00',
      type: 'event',
    },
    {
      title: 'Tür-zu-Tür-Aktion Nordstadt',
      date: '2024-03-16 14:00',
      type: 'door',
    },
    {
      title: 'Teammeeting',
      date: '2024-03-17 18:00',
      type: 'meeting',
    },
  ];

  return (
    <div className={classes.root}>
      <Grid container spacing={3}>
        {/* Statistiken */}
        <Grid item xs={12} md={8}>
          <Paper className={classes.paper}>
            <Typography variant="h6" className={classes.title}>
              Kampagnen-Fortschritt
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={12} sm={4}>
                <Box textAlign="center">
                  <Typography variant="body2" color="textSecondary">
                    Besuchte Haushalte
                  </Typography>
                  <Typography className={classes.statsValue}>
                    {stats.visitedHouses}
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} sm={4}>
                <Box textAlign="center">
                  <Typography variant="body2" color="textSecondary">
                    Erledigte Aufgaben
                  </Typography>
                  <Typography className={classes.statsValue}>
                    {stats.completedTasks}
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} sm={4}>
                <Box textAlign="center">
                  <Typography variant="body2" color="textSecondary">
                    Punkte
                  </Typography>
                  <Typography className={classes.statsValue}>
                    {stats.points}
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </Paper>
        </Grid>

        {/* Rangliste */}
        <Grid item xs={12} md={4}>
          <Paper className={classes.paper}>
            <Typography variant="h6" className={classes.title}>
              Deine Position
            </Typography>
            <Box display="flex" alignItems="center" justifyContent="center">
              <TrophyIcon color="primary" style={{ fontSize: 40 }} />
              <Box ml={2}>
                <Typography variant="h4" color="primary">
                  #{stats.rank}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  von 50 Freiwilligen
                </Typography>
              </Box>
            </Box>
          </Paper>
        </Grid>

        {/* Abzeichen */}
        <Grid item xs={12} md={4}>
          <Paper className={classes.paper}>
            <Typography variant="h6" className={classes.title}>
              Deine Abzeichen
            </Typography>
            <Grid container spacing={2}>
              {badges.map((badge) => (
                <Grid item xs={4} key={badge.name}>
                  <Box textAlign="center">
                    <Avatar className={classes.badge}>
                      {badge.icon}
                    </Avatar>
                    <Typography variant="body2">{badge.name}</Typography>
                    <Chip
                      label={badge.level}
                      size="small"
                      color="primary"
                      className={classes.chip}
                    />
                  </Box>
                </Grid>
              ))}
            </Grid>
          </Paper>
        </Grid>

        {/* Anstehende Events */}
        <Grid item xs={12} md={8}>
          <Paper className={classes.paper}>
            <Typography variant="h6" className={classes.title}>
              Anstehende Veranstaltungen
            </Typography>
            <List>
              {upcomingEvents.map((event, index) => (
                <ListItem key={index} className={classes.listItem}>
                  <ListItemIcon>
                    <EventIcon color="primary" />
                  </ListItemIcon>
                  <ListItemText
                    primary={event.title}
                    secondary={new Date(event.date).toLocaleString('de-DE', {
                      dateStyle: 'medium',
                      timeStyle: 'short',
                    })}
                  />
                  <Button variant="outlined" color="primary" size="small">
                    Details
                  </Button>
                </ListItem>
              ))}
            </List>
          </Paper>
        </Grid>
      </Grid>
    </div>
  );
};

export default Dashboard;
