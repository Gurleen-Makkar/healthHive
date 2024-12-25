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
    specialty: '',
    search: '',
    page: 1
  });

  useEffect(() => {
    dispatch(fetchSpecialties());
  }, [dispatch]);

  useEffect(() => {
    dispatch(fetchDoctors({
      specialty: filters.specialty,
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
    <Box>
      {/* Header */}
      <Box mb={4}>
        <Typography variant="h4" gutterBottom>
          Find a Doctor
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Book appointments with qualified healthcare providers
        </Typography>
      </Box>

      {/* Filters */}
      <Grid container spacing={2} mb={4}>
        <Grid item xs={12} sm={6} md={4}>
          <TextField
            fullWidth
            name="search"
            placeholder="Search by name or specialty"
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
            name="specialty"
            label="Specialty"
            value={filters.specialty}
            onChange={handleFilterChange}
          >
            <MenuItem value="">All Specialties</MenuItem>
            {specialties.map((specialty) => (
              <MenuItem key={specialty} value={specialty}>
                {specialty}
              </MenuItem>
            ))}
          </TextField>
        </Grid>
      </Grid>

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
                <Card>
                  <CardContent>
                    <Box display="flex" flexDirection="column" alignItems="center" mb={2}>
                      <Avatar
                        sx={{ 
                          width: 100, 
                          height: 100, 
                          mb: 2,
                          bgcolor: 'primary.main',
                          fontSize: '2.5rem'
                        }}
                      >
                        {doctor.name.charAt(0)}
                      </Avatar>
                      <Typography variant="h6" align="center" gutterBottom>
                        Dr. {doctor.name}
                      </Typography>
                      <Chip
                        label={doctor.specialty}
                        color="primary"
                        size="small"
                        sx={{ mb: 1 }}
                      />
                      <Rating
                        value={doctor.rating}
                        readOnly
                        size="small"
                        precision={0.5}
                      />
                    </Box>

                    <Box display="flex" alignItems="center" gap={1} mb={1}>
                      <AccessTimeIcon color="action" fontSize="small" />
                      <Typography variant="body2" color="text.secondary">
                        {doctor.experience} years experience
                      </Typography>
                    </Box>

                    <Box display="flex" alignItems="center" gap={1}>
                      <LocationIcon color="action" fontSize="small" />
                      <Typography variant="body2" color="text.secondary">
                        Consultation Fee: ${doctor.consultationFee}
                      </Typography>
                    </Box>
                  </CardContent>

                  <CardActions>
                    <Button
                      fullWidth
                      variant="contained"
                      onClick={() => navigate(`/doctors/${doctor._id}`)}
                    >
                      View Profile & Book
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
  );
};

export default DoctorList;
