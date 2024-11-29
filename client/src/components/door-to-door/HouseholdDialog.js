import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Typography,
  Box,
} from '@mui/material';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider, DateTimePicker } from '@mui/x-date-pickers';
import { de } from 'date-fns/locale';

const HouseholdDialog = ({
  open,
  onClose,
  onSubmit,
  household = null,
  loading = false,
}) => {
  const [formData, setFormData] = useState({
    street: '',
    houseNumber: '',
    postalCode: '',
    city: '',
    status: 'not_visited',
    notes: '',
    lastVisited: null,
    contactPerson: '',
    feedback: '',
    nextFollowUp: null,
  });

  useEffect(() => {
    if (household) {
      setFormData({
        street: household.street || '',
        houseNumber: household.houseNumber || '',
        postalCode: household.postalCode || '',
        city: household.city || '',
        status: household.status || 'not_visited',
        notes: household.notes || '',
        lastVisited: household.lastVisited ? new Date(household.lastVisited) : null,
        contactPerson: household.contactPerson || '',
        feedback: household.feedback || '',
        nextFollowUp: household.nextFollowUp ? new Date(household.nextFollowUp) : null,
      });
    } else {
      setFormData({
        street: '',
        houseNumber: '',
        postalCode: '',
        city: '',
        status: 'not_visited',
        notes: '',
        lastVisited: null,
        contactPerson: '',
        feedback: '',
        nextFollowUp: null,
      });
    }
  }, [household]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleDateChange = (name) => (date) => {
    setFormData(prev => ({
      ...prev,
      [name]: date,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={de}>
      <Dialog
        open={open}
        onClose={onClose}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {household ? 'Haushalt bearbeiten' : 'Neuer Haushalt'}
        </DialogTitle>
        <form onSubmit={handleSubmit}>
          <DialogContent>
            <Grid container spacing={2}>
              {/* Address Section */}
              <Grid item xs={12}>
                <Typography variant="subtitle1" gutterBottom>
                  Adresse
                </Typography>
              </Grid>
              <Grid item xs={8}>
                <TextField
                  fullWidth
                  label="Straße"
                  name="street"
                  value={formData.street}
                  onChange={handleChange}
                  required
                />
              </Grid>
              <Grid item xs={4}>
                <TextField
                  fullWidth
                  label="Hausnummer"
                  name="houseNumber"
                  value={formData.houseNumber}
                  onChange={handleChange}
                  required
                />
              </Grid>
              <Grid item xs={4}>
                <TextField
                  fullWidth
                  label="PLZ"
                  name="postalCode"
                  value={formData.postalCode}
                  onChange={handleChange}
                  required
                />
              </Grid>
              <Grid item xs={8}>
                <TextField
                  fullWidth
                  label="Stadt"
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  required
                />
              </Grid>

              {/* Status Section */}
              <Grid item xs={12}>
                <Typography variant="subtitle1" gutterBottom sx={{ mt: 2 }}>
                  Status & Kontakt
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <FormControl fullWidth>
                  <InputLabel>Status</InputLabel>
                  <Select
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                    label="Status"
                  >
                    <MenuItem value="not_visited">Nicht besucht</MenuItem>
                    <MenuItem value="in_progress">In Bearbeitung</MenuItem>
                    <MenuItem value="completed">Besucht</MenuItem>
                    <MenuItem value="skipped">Übersprungen</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  label="Kontaktperson"
                  name="contactPerson"
                  value={formData.contactPerson}
                  onChange={handleChange}
                />
              </Grid>

              {/* Visit Details */}
              <Grid item xs={6}>
                <DateTimePicker
                  label="Letzter Besuch"
                  value={formData.lastVisited}
                  onChange={handleDateChange('lastVisited')}
                  renderInput={(params) => <TextField {...params} fullWidth />}
                />
              </Grid>
              <Grid item xs={6}>
                <DateTimePicker
                  label="Nächster Folgetermin"
                  value={formData.nextFollowUp}
                  onChange={handleDateChange('nextFollowUp')}
                  renderInput={(params) => <TextField {...params} fullWidth />}
                />
              </Grid>

              {/* Notes & Feedback */}
              <Grid item xs={12}>
                <Typography variant="subtitle1" gutterBottom sx={{ mt: 2 }}>
                  Notizen & Feedback
                </Typography>
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Notizen"
                  name="notes"
                  value={formData.notes}
                  onChange={handleChange}
                  multiline
                  rows={3}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Feedback"
                  name="feedback"
                  value={formData.feedback}
                  onChange={handleChange}
                  multiline
                  rows={3}
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={onClose}>Abbrechen</Button>
            <Button
              type="submit"
              variant="contained"
              disabled={loading}
            >
              {household ? 'Aktualisieren' : 'Erstellen'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </LocalizationProvider>
  );
};

export default HouseholdDialog;
