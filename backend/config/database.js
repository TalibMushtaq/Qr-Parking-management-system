const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI);

    console.log(`MongoDB Connected: ${conn.connection.host}`);

    // Initialize parking slots if they don't exist
    await initializeParkingSlots();
    
    return conn;
  } catch (error) {
    console.error('Error connecting to MongoDB:', error.message);
    process.exit(1);
  }
};

// Function to check successful MongoDB connection
const checkConnection = (port) => {
  if (mongoose.connection.readyState === 1) {
    const conn = mongoose.connection;
    console.log('\n✅ ==========================================');
    console.log('   DATABASE CONNECTION SUCCESSFUL');
    console.log('==========================================');
    console.log(`   Database: ${conn.name}`);
    console.log(`   Host: ${conn.host}`);
    console.log(`   Port: ${conn.port}`);
    console.log(`   Server Port: ${port}`);
    console.log(`   Connection State: Connected (${conn.readyState})`);
    console.log('==========================================\n');
    return true;
  } else {
    console.log('\n❌ MongoDB connection check failed');
    console.log(`   Connection State: ${mongoose.connection.readyState}`);
    console.log('   States: 0 = disconnected, 1 = connected, 2 = connecting, 3 = disconnecting\n');
    return false;
  }
};

const initializeParkingSlots = async () => {
  const ParkingSlot = require('../models/ParkingSlot');
  const slotCount = await ParkingSlot.countDocuments();

  if (slotCount === 0) {
    const sectionLetters = ['A', 'B', 'C'];
    const slotsPerSection = 6;
    const slots = [];

    sectionLetters.forEach(section => {
      for (let i = 1; i <= slotsPerSection; i++) {
        const slotId = `${section}-${i.toString().padStart(2, '0')}`;
        slots.push({
          id: slotId,
          status: 'available',
          vehicleNumber: null,
          bookingTime: null,
          bookedBy: null,
          qrCode: `parking_slot:${slotId}`
        });
      }
    });

    await ParkingSlot.insertMany(slots);
    console.log('Parking slots initialized');
  }
};

module.exports = { connectDB, checkConnection };

