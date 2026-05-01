# 🛡️ IntelliCred: AI-Powered Video Loan Platform

IntelliCred is a state-of-the-art, full-stack financial onboarding platform that leverages **AI-driven Video KYC**, real-time **Speech-to-Text (STT)**, and ultra-fast **Large Language Models (LLM) via Groq** to provide instant, secure loan approvals.

Built with the **MERN stack** and designed with a premium **glassmorphism aesthetic**, IntelliCred redefines modern banking by bridging the gap between security and speed.

---

## 🚀 Key Features

### 📞 AI Video KYC & WebRTC
- **Real-time Video Calls**: Secure, peer-to-peer video streaming using `simple-peer` and `WebRTC`.
- **Live STT**: Browser-native Speech-to-Text transcribes applicant answers instantly.
- **Biometric Detection**: Integrated logic for age and presence detection (Expandable with CV modules).

### 🧠 Intelligence Layer
- **LLM Processing**: Uses the blazing-fast **Groq API** to analyze transcripts and extract structured JSON (Income, Employment, Intent).
- **Automated Risk Engine**: A rule-based service that evaluates eligibility and generates loan offers in seconds.
- **Audit Logging**: Full traceability for regulatory compliance with session-based audit logs.

### 🔒 Enterprise-Grade Security
- **Cloudflare Turnstile**: Frictionless CAPTCHA integrated across all authentication flows to prevent bots.
- **Email Verification**: Nodemailer integration for verifying user emails upon registration.
- **Secure Password Recovery**: Built-in flow for generating expirable reset tokens securely via email.
- **Unified Auth**: Secure JWT-based registration and login system with route protection.

### 🎨 Premium UI/UX
- **Glassmorphism Design**: Modern, responsive interface built with **Tailwind CSS v4**.
- **Interactive Dashboard**: Real-time application tracking and progress visualization.

---

## 🛠️ Technology Stack

- **Frontend**: React 19, Vite, Tailwind CSS v4, Framer Motion, Lucide Icons, Socket.io-client.
- **Backend**: Node.js, Express, MongoDB, Mongoose, Socket.io, Nodemailer.
- **AI**: Groq API (LLM), Browser SpeechRecognition API.
- **Security**: Cloudflare Turnstile, JSON Web Tokens (JWT), Crypto.
- **Peer-to-Peer**: Simple-Peer (WebRTC).

---

## 📦 Installation & Setup

### Prerequisites
- Node.js (v18+)
- MongoDB (Atlas or Local)
- Groq API Key
- Cloudflare Turnstile Site & Secret Keys
- SMTP Credentials (for email sending)

### Backend Setup
1. `cd backend`
2. `npm install`
3. Create `.env` file:
   ```env
   PORT=5000
   MONGO_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret
   FRONTEND_URL=http://localhost:5173
   BACKEND_URL=http://localhost:5000

   # Groq AI
   GROQ_API_KEY=your_groq_api_key

   # Cloudflare Turnstile
   TURNSTILE_SECRET_KEY=your_turnstile_secret_key

   # Nodemailer SMTP
   EMAIL_HOST=smtp.gmail.com
   EMAIL_PORT=587
   EMAIL_USER=your_email@gmail.com
   EMAIL_PASS=your_app_password
   ```
4. `npm run dev`

### Frontend Setup
1. `cd frontend`
2. `npm install`
3. Create `.env` file:
   ```env
   VITE_API_URL=http://localhost:5000/api/v1
   VITE_SOCKET_URL=http://localhost:5000
   VITE_FRONTEND_URL=http://localhost:5173
   VITE_BACKEND_URL=http://localhost:5000
   
   # Cloudflare Turnstile
   VITE_TURNSTILE_SITE_KEY=your_turnstile_site_key
   ```
4. `npm run dev`

---

## 🏦 Workflow
1. **User Sign-up**: Create a secure account, pass Cloudflare Turnstile, and verify via email.
2. **Dashboard**: Start a "New Application".
3. **Video KYC**: Connect with a virtual agent, answer financial questions.
4. **AI Processing**: Groq LLM extracts data -> Risk Engine calculates eligibility.
5. **Instant Decision**: Receive your pre-approved loan offer in ₹ (Rupees).

---

## 📜 License
Distributed under the MIT License. See `LICENSE` for more information.

Developed with ❤️ by Antigravity.
