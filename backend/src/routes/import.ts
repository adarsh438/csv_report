import { Router, Request, Response } from 'express';
import multer from 'multer';
import { parseCSV } from '../services/csvService';
import { extractCRMRecords } from '../services/aiService';
import { validateCSVFile } from '../utils/validation';
import { ImportResponse } from '../types';

const router = Router();

// Configure multer for file uploads (store in memory)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB
  },
});

/**
 * POST /api/import
 * Upload and process a CSV file through AI extraction.
 */
router.post('/', upload.single('file'), async (req: Request, res: Response): Promise<void> => {
  try {
    // 1. Validate the uploaded file
    const validation = validateCSVFile(req.file);
    if (!validation.valid) {
      res.status(400).json({
        success: false,
        error: validation.error,
      } as ImportResponse);
      return;
    }

    const file = req.file!;
    console.log(`Received file: ${file.originalname} (${(file.size / 1024).toFixed(1)}KB)`);

    // 2. Parse CSV
    let headers: string[];
    let records: Record<string, string>[];

    try {
      const parsed = parseCSV(file.buffer);
      headers = parsed.headers;
      records = parsed.records;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to parse CSV';
      res.status(400).json({
        success: false,
        error: `CSV parsing error: ${message}`,
      } as ImportResponse);
      return;
    }

    console.log(`Parsed ${records.length} records with ${headers.length} columns: [${headers.join(', ')}]`);

    if (records.length === 0) {
      res.status(400).json({
        success: false,
        error: 'CSV file contains no data rows.',
      } as ImportResponse);
      return;
    }

    // 3. AI Extraction
    const result = await extractCRMRecords(headers, records);

    // 4. Return structured response
    const response: ImportResponse = {
      success: true,
      data: {
        records: result.records,
        totalProcessed: records.length,
        totalImported: result.records.length,
        totalSkipped: result.skippedCount,
        skippedReasons: result.skippedReasons,
      },
    };

    console.log(`Import complete: ${result.records.length} imported, ${result.skippedCount} skipped`);

    res.json(response);
  } catch (error) {
    console.error('Import error:', error);
    const message = error instanceof Error ? error.message : 'Internal server error';
    res.status(500).json({
      success: false,
      error: `Import failed: ${message}`,
    } as ImportResponse);
  }
});

/**
 * POST /api/parse
 * Parse a CSV file and return raw data for preview (no AI processing).
 */
router.post('/parse', upload.single('file'), async (req: Request, res: Response): Promise<void> => {
  try {
    const validation = validateCSVFile(req.file);
    if (!validation.valid) {
      res.status(400).json({
        success: false,
        error: validation.error,
      });
      return;
    }

    const file = req.file!;
    const parsed = parseCSV(file.buffer);

    res.json({
      success: true,
      data: {
        headers: parsed.headers,
        records: parsed.records,
        totalRows: parsed.records.length,
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to parse CSV';
    res.status(400).json({
      success: false,
      error: message,
    });
  }
});

export default router;
