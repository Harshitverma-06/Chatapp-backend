# Chat App Backend API

A scalable and production-ready backend for a real-time chat application built using modern backend technologies. This project focuses on clean architecture, secure authentication, and efficient data handling.

---

## Features

* 🔐 User Authentication (JWT-based)
* 👥 User & Conversation Management
* 🖼️ Media Upload Support (Cloud storage)
* ⚡ Rate Limiting & Security Middleware
* 📄 API Documentation (Swagger)
* 🗄️ PostgreSQL Database Integration
* 🧠 Structured & Modular Backend Architecture

---

## 🛠️ Tech Stack

* **Backend:** Node.js, Express.js, javascript
* **Database:** MongoDB
* **Authentication:** JWT
* **Validation:** Mannual
* **API Docs:** Swagger
* **Deployment:** Render

---

## 📂 Project Structure

```
src/
├── controllers/
├── db/
├── middleware/
├── models/
├── routes/
├── service/
├── utils/
```
---

## ⚙️ Installation & Setup

### 1. Clone the repository

```
git clone https://github.com/Harshitverma-06/Chatapp-backend.git
cd chat-app-backend
```

### 2. Install dependencies

```
npm install
```

### 3. Setup environment variables

Create a `.env` file:

```
PORT=3000
DATABASE_URL=your_MongoDB_connection
JWT_SECRET=your_secret
CLOUDINARY_URL=your_cloudinary_config
```

---

### 4. Run the server

```
npm run dev
```

Server will run on:

```
http://localhost:3000
```

---

## 📄 API Documentation

Swagger UI available at:

```
/api/docs
```

👉 Example:

```
https://chatapp-backend-vofr.onrender.com/api-docs
```

---

## Authentication Flow

1. User Signup/Login
2. JWT Token is generated
3. Token is sent via headers/cookies
4. Protected routes verify token

---

## Key API Endpoints

### Auth

* `POST /api/auth/register`
* `POST /api/auth/login`
* `POST /api/auth/logout`
...

### Messages

* `GET /api/messages`
* `POST /api/messages/send`
...
---

## API Testing

You can test APIs using:

* Swagger UI (`/api/docs`)

---

## Deployment

Backend is deployed on Render:

```
https://chatapp-backend-vofr.onrender.com
```

---

## Future Improvements

* ✅ Redis caching for performance
* ✅ Message queue (BullMQ / Kafka)
* ✅ Email verification system
* ✅ WebSocket scaling

