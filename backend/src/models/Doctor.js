const mongoose = require('mongoose');

const scheduleSchema = new mongoose.Schema({
  day: {
    type: String,
    enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
    required: true
  },
  startTime: {
    type: String,
    required: true
  },
  endTime: {
    type: String,
    required: true
  },
  isAvailable: {
    type: Boolean,
    default: true
  }
});

const doctorSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  specialty: {
    type: String,
    required: true,
    trim: true
  },
  qualification: {
    type: String,
    required: true
  },
  experience: {
    type: Number,
    required: true,
    min: 0
  },
  profileImage: {
    type: String,
    default: 'default-doctor.png'
  },
  schedule: [scheduleSchema],
  consultationFee: {
    type: Number,
    required: true,
    min: 0
  },
  rating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5
  },
  about: {
    type: String,
    required: true
  },
  isAvailable: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Method to check doctor's availability for a specific date and time
doctorSchema.methods.isTimeSlotAvailable = async function(date, timeSlot) {
  console.log('Checking availability for:', { date, timeSlot });
  
  const dayOfWeek = new Date(date).toLocaleString('en-us', { weekday: 'long' });
  const daySchedule = this.schedule.find(s => s.day === dayOfWeek);
  
  console.log('Day schedule:', daySchedule);
  
  if (!daySchedule || !daySchedule.isAvailable) {
    console.log('Day not available');
    return false;
  }

  // Format all times consistently before comparison
  const formatTime = (timeStr) => {
    return new Date(`2000-01-01 ${timeStr}`)
      .toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      })
      .replace(/\s+/g, ' ');
  };

  const formattedSlot = formatTime(timeSlot);
  const formattedStart = formatTime(daySchedule.startTime);
  const formattedEnd = formatTime(daySchedule.endTime);

  console.log('Formatted times:', {
    slot: formattedSlot,
    start: formattedStart,
    end: formattedEnd
  });

  // Convert formatted times to minutes for comparison
  const convertTimeToMinutes = (timeStr) => {
    const [time, period] = timeStr.split(' ');
    let [hours, minutes] = time.split(':').map(Number);
    if (period === 'PM' && hours !== 12) hours += 12;
    if (period === 'AM' && hours === 12) hours = 0;
    return hours * 60 + minutes;
  };

  const slotMinutes = convertTimeToMinutes(formattedSlot);
  const startMinutes = convertTimeToMinutes(formattedStart);
  const endMinutes = convertTimeToMinutes(formattedEnd);

  console.log('Time comparison:', {
    slotMinutes,
    startMinutes,
    endMinutes
  });

  // Check if time slot is within working hours
  if (slotMinutes < startMinutes || slotMinutes > endMinutes) {
    console.log('Time slot outside working hours');
    return false;
  }

  return true;
};

module.exports = mongoose.model('Doctor', doctorSchema);
