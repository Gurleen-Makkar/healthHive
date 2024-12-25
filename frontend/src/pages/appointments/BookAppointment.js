import React, { useEffect, useState } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { createAppointment } from '../../store/slices/appointmentsSlice';
import { fetchDoctorDetails } from '../../store/slices/doctorsSlice';
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
import {
  Person as PersonIcon,
  CalendarMonth as CalendarIcon,
  AccessTime as AccessTimeIcon,
  LocalHospital as LocalHospitalIcon,
  AttachMoney as MoneyIcon
} from '@mui/icons-material';

const BookAppointment = () => {
  const { doctorId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { currentDoctor: doctor, loading: doctorLoading } = useSelector(state => state.doctors);
  const { loading: bookingLoading, error, successMessage } = useSelector(state => state.appointments);

  const [formData, setFormData] = useState({
    symptoms: '',
    notes: ''
  });
  const [formErrors, setFormErrors] = useState({});

  // Get date and time from location state (passed from DoctorDetails)
  // Get date and time from location state
  const selectedDate = location.state?.date;
  const selectedTimeSlot = location.state?.timeSlot;

  useEffect(() => {
    // Check if date is selected
    if (!selectedDate) {
      navigate(`/doctors/${doctorId}`);
      return;
    }

    dispatch(fetchDoctorDetails(doctorId));
  }, [dispatch, doctorId, selectedDate, navigate]);

  useEffect(() => {
    if (successMessage) {
      navigate('/appointments');
    }
  }, [successMessage, navigate]);

  const validateForm = () => {
    const errors = {};
    
    if (!formData.symptoms.trim()) {
      errors.symptoms = 'Please describe your symptoms';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear field-specific error when user starts typing
    if (formErrors[name]) {
      setFormErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (validateForm()) {
      console.log('Submitting appointment:', {
        doctorId,
        appointmentDate: selectedDate,
        timeSlot: selectedTimeSlot,
        ...formData
      });

      try {
        await dispatch(createAppointment({
          doctorId,
          appointmentDate: selectedDate,
          timeSlot: selectedTimeSlot,
          symptoms: formData.symptoms.trim(),
          notes: formData.notes.trim()
        })).unwrap();
      } catch (err) {
        console.error('Failed to create appointment:', err);
      }
    }
  };

  if (doctorLoading || !doctor) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Book Appointment
      </Typography>

      {error && (
        <Alert 
          severity="error" 
          sx={{ mb: 3, whiteSpace: 'pre-line' }}  // Allow line breaks in error message
        >
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
                    secondary={`Dr. ${doctor.name}`}
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <LocalHospitalIcon color="primary" />
                  </ListItemIcon>
                  <ListItemText
                    primary="Specialty"
                    secondary={doctor.specialty}
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <CalendarIcon color="primary" />
                  </ListItemIcon>
                  <ListItemText
                    primary="Date"
                    secondary={selectedDate ? new Date(selectedDate).toLocaleDateString('en-US', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    }) : 'Not selected'}
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <AccessTimeIcon color="primary" />
                  </ListItemIcon>
                  <ListItemText
                    primary="Time"
                    secondary={selectedTimeSlot}
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <MoneyIcon color="primary" />
                  </ListItemIcon>
                  <ListItemText
                    primary="Consultation Fee"
                    secondary={`$${doctor.consultationFee}`}
                  />
                </ListItem>
              </List>
            </CardContent>
          </Card>
        </Grid>

        {/* Booking Form */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Medical Information
            </Typography>
            <Divider sx={{ mb: 3 }} />

            <form onSubmit={handleSubmit}>
              <TextField
                fullWidth
                label="Symptoms"
                name="symptoms"
                multiline
                rows={4}
                value={formData.symptoms}
                onChange={handleChange}
                error={Boolean(formErrors.symptoms)}
                helperText={formErrors.symptoms}
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

              <Box display="flex" gap={2}>
                <Button
                  variant="outlined"
                  onClick={() => navigate(`/doctors/${doctorId}`)}
                  disabled={bookingLoading}
                >
                  Back
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  disabled={bookingLoading}
                  sx={{ flex: 1 }}
                >
                  {bookingLoading ? (
                    <CircularProgress size={24} color="inherit" />
                  ) : (
                    'Confirm Booking'
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

export default BookAppointment;
