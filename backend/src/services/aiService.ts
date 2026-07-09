import { GoogleGenerativeAI } from '@google/generative-ai';
import { RawRecord, CRMRecord, ExtractionResult } from '../types';
import { SYSTEM_PROMPT, buildExtractionPrompt } from '../prompts/extraction';
import { batchRecords } from './csvService';

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

/** Maximum retries for a failed batch */
const MAX_RETRIES = 3;

/** Base delay for exponential backoff (ms) */
const BASE_DELAY = 1000;

/** Batch size for AI processing */
const BATCH_SIZE = 25;

/**
 * Extracts CRM records from raw CSV records using AI.
 * Processes records in batches with retry logic.
 */
export async function extractCRMRecords(
  headers: string[],
  records: RawRecord[],
  onProgress?: (current: number, total: number) => void
): Promise<ExtractionResult> {
  const batches = batchRecords(records, BATCH_SIZE);
  const allRecords: CRMRecord[] = [];
  let totalSkipped = 0;
  const allSkippedReasons: string[] = [];

  console.log(`Processing ${records.length} records in ${batches.length} batches...`);

  for (let i = 0; i < batches.length; i++) {
    const batch = batches[i];
    console.log(`Processing batch ${i + 1}/${batches.length} (${batch.length} records)...`);

    try {
      const result = await processWithRetry(headers, batch);
      allRecords.push(...result.records);
      totalSkipped += result.skippedCount;
      allSkippedReasons.push(...result.skippedReasons);
    } catch (error) {
      console.error(`Failed to process batch ${i + 1} after ${MAX_RETRIES} retries:`, error);
      // Mark all records in failed batch as skipped
      totalSkipped += batch.length;
      allSkippedReasons.push(
        `Batch ${i + 1}: AI processing failed after ${MAX_RETRIES} retries — ${batch.length} records skipped`
      );
    }

    // Report progress
    if (onProgress) {
      onProgress(i + 1, batches.length);
    }
  }

  return {
    records: allRecords,
    skippedCount: totalSkipped,
    skippedReasons: allSkippedReasons,
  };
}

/**
 * Process a single batch with exponential backoff retry.
 */
async function processWithRetry(
  headers: string[],
  batch: RawRecord[]
): Promise<ExtractionResult> {
  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      return await processBatch(headers, batch);
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      console.warn(`Batch attempt ${attempt}/${MAX_RETRIES} failed:`, lastError.message);

      if (attempt < MAX_RETRIES) {
        const delay = BASE_DELAY * Math.pow(2, attempt - 1);
        console.log(`Retrying in ${delay}ms...`);
        await sleep(delay);
      }
    }
  }

  throw lastError || new Error('All retries exhausted');
}

/**
 * Process a single batch of records through Gemini AI.
 */
async function processBatch(
  headers: string[],
  batch: RawRecord[]
): Promise<ExtractionResult> {
  const model = genAI.getGenerativeModel({
    model: 'gemini-2.0-flash',
    generationConfig: {
      temperature: 0.1, // Low temperature for consistent extraction
      topP: 0.95,
      maxOutputTokens: 8192,
      responseMimeType: 'application/json',
    },
  });

  const userPrompt = buildExtractionPrompt(headers, batch);

  const result = await model.generateContent({
    contents: [
      {
        role: 'user',
        parts: [{ text: userPrompt }],
      },
    ],
    systemInstruction: {
      role: 'system',
      parts: [{ text: SYSTEM_PROMPT }],
    },
  });

  const response = result.response;
  const text = response.text();

  // Parse the AI response
  let parsed: {
    records: CRMRecord[];
    skipped: Array<{ original: RawRecord; reason: string }>;
  };

  try {
    // Try direct JSON parse first
    parsed = JSON.parse(text);
  } catch {
    // Try extracting JSON from markdown code fences
    const jsonMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (jsonMatch) {
      parsed = JSON.parse(jsonMatch[1].trim());
    } else {
      // Try finding JSON object in the text
      const startIdx = text.indexOf('{');
      const endIdx = text.lastIndexOf('}');
      if (startIdx !== -1 && endIdx !== -1) {
        parsed = JSON.parse(text.substring(startIdx, endIdx + 1));
      } else {
        throw new Error('Failed to parse AI response as JSON');
      }
    }
  }

  // Validate and normalize records
  const validRecords = (parsed.records || []).map(normalizeRecord);
  const skippedReasons = (parsed.skipped || []).map(
    (s) => s.reason || 'Unknown reason'
  );

  return {
    records: validRecords,
    skippedCount: (parsed.skipped || []).length,
    skippedReasons,
  };
}

/**
 * Normalizes a CRM record to ensure all fields exist and are properly formatted.
 */
function normalizeRecord(record: Partial<CRMRecord>): CRMRecord {
  const allowedStatuses = [
    'GOOD_LEAD_FOLLOW_UP',
    'DID_NOT_CONNECT',
    'BAD_LEAD',
    'SALE_DONE',
  ];
  const allowedSources = [
    'leads_on_demand',
    'meridian_tower',
    'eden_park',
    'varah_swamy',
    'sarjapur_plots',
  ];

  // Validate crm_status
  let status = (record.crm_status || '').toString().trim();
  if (!allowedStatuses.includes(status)) {
    status = '';
  }

  // Validate data_source
  let source = (record.data_source || '').toString().trim();
  if (!allowedSources.includes(source)) {
    source = '';
  }

  // Normalize date
  let createdAt = (record.created_at || '').toString().trim();
  if (createdAt) {
    try {
      const date = new Date(createdAt);
      if (isNaN(date.getTime())) {
        createdAt = new Date().toISOString();
      }
    } catch {
      createdAt = new Date().toISOString();
    }
  }

  // Clean phone number — digits only
  let mobile = (record.mobile_without_country_code || '').toString().trim();
  mobile = mobile.replace(/[^\d]/g, '');

  return {
    created_at: createdAt,
    name: cleanField(record.name),
    email: cleanField(record.email),
    country_code: cleanField(record.country_code),
    mobile_without_country_code: mobile,
    company: cleanField(record.company),
    city: cleanField(record.city),
    state: cleanField(record.state),
    country: cleanField(record.country),
    lead_owner: cleanField(record.lead_owner),
    crm_status: status as CRMRecord['crm_status'],
    crm_note: cleanField(record.crm_note),
    data_source: source as CRMRecord['data_source'],
    possession_time: cleanField(record.possession_time),
    description: cleanField(record.description),
  };
}

/**
 * Cleans a field value, replacing line breaks with \n.
 */
function cleanField(value: string | undefined | null): string {
  if (!value) return '';
  return value
    .toString()
    .trim()
    .replace(/\r\n/g, '\\n')
    .replace(/\r/g, '\\n')
    .replace(/\n/g, '\\n');
}

/**
 * Sleep utility for retry backoff.
 */
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
