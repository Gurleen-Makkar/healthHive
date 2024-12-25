const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const { auth } = require("../middleware/auth");
const Appointment = require("../models/Appointment");
const Doctor = require("../models/Doctor");
const { body, validationResult } = require("express-validator");

// Create appointment validation
const createAppointmentValidation = [
  body("doctorId").notEmpty().withMessage("Doctor ID is required"),
  body("appointmentDate")
    .notEmpty()
    .withMessage("Appointment date is required")
    .custom((value) => {
      const appointmentDate = new Date(value);
      const today = new Date();
      // Set both dates to start of day for comparison
      appointmentDate.setHours(0, 0, 0, 0);
      today.setHours(0, 0, 0, 0);

      if (appointmentDate < today) {
        throw new Error("Appointment date cannot be in the past");
      }
      return true;
    }),
  body("timeSlot").notEmpty().withMessage("Time slot is required"),
  body("symptoms").notEmpty().withMessage("Symptoms description is required"),
];

// Update appointment validation
const updateAppointmentValidation = [
  body("appointmentDate")
    .notEmpty()
    .withMessage("Appointment date is required")
    .custom((value) => {
      const appointmentDate = new Date(value);
      const today = new Date();
      // Set both dates to start of day for comparison
      appointmentDate.setHours(0, 0, 0, 0);
      today.setHours(0, 0, 0, 0);

      if (appointmentDate < today) {
        throw new Error("Appointment date cannot be in the past");
      }
      return true;
    }),
  body("timeSlot").notEmpty().withMessage("Time slot is required"),
  body("symptoms").notEmpty().withMessage("Symptoms description is required"),
];

// Get all appointments for the logged-in user
router.get("/", auth, async (req, res) => {
  try {
    const { status, search, page = 1, limit = 20 } = req.query;
    let query = { user: req.user.id };

    if (status) {
      query.status = status;
    }

    // If search term is provided, use aggregation to search in doctor's name and specialty
    if (search) {
      const appointments = await Appointment.aggregate([
        {
          $lookup: {
            from: "doctors",
            localField: "doctor",
            foreignField: "_id",
            as: "doctorInfo",
          },
        },
        {
          $unwind: "$doctorInfo", // Unwind the doctorInfo array to access its fields
        },
        {
          $match: {
            user: mongoose.Types.ObjectId(req.user.id),
            ...(status && { status }),
            $or: [
              { "doctorInfo.name": { $regex: search, $options: "i" } },
              { "doctorInfo.specialty": { $regex: search, $options: "i" } },
            ],
          },
        },
        { $sort: { appointmentDate: -1, timeSlot: 1 } },
        { $skip: (page - 1) * limit },
        { $limit: parseInt(limit) },
      ]);

      const total = await Appointment.aggregate([
        {
          $lookup: {
            from: "doctors",
            localField: "doctor",
            foreignField: "_id",
            as: "doctorInfo",
          },
        },
        {
          $unwind: "$doctorInfo", // Unwind the doctorInfo array to access its fields
        },
        {
          $match: {
            user: mongoose.Types.ObjectId(req.user.id),
            ...(status && { status }),
            $or: [
              { "doctorInfo.name": { $regex: search, $options: "i" } },
              { "doctorInfo.specialty": { $regex: search, $options: "i" } },
            ],
          },
        },
        { $count: "total" },
      ]);

      // Populate doctor details for each appointment
      const populatedAppointments = await Appointment.populate(appointments, {
        path: "doctor",
        select: "name specialty consultationFee",
        model: 'Doctor'
      });

      console.log('Found appointments with search:', populatedAppointments.map(apt => ({
        id: apt._id,
        doctor: apt.doctor,
        date: apt.appointmentDate,
        timeSlot: apt.timeSlot
      })));

      return res.json({
        appointments: populatedAppointments,
        currentPage: parseInt(page),
        totalPages: Math.ceil((total[0]?.total || 0) / limit),
        totalAppointments: total[0]?.total || 0,
      });
    }

    const appointments = await Appointment.find(query)
      .populate({
        path: "doctor",
        select: "name specialty consultationFee",
        model: 'Doctor'
      })
      .sort({ appointmentDate: -1, timeSlot: 1 })  // Show newest appointments first
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    console.log('Found appointments:', appointments.map(apt => ({
      id: apt._id,
      doctor: apt.doctor,
      date: apt.appointmentDate,
      timeSlot: apt.timeSlot
    })));

    const total = await Appointment.countDocuments(query);

    res.json({
      appointments,
      currentPage: parseInt(page),
      totalPages: Math.ceil(total / limit),
      totalAppointments: total,
    });
  } catch (error) {
    console.error("Get appointments error:", error);
    res.status(500).json({ message: "Error fetching appointments" });
  }
});

// Get specific appointment by ID
router.get("/:id", auth, async (req, res) => {
  try {
    const appointment = await Appointment.findOne({
      _id: req.params.id,
      user: req.user.id,
    }).populate("doctor", "name specialty consultationFee");

    if (!appointment) {
      return res.status(404).json({ message: "Appointment not found" });
    }

    res.json(appointment);
  } catch (error) {
    console.error("Get appointment error:", error);
    res.status(500).json({ message: "Error fetching appointment details" });
  }
});

// Create new appointment
router.post("/", [auth, createAppointmentValidation], async (req, res) => {
  try {
    // Validate request
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log("Validation errors:", errors.array());
      return res.status(400).json({
        message: errors
          .array()
          .map((err) => err.msg)
          .join(", "),
        errors: errors.array(),
      });
    }

    const { doctorId, appointmentDate, timeSlot, symptoms, notes } = req.body;

    // Check if doctor exists
    const doctor = await Doctor.findById(doctorId);
    if (!doctor) {
      return res.status(404).json({ message: "Doctor not found" });
    }

    console.log("Received appointment data:", {
      doctorId,
      appointmentDate,
      timeSlot,
      symptoms,
      notes,
    });

    // Parse the date string to ensure it's a valid date
    const parsedDate = new Date(appointmentDate);
    if (isNaN(parsedDate.getTime())) {
      return res.status(400).json({ message: "Invalid appointment date" });
    }

    // Format time slot consistently
    const formattedTimeSlot = new Date(`2000-01-01 ${timeSlot}`)
      .toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      })
      .replace(/\s+/g, " "); // Normalize spaces between time and AM/PM

    console.log("Checking availability for:", {
      date: parsedDate,
      timeSlot: formattedTimeSlot,
    });

    // Check doctor's availability
    const isAvailable = await doctor.isTimeSlotAvailable(
      parsedDate,
      formattedTimeSlot
    );
    console.log("Doctor availability:", isAvailable);
    if (!isAvailable) {
      return res
        .status(400)
        .json({ message: "Selected time slot is not available" });
    }

    // Set the appointment date to start of the day to avoid timezone issues
    const appointmentDateStart = new Date(parsedDate.setHours(0, 0, 0, 0));

    // Check for conflicting appointments
    const hasConflict = await Appointment.checkConflict(
      doctorId,
      appointmentDate,
      formattedTimeSlot,
      null // No appointment to exclude for new bookings
    );
    console.log("Appointment conflict:", hasConflict);
    if (hasConflict) {
      return res
        .status(400)
        .json({ message: "This time slot is already booked" });
    }

    // Create appointment with formatted time slot
    const appointment = new Appointment({
      user: req.user.id,
      doctor: doctorId,
      appointmentDate: appointmentDateStart,
      timeSlot: formattedTimeSlot,
      symptoms,
      notes,
      consultationFee: doctor.consultationFee,
    });

    await appointment.save();

    // Populate doctor details before sending response
    const populatedAppointment = await appointment.populate({
      path: "doctor",
      select: "name specialty consultationFee",
      model: 'Doctor'
    });

    console.log('Created appointment:', {
      id: populatedAppointment._id,
      doctor: populatedAppointment.doctor,
      date: populatedAppointment.appointmentDate,
      timeSlot: populatedAppointment.timeSlot
    });

    res.status(201).json({
      message: "Appointment booked successfully",
      appointment: populatedAppointment
    });
  } catch (error) {
    console.error("Create appointment error:", error);
    // Log the full error and send a detailed message
    console.error("Create appointment error:", error);
    console.error("Error details:", error.stack);

    // Check if it's a validation error from Mongoose
    if (error.name === "ValidationError") {
      return res.status(400).json({
        message: Object.values(error.errors)
          .map((err) => err.message)
          .join(", "),
        errors: Object.values(error.errors),
      });
    }

    // Handle other types of errors
    res.status(500).json({
      message: error.message || "Error booking appointment",
      details: error.stack,
    });
  }
});

// Update appointment
router.put("/:id", [auth, updateAppointmentValidation], async (req, res) => {
  try {
    // Validate request
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log("Validation errors:", errors.array());
      return res.status(400).json({
        message: errors
          .array()
          .map((err) => err.msg)
          .join(", "),
        errors: errors.array(),
      });
    }

    const { appointmentDate, timeSlot, symptoms, notes } = req.body;

    // Find appointment and check ownership
    const appointment = await Appointment.findOne({
      _id: req.params.id,
      user: req.user.id,
    });

    if (!appointment) {
      return res.status(404).json({ message: "Appointment not found" });
    }

    if (appointment.status === "completed") {
      return res
        .status(400)
        .json({ message: "Cannot modify completed appointment" });
    }

    // Parse the date string to ensure it's a valid date
    const parsedDate = new Date(appointmentDate);
    if (isNaN(parsedDate.getTime())) {
      return res.status(400).json({ message: "Invalid appointment date" });
    }

    // Set the appointment date to start of day for comparison
    const newAppointmentDate = new Date(parsedDate.setHours(0, 0, 0, 0));
    const currentAppointmentDate = new Date(
      appointment.appointmentDate.setHours(0, 0, 0, 0)
    );

    // Check for time slot availability if date/time is being changed
    if (
      newAppointmentDate.getTime() !== currentAppointmentDate.getTime() ||
      timeSlot !== appointment.timeSlot
    ) {
      const doctor = await Doctor.findById(appointment.doctor);
      // Ensure consistent time format
      const formattedTimeSlot = new Date(
        `2000-01-01 ${timeSlot}`
      ).toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      });
      const isAvailable = await doctor.isTimeSlotAvailable(
        appointmentDate,
        formattedTimeSlot
      );
      if (!isAvailable) {
        return res
          .status(400)
          .json({ message: "Selected time slot is not available" });
      }

      const hasConflict = await Appointment.checkConflict(
        appointment.doctor,
        appointmentDate,
        formattedTimeSlot,
        appointment._id
      );
      if (hasConflict) {
        return res
          .status(400)
          .json({ message: "This time slot is already booked" });
      }
    }

    // Format time slot consistently
    const formattedTimeSlot = new Date(`2000-01-01 ${timeSlot}`)
      .toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      })
      .replace(/\s+/g, " "); // Normalize spaces between time and AM/PM

    // Update appointment with the parsed date and formatted time slot
    appointment.appointmentDate = newAppointmentDate;
    appointment.timeSlot = formattedTimeSlot;
    appointment.symptoms = symptoms;
    if (notes) appointment.notes = notes;

    await appointment.save();

    // Populate doctor details before sending response
    const populatedAppointment = await appointment.populate({
      path: "doctor",
      select: "name specialty consultationFee",
      model: 'Doctor'
    });

    console.log('Updated appointment:', {
      id: populatedAppointment._id,
      doctor: populatedAppointment.doctor,
      date: populatedAppointment.appointmentDate,
      timeSlot: populatedAppointment.timeSlot
    });

    res.json({
      message: "Appointment updated successfully",
      appointment: populatedAppointment
    });
  } catch (error) {
    console.error("Update appointment error:", error);
    console.error("Error details:", error.stack);

    // Check if it's a validation error from Mongoose
    if (error.name === "ValidationError") {
      return res.status(400).json({
        message: Object.values(error.errors)
          .map((err) => err.message)
          .join(", "),
        errors: Object.values(error.errors),
      });
    }

    // Handle other types of errors
    res.status(500).json({
      message: error.message || "Error updating appointment",
      details: error.stack,
    });
  }
});

// Cancel appointment
router.delete("/:id", auth, async (req, res) => {
  try {
    const appointment = await Appointment.findOne({
      _id: req.params.id,
      user: req.user.id,
    });

    if (!appointment) {
      return res.status(404).json({ message: "Appointment not found" });
    }

    if (appointment.status === "completed") {
      return res
        .status(400)
        .json({ message: "Cannot cancel completed appointment" });
    }

    await appointment.cancelAppointment();

    res.json({ message: "Appointment cancelled successfully" });
  } catch (error) {
    console.error("Cancel appointment error:", error);
    res.status(500).json({ message: "Error cancelling appointment" });
  }
});

module.exports = router;
