import { RawRecord } from '@/types';

/**
 * Client-side CSV parser for quick preview before server upload.
 * This avoids a server round-trip for the preview step.
 */
export function parseCSVClient(text: string): {
  headers: string[];
  records: RawRecord[];
} {
  const lines = text.split(/\r?\n/).filter((line) => line.trim());

  if (lines.length === 0) {
    throw new Error('CSV file is empty');
  }

  const delimiter = detectDelimiter(lines[0]);
  const headers = parseCSVLine(lines[0], delimiter);

  const records: RawRecord[] = [];
  for (let i = 1; i < lines.length; i++) {
    const values = parseCSVLine(lines[i], delimiter);
    const record: RawRecord = {};
    headers.forEach((header, index) => {
      record[header] = values[index] || '';
    });
    records.push(record);
  }

  return { headers, records };
}

/**
 * Parse a single CSV line handling quoted fields.
 */
function parseCSVLine(line: string, delimiter: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];

    if (inQuotes) {
      if (char === '"') {
        if (i + 1 < line.length && line[i + 1] === '"') {
          current += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        current += char;
      }
    } else {
      if (char === '"') {
        inQuotes = true;
      } else if (char === delimiter) {
        result.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
  }

  result.push(current.trim());
  return result;
}

/**
 * Auto-detect CSV delimiter.
 */
function detectDelimiter(firstLine: string): string {
  const delimiters = [
    { char: ',', count: 0 },
    { char: ';', count: 0 },
    { char: '\t', count: 0 },
    { char: '|', count: 0 },
  ];

  for (const d of delimiters) {
    d.count = (firstLine.match(new RegExp(`\\${d.char}`, 'g')) || []).length;
  }

  delimiters.sort((a, b) => b.count - a.count);
  return delimiters[0].count > 0 ? delimiters[0].char : ',';
}
