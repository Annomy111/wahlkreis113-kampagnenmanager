import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { makeStyles } from '@material-ui/core/styles';
import {
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Box,
  Link,
  CircularProgress,
  Snackbar
} from '@material-ui/core';
import { Alert } from '@mui/lab';

const useStyles = makeStyles((theme) => ({
  root: {
    height: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f5f5f5',
  },
  paper: {
    padding: theme.spacing(4),
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    maxWidth: 400,
    width: '100%',
  },
  logo: {
    width: 100,
    marginBottom: theme.spacing(2),
  },
  title: {
    marginBottom: theme.spacing(3),
    color: theme.palette.primary.main,
  },
  form: {
    width: '100%',
    marginTop: theme.spacing(1),
  },
  submit: {
    margin: theme.spacing(3, 0, 2),
    padding: theme.spacing(1.5),
  },
  progress: {
    marginRight: theme.spacing(1),
  },
}));

const Login = ({ onLogin }) => {
  const classes = useStyles();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // API-Aufruf wird später implementiert
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Login fehlgeschlagen');
      }

      // Login erfolgreich
      localStorage.setItem('token', data.data.token);
      onLogin(data.data);
      navigate('/');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={classes.root}>
      <Container component="main" maxWidth="xs">
        <Paper elevation={3} className={classes.paper}>
          <img
            src="/spd-logo.png"
            alt="SPD Logo"
            className={classes.logo}
          />
          <Typography component="h1" variant="h5" className={classes.title}>
            Wahlkreis 113 Kampagnenmanager
          </Typography>

          <form className={classes.form} onSubmit={handleSubmit}>
            <TextField
              variant="outlined"
              margin="normal"
              required
              fullWidth
              id="email"
              label="E-Mail Adresse"
              name="email"
              autoComplete="email"
              autoFocus
              value={formData.email}
              onChange={handleChange}
            />
            <TextField
              variant="outlined"
              margin="normal"
              required
              fullWidth
              name="password"
              label="Passwort"
              type="password"
              id="password"
              autoComplete="current-password"
              value={formData.password}
              onChange={handleChange}
            />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              color="primary"
              className={classes.submit}
              disabled={loading}
            >
              {loading && (
                <CircularProgress
                  size={20}
                  color="inherit"
                  className={classes.progress}
                />
              )}
              Anmelden
            </Button>

            <Box mt={2} textAlign="center">
              <Link href="#" variant="body2" color="primary">
                Passwort vergessen?
              </Link>
            </Box>
          </form>
        </Paper>

        <Snackbar
          open={!!error}
          autoHideDuration={6000}
          onClose={() => setError('')}
        >
          <Alert onClose={() => setError('')} severity="error">
            {error}
          </Alert>
        </Snackbar>
      </Container>
    </div>
  );
};

export default Login;
