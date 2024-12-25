const mongoose = require('mongoose');
const Doctor = require('../models/Doctor');
const dotenv = require('dotenv');

// Load environment variables
const path = require('path');
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch((err) => console.error('MongoDB connection error:', err));

// Helper function to generate schedule
const generateSchedule = (startTime, endTime) => {
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
  return days.map(day => ({
    day,
    startTime,
    endTime,
    isAvailable: true
  }));
};

const doctors = [
  // Morning shift doctors
  {
    name: 'John Smith',
    specialty: 'Cardiologist',
    qualification: 'MD, FACC',
    experience: 15,
    consultationFee: 150,
    about: 'Experienced cardiologist specializing in heart diseases and preventive care.',
    schedule: generateSchedule('09:00 AM', '05:00 PM')
  },
  {
    name: 'Sarah Johnson',
    specialty: 'Pediatrician',
    qualification: 'MD, FAAP',
    experience: 12,
    consultationFee: 120,
    about: 'Dedicated pediatrician with expertise in child healthcare and development.',
    schedule: generateSchedule('08:00 AM', '04:00 PM')
  },
  {
    name: 'Michael Chen',
    specialty: 'Dermatologist',
    qualification: 'MD, FAAD',
    experience: 10,
    consultationFee: 140,
    about: 'Expert dermatologist specializing in skin conditions and cosmetic procedures.',
    schedule: generateSchedule('10:00 AM', '06:00 PM')
  },
  // Afternoon shift doctors
  {
    name: 'Emily Brown',
    specialty: 'Neurologist',
    qualification: 'MD, PhD',
    experience: 14,
    consultationFee: 160,
    about: 'Specialized in treating neurological disorders with a research background.',
    schedule: generateSchedule('12:00 PM', '08:00 PM')
  },
  {
    name: 'David Wilson',
    specialty: 'Orthopedic',
    qualification: 'MD, FAAOS',
    experience: 16,
    consultationFee: 145,
    about: 'Expert in treating musculoskeletal conditions and sports injuries.',
    schedule: generateSchedule('11:00 AM', '07:00 PM')
  },
  {
    name: 'Lisa Anderson',
    specialty: 'Psychiatrist',
    qualification: 'MD, FAPA',
    experience: 11,
    consultationFee: 170,
    about: 'Specializing in mental health and cognitive behavioral therapy.',
    schedule: generateSchedule('01:00 PM', '09:00 PM')
  },
  // More morning shift doctors
  {
    name: 'Robert Taylor',
    specialty: 'ENT Specialist',
    qualification: 'MD, FACS',
    experience: 13,
    consultationFee: 130,
    about: 'Expert in treating ear, nose, and throat conditions.',
    schedule: generateSchedule('09:00 AM', '05:00 PM')
  },
  {
    name: 'Maria Garcia',
    specialty: 'Gynecologist',
    qualification: 'MD, FACOG',
    experience: 15,
    consultationFee: 155,
    about: 'Specialized in women\'s health and reproductive medicine.',
    schedule: generateSchedule('08:00 AM', '04:00 PM')
  },
  {
    name: 'James Lee',
    specialty: 'Ophthalmologist',
    qualification: 'MD, FAAO',
    experience: 12,
    consultationFee: 135,
    about: 'Expert in treating eye conditions and vision care.',
    schedule: generateSchedule('10:00 AM', '06:00 PM')
  },
  // More afternoon shift doctors
  {
    name: 'Patricia Moore',
    specialty: 'Endocrinologist',
    qualification: 'MD, FACE',
    experience: 14,
    consultationFee: 165,
    about: 'Specialized in hormone-related conditions and diabetes care.',
    schedule: generateSchedule('12:00 PM', '08:00 PM')
  }
];

// Seed function
const seedDoctors = async () => {
  try {
    // Clear existing doctors
    await Doctor.deleteMany({});
    console.log('Cleared existing doctors');

    // Insert new doctors
    const createdDoctors = await Doctor.insertMany(doctors);
    console.log(`Added ${createdDoctors.length} doctors`);

    // Close connection
    await mongoose.connection.close();
    console.log('Database connection closed');
  } catch (error) {
    console.error('Error seeding doctors:', error);
    process.exit(1);
  }
};

// Run the seed function
seedDoctors();
