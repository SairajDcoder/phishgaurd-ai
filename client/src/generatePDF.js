import jsPDF from "jspdf";

export const generateReport = (scanResult, scannedText) => {
    const doc = new jsPDF();
    const date = new Date().toLocaleString();

    // 1. HEADER (Dark Blue Background)
    doc.setFillColor(15, 23, 42); // Slate-900
    doc.rect(0, 0, 210, 40, "F");

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(22);
    doc.setFont("helvetica", "bold");
    doc.text("PhishGuard Security Audit", 20, 25);

    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text(`Generated: ${date}`, 20, 35);

    // 2. VERDICT SECTION
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(14);
    doc.text("Security Assessment Result:", 20, 60);

    // Color code the verdict
    if (scanResult.score > 50) {
        doc.setTextColor(220, 38, 38); // Red
    } else {
        doc.setTextColor(5, 150, 105); // Green
    }
    doc.setFontSize(30);
    doc.setFont("helvetica", "bold");
    doc.text(scanResult.verdict.toUpperCase(), 20, 75);

    // Score Bar
    doc.setFillColor(200, 200, 200);
    doc.rect(120, 60, 70, 10, "F"); // Background

    if (scanResult.score > 50) {
        doc.setFillColor(220, 38, 38); // Red
    } else {
        doc.setFillColor(5, 150, 105); // Green
    }
    const barWidth = (scanResult.score / 100) * 70;
    doc.rect(120, 60, barWidth, 10, "F"); // Fill

    doc.setTextColor(100, 100, 100);
    doc.setFontSize(10);
    doc.text(`Risk Score: ${scanResult.score}/100`, 120, 80);

    // 3. SCANNED CONTENT (Truncated & Wrapped)
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text("Scanned Content Sample:", 20, 100);

    doc.setFont("courier", "normal");
    doc.setFontSize(10);
    doc.setTextColor(80, 80, 80);

    // Wrap text to max width of 170 units
    const splitText = doc.splitTextToSize(scannedText.substring(0, 500) + "...", 170);
    doc.text(splitText, 20, 110);

    // 4. AI ANALYSIS BREAKDOWN (Wrapped!)
    // Calculate where the previous section ended
    let yPos = 110 + (splitText.length * 5) + 20;

    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    doc.text("Detailed Threat Analysis:", 20, yPos);

    yPos += 10;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);

    scanResult.reasons.forEach((reason) => {
        // 🟢 THE FIX: Wrap long reasons so they don't go off-page
        const wrappedReason = doc.splitTextToSize(`• ${reason}`, 170);

        doc.text(wrappedReason, 20, yPos);

        // Increase Y position based on how many lines the text took up
        yPos += (wrappedReason.length * 6);
    });

    // 5. FOOTER
    doc.setDrawColor(200, 200, 200);
    doc.line(20, 280, 190, 280);
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text("Certified by PhishGuard AI Defense Hub", 105, 285, { align: "center" });

    // Save File
    doc.save(`PhishGuard_Report_${Date.now()}.pdf`);
};