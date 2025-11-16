const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const { validate, schemas } = require('../validators/validation');
const ParkingSlot = require('../models/ParkingSlot');

// Get all available parking slots
router.get('/slots', authenticateToken, async (req, res) => {
  try {
    const availableSlots = await ParkingSlot.find({ status: 'available' });
    res.json(availableSlots);
  } catch (error) {
    console.error('Error fetching slots:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get user's current booking
router.get('/booking', authenticateToken, async (req, res) => {
  try {
    const userBooking = await ParkingSlot.findOne({
      status: 'occupied',
      bookedBy: req.user.id
    }).populate('bookedBy', 'name email');

    if (userBooking) {
      res.json(userBooking);
    } else {
      res.json(null);
    }
  } catch (error) {
    console.error('Error fetching booking:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Book a parking slot
router.post('/book', authenticateToken, validate({ body: schemas.bookSlotSchema }), async (req, res) => {
  try {
    const { slotId, vehicleNumber } = req.body;

    // Check if user already has a booking
    const existingBooking = await ParkingSlot.findOne({
      status: 'occupied',
      bookedBy: req.user.id
    });

    if (existingBooking) {
      return res.status(409).json({ error: 'You already have an active booking' });
    }

    // Find and update slot
    const slot = await ParkingSlot.findOne({ id: slotId });

    if (!slot) {
      return res.status(404).json({ error: 'Slot not found' });
    }

    if (slot.status !== 'available') {
      return res.status(409).json({ error: 'Slot is not available' });
    }

    slot.status = 'occupied';
    slot.vehicleNumber = vehicleNumber; // Already transformed to uppercase by Zod
    slot.bookingTime = new Date();
    slot.bookedBy = req.user.id;

    await slot.save();

    const booking = await ParkingSlot.findById(slot._id).populate('bookedBy', 'name email');

    res.json({
      message: 'Slot booked successfully',
      booking
    });
  } catch (error) {
    console.error('Error booking slot:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Cancel booking
router.post('/cancel', authenticateToken, async (req, res) => {
  try {
    const slot = await ParkingSlot.findOne({
      status: 'occupied',
      bookedBy: req.user.id
    });

    if (!slot) {
      return res.status(404).json({ error: 'No active booking found' });
    }

    // Reset slot
    slot.status = 'available';
    slot.vehicleNumber = null;
    slot.bookingTime = null;
    slot.bookedBy = null;

    await slot.save();

    res.json({ message: 'Booking cancelled successfully' });
  } catch (error) {
    console.error('Error cancelling booking:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
