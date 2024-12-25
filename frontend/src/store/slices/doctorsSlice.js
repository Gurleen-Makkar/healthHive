import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Helper function to set auth header
const getAuthHeader = () => ({
  headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
});

// Async thunks
export const fetchDoctors = createAsyncThunk(
  'doctors/fetchDoctors',
  async ({ specialty, page = 1, limit = 10 }, { rejectWithValue }) => {
    try {
      const params = new URLSearchParams({
        page,
        limit,
        ...(specialty && { specialty })
      });

      const response = await axios.get(
        `${API_URL}/doctors?${params}`,
        getAuthHeader()
      );
      
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch doctors');
    }
  }
);

export const fetchDoctorDetails = createAsyncThunk(
  'doctors/fetchDoctorDetails',
  async (doctorId, { rejectWithValue }) => {
    try {
      const response = await axios.get(
        `${API_URL}/doctors/${doctorId}`,
        getAuthHeader()
      );
      
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch doctor details');
    }
  }
);

export const fetchDoctorAvailability = createAsyncThunk(
  'doctors/fetchDoctorAvailability',
  async ({ doctorId, date }, { rejectWithValue }) => {
    try {
      const response = await axios.get(
        `${API_URL}/doctors/${doctorId}/availability`,
        {
          ...getAuthHeader(),
          params: { date }
        }
      );
      
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch availability');
    }
  }
);

export const fetchSpecialties = createAsyncThunk(
  'doctors/fetchSpecialties',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(
        `${API_URL}/doctors/specialties/list`,
        getAuthHeader()
      );
      
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch specialties');
    }
  }
);

// Slice
const doctorsSlice = createSlice({
  name: 'doctors',
  initialState: {
    list: [],
    currentDoctor: null,
    specialties: [],
    availability: null,
    pagination: {
      currentPage: 1,
      totalPages: 1,
      totalDoctors: 0
    },
    loading: false,
    error: null
  },
  reducers: {
    clearDoctorDetails: (state) => {
      state.currentDoctor = null;
    },
    clearAvailability: (state) => {
      state.availability = null;
    },
    clearError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch Doctors
      .addCase(fetchDoctors.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDoctors.fulfilled, (state, action) => {
        state.loading = false;
        state.list = action.payload.doctors;
        state.pagination = {
          currentPage: action.payload.currentPage,
          totalPages: action.payload.totalPages,
          totalDoctors: action.payload.totalDoctors
        };
      })
      .addCase(fetchDoctors.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch Doctor Details
      .addCase(fetchDoctorDetails.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDoctorDetails.fulfilled, (state, action) => {
        state.loading = false;
        state.currentDoctor = action.payload;
      })
      .addCase(fetchDoctorDetails.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch Doctor Availability
      .addCase(fetchDoctorAvailability.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDoctorAvailability.fulfilled, (state, action) => {
        state.loading = false;
        state.availability = action.payload;
      })
      .addCase(fetchDoctorAvailability.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch Specialties
      .addCase(fetchSpecialties.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSpecialties.fulfilled, (state, action) => {
        state.loading = false;
        state.specialties = action.payload;
      })
      .addCase(fetchSpecialties.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  }
});

export const { clearDoctorDetails, clearAvailability, clearError } = doctorsSlice.actions;

export default doctorsSlice.reducer;
