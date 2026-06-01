# Vendorix

A premium SaaS-style Vendor Booking Dashboard built using the MERN Stack, MySQL, Tailwind CSS, Shadcn/UI, and TanStack Query. Vendorix helps vendors manage bookings, event inquiries, analytics, and business operations through a modern, responsive, and production-ready platform.

---

## 🚀 Features

### 🔐 Authentication System

* JWT Authentication
* Login & Signup
* Forgot & Reset Password
* Protected Routes
* Role-Based Access Control
* Secure Password Hashing

### 👤 Vendor Profile Management

* Vendor Business Profiles
* Portfolio & Gallery Uploads
* Service & Pricing Management
* Availability Calendar
* Editable Profile Settings

### 📅 Event Inquiry Management

* Manage Event Requests
* Inquiry Status Tracking
* Accept / Reject Bookings
* Search & Filter Inquiries
* Pagination & Real-Time Updates

### 📊 Dashboard Analytics

* Revenue Insights
* Booking Statistics
* Inquiry Conversion Rates
* Upcoming Events
* Interactive Charts & Graphs

### 🎨 Modern SaaS UI

* Fully Responsive Design
* Dark Theme
* Premium Dashboard Layout
* Smooth Animations
* Shadcn/UI Components
* Mobile Optimized

---

# 🛠️ Tech Stack

## Frontend

* React.js
* Vite
* Tailwind CSS
* Shadcn/UI
* TanStack Query
* React Router DOM
* Axios
* React Hook Form
* Zod
* Framer Motion

## Backend

* Node.js
* Express.js
* MySQL
* JWT Authentication
* Bcrypt
* Multer

---

# 📂 Project Structure

## Frontend

```bash
client/
├── src/
│   ├── api/
│   ├── components/
│   ├── hooks/
│   ├── layouts/
│   ├── pages/
│   ├── routes/
│   ├── services/
│   ├── store/
│   ├── styles/
│   ├── types/
│   ├── utils/
│   └── main.jsx
```

## Backend

```bash
server/
├── controllers/
├── routes/
├── middleware/
├── models/
├── services/
├── validators/
├── config/
├── database/
├── uploads/
├── utils/
└── server.js
```

---

# ⚡ Installation

## Clone Repository

```bash
git clone https://github.com/your-username/vendorix.git
cd vendorix
```

---

## Frontend

```bash
npm install
npm run dev      # Development
npm run build    # Production build
```

## Backend

```bash
cd server
npm install
npm run dev      # Development
npm start        # Production
```

## Database Setup

1. Create MySQL database:
```bash
mysql -u root -p -e "CREATE DATABASE IF NOT EXISTS vendorix;"
```

2. Initialize tables and seed data:
```bash
cd server
npm run seed
```

---

# 🗄️ Environment Variables

Create a `.env` file inside the server folder.

```env
PORT=5000

DB_HOST=localhost
DB_USER=root
DB_PASSWORD=yourpassword
DB_NAME=vendorix

JWT_SECRET=your_secret_key

CLIENT_URL=http://localhost:5173
```

---

# 🧩 Core Modules

* Authentication
* Vendor Management
* Inquiry Management
* Booking System
* Dashboard Analytics
* Notifications
* File Upload System

---

# 📱 Responsive Design

Vendorix is fully optimized for:

* Mobile Devices
* Tablets
* Laptops
* Large Screens

---

# 🎯 UI Design

Inspired by modern SaaS platforms like:

* Linear
* Stripe
* Notion
* Vercel

Design includes:

* Dark Theme
* Glassmorphism
* Premium Cards
* Soft Shadows
* Smooth Animations
* Elegant Typography

---

# 🔒 Security Features

* JWT Authentication
* Password Encryption
* Input Validation
* Protected APIs
* Rate Limiting
* Secure File Uploads
* CORS Protection

---

# 🚀 Future Enhancements

* Real-Time Chat
* Socket.IO Notifications
* Stripe Payments
* Multi-Vendor Support
* AI Booking Insights
* Calendar Scheduling
* Admin Panel
* Email Notifications

---

# 📸 Screenshots

> Add your dashboard screenshots here after development.

---

# 🌐 Deployment

## Frontend

Deploy on:

* Vercel
* Netlify

## Backend

Deploy on:

* Render
* Railway

## Database

* MySQL
* PlanetScale

---

# 👨‍💻 Author

**Keshab Das**

Frontend & Backend Developer
MERN Stack Developer
Passionate about building modern SaaS applications.

---

# ⭐ Support

If you like this project, give it a ⭐ on GitHub and support the development of Vendorix.
