import jsPDF from 'jspdf';
import { Registration } from './supabase';

/**
 * Clean helper to format Pakistani currency
 */
function formatPKR(amount: number | string) {
  const num = typeof amount === 'number' ? amount : parseFloat(amount) || 0;
  return `PKR ${num.toLocaleString()}/-`;
}

/**
 * Format date string nicely
 */
function formatDate(isoString?: string | null) {
  if (!isoString) return '-';
  try {
    const d = new Date(isoString);
    return d.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  } catch {
    return isoString;
  }
}

/**
 * Export selected or filtered students to an Excel (.xls) file with professional formatting
 */
export function exportStudentsToExcel(students: Registration[], departmentTitle?: string) {
  if (!students || students.length === 0) {
    alert('Koi record select ya filter nahi hua export ke liye.');
    return;
  }

  const deptLabel = departmentTitle && departmentTitle !== 'all' ? departmentTitle : 'All Departments';
  const now = new Date();
  const dateStr = now.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  const timeStr = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });

  // Generate Excel HTML Spreadsheet
  const excelHtml = `
    <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
    <head>
      <!--[if gte mso 9]>
      <xml>
        <x:ExcelWorkbook>
          <x:ExcelWorksheets>
            <x:ExcelWorksheet>
              <x:Name>Convocation Registrations</x:Name>
              <x:WorksheetOptions>
                <x:DisplayGridlines/>
              </x:WorksheetOptions>
            </x:ExcelWorksheet>
          </x:ExcelWorksheets>
        </x:ExcelWorkbook>
      </xml>
      <![endif]-->
      <meta http-equiv="content-type" content="application/vnd.ms-excel; charset=UTF-8">
      <style>
        body { font-family: Calibri, Arial, sans-serif; }
        .header-title { font-size: 16pt; font-weight: bold; color: #0C7E81; text-align: center; }
        .header-subtitle { font-size: 11pt; color: #475569; text-align: center; }
        .meta-table { margin-bottom: 12px; font-size: 10pt; }
        .meta-label { font-weight: bold; color: #334155; }
        table.data-table { border-collapse: collapse; width: 100%; font-size: 10pt; }
        table.data-table th { background-color: #0C7E81; color: #ffffff; font-weight: bold; border: 1px solid #096366; padding: 8px 6px; text-align: center; }
        table.data-table td { border: 1px solid #cbd5e1; padding: 6px; }
        .text-center { text-align: center; }
        .text-left { text-align: left; }
        .text-right { text-align: right; }
        .status-approved { color: #166534; font-weight: bold; background-color: #dcfce7; }
        .status-pending { color: #854d0e; font-weight: bold; background-color: #fef9c3; }
        .status-rejected { color: #991b1b; font-weight: bold; background-color: #fee2e2; }
      </style>
    </head>
    <body>
      <table>
        <tr>
          <td colspan="11" class="header-title">SUPERIOR COLLEGE WAZIRABAD</td>
        </tr>
        <tr>
          <td colspan="11" class="header-subtitle">ANNUAL CONVOCATION 2026 • STUDENT REGISTRATION REPORT</td>
        </tr>
        <tr><td colspan="11"></td></tr>
        <tr>
          <td colspan="3"><strong>Department Filter:</strong> ${deptLabel}</td>
          <td colspan="4"><strong>Total Students:</strong> ${students.length}</td>
          <td colspan="4" style="text-align: right;"><strong>Exported On:</strong> ${dateStr} at ${timeStr}</td>
        </tr>
        <tr><td colspan="11"></td></tr>
      </table>

      <table class="data-table">
        <thead>
          <tr>
            <th style="width: 45px;">Sr #</th>
            <th style="width: 180px;">Student Name</th>
            <th style="width: 120px;">Roll Number</th>
            <th style="width: 220px;">Department</th>
            <th style="width: 120px;">Student Phone</th>
            <th style="width: 120px;">Parent Phone</th>
            <th style="width: 180px;">Email</th>
            <th style="width: 130px;">Chalan No</th>
            <th style="width: 130px;">Transaction ID</th>
            <th style="width: 100px;">Amount</th>
            <th style="width: 120px;">Payment Status</th>
          </tr>
        </thead>
        <tbody>
          ${students.map((s, idx) => {
            const statusClass = 
              s.payment_status === 'approved' ? 'status-approved' :
              s.payment_status === 'rejected' ? 'status-rejected' : 'status-pending';
            const statusLabel = 
              s.payment_status === 'approved' ? 'Approved / Paid' :
              s.payment_status === 'pending_approval' ? 'Proof Submitted' :
              s.payment_status === 'rejected' ? 'Rejected' : 'Pending Payment';

            return `
              <tr style="${idx % 2 === 1 ? 'background-color: #f8fafc;' : ''}">
                <td class="text-center">${idx + 1}</td>
                <td class="text-left" style="font-weight: bold;">${s.full_name || ''}</td>
                <td class="text-center" style="font-family: monospace; font-weight: bold;">${s.roll_number || ''}</td>
                <td class="text-left">${s.department || ''}</td>
                <td class="text-center" style="font-family: monospace;">${s.student_phone || ''}</td>
                <td class="text-center" style="font-family: monospace;">${s.parent_phone || ''}</td>
                <td class="text-left">${s.student_email || '-'}</td>
                <td class="text-center" style="font-family: monospace; font-weight: bold;">${s.chalan_no || ''}</td>
                <td class="text-center" style="font-family: monospace;">${s.transaction_id || '-'}</td>
                <td class="text-right">PKR 6,000/-</td>
                <td class="text-center ${statusClass}">${statusLabel}</td>
              </tr>
            `;
          }).join('')}
        </tbody>
      </table>
    </body>
    </html>
  `;

  const blob = new Blob([excelHtml], { type: 'application/vnd.ms-excel;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  const safeDept = (deptLabel || 'All').replace(/[^a-zA-Z0-9]/g, '_');
  const fileDate = now.toISOString().slice(0, 10);
  link.href = url;
  link.download = `Superior_Convocation_${safeDept}_${fileDate}.xls`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Export selected or filtered students to an official PDF report using jsPDF (Landscape A4)
 */
export function exportStudentsToPdf(students: Registration[], departmentTitle?: string) {
  if (!students || students.length === 0) {
    alert('Koi record select ya filter nahi hua export ke liye.');
    return;
  }

  const deptLabel = departmentTitle && departmentTitle !== 'all' ? departmentTitle : 'All Departments';
  const now = new Date();
  const dateStr = now.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  const timeStr = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });

  // A4 Landscape: 297mm x 210mm
  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: 'a4'
  });

  const pageWidth = 297;
  const pageHeight = 210;
  const marginX = 12;
  const contentWidth = pageWidth - (marginX * 2); // 273mm

  // Layout constants
  const startY = 46;
  const rowHeight = 7.5;
  const headerHeight = 8;
  const bottomMargin = 16;
  const maxY = pageHeight - bottomMargin;

  // Column definitions: sum = 273mm
  // Sr: 10, Name: 45, Roll: 28, Dept: 55, Contact: 32, Chalan: 32, TID: 36, Status: 35
  const cols = [
    { label: '#', width: 10, align: 'center' },
    { label: 'Student Name', width: 45, align: 'left' },
    { label: 'Roll Number', width: 28, align: 'center' },
    { label: 'Department / Program', width: 55, align: 'left' },
    { label: 'Student Phone', width: 32, align: 'center' },
    { label: 'Chalan No', width: 32, align: 'center' },
    { label: 'Transaction ID', width: 36, align: 'center' },
    { label: 'Status', width: 35, align: 'center' }
  ];

  let currentPage = 1;
  let totalPages = 1; // updated at end

  // Helper to render top header
  const renderHeader = (page: number) => {
    // Brand Top Banner
    doc.setFillColor(12, 126, 129); // #0C7E81
    doc.rect(marginX, 10, contentWidth, 22, 'F');

    // Title text
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.text('SUPERIOR COLLEGE WAZIRABAD', marginX + contentWidth / 2, 18, { align: 'center' });

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.text('ANNUAL CONVOCATION 2026 • OFFICIAL REGISTRATION LIST', marginX + contentWidth / 2, 24, { align: 'center' });

    // Meta bar below banner
    doc.setFillColor(241, 245, 249); // slate-100
    doc.rect(marginX, 34, contentWidth, 8, 'F');
    doc.setDrawColor(203, 213, 225);
    doc.setLineWidth(0.2);
    doc.rect(marginX, 34, contentWidth, 8, 'S');

    doc.setFontSize(8);
    doc.setTextColor(51, 65, 85);
    doc.setFont('helvetica', 'bold');
    doc.text('Department:', marginX + 3, 39.5);
    doc.setFont('helvetica', 'normal');
    doc.text(deptLabel, marginX + 22, 39.5);

    doc.setFont('helvetica', 'bold');
    doc.text('Total Records:', marginX + 115, 39.5);
    doc.setFont('helvetica', 'normal');
    doc.text(`${students.length} Student${students.length === 1 ? '' : 's'}`, marginX + 138, 39.5);

    doc.setFont('helvetica', 'bold');
    doc.text('Date & Time:', marginX + 195, 39.5);
    doc.setFont('helvetica', 'normal');
    doc.text(`${dateStr} ${timeStr}`, marginX + 215, 39.5);
  };

  // Helper to render table header
  const renderTableHeader = (y: number) => {
    doc.setFillColor(15, 23, 42); // slate-900
    doc.rect(marginX, y, contentWidth, headerHeight, 'F');

    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);

    let currentX = marginX;
    cols.forEach(col => {
      const textX = col.align === 'center' ? currentX + col.width / 2 :
                    col.align === 'right' ? currentX + col.width - 2 : currentX + 2;
      doc.text(col.label, textX, y + 5.2, { align: col.align as any });
      currentX += col.width;
    });
  };

  // Helper to render page footer
  const renderFooter = (page: number) => {
    doc.setFontSize(7.5);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(148, 163, 184);

    const footerText = 'Superior College Wazirabad • Convocation 2026 Super Admin Portal';
    doc.text(footerText, marginX, pageHeight - 8);

    const pageText = `Page ${page}`;
    doc.text(pageText, marginX + contentWidth, pageHeight - 8, { align: 'right' });
  };

  // Initial page header
  renderHeader(currentPage);
  renderTableHeader(startY);

  let currentY = startY + headerHeight;

  students.forEach((item, index) => {
    // Check if new page needed
    if (currentY + rowHeight > maxY) {
      renderFooter(currentPage);
      doc.addPage();
      currentPage++;
      renderHeader(currentPage);
      renderTableHeader(startY);
      currentY = startY + headerHeight;
    }

    // Row zebra striping
    if (index % 2 === 1) {
      doc.setFillColor(248, 250, 252); // slate-50
      doc.rect(marginX, currentY, contentWidth, rowHeight, 'F');
    }

    // Subtle row bottom border
    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.15);
    doc.line(marginX, currentY + rowHeight, marginX + contentWidth, currentY + rowHeight);

    // Text formatting
    doc.setFontSize(7.5);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(30, 41, 59);

    let curX = marginX;

    // 1. Sr #
    doc.text(String(index + 1), curX + cols[0].width / 2, currentY + 5, { align: 'center' });
    curX += cols[0].width;

    // 2. Student Name
    doc.setFont('helvetica', 'bold');
    const safeName = doc.splitTextToSize(item.full_name || '-', cols[1].width - 4)[0] || '-';
    doc.text(safeName, curX + 2, currentY + 5);
    curX += cols[1].width;

    // 3. Roll Number
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(12, 126, 129); // #0C7E81
    doc.text(item.roll_number || '-', curX + cols[2].width / 2, currentY + 5, { align: 'center' });
    curX += cols[2].width;

    // 4. Department
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(51, 65, 85);
    const safeDept = doc.splitTextToSize(item.department || '-', cols[3].width - 4)[0] || '-';
    doc.text(safeDept, curX + 2, currentY + 5);
    curX += cols[3].width;

    // 5. Phone
    doc.text(item.student_phone || '-', curX + cols[4].width / 2, currentY + 5, { align: 'center' });
    curX += cols[4].width;

    // 6. Chalan No
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(30, 41, 59);
    doc.text(item.chalan_no || '-', curX + cols[5].width / 2, currentY + 5, { align: 'center' });
    curX += cols[5].width;

    // 7. Transaction ID
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(71, 85, 105);
    const safeTid = item.transaction_id || '-';
    doc.text(safeTid, curX + cols[6].width / 2, currentY + 5, { align: 'center' });
    curX += cols[6].width;

    // 8. Status Badge text
    const statusText = 
      item.payment_status === 'approved' ? 'Approved' :
      item.payment_status === 'pending_approval' ? 'Needs Approval' :
      item.payment_status === 'rejected' ? 'Rejected' : 'Pending Payment';

    if (item.payment_status === 'approved') {
      doc.setTextColor(22, 101, 52); // green-800
      doc.setFont('helvetica', 'bold');
    } else if (item.payment_status === 'rejected') {
      doc.setTextColor(153, 27, 27); // red-800
      doc.setFont('helvetica', 'bold');
    } else {
      doc.setTextColor(133, 77, 14); // amber-800
      doc.setFont('helvetica', 'bold');
    }
    doc.text(statusText, curX + cols[7].width / 2, currentY + 5, { align: 'center' });

    currentY += rowHeight;
  });

  // Footer on last page
  renderFooter(currentPage);

  // Download
  const safeDeptSlug = (deptLabel || 'All').replace(/[^a-zA-Z0-9]/g, '_');
  const fileDate = now.toISOString().slice(0, 10);
  doc.save(`Superior_Convocation_List_${safeDeptSlug}_${fileDate}.pdf`);
}
