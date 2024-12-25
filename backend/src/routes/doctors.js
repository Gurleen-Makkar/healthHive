const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const Doctor = require('../models/Doctor');

// Get all doctors with optional specialty filter
router.get('/', auth, async (req, res) => {
  try {
    const { specialty, page = 1, limit = 20 } = req.query;
    const query = specialty ? { specialty: new RegExp(specialty, 'i') } : {};

    // Implement pagination
    const options = {
      page: parseInt(page),
      limit: parseInt(limit),
      sort: { rating: -1 }, // Sort by rating in descending order
      select: '-schedule', // Exclude detailed schedule in list view
    };

    const doctors = await Doctor.find(query)
      .skip((options.page - 1) * options.limit)
      .limit(options.limit)
      .sort(options.sort)
      .select(options.select);

    const total = await Doctor.countDocuments(query);

    res.json({
      doctors,
      currentPage: options.page,
      totalPages: Math.ceil(total / options.limit),
      totalDoctors: total
    });
  } catch (error) {
    console.error('Get doctors error:', error);
    res.status(500).json({ message: 'Error fetching doctors' });
  }
});

// Get doctor by ID with full details including schedule
router.get('/:id', auth, async (req, res) => {
  try {
    const doctor = await Doctor.findById(req.params.id);
    if (!doctor) {
      return res.status(404).json({ message: 'Doctor not found' });
    }
    res.json(doctor);
  } catch (error) {
    console.error('Get doctor error:', error);
    res.status(500).json({ message: 'Error fetching doctor details' });
  }
});

// Get doctor's available time slots for a specific date
router.get('/:id/availability', auth, async (req, res) => {
  try {
    const { date } = req.query;
    if (!date) {
      return res.status(400).json({ message: 'Date parameter is required' });
    }

    const doctor = await Doctor.findById(req.params.id);
    if (!doctor) {
      return res.status(404).json({ message: 'Doctor not found' });
    }

    const dayOfWeek = new Date(date).toLocaleString('en-us', { weekday: 'long' });
    const daySchedule = doctor.schedule.find(s => s.day === dayOfWeek);

    if (!daySchedule || !daySchedule.isAvailable) {
      return res.json({
        available: false,
        message: 'Doctor is not available on this day'
      });
    }

    // Get all appointments for this doctor on the specified date
    const appointments = await require('../models/Appointment').find({
      doctor: doctor._id,
      appointmentDate: {
        $gte: new Date(date).setHours(0, 0, 0),
        $lt: new Date(date).setHours(23, 59, 59)
      },
      status: 'scheduled'
    }).select('timeSlot');

    // Format booked slots consistently
    const bookedSlots = appointments.map(apt => {
      return new Date(`2000-01-01 ${apt.timeSlot}`)
        .toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit',
          hour12: true
        })
        .replace(/\s+/g, ' ');
    });

    console.log('Booked slots:', bookedSlots);

    // Generate available time slots
    const allSlots = generateTimeSlots(daySchedule.startTime, daySchedule.endTime, 30);
    console.log('All slots:', allSlots);

    const availableSlots = allSlots.filter(slot => !bookedSlots.includes(slot));
    console.log('Available slots:', availableSlots);

    res.json({
      available: true,
      date,
      doctorId: doctor._id,
      availableSlots
    });
  } catch (error) {
    console.error('Get availability error:', error);
    res.status(500).json({ message: 'Error fetching doctor availability' });
  }
});

// Helper function to convert time to minutes since midnight
function timeToMinutes(timeStr) {
  // Parse time in both 24-hour and 12-hour formats
  let hours, minutes;
  if (timeStr.includes('AM') || timeStr.includes('PM')) {
    // 12-hour format (e.g., "9:00 AM")
    const [time, period] = timeStr.split(' ');
    [hours, minutes] = time.split(':').map(Number);
    if (period === 'PM' && hours !== 12) hours += 12;
    if (period === 'AM' && hours === 12) hours = 0;
  } else {
    // 24-hour format (e.g., "09:00")
    [hours, minutes] = timeStr.split(':').map(Number);
  }
  return hours * 60 + minutes;
}

// Helper function to generate time slots
function generateTimeSlots(startTime, endTime, duration) {
  try {
    console.log('Generating slots for:', { startTime, endTime, duration });
    
    const slots = [];
    const startMinutes = timeToMinutes(startTime);
    const endMinutes = timeToMinutes(endTime);
    
    console.log('Time in minutes:', { startMinutes, endMinutes });
    
    let currentMinutes = startMinutes;
    while (currentMinutes + duration <= endMinutes) {  // Ensure the full slot duration fits
      const hour = Math.floor(currentMinutes / 60);
      const minute = currentMinutes % 60;
      
      // Create a consistent date object for the time
      const time = new Date(2000, 0, 1, hour, minute);
      
      // Format time consistently
      const formattedTime = time.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      }).replace(/\s+/g, ' '); // Normalize spaces between time and AM/PM
      
      console.log('Generated slot:', formattedTime);
      slots.push(formattedTime);
      currentMinutes += duration;
    }
    
    return slots;
  } catch (error) {
    console.error('Error generating time slots:', error);
    return [];
  }
}

// Get list of all specialties
router.get('/specialties/list', auth, async (req, res) => {
  try {
    const specialties = await Doctor.distinct('specialty');
    res.json(specialties);
  } catch (error) {
    console.error('Get specialties error:', error);
    res.status(500).json({ message: 'Error fetching specialties' });
  }
});

module.exports = router;
