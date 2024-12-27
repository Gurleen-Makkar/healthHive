import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Helper function to set auth header
const getAuthHeader = () => ({
  headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
});

// Async thunks
export const fetchAppointments = createAsyncThunk(
  'appointments/fetchAppointments',
  async ({ status, search, page = 1, limit = 10 }, { rejectWithValue }) => {
    try {
      const params = new URLSearchParams({
        page,
        limit,
        ...(status && { status }),
        ...(search && { search })
      });

      console.log('Fetching appointments with params:', Object.fromEntries(params));

      const response = await axios.get(
        `${API_URL}/appointments?${params}`,
        getAuthHeader()
      );
      
      console.log('Appointments response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error fetching appointments:', error.response?.data);
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch appointments');
    }
  }
);

export const fetchAppointmentDetails = createAsyncThunk(
  'appointments/fetchAppointmentDetails',
  async (appointmentId, { rejectWithValue }) => {
    try {
      const response = await axios.get(
        `${API_URL}/appointments/${appointmentId}`,
        getAuthHeader()
      );
      
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch appointment details');
    }
  }
);

export const createAppointment = createAsyncThunk(
  'appointments/createAppointment',
  async (appointmentData, { rejectWithValue }) => {
    try {
      const response = await axios.post(
        `${API_URL}/appointments`,
        appointmentData,
        getAuthHeader()
      );
      
      return response.data;
    } catch (error) {
      console.error('Create appointment error:', error.response?.data);
      return rejectWithValue(error.response?.data || { message: 'Failed to create appointment' });
    }
  }
);

export const updateAppointment = createAsyncThunk(
  'appointments/updateAppointment',
  async ({ appointmentId, updateData }, { rejectWithValue }) => {
    try {
      const response = await axios.put(
        `${API_URL}/appointments/${appointmentId}`,
        updateData,
        getAuthHeader()
      );
      
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update appointment');
    }
  }
);

export const cancelAppointment = createAsyncThunk(
  'appointments/cancelAppointment',
  async (appointmentId, { rejectWithValue }) => {
    try {
      const response = await axios.delete(
        `${API_URL}/appointments/${appointmentId}`,
        getAuthHeader()
      );
      
      return { appointmentId, ...response.data };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to cancel appointment');
    }
  }
);

// Slice
const appointmentsSlice = createSlice({
  name: 'appointments',
  initialState: {
    list: [],
    currentAppointment: null,
    pagination: {
      currentPage: 1,
      totalPages: 1,
      totalAppointments: 0
    },
    loading: false,
    bookingLoading: false,
    error: null,
    successMessage: null
  },
  reducers: {
    clearCurrentAppointment: (state) => {
      state.currentAppointment = null;
    },
    clearError: (state) => {
      state.error = null;
    },
    clearSuccessMessage: (state) => {
      state.successMessage = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch Appointments
      .addCase(fetchAppointments.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAppointments.fulfilled, (state, action) => {
        state.loading = false;
        state.list = action.payload.appointments;
        state.pagination = {
          currentPage: action.payload.currentPage,
          totalPages: action.payload.totalPages,
          totalAppointments: action.payload.totalAppointments
        };
      })
      .addCase(fetchAppointments.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch Appointment Details
      .addCase(fetchAppointmentDetails.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAppointmentDetails.fulfilled, (state, action) => {
        state.loading = false;
        state.currentAppointment = action.payload;
      })
      .addCase(fetchAppointmentDetails.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Create Appointment
      .addCase(createAppointment.pending, (state) => {
        state.loading = true;
        state.bookingLoading = true;
        state.error = null;
        state.successMessage = null;
      })
      .addCase(createAppointment.fulfilled, (state, action) => {
        state.loading = false;
        state.bookingLoading = false;
        state.list = [action.payload.appointment, ...state.list];
        state.successMessage = 'Appointment booked successfully';
      })
      .addCase(createAppointment.rejected, (state, action) => {
        state.loading = false;
        state.bookingLoading = false;
        // Handle validation errors
        if (action.payload?.errors) {
          state.error = action.payload.errors.map(err => err.msg).join(', ');
        } else if (action.payload?.details) {
          // Handle detailed error messages
          state.error = `${action.payload.message}\n${action.payload.details}`;
        } else {
          state.error = action.payload?.message || 'Failed to create appointment';
        }
      })
      // Update Appointment
      .addCase(updateAppointment.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.successMessage = null;
      })
      .addCase(updateAppointment.fulfilled, (state, action) => {
        state.loading = false;
        state.list = state.list.map(appointment =>
          appointment._id === action.payload.appointment._id
            ? action.payload.appointment
            : appointment
        );
        state.currentAppointment = action.payload.appointment;
        state.successMessage = 'Appointment updated successfully';
      })
      .addCase(updateAppointment.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Cancel Appointment
      .addCase(cancelAppointment.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.successMessage = null;
      })
      .addCase(cancelAppointment.fulfilled, (state, action) => {
        state.loading = false;
        state.list = state.list.map(appointment => 
          appointment._id === action.payload.appointmentId 
            ? { ...appointment, status: 'cancelled' }
            : appointment
        );
        state.successMessage = 'Appointment cancelled successfully';
      })
      .addCase(cancelAppointment.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  }
});

export const {
  clearCurrentAppointment,
  clearError,
  clearSuccessMessage
} = appointmentsSlice.actions;

export default appointmentsSlice.reducer;
