const express = require("express");
const router = express.Router();
const QRCode = require("qrcode");
const { authenticateToken } = require("../middleware/auth");
const { validate, schemas } = require("../validators/validation");
const ParkingSlot = require("../models/ParkingSlot");
const User = require("../models/User");
const CompletedParking = require("../models/CompletedParking");

// Pricing configuration (per hour)
const PRICE_PER_HOUR = 50; // Change this as needed

// Get all available parking slots (including reserved slots that are not yet occupied)
router.get("/slots", authenticateToken, async (req, res) => {
  try {
    const slots = await ParkingSlot.find({
      $or: [
        { status: "available" },
        { status: "reserved", bookedBy: req.user.id },
      ],
    });
    res.json(slots);
  } catch (error) {
    console.error("Error fetching slots:", error);
    res.status(500).json({ error: "Server error" });
  }
});

// Get user's current booking/reservation
router.get("/booking", authenticateToken, async (req, res) => {
  try {
    const userBooking = await ParkingSlot.findOne({
      $or: [
        { status: "reserved", bookedBy: req.user.id },
        { status: "occupied", bookedBy: req.user.id },
        { status: "leaving", bookedBy: req.user.id },
      ],
    }).populate("bookedBy", "name email");

    if (userBooking) {
      // Check if reservation has expired (more than 1 hour)
      if (userBooking.status === "reserved") {
        const now = new Date();
        const reservationTime = new Date(userBooking.reservationTime);
        const oneHourLater = new Date(
          reservationTime.getTime() + 60 * 60 * 1000
        );

        if (now > oneHourLater) {
          // Auto-cancel expired reservation
          userBooking.status = "available";
          userBooking.vehicleNumber = null;
          userBooking.reservationTime = null;
          userBooking.arrivalTime = null;
          userBooking.bookingTime = null;
          userBooking.parkedTime = null;
          userBooking.leavingRequestTime = null;
          userBooking.bookedBy = null;
          userBooking.reservationQrCode = null;
          userBooking.occupiedQrCode = null;
          userBooking.occupiedRequestStatus = null;
          userBooking.leavingRequestStatus = null;
          userBooking.cost = 0;
          userBooking.paymentStatus = null;
          userBooking.paymentTime = null;

          await userBooking.save();

          return res.json(null); // No active booking
        }
      }

      res.json(userBooking);
    } else {
      res.json(null);
    }
  } catch (error) {
    console.error("Error fetching booking:", error);
    res.status(500).json({ error: "Server error" });
  }
});

// Reserve a parking slot (arrival time automatically set to 1 hour from server time)
router.post(
  "/reserve",
  authenticateToken,
  validate({ body: schemas.reserveSlotSchema }),
  async (req, res) => {
    try {
      const { slotId, vehicleNumber } = req.body;

      // Calculate arrival time as exactly 1 hour from current server time
      const now = new Date();
      const arrivalTime = new Date(now.getTime() + 60 * 60 * 1000);

      // Check if user already has a reservation/booking
      const existingBooking = await ParkingSlot.findOne({
        $or: [
          { status: "reserved", bookedBy: req.user.id },
          { status: "occupied", bookedBy: req.user.id },
          { status: "leaving", bookedBy: req.user.id },
        ],
      });

      if (existingBooking) {
        return res
          .status(409)
          .json({ error: "You already have an active reservation" });
      }

      // Find and update slot
      const slot = await ParkingSlot.findOne({ id: slotId });

      if (!slot) {
        return res.status(404).json({ error: "Slot not found" });
      }

      if (slot.status !== "available") {
        return res.status(409).json({ error: "Slot is not available" });
      }

      // Get complete user information for QR code
      const userInfo = await User.findById(req.user.id).select("-password");

      // Generate reservation QR code with comprehensive information
      const reservationQrData = JSON.stringify({
        // Booking Information
        type: "reservation",
        slotId: slot.id,
        reservationTime: now.toISOString(),
        arrivalTime: arrivalTime.toISOString(),
        vehicleNumber,

        // User Information
        user: {
          id: req.user.id,
          name: userInfo.name,
          email: userInfo.email,
          vehicleNumber: userInfo.vehicleNumber,
        },

        // Slot Information
        slot: {
          id: slot.id,
          location: `Slot ${slot.id}`,
          floor: slot.floor || 1,
        },

        // System Information
        timestamp: now.toISOString(),
        version: "1.0",
        system: "QR Parking Management",
      });

      const reservationQrCode = await QRCode.toDataURL(reservationQrData, {
        width: 200,
        margin: 1,
      });

      // Update slot
      slot.status = "reserved";
      slot.vehicleNumber = vehicleNumber;
      slot.reservationTime = new Date();
      slot.arrivalTime = arrivalTime;
      slot.bookedBy = req.user.id;
      slot.reservationQrCode = reservationQrData;

      await slot.save();

      const booking = await ParkingSlot.findById(slot._id).populate(
        "bookedBy",
        "name email"
      );

      res.json({
        message: "Slot reserved successfully",
        booking,
        qrCode: reservationQrCode,
      });
    } catch (error) {
      console.error("Error reserving slot:", error);
      res.status(500).json({ error: "Server error" });
    }
  }
);

// Request occupied status (user has parked)
router.post("/request-occupied", authenticateToken, async (req, res) => {
  try {
    const slot = await ParkingSlot.findOne({
      status: "reserved",
      bookedBy: req.user.id,
    });

    if (!slot) {
      return res.status(404).json({ error: "No active reservation found" });
    }

    // Check if reservation has expired (more than 1 hour)
    const now = new Date();
    const reservationTime = new Date(slot.reservationTime);
    const oneHourLater = new Date(reservationTime.getTime() + 60 * 60 * 1000);

    if (now > oneHourLater) {
      // Auto-cancel expired reservation
      slot.status = "available";
      slot.vehicleNumber = null;
      slot.reservationTime = null;
      slot.arrivalTime = null;
      slot.bookingTime = null;
      slot.parkedTime = null;
      slot.leavingRequestTime = null;
      slot.bookedBy = null;
      slot.reservationQrCode = null;
      slot.occupiedQrCode = null;
      slot.occupiedRequestStatus = null;
      slot.leavingRequestStatus = null;
      slot.cost = 0;
      slot.paymentStatus = null;
      slot.paymentTime = null;

      await slot.save();

      return res.status(400).json({
        error:
          "Your reservation has expired (more than 1 hour). Please make a new reservation.",
        expired: true,
      });
    }

    // Allow occupied request anytime within the 1-hour window
    slot.occupiedRequestStatus = "pending";
    await slot.save();

    res.json({
      message: "Occupied request submitted. Waiting for admin approval.",
      slot,
    });
  } catch (error) {
    console.error("Error requesting occupied:", error);
    res.status(500).json({ error: "Server error" });
  }
});

// Request leaving (user wants to leave)
router.post("/request-leaving", authenticateToken, async (req, res) => {
  try {
    const slot = await ParkingSlot.findOne({
      status: "occupied",
      bookedBy: req.user.id,
    });

    if (!slot) {
      return res.status(404).json({ error: "No active parking found" });
    }

    if (!slot.parkedTime) {
      return res.status(400).json({ error: "Parking time not set" });
    }

    slot.leavingRequestStatus = "pending";
    slot.leavingRequestTime = new Date();
    slot.status = "leaving";

    // Calculate cost
    const now = new Date();
    const durationMs = now - slot.parkedTime;
    const durationHours = durationMs / (1000 * 60 * 60);
    const cost = Math.ceil(durationHours * PRICE_PER_HOUR);

    slot.cost = cost;
    slot.paymentStatus = "pending";

    await slot.save();

    res.json({
      message: "Leaving request submitted. Please make payment.",
      slot: {
        ...slot.toObject(),
        duration: {
          hours: Math.floor(durationMs / (1000 * 60 * 60)),
          minutes: Math.floor((durationMs % (1000 * 60 * 60)) / (1000 * 60)),
          totalMinutes: Math.floor(durationMs / (1000 * 60)),
        },
        cost,
      },
    });
  } catch (error) {
    console.error("Error requesting leaving:", error);
    res.status(500).json({ error: "Server error" });
  }
});

// Process payment
router.post("/payment", authenticateToken, async (req, res) => {
  try {
    const slot = await ParkingSlot.findOne({
      status: "leaving",
      bookedBy: req.user.id,
      paymentStatus: "pending",
    });

    if (!slot) {
      return res.status(404).json({ error: "No pending payment found" });
    }

    // In a real application, integrate with payment gateway here
    // For now, we'll simulate successful payment
    slot.paymentStatus = "paid";
    slot.paymentTime = new Date();
    await slot.save();

    res.json({
      message: "Payment successful. Waiting for admin approval.",
      slot,
    });
  } catch (error) {
    console.error("Error processing payment:", error);
    res.status(500).json({ error: "Server error" });
  }
});

// Cancel reservation
router.post("/cancel", authenticateToken, async (req, res) => {
  try {
    const slot = await ParkingSlot.findOne({
      $or: [
        { status: "reserved", bookedBy: req.user.id },
        {
          status: "occupied",
          bookedBy: req.user.id,
          occupiedRequestStatus: "pending",
        },
      ],
    });

    if (!slot) {
      return res.status(404).json({ error: "No active reservation found" });
    }

    // Reset slot
    slot.status = "available";
    slot.vehicleNumber = null;
    slot.reservationTime = null;
    slot.arrivalTime = null;
    slot.bookingTime = null;
    slot.parkedTime = null;
    slot.leavingRequestTime = null;
    slot.bookedBy = null;
    slot.reservationQrCode = null;
    slot.occupiedQrCode = null;
    slot.occupiedRequestStatus = null;
    slot.leavingRequestStatus = null;
    slot.cost = 0;
    slot.paymentStatus = null;
    slot.paymentTime = null;

    await slot.save();

    res.json({ message: "Reservation cancelled successfully" });
  } catch (error) {
    console.error("Error cancelling reservation:", error);
    res.status(500).json({ error: "Server error" });
  }
});

// Get user's parking history
router.get("/history", authenticateToken, async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    const history = await CompletedParking.find({ user: req.user.id })
      .populate("user", "name email vehicleNumber")
      .populate("approvedBy", "name email")
      .sort({ completedTime: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .lean();

    const total = await CompletedParking.countDocuments({ user: req.user.id });

    // Format the response with calculated values
    const formattedHistory = history.map((record) => ({
      ...record,
      formattedDuration: `${record.duration.hours}h ${record.duration.minutes}m`,
      formattedCost: `₹${record.cost}`,
      formattedDate: new Date(record.completedTime).toLocaleDateString("en-IN"),
      formattedTime: new Date(record.completedTime).toLocaleTimeString("en-IN"),
    }));

    res.json({
      history: formattedHistory,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalRecords: total,
        hasNextPage: skip + history.length < total,
        hasPrevPage: page > 1,
      },
    });
  } catch (error) {
    console.error("Error fetching parking history:", error);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
