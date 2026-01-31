require('dotenv').config();

const apiKey = process.env.GEMINI_API_KEY;
const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;

console.log("🔍 Checking available models for your API key...");

fetch(url)
    .then(res => res.json())
    .then(data => {
        if (data.error) {
            console.error("❌ API Error:", data.error.message);
        } else {
            console.log("✅ SUCCESS! Here are your available models:");
            // Filter for models that support "generateContent"
            const available = data.models
                .filter(m => m.supportedGenerationMethods.includes("generateContent"))
                .map(m => m.name.replace("models/", ""));

            console.log(available.join("\n"));
            console.log("\n👉 ACTION: Copy one of the names above into your index.js file.");
        }
    })
    .catch(err => console.error("❌ Network Error:", err));