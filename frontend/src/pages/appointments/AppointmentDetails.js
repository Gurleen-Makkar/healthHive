import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchAppointmentDetails,
  cancelAppointment,
  clearCurrentAppointment
} from '../../store/slices/appointmentsSlice';
import {
  Box,
  Card,
  CardContent,
  Grid,
  Typography,
  Button,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  Alert,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Paper
} from '@mui/material';
import {
  Person as PersonIcon,
  CalendarMonth as CalendarIcon,
  AccessTime as AccessTimeIcon,
  LocalHospital as LocalHospitalIcon,
  AttachMoney as MoneyIcon,
  Edit as EditIcon,
  Delete as DeleteIcon
} from '@mui/icons-material';

const AppointmentDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { currentAppointment: appointment, loading, error } = useSelector(state => state.appointments);

  const [cancelDialog, setCancelDialog] = useState(false);

  useEffect(() => {
    dispatch(fetchAppointmentDetails(id));

    return () => {
      dispatch(clearCurrentAppointment());
    };
  }, [dispatch, id]);

  const handleCancelClick = () => {
    setCancelDialog(true);
  };

  const handleConfirmCancel = () => {
    dispatch(cancelAppointment(id)).then(() => {
      setCancelDialog(false);
      navigate('/appointments');
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'scheduled':
        return 'primary';
      case 'completed':
        return 'success';
      case 'cancelled':
        return 'error';
      default:
        return 'default';
    }
  };

  const formatDate = (date) => {
    return new Date(date + 'T00:00:00').toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading || !appointment) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mt: 2 }}>
        {error}
      </Alert>
    );
  }

  return (
    <Box>
      <Box mb={4} display="flex" justifyContent="space-between" alignItems="center">
        <Typography variant="h4">
          Appointment Details
        </Typography>
        <Box>
          <Button
            variant="outlined"
            onClick={() => navigate('/appointments')}
          >
            Back to List
          </Button>
        </Box>
      </Box>

      <Grid container spacing={3}>
        {/* Main Details */}
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                <Chip
                  label={appointment.status}
                  color={getStatusColor(appointment.status)}
                />
                {appointment.status === 'scheduled' && (
                  <Box>
                    <Button
                      startIcon={<EditIcon />}
                      onClick={() => navigate(`/appointments/${id}/edit`)}
                      sx={{ mr: 1 }}
                    >
                      Edit
                    </Button>
                    <Button
                      startIcon={<DeleteIcon />}
                      color="error"
                      onClick={handleCancelClick}
                    >
                      Cancel
                    </Button>
                  </Box>
                )}
              </Box>

              <List>
                <ListItem>
                  <ListItemIcon>
                    <PersonIcon color="primary" />
                  </ListItemIcon>
                  <ListItemText
                    primary="Doctor"
                    secondary={`Dr. ${appointment.doctor.name}`}
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <LocalHospitalIcon color="primary" />
                  </ListItemIcon>
                  <ListItemText
                    primary="Specialty"
                    secondary={appointment.doctor.specialty}
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <CalendarIcon color="primary" />
                  </ListItemIcon>
                  <ListItemText
                    primary="Date"
                    secondary={formatDate(appointment.appointmentDate)}
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <AccessTimeIcon color="primary" />
                  </ListItemIcon>
                  <ListItemText
                    primary="Time"
                    secondary={appointment.timeSlot}
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <MoneyIcon color="primary" />
                  </ListItemIcon>
                  <ListItemText
                    primary="Consultation Fee"
                    secondary={`₹${appointment.consultationFee}`}
                  />
                </ListItem>
              </List>
            </CardContent>
          </Card>
        </Grid>

        {/* Medical Information */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Medical Information
            </Typography>
            <Divider sx={{ mb: 2 }} />
            
            <Box mb={3}>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                Symptoms
              </Typography>
              <Typography>
                {appointment.symptoms}
              </Typography>
            </Box>

            {appointment.notes && (
              <Box>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  Additional Notes
                </Typography>
                <Typography>
                  {appointment.notes}
                </Typography>
              </Box>
            )}
          </Paper>
        </Grid>
      </Grid>

      {/* Cancel Confirmation Dialog */}
      <Dialog
        open={cancelDialog}
        onClose={() => setCancelDialog(false)}
      >
        <DialogTitle>Cancel Appointment</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to cancel this appointment? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCancelDialog(false)}>
            No, Keep It
          </Button>
          <Button
            onClick={handleConfirmCancel}
            color="error"
            variant="contained"
          >
            Yes, Cancel It
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AppointmentDetails;
