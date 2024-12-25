import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchAppointmentDetails, updateAppointment } from '../../store/slices/appointmentsSlice';
import { fetchDoctorAvailability } from '../../store/slices/doctorsSlice';
import {
  Box,
  Card,
  CardContent,
  Grid,
  Typography,
  TextField,
  Button,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Alert,
  CircularProgress,
  Paper
} from '@mui/material';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import {
  Person as PersonIcon,
  CalendarMonth as CalendarIcon,
  AccessTime as AccessTimeIcon,
  LocalHospital as LocalHospitalIcon,
  AttachMoney as MoneyIcon
} from '@mui/icons-material';

const EditAppointment = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { currentAppointment: appointment, loading: appointmentLoading, error, successMessage } = useSelector(state => state.appointments);
  const { availability, loading: availabilityLoading } = useSelector(state => state.doctors);

  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState(null);
  const [formData, setFormData] = useState({
    symptoms: '',
    notes: ''
  });

  useEffect(() => {
    dispatch(fetchAppointmentDetails(id));
  }, [dispatch, id]);

  useEffect(() => {
    if (appointment) {
      setFormData({
        symptoms: appointment.symptoms,
        notes: appointment.notes || ''
      });
      const appointmentDate = new Date(appointment.appointmentDate);
      setSelectedDate(appointmentDate);
      setSelectedTimeSlot(appointment.timeSlot);

      // Fetch available slots for the current date
      dispatch(fetchDoctorAvailability({
        doctorId: appointment.doctor._id,
        date: appointmentDate.toISOString().split('T')[0]
      }));
    }
  }, [appointment, dispatch]);

  useEffect(() => {
    if (selectedDate && appointment) {
      dispatch(fetchDoctorAvailability({
        doctorId: appointment.doctor._id,
        date: selectedDate.toISOString().split('T')[0]
      }));
    }
  }, [selectedDate, appointment, dispatch]);

  // Navigate to appointments list after successful update
  useEffect(() => {
    if (successMessage) {
      navigate('/appointments');
    }
  }, [successMessage, navigate]);

  const handleDateChange = (date) => {
    setSelectedDate(date);
    setSelectedTimeSlot(null);
  };

  const handleTimeSlotSelect = (slot) => {
    setSelectedTimeSlot(slot);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (selectedDate && selectedTimeSlot) {
      dispatch(updateAppointment({
        appointmentId: id,
        updateData: {
          appointmentDate: selectedDate.toISOString().split('T')[0],
          timeSlot: selectedTimeSlot,
          ...formData
        }
      }));
    }
  };

  if (appointmentLoading || !appointment) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Edit Appointment
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <Grid container spacing={3}>
        {/* Appointment Details */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Appointment Details
              </Typography>
              <Divider sx={{ mb: 2 }} />
              
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
                    <MoneyIcon color="primary" />
                  </ListItemIcon>
                  <ListItemText
                    primary="Consultation Fee"
                    secondary={`$${appointment.consultationFee}`}
                  />
                </ListItem>
              </List>
            </CardContent>
          </Card>
        </Grid>

        {/* Edit Form */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Schedule & Medical Information
            </Typography>
            <Divider sx={{ mb: 3 }} />

            <form onSubmit={handleSubmit}>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <LocalizationProvider dateAdapter={AdapterDateFns}>
                    <DatePicker
                      label="Select Date"
                      value={selectedDate}
                      onChange={handleDateChange}
                      minDate={new Date()}
                      slotProps={{
                        textField: {
                          fullWidth: true,
                          variant: 'outlined'
                        }
                      }}
                    />
                  </LocalizationProvider>
                </Grid>

                {selectedDate && availability && (
                  <Grid item xs={12}>
                    <Typography variant="subtitle1" gutterBottom>
                      Available Time Slots
                    </Typography>
                    <Grid container spacing={1}>
                      {[...new Set([...availability.availableSlots || [], appointment.timeSlot])].map((slot) => (
                        <Grid item xs={6} sm={4} md={3} key={slot}>
                          <Button
                            variant={selectedTimeSlot === slot ? "contained" : "outlined"}
                            fullWidth
                            onClick={() => handleTimeSlotSelect(slot)}
                            sx={{ mb: 1 }}
                          >
                            {slot}
                          </Button>
                        </Grid>
                      ))}
                    </Grid>
                  </Grid>
                )}

                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Symptoms"
                    name="symptoms"
                    multiline
                    rows={4}
                    value={formData.symptoms}
                    onChange={handleChange}
                    placeholder="Please describe your symptoms and reason for visit"
                    sx={{ mb: 3 }}
                  />

                  <TextField
                    fullWidth
                    label="Additional Notes (Optional)"
                    name="notes"
                    multiline
                    rows={3}
                    value={formData.notes}
                    onChange={handleChange}
                    placeholder="Any additional information you'd like to share"
                    sx={{ mb: 3 }}
                  />
                </Grid>
              </Grid>

              <Box display="flex" gap={2}>
                <Button
                  variant="outlined"
                  onClick={() => navigate('/appointments')}
                  disabled={appointmentLoading}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  disabled={appointmentLoading || !selectedDate || !selectedTimeSlot}
                  sx={{ flex: 1 }}
                >
                  {appointmentLoading ? (
                    <CircularProgress size={24} color="inherit" />
                  ) : (
                    'Save Changes'
                  )}
                </Button>
              </Box>
            </form>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default EditAppointment;
