import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchDoctorDetails,
  fetchDoctorAvailability,
  clearDoctorDetails,
  clearAvailability
} from '../../store/slices/doctorsSlice';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Avatar,
  Chip,
  Rating,
  Button,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  CircularProgress,
  Paper
} from '@mui/material';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import {
  AccessTime as AccessTimeIcon,
  School as SchoolIcon,
  AttachMoney as MoneyIcon,
  CalendarMonth as CalendarIcon
} from '@mui/icons-material';

const DoctorDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { currentDoctor: doctor, availability, loading } = useSelector(state => state.doctors);

  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState(null);

  useEffect(() => {
    dispatch(fetchDoctorDetails(id));

    return () => {
      dispatch(clearDoctorDetails());
      dispatch(clearAvailability());
    };
  }, [dispatch, id]);

  useEffect(() => {
    if (selectedDate) {
      // Format date to YYYY-MM-DD while preserving local date
      const formattedDate = `${selectedDate.getFullYear()}-${String(selectedDate.getMonth() + 1).padStart(2, '0')}-${String(selectedDate.getDate()).padStart(2, '0')}`;
      dispatch(fetchDoctorAvailability({
        doctorId: id,
        date: formattedDate
      }));
    }
  }, [dispatch, id, selectedDate]);

  const handleDateChange = (date) => {
    setSelectedDate(date);
    setSelectedTimeSlot(null);
  };

  const handleTimeSlotSelect = (slot) => {
    setSelectedTimeSlot(slot);
  };

  const handleBookAppointment = () => {
    if (selectedDate && selectedTimeSlot) {
      // Format date to YYYY-MM-DD while preserving local date
      const formattedDate = `${selectedDate.getFullYear()}-${String(selectedDate.getMonth() + 1).padStart(2, '0')}-${String(selectedDate.getDate()).padStart(2, '0')}`;
      navigate(`/book-appointment/${id}`, {
        state: {
          date: formattedDate,
          timeSlot: selectedTimeSlot
        }
      });
    }
  };

  if (loading || !doctor) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      {/* Doctor Profile Card */}
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Grid container spacing={4}>
            <Grid item xs={12} md={3}>
              <Box display="flex" flexDirection="column" alignItems="center">
                <Avatar
                  sx={{ 
                    width: 200, 
                    height: 200, 
                    mb: 2,
                    bgcolor: 'primary.main',
                    fontSize: '4rem'
                  }}
                >
                  {doctor.name.charAt(0)}
                </Avatar>
                <Rating
                  value={doctor.rating}
                  readOnly
                  precision={0.5}
                  sx={{ mb: 1 }}
                />
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  {doctor.rating} out of 5
                </Typography>
              </Box>
            </Grid>

            <Grid item xs={12} md={9}>
              <Box mb={2}>
                <Typography variant="h4" gutterBottom>
                  Dr. {doctor.name}
                </Typography>
                <Chip
                  label={doctor.specialty}
                  color="primary"
                  sx={{ mr: 1 }}
                />
                <Typography variant="body1" color="text.secondary" mt={2}>
                  {doctor.about}
                </Typography>
              </Box>

              <List>
                <ListItem>
                  <ListItemIcon>
                    <SchoolIcon color="primary" />
                  </ListItemIcon>
                  <ListItemText
                    primary="Qualification"
                    secondary={doctor.qualification}
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <AccessTimeIcon color="primary" />
                  </ListItemIcon>
                  <ListItemText
                    primary="Experience"
                    secondary={`${doctor.experience} years`}
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <MoneyIcon color="primary" />
                  </ListItemIcon>
                  <ListItemText
                    primary="Consultation Fee"
                    secondary={`₹${doctor.consultationFee}`}
                  />
                </ListItem>
              </List>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Appointment Booking Section */}
      <Card>
        <CardContent>
          <Typography variant="h5" gutterBottom>
            Book Appointment
          </Typography>
          <Divider sx={{ mb: 3 }} />

          <Grid container spacing={4}>
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

              {selectedDate && availability && (
                <Box mt={3}>
                  <Typography variant="h6" gutterBottom>
                    Available Time Slots
                  </Typography>
                  <Grid container spacing={1}>
                    {availability.availableSlots?.map((slot) => (
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
                </Box>
              )}
            </Grid>

            <Grid item xs={12} md={6}>
              <Paper elevation={0} sx={{ p: 2, bgcolor: 'background.default' }}>
                <Typography variant="h6" gutterBottom>
                  Selected Schedule
                </Typography>
                <List>
                  <ListItem>
                    <ListItemIcon>
                      <CalendarIcon />
                    </ListItemIcon>
                    <ListItemText
                      primary="Date"
                      secondary={selectedDate ? selectedDate.toLocaleDateString() : 'Not selected'}
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <AccessTimeIcon />
                    </ListItemIcon>
                    <ListItemText
                      primary="Time"
                      secondary={selectedTimeSlot || 'Not selected'}
                    />
                  </ListItem>
                </List>

                <Button
                  variant="contained"
                  fullWidth
                  size="large"
                  disabled={!selectedDate || !selectedTimeSlot}
                  onClick={handleBookAppointment}
                  sx={{ mt: 2 }}
                >
                  Continue to Book
                </Button>
              </Paper>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    </Box>
  );
};

export default DoctorDetails;
