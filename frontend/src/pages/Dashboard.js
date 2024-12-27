import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { fetchAppointments } from "../store/slices/appointmentsSlice";
import {
  Box,
  Grid,
  Paper,
  Typography,
  Button,
  Card,
  CardContent,
  CardActions,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Chip,
  CircularProgress,
} from "@mui/material";
import {
  Add as AddIcon,
  Event as EventIcon,
  Search as SearchIcon,
  ArrowForward as ArrowForwardIcon,
} from "@mui/icons-material";

const Dashboard = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { list: appointments, loading } = useSelector(
    (state) => state.appointments
  );

  useEffect(() => {
    dispatch(
      fetchAppointments({
        status: "scheduled",
        page: 1,
        limit: 5,
      })
    );
  }, [dispatch]);

  useEffect(() => {
    console.log("Current appointments:", appointments);
  }, [appointments]);

  // Get upcoming appointments (next 5)
  const upcomingAppointments = appointments
    .filter(apt => {
      // Only include appointments that have complete data
      if (!apt.doctor || !apt.doctor.name || !apt.appointmentDate) {
        return false;
      }
      const aptDate = new Date(apt.appointmentDate);
      const now = new Date();
      // Set both dates to start of day for comparison
      aptDate.setHours(0, 0, 0, 0);
      now.setHours(0, 0, 0, 0);
      return aptDate >= now;
    })
    .sort((a, b) => new Date(a.appointmentDate) - new Date(b.appointmentDate));

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

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const formatTime = (time) => {
    return time; // You might want to format this based on your time format
  };

  return (
    <Box>
      {/* Welcome Section */}
      <Box mb={4}>
        <Typography variant="h4" gutterBottom>
          Welcome back, {user?.username}!
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Here's an overview of your appointments and quick actions
        </Typography>
      </Box>

      {/* Quick Actions */}
      <Grid container spacing={3} mb={4}>
        <Grid item xs={12} sm={6} md={4}>
          <Paper
            sx={{
              p: 3,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              cursor: "pointer",
              "&:hover": { bgcolor: "action.hover" },
            }}
            onClick={() => navigate("/doctors")}
          >
            <SearchIcon sx={{ fontSize: 40, color: "primary.main", mb: 1 }} />
            <Typography variant="h6" gutterBottom>
              Find Doctors
            </Typography>
            <Typography variant="body2" color="text.secondary" align="center">
              Search and book appointments with healthcare providers
            </Typography>
          </Paper>
        </Grid>

        <Grid item xs={12} sm={6} md={4}>
          <Paper
            sx={{
              p: 3,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              cursor: "pointer",
              "&:hover": { bgcolor: "action.hover" },
            }}
            onClick={() => navigate("/appointments")}
          >
            <EventIcon sx={{ fontSize: 40, color: "primary.main", mb: 1 }} />
            <Typography variant="h6" gutterBottom>
              My Appointments
            </Typography>
            <Typography variant="body2" color="text.secondary" align="center">
              View and manage your appointments
            </Typography>
          </Paper>
        </Grid>
      </Grid>

      {/* Upcoming Appointments */}
      <Card>
        <CardContent>
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
            mb={2}
          >
            <Typography variant="h6">Upcoming Appointments</Typography>
            <Button
              variant="outlined"
              startIcon={<AddIcon />}
              onClick={() => navigate("/doctors")}
            >
              Book New
            </Button>
          </Box>

          <Divider />

          {loading ? (
            <Box display="flex" justifyContent="center" p={3}>
              <CircularProgress />
            </Box>
          ) : upcomingAppointments.length > 0 ? (
            <List>
              {upcomingAppointments.map((appointment) => (
                <React.Fragment key={appointment._id}>
                  <ListItem>
                    <ListItemText
                      primary={
                        <Typography variant="subtitle1">
                          Dr. {appointment.doctor.name}
                        </Typography>
                      }
                      secondary={
                        <Box>
                          <Typography variant="body2" color="text.secondary">
                            {formatDate(appointment.appointmentDate)} at{" "}
                            {formatTime(appointment.timeSlot)}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {appointment.doctor.specialty}
                          </Typography>
                        </Box>
                      }
                    />
                    <ListItemSecondaryAction>
                      <Box display="flex" alignItems="center" gap={1}>
                        <Chip
                          size="small"
                          label={appointment.status}
                          color={getStatusColor(appointment.status)}
                        />
                        <IconButton
                          edge="end"
                          onClick={() =>
                            navigate(`/appointments/${appointment._id}`)
                          }
                        >
                          <ArrowForwardIcon />
                        </IconButton>
                      </Box>
                    </ListItemSecondaryAction>
                  </ListItem>
                  <Divider />
                </React.Fragment>
              ))}
            </List>
          ) : (
            <Box py={3} textAlign="center">
              <Typography color="text.secondary">
                No upcoming appointments
              </Typography>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                sx={{ mt: 2 }}
                onClick={() => navigate("/doctors")}
              >
                Book Your First Appointment
              </Button>
            </Box>
          )}
        </CardContent>
        <CardActions>
          <Button
            fullWidth
            onClick={() => navigate("/appointments")}
            endIcon={<ArrowForwardIcon />}
          >
            View All Appointments
          </Button>
        </CardActions>
      </Card>
    </Box>
  );
};

export default Dashboard;
