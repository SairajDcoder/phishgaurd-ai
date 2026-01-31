import jsPDF from "jspdf";
import { Shield, AlertTriangle, CheckCircle } from "lucide-react";

// Helper function to draw icons
const drawIcon = (doc, iconType, x, y, size = 16, color = '#000000') => {
    doc.setFillColor(color);

    switch (iconType) {
        case 'shield':
            // Simple shield icon
            doc.roundedRect(x - size / 2, y - size / 2, size, size, 2, 2, 'F');
            break;
        case 'alert':
            // Triangle alert icon
            doc.triangle(
                x, y - size / 2,
                x - size / 2, y + size / 2,
                x + size / 2, y + size / 2,
                'F'
            );
            break;
        case 'check':
            // Check circle icon
            doc.circle(x, y, size / 2, 'F');
            break;
    }
};

export const generateReport = (scanResult, scannedText) => {
    const doc = new jsPDF();
    const date = new Date().toLocaleString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });

    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 20;
    const contentWidth = pageWidth - (margin * 2);

    // 1. HEADER WITH GRADIENT EFFECT
    doc.setFillColor(15, 23, 42); // Gray-900
    doc.rect(0, 0, pageWidth, 60, 'F');

    // Logo/Title area
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(24);
    doc.setFont("helvetica", "bold");
    doc.text("PhishGuard AI", margin, 30);

    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text("Security Threat Assessment Report", margin, 40);
    doc.text(`Generated: ${date}`, pageWidth - margin, 40, { align: 'right' });

    // 2. MAIN VERDICT SECTION
    let yPos = 80;

    // Score Badge
    const scoreColor = scanResult.score > 70 ? [220, 38, 38] :
        scanResult.score > 30 ? [245, 158, 11] :
            [16, 185, 129];

    doc.setFillColor(...scoreColor);
    doc.roundedRect(pageWidth - 60, yPos, 50, 25, 5, 5, 'F');

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    doc.text(`${scanResult.score}/100`, pageWidth - 35, yPos + 16, { align: 'center' });

    // Verdict Title
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(18);
    doc.setFont("helvetica", "bold");
    doc.text("Security Assessment", margin, yPos);

    doc.setFontSize(32);
    doc.setTextColor(...scoreColor);
    const verdictText = scanResult.verdict.toUpperCase();
    doc.text(verdictText, margin, yPos + 25);

    // Score Bar
    yPos += 50;
    doc.setDrawColor(229, 231, 235);
    doc.setLineWidth(0.5);
    doc.line(margin, yPos, margin + contentWidth, yPos);

    // Score indicator
    const barWidth = (scanResult.score / 100) * contentWidth;
    doc.setFillColor(...scoreColor);
    doc.roundedRect(margin, yPos + 5, barWidth, 10, 5, 5, 'F');

    // Background bar
    doc.setDrawColor(229, 231, 235);
    doc.setLineWidth(0.5);
    doc.roundedRect(margin, yPos + 5, contentWidth, 10, 5, 5, 'S');

    // Labels
    doc.setTextColor(100, 116, 139);
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.text("Low Risk", margin, yPos + 25);
    doc.text("Medium Risk", margin + (contentWidth / 2) - 10, yPos + 25, { align: 'center' });
    doc.text("High Risk", margin + contentWidth, yPos + 25, { align: 'right' });

    // 3. THREAT ANALYSIS BREAKDOWN
    yPos += 45;

    doc.setDrawColor(59, 130, 246);
    doc.setLineWidth(2);
    doc.line(margin, yPos, margin + 30, yPos);

    doc.setTextColor(0, 0, 0);
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("Detailed Analysis", margin, yPos + 10);

    yPos += 20;
    doc.setFontSize(10);
    doc.setTextColor(75, 85, 99);

    scanResult.reasons.forEach((reason, index) => {
        if (yPos > 250) {
            doc.addPage();
            yPos = 40;
        }

        // Bullet point
        doc.setFillColor(59, 130, 246);
        doc.circle(margin + 3, yPos + 4, 2, 'F');

        // Reason text (wrapped)
        const wrappedReason = doc.splitTextToSize(` ${reason}`, contentWidth - 20);
        doc.text(wrappedReason, margin + 10, yPos + 4);

        yPos += (wrappedReason.length * 6) + 4;
    });

    // 4. SCANNED CONTENT SAMPLE
    yPos += 10;

    if (yPos > 200) {
        doc.addPage();
        yPos = 40;
    }

    doc.setDrawColor(59, 130, 246);
    doc.setLineWidth(2);
    doc.line(margin, yPos, margin + 30, yPos);

    doc.setTextColor(0, 0, 0);
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("Scanned Content", margin, yPos + 10);

    yPos += 15;

    // Content box
    doc.setDrawColor(229, 231, 235);
    doc.setFillColor(249, 250, 251);
    doc.roundedRect(margin, yPos, contentWidth, 60, 3, 3, 'FD');

    doc.setTextColor(75, 85, 99);
    doc.setFontSize(9);
    doc.setFont("courier", "normal");

    const sampleText = scannedText.length > 500 ?
        scannedText.substring(0, 500) + "..." :
        scannedText;

    const wrappedContent = doc.splitTextToSize(sampleText, contentWidth - 15);
    doc.text(wrappedContent, margin + 5, yPos + 8);

    // 5. RECOMMENDATIONS
    yPos += 70;

    if (yPos > 200) {
        doc.addPage();
        yPos = 40;
    }

    doc.setDrawColor(59, 130, 246);
    doc.setLineWidth(2);
    doc.line(margin, yPos, margin + 30, yPos);

    doc.setTextColor(0, 0, 0);
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("Security Recommendations", margin, yPos + 10);

    yPos += 15;
    doc.setFontSize(10);
    doc.setTextColor(75, 85, 99);

    const recommendations = [
        "Avoid clicking on suspicious links or downloading attachments",
        "Verify sender email addresses before responding",
        "Use multi-factor authentication where available",
        "Keep security software up to date",
        "Report suspicious content to your security team"
    ];

    recommendations.forEach((rec, index) => {
        if (yPos > 250) {
            doc.addPage();
            yPos = 40;
        }

        doc.setFillColor(16, 185, 129);
        doc.circle(margin + 3, yPos + 4, 2, 'F');

        const wrappedRec = doc.splitTextToSize(` ${rec}`, contentWidth - 20);
        doc.text(wrappedRec, margin + 10, yPos + 4);

        yPos += (wrappedRec.length * 6) + 4;
    });

    // 6. FOOTER
    const footerY = doc.internal.pageSize.getHeight() - 20;

    doc.setDrawColor(229, 231, 235);
    doc.setLineWidth(0.5);
    doc.line(margin, footerY - 10, pageWidth - margin, footerY - 10);

    doc.setTextColor(100, 116, 139);
    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    doc.text("This report was generated by PhishGuard AI Security System", pageWidth / 2, footerY, { align: 'center' });

    doc.text("Confidential Security Document", margin, footerY);
    doc.text(`Report ID: ${Date.now()}`, pageWidth - margin, footerY, { align: 'right' });

    // Save the PDF
    doc.save(`PhishGuard_Report_${Date.now()}.pdf`);
};