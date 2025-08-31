import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import moment from "moment";

const numberToWords = (num) => {
  const a = [
    "",
    "One",
    "Two",
    "Three",
    "Four",
    "Five",
    "Six",
    "Seven",
    "Eight",
    "Nine",
    "Ten",
    "Eleven",
    "Twelve",
    "Thirteen",
    "Fourteen",
    "Fifteen",
    "Sixteen",
    "Seventeen",
    "Eighteen",
    "Nineteen",
  ];
  const b = [
    "",
    "",
    "Twenty",
    "Thirty",
    "Forty",
    "Fifty",
    "Sixty",
    "Seventy",
    "Eighty",
    "Ninety",
  ];
  if ((num = num.toString()).length > 9) return "Overflow";
  const n = ("000000000" + num)
    .substr(-9)
    .match(/^(\d{2})(\d{2})(\d{2})(\d{1})(\d{2})$/);
  if (!n) return;
  let str = "";
  str +=
    n[1] != 0
      ? (a[Number(n[1])] || b[n[1][0]] + " " + a[n[1][1]]) + " Crore "
      : "";
  str +=
    n[2] != 0
      ? (a[Number(n[2])] || b[n[2][0]] + " " + a[n[2][1]]) + " Lakh "
      : "";
  str +=
    n[3] != 0
      ? (a[Number(n[3])] || b[n[3][0]] + " " + a[n[3][1]]) + " Thousand "
      : "";
  str +=
    n[4] != 0
      ? (a[Number(n[4])] || b[n[4][0]] + " " + a[n[4][1]]) + " Hundred "
      : "";
  str +=
    n[5] != 0
      ? (str != "" ? "and " : "") +
        (a[Number(n[5])] || b[n[5][0]] + " " + a[n[5][1]]) +
        " "
      : "";
  return "Rupees " + str.trim() + " Only";
};

export const generateSalarySlipPDF = (payroll) => {
  const emp = payroll.employeeId;
  const doc = new jsPDF();

  const formatAmount = (amt) => `Rs. ${Number(amt).toLocaleString("en-IN")}`;
  const toTitle = (txt) =>
    txt
      .split(" ")
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(" ");
  const formatDate = (d) => moment(d).format("DD-MMM-YYYY");
  const formatMonth = (m) => moment(m).format("YYYY-MM");

  const earnings = [
    { title: "Basic Salary", amount: payroll.basicSalary },
    ...(payroll.allowances || []),
  ];
  const deductions = [...(payroll.deductions || [])];
  const grossEarnings = earnings.reduce((sum, a) => sum + a.amount, 0);
  const totalDeductions = deductions.reduce((sum, a) => sum + a.amount, 0);
  const netSalary = grossEarnings - totalDeductions;

  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text("HAREETECH DEVELOPMENT PVT. LTD.", 105, 15, { align: "center" });

  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text(
    "www.hareetech.com   |   6394181905   |   info@hareetech.com",
    105,
    22,
    { align: "center" }
  );
  doc.text(
    "Address: OM Plaza Apartment, Sector 19, Indira Nagar, Lucknow, Uttar Pradesh 226016",
    105,
    27,
    { align: "center" }
  );

  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text(
    `Salary Slip for the Month of ${formatMonth(payroll.month)}`,
    14,
    40
  );

  autoTable(doc, {
    startY: 45,
    theme: "grid",
    headStyles: { fillColor: [220, 220, 220], textColor: [0, 0, 0] },
    bodyStyles: { textColor: [0, 0, 0] },
    styles: { halign: "left" },
    columnStyles: { 0: { fontStyle: "bold" } },
    body: [
      ["Employee Name", emp?.name || "-", "Employee ID", emp?._id || "-"],
      [
        "Designation",
        emp?.designationId?.name || "N/A",
        "Department",
        emp?.departmentId?.name || "N/A",
      ],
      ["PAN", emp?.pan || "N/A", "Bank A/C No.", emp?.bankAccount || "N/A"],
      [
        "Working Days",
        payroll.workingDays || "-",
        "Paid Days",
        payroll.paidDays || "-",
      ],
      ["Date of Payment", formatDate(new Date())],
    ],
  });

  autoTable(doc, {
    startY: doc.lastAutoTable.finalY + 8,
    head: [["Particulars", "Amount (Rs.)"]],
    body: [
      ...earnings.map((e) => [toTitle(e.title), formatAmount(e.amount)]),
      [
        { content: "Gross Earnings", styles: { fontStyle: "bold" } },
        { content: formatAmount(grossEarnings), styles: { fontStyle: "bold" } },
      ],
    ],
    theme: "grid",
    headStyles: { fillColor: [0, 0, 0], textColor: [255, 255, 255] },
    bodyStyles: { textColor: [0, 0, 0] },
  });

  autoTable(doc, {
    startY: doc.lastAutoTable.finalY + 8,
    head: [["Particulars", "Amount (Rs.)"]],
    body: [
      ...deductions.map((d) => [toTitle(d.title), formatAmount(d.amount)]),
      [
        { content: "Total Deductions", styles: { fontStyle: "bold" } },
        {
          content: formatAmount(totalDeductions),
          styles: { fontStyle: "bold" },
        },
      ],
    ],
    theme: "grid",
    headStyles: { fillColor: [0, 0, 0], textColor: [255, 255, 255] },
    bodyStyles: { textColor: [0, 0, 0] },
  });

  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.text("Net Salary (In Words)", 14, doc.lastAutoTable.finalY + 12);
  doc.setFont("helvetica", "normal");
  doc.text(
    `${formatAmount(netSalary)} (${numberToWords(netSalary)})`,
    14,
    doc.lastAutoTable.finalY + 18
  );

  doc.setFont("helvetica", "bold");
  doc.text("Net Salary (In Figures)", 14, doc.lastAutoTable.finalY + 28);
  doc.setFont("helvetica", "normal");
  doc.text(
    formatAmount(netSalary.toFixed(2)),
    14,
    doc.lastAutoTable.finalY + 34
  );
  const pageHeight = doc.internal.pageSize.getHeight();
  const bottomMargin = 30;
  const suggestedY = doc.lastAutoTable.finalY + 65;

  const signatureY = Math.min(suggestedY, pageHeight - bottomMargin);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);
  doc.line(140, signatureY, 190, signatureY);
  doc.text("Authorized Signature", 165, signatureY + 6, { align: "center" });

  doc.save(
    `SalarySlip-${emp?.name || "employee"}-${formatMonth(payroll.month)}.pdf`
  );
};
