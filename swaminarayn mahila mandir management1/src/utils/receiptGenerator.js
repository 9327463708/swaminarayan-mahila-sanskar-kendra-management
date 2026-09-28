import jsPDF from 'jspdf';

const getBase64ImageFromUrl = async (imageUrl) => {
  const res = await fetch(imageUrl);
  const blob = await res.blob();
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.addEventListener("load", () => resolve(reader.result), false);
    reader.addEventListener("error", () => reject(new Error("Failed to load image")));
    reader.readAsDataURL(blob);
  });
};

export const generateReceipt = async (donorDetails, branchName) => {
  const doc = new jsPDF();
  
  try {
    const logoBase64 = await getBase64ImageFromUrl('/logo.jpg');
    
    // --- 1. Watermark (Faint Background) ---
    doc.setGState(new doc.GState({ opacity: 0.15 }));
    // Center watermark
    doc.addImage(logoBase64, 'JPEG', 55, 100, 100, 100);
    doc.setGState(new doc.GState({ opacity: 1.0 })); // Reset opacity
    
    // --- 2. Receipt Border ---
    doc.setLineWidth(0.5);
    doc.rect(10, 10, 190, 277); // Outer border
    doc.rect(12, 12, 186, 273); // Inner border

    // --- 3. Header Section ---
    // Header Logo
    doc.addImage(logoBase64, 'JPEG', 15, 15, 25, 25);
    
    doc.setTextColor(230, 92, 0); // Orange color for title
    doc.setFont("helvetica", "bold");
    doc.setFontSize(18);
    doc.text("SHREE SWAMINARAYAN MAHILA SANSKAR KENDRA", 45, 25);
    
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(12);
    doc.text(`Branch: ${branchName}`, 45, 33);
    
    doc.setLineWidth(0.5);
    doc.line(10, 45, 200, 45); // Line below header

    // --- 4. Receipt Title ---
    doc.setFontSize(16);
    doc.text("DONATION RECEIPT", 105, 55, { align: "center" });
    
    // --- 5. Receipt Details ---
    const receiptNo = Math.floor(100000 + Math.random() * 900000); // Random 6 digit receipt number
    const currentDate = new Date().toLocaleDateString();
    
    doc.setFontSize(11);
    doc.setFont("helvetica", "normal");
    
    doc.text(`Receipt No: ${receiptNo}`, 20, 70);
    doc.text(`Date: ${currentDate}`, 150, 70);
    
    doc.text(`Received with thanks from Shri/Smt:`, 20, 90);
    doc.setFont("helvetica", "bold");
    doc.text(`${donorDetails.name}`, 85, 90);
    doc.line(82, 91, 190, 91); // underline name
    
    doc.setFont("helvetica", "normal");
    doc.text(`A sum of Rupees:`, 20, 110);
    doc.setFont("helvetica", "bold");
    doc.text(`${donorDetails.amount} /-`, 55, 110);
    doc.line(52, 111, 190, 111); // underline amount
    
    doc.setFont("helvetica", "normal");
    doc.text(`Towards / Purpose:`, 20, 130);
    doc.setFont("helvetica", "bold");
    doc.text(`${donorDetails.purpose || "Temple Donation / Seva"}`, 60, 130);
    doc.line(57, 131, 190, 131); // underline purpose
    
    // Amount Box
    doc.rect(20, 150, 50, 15);
    doc.setFontSize(14);
    doc.text(`Rs. ${donorDetails.amount} /-`, 25, 160);
    
    // --- 6. Footer / Signatory ---
    doc.setFontSize(11);
    doc.setFont("helvetica", "normal");
    doc.text("Authorized Signatory", 150, 180);
    doc.text("Receiver's Signature", 150, 185);
    
    // Additional Footer note
    doc.setFontSize(9);
    doc.setTextColor(100, 100, 100);
    doc.text("May Lord Swaminarayan bless you with peace and prosperity.", 105, 270, { align: "center" });

  } catch (err) {
    console.error("Could not load logo image for receipt", err);
  }
  
  // Save PDF
  doc.save(`receipt-${donorDetails.name.replace(/\s+/g, '-')}.pdf`);
};
