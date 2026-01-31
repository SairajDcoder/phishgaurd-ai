require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose'); // <--- NEW
const { GoogleGenerativeAI } = require("@google/generative-ai");

const app = express();
app.use(express.json());
app.use(cors());

// 1. CONNECT TO MONGODB (Local or Atlas)
mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/phishguard')
    .then(() => console.log("✅ MongoDB Connected"))
    .catch(err => console.error("❌ MongoDB Error:", err));

// 2. DEFINE THE DATA MODEL
const ScanSchema = new mongoose.Schema({
    text: String,
    type: String, // 'email' or 'url'
    score: Number,
    verdict: String,
    reasons: [String],
    date: { type: Date, default: Date.now }
});
const Scan = mongoose.model('Scan', ScanSchema);

// AI Setup
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

// 3. ANALYZE & SAVE ROUTE
app.post('/api/analyze', async (req, res) => {
    try {
        const { text, type } = req.body;

        const prompt = `
        Analyze this ${type} for phishing risks. 
        Content: "${text}"
        
        Return ONLY a JSON object with this exact structure (no markdown):
        {
            "score": <number 0-100>,
            "verdict": "<"Safe", "Suspicious", or "Phishing">",
            "reasons": ["<reason 1>", "<reason 2>", "<reason 3>"]
        }
        
        IMPORTANT RULES:
        - If "Safe", the score MUST be between 0 and 10.
        - If "Suspicious", the score MUST be between 40 and 70.
        - If "Phishing", the score MUST be between 80 and 100.
        `;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const textResponse = response.text();

        // Clean JSON
        const cleanedText = textResponse.replace(/```json/g, '').replace(/```/g, '').trim();
        const jsonResponse = JSON.parse(cleanedText);

        // 👉 SAVE TO DB (The Magic Step)
        const newScan = await Scan.create({
            text: text.substring(0, 500), // Limit text length to save space
            type,
            score: jsonResponse.score,
            verdict: jsonResponse.verdict,
            reasons: jsonResponse.reasons
        });

        res.json(jsonResponse);

    } catch (error) {
        console.error("AI Error:", error);
        res.status(500).json({ error: "Failed to analyze content" });
    }
});

// 4. NEW ROUTE: GET DASHBOARD STATS
app.get('/api/stats', async (req, res) => {
    try {
        const totalScans = await Scan.countDocuments();
        const phishingCount = await Scan.countDocuments({ verdict: 'Phishing' });
        const safeCount = await Scan.countDocuments({ verdict: 'Safe' });

        // Get recent 5 scans for a "Live Feed"
        const recentScans = await Scan.find().sort({ date: -1 }).limit(5);

        res.json({
            totalScans,
            phishingCount,
            safeCount,
            recentScans
        });
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch stats" });
    }
});

const PORT = 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));