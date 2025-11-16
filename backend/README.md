# 🚗 QR Parking Management - Backend API

[![Node.js](https://img.shields.io/badge/Node.js-v14+-green.svg)](https://nodejs.org/)
[![Express.js](https://img.shields.io/badge/Express.js-4.x-blue.svg)](https://expressjs.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-green.svg)](https://www.mongodb.com/atlas)
[![License](https://img.shields.io/badge/License-ISC-yellow.svg)]()

A robust Express.js backend server with MongoDB Atlas integration for the QR-Based Smart Parking Management System. Features include real-time parking management, secure authentication, QR code generation, and comprehensive admin controls.

## Setup

1. Install dependencies:

```bash
npm install
```

2. Create `.env` file:

```env
PORT=5000
JWT_SECRET=your-secret-key-change-in-production
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/parking-management?retryWrites=true&w=majority
```

3. Start the server:

```bash
# Development
npm run dev

# Production
npm start
```

## 🗄️ Database Setup (MongoDB Atlas)

### Step-by-step MongoDB Atlas Configuration:

1. **Create Account**: Sign up at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) (free tier available)

2. **Create Cluster**:

   - Choose **FREE** shared cluster
   - Select your preferred cloud provider and region
   - Name your cluster (e.g., `parking-management`)

3. **Database Security**:

   - Create a database user with **read/write permissions**
   - Choose a strong username and password
   - Add your IP address to whitelist (use `0.0.0.0/0` for development)

4. **Connect to Application**:
   - Click "Connect" → "Connect your application"
   - Copy the connection string
   - Replace `<password>` with your database user password
   - Add to your `.env` file as `MONGODB_URI`

### Database Structure

The system automatically creates:

- **users** collection - User accounts and profiles
- **parkingslots** collection - Parking slot management
- **completedbookings** collection - Booking history and analytics

## 📚 API Documentation

> **Authentication**: Most endpoints require Bearer token authentication
>
> ```
> Headers: { "Authorization": "Bearer <your-jwt-token>" }
> ```

### 🔐 Authentication Endpoints

| Method | Endpoint             | Description       | Auth Required |
| ------ | -------------------- | ----------------- | ------------- |
| `POST` | `/api/auth/register` | Register new user | ❌            |
| `POST` | `/api/auth/login`    | User login        | ❌            |
| `GET`  | `/api/auth/verify`   | Verify JWT token  | ✅            |

#### Register User

```json
POST /api/auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "securePassword123",
  "vehicleNumber": "ABC-1234" // Optional
}

Response: {
  "success": true,
  "message": "User registered successfully",
  "token": "jwt-token-here"
}
```

#### User Login

```json
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "securePassword123"
}

Response: {
  "success": true,
  "token": "jwt-token-here",
  "user": {
    "id": "user-id",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "user"
  }
}
```

#### Verify Token

```json
GET /api/auth/verify
Authorization: Bearer <token>

Response: {
  "success": true,
  "user": { /* user data */ }
}
```

### 🚗 Parking Endpoints (User)

| Method | Endpoint               | Description                     | Auth Required |
| ------ | ---------------------- | ------------------------------- | ------------- |
| `GET`  | `/api/parking/slots`   | Get available parking slots     | ✅            |
| `GET`  | `/api/parking/booking` | Get current user booking        | ✅            |
| `POST` | `/api/parking/book`    | Book a parking slot             | ✅            |
| `POST` | `/api/parking/cancel`  | Cancel current booking          | ✅            |
| `POST` | `/api/parking/occupy`  | Mark slot as occupied (QR scan) | ✅            |
| `POST` | `/api/parking/leave`   | Complete parking session        | ✅            |
| `GET`  | `/api/parking/history` | Get user's booking history      | ✅            |

#### Get Available Slots

```json
GET /api/parking/slots
Authorization: Bearer <token>

Response: {
  "success": true,
  "slots": [
    {
      "id": "A-01",
      "status": "available",
      "location": "Ground Floor - Zone A"
    }
  ]
}
```

#### Book Parking Slot

```json
POST /api/parking/book
Authorization: Bearer <token>
Content-Type: application/json

{
  "slotId": "A-01",
  "vehicleNumber": "ABC-1234"
}

Response: {
  "success": true,
  "message": "Slot booked successfully",
  "booking": {
    "slotId": "A-01",
    "reservationQrCode": "qr-data-for-entry",
    "bookingTime": "2025-11-16T10:30:00Z",
    "expiresAt": "2025-11-16T10:45:00Z"
  }
}
```

#### Get Current Booking

```json
GET /api/parking/booking
Authorization: Bearer <token>

Response: {
  "success": true,
  "booking": {
    "slotId": "A-01",
    "status": "reserved", // or "occupied"
    "vehicleNumber": "ABC-1234",
    "bookingTime": "2025-11-16T10:30:00Z",
    "reservationQrCode": "qr-data-for-entry",
    "occupiedQrCode": "qr-data-for-exit" // Available after entry
  }
}
```

### 👨‍💼 Admin Endpoints

| Method | Endpoint                      | Description              | Auth Required |
| ------ | ----------------------------- | ------------------------ | ------------- |
| `GET`  | `/api/admin/stats`            | Get dashboard statistics | ✅ (Admin)    |
| `GET`  | `/api/admin/users`            | Get all users            | ✅ (Admin)    |
| `GET`  | `/api/admin/slots`            | Get all parking slots    | ✅ (Admin)    |
| `POST` | `/api/admin/release`          | Release occupied slot    | ✅ (Admin)    |
| `GET`  | `/api/admin/requests`         | Get parking requests     | ✅ (Admin)    |
| `POST` | `/api/admin/scan-qr`          | Scan QR code             | ✅ (Admin)    |
| `PUT`  | `/api/admin/users/:id/status` | Update user status       | ✅ (Admin)    |

#### Dashboard Statistics

```json
GET /api/admin/stats
Authorization: Bearer <admin-token>

Response: {
  "success": true,
  "data": {
    "parking": {
      "totalSlots": 18,
      "availableSlots": 12,
      "occupiedSlots": 4,
      "reservedSlots": 2,
      "maintenanceSlots": 0
    },
    "users": {
      "totalUsers": 150,
      "activeUsers": 145,
      "blockedUsers": 5
    },
    "revenue": {
      "today": 450.00,
      "thisMonth": 12500.00,
      "totalBookings": 1250
    }
  }
}
```

#### Get All Users

```json
GET /api/admin/users
Authorization: Bearer <admin-token>

Response: {
  "success": true,
  "users": [
    {
      "id": "user-id",
      "name": "John Doe",
      "email": "john@example.com",
      "vehicleNumber": "ABC-1234",
      "status": "active", // "active", "blocked"
      "totalBookings": 25,
      "joinedAt": "2025-10-15T08:30:00Z"
    }
  ]
}
```

#### Scan QR Code

```json
POST /api/admin/scan-qr
Authorization: Bearer <admin-token>
Content-Type: application/json

{
  "qrData": "encrypted-qr-data-string"
}

Response: {
  "success": true,
  "action": "entry", // "entry" or "exit"
  "user": {
    "name": "John Doe",
    "vehicleNumber": "ABC-1234"
  },
  "slot": {
    "id": "A-01",
    "location": "Ground Floor - Zone A"
  }
}
```

## 🗂️ Database Models

### User Model

```javascript
{
  _id: ObjectId,
  name: String, // Required
  email: String, // Required, unique
  password: String, // Required, hashed with bcrypt
  vehicleNumber: String, // Optional
  role: String, // "user" | "admin", default: "user"
  status: String, // "active" | "blocked", default: "active"
  createdAt: Date,
  updatedAt: Date
}
```

### ParkingSlot Model

```javascript
{
  _id: ObjectId,
  id: String, // Unique identifier ("A-01", "B-02", etc.)
  status: String, // "available" | "reserved" | "occupied" | "maintenance"
  vehicleNumber: String, // Vehicle currently using slot
  bookedBy: ObjectId, // Reference to User
  bookingTime: Date,
  occupiedTime: Date,
  reservationQrCode: String, // QR for entry
  occupiedQrCode: String, // QR for exit
  location: String, // Human-readable location
  createdAt: Date,
  updatedAt: Date
}
```

### CompletedParking Model

```javascript
{
  _id: ObjectId,
  userId: ObjectId, // Reference to User
  slotId: String,
  vehicleNumber: String,
  bookingTime: Date,
  occupiedTime: Date,
  exitTime: Date,
  duration: Number, // In minutes
  cost: Number, // Calculated parking cost
  paymentStatus: String, // "pending" | "paid" | "failed"
  createdAt: Date
}
```

## ⚙️ System Configuration

### Automatic Initialization

- **18 Parking Slots**: Automatically created (A-01 to A-06, B-01 to B-06, C-01 to C-06)
- **Admin Account**: Created on first startup
  - Email: `admin@parking.com`
  - Password: `admin123`
  - Role: `admin`

### Security Features

- **Password Hashing**: bcryptjs with salt rounds
- **JWT Authentication**: 7-day token expiration
- **Input Validation**: Comprehensive request validation
- **Rate Limiting**: API endpoint protection
- **CORS Configuration**: Cross-origin resource sharing

### Environment Variables

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# Security
JWT_SECRET=your-super-secret-jwt-key-min-32-characters-long
JWT_EXPIRES_IN=7d

# Database
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/parking-management

# Optional: Email Configuration (for notifications)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
```

## 🔧 Development

### Available Scripts

```bash
# Start development server with hot reload
npm run dev

# Start production server
npm start

# Run tests
npm test

# Check code style
npm run lint

# Fix code style issues
npm run lint:fix
```

### Technology Stack

- **Runtime**: Node.js v14+
- **Framework**: Express.js
- **Database**: MongoDB Atlas
- **ODM**: Mongoose
- **Authentication**: JWT (jsonwebtoken)
- **Security**: bcryptjs, helmet, express-rate-limit
- **Validation**: express-validator
- **Environment**: dotenv
- **Development**: nodemon

## 📝 License

ISC License - see LICENSE file for details
