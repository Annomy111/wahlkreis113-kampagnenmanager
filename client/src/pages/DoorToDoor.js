import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { styled } from '@mui/material/styles';
import {
  Grid,
  Paper,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  IconButton,
  Box,
  Chip
} from '@mui/material';
import {
  Home as HomeIcon,
  Person as PersonIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Check as CheckIcon,
  Clear as ClearIcon,
  Room as LocationIcon
} from '@mui/icons-material';
import districtService from '../services/districtService';
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
  districtInfo: {
    marginBottom: theme.spacing(2),
  },
  chip: {
    margin: theme.spacing(0.5),
  },
  dialogContent: {
    minWidth: 400,
  },
  formControl: {
    marginBottom: theme.spacing(2),
    minWidth: '100%',
  },
  listItem: {
    marginBottom: theme.spacing(1),
    backgroundColor: theme.palette.background.paper,
    borderRadius: theme.spacing(1),
  },
  statusIcon: {
    marginRight: theme.spacing(1),
  },
  progress: {
    marginTop: theme.spacing(2),
  },
}));

const DoorToDoor = () => {
  const classes = useStyles();
  const dispatch = useDispatch();
  const theme = styled((theme) => theme);
  const [districts, setDistricts] = useState([]);
  const [selectedDistrict, setSelectedDistrict] = useState(null);
  const [householdDialog, setHouseholdDialog] = useState(false);
  const [formData, setFormData] = useState({
    street: '',
    houseNumber: '',
    postalCode: '',
    city: '',
    status: '',
    notes: '',
  });

  useEffect(() => {
    loadDistricts();
  }, [loadDistricts]);

  const loadDistricts = async () => {
    try {
      const data = await districtService.getAllDistricts();
      setDistricts(data);
    } catch (err) {
      dispatch(setAlert(err.message, 'error'));
    }
  };

  const handleSelectDistrict = (district) => {
    setSelectedDistrict(district);
  };

  const handleAddHousehold = () => {
    setFormData({
      street: '',
      houseNumber: '',
      postalCode: '',
      city: '',
      status: '',
      notes: '',
    });
    setHouseholdDialog(true);
  };

  const handleEditHousehold = (household) => {
    setFormData({
      ...household,
    });
    setHouseholdDialog(true);
  };

  const handleCloseDialog = () => {
    setHouseholdDialog(false);
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmitHousehold = async (e) => {
    e.preventDefault();
    try {
      if (formData._id) {
        await districtService.updateHousehold(selectedDistrict._id, formData._id, formData);
        dispatch(setAlert('Haushalt erfolgreich aktualisiert', 'success'));
      } else {
        await districtService.addHousehold(selectedDistrict._id, formData);
        dispatch(setAlert('Haushalt erfolgreich hinzugefügt', 'success'));
      }
      handleCloseDialog();
      loadDistricts();
    } catch (err) {
      dispatch(setAlert(err.message, 'error'));
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'contacted':
        return 'primary';
      case 'not_home':
        return 'warning';
      case 'refused':
        return 'error';
      case 'completed':
        return 'success';
      default:
        return 'default';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'contacted':
        return <PersonIcon color="primary" />;
      case 'not_home':
        return <ClearIcon color="warning" />;
      case 'refused':
        return <ClearIcon color="error" />;
      case 'completed':
        return <CheckIcon color="success" />;
      default:
        return <HomeIcon />;
    }
  };

  return (
    <div className={classes.root}>
      <div className={classes.header}>
        <Typography variant="h5">Haustürwahlkampf</Typography>
      </div>

      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <Paper style={{ padding: theme.spacing(2) }}>
            <Typography variant="h6" gutterBottom>
              Wahlbezirke
            </Typography>
            <List>
              {districts.map((district) => (
                <ListItem
                  button
                  key={district._id}
                  onClick={() => handleSelectDistrict(district)}
                  selected={selectedDistrict?._id === district._id}
                  className={classes.listItem}
                >
                  <ListItemIcon>
                    <LocationIcon />
                  </ListItemIcon>
                  <ListItemText
                    primary={district.name}
                    secondary={`${district.households?.length || 0} Haushalte`}
                  />
                </ListItem>
              ))}
            </List>
          </Paper>
        </Grid>

        <Grid item xs={12} md={8}>
          {selectedDistrict ? (
            <Paper style={{ padding: theme.spacing(2) }}>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="h6">{selectedDistrict.name}</Typography>
                <Button
                  variant="contained"
                  color="primary"
                  startIcon={<AddIcon />}
                  onClick={handleAddHousehold}
                >
                  Haushalt hinzufügen
                </Button>
              </Box>

              <List>
                {selectedDistrict.households?.map((household) => (
                  <ListItem key={household._id} className={classes.listItem}>
                    <ListItemIcon>
                      {getStatusIcon(household.status)}
                    </ListItemIcon>
                    <ListItemText
                      primary={`${household.street} ${household.houseNumber}`}
                      secondary={
                        <>
                          {household.postalCode} {household.city}
                          {household.notes && (
                            <Typography variant="body2" color="textSecondary">
                              Notizen: {household.notes}
                            </Typography>
                          )}
                        </>
                      }
                    />
                    <Chip
                      label={household.status}
                      color={getStatusColor(household.status)}
                      size="small"
                      className={classes.chip}
                    />
                    <IconButton
                      size="small"
                      onClick={() => handleEditHousehold(household)}
                    >
                      <EditIcon />
                    </IconButton>
                  </ListItem>
                ))}
              </List>
            </Paper>
          ) : (
            <Paper style={{ padding: theme.spacing(2) }}>
              <Typography variant="body1" color="textSecondary">
                Bitte wählen Sie einen Wahlbezirk aus.
              </Typography>
            </Paper>
          )}
        </Grid>
      </Grid>

      <Dialog open={householdDialog} onClose={handleCloseDialog}>
        <DialogTitle>
          {formData._id ? 'Haushalt bearbeiten' : 'Neuer Haushalt'}
        </DialogTitle>
        <DialogContent className={classes.dialogContent}>
          <form onSubmit={handleSubmitHousehold}>
            <FormControl className={classes.formControl}>
              <TextField
                name="street"
                label="Straße"
                value={formData.street}
                onChange={handleInputChange}
                fullWidth
                required
              />
            </FormControl>

            <FormControl className={classes.formControl}>
              <TextField
                name="houseNumber"
                label="Hausnummer"
                value={formData.houseNumber}
                onChange={handleInputChange}
                fullWidth
                required
              />
            </FormControl>

            <FormControl className={classes.formControl}>
              <TextField
                name="postalCode"
                label="PLZ"
                value={formData.postalCode}
                onChange={handleInputChange}
                fullWidth
                required
              />
            </FormControl>

            <FormControl className={classes.formControl}>
              <TextField
                name="city"
                label="Stadt"
                value={formData.city}
                onChange={handleInputChange}
                fullWidth
                required
              />
            </FormControl>

            <FormControl className={classes.formControl}>
              <InputLabel>Status</InputLabel>
              <Select
                name="status"
                value={formData.status}
                onChange={handleInputChange}
                required
              >
                <MenuItem value="not_visited">Nicht besucht</MenuItem>
                <MenuItem value="contacted">Kontaktiert</MenuItem>
                <MenuItem value="not_home">Nicht angetroffen</MenuItem>
                <MenuItem value="refused">Abgelehnt</MenuItem>
                <MenuItem value="completed">Abgeschlossen</MenuItem>
              </Select>
            </FormControl>

            <FormControl className={classes.formControl}>
              <TextField
                name="notes"
                label="Notizen"
                value={formData.notes}
                onChange={handleInputChange}
                fullWidth
                multiline
                rows={4}
              />
            </FormControl>
          </form>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} color="primary">
            Abbrechen
          </Button>
          <Button onClick={handleSubmitHousehold} color="primary" variant="contained">
            {formData._id ? 'Aktualisieren' : 'Hinzufügen'}
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default DoorToDoor;
