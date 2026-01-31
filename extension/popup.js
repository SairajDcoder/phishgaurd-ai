document.addEventListener('DOMContentLoaded', async () => {
    // 1. Get Current Tab URL
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    const url = tab.url;
    document.getElementById('url').innerText = url;

    // 2. Handle Button Click
    document.getElementById('scanBtn').addEventListener('click', async () => {
        const loader = document.getElementById('loader');
        const resultDiv = document.getElementById('result');
        const verdict = document.getElementById('verdict');
        const score = document.getElementById('score');

        loader.style.display = 'block';
        resultDiv.style.display = 'none';

        try {
            // 3. Call YOUR Local Backend
            const response = await fetch('http://localhost:5000/api/analyze', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ type: 'url', text: url })
            });

            const data = await response.json();

            // 4. Update UI
            loader.style.display = 'none';
            resultDiv.style.display = 'block';

            verdict.innerText = data.verdict.toUpperCase();
            score.innerText = `Risk Score: ${data.score}/100`;

            if (data.score > 50) {
                resultDiv.className = 'result phishing';
                verdict.style.color = '#fca5a5';
            } else {
                resultDiv.className = 'result safe';
                verdict.style.color = '#6ee7b7';
            }

        } catch (error) {
            loader.style.display = 'none';
            alert("Error: Make sure your localhost server is running!");
        }
    });
});