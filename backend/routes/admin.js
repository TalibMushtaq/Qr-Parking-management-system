const express = require('express');
const router = express.Router();
const multer = require('multer');
const QRCode = require('qrcode');
const { authenticateToken, requireAdmin } = require('../middleware/auth');
const { validate, schemas } = require('../validators/validation');
const ParkingSlot = require('../models/ParkingSlot');

// Configure multer for file uploads
const upload = multer({ storage: multer.memoryStorage() });

// Get dashboard statistics
router.get('/stats', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const totalSlots = await ParkingSlot.countDocuments();
    const availableSlots = await ParkingSlot.countDocuments({ status: 'available' });
    const occupiedSlots = totalSlots - availableSlots;

    res.json({
      totalSlots,
      availableSlots,
      occupiedSlots
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get all parking slots
router.get('/slots', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const slots = await ParkingSlot.find().populate('bookedBy', 'name email').sort({ id: 1 });
    res.json(slots);
  } catch (error) {
    console.error('Error fetching slots:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Release a parking slot
router.post('/release', authenticateToken, requireAdmin, validate({ body: schemas.releaseSlotSchema }), async (req, res) => {
  try {
    const { slotId } = req.body;

    const slot = await ParkingSlot.findOne({ id: slotId });

    if (!slot) {
      return res.status(404).json({ error: 'Slot not found' });
    }

    // Reset slot
    slot.status = 'available';
    slot.vehicleNumber = null;
    slot.bookingTime = null;
    slot.bookedBy = null;

    await slot.save();

    res.json({ message: 'Slot released successfully' });
  } catch (error) {
    console.error('Error releasing slot:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Generate QR code for a slot
router.get('/qr/:slotId', authenticateToken, requireAdmin, validate({ params: schemas.slotIdParamSchema }), async (req, res) => {
  try {
    const { slotId } = req.params;
    const slot = await ParkingSlot.findOne({ id: slotId });

    if (!slot) {
      return res.status(404).json({ error: 'Slot not found' });
    }

    const qrData = slot.qrCode;
    const qrCodeDataURL = await QRCode.toDataURL(qrData, {
      width: 200,
      margin: 1
    });

    res.json({ qrCode: qrCodeDataURL });
  } catch (error) {
    console.error('Error generating QR code:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Scan QR code (simplified - in production, use proper QR decoding library)
router.post('/scan', authenticateToken, requireAdmin, upload.single('image'), async (req, res) => {
  try {
    // In a real application, you would decode the QR code from the image
    // For now, we'll simulate by returning a random slot's information
    const occupiedSlots = await ParkingSlot.find({ status: 'occupied' }).populate('bookedBy', 'name email');

    if (occupiedSlots.length === 0) {
      return res.json({
        valid: false,
        message: 'No occupied slots found'
      });
    }

    // Simulate scanning - pick a random occupied slot
    const randomSlot = occupiedSlots[Math.floor(Math.random() * occupiedSlots.length)];
    const bookingDate = new Date(randomSlot.bookingTime);
    const now = new Date();
    const durationMs = now - bookingDate;
    const durationHours = Math.floor(durationMs / (1000 * 60 * 60));
    const durationMinutes = Math.floor((durationMs % (1000 * 60 * 60)) / (1000 * 60));

    res.json({
      valid: true,
      slot: {
        id: randomSlot.id,
        vehicleNumber: randomSlot.vehicleNumber,
        bookingTime: randomSlot.bookingTime,
        duration: {
          hours: durationHours,
          minutes: durationMinutes
        }
      }
    });
  } catch (error) {
    console.error('Error scanning QR:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
