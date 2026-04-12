# 🛡️ IntelliCred: AI-Powered Video Loan Platform

IntelliCred is a state-of-the-art, full-stack financial onboarding platform that leverages **AI-driven Video KYC**, real-time **Speech-to-Text (STT)**, and **Large Language Models (LLM)** to provide instant, secure loan approvals.

Built with the **MERN stack** and designed with a premium **glassmorphism aesthetic**, IntelliCred redefines modern banking by bridging the gap between security and speed.

---

## 🚀 Key Features

### 📞 AI Video KYC & WebRTC
- **Real-time Video Calls**: Secure, peer-to-peer video streaming using `simple-peer` and `WebRTC`.
- **Live STT**: Browser-native Speech-to-Text transcribes applicant answers instantly.
- **Biometric Detection**: Integrated logic for age and presence detection (Expandable with CV modules).

### 🧠 Intelligence Layer
- **LLM Processing**: Uses local **Ollama** (Llama 3) to analyze transcripts and extract structured JSON (Income, Employment, Intent).
- **Automated Risk Engine**: A rule-based service that evaluates eligibility and generates loan offers in seconds.
- **Audit Logging**: Full traceability for regulatory compliance with session-based audit logs.

### 🎨 Premium UI/UX
- **Glassmorphism Design**: Modern, responsive interface built with **Tailwind CSS v4**.
- **Unified Auth**: Secure JWT-based registration and login system.
- **Interactive Dashboard**: Real-time application tracking and progress visualization.

---

## 🛠️ Technology Stack

- **Frontend**: React 19, Vite, Tailwind CSS v4, Framer Motion, Lucide Icons, Socket.io-client.
- **Backend**: Node.js, Express, MongoDB, Mongoose, Socket.io.
- **AI**: Ollama (LLM), Browser SpeechRecognition API.
- **Peer-to-Peer**: Simple-Peer (WebRTC).

---

## 📦 Installation & Setup

### Prerequisites
- Node.js (v18+)
- MongoDB (Atlas or Local)
- [Ollama](https://ollama.com/) (Running locally for LLM processing)

### Backend Setup
1. `cd backend`
2. `npm install`
3. Create `.env` file:
   ```env
   PORT=5000
   MONGO_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret
   ```
4. `npm run dev`

### Frontend Setup
1. `cd frontend`
2. `npm install`
3. Create `.env` file:
   ```env
   VITE_API_URL=http://localhost:5000/api/v1
   VITE_SOCKET_URL=http://localhost:5000
   ```
4. `npm run dev`

---

## 🏦 Workflow
1. **User Sign-up**: Create a secure account.
2. **Dashboard**: Start a "New Application".
3. **Video KYC**: Connect with a virtual agent, answer financial questions.
4. **AI Processing**: LLM extracts data -> Risk Engine calculates eligibility.
5. **Instant Decision**: Receive your pre-approved loan offer in ₹ (Rupees).

---

## 📜 License
Distributed under the MIT License. See `LICENSE` for more information.

Developed with ❤️ by Antigravity.
