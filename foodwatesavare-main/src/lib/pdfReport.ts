import jsPDF from "jspdf";
import { ProductAnalysis } from "@/lib/wasteless";

interface ReportData {
  stats: {
    totalItems: number;
    highRisk: number;
    mediumRisk: number;
    lowRisk: number;
    atRisk: number;
    estimatedRevenueSaved: number;
    estimatedFoodSaved: number;
  };
  analyses: ProductAnalysis[];
  redirections: { productName: string; ngoName: string; quantity: number }[];
  totalUnitsDonated: number;
  uniqueNGOs: number;
}

export function generateWasteReport(data: ReportData) {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 20;
  let y = 20;

  const addLine = (text: string, size: number, bold = false, color: [number, number, number] = [30, 30, 30]) => {
    doc.setFontSize(size);
    doc.setFont("helvetica", bold ? "bold" : "normal");
    doc.setTextColor(...color);
    doc.text(text, margin, y);
    y += size * 0.5 + 2;
  };

  const checkPage = (needed: number) => {
    if (y + needed > 280) { doc.addPage(); y = 20; }
  };

  doc.setFillColor(34, 120, 80);
  doc.rect(0, 0, pageWidth, 40, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(22);
  doc.setFont("helvetica", "bold");
  doc.text("WasteLess AI", margin, 18);
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text("Food Waste Reduction Report", margin, 26);
  doc.text(`Generated: ${new Date().toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}`, margin, 33);
  y = 52;

  addLine("Executive Summary", 16, true, [34, 120, 80]);
  y += 2;

  const statBoxW = (pageWidth - margin * 2 - 15) / 4;
  const statsArr = [
    { label: "Total Products", value: data.stats.totalItems.toString() },
    { label: "At Risk", value: data.stats.atRisk.toString() },
    { label: "Food Saved", value: `${data.stats.estimatedFoodSaved} units` },
    { label: "Revenue Recovered", value: `₹${data.stats.estimatedRevenueSaved.toLocaleString(undefined, { maximumFractionDigits: 0 })}` },
  ];

  statsArr.forEach((stat, i) => {
    const x = margin + i * (statBoxW + 5);
    doc.setFillColor(240, 248, 240);
    doc.roundedRect(x, y, statBoxW, 28, 3, 3, "F");
    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(34, 120, 80);
    doc.text(stat.value, x + statBoxW / 2, y + 12, { align: "center" });
    doc.setFontSize(7);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(100, 100, 100);
    doc.text(stat.label, x + statBoxW / 2, y + 21, { align: "center" });
  });
  y += 38;

  addLine("Risk Distribution", 14, true, [34, 120, 80]);
  y += 2;

  const risks = [
    { label: "High Risk (≤2 days)", count: data.stats.highRisk, color: [220, 50, 50] as [number, number, number] },
    { label: "Medium Risk (3-5 days)", count: data.stats.mediumRisk, color: [230, 150, 30] as [number, number, number] },
    { label: "Low Risk (>5 days)", count: data.stats.lowRisk, color: [34, 120, 80] as [number, number, number] },
  ];

  risks.forEach(r => {
    const pct = data.stats.totalItems > 0 ? (r.count / data.stats.totalItems * 100) : 0;
    doc.setFillColor(240, 240, 240);
    doc.roundedRect(margin, y, pageWidth - margin * 2, 8, 2, 2, "F");
    doc.setFillColor(...r.color);
    doc.roundedRect(margin, y, Math.max((pageWidth - margin * 2) * pct / 100, 4), 8, 2, 2, "F");
    doc.setFontSize(8);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(60, 60, 60);
    doc.text(`${r.label}: ${r.count} (${pct.toFixed(0)}%)`, margin + 3, y + 5.5);
    y += 12;
  });
  y += 4;

  checkPage(40);
  addLine("High Risk Products", 14, true, [220, 50, 50]);
  y += 2;

  const highRiskItems = data.analyses.filter(a => a.riskLevel === "high").sort((a, b) => a.daysToExpiry - b.daysToExpiry);

  if (highRiskItems.length > 0) {
    doc.setFillColor(250, 235, 235);
    doc.rect(margin, y, pageWidth - margin * 2, 8, "F");
    doc.setFontSize(7);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(80, 80, 80);
    const cols = [margin + 2, margin + 55, margin + 80, margin + 100, margin + 120];
    doc.text("Product", cols[0], y + 5.5);
    doc.text("Category", cols[1], y + 5.5);
    doc.text("Qty", cols[2], y + 5.5);
    doc.text("Expiry", cols[3], y + 5.5);
    doc.text("Recommendation", cols[4], y + 5.5);
    y += 10;

    highRiskItems.slice(0, 15).forEach(a => {
      checkPage(8);
      doc.setFontSize(7);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(50, 50, 50);
      doc.text(a.product.name, cols[0], y + 4);
      doc.text(a.product.category, cols[1], y + 4);
      doc.text(a.product.quantity.toString(), cols[2], y + 4);
      doc.text(a.daysToExpiry <= 0 ? "Expired" : `${a.daysToExpiry}d`, cols[3], y + 4);
      const recText = a.recommendedAction.length > 30 ? a.recommendedAction.slice(0, 30) + "..." : a.recommendedAction;
      doc.text(recText, cols[4], y + 4);
      doc.setDrawColor(230, 230, 230);
      doc.line(margin, y + 7, pageWidth - margin, y + 7);
      y += 8;
    });
  } else {
    addLine("No high-risk items — great job!", 9, false, [34, 120, 80]);
  }

  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFillColor(34, 120, 80);
    doc.rect(0, 287, pageWidth, 10, "F");
    doc.setFontSize(7);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(255, 255, 255);
    doc.text("WasteLess AI — Reducing food waste through intelligent inventory management", margin, 293);
    doc.text(`Page ${i} of ${totalPages}`, pageWidth - margin, 293, { align: "right" });
  }

  doc.save(`wasteless-report-${new Date().toISOString().split("T")[0]}.pdf`);
}
