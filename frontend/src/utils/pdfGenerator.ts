
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import type { ChartResponse, BirthDetails, CoreInsights } from '../api/client';

export const generatePDF = async (
    chartData: ChartResponse,
    details: BirthDetails,
    insights: CoreInsights | null
) => {
    const doc = new jsPDF('p', 'mm', 'a4');
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 15;
    let yPos = 20;

    // --- PAGE 1: COVER & CHART ---

    // Header
    doc.setFontSize(24);
    doc.setTextColor(106, 27, 154); // Primary Purple
    doc.text("Vedic Astrology Report", pageWidth / 2, yPos, { align: "center" });
    yPos += 15;

    doc.setFontSize(12);
    doc.setTextColor(60, 60, 60);
    doc.text(`Generated for: ${details.date} at ${details.time}`, pageWidth / 2, yPos, { align: "center" });
    yPos += 7;
    doc.text(`Location: ${details.latitude}, ${details.longitude}`, pageWidth / 2, yPos, { align: "center" });
    yPos += 7;
    doc.text(`Ayanamsa: ${details.ayanamsa_mode || "LAHIRI"}`, pageWidth / 2, yPos, { align: "center" });
    yPos += 20;

    // Capture Chart Visual (if available in DOM)
    // Note: We need to target the chart DOM element provided by the caller or by ID
    // For MVP, we'll try to find the rendered chart by ID if it exists, else skip
    const chartElement = document.querySelector('.chart-container-south') || document.querySelector('.chart-container-north');
    if (chartElement) {
        try {
            const canvas = await html2canvas(chartElement as HTMLElement, { scale: 2 });
            const imgData = canvas.toDataURL('image/png');
            const imgWidth = 140;
            const imgHeight = (canvas.height * imgWidth) / canvas.width;

            doc.addImage(imgData, 'PNG', (pageWidth - imgWidth) / 2, yPos, imgWidth, imgHeight);
            yPos += imgHeight + 20;
        } catch (e) {
            console.error("PDF Chart Capture Failed", e);
            doc.text("[Chart Image Unavailable]", pageWidth / 2, yPos, { align: "center" });
            yPos += 20;
        }
    } else {
        doc.text("[Chart Visual Not Found]", pageWidth / 2, yPos, { align: "center" });
        yPos += 20;
    }

    // Planetary Summary (Simple Text Table)
    doc.setFontSize(16);
    doc.setTextColor(106, 27, 154);
    doc.text("Planetary Positions", margin, yPos);
    yPos += 10;

    doc.setFontSize(10);
    doc.setTextColor(0, 0, 0);

    // Headers
    const col1 = margin;
    const col2 = margin + 30;
    const col3 = margin + 60;
    const col4 = margin + 90;

    doc.setFont("helvetica", "bold");
    doc.text("Planet", col1, yPos);
    doc.text("Sign", col2, yPos);
    doc.text("Degree", col3, yPos);
    doc.text("House", col4, yPos);
    yPos += 6;
    doc.setFont("helvetica", "normal");

    chartData.planets.forEach(p => {
        doc.text(p.name + (p.retrograde ? " (R)" : ""), col1, yPos);
        doc.text(p.sign, col2, yPos);
        doc.text(p.longitude.toFixed(2), col3, yPos);
        doc.text(p.house.toString(), col4, yPos);
        yPos += 6;
    });

    // --- PAGE 2: INSIGHTS ---
    if (insights) {
        doc.addPage();
        yPos = 20;

        doc.setFontSize(18);
        doc.setTextColor(106, 27, 154);
        doc.text("Vedic Insights", pageWidth / 2, yPos, { align: "center" });
        yPos += 15;

        const addSection = (title: string, content: string) => {
            if (yPos > 250) {
                doc.addPage();
                yPos = 20;
            }
            doc.setFontSize(14);
            doc.setTextColor(106, 27, 154);
            doc.text(title, margin, yPos);
            yPos += 8;

            doc.setFontSize(11);
            doc.setTextColor(50, 50, 50);
            const splitText = doc.splitTextToSize(content, pageWidth - (margin * 2));
            doc.text(splitText, margin, yPos);
            yPos += (splitText.length * 5) + 10;
        };

        addSection("👤 Personal Profile", insights.personal);
        addSection("💼 Career Guidance", insights.career);
        addSection("❤️ Relationships", insights.relationships);
        addSection("✅ Do's & Don'ts", insights.dos_donts);
    }

    doc.save(`8Stro_Report_${details.date}.pdf`);
};
