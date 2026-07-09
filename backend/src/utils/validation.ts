import { Request } from 'express';

/**
 * Validates that the uploaded file is a valid CSV.
 */
export function validateCSVFile(file: Express.Multer.File | undefined): {
  valid: boolean;
  error?: string;
} {
  if (!file) {
    return { valid: false, error: 'No file uploaded. Please provide a CSV file.' };
  }

  // Check MIME type
  const allowedMimes = [
    'text/csv',
    'application/vnd.ms-excel',
    'text/plain',
    'application/octet-stream',
  ];

  if (!allowedMimes.includes(file.mimetype)) {
    return {
      valid: false,
      error: `Invalid file type: ${file.mimetype}. Please upload a CSV file.`,
    };
  }

  // Check file extension
  const fileName = file.originalname.toLowerCase();
  if (!fileName.endsWith('.csv')) {
    return {
      valid: false,
      error: 'Invalid file extension. Please upload a file with .csv extension.',
    };
  }

  // Check file size (max 10MB)
  const maxSize = 10 * 1024 * 1024;
  if (file.size > maxSize) {
    return {
      valid: false,
      error: `File too large (${(file.size / 1024 / 1024).toFixed(1)}MB). Maximum size is 10MB.`,
    };
  }

  // Check if file has content
  if (file.size === 0) {
    return { valid: false, error: 'File is empty. Please upload a CSV with data.' };
  }

  return { valid: true };
}

/**
 * Sanitize a string to prevent injection attacks.
 */
export function sanitizeString(input: string): string {
  return input.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '').trim();
}
