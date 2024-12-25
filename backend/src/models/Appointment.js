const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  doctor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Doctor',
    required: true
  },
  appointmentDate: {
    type: Date,
    required: true
  },
  timeSlot: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['scheduled', 'completed', 'cancelled'],
    default: 'scheduled'
  },
  symptoms: {
    type: String,
    required: true
  },
  notes: {
    type: String
  },
  consultationFee: {
    type: Number,
    required: true
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'completed'],
    default: 'pending'
  }
}, {
  timestamps: true
});

// Indexes for efficient querying
appointmentSchema.index({ user: 1, appointmentDate: 1 });
appointmentSchema.index({ doctor: 1, appointmentDate: 1 });

// Validate that appointment date is not in the past
appointmentSchema.pre('save', function(next) {
  const appointmentDate = new Date(this.appointmentDate);
  const today = new Date();
  // Set both dates to start of day for comparison
  appointmentDate.setHours(0, 0, 0, 0);
  today.setHours(0, 0, 0, 0);
  
  if (appointmentDate < today) {
    next(new Error('Appointment date cannot be in the past'));
  }
  next();
});

// Static method to check for conflicting appointments
appointmentSchema.statics.checkConflict = async function(doctorId, appointmentDate, timeSlot, excludeAppointmentId = null) {
  // Set the time to start of day for date comparison
  const dateToCheck = new Date(appointmentDate);
  dateToCheck.setHours(0, 0, 0, 0);

  // Format time slot consistently
  const formatTime = (timeStr) => {
    return new Date(`2000-01-01 ${timeStr}`)
      .toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      })
      .replace(/\s+/g, ' ');
  };

  const formattedTimeSlot = formatTime(timeSlot);

  console.log('Checking conflict with:', {
    doctorId,
    dateToCheck,
    timeSlot,
    formattedTimeSlot,
    excludeAppointmentId
  });

  // Find any appointments on the same date and format their time slots
  const sameTimeAppointments = await this.find({
    doctor: doctorId,
    appointmentDate: dateToCheck,
    status: 'scheduled',
    ...(excludeAppointmentId && { _id: { $ne: excludeAppointmentId } })
  });

  // Check if any existing appointment has the same formatted time slot
  const hasConflict = sameTimeAppointments.some(apt => {
    const existingSlot = formatTime(apt.timeSlot);
    console.log('Comparing slots:', { new: formattedTimeSlot, existing: existingSlot });
    return existingSlot === formattedTimeSlot;
  });

  console.log('Conflict check result:', hasConflict);
  return hasConflict;
};

// Method to cancel appointment
appointmentSchema.methods.cancelAppointment = async function() {
  this.status = 'cancelled';
  return this.save();
};

module.exports = mongoose.model('Appointment', appointmentSchema);
