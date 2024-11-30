import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { styled } from '@mui/material/styles';
import {
  Container,
  Grid,
  Paper,
  Typography,
  Button,
  Card,
  CardContent,
  CardActions,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  IconButton,
  Box
} from '@mui/material';
import {
  Event as EventIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  People as PeopleIcon,
  Room as LocationIcon
} from '@mui/icons-material';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';
import eventService from '../services/eventService';
import { setAlert } from '../redux/actions/uiActions';

const useStyles = styled((theme) => ({
  root: {
    flexGrow: 1,
    padding: theme.spacing(3),
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing(3),
  },
  card: {
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
  },
  cardContent: {
    flexGrow: 1,
  },
  eventType: {
    marginBottom: theme.spacing(1),
  },
  chip: {
    margin: theme.spacing(0.5),
  },
  locationInfo: {
    display: 'flex',
    alignItems: 'center',
    marginTop: theme.spacing(1),
    color: theme.palette.text.secondary,
  },
  participantsInfo: {
    display: 'flex',
    alignItems: 'center',
    marginTop: theme.spacing(1),
    color: theme.palette.text.secondary,
  },
  dialogContent: {
    minWidth: 400,
  },
  formControl: {
    marginBottom: theme.spacing(2),
    minWidth: '100%',
  },
}));

const Events = () => {
  const classes = useStyles();
  const dispatch = useDispatch();
  const [events, setEvents] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: '',
    date: '',
    time: '',
    location: '',
    maxParticipants: '',
  });

  const user = useSelector(state => state.auth.user);

  useEffect(() => {
    loadEvents();
  }, []);

  const loadEvents = async () => {
    try {
      const data = await eventService.getAllEvents();
      setEvents(data);
    } catch (err) {
      dispatch(setAlert(err.message, 'error'));
    }
  };

  const handleAddEvent = () => {
    setSelectedEvent(null);
    setFormData({
      title: '',
      description: '',
      type: '',
      date: '',
      time: '',
      location: '',
      maxParticipants: '',
    });
    setOpenDialog(true);
  };

  const handleEditEvent = (event) => {
    setSelectedEvent(event);
    setFormData({
      title: event.title,
      description: event.description,
      type: event.type,
      date: format(new Date(event.date), 'yyyy-MM-dd'),
      time: format(new Date(event.date), 'HH:mm'),
      location: event.location,
      maxParticipants: event.maxParticipants,
    });
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedEvent(null);
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const eventData = {
        ...formData,
        date: new Date(`${formData.date}T${formData.time}`).toISOString(),
      };

      if (selectedEvent) {
        await eventService.updateEvent(selectedEvent._id, eventData);
        dispatch(setAlert('Veranstaltung erfolgreich aktualisiert', 'success'));
      } else {
        await eventService.createEvent(eventData);
        dispatch(setAlert('Veranstaltung erfolgreich erstellt', 'success'));
      }

      handleCloseDialog();
      loadEvents();
    } catch (err) {
      dispatch(setAlert(err.message, 'error'));
    }
  };

  const handleDeleteEvent = async (eventId) => {
    if (window.confirm('Möchten Sie diese Veranstaltung wirklich löschen?')) {
      try {
        await eventService.deleteEvent(eventId);
        dispatch(setAlert('Veranstaltung erfolgreich gelöscht', 'success'));
        loadEvents();
      } catch (err) {
        dispatch(setAlert(err.message, 'error'));
      }
    }
  };

  const handleRegisterEvent = async (eventId) => {
    try {
      await eventService.registerForEvent(eventId);
      dispatch(setAlert('Erfolgreich für die Veranstaltung angemeldet', 'success'));
      loadEvents();
    } catch (err) {
      dispatch(setAlert(err.message, 'error'));
    }
  };

  return (
    <div className={classes.root}>
      <div className={classes.header}>
        <Typography variant="h5">Veranstaltungen</Typography>
        {user?.role === 'admin' && (
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={handleAddEvent}
          >
            Neue Veranstaltung
          </Button>
        )}
      </div>

      <Grid container spacing={3}>
        {events.map((event) => (
          <Grid item xs={12} sm={6} md={4} key={event._id}>
            <Card className={classes.card}>
              <CardContent className={classes.cardContent}>
                <Box display="flex" justifyContent="space-between">
                  <Typography variant="h6" component="h2">
                    {event.title}
                  </Typography>
                  {user?.role === 'admin' && (
                    <div>
                      <IconButton size="small" onClick={() => handleEditEvent(event)}>
                        <EditIcon />
                      </IconButton>
                      <IconButton size="small" onClick={() => handleDeleteEvent(event._id)}>
                        <DeleteIcon />
                      </IconButton>
                    </div>
                  )}
                </Box>

                <Chip
                  icon={<EventIcon />}
                  label={event.type}
                  className={classes.eventType}
                  color="primary"
                  variant="outlined"
                />

                <Typography variant="body2" color="textSecondary" component="p">
                  {event.description}
                </Typography>

                <div className={classes.locationInfo}>
                  <LocationIcon fontSize="small" />
                  <Typography variant="body2" style={{ marginLeft: 8 }}>
                    {event.location}
                  </Typography>
                </div>

                <div className={classes.participantsInfo}>
                  <PeopleIcon fontSize="small" />
                  <Typography variant="body2" style={{ marginLeft: 8 }}>
                    {event.participants?.length || 0} / {event.maxParticipants} Teilnehmer
                  </Typography>
                </div>
              </CardContent>

              <CardActions>
                <Button
                  size="small"
                  color="primary"
                  onClick={() => handleRegisterEvent(event._id)}
                  disabled={event.participants?.includes(user?._id)}
                >
                  {event.participants?.includes(user?._id)
                    ? 'Angemeldet'
                    : 'Teilnehmen'}
                </Button>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Dialog open={openDialog} onClose={handleCloseDialog}>
        <DialogTitle>
          {selectedEvent ? 'Veranstaltung bearbeiten' : 'Neue Veranstaltung'}
        </DialogTitle>
        <DialogContent className={classes.dialogContent}>
          <form onSubmit={handleSubmit}>
            <FormControl className={classes.formControl}>
              <TextField
                name="title"
                label="Titel"
                value={formData.title}
                onChange={handleInputChange}
                fullWidth
                required
              />
            </FormControl>

            <FormControl className={classes.formControl}>
              <TextField
                name="description"
                label="Beschreibung"
                value={formData.description}
                onChange={handleInputChange}
                fullWidth
                multiline
                rows={4}
                required
              />
            </FormControl>

            <FormControl className={classes.formControl}>
              <InputLabel>Typ</InputLabel>
              <Select
                name="type"
                value={formData.type}
                onChange={handleInputChange}
                required
              >
                <MenuItem value="Infostand">Infostand</MenuItem>
                <MenuItem value="Haustürwahlkampf">Haustürwahlkampf</MenuItem>
                <MenuItem value="Telefonaktion">Telefonaktion</MenuItem>
                <MenuItem value="Veranstaltung">Veranstaltung</MenuItem>
                <MenuItem value="Schulung">Schulung</MenuItem>
              </Select>
            </FormControl>

            <Grid container spacing={2}>
              <Grid item xs={6}>
                <FormControl className={classes.formControl}>
                  <TextField
                    name="date"
                    label="Datum"
                    type="date"
                    value={formData.date}
                    onChange={handleInputChange}
                    InputLabelProps={{
                      shrink: true,
                    }}
                    required
                  />
                </FormControl>
              </Grid>
              <Grid item xs={6}>
                <FormControl className={classes.formControl}>
                  <TextField
                    name="time"
                    label="Uhrzeit"
                    type="time"
                    value={formData.time}
                    onChange={handleInputChange}
                    InputLabelProps={{
                      shrink: true,
                    }}
                    required
                  />
                </FormControl>
              </Grid>
            </Grid>

            <FormControl className={classes.formControl}>
              <TextField
                name="location"
                label="Ort"
                value={formData.location}
                onChange={handleInputChange}
                fullWidth
                required
              />
            </FormControl>

            <FormControl className={classes.formControl}>
              <TextField
                name="maxParticipants"
                label="Maximale Teilnehmerzahl"
                type="number"
                value={formData.maxParticipants}
                onChange={handleInputChange}
                fullWidth
                required
              />
            </FormControl>
          </form>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} color="primary">
            Abbrechen
          </Button>
          <Button onClick={handleSubmit} color="primary" variant="contained">
            {selectedEvent ? 'Aktualisieren' : 'Erstellen'}
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default Events;
