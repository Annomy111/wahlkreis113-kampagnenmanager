import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Autocomplete,
  Chip,
} from '@mui/material';
import { useSelector } from 'react-redux';
import userService from '../../services/userService';

const CreateChatRoomDialog = ({ open, onClose, onSubmit }) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [users, setUsers] = useState([]);
  const currentUser = useSelector(state => state.auth.user);

  React.useEffect(() => {
    const loadUsers = async () => {
      try {
        const response = await userService.getAllUsers();
        setUsers(response.data.filter(user => user._id !== currentUser._id));
      } catch (error) {
        console.error('Error loading users:', error);
      }
    };

    if (open) {
      loadUsers();
    }
  }, [open, currentUser._id]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({
      name,
      description,
      participants: [...selectedUsers.map(user => user._id), currentUser._id],
    });
    handleClose();
  };

  const handleClose = () => {
    setName('');
    setDescription('');
    setSelectedUsers([]);
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>Neuen Chat-Raum erstellen</DialogTitle>
      <form onSubmit={handleSubmit}>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Name des Chat-Raums"
            fullWidth
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            sx={{ mb: 2 }}
          />
          
          <TextField
            margin="dense"
            label="Beschreibung"
            fullWidth
            multiline
            rows={2}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            sx={{ mb: 2 }}
          />

          <Autocomplete
            multiple
            id="participants"
            options={users}
            value={selectedUsers}
            onChange={(event, newValue) => setSelectedUsers(newValue)}
            getOptionLabel={(option) => option.name}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Teilnehmer auswählen"
                placeholder="Teilnehmer hinzufügen"
              />
            )}
            renderTags={(value, getTagProps) =>
              value.map((option, index) => (
                <Chip
                  label={option.name}
                  {...getTagProps({ index })}
                  key={option._id}
                />
              ))
            }
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Abbrechen</Button>
          <Button 
            type="submit" 
            variant="contained" 
            disabled={!name.trim() || selectedUsers.length === 0}
          >
            Erstellen
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default CreateChatRoomDialog;
