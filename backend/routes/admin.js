const express = require("express");
const router = express.Router();
const multer = require("multer");
const QRCode = require("qrcode");
const { authenticateToken, requireAdmin } = require("../middleware/auth");
const { validate, schemas } = require("../validators/validation");
const ParkingSlot = require("../models/ParkingSlot");
const User = require("../models/User");
const CompletedParking = require("../models/CompletedParking");

// Configure multer for file uploads
const upload = multer({ storage: multer.memoryStorage() });

// Get dashboard statistics
router.get("/stats", authenticateToken, requireAdmin, async (req, res) => {
  try {
    const totalSlots = await ParkingSlot.countDocuments();
    const availableSlots = await ParkingSlot.countDocuments({
      status: "available",
    });
    const reservedSlots = await ParkingSlot.countDocuments({
      status: "reserved",
    });
    const occupiedSlots = await ParkingSlot.countDocuments({
      status: "occupied",
    });
    const leavingSlots = await ParkingSlot.countDocuments({
      status: "leaving",
    });
    const maintenanceSlots = await ParkingSlot.countDocuments({
      status: "maintenance",
    });
    const totalUsers = await User.countDocuments({ role: "user" });
    const blockedUsers = await User.countDocuments({
      role: "user",
      isBlocked: true,
    });
    const activeUsers = totalUsers - blockedUsers;
    const pendingOccupiedRequests = await ParkingSlot.countDocuments({
      occupiedRequestStatus: "pending",
    });
    const pendingLeavingRequests = await ParkingSlot.countDocuments({
      leavingRequestStatus: "pending",
      paymentStatus: "paid",
    });

    res.json({
      parking: {
        totalSlots,
        availableSlots,
        reservedSlots,
        occupiedSlots,
        leavingSlots,
        maintenanceSlots,
      },
      users: {
        totalUsers,
        activeUsers,
        blockedUsers,
      },
      requests: {
        pendingOccupiedRequests,
        pendingLeavingRequests,
      },
    });
  } catch (error) {
    console.error("Error fetching stats:", error);
    res.status(500).json({ error: "Server error" });
  }
});

// Get all parking slots with detailed information
router.get("/slots", authenticateToken, requireAdmin, async (req, res) => {
  try {
    const slots = await ParkingSlot.find()
      .populate("bookedBy", "name email")
      .sort({ id: 1 });

    res.json(slots);
  } catch (error) {
    console.error("Error fetching slots:", error);
    res.status(500).json({ error: "Server error" });
  }
});

// Update parking slot status
router.patch(
  "/slots/:slotId/status",
  authenticateToken,
  requireAdmin,
  async (req, res) => {
    try {
      const { slotId } = req.params;
      const { status } = req.body;

      // Validate status
      if (!["available", "occupied", "maintenance"].includes(status)) {
        return res.status(400).json({
          error: "Invalid status. Must be: available, occupied, or maintenance",
        });
      }

      const slot = await ParkingSlot.findOne({ id: slotId });

      if (!slot) {
        return res.status(404).json({ error: "Slot not found" });
      }

      // If setting to available, clear booking data
      if (status === "available") {
        slot.vehicleNumber = null;
        slot.bookingTime = null;
        slot.bookedBy = null;
      }

      // If setting to maintenance, clear booking data
      if (status === "maintenance") {
        slot.vehicleNumber = null;
        slot.bookingTime = null;
        slot.bookedBy = null;
      }

      slot.status = status;
      await slot.save();

      const updatedSlot = await ParkingSlot.findById(slot._id).populate(
        "bookedBy",
        "name email"
      );

      res.json({
        message: `Slot ${slotId} status updated to ${status}`,
        slot: updatedSlot,
      });
    } catch (error) {
      console.error("Error updating slot status:", error);
      res.status(500).json({ error: "Server error" });
    }
  }
);

// Release a parking slot (set to available)
router.post(
  "/slots/:slotId/release",
  authenticateToken,
  requireAdmin,
  async (req, res) => {
    try {
      const { slotId } = req.params;

      const slot = await ParkingSlot.findOne({ id: slotId });

      if (!slot) {
        return res.status(404).json({ error: "Slot not found" });
      }

      // Reset slot
      slot.status = "available";
      slot.vehicleNumber = null;
      slot.bookingTime = null;
      slot.bookedBy = null;

      await slot.save();

      const updatedSlot = await ParkingSlot.findById(slot._id).populate(
        "bookedBy",
        "name email"
      );

      res.json({
        message: "Slot released successfully",
        slot: updatedSlot,
      });
    } catch (error) {
      console.error("Error releasing slot:", error);
      res.status(500).json({ error: "Server error" });
    }
  }
);

// Get all users with their information
router.get("/users", authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { page = 1, limit = 10, search = "", blocked } = req.query;
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    // Build query
    const query = { role: "user" };

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ];
    }

    if (blocked !== undefined) {
      query.isBlocked = blocked === "true";
    }

    const users = await User.find(query)
      .select("-password")
      .populate("blockedBy", "name email")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum);

    const total = await User.countDocuments(query);

    res.json({
      users,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum),
      },
    });
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ error: "Server error" });
  }
});

// Get single user details
router.get(
  "/users/:userId",
  authenticateToken,
  requireAdmin,
  async (req, res) => {
    try {
      const { userId } = req.params;

      const user = await User.findById(userId)
        .select("-password")
        .populate("blockedBy", "name email");

      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      // Get user's booking history
      const bookings = await ParkingSlot.find({ bookedBy: userId })
        .sort({ bookingTime: -1 })
        .limit(10);

      res.json({
        user,
        recentBookings: bookings,
      });
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ error: "Server error" });
    }
  }
);

// Block a user
router.post(
  "/users/:userId/block",
  authenticateToken,
  requireAdmin,
  async (req, res) => {
    try {
      const { userId } = req.params;
      const adminId = req.user.id;

      const user = await User.findById(userId);

      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      if (user.role === "admin") {
        return res.status(400).json({ error: "Cannot block admin users" });
      }

      if (user.isBlocked) {
        return res.status(400).json({ error: "User is already blocked" });
      }

      user.isBlocked = true;
      user.blockedAt = new Date();
      user.blockedBy = adminId;

      await user.save();

      // Cancel any active bookings for this user
      await ParkingSlot.updateMany(
        { bookedBy: userId, status: "occupied" },
        {
          status: "available",
          vehicleNumber: null,
          bookingTime: null,
          bookedBy: null,
        }
      );

      const updatedUser = await User.findById(userId)
        .select("-password")
        .populate("blockedBy", "name email");

      res.json({
        message: "User blocked successfully",
        user: updatedUser,
      });
    } catch (error) {
      console.error("Error blocking user:", error);
      res.status(500).json({ error: "Server error" });
    }
  }
);

// Unblock a user
router.post(
  "/users/:userId/unblock",
  authenticateToken,
  requireAdmin,
  async (req, res) => {
    try {
      const { userId } = req.params;

      const user = await User.findById(userId);

      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      if (!user.isBlocked) {
        return res.status(400).json({ error: "User is not blocked" });
      }

      user.isBlocked = false;
      user.blockedAt = null;
      user.blockedBy = null;

      await user.save();

      const updatedUser = await User.findById(userId)
        .select("-password")
        .populate("blockedBy", "name email");

      res.json({
        message: "User unblocked successfully",
        user: updatedUser,
      });
    } catch (error) {
      console.error("Error unblocking user:", error);
      res.status(500).json({ error: "Server error" });
    }
  }
);

// Generate QR code for a slot
router.get("/qr/:slotId", authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { slotId } = req.params;
    const slot = await ParkingSlot.findOne({ id: slotId });

    if (!slot) {
      return res.status(404).json({ error: "Slot not found" });
    }

    const qrData = slot.qrCode;
    const qrCodeDataURL = await QRCode.toDataURL(qrData, {
      width: 200,
      margin: 1,
    });

    res.json({ qrCode: qrCodeDataURL });
  } catch (error) {
    console.error("Error generating QR code:", error);
    res.status(500).json({ error: "Server error" });
  }
});

// Get pending requests
router.get("/requests", authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { type } = req.query; // 'occupied' or 'leaving'

    let query = {};
    if (type === "occupied") {
      query = { occupiedRequestStatus: "pending" };
    } else if (type === "leaving") {
      query = {
        leavingRequestStatus: "pending",
        // Remove paymentStatus requirement - show all leaving requests
      };
    } else {
      query = {
        $or: [
          { occupiedRequestStatus: "pending" },
          { leavingRequestStatus: "pending" },
        ],
      };
    }

    const requests = await ParkingSlot.find(query)
      .populate("bookedBy", "name email")
      .sort({ createdAt: -1 });

    res.json(requests);
  } catch (error) {
    console.error("Error fetching requests:", error);
    res.status(500).json({ error: "Server error" });
  }
});

// Approve occupied request
router.post(
  "/approve-occupied/:slotId",
  authenticateToken,
  requireAdmin,
  async (req, res) => {
    try {
      const { slotId } = req.params;
      const slot = await ParkingSlot.findOne({ id: slotId });

      if (!slot) {
        return res.status(404).json({ error: "Slot not found" });
      }

      if (slot.occupiedRequestStatus !== "pending") {
        return res
          .status(400)
          .json({ error: "No pending occupied request found" });
      }

      // Get complete user information for QR code
      const userInfo = await User.findById(slot.bookedBy).select("-password");
      const parkedTime = new Date();

      // Generate occupied QR code with comprehensive information
      const occupiedQrData = JSON.stringify({
        // Booking Information
        type: "occupied",
        slotId: slot.id,
        reservationTime: slot.reservationTime?.toISOString(),
        arrivalTime: slot.arrivalTime?.toISOString(),
        parkedTime: parkedTime.toISOString(),
        vehicleNumber: slot.vehicleNumber,

        // User Information
        user: {
          id: slot.bookedBy.toString(),
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

        // Admin Information
        approvedBy: req.user.id,
        approvedAt: parkedTime.toISOString(),

        // System Information
        timestamp: parkedTime.toISOString(),
        version: "1.0",
        system: "QR Parking Management",
        status: "occupied",
      });

      const occupiedQrCode = await QRCode.toDataURL(occupiedQrData, {
        width: 200,
        margin: 1,
      });

      // Update slot
      slot.status = "occupied";
      slot.occupiedRequestStatus = "approved";
      slot.parkedTime = parkedTime;
      slot.occupiedQrCode = occupiedQrData;

      await slot.save();

      const updatedSlot = await ParkingSlot.findById(slot._id).populate(
        "bookedBy",
        "name email"
      );

      res.json({
        message: "Occupied request approved",
        slot: updatedSlot,
        qrCode: occupiedQrCode,
      });
    } catch (error) {
      console.error("Error approving occupied request:", error);
      res.status(500).json({ error: "Server error" });
    }
  }
);

// Reject occupied request
router.post(
  "/reject-occupied/:slotId",
  authenticateToken,
  requireAdmin,
  async (req, res) => {
    try {
      const { slotId } = req.params;
      const slot = await ParkingSlot.findOne({ id: slotId });

      if (!slot) {
        return res.status(404).json({ error: "Slot not found" });
      }

      if (slot.occupiedRequestStatus !== "pending") {
        return res
          .status(400)
          .json({ error: "No pending occupied request found" });
      }

      slot.occupiedRequestStatus = "rejected";
      await slot.save();

      res.json({
        message: "Occupied request rejected",
        slot,
      });
    } catch (error) {
      console.error("Error rejecting occupied request:", error);
      res.status(500).json({ error: "Server error" });
    }
  }
);

// Confirm payment and complete leaving request (combined operation)
router.post(
  "/confirm-payment/:slotId",
  authenticateToken,
  requireAdmin,
  async (req, res) => {
    try {
      const slotId = req.params.slotId;
      const slot = await ParkingSlot.findOne({ id: slotId }).populate(
        "bookedBy",
        "name email"
      );

      if (!slot) {
        return res.status(404).json({ error: "Slot not found" });
      }

      if (slot.leavingRequestStatus !== "pending") {
        return res
          .status(400)
          .json({ error: "No pending leaving request found" });
      }

      // Save parking history
      const userInfo = await User.findById(slot.bookedBy).select("-password");
      const completedTime = new Date();

      // Calculate duration
      const durationMs = completedTime - slot.parkedTime;
      const durationHours = Math.floor(durationMs / (1000 * 60 * 60));
      const durationMinutes = Math.floor(
        (durationMs % (1000 * 60 * 60)) / (1000 * 60)
      );
      const totalMinutes = Math.floor(durationMs / (1000 * 60));

      const completedParking = new CompletedParking({
        user: slot.bookedBy, // ObjectId reference
        slotId: slot.id, // String slot identifier
        vehicleNumber: slot.vehicleNumber,
        reservationTime: slot.reservationTime,
        arrivalTime: slot.arrivalTime,
        parkedTime: slot.parkedTime,
        leavingRequestTime: slot.leavingRequestTime,
        completedTime: completedTime,
        duration: {
          hours: durationHours,
          minutes: durationMinutes,
          totalMinutes: totalMinutes,
        },
        cost: slot.cost,
        paymentStatus: "paid",
        paymentTime: completedTime,
        approvedBy: req.user.id, // Admin who approved
      });

      await completedParking.save();

      // Reset slot to available
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
      slot.paymentStatus = "paid"; // Mark as paid before clearing
      slot.paymentTime = new Date();

      await slot.save();

      res.json({
        message: "Payment confirmed and leaving request completed successfully",
        completedParking: {
          ...completedParking.toObject(),
          user: {
            id: userInfo._id,
            name: userInfo.name,
            email: userInfo.email,
          },
        },
        slot: slot,
      });
    } catch (error) {
      console.error("Error confirming payment and completing exit:", error);
      res.status(500).json({ error: "Server error" });
    }
  }
);

// Mark payment as received for leaving request (keep for backward compatibility)
router.post(
  "/mark-payment/:slotId",
  authenticateToken,
  requireAdmin,
  async (req, res) => {
    try {
      const slotId = req.params.slotId;
      const slot = await ParkingSlot.findOne({ id: slotId }).populate(
        "bookedBy",
        "name email"
      );

      if (!slot) {
        return res.status(404).json({ error: "Slot not found" });
      }

      if (slot.leavingRequestStatus !== "pending") {
        return res
          .status(400)
          .json({ error: "No pending leaving request found" });
      }

      if (slot.paymentStatus === "paid") {
        return res
          .status(400)
          .json({ error: "Payment already marked as paid" });
      }

      // Mark payment as received
      slot.paymentStatus = "paid";
      slot.paymentTime = new Date();
      await slot.save();

      res.json({
        message: "Payment marked as received",
        slot: slot,
      });
    } catch (error) {
      console.error("Error marking payment:", error);
      res.status(500).json({ error: "Server error" });
    }
  }
);

// Approve leaving request and complete transaction
router.post(
  "/approve-leaving/:slotId",
  authenticateToken,
  requireAdmin,
  async (req, res) => {
    try {
      const { slotId } = req.params;
      const adminId = req.user.id;

      const slot = await ParkingSlot.findOne({ id: slotId });

      if (!slot) {
        return res.status(404).json({ error: "Slot not found" });
      }

      if (slot.leavingRequestStatus !== "pending") {
        return res
          .status(400)
          .json({ error: "No pending leaving request found" });
      }

      if (slot.paymentStatus !== "paid") {
        return res.status(400).json({ error: "Payment not completed" });
      }

      // Calculate duration
      const now = new Date();
      const durationMs = now - slot.parkedTime;
      const durationHours = Math.floor(durationMs / (1000 * 60 * 60));
      const durationMinutes = Math.floor(
        (durationMs % (1000 * 60 * 60)) / (1000 * 60)
      );
      const totalMinutes = Math.floor(durationMs / (1000 * 60));

      // Create completed parking record
      const completedParking = new CompletedParking({
        slotId: slot.id,
        vehicleNumber: slot.vehicleNumber,
        user: slot.bookedBy,
        reservationTime: slot.reservationTime,
        arrivalTime: slot.arrivalTime,
        parkedTime: slot.parkedTime,
        leavingRequestTime: slot.leavingRequestTime,
        completedTime: now,
        duration: {
          hours: durationHours,
          minutes: durationMinutes,
          totalMinutes,
        },
        cost: slot.cost,
        paymentStatus: "paid",
        paymentTime: slot.paymentTime,
        approvedBy: adminId,
      });

      await completedParking.save();

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

      res.json({
        message: "Leaving request approved and transaction completed",
        completedParking,
      });
    } catch (error) {
      console.error("Error approving leaving request:", error);
      res.status(500).json({ error: "Server error" });
    }
  }
);

// Get completed parkings
router.get(
  "/completed-parkings",
  authenticateToken,
  requireAdmin,
  async (req, res) => {
    try {
      const { page = 1, limit = 20, userId } = req.query;
      const pageNum = parseInt(page);
      const limitNum = parseInt(limit);
      const skip = (pageNum - 1) * limitNum;

      const query = {};
      if (userId) {
        query.user = userId;
      }

      const completedParkings = await CompletedParking.find(query)
        .populate("user", "name email")
        .populate("approvedBy", "name email")
        .sort({ completedTime: -1 })
        .skip(skip)
        .limit(limitNum);

      const total = await CompletedParking.countDocuments(query);

      res.json({
        completedParkings,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total,
          pages: Math.ceil(total / limitNum),
        },
      });
    } catch (error) {
      console.error("Error fetching completed parkings:", error);
      res.status(500).json({ error: "Server error" });
    }
  }
);

// Scan QR code (simplified - in production, use proper QR decoding library)
router.post(
  "/scan",
  authenticateToken,
  requireAdmin,
  upload.single("image"),
  async (req, res) => {
    try {
      // In a real application, you would decode the QR code from the image
      // For now, we'll simulate by returning a random slot's information
      const occupiedSlots = await ParkingSlot.find({
        status: "occupied",
      }).populate("bookedBy", "name email");

      if (occupiedSlots.length === 0) {
        return res.json({
          valid: false,
          message: "No occupied slots found",
        });
      }

      // Simulate scanning - pick a random occupied slot
      const randomSlot =
        occupiedSlots[Math.floor(Math.random() * occupiedSlots.length)];
      const bookingDate = new Date(randomSlot.bookingTime);
      const now = new Date();
      const durationMs = now - bookingDate;
      const durationHours = Math.floor(durationMs / (1000 * 60 * 60));
      const durationMinutes = Math.floor(
        (durationMs % (1000 * 60 * 60)) / (1000 * 60)
      );

      res.json({
        valid: true,
        slot: {
          id: randomSlot.id,
          vehicleNumber: randomSlot.vehicleNumber,
          bookingTime: randomSlot.bookingTime,
          duration: {
            hours: durationHours,
            minutes: durationMinutes,
          },
        },
      });
    } catch (error) {
      console.error("Error scanning QR:", error);
      res.status(500).json({ error: "Server error" });
    }
  }
);

// Reset all pending requests
router.post(
  "/reset-all-requests",
  authenticateToken,
  requireAdmin,
  async (req, res) => {
    try {
      // Find all slots with pending requests
      const slotsWithRequests = await ParkingSlot.find({
        $or: [
          { occupiedRequestStatus: "pending" },
          { leavingRequestStatus: "pending" },
        ],
      });

      if (slotsWithRequests.length === 0) {
        return res.json({
          message: "No pending requests to reset",
          resetCount: 0,
        });
      }

      // Reset all pending requests
      const updateResult = await ParkingSlot.updateMany(
        {
          $or: [
            { occupiedRequestStatus: "pending" },
            { leavingRequestStatus: "pending" },
          ],
        },
        {
          $unset: {
            occupiedRequestStatus: 1,
            leavingRequestStatus: 1,
            occupiedRequestTime: 1,
            leavingRequestTime: 1,
          },
        }
      );

      console.log(`Admin reset ${updateResult.modifiedCount} pending requests`);

      res.json({
        message: `Successfully reset ${updateResult.modifiedCount} pending requests`,
        resetCount: updateResult.modifiedCount,
      });
    } catch (error) {
      console.error("Error resetting all requests:", error);
      res.status(500).json({ error: "Server error" });
    }
  }
);

module.exports = router;
