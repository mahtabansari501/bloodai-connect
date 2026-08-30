# BloodAI Connect 🩸🤖
> **Connecting Lives, Smartly.**

[![Live Demo](https://img.shields.io/badge/Live_Demo-Visit_Website-b71c1c?style=for-the-badge&logo=vercel&logoColor=white)](#) 
[![Tech Stack](https://img.shields.io/badge/Stack-MERN%20%7C%20Socket.io%20%7C%20Gemini%20AI-0d2a63?style=for-the-badge)](#)

🌐 **Live Website Link**: [https://bloodai-connect.vercel.app](https://bloodai-connect.vercel.app) *(Deploy hote hi active ho jayega)*

BloodAI Connect is a modern, full-stack, real-time emergency blood donation and healthcare resource platform. Powered by Google Gemini AI and WebSockets, it bridges the gap between blood donors, hospitals, and emergency patients in real time.

---

## 🎯 The Problem & Our Solution

### 🚨 The Problem
During critical medical emergencies, finding compatible blood units within the "golden hour" is often fragmented and life-threatening:
- **Lack of Real-Time Visibility**: Hospitals and blood banks often operate in silos with no shared real-time inventory visibility.
- **Delayed Donor Response**: Manual calling and uncoordinated social media forwards cause critical delays when minutes count.
- **Compatibility Confusion**: In urgent scenarios, matching rare or compatible blood groups leads to avoidable delays.
- **Unpredictable Shortages**: Facilities struggle with inventory stockouts without proactive demand forecasting.

### 💡 The Solution: BloodAI Connect
BloodAI Connect creates an intelligent, real-time ecosystem:
- **Instant SOS Broadcasts**: Pushes high-urgency alerts directly to nearby compatible donors via WebSockets.
- **Live Donor & Hospital Tracking**: Interactive Leaflet maps show active emergency hotspots and real-time donor navigation.
- **Gemini AI Intelligence**: Automated blood demand forecasting to prevent stockouts and a 24/7 AI health assistant.
- **Transparent Healthcare Network**: Connects donors, hospitals, and community donation camps on a unified platform.

---

## 🌟 Key Features

### 1. 🚨 Real-Time Emergency SOS Broadcasts
- **Instant Alerts**: Patients or hospitals can raise high-priority SOS emergency blood requests.
- **WebSocket Push**: Instant push alerts across all connected active donors and hospital dashboards via Socket.io.
- **Smart Compatibility Matching**: Automatically maps universal and compatible donor groups (e.g., O-, A+, B+, AB+).
- **One-Click Navigation**: Direct Google Maps routing to the patient's hospital or location.

### 2. 🗺️ Interactive Live Map & Donor Tracking
- **Interactive Geo-Map**: Powered by Leaflet and React-Leaflet.
- **Live SOS Markers**: Visual indicators of urgent blood requests across the city.
- **Real-Time Donor Location**: Live socket broadcasts of donors en route to save lives.

### 3. 🤖 AI Assistant & Demand Prediction (Google Gemini)
- **BloodAI Chatbot**: Intelligent chatbot answering donor eligibility questions, donation health tips, and platform assistance.
- **Smart Demand Prediction**: AI-powered inventory analysis to predict blood stock shortages before critical emergencies occur.

### 4. 🏥 Hospital Blood Bank & Inventory Management
- Real-time stock tracking for all blood groups and critical medical supplies.
- Instant synchronization across departments with automatic threshold warnings.

### 5. 🎪 Community Blood Donation Camps
- Discover upcoming community donation drives organized by verified hospitals and NGOs.
- Donor eligibility guidelines and comprehensive donation FAQs.

### 6. 🛡️ Role-Based Access & Profiles
- Tailored dashboards for **Donors**, **Hospitals**, and **Organizations**.
- Donor availability toggle, life-saving impact statistics, and custom profile badges.

---

## 🛠️ Tech Stack

- **Frontend**:
  - React 19 + Vite
  - Tailwind CSS v4
  - Lucide React (Icons)
  - Leaflet & React-Leaflet (Maps)
  - Socket.io Client (Real-time events)
  - React Hot Toast (Alert notifications)

- **Backend**:
  - Node.js & Express 5
  - MongoDB & Mongoose (Database)
  - Socket.io (WebSocket Server)
  - Google Generative AI SDK (`@google/generative-ai`)
  - JSON Web Tokens (JWT) & BcryptJS (Secure Authentication)

---

## 🚀 Local Development Setup

### 1. Clone the repository
```bash
git clone https://github.com/mahtabansari501/bloodai-connect.git
cd bloodai-connect
```

### 2. Configure Environment Variables
- In the `server` directory, create a `.env` file based on `.env.example`:
  ```env
  PORT=5000
  MONGODB_URI=your_mongodb_connection_string
  GEMINI_API_KEY=your_gemini_api_key
  JWT_SECRET=your_jwt_secret
  ```
- In the `client` directory, create a `.env` file:
  ```env
  VITE_API_URL=http://localhost:5000
  ```

### 3. Run the Application
- **Start Backend**:
  ```bash
  cd server
  npm install
  npm run dev
  ```
- **Start Frontend**:
  ```bash
  cd client
  npm install
  npm run dev
  ```

---

## 📄 License
This project is licensed under the ISC License.

