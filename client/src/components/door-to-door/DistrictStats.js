import React from 'react';
import {
  Paper,
  Box,
  Typography,
  Grid,
  LinearProgress,
  Tooltip,
  IconButton,
} from '@mui/material';
import {
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  Cancel as CancelIcon,
  Info as InfoIcon,
} from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';

const DistrictStats = ({ district, households }) => {
  const theme = useTheme();

  // Calculate statistics
  const totalHouseholds = households.length;
  const completedCount = households.filter(h => h.status === 'completed').length;
  const inProgressCount = households.filter(h => h.status === 'in_progress').length;
  const notVisitedCount = households.filter(h => h.status === 'not_visited').length;
  const skippedCount = households.filter(h => h.status === 'skipped').length;

  const completionPercentage = totalHouseholds > 0
    ? Math.round((completedCount / totalHouseholds) * 100)
    : 0;

  // Prepare chart data
  const chartData = [
    {
      name: 'Besucht',
      value: completedCount,
      color: theme.palette.success.main,
    },
    {
      name: 'In Bearbeitung',
      value: inProgressCount,
      color: theme.palette.warning.main,
    },
    {
      name: 'Nicht besucht',
      value: notVisitedCount,
      color: theme.palette.error.main,
    },
    {
      name: 'Übersprungen',
      value: skippedCount,
      color: theme.palette.grey[500],
    },
  ];

  // Calculate daily statistics
  const last7Days = [...Array(7)].map((_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - i);
    return date.toISOString().split('T')[0];
  }).reverse();

  const dailyStats = last7Days.map(date => {
    const dayVisits = households.filter(h => 
      h.lastVisited && 
      new Date(h.lastVisited).toISOString().split('T')[0] === date
    ).length;

    return {
      date: new Date(date).toLocaleDateString('de-DE', { weekday: 'short', month: 'short', day: 'numeric' }),
      visits: dayVisits,
    };
  });

  return (
    <Box>
      <Grid container spacing={2}>
        {/* Overall Progress */}
        <Grid item xs={12}>
          <Paper sx={{ p: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
                Gesamtfortschritt
              </Typography>
              <Tooltip title="Prozentsatz der besuchten Haushalte">
                <IconButton size="small">
                  <InfoIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <Typography variant="h4" component="div" sx={{ mr: 2 }}>
                {completionPercentage}%
              </Typography>
              <Box sx={{ flexGrow: 1 }}>
                <LinearProgress
                  variant="determinate"
                  value={completionPercentage}
                  sx={{ height: 10, borderRadius: 5 }}
                />
              </Box>
            </Box>
            <Typography color="text.secondary">
              {completedCount} von {totalHouseholds} Haushalten besucht
            </Typography>
          </Paper>
        </Grid>

        {/* Status Distribution */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2, height: '100%' }}>
            <Typography variant="h6" gutterBottom>
              Status Verteilung
            </Typography>
            <Box sx={{ height: 300 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <RechartsTooltip />
                  <Bar dataKey="value">
                    {chartData.map((entry, index) => (
                      <Cell key={index} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </Box>
          </Paper>
        </Grid>

        {/* Daily Progress */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2, height: '100%' }}>
            <Typography variant="h6" gutterBottom>
              Täglicher Fortschritt
            </Typography>
            <Box sx={{ height: 300 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={dailyStats}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <RechartsTooltip />
                  <Bar dataKey="visits" fill={theme.palette.primary.main} />
                </BarChart>
              </ResponsiveContainer>
            </Box>
          </Paper>
        </Grid>

        {/* Status Cards */}
        <Grid item xs={12}>
          <Grid container spacing={2}>
            <Grid item xs={6} sm={3}>
              <Paper sx={{ p: 2, textAlign: 'center' }}>
                <CheckCircleIcon color="success" sx={{ fontSize: 40, mb: 1 }} />
                <Typography variant="h6">{completedCount}</Typography>
                <Typography color="text.secondary">Besucht</Typography>
              </Paper>
            </Grid>
            <Grid item xs={6} sm={3}>
              <Paper sx={{ p: 2, textAlign: 'center' }}>
                <WarningIcon color="warning" sx={{ fontSize: 40, mb: 1 }} />
                <Typography variant="h6">{inProgressCount}</Typography>
                <Typography color="text.secondary">In Bearbeitung</Typography>
              </Paper>
            </Grid>
            <Grid item xs={6} sm={3}>
              <Paper sx={{ p: 2, textAlign: 'center' }}>
                <CancelIcon color="error" sx={{ fontSize: 40, mb: 1 }} />
                <Typography variant="h6">{notVisitedCount}</Typography>
                <Typography color="text.secondary">Nicht besucht</Typography>
              </Paper>
            </Grid>
            <Grid item xs={6} sm={3}>
              <Paper sx={{ p: 2, textAlign: 'center' }}>
                <CancelIcon color="disabled" sx={{ fontSize: 40, mb: 1 }} />
                <Typography variant="h6">{skippedCount}</Typography>
                <Typography color="text.secondary">Übersprungen</Typography>
              </Paper>
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </Box>
  );
};

export default DistrictStats;
