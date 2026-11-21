import jsPDF from 'jspdf';
import { Registration } from './supabase';

export function generateConvocationPdf(student: Registration) {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a5'
  });

  // Background card
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(8, 8, 132, 194, 4, 4, 'F');
  doc.setDrawColor(12, 126, 129); // #0C7E81
  doc.setLineWidth(0.8);
  doc.roundedRect(8, 8, 132, 194, 4, 4, 'S');

  // Header Banner
  doc.setFillColor(12, 126, 129);
  doc.roundedRect(12, 12, 124, 28, 3, 3, 'F');
  
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.text('SUPERIOR COLLEGE WAZIRABAD', 74, 23, { align: 'center' });
  
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.text('CONVOCATION 2026 • OFFICIAL ENTRY PASS', 74, 30, { align: 'center' });

  // Status Badge
  doc.setFillColor(220, 252, 231); // emerald-100
  doc.roundedRect(49, 34, 50, 5, 1, 1, 'F');
  doc.setTextColor(22, 101, 52); // emerald-800
  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'bold');
  doc.text('VERIFIED & ADMITTED', 74, 37.8, { align: 'center' });

  // Student Details Container
  doc.setFillColor(255, 255, 255);
  doc.roundedRect(12, 45, 124, 60, 2, 2, 'F');
  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(0.3);
  doc.roundedRect(12, 45, 124, 60, 2, 2, 'S');

  // Student Info Text
  doc.setTextColor(100, 116, 139);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.text('STUDENT NAME:', 18, 55);
  doc.setTextColor(15, 23, 42);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text(student.full_name.toUpperCase(), 18, 61);

  doc.setTextColor(100, 116, 139);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.text('ROLL NUMBER:', 80, 55);
  doc.setTextColor(12, 126, 129);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.text(student.roll_number, 80, 61);

  doc.setTextColor(100, 116, 139);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.text('DEPARTMENT:', 18, 75);
  doc.setTextColor(30, 41, 59);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.text(student.department, 18, 81);

  doc.setTextColor(100, 116, 139);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.text('CHALAN REFERENCE:', 80, 75);
  doc.setTextColor(30, 41, 59);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.text(student.chalan_no, 80, 81);

  doc.setTextColor(100, 116, 139);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.text('CONTACT PHONE:', 18, 93);
  doc.setTextColor(51, 65, 85);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.text(student.student_phone, 18, 98);

  // Fee Paid Notice Box
  doc.setFillColor(236, 253, 245);
  doc.setDrawColor(167, 243, 208);
  doc.roundedRect(12, 112, 124, 22, 2, 2, 'FD');
  doc.setTextColor(6, 95, 70);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text('FEE STATUS: PKR 6,000/- PAID & VERIFIED', 74, 121, { align: 'center' });
  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(4, 120, 87);
  doc.text('Includes Gown Allocation, Degree Folder & Convocation Refreshment Pass', 74, 128, { align: 'center' });

  // Event Rules
  doc.setTextColor(71, 85, 105);
  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'normal');
  doc.text('Instructions for Entry:', 14, 142);
  doc.text('1. Please bring this printed pass along with your Original Student ID Card.', 14, 147);
  doc.text('2. Entry will be strictly subject to verification at reception gate.', 14, 151);
  doc.text('3. Gown distribution counter requires this pass stamped.', 14, 155);

  // Signatures
  doc.setDrawColor(203, 213, 225);
  doc.setLineWidth(0.4);
  doc.line(20, 182, 55, 182);
  doc.line(90, 182, 128, 182);

  doc.setTextColor(148, 163, 184);
  doc.setFontSize(7.5);
  doc.text('Student Signature', 37.5, 186, { align: 'center' });
  doc.text('Account Office', 109, 186, { align: 'center' });

  doc.save(`Convocation_Pass_${student.roll_number}.pdf`);
}
