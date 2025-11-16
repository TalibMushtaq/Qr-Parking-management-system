# 🎨 QR Parking Management - Frontend

[![React](https://img.shields.io/badge/React-18+-blue.svg)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-5+-purple.svg)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.x-cyan.svg)](https://tailwindcss.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-Ready-blue.svg)](https://www.typescriptlang.org/)
[![License](https://img.shields.io/badge/License-ISC-yellow.svg)]()

Modern React.js frontend application with Vite, Tailwind CSS, and shadcn/ui components for the QR-Based Smart Parking Management System. Features a responsive design, real-time updates, and an intuitive user experience.

## 🚀 Quick Start

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn

### Installation

1. **Navigate to frontend directory:**

```bash
cd frontend
```

2. **Install dependencies:**

```bash
npm install
```

3. **Environment Setup (Optional):**
   Create a `.env` file in the frontend directory:

```env
VITE_API_URL=http://localhost:5000/api
VITE_APP_NAME=QR Parking Management
VITE_ENABLE_DEV_TOOLS=true
```

4. **Start the development server:**

```bash
npm run dev
```

✅ **Application will be running at:** `http://localhost:3001`

## 📦 Build for Production

```bash
# Create optimized production build
npm run build

# Preview production build locally
npm run preview

# Run build analysis
npm run build -- --analyze
```

This creates an optimized production build in the `dist/` folder with:

- Code splitting and tree shaking
- Minified and compressed assets
- Optimized images and fonts
- Service worker for caching (PWA ready)

## 🛠️ Tech Stack

### Core Technologies

- **React 18** - Modern React with hooks and concurrent features
- **Vite** - Fast build tool and dev server with hot module replacement
- **Tailwind CSS** - Utility-first CSS framework with custom design system
- **TypeScript** - Type-safe JavaScript with enhanced developer experience

### UI Components & Libraries

- **shadcn/ui** - High-quality React components built on Radix UI primitives
- **Radix UI** - Low-level UI primitives for accessibility and customization
- **Lucide React** - Beautiful and consistent icon library
- **React Hot Toast** - Modern toast notifications
- **qrcode.react** - QR code generation and display components

### State Management & API

- **React Query/TanStack Query** - Server state management with caching
- **Axios** - HTTP client with interceptors and request/response handling
- **React Router Dom** - Client-side routing with nested routes
- **React Hook Form** - Performant forms with minimal re-renders

### Development Tools

- **ESLint** - Code linting and style enforcement
- **Prettier** - Code formatting and style consistency
- **PostCSS** - CSS processing with autoprefixer
- **Vite PWA** - Progressive Web App capabilities

## 📁 Project Structure

```
src/
├── components/           # Reusable React components
│   ├── ui/              # shadcn/ui base components
│   │   ├── button.jsx   # Button variations and states
│   │   ├── card.jsx     # Card containers and layouts
│   │   ├── input.jsx    # Form input components
│   │   ├── label.jsx    # Form labels with accessibility
│   │   ├── tabs.jsx     # Tab navigation components
│   │   └── alert.jsx    # Alert and notification components
│   ├── Auth.jsx         # Authentication forms (login/signup)
│   ├── Navbar.jsx       # Navigation bar with user menu
│   ├── UserDashboard.jsx # User parking management interface
│   ├── AdminDashboard.jsx # Admin control panel
│   ├── ParkingSlots.jsx # Interactive parking grid
│   ├── CurrentBooking.jsx # Active booking display with QR
│   ├── QRScanner.jsx    # Camera-based QR code scanner
│   ├── QRModal.jsx      # QR code display modal
│   ├── QRCodeSummary.jsx # QR code information display
│   ├── ParkingHistory.jsx # User booking history
│   ├── ReservationCountdown.jsx # Booking timer
│   ├── LoadingOverlay.jsx # Loading states
│   └── ProtectedRoute.jsx # Route authentication wrapper
├── pages/               # Page components (route components)
│   ├── HomePage.jsx     # Landing page with features
│   ├── UserAuth.jsx     # User authentication page
│   ├── UserDashboardPage.jsx # User dashboard wrapper
│   ├── AdminLogin.jsx   # Admin login page
│   └── AdminDashboard.jsx # Admin dashboard page
├── services/            # API service functions
│   └── api.js          # Axios client with interceptors
├── lib/                 # Utility functions and helpers
│   └── utils.js        # Tailwind class utilities (cn helper)
├── hooks/               # Custom React hooks
│   ├── useAuth.js      # Authentication state management
│   ├── useBooking.js   # Booking state management
│   └── useWebSocket.js # Real-time updates
├── contexts/            # React context providers
│   └── AuthContext.jsx # Global authentication state
├── App.jsx             # Main application component with routing
├── main.jsx            # Application entry point
└── index.css           # Global styles and Tailwind imports
```

## 🧩 Components Overview

### shadcn/ui Base Components

- **Button** - Multiple variants (default, outline, ghost, destructive) with loading states
- **Card** - Flexible container with header, content, and footer sections
- **Input** - Form inputs with validation states and accessibility features
- **Label** - Form labels with proper accessibility associations
- **Tabs** - Tab navigation with keyboard support and dynamic content
- **Alert** - Contextual alerts for success, error, warning, and info states

### Custom Feature Components

#### 🔐 Authentication & Navigation

- **Auth** - Unified login/signup form with validation and error handling
- **Navbar** - Responsive navigation with user menu, notifications, and theme toggle
- **ProtectedRoute** - Route wrapper for authentication-required pages

#### 🚗 Parking Management

- **ParkingSlots** - Interactive grid showing real-time slot availability
- **CurrentBooking** - Active booking card with QR codes and countdown timer
- **ReservationCountdown** - Real-time countdown for reservation expiry
- **ParkingHistory** - Paginated history of user's past bookings

#### 📱 QR Code Features

- **QRModal** - Full-screen QR code display with download functionality
- **QRScanner** - Camera-based QR code scanner with validation
- **QRCodeSummary** - Detailed QR code information display

#### 👨‍💼 Dashboard Components

- **UserDashboard** - Comprehensive user interface with slot booking
- **AdminDashboard** - Admin control panel with analytics and management tools
- **LoadingOverlay** - Elegant loading states with animations

### Component Features

- **Responsive Design** - Mobile-first approach with breakpoint optimizations
- **Accessibility** - WCAG 2.1 AA compliance with ARIA attributes
- **Theme Support** - Light/dark mode with system preference detection
- **Animation** - Smooth transitions and micro-interactions using Framer Motion
- **Error Boundaries** - Graceful error handling with fallback UI

## 🎨 Styling & Design System

### Design Philosophy

The application follows a modern, clean design philosophy with:

- **Minimalist Interface** - Focus on content with reduced visual clutter
- **Consistent Spacing** - 8px base unit system for predictable layouts
- **Accessibility First** - High contrast ratios and keyboard navigation
- **Mobile Responsive** - Progressive enhancement from mobile to desktop

### Tailwind CSS Configuration

Custom design tokens defined in `tailwind.config.js`:

```javascript
// Color Palette
colors: {
  primary: {
    50: '#eff6ff',   // Light blue backgrounds
    500: '#3b82f6',  // Primary brand color
    600: '#2563eb',  // Primary hover state
    900: '#1e3a8a'   // Dark blue text
  },
  gray: {
    50: '#f9fafb',   // Light backgrounds
    100: '#f3f4f6',  // Card backgrounds
    500: '#6b7280',  // Secondary text
    900: '#111827'   // Primary text
  }
}

// Typography Scale
fontSize: {
  'xs': ['0.75rem', '1rem'],     // 12px, line-height 16px
  'sm': ['0.875rem', '1.25rem'], // 14px, line-height 20px
  'base': ['1rem', '1.5rem'],    // 16px, line-height 24px
  'lg': ['1.125rem', '1.75rem'], // 18px, line-height 28px
  'xl': ['1.25rem', '1.75rem']   // 20px, line-height 28px
}

// Spacing System (4px base unit)
spacing: {
  '1': '0.25rem',  // 4px
  '2': '0.5rem',   // 8px
  '4': '1rem',     // 16px
  '6': '1.5rem',   // 24px
  '8': '2rem'      // 32px
}
```

### Component Styling Patterns

- **Card Components** - White background with subtle shadows and rounded corners
- **Interactive Elements** - Hover states with smooth transitions (200ms)
- **Form Controls** - Consistent focus rings and validation states
- **Loading States** - Skeleton screens and spinner animations
- **Responsive Breakpoints** - Mobile-first with sm, md, lg, xl breakpoints

## 🌍 Environment Variables

Create a `.env` file in the frontend root directory:

```env
# API Configuration
VITE_API_URL=http://localhost:5000/api
VITE_API_TIMEOUT=10000

# Application Settings
VITE_APP_NAME=QR Parking Management
VITE_APP_VERSION=2.0.0
VITE_APP_DESCRIPTION=Smart Parking Management System

# Feature Flags
VITE_ENABLE_PWA=true
VITE_ENABLE_DEV_TOOLS=true
VITE_ENABLE_ANALYTICS=false

# QR Code Settings
VITE_QR_CODE_SIZE=250
VITE_QR_ERROR_CORRECTION=M

# Development
VITE_SHOW_DEV_OVERLAY=true
VITE_HOT_RELOAD=true

# Optional: Third-party Services
VITE_GOOGLE_ANALYTICS_ID=
VITE_SENTRY_DSN=
VITE_STRIPE_PUBLIC_KEY=
```

### Environment Variable Usage

```javascript
// In your components
const apiUrl = import.meta.env.VITE_API_URL;
const appName = import.meta.env.VITE_APP_NAME;
const isDev = import.meta.env.DEV;
const isProd = import.meta.env.PROD;
```

## ✨ Key Features

### 🔐 User Authentication & Management

- **Secure Registration** - Email validation with strong password requirements
- **JWT Authentication** - Persistent login sessions with automatic token refresh
- **Role-based Access** - User and admin role differentiation
- **Profile Management** - Update personal information and vehicle details

### 🚗 Smart Parking Features

- **Real-time Slot Availability** - Live updates of parking slot status
- **Instant Slot Booking** - Reserve parking spots with vehicle information
- **QR Code Integration** - Generate and scan QR codes for entry/exit
- **Booking Management** - View, modify, and cancel active reservations
- **Parking History** - Complete history of past parking sessions
- **Timer Countdown** - Real-time countdown for reservation expiry

### 👨‍💼 Admin Dashboard

- **Comprehensive Analytics** - Revenue, usage, and performance metrics
- **User Management** - View and manage registered users
- **Slot Management** - Real-time parking slot control and monitoring
- **QR Code Scanning** - Manual QR code validation for entry/exit
- **Request Management** - Handle user requests and issues
- **Revenue Tracking** - Financial analytics and reporting

### 📱 User Experience

- **Responsive Design** - Optimized for mobile, tablet, and desktop
- **Progressive Web App** - Installable with offline capabilities
- **Dark/Light Mode** - Theme switching with system preference detection
- **Real-time Notifications** - Toast messages for important updates
- **Intuitive Navigation** - Clean, accessible interface design
- **Loading States** - Smooth loading animations and skeleton screens

### 🔧 Technical Features

- **Hot Module Replacement** - Instant development feedback
- **Code Splitting** - Optimized bundle sizes with lazy loading
- **Error Boundaries** - Graceful error handling and recovery
- **TypeScript Ready** - Type safety and enhanced developer experience
- **PWA Support** - Service worker for caching and offline functionality
- **Performance Monitoring** - Built-in performance tracking and optimization

## 🛠️ Development

### Available Scripts

```bash
# Development server with hot reload
npm run dev

# Build for production
npm run build

# Preview production build locally
npm run preview

# Run tests (Jest + React Testing Library)
npm run test

# Run tests in watch mode
npm run test:watch

# Code quality and formatting
npm run lint          # ESLint checks
npm run lint:fix       # Fix ESLint issues
npm run format         # Prettier formatting
npm run type-check     # TypeScript type checking

# Bundle analysis
npm run analyze        # Analyze bundle size and dependencies
```

### Development Workflow

1. **Start Development Server:**

```bash
npm run dev
```

2. **Code Quality Checks:**

```bash
# Run before committing
npm run lint
npm run type-check
npm run test
```

3. **Build and Test:**

```bash
npm run build
npm run preview
```

### Performance Optimization

- **Vite Build Optimizations** - Tree shaking, code splitting, asset optimization
- **React Performance** - Lazy loading, memo optimization, virtual scrolling
- **Image Optimization** - Responsive images with WebP format support
- **Bundle Analysis** - Regular bundle size monitoring and optimization
- **Caching Strategy** - Service worker for static asset caching

### Code Quality Standards

- **ESLint Rules** - Enforced coding standards with React hooks rules
- **Prettier Configuration** - Consistent code formatting across the project
- **TypeScript** - Type safety with strict mode enabled
- **Testing Coverage** - Minimum 80% test coverage requirement
- **Accessibility** - WCAG 2.1 AA compliance testing

## 📄 License

ISC License - see LICENSE file for details

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

### Development Guidelines

- Follow existing code style and conventions
- Write tests for new features and bug fixes
- Update documentation for API changes
- Ensure all tests pass before submitting PR
- Use semantic commit messages

---

**Built with ❤️ for smarter urban mobility solutions**
