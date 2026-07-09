/** Shared TypeScript types for the CSV Importer */

/** CRM record fields as defined by GrowEasy */
export interface CRMRecord {
  created_at: string;
  name: string;
  email: string;
  country_code: string;
  mobile_without_country_code: string;
  company: string;
  city: string;
  state: string;
  country: string;
  lead_owner: string;
  crm_status: string;
  crm_note: string;
  data_source: string;
  possession_time: string;
  description: string;
}

/** Raw CSV record (arbitrary column names) */
export type RawRecord = Record<string, string>;

/** API response for import */
export interface ImportResponse {
  success: boolean;
  data: {
    records: CRMRecord[];
    totalProcessed: number;
    totalImported: number;
    totalSkipped: number;
    skippedReasons: string[];
  };
  error?: string;
}

/** API response for parse/preview */
export interface ParseResponse {
  success: boolean;
  data: {
    headers: string[];
    records: RawRecord[];
    totalRows: number;
  };
  error?: string;
}

/** Application step state */
export type AppStep = 'upload' | 'preview' | 'processing' | 'results';
