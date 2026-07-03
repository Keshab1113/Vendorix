# Vendorix

> A premium SaaS-style Vendor Booking Dashboard built with the MERN Stack

![React](https://img.shields.io/badge/React-18.2.0-61DAFB?style=flat-square&logo=react)
![Node.js](https://img.shields.io/badge/Node.js-20+-339933?style=flat-square&logo=node.js)
![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248?style=flat-square&logo=mongodb)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4-38B2AC?style=flat-square&logo=tailwind-css)
![Vite](https://img.shields.io/badge/Vite-5.4-646CFF?style=flat-square&logo=vite)

Vendorix helps vendors manage bookings, event inquiries, customer requests, analytics, and business operations through a modern, scalable, and production-ready dashboard experience.


---

## ✨ Features

### 🔐 Authentication System
- JWT Authentication with httpOnly cookies
- Login & Signup with form validation
- Forgot & Reset Password
- Protected Routes with middleware
- Password Hashing with Bcrypt

### 👤 Vendor Profile Management
- Business Profile Management
- Profile Image Upload with Multer
- Portfolio & Gallery Uploads
- Services & Pricing Packages
- Availability Scheduling

### 📅 Event Inquiry Management
- Manage Event Inquiries
- Accept / Reject / Confirm Requests
- Status Tracking (Pending, Contacted, Confirmed, Rejected, Completed)
- Search & Filters
- Pagination

### 📊 Dashboard Analytics
- Total Bookings Overview
- Revenue Analytics with Charts
- Monthly Earnings Tracking
- Inquiry Conversion Rate
- Upcoming Events
- Customer Growth Analytics

### 🔔 Notification System
- Real-Time Notifications
- Mark as Read/Unread
- Delete Notifications
- Notification Types (Inquiry, Booking, System)

### 🎨 Premium SaaS UI
- Fully Responsive Design (Mobile, Tablet, Desktop)
- Dark Theme
- Glassmorphism Effects
- Smooth Animations with Framer Motion
- Modern Dashboard Layout

---

## 🛠️ Tech Stack

### Frontend
| Technology | Purpose |
|------------|---------|
| React 18 | UI Library |
| Vite | Build Tool |
| Tailwind CSS | Styling |
| TanStack Query | Data Fetching |
| React Router DOM | Routing |
| React Hook Form + Zod | Form Validation |
| Framer Motion | Animations |
| Lucide React | Icons |
| Recharts | Charts |

### Backend
| Technology | Purpose |
|------------|---------|
| Node.js | Runtime |
| Express.js | Web Framework |
| MongoDB + Mongoose | Database |
| JWT | Authentication |
| Bcrypt | Password Hashing |
| Multer | File Uploads |
| Zod | Server-side Validation |

---

## 📂 Project Structure

```
vendorix/
├── client/                    # React Frontend
│   ├── src/
│   │   ├── api/              # API client configuration
│   │   ├── components/       # Reusable UI components
│   │   │   └── ui/          # Base UI components (Button, Input, Card, etc.)
│   │   ├── hooks/           # Custom React hooks
│   │   ├── layouts/         # Page layouts
│   │   ├── lib/             # Utilities and validations
│   │   ├── pages/           # Page components
│   │   │   ├── auth/        # Authentication pages
│   │   │   ├── dashboard/   # Dashboard pages
│   │   │   └── settings/    # Settings pages
│   │   ├── routes/          # Route configurations
│   │   ├── services/         # API service functions
│   │   ├── store/           # Zustand state management
│   │   ├── styles/          # Global styles
│   │   └── main.jsx         # Entry point
│   ├── index.html
│   ├── package.json
│   └── vite.config.js
│
├── server/                   # Express Backend
│   ├── config/              # Configuration files
│   │   └── database.js     # MongoDB connection
│   ├── controllers/         # Route controllers
│   ├── database/            # Database setup scripts
│   ├── middleware/          # Express middleware
│   ├── models/              # Mongoose models
│   ├── routes/              # API routes
│   ├── services/            # Business logic
│   ├── utils/               # Utility functions
│   ├── validators/          # Zod validation schemas
│   ├── uploads/             # Uploaded files
│   ├── index.js             # Server entry point
│   └── package.json
│
├── README.md
└── package.json             # Root package.json (optional)
```

---

## ⚡ Quick Start

### Prerequisites
- Node.js 18+ installed
- MongoDB Atlas account or local MongoDB

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/vendorix.git
cd vendorix
```

### 2. Backend Setup

```bash
cd server
npm install
```

Create a `.env` file in the server folder:

```env
PORT=5000
MONGODB_URI=mongodb+srv://your_mongodb_connection_string
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
```

Start the backend server:

```bash
npm run dev
```

Backend runs on: `http://localhost:5000`

### 3. Frontend Setup

```bash
cd client
npm install
npm run dev
```

Frontend runs on: `http://localhost:5173`

---

## 🔑 Demo Credentials

The application comes with pre-filled demo credentials for testing:

- **Email:** demo@vendorix.com
- **Password:** password123

---

## 🌍 API Endpoints

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login user |
| POST | `/api/auth/logout` | Logout user |
| GET | `/api/auth/me` | Get current user |
| POST | `/api/auth/forgot-password` | Request password reset |
| POST | `/api/auth/reset-password` | Reset password |
| POST | `/api/auth/refresh` | Refresh access token |
| PUT | `/api/auth/password` | Change password |

### Vendors
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/vendors/profile` | Get vendor profile |
| PUT | `/api/vendors/profile` | Update vendor profile |
| POST | `/api/vendors/avatar` | Upload avatar |
| GET | `/api/vendors/services` | Get services |
| POST | `/api/vendors/services` | Create service |
| PUT | `/api/vendors/services/:id` | Update service |
| DELETE | `/api/vendors/services/:id` | Delete service |
| GET | `/api/vendors/packages` | Get packages |
| POST | `/api/vendors/packages` | Create package |
| PUT | `/api/vendors/packages/:id` | Update package |
| DELETE | `/api/vendors/packages/:id` | Delete package |

### Inquiries
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/inquiries` | Get all inquiries |
| GET | `/api/inquiries/:id` | Get inquiry by ID |
| POST | `/api/inquiries` | Create inquiry |
| PUT | `/api/inquiries/:id` | Update inquiry |
| PATCH | `/api/inquiries/:id/status` | Update status |
| DELETE | `/api/inquiries/:id` | Delete inquiry |

### Bookings
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/bookings` | Get all bookings |
| GET | `/api/bookings/:id` | Get booking by ID |
| POST | `/api/bookings` | Create booking |
| PUT | `/api/bookings/:id` | Update booking |
| PATCH | `/api/bookings/:id/status` | Update status |
| DELETE | `/api/bookings/:id` | Cancel booking |

### Dashboard
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/dashboard/stats` | Get dashboard statistics |
| GET | `/api/dashboard/analytics` | Get analytics data |
| GET | `/api/dashboard/revenue` | Get revenue data |
| GET | `/api/dashboard/recent-activity` | Get recent activity |

### Notifications
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/notifications` | Get notifications |
| PATCH | `/api/notifications/:id/read` | Mark as read |
| PATCH | `/api/notifications/read-all` | Mark all as read |
| DELETE | `/api/notifications/:id` | Delete notification |

---

## 🔒 Security Features

- JWT Authentication with access/refresh tokens
- Password hashing with Bcrypt (12 rounds)
- Protected API routes with middleware
- Input validation with Zod (client & server)
- Rate limiting (100 requests per 15 minutes)
- Helmet.js for security headers
- CORS configuration
- MongoDB injection protection

---

## 📱 Responsive Design

Vendorix is fully optimized for all devices:
- 📱 Mobile (320px+)
- 📱 Tablet (768px+)
- 💻 Laptop (1024px+)
- 🖥️ Desktop (1280px+)

---

## 🚀 Deployment

### Frontend
- **Vercel** (recommended)
- **Netlify**

### Backend
- **Render** (recommended)
- **Railway**
- **Heroku**

### Database
- **MongoDB Atlas** (recommended)

---

## 👨‍💻 Author

**Keshab Das**
- MERN Stack Developer
- Frontend & Backend Engineer
- Passionate about building scalable SaaS applications

---

## ⭐ Show Your Support

If you find this project useful, please give it a ⭐ on GitHub!

---
