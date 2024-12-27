import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchAppointments,
  cancelAppointment,
} from "../../store/slices/appointmentsSlice";
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
  InputAdornment,
  Avatar,
} from "@mui/material";
import {
  Search as SearchIcon,
  FilterList as FilterIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  Visibility as ViewIcon,
} from "@mui/icons-material";

const AppointmentList = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const {
    list: appointments,
    pagination,
    loading,
    error,
    successMessage,
  } = useSelector((state) => state.appointments);

  const [filters, setFilters] = useState({
    status: "All Status",
    search: "",
    page: 1,
  });

  const [deleteDialog, setDeleteDialog] = useState({
    open: false,
    appointmentId: null,
  });

  useEffect(() => {
    // Fetch appointments with default filters on mount
    dispatch(
      fetchAppointments({
        status: "", // Send empty string to API for all statuses
        search: "",
        page: 1,
        limit: 20,
      })
    );
  }, [dispatch]);

  // Only fetch when filters change after initial mount
  useEffect(() => {
    dispatch(
      fetchAppointments({
        status: filters.status === "All Status" ? "" : filters.status,
        search: filters.search,
        page: filters.page,
        limit: 20,
      })
    );
  }, [dispatch, filters.status, filters.search, filters.page]);

  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => {
        dispatch({ type: "appointments/clearSuccessMessage" });
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [successMessage, dispatch]);

  const handleFilterChange = (event) => {
    const { name, value } = event.target;
    setFilters((prev) => ({
      ...prev,
      [name]: value,
      page: 1, // Reset to first page when filters change
    }));
  };

  const handlePageChange = (event, value) => {
    setFilters((prev) => ({
      ...prev,
      page: value,
    }));
  };

  const handleCancelClick = (appointmentId) => {
    setDeleteDialog({
      open: true,
      appointmentId,
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
      case "scheduled":
        return "primary";
      case "completed":
        return "success";
      case "cancelled":
        return "error";
      default:
        return "default";
    }
  };

  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        return "Invalid Date";
      }
      return date.toLocaleDateString("en-US", {
        weekday: "short",
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    } catch (error) {
      console.error("Date formatting error:", error);
      return "Invalid Date";
    }
  };

  const filteredAppointments = appointments;

  return (
    <Box
      sx={{
        background: (theme) => theme.palette.background.gradient,
        minHeight: "100vh",
        px: 3,
        py: 4,
      }}
    >
      <Box sx={{ maxWidth: "1200px", mx: "auto" }}>
        <Box mb={6} textAlign="center">
          <Typography
            variant="h3"
            gutterBottom
            fontWeight="600"
            color="text.primary"
          >
            My Appointments
          </Typography>
          <Typography variant="h6" color="text.secondary" fontWeight="normal">
            View and manage your appointments
          </Typography>
        </Box>

        {error && error !== "Failed to fetch appointments" && (
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
        <Box
          sx={{
            background: "#fff",
            borderRadius: 3,
            p: 2,
            mb: 6,
            boxShadow: "0 4px 6px rgba(0, 0, 0, 0.02)",
            border: "1px solid rgba(226, 232, 240, 0.8)",
          }}
        >
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                name="search"
                placeholder="Search by doctor name or specialty..."
                value={filters.search}
                onChange={handleFilterChange}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon color="action" />
                    </InputAdornment>
                  ),
                }}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    backgroundColor: "#F8FAFC",
                  },
                }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                select
                fullWidth
                name="status"
                value={filters.status}
                onChange={handleFilterChange}
                displayEmpty
                placeholder="Filter by status"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <FilterIcon color="action" />
                    </InputAdornment>
                  ),
                }}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    backgroundColor: "#F8FAFC",
                  },
                }}
              >
                <MenuItem value="All Status">All Status</MenuItem>
                <MenuItem value="scheduled">Scheduled</MenuItem>
                <MenuItem value="completed">Completed</MenuItem>
                <MenuItem value="cancelled">Cancelled</MenuItem>
              </TextField>
            </Grid>
          </Grid>
        </Box>

        {/* Appointments List */}
        {loading ? (
          <Box display="flex" justifyContent="center" p={4}>
            <CircularProgress />
          </Box>
        ) : filteredAppointments.length > 0 ? (
          <Grid container spacing={3}>
            {[...filteredAppointments]
              .sort(
                (a, b) =>
                  new Date(b.appointmentDate) - new Date(a.appointmentDate)
              )
              .map((appointment) => (
                <Grid item xs={12} key={appointment._id}>
                  <Card
                    sx={{
                      p: 2,
                      transition:
                        "transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out",
                      "&:hover": {
                        transform: "translateY(-2px)",
                        boxShadow: "0 12px 20px rgba(0, 0, 0, 0.06)",
                      },
                    }}
                  >
                    <Grid container spacing={3} alignItems="center">
                      <Grid item xs={12} sm={4}>
                        <Box display="flex" gap={2} alignItems="center">
                          <Avatar
                            sx={{
                              width: 50,
                              height: 50,
                              bgcolor: "primary.light",
                              fontSize: "1.2rem",
                            }}
                          >
                            {appointment.doctor?.name?.charAt(0) || "?"}
                          </Avatar>
                          <Box>
                            <Typography variant="h6" fontWeight="600">
                              Dr. {appointment.doctor.name}
                            </Typography>
                            <Typography color="text.secondary" variant="body2">
                              {appointment.doctor.specialty}
                            </Typography>
                          </Box>
                        </Box>
                      </Grid>

                      <Grid item xs={12} sm={3}>
                        <Box>
                          <Typography
                            variant="body2"
                            color="text.secondary"
                            mb={0.5}
                          >
                            Date & Time
                          </Typography>
                          <Typography fontWeight="500">
                            {formatDate(appointment.appointmentDate)}
                          </Typography>
                          <Typography color="primary" fontWeight="500">
                            {appointment.timeSlot}
                          </Typography>
                        </Box>
                      </Grid>

                      <Grid item xs={12} sm={2}>
                        <Chip
                          label={appointment.status}
                          color={getStatusColor(appointment.status)}
                          sx={{
                            borderRadius: 2,
                            textTransform: "capitalize",
                            fontWeight: 500,
                          }}
                        />
                      </Grid>

                      <Grid item xs={12} sm={3}>
                        <Box display="flex" gap={1} justifyContent="flex-end">
                          <Button
                            variant="outlined"
                            size="small"
                            startIcon={<ViewIcon />}
                            onClick={() =>
                              navigate(`/appointments/${appointment._id}`)
                            }
                            sx={{ borderRadius: 2 }}
                          >
                            View
                          </Button>

                          {appointment.status === "scheduled" && (
                            <>
                              <Button
                                variant="outlined"
                                size="small"
                                startIcon={<EditIcon />}
                                onClick={() =>
                                  navigate(
                                    `/appointments/${appointment._id}/edit`
                                  )
                                }
                                sx={{ borderRadius: 2 }}
                              >
                                Edit
                              </Button>
                              <Button
                                variant="outlined"
                                size="small"
                                color="error"
                                startIcon={<DeleteIcon />}
                                onClick={() =>
                                  handleCancelClick(appointment._id)
                                }
                                sx={{ borderRadius: 2 }}
                              >
                                Cancel
                              </Button>
                            </>
                          )}
                        </Box>
                      </Grid>
                    </Grid>
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
              onClick={() => navigate("/doctors")}
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
              sx={{ "& .MuiPaginationItem-root": { borderRadius: 2 } }}
            />
          </Box>
        )}

        {/* Cancel Confirmation Dialog */}
        <Dialog
          open={deleteDialog.open}
          onClose={() => setDeleteDialog({ open: false, appointmentId: null })}
          PaperProps={{
            sx: {
              borderRadius: 3,
              boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
            },
          }}
        >
          <DialogTitle>Cancel Appointment</DialogTitle>
          <DialogContent>
            <Typography>
              Are you sure you want to cancel this appointment? This action
              cannot be undone.
            </Typography>
          </DialogContent>
          <DialogActions sx={{ p: 3 }}>
            <Button
              onClick={() =>
                setDeleteDialog({ open: false, appointmentId: null })
              }
              variant="outlined"
              sx={{ borderRadius: 2 }}
            >
              No, Keep It
            </Button>
            <Button
              onClick={handleConfirmCancel}
              color="error"
              variant="contained"
              sx={{ borderRadius: 2 }}
            >
              Yes, Cancel It
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Box>
  );
};

export default AppointmentList;
