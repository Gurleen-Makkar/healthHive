import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchDoctors, fetchSpecialties } from '../../store/slices/doctorsSlice';
import {
  Box,
  Grid,
  Card,
  CardContent,
  CardActions,
  Typography,
  Button,
  TextField,
  MenuItem,
  Avatar,
  Chip,
  Pagination,
  CircularProgress,
  Rating,
  InputAdornment
} from '@mui/material';
import {
  Search as SearchIcon,
  LocationOn as LocationIcon,
  AccessTime as AccessTimeIcon
} from '@mui/icons-material';

const DoctorList = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const {
    list: doctors,
    specialties,
    pagination,
    loading
  } = useSelector(state => state.doctors);

  const [filters, setFilters] = useState({
    specialty: 'All Specialties',
    search: '',
    page: 1
  });

  useEffect(() => {
    dispatch(fetchSpecialties());
    // Fetch doctors with default filters on mount
    dispatch(fetchDoctors({
      specialty: '', // Send empty string to API for all specialties
      page: 1,
      limit: 8
    }));
  }, [dispatch]);

  // Only fetch when filters change after initial mount
  useEffect(() => {
    dispatch(fetchDoctors({
      specialty: filters.specialty === 'All Specialties' ? '' : filters.specialty,
      page: filters.page,
      limit: 8
    }));
  }, [dispatch, filters.specialty, filters.page]);

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

  const filteredDoctors = doctors.filter(doctor =>
    doctor.name.toLowerCase().includes(filters.search.toLowerCase()) ||
    doctor.specialty.toLowerCase().includes(filters.search.toLowerCase())
  );

  return (
    <Box sx={{ 
      background: theme => theme.palette.background.gradient,
      minHeight: '100vh',
      px: 3,
      py: 4 
    }}>
      <Box sx={{ maxWidth: "1200px", mx: "auto" }}>
        {/* Header */}
        <Box mb={6} textAlign="center">
          <Typography variant="h3" gutterBottom fontWeight="600" color="text.primary">
            Find a Doctor
          </Typography>
          <Typography variant="h6" color="text.secondary" fontWeight="normal">
            Book appointments with qualified healthcare providers
          </Typography>
        </Box>

        {/* Filters */}
        <Box sx={{
          background: '#fff',
          borderRadius: 3,
          p: 2,
          mb: 6,
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.02)',
          border: '1px solid rgba(226, 232, 240, 0.8)',
        }}>
          <Grid container spacing={2}>
            <Grid item xs={12} md={8}>
              <TextField
                fullWidth
                name="search"
                placeholder="Search doctors by name or specialty..."
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
                  '& .MuiOutlinedInput-root': {
                    backgroundColor: '#F8FAFC',
                  }
                }}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                select
                fullWidth
                name="specialty"
                value={filters.specialty}
                onChange={handleFilterChange}
                displayEmpty
                SelectProps={{
                  displayEmpty: true,
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    backgroundColor: '#F8FAFC',
                  }
                }}
              >
                <MenuItem value="All Specialties">All Specialties</MenuItem>
                {specialties.map((specialty) => (
                  <MenuItem key={specialty} value={specialty}>
                    {specialty}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
          </Grid>
        </Box>

        {/* Doctor List */}
        {loading ? (
        <Box display="flex" justifyContent="center" p={4}>
          <CircularProgress />
        </Box>
      ) : (
        <>
          <Grid container spacing={3}>
            {filteredDoctors.map((doctor) => (
              <Grid item xs={12} sm={6} md={4} lg={3} key={doctor._id}>
                <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                  <CardContent sx={{ flex: 1, p: 3 }}>
                    <Box display="flex" gap={3}>
                      <Avatar
                        sx={{ 
                          width: 80, 
                          height: 80,
                          bgcolor: 'primary.light',
                          fontSize: '2rem',
                          border: '4px solid',
                          borderColor: 'primary.lighter'
                        }}
                      >
                        {doctor.name.charAt(0)}
                      </Avatar>
                      <Box>
                        <Typography variant="h6" gutterBottom fontWeight="600">
                          Dr. {doctor.name}
                        </Typography>
                        <Chip
                          label={doctor.specialty}
                          color="primary"
                          size="small"
                          sx={{ mb: 1, borderRadius: 1.5 }}
                        />
                        <Box display="flex" alignItems="center" gap={0.5}>
                          <Rating
                            value={doctor.rating}
                            readOnly
                            size="small"
                            precision={0.5}
                          />
                          <Typography variant="body2" color="text.secondary">
                            ({doctor.rating})
                          </Typography>
                        </Box>
                      </Box>
                    </Box>

                    <Box sx={{ mt: 3 }}>
                      <Box display="flex" alignItems="center" gap={1} mb={1.5}>
                        <AccessTimeIcon color="primary" fontSize="small" />
                        <Typography variant="body2">
                          {doctor.experience} years experience
                        </Typography>
                      </Box>

                      <Box display="flex" alignItems="center" gap={1} mb={1.5}>
                        <LocationIcon color="primary" fontSize="small" />
                        <Typography variant="body2">
                          Consultation Fee: ₹{doctor.consultationFee}
                        </Typography>
                      </Box>

                      <Typography variant="body2" color="text.secondary" mt={2}>
                        Available on
                      </Typography>
                      <Box display="flex" gap={1} mt={1}>
                        {['Monday', 'Wednesday', 'Friday'].map(day => (
                          <Chip
                            key={day}
                            label={day.slice(0, 3)}
                            size="small"
                            variant="outlined"
                            sx={{ 
                              borderRadius: 1,
                              bgcolor: 'background.paper',
                              borderColor: 'primary.light'
                            }}
                          />
                        ))}
                      </Box>
                    </Box>
                  </CardContent>

                  <CardActions sx={{ p: 3, pt: 0 }}>
                    <Button
                      fullWidth
                      variant="contained"
                      onClick={() => navigate(`/doctors/${doctor._id}`)}
                      sx={{ 
                        py: 1,
                        fontWeight: 600
                      }}
                    >
                      Book Appointment
                    </Button>
                  </CardActions>
                </Card>
              </Grid>
            ))}
          </Grid>

          {/* Pagination */}
          {filteredDoctors.length > 0 ? (
            <Box display="flex" justifyContent="center" mt={4}>
              <Pagination
                count={pagination.totalPages}
                page={filters.page}
                onChange={handlePageChange}
                color="primary"
              />
            </Box>
          ) : (
            <Box textAlign="center" py={4}>
              <Typography color="text.secondary">
                No doctors found matching your criteria
              </Typography>
            </Box>
          )}
        </>
      )}
      </Box>
    </Box>
  );
};

export default DoctorList;
