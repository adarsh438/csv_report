import { parse } from 'csv-parse/sync';
import { RawRecord } from '../types';
import { sanitizeString } from '../utils/validation';

/**
 * Parses a CSV buffer into an array of records.
 * Handles various CSV formats, delimiters, and encodings.
 */
export function parseCSV(buffer: Buffer): {
  headers: string[];
  records: RawRecord[];
} {
  const content = buffer.toString('utf-8');

  // Detect delimiter (comma, semicolon, tab, pipe)
  const delimiter = detectDelimiter(content);

  const rawRecords = parse(content, {
    columns: true,
    skip_empty_lines: true,
    trim: true,
    relax_column_count: true,
    relax_quotes: true,
    delimiter,
    bom: true, // Handle byte order mark
  }) as RawRecord[];

  if (rawRecords.length === 0) {
    throw new Error('CSV file contains no data rows.');
  }

  // Extract headers from the first record
  const headers = Object.keys(rawRecords[0]);

  if (headers.length === 0) {
    throw new Error('CSV file contains no columns.');
  }

  // Sanitize all values
  const records = rawRecords.map((record) => {
    const sanitized: RawRecord = {};
    for (const [key, value] of Object.entries(record)) {
      sanitized[sanitizeString(key)] = sanitizeString(String(value || ''));
    }
    return sanitized;
  });

  return { headers: headers.map(sanitizeString), records };
}

/**
 * Detects the delimiter used in a CSV string.
 */
function detectDelimiter(content: string): string {
  const firstLine = content.split('\n')[0] || '';
  const delimiters = [
    { char: ',', count: 0 },
    { char: ';', count: 0 },
    { char: '\t', count: 0 },
    { char: '|', count: 0 },
  ];

  for (const d of delimiters) {
    d.count = (firstLine.match(new RegExp(`\\${d.char}`, 'g')) || []).length;
  }

  // Sort by count descending and return the most frequent
  delimiters.sort((a, b) => b.count - a.count);

  return delimiters[0].count > 0 ? delimiters[0].char : ',';
}

/**
 * Splits records into batches for AI processing.
 */
export function batchRecords(records: RawRecord[], batchSize: number = 25): RawRecord[][] {
  const batches: RawRecord[][] = [];
  for (let i = 0; i < records.length; i += batchSize) {
    batches.push(records.slice(i, i + batchSize));
  }
  return batches;
}
