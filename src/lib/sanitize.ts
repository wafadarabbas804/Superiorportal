/**
 * Centralized Input Sanitization & Security Validation Utility
 * Protects against XSS, HTML Injection, Script Execution, SQL/NoSQL injections,
 * and Excel/CSV formula injection across Superior College Portal.
 */

/**
 * Strips all HTML tags, script blocks, javascript: pseudo-protocols, and control characters
 */
export function stripHtml(str: string): string {
  if (!str || typeof str !== 'string') return '';
  return str
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '') // Remove <script> blocks
    .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')   // Remove <style> blocks
    .replace(/<[^>]+>/g, '')                                           // Remove all HTML tags
    .replace(/javascript:/gi, '')                                      // Remove javascript: URLs
    .replace(/data:/gi, '')                                            // Remove data: URLs
    .replace(/vbscript:/gi, '')                                        // Remove vbscript:
    .replace(/on\w+\s*=/gi, '')                                        // Remove onload=, onclick= etc.
    .trim();
}

/**
 * Basic text sanitizer for general inputs:
 * Strips HTML, trims, and escapes CSV/Excel formula injection starters (=, +, -, @)
 */
export function sanitizeText(str: string, maxLength: number = 255): string {
  if (!str || typeof str !== 'string') return '';
  let cleaned = stripHtml(str).slice(0, maxLength).trim();

  // Neutralize CSV/Excel formula injection (e.g. =cmd|..., @SUM, +123, -calc)
  if (/^[=+\-@\t\r]/.test(cleaned)) {
    cleaned = "'" + cleaned;
  }
  return cleaned;
}

/**
 * Validates and sanitizes a student's Full Name:
 * Allows English letters, spaces, dots, and hyphens (e.g. Muhammad Ali, M. Talha)
 */
export function validateAndSanitizeName(name: string): { valid: boolean; value: string; error?: string } {
  const cleaned = stripHtml(name).replace(/\s+/g, ' ').trim();

  if (!cleaned) {
    return { valid: false, value: '', error: 'Student full name is required.' };
  }

  if (cleaned.length < 3) {
    return { valid: false, value: cleaned, error: 'Full name must be at least 3 characters long.' };
  }

  if (cleaned.length > 60) {
    return { valid: false, value: cleaned.slice(0, 60), error: 'Full name cannot exceed 60 characters.' };
  }

  // Only letters, spaces, dots, and hyphens allowed
  const nameRegex = /^[A-Za-z\s.\-']+$/;
  if (!nameRegex.test(cleaned)) {
    return { 
      valid: false, 
      value: cleaned, 
      error: 'Name can only contain letters, spaces, and dots. Numbers or special symbols are not allowed.' 
    };
  }

  return { valid: true, value: cleaned };
}

/**
 * Validates and sanitizes College Roll Number:
 * Uppercase, alphanumeric, hyphens, and slashes (e.g. BSCS-F22-020, BSCS-22-105)
 */
export function validateAndSanitizeRollNumber(roll: string): { valid: boolean; value: string; error?: string } {
  let cleaned = stripHtml(roll).replace(/\s+/g, '').toUpperCase().trim();

  if (!cleaned) {
    return { valid: false, value: '', error: 'College Roll Number is required.' };
  }

  if (cleaned.length < 3 || cleaned.length > 25) {
    return { valid: false, value: cleaned, error: 'Roll number must be between 3 and 25 characters.' };
  }

  const rollRegex = /^[A-Z0-9\-_/]+$/;
  if (!rollRegex.test(cleaned)) {
    return { 
      valid: false, 
      value: cleaned, 
      error: 'Invalid Roll Number format. Only letters, numbers, and hyphens (e.g. BSCS-22-105) are allowed.' 
    };
  }

  return { valid: true, value: cleaned };
}

/**
 * Validates and sanitizes Pakistani Mobile / WhatsApp phone numbers:
 * Must be 11 digits starting with 03 (e.g. 03001234567) or 12 digits starting with 923
 */
export function validateAndSanitizePhone(phone: string, label: string = 'Phone Number'): { valid: boolean; value: string; error?: string } {
  const digitsOnly = phone.replace(/[^\d]/g, '').trim();

  if (!digitsOnly) {
    return { valid: false, value: '', error: `${label} is required.` };
  }

  // Handle standard 03XXXXXXXXX (11 digits)
  if (digitsOnly.length === 11 && digitsOnly.startsWith('03')) {
    return { valid: true, value: digitsOnly };
  }

  // Handle 923XXXXXXXXX (12 digits) -> convert to 03... for standard DB storage
  if (digitsOnly.length === 12 && digitsOnly.startsWith('923')) {
    const formatted = '0' + digitsOnly.slice(2);
    return { valid: true, value: formatted };
  }

  // Handle 3XXXXXXXXX (10 digits) -> prepend 0
  if (digitsOnly.length === 10 && digitsOnly.startsWith('3')) {
    return { valid: true, value: '0' + digitsOnly };
  }

  return {
    valid: false,
    value: digitsOnly,
    error: `${label} must be a valid 11-digit Pakistani mobile number (e.g. 03001234567).`
  };
}

/**
 * Validates and sanitizes Email addresses:
 */
export function validateAndSanitizeEmail(email: string): { valid: boolean; value: string; error?: string } {
  const cleaned = stripHtml(email).toLowerCase().trim();

  if (!cleaned) {
    return { valid: false, value: '', error: 'Email address is required.' };
  }

  if (cleaned.length > 100) {
    return { valid: false, value: cleaned, error: 'Email cannot exceed 100 characters.' };
  }

  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  if (!emailRegex.test(cleaned)) {
    return { valid: false, value: cleaned, error: 'Please enter a valid email address (e.g. student@gmail.com).' };
  }

  return { valid: true, value: cleaned };
}

/**
 * Validates that Department belongs to approved whitelist
 */
export function validateDepartment(dept: string, allowedDepartments: string[]): { valid: boolean; value: string; error?: string } {
  const cleaned = stripHtml(dept).trim();
  if (!allowedDepartments.includes(cleaned)) {
    return { valid: false, value: cleaned, error: 'Please select a valid Department / Program from the list.' };
  }
  return { valid: true, value: cleaned };
}

/**
 * Sanitizes Payment Transaction ID (TID):
 */
export function sanitizeTransactionId(tid?: string | null): string {
  if (!tid) return '';
  return stripHtml(tid)
    .replace(/[^A-Za-z0-9\-_#]/g, '')
    .slice(0, 45)
    .trim();
}

/**
 * Validates uploaded proof file (Extension, MIME type, File size <= 5MB)
 */
export function validateUploadFile(file: File): { valid: boolean; error?: string } {
  const allowedExtensions = ['jpg', 'jpeg', 'png', 'webp'];
  const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/webp'];
  const maxSizeBytes = 5 * 1024 * 1024; // 5MB

  if (!file) {
    return { valid: false, error: 'Please select a payment proof screenshot.' };
  }

  if (file.size > maxSizeBytes) {
    return { valid: false, error: 'File size exceeds maximum allowed limit (5MB).' };
  }

  const ext = file.name.split('.').pop()?.toLowerCase();
  if (!ext || !allowedExtensions.includes(ext)) {
    return { valid: false, error: 'Invalid file format. Only JPG, PNG, and WebP images are allowed.' };
  }

  if (!allowedMimeTypes.includes(file.type)) {
    return { valid: false, error: 'Invalid image type detected. Please upload a genuine photo receipt.' };
  }

  return { valid: true };
}
