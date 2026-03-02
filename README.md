# 🛡️ PhishGuard: Cyber Defense Hub

> **An AI-powered, multimodal cybersecurity platform that detects, analyzes, and educates users about modern phishing threats.**

## 💡 The Problem

Traditional phishing detectors rely on **static keyword matching** (e.g., simple blacklists or looking for "urgent"). They fail against modern threats like:

- **Social Engineering:** Context-heavy attacks that sound polite and legitimate but are malicious.
- **Image-Based Scams:** Threats hidden inside screenshots or graphics to bypass text filters.
- **"Quishing" (QR Phishing):** Malicious QR codes placed on physical objects, parking meters, or emails.

## 🚀 The Solution: PhishGuard

PhishGuard uses **Generative AI (Gemini 1.5)** to understand the _semantics_ and _context_ of a threat, not just the syntax. It acts as an **Orchestration Layer** that combines OCR, Real-time Scanning, and Gamified Education into a single, comprehensive defense hub.

## ✨ Key Features

### 🕵️‍♂️ Multimodal Analysis

- **Text & URL Scanning:** Paste suspicious emails, SMS messages, or links for instant AI analysis.
- **Image Forensics:** Upload screenshots of chats or emails. PhishGuard extracts text (OCR) and analyzes the visual context for threat indicators.
- **QR Code Sentinel:** Real-time camera detection for malicious QR codes (Quishing) with a safety-first confirmation step before analysis.

### 🧠 Semantic Intelligence

- **Contextual Verdicts:** Doesn't just say "Safe" or "Unsafe"—it explains _why_ (e.g., "The sender domain mimics PayPal but uses a Cyrillic 'a', and the urgency is artificial").
- **Confidence Scoring:** A visual risk meter showing the AI's certainty level regarding the threat.

### 🎓 Cyber Dojo (Gamified Training)

- **AI-Generated Scenarios:** An infinite training mode where the AI invents unique, fresh phishing simulations on the fly.
- **Smart Shuffling:** Algorithms ensure a mix of difficulty levels and threat types (SMS, Email, Pop-ups) to keep users challenged.

### 💼 Enterprise Reporting

- **PDF Exports:** Generates professional, timestamped security audit reports with "PhishGuard Certified" stamping for documentation.
- **Live Audit Log:** Interactive history panel tracking the last 50 scans, allowing users to reload and review past threats.

---

## 🛠️ Tech Stack

- **Frontend:** React.js, Tailwind CSS, Vite
- **Backend:** Node.js, Express.js
- **AI Engine:** Google Gemini API (Generative AI)
- **Database:** MongoDB (for audit logs & stats)
- **Utilities:** `html5-qrcode` (Scanner), `jspdf` (Reports), `multer` (File Handling)

---

## ⚙️ Installation & Setup

### Prerequisites

- Node.js (v16+)
- MongoDB (Local instance or Atlas URL)
- Google Gemini API Key

### 1. Clone the Repository

```bash
git clone [https://github.com/yourusername/PhishGuard.git](https://github.com/yourusername/PhishGuard.git)
cd PhishGuard
2. Backend Setup (The Brain)
```
### 2. Backend Setup (The Brain)
* Navigate to the server directory and install dependencies:
```bash
cd server
npm install
```

* Create a .env file in the server folder with your credentials:
* Code snippet
```bash
PORT=5000
MONGO_URI=mongodb://localhost:27017/phishguard
GEMINI_API_KEY=your_google_gemini_api_key_here
```

* Start the server:
```bash
node index.js
# Output should confirm: Server running on port 5000 | MongoDB Connected
```

### 3. Frontend Setup (The Face)
* Open a new terminal window, navigate to the client directory, and install dependencies:
```bash
cd client
npm install
npm run dev
```
### Access the application at http://localhost:5173.

Made with ❤️ and ☕ by Sairaj
