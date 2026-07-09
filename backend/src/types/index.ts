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
  crm_status: CRMStatus | '';
  crm_note: string;
  data_source: DataSource | '';
  possession_time: string;
  description: string;
}

/** Allowed CRM status values */
export type CRMStatus =
  | 'GOOD_LEAD_FOLLOW_UP'
  | 'DID_NOT_CONNECT'
  | 'BAD_LEAD'
  | 'SALE_DONE';

/** Allowed data source values */
export type DataSource =
  | 'leads_on_demand'
  | 'meridian_tower'
  | 'eden_park'
  | 'varah_swamy'
  | 'sarjapur_plots';

/** Raw CSV record (arbitrary column names) */
export type RawRecord = Record<string, string>;

/** Result of AI extraction for a batch */
export interface ExtractionResult {
  records: CRMRecord[];
  skippedCount: number;
  skippedReasons: string[];
}

/** Overall import response */
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

/** Batch processing progress */
export interface BatchProgress {
  currentBatch: number;
  totalBatches: number;
  processedRecords: number;
  totalRecords: number;
  percentage: number;
}
