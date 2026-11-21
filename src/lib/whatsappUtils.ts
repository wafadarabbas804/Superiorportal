import { Registration } from './supabase';

/**
 * Normalizes any Pakistani mobile number to international WhatsApp format (e.g. 923001234567)
 */
export function formatWhatsAppPhone(phone: string): string {
  if (!phone) return '';
  // Remove all non-numeric characters except leading +
  let cleaned = phone.replace(/[^\d]/g, '');

  // If starts with 0 (e.g. 03001234567 -> 923001234567)
  if (cleaned.startsWith('03')) {
    cleaned = '92' + cleaned.substring(1);
  } else if (cleaned.startsWith('923')) {
    // already 923...
  } else if (cleaned.startsWith('3') && cleaned.length === 10) {
    // 3001234567 -> 923001234567
    cleaned = '92' + cleaned;
  }

  return cleaned;
}

/**
 * Returns the current site base URL for track links
 */
export function getPortalBaseUrl(): string {
  if (typeof process !== 'undefined' && process.env.NEXT_PUBLIC_SITE_URL) {
    return process.env.NEXT_PUBLIC_SITE_URL.replace(/\/$/, '');
  }
  if (typeof window !== 'undefined') {
    return window.location.origin;
  }
  return 'https://superior-portal.edu.pk';
}

export type WhatsAppMessageType = 'pending' | 'rejected' | 'approved';

/**
 * Generates the official professional English WhatsApp message
 */
export function generateWhatsAppMessage(
  type: WhatsAppMessageType,
  student: Registration,
  customReason?: string
): string {
  const baseUrl = getPortalBaseUrl();
  const trackLink = `${baseUrl}/track?roll=${encodeURIComponent(student.roll_number)}`;
  const reasonText = customReason || student.rejection_reason || 'Unclear payment receipt screenshot or mismatched Transaction ID.';

  if (type === 'rejected') {
    return `⚠️ *SUPERIOR COLLEGE WAZIRABAD*
*OFFICE OF ACCOUNTS & CONVOCATION*
*CONVOCATION 2026 — PAYMENT PROOF REJECTION NOTICE*

Dear *${student.full_name}* (Roll No: *${student.roll_number}*),

Your submitted payment proof for the Annual Convocation 2026 registration has been reviewed and *REJECTED* by the Accounts Office.

❌ *Reason for Rejection:*
${reasonText}

🔄 *Required Action:*
Please transfer the exact fee of *PKR 6,000/-* and re-upload a clear payment screenshot along with the valid Transaction ID (TID) at the link below:

👉 *Re-upload Payment Proof:*
${trackLink}

Kindly resolve this at your earliest convenience to confirm your convocation attendance.

Regards,
*Accounts Office*
Superior College Wazirabad
📞 Helpline: 0314-7206680`;
  }

  if (type === 'approved') {
    return `🎉 *SUPERIOR COLLEGE WAZIRABAD*
*OFFICE OF ACCOUNTS & CONVOCATION*
*CONVOCATION 2026 — REGISTRATION APPROVED*

Dear *${student.full_name}* (Roll No: *${student.roll_number}*),

Congratulations! Your payment for the *Annual Convocation 2026* has been verified and *APPROVED* by the Accounts Office.

🎫 *Your Official Entry Pass is Ready:*
You can now view, download, and print your official Entry Pass using the link below:

👉 *Download Entry Pass:*
${trackLink}

📌 *Instructions for the Event:*
Please bring a printed copy of your Entry Pass along with your Original Student ID Card to the venue.

Regards,
*Accounts Office*
Superior College Wazirabad
📞 Helpline: 0314-7206680`;
  }

  // Default: Pending Fee Reminder
  return `🎓 *SUPERIOR COLLEGE WAZIRABAD*
*OFFICE OF ACCOUNTS & CONVOCATION*
*ANNUAL CONVOCATION 2026 — FEE REMINDER NOTICE*

Dear *${student.full_name}*,

This is an official notification regarding your registration for the *Annual Convocation 2026* at Superior College Wazirabad.

Our records indicate that your convocation registration fee is currently *PENDING*.

📋 *Registration Summary:*
• *Student Name:* ${student.full_name}
• *Roll Number:* ${student.roll_number}
• *Department:* ${student.department}
• *Chalan Reference:* ${student.chalan_no}
• *Payable Fee:* PKR 6,000/-

💳 *Payment & Submission Instructions:*
1. Deposit your registration fee of *PKR 6,000/-* via JazzCash or Mobile Banking App as indicated on your Chalan form.
2. Submit your payment proof (Screenshot & Transaction ID) on our official portal using the link below:

👉 *Upload Payment Receipt:*
${trackLink}

⚠️ *Important Notice:*
Gown allocation, Degree Folder, and the Official Convocation Entry Pass will only be issued upon successful fee verification by the Accounts Office.

Regards,
*Accounts Office*
Superior College Wazirabad
📞 Helpline: 0314-7206680`;
}

/**
 * Triggers direct WhatsApp Web / App chat opening with UTF-8 preservation
 */
export function sendWhatsAppMessage(phone: string, message: string): boolean {
  const cleanPhone = formatWhatsAppPhone(phone);
  if (!cleanPhone || cleanPhone.length < 10) {
    alert('Student ka phone number na-mukammal ya ghalat hai.');
    return false;
  }

  // Proper UTF-8 URI encoding
  const encoded = encodeURIComponent(message);

  // Directly targeting web.whatsapp.com on desktop prevents the wa.me intermediary redirect
  // from corrupting multi-byte UTF-8 emojis into replacement diamonds () on Windows
  const isMobile = typeof navigator !== 'undefined' && /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
  const waUrl = isMobile
    ? `https://api.whatsapp.com/send?phone=${cleanPhone}&text=${encoded}`
    : `https://web.whatsapp.com/send?phone=${cleanPhone}&text=${encoded}`;

  window.open(waUrl, '_blank', 'noopener,noreferrer');
  return true;
}
