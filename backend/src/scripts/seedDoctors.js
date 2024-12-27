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
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  return days.map(day => ({
    day,
    startTime,
    endTime,
    isAvailable: true
  }));
};

// Helper function to generate random rating between 4.0 and 5.0
const generateRating = () => {
  return (4 + Math.random()).toFixed(1);
};

const doctors = [
  {
    name: 'Rajesh Kumar',
    specialty: 'Cardiologist',
    qualification: 'MBBS, DM (Cardiology)',
    experience: 15,
    consultationFee: 1500,
    rating: generateRating(),
    about: 'Experienced cardiologist specializing in heart diseases and preventive care.',
    schedule: generateSchedule('09:00 AM', '05:00 PM')
  },
  {
    name: 'Priya Sharma',
    specialty: 'Pediatrician',
    qualification: 'MBBS, MD (Pediatrics)',
    experience: 12,
    consultationFee: 1200,
    rating: generateRating(),
    about: 'Dedicated pediatrician with expertise in child healthcare and development.',
    schedule: generateSchedule('08:00 AM', '04:00 PM')
  },
  {
    name: 'Amit Patel',
    specialty: 'Dermatologist',
    qualification: 'MBBS, MD (Dermatology)',
    experience: 10,
    consultationFee: 1400,
    rating: generateRating(),
    about: 'Expert dermatologist specializing in skin conditions and cosmetic procedures.',
    schedule: generateSchedule('10:00 AM', '06:00 PM')
  },
  {
    name: 'Deepa Gupta',
    specialty: 'Neurologist',
    qualification: 'MBBS, DM (Neurology)',
    experience: 14,
    consultationFee: 1600,
    rating: generateRating(),
    about: 'Specialized in treating neurological disorders with extensive research experience.',
    schedule: generateSchedule('12:00 PM', '08:00 PM')
  },
  {
    name: 'Suresh Verma',
    specialty: 'Orthopedic',
    qualification: 'MBBS, MS (Ortho)',
    experience: 16,
    consultationFee: 1450,
    rating: generateRating(),
    about: 'Expert in treating musculoskeletal conditions and sports injuries.',
    schedule: generateSchedule('11:00 AM', '07:00 PM')
  },
  {
    name: 'Anjali Desai',
    specialty: 'Psychiatrist',
    qualification: 'MBBS, MD (Psychiatry)',
    experience: 11,
    consultationFee: 1700,
    rating: generateRating(),
    about: 'Specializing in mental health and cognitive behavioral therapy.',
    schedule: generateSchedule('01:00 PM', '09:00 PM')
  },
  {
    name: 'Vikram Singh',
    specialty: 'ENT Specialist',
    qualification: 'MBBS, MS (ENT)',
    experience: 13,
    consultationFee: 1300,
    rating: generateRating(),
    about: 'Expert in treating ear, nose, and throat conditions.',
    schedule: generateSchedule('09:00 AM', '05:00 PM')
  },
  {
    name: 'Meera Reddy',
    specialty: 'Gynecologist',
    qualification: 'MBBS, MD (Obstetrics & Gynecology)',
    experience: 15,
    consultationFee: 1550,
    rating: generateRating(),
    about: 'Specialized in women\'s health and reproductive medicine.',
    schedule: generateSchedule('08:00 AM', '04:00 PM')
  },
  {
    name: 'Arjun Nair',
    specialty: 'Ophthalmologist',
    qualification: 'MBBS, MS (Ophthalmology)',
    experience: 12,
    consultationFee: 1350,
    rating: generateRating(),
    about: 'Expert in treating eye conditions and vision care.',
    schedule: generateSchedule('10:00 AM', '06:00 PM')
  },
  {
    name: 'Sunita Mehta',
    specialty: 'Endocrinologist',
    qualification: 'MBBS, DM (Endocrinology)',
    experience: 14,
    consultationFee: 1650,
    rating: generateRating(),
    about: 'Specialized in hormone-related conditions and diabetes care.',
    schedule: generateSchedule('12:00 PM', '08:00 PM')
  },
  {
    name: 'Rahul Kapoor',
    specialty: 'Gastroenterologist',
    qualification: 'MBBS, DM (Gastroenterology)',
    experience: 13,
    consultationFee: 1600,
    rating: generateRating(),
    about: 'Expert in digestive system disorders and liver diseases.',
    schedule: generateSchedule('09:00 AM', '05:00 PM')
  },
  {
    name: 'Neha Malhotra',
    specialty: 'Dentist',
    qualification: 'BDS, MDS',
    experience: 8,
    consultationFee: 1000,
    rating: generateRating(),
    about: 'Specialized in dental care and oral surgery.',
    schedule: generateSchedule('10:00 AM', '06:00 PM')
  },
  {
    name: 'Arun Joshi',
    specialty: 'Pulmonologist',
    qualification: 'MBBS, MD (Pulmonology)',
    experience: 16,
    consultationFee: 1500,
    rating: generateRating(),
    about: 'Expert in respiratory diseases and lung conditions.',
    schedule: generateSchedule('11:00 AM', '07:00 PM')
  },
  {
    name: 'Pooja Iyer',
    specialty: 'Rheumatologist',
    qualification: 'MBBS, DM (Rheumatology)',
    experience: 12,
    consultationFee: 1400,
    rating: generateRating(),
    about: 'Specialized in treating arthritis and autoimmune conditions.',
    schedule: generateSchedule('08:00 AM', '04:00 PM')
  },
  {
    name: 'Karthik Krishnan',
    specialty: 'Urologist',
    qualification: 'MBBS, MS (Urology)',
    experience: 15,
    consultationFee: 1600,
    rating: generateRating(),
    about: 'Expert in urinary tract disorders and male reproductive health.',
    schedule: generateSchedule('09:00 AM', '05:00 PM')
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
