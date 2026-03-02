require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const multer = require('multer'); // <--- NEW (Uploads)
const Tesseract = require('tesseract.js'); // <--- NEW (OCR)
const fs = require('fs');
const { GoogleGenerativeAI } = require("@google/generative-ai");

const app = express();
app.use(express.json());
app.use(cors());

// 🟢 HELPER FUNCTION: Fisher-Yates Shuffle
// This mixes the array perfectly every time so the pattern is destroyed.
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

// Configure Multer (Temporary storage for uploads)
const upload = multer({ dest: 'uploads/' });

// Database Connection
mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/phishguard')
    .then(() => console.log("✅ MongoDB Connected successfully"))
    .catch(err => console.error("❌ MongoDB Error:", err));

const ScanSchema = new mongoose.Schema({
    text: String,
    type: String,
    score: Number,
    verdict: String,
    reasons: [String],
    date: { type: Date, default: Date.now }
});
const Scan = mongoose.model('Scan', ScanSchema);

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

// Helper Function: The AI Logic (We reuse this!)
async function analyzeText(text, type) {
    const prompt = `
    Analyze this ${type} for phishing risks. 
    Content: "${text}"
    
    Return ONLY a JSON object (no markdown):
    {
        "score": <number 0-100>,
        "verdict": "<"Safe", "Suspicious", or "Phishing">",
        "reasons": ["<reason 1>", "<reason 2>", "<reason 3>"]
    }
    IMPORTANT: 
    - Safe = 0-10. Suspicious = 40-70. Phishing = 80-100.
    `;
    const result = await model.generateContent(prompt);
    const response = await result.response;
    return JSON.parse(response.text().replace(/```json/g, '').replace(/```/g, '').trim());
}

// 1. TEXT ROUTE
app.post('/api/analyze', async (req, res) => {
    try {
        const { text, type } = req.body;
        const analysis = await analyzeText(text, type);

        const newScan = await Scan.create({
            text: text.substring(0, 200),
            type,
            ...analysis
        });
        res.json(analysis);
    } catch (error) {
        console.error("AI Error:", error);
        res.status(500).json({ error: "Failed to analyze" });
    }
});

// 2. IMAGE ROUTE (The New Magic) 📸
app.post('/api/analyze-image', upload.single('image'), async (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ error: "No image uploaded" });

        console.log("📸 Processing Image...");

        // Step A: OCR (Image -> Text)
        const { data: { text } } = await Tesseract.recognize(req.file.path, 'eng');

        // Cleanup: Delete the temp file
        fs.unlinkSync(req.file.path);

        if (!text.trim()) return res.status(400).json({ error: "No text found in image" });

        // Step B: Send extracted text to Gemini
        const analysis = await analyzeText(text, "image content");

        // Step C: Save to DB
        await Scan.create({
            text: `[IMAGE SCAN] ${text.substring(0, 150)}...`,
            type: 'image',
            ...analysis
        });

        res.json({ ...analysis, extractedText: text }); // Send back text so user sees what was read

    } catch (error) {
        console.error("Image Error:", error);
        res.status(500).json({ error: "Failed to process image" });
    }
});

// STATS ROUTE
app.get('/api/stats', async (req, res) => {
    try {
        const totalScans = await Scan.countDocuments();
        const phishingCount = await Scan.countDocuments({ verdict: 'Phishing' });
        const safeCount = await Scan.countDocuments({ verdict: 'Safe' });
        const recentScans = await Scan.find().sort({ date: -1 }).limit(50);
        res.json({ totalScans, phishingCount, safeCount, recentScans });
    } catch (error) {
        res.status(500).json({ error: "Stats error" });
    }
});

// 3. GAME ROUTE (Generate Quiz) 🎮
app.get('/api/generate-quiz', async (req, res) => {
    try {
        const prompt = `
        Generate 3 unique and tricky cybersecurity quiz scenarios for a user to test their phishing detection skills.
        
        Requirements:
        1. VARY THE DIFFICULTY: Make one easy, one medium, and one hard.
        2. VARY THE THREATS: Use a mix of "Email", "SMS", "Social Media DM", "Fake Ad", or "HR Portal".
        3. BALANCE: Ensure there is at least one "Safe" and at least one "Phishing" scenario, but the third can be random.
        4. Return ONLY a RAW JSON array. No markdown, no code blocks.
        
        JSON Structure:
        [
          {
            "id": 1,
            "type": "Email", 
            "sender": "<fake sender>",
            "content": "<the message text>",
            "isPhishing": <true/false>,
            "explanation": "<brief reason why it is safe or phishing>"
          }
        ]
        `;

        const result = await model.generateContent(prompt);
        const response = await result.response;

        // Clean the text to ensure it's valid JSON
        const text = response.text().replace(/```json/g, '').replace(/```/g, '').trim();

        const quizQuestions = JSON.parse(text);

        // 🎲 SHUFFLE THE CARDS
        // This line guarantees the order is random every single time
        const randomizedQuestions = shuffleArray(quizQuestions);

        res.json(randomizedQuestions);

    } catch (error) {
        console.error("Quiz Gen Error:", error);
        res.status(500).json({ error: "Failed to generate quiz" });
    }
});

const PORT = 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));