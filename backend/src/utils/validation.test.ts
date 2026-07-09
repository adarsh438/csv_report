import { validateCSVFile, sanitizeString } from './validation';

describe('Validation Utils', () => {
  describe('validateCSVFile', () => {
    it('should reject when no file is provided', () => {
      const result = validateCSVFile(undefined);
      expect(result.valid).toBe(false);
      expect(result.error).toMatch(/No file uploaded/);
    });

    it('should reject invalid MIME types', () => {
      const file = {
        mimetype: 'application/json',
        originalname: 'data.csv',
        size: 1024,
      } as Express.Multer.File;

      const result = validateCSVFile(file);
      expect(result.valid).toBe(false);
      expect(result.error).toMatch(/Invalid file type/);
    });

    it('should reject invalid file extensions', () => {
      const file = {
        mimetype: 'text/csv',
        originalname: 'data.txt',
        size: 1024,
      } as Express.Multer.File;

      const result = validateCSVFile(file);
      expect(result.valid).toBe(false);
      expect(result.error).toMatch(/Invalid file extension/);
    });

    it('should reject files that are too large', () => {
      const file = {
        mimetype: 'text/csv',
        originalname: 'data.csv',
        size: 15 * 1024 * 1024, // 15MB
      } as Express.Multer.File;

      const result = validateCSVFile(file);
      expect(result.valid).toBe(false);
      expect(result.error).toMatch(/File too large/);
    });

    it('should reject empty files', () => {
      const file = {
        mimetype: 'text/csv',
        originalname: 'data.csv',
        size: 0,
      } as Express.Multer.File;

      const result = validateCSVFile(file);
      expect(result.valid).toBe(false);
      expect(result.error).toMatch(/File is empty/);
    });

    it('should accept valid CSV files', () => {
      const file = {
        mimetype: 'text/csv',
        originalname: 'data.csv',
        size: 1024,
      } as Express.Multer.File;

      const result = validateCSVFile(file);
      expect(result.valid).toBe(true);
      expect(result.error).toBeUndefined();
    });
  });

  describe('sanitizeString', () => {
    it('should trim whitespace', () => {
      expect(sanitizeString('  hello  ')).toBe('hello');
    });

    it('should remove control characters', () => {
      expect(sanitizeString('hello\x00world')).toBe('helloworld');
    });
  });
});
