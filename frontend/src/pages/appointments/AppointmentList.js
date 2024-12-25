import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchAppointments, cancelAppointment } from '../../store/slices/appointmentsSlice';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  TextField,
  MenuItem,
  Grid,
  Chip,
  Pagination,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  Alert,
  IconButton,
  Tooltip,
  InputAdornment
} from '@mui/material';
import {
  Search as SearchIcon,
  FilterList as FilterIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  Visibility as ViewIcon
} from '@mui/icons-material';

const AppointmentList = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const {
    list: appointments,
    pagination,
    loading,
    error,
    successMessage
  } = useSelector(state => state.appointments);

  const [filters, setFilters] = useState({
    status: '',
    search: '',
    page: 1
  });

  const [deleteDialog, setDeleteDialog] = useState({
    open: false,
    appointmentId: null
  });

  useEffect(() => {
    dispatch(fetchAppointments({
      status: filters.status,
      search: filters.search,
      page: filters.page,
      limit: 20
    }));
  }, [dispatch, filters.status, filters.search, filters.page]);

  const handleFilterChange = (event) => {
    const { name, value } = event.target;
    setFilters(prev => ({
      ...prev,
      [name]: value,
      page: 1 // Reset to first page when filters change
    }));
  };

  const handlePageChange = (event, value) => {
    setFilters(prev => ({
      ...prev,
      page: value
    }));
  };

  const handleCancelClick = (appointmentId) => {
    setDeleteDialog({
      open: true,
      appointmentId
    });
  };

  const handleConfirmCancel = () => {
    if (deleteDialog.appointmentId) {
      dispatch(cancelAppointment(deleteDialog.appointmentId));
      setDeleteDialog({ open: false, appointmentId: null });
    }
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

  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        return 'Invalid Date';
      }
      return date.toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });
    } catch (error) {
      console.error('Date formatting error:', error);
      return 'Invalid Date';
    }
  };

  const filteredAppointments = appointments;

  return (
    <Box>
      <Box mb={4}>
        <Typography variant="h4" gutterBottom>
          My Appointments
        </Typography>
        <Typography variant="body1" color="text.secondary">
          View and manage your appointments
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {successMessage && (
        <Alert severity="success" sx={{ mb: 3 }}>
          {successMessage}
        </Alert>
      )}

      {/* Filters */}
      <Grid container spacing={2} mb={4}>
        <Grid item xs={12} sm={6} md={4}>
          <TextField
            fullWidth
            name="search"
            placeholder="Search by doctor name or specialty"
            value={filters.search}
            onChange={handleFilterChange}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon color="action" />
                </InputAdornment>
              ),
            }}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <TextField
            select
            fullWidth
            name="status"
            label="Status"
            value={filters.status}
            onChange={handleFilterChange}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <FilterIcon color="action" />
                </InputAdornment>
              ),
            }}
          >
            <MenuItem value="">All Status</MenuItem>
            <MenuItem value="scheduled">Scheduled</MenuItem>
            <MenuItem value="completed">Completed</MenuItem>
            <MenuItem value="cancelled">Cancelled</MenuItem>
          </TextField>
        </Grid>
      </Grid>

      {/* Appointments List */}
      {loading ? (
        <Box display="flex" justifyContent="center" p={4}>
          <CircularProgress />
        </Box>
      ) : filteredAppointments.length > 0 ? (
        <Grid container spacing={3}>
          {filteredAppointments.map((appointment) => (
            <Grid item xs={12} key={appointment._id}>
              <Card>
                <CardContent>
                  <Grid container spacing={2} alignItems="center">
                    <Grid item xs={12} sm={4}>
                      <Typography variant="h6">
                        Dr. {appointment.doctor?.name || 'Loading...'}
                      </Typography>
                      <Typography color="text.secondary" gutterBottom>
                        {appointment.doctor?.specialty || 'Loading...'}
                      </Typography>
                    </Grid>

                    <Grid item xs={12} sm={3}>
                      <Typography variant="body2" color="text.secondary">
                        Date & Time
                      </Typography>
                      <Typography>
                        {formatDate(appointment.appointmentDate)}
                      </Typography>
                      <Typography>
                        {appointment.timeSlot}
                      </Typography>
                    </Grid>

                    <Grid item xs={12} sm={2}>
                      <Chip
                        label={appointment.status}
                        color={getStatusColor(appointment.status)}
                        size="small"
                      />
                    </Grid>

                    <Grid item xs={12} sm={3}>
                      <Box display="flex" gap={1} justifyContent="flex-end">
                        <Tooltip title="View Details">
                          <IconButton
                            onClick={() => navigate(`/appointments/${appointment._id}`)}
                            size="small"
                          >
                            <ViewIcon />
                          </IconButton>
                        </Tooltip>

                        {appointment.status === 'scheduled' && (
                          <>
                            <Tooltip title="Edit Appointment">
                              <IconButton
                                onClick={() => navigate(`/appointments/${appointment._id}/edit`)}
                                size="small"
                              >
                                <EditIcon />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Cancel Appointment">
                              <IconButton
                                onClick={() => handleCancelClick(appointment._id)}
                                size="small"
                                color="error"
                              >
                                <DeleteIcon />
                              </IconButton>
                            </Tooltip>
                          </>
                        )}
                      </Box>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      ) : (
        <Box textAlign="center" py={4}>
          <Typography color="text.secondary" gutterBottom>
            No appointments found
          </Typography>
          <Button
            variant="contained"
            onClick={() => navigate('/doctors')}
            sx={{ mt: 2 }}
          >
            Book an Appointment
          </Button>
        </Box>
      )}

      {/* Pagination */}
      {filteredAppointments.length > 0 && (
        <Box display="flex" justifyContent="center" mt={4}>
          <Pagination
            count={pagination.totalPages}
            page={filters.page}
            onChange={handlePageChange}
            color="primary"
          />
        </Box>
      )}

      {/* Cancel Confirmation Dialog */}
      <Dialog
        open={deleteDialog.open}
        onClose={() => setDeleteDialog({ open: false, appointmentId: null })}
      >
        <DialogTitle>Cancel Appointment</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to cancel this appointment? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setDeleteDialog({ open: false, appointmentId: null })}
          >
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

export default AppointmentList;
