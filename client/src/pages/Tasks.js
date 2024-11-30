import React, { useState } from 'react';
import { styled } from '@mui/material/styles';
import {
  Grid,
  Paper,
  Typography,
  Tabs,
  Tab,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Chip,
  IconButton,
  Button,
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  FormControl,
  InputLabel,
  Select
} from '@mui/material';
import {
  Assignment as TaskIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  Schedule as ScheduleIcon
} from '@mui/icons-material';

const useStyles = styled((theme) => ({
  root: {
    flexGrow: 1,
    padding: theme.spacing(3),
  },
  paper: {
    padding: theme.spacing(3),
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing(3),
  },
  tabs: {
    marginBottom: theme.spacing(2),
  },
  listItem: {
    marginBottom: theme.spacing(1),
    borderRadius: theme.spacing(1),
    backgroundColor: '#fff',
    '&:hover': {
      backgroundColor: theme.palette.action.hover,
    },
  },
  chip: {
    margin: theme.spacing(0, 0.5),
  },
  priorityHigh: {
    color: theme.palette.error.main,
  },
  priorityMedium: {
    color: theme.palette.warning.main,
  },
  priorityLow: {
    color: theme.palette.success.main,
  },
  status: {
    display: 'flex',
    alignItems: 'center',
  },
  dialogContent: {
    minWidth: 400,
  },
  formControl: {
    marginBottom: theme.spacing(2),
    minWidth: '100%',
  },
}));

const Tasks = () => {
  const classes = useStyles();
  const [currentTab, setCurrentTab] = useState(0);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);

  // Beispieldaten
  const tasks = [
    {
      id: 1,
      title: 'Flyer-Verteilung Nordstadt',
      description: 'Verteilung von Wahlkampf-Flyern im Bezirk Nordstadt',
      type: 'door_to_door',
      status: 'pending',
      priority: 'high',
      dueDate: '2024-03-20',
      points: 20,
    },
    {
      id: 2,
      title: 'Social Media Posts erstellen',
      description: 'Erstellung von Beiträgen für Facebook und Instagram',
      type: 'social_media',
      status: 'in_progress',
      priority: 'medium',
      dueDate: '2024-03-18',
      points: 15,
    },
    {
      id: 3,
      title: 'Telefonaktion organisieren',
      description: 'Planung und Durchführung einer Telefonaktion',
      type: 'phone_banking',
      status: 'completed',
      priority: 'low',
      dueDate: '2024-03-15',
      points: 25,
    },
  ];

  const handleTabChange = (event, newValue) => {
    setCurrentTab(newValue);
  };

  const handleAddTask = () => {
    setSelectedTask(null);
    setOpenDialog(true);
  };

  const handleEditTask = (task) => {
    setSelectedTask(task);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedTask(null);
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return <CheckCircleIcon style={{ color: 'green' }} />;
      case 'in_progress':
        return <ScheduleIcon style={{ color: 'orange' }} />;
      case 'pending':
        return <WarningIcon style={{ color: 'red' }} />;
      default:
        return null;
    }
  };

  return (
    <div className={classes.root}>
      <Paper className={classes.paper}>
        <div className={classes.header}>
          <Typography variant="h5">Aufgaben</Typography>
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={handleAddTask}
          >
            Neue Aufgabe
          </Button>
        </div>

        <Tabs
          value={currentTab}
          onChange={handleTabChange}
          indicatorColor="primary"
          textColor="primary"
          className={classes.tabs}
        >
          <Tab label="Alle" />
          <Tab label="Meine Aufgaben" />
          <Tab label="Abgeschlossen" />
        </Tabs>

        <List>
          {tasks.map((task) => (
            <ListItem key={task.id} className={classes.listItem}>
              <ListItemIcon>
                <TaskIcon color="primary" />
              </ListItemIcon>
              <ListItemText
                primary={task.title}
                secondary={
                  <>
                    {task.description}
                    <Box mt={1}>
                      <Chip
                        label={`${task.points} Punkte`}
                        size="small"
                        className={classes.chip}
                        color="primary"
                      />
                      <Chip
                        label={task.type.replace('_', ' ')}
                        size="small"
                        className={classes.chip}
                      />
                      <Chip
                        label={`Fällig: ${new Date(task.dueDate).toLocaleDateString('de-DE')}`}
                        size="small"
                        className={classes.chip}
                      />
                    </Box>
                  </>
                }
              />
              <Box display="flex" alignItems="center">
                {getStatusIcon(task.status)}
                <IconButton onClick={() => handleEditTask(task)}>
                  <EditIcon />
                </IconButton>
                <IconButton>
                  <DeleteIcon />
                </IconButton>
              </Box>
            </ListItem>
          ))}
        </List>
      </Paper>

      <Dialog open={openDialog} onClose={handleCloseDialog}>
        <DialogTitle>
          {selectedTask ? 'Aufgabe bearbeiten' : 'Neue Aufgabe'}
        </DialogTitle>
        <DialogContent className={classes.dialogContent}>
          <FormControl className={classes.formControl}>
            <TextField
              autoFocus
              margin="dense"
              label="Titel"
              fullWidth
              defaultValue={selectedTask?.title}
            />
          </FormControl>
          <FormControl className={classes.formControl}>
            <TextField
              margin="dense"
              label="Beschreibung"
              fullWidth
              multiline
              rows={4}
              defaultValue={selectedTask?.description}
            />
          </FormControl>
          <Grid container spacing={2}>
            <Grid item xs={6}>
              <FormControl className={classes.formControl}>
                <InputLabel>Typ</InputLabel>
                <Select defaultValue={selectedTask?.type || ''}>
                  <MenuItem value="door_to_door">Tür-zu-Tür</MenuItem>
                  <MenuItem value="social_media">Social Media</MenuItem>
                  <MenuItem value="phone_banking">Telefonaktion</MenuItem>
                  <MenuItem value="event">Veranstaltung</MenuItem>
                  <MenuItem value="other">Sonstiges</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={6}>
              <FormControl className={classes.formControl}>
                <InputLabel>Priorität</InputLabel>
                <Select defaultValue={selectedTask?.priority || ''}>
                  <MenuItem value="high">Hoch</MenuItem>
                  <MenuItem value="medium">Mittel</MenuItem>
                  <MenuItem value="low">Niedrig</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
          <FormControl className={classes.formControl}>
            <TextField
              margin="dense"
              label="Fälligkeitsdatum"
              type="date"
              fullWidth
              InputLabelProps={{
                shrink: true,
              }}
              defaultValue={selectedTask?.dueDate}
            />
          </FormControl>
          <FormControl className={classes.formControl}>
            <TextField
              margin="dense"
              label="Punkte"
              type="number"
              fullWidth
              defaultValue={selectedTask?.points}
            />
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} color="primary">
            Abbrechen
          </Button>
          <Button onClick={handleCloseDialog} color="primary" variant="contained">
            Speichern
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default Tasks;
