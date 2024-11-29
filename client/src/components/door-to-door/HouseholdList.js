import React, { useState } from 'react';
import {
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Chip,
  TextField,
  Box,
  Typography,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Paper,
  Tooltip,
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  Cancel as CancelIcon,
  LocationOn as LocationIcon,
} from '@mui/icons-material';

const statusColors = {
  completed: 'success',
  in_progress: 'warning',
  not_visited: 'error',
  skipped: 'default',
};

const statusIcons = {
  completed: <CheckCircleIcon color="success" />,
  in_progress: <WarningIcon color="warning" />,
  not_visited: <CancelIcon color="error" />,
  skipped: <CancelIcon color="disabled" />,
};

const HouseholdList = ({
  households,
  onEditHousehold,
  onDeleteHousehold,
  onStatusChange,
  onHouseholdSelect,
  selectedHouseholdId,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const filteredHouseholds = households.filter(household => {
    const matchesSearch = (
      household.street.toLowerCase().includes(searchTerm.toLowerCase()) ||
      household.houseNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      household.postalCode.includes(searchTerm) ||
      household.city.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const matchesStatus = statusFilter === 'all' || household.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const getStatusLabel = (status) => {
    switch (status) {
      case 'completed':
        return 'Besucht';
      case 'in_progress':
        return 'In Bearbeitung';
      case 'not_visited':
        return 'Nicht besucht';
      case 'skipped':
        return 'Übersprungen';
      default:
        return status;
    }
  };

  return (
    <Paper elevation={2} sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
        <Typography variant="h6" gutterBottom>
          Haushalte
        </Typography>
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Suche nach Adresse..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          size="small"
          sx={{ mb: 2 }}
        />
        <FormControl fullWidth size="small">
          <InputLabel>Status Filter</InputLabel>
          <Select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            label="Status Filter"
          >
            <MenuItem value="all">Alle</MenuItem>
            <MenuItem value="not_visited">Nicht besucht</MenuItem>
            <MenuItem value="in_progress">In Bearbeitung</MenuItem>
            <MenuItem value="completed">Besucht</MenuItem>
            <MenuItem value="skipped">Übersprungen</MenuItem>
          </Select>
        </FormControl>
      </Box>

      <List sx={{ flexGrow: 1, overflow: 'auto' }}>
        {filteredHouseholds.map((household) => (
          <ListItem
            key={household._id}
            selected={selectedHouseholdId === household._id}
            onClick={() => onHouseholdSelect(household)}
            sx={{
              cursor: 'pointer',
              '&:hover': {
                backgroundColor: 'action.hover',
              },
            }}
          >
            <ListItemText
              primary={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  {statusIcons[household.status]}
                  <Typography>
                    {household.street} {household.houseNumber}
                  </Typography>
                </Box>
              }
              secondary={
                <>
                  {household.postalCode} {household.city}
                  <Chip
                    size="small"
                    label={getStatusLabel(household.status)}
                    color={statusColors[household.status]}
                    sx={{ ml: 1 }}
                  />
                </>
              }
            />
            <ListItemSecondaryAction>
              <Tooltip title="Position auf Karte">
                <IconButton
                  edge="end"
                  onClick={(e) => {
                    e.stopPropagation();
                    onHouseholdSelect(household);
                  }}
                >
                  <LocationIcon />
                </IconButton>
              </Tooltip>
              <Tooltip title="Bearbeiten">
                <IconButton
                  edge="end"
                  onClick={(e) => {
                    e.stopPropagation();
                    onEditHousehold(household);
                  }}
                >
                  <EditIcon />
                </IconButton>
              </Tooltip>
              <Tooltip title="Löschen">
                <IconButton
                  edge="end"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteHousehold(household);
                  }}
                >
                  <DeleteIcon />
                </IconButton>
              </Tooltip>
            </ListItemSecondaryAction>
          </ListItem>
        ))}
      </List>
    </Paper>
  );
};

export default HouseholdList;
