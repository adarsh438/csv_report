'use client';

import React, { useState, useCallback } from 'react';
import FileUpload from '@/components/FileUpload';
import CSVPreview from '@/components/CSVPreview';
import ResultsTable from '@/components/ResultsTable';
import ImportStats from '@/components/ImportStats';
import ProgressBar from '@/components/ProgressBar';
import ThemeToggle from '@/components/ThemeToggle';
import { parseCSVClient } from '@/lib/csvParser';
import { importCSV } from '@/lib/api';
import { AppStep, RawRecord, CRMRecord } from '@/types';

export default function Home() {
  const [step, setStep] = useState<AppStep>('upload');
  const [file, setFile] = useState<File | null>(null);
  const [headers, setHeaders] = useState<string[]>([]);
  const [rawRecords, setRawRecords] = useState<RawRecord[]>([]);
  const [crmRecords, setCrmRecords] = useState<CRMRecord[]>([]);
  const [totalProcessed, setTotalProcessed] = useState(0);
  const [totalSkipped, setTotalSkipped] = useState(0);
  const [skippedReasons, setSkippedReasons] = useState<string[]>([]);
  const [error, setError] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);

  // Step 1: Handle file selection
  const handleFileSelect = useCallback(async (selectedFile: File) => {
    setFile(selectedFile);
    setError('');
    setIsLoading(true);

    try {
      const text = await selectedFile.text();
      const parsed = parseCSVClient(text);

      if (parsed.records.length === 0) {
        setError('CSV file contains no data rows.');
        setIsLoading(false);
        return;
      }

      setHeaders(parsed.headers);
      setRawRecords(parsed.records);
      setStep('preview');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to parse CSV file');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Step 3: Confirm and send to backend for AI processing
  const handleConfirmImport = useCallback(async () => {
    if (!file) return;

    setStep('processing');
    setError('');

    try {
      const response = await importCSV(file);

      if (!response.success) {
        throw new Error(response.error || 'Import failed');
      }

      setCrmRecords(response.data.records);
      setTotalProcessed(response.data.totalProcessed);
      setTotalSkipped(response.data.totalSkipped);
      setSkippedReasons(response.data.skippedReasons);
      setStep('results');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Import failed. Please try again.');
      setStep('preview');
    }
  }, [file]);

  // Reset to start over
  const handleReset = useCallback(() => {
    setStep('upload');
    setFile(null);
    setHeaders([]);
    setRawRecords([]);
    setCrmRecords([]);
    setTotalProcessed(0);
    setTotalSkipped(0);
    setSkippedReasons([]);
    setError('');
  }, []);

  // Go back from preview to upload
  const handleBack = useCallback(() => {
    setStep('upload');
    setError('');
  }, []);

  return (
    <div className="app">
      {/* Header */}
      <header className="app-header">
        <div className="header-content">
          <div className="logo">
            <div className="logo-icon">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 2L2 7l10 5 10-5-10-5z" />
                <path d="M2 17l10 5 10-5" />
                <path d="M2 12l10 5 10-5" />
              </svg>
            </div>
            <div>
              <h1 className="logo-text">GrowEasy</h1>
              <p className="logo-tagline">CSV Importer</p>
            </div>
          </div>
          <div className="header-actions">
            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="app-main">
        <div className="container">
          {/* Page Title */}
          <div className="page-title-section">
            <h2 className="page-title">Import Leads via CSV</h2>
            <p className="page-subtitle">
              Upload a CSV file to bulk import leads into your system.
              Our AI will intelligently map your columns to CRM fields.
            </p>
          </div>

          {/* Stepper */}
          <div className="stepper">
            <div className={`stepper-item ${step === 'upload' ? 'active' : ''} ${['preview', 'processing', 'results'].includes(step) ? 'completed' : ''}`}>
              <div className="stepper-number">
                {['preview', 'processing', 'results'].includes(step) ? (
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                ) : '1'}
              </div>
              <span className="stepper-label">Upload</span>
            </div>
            <div className="stepper-connector" />
            <div className={`stepper-item ${step === 'preview' ? 'active' : ''} ${['processing', 'results'].includes(step) ? 'completed' : ''}`}>
              <div className="stepper-number">
                {['processing', 'results'].includes(step) ? (
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                ) : '2'}
              </div>
              <span className="stepper-label">Preview</span>
            </div>
            <div className="stepper-connector" />
            <div className={`stepper-item ${step === 'processing' ? 'active' : ''} ${step === 'results' ? 'completed' : ''}`}>
              <div className="stepper-number">
                {step === 'results' ? (
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                ) : '3'}
              </div>
              <span className="stepper-label">Process</span>
            </div>
            <div className="stepper-connector" />
            <div className={`stepper-item ${step === 'results' ? 'active' : ''}`}>
              <div className="stepper-number">4</div>
              <span className="stepper-label">Results</span>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="error-banner">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <line x1="15" y1="9" x2="9" y2="15" />
                <line x1="9" y1="9" x2="15" y2="15" />
              </svg>
              <div>
                <p className="error-title">Something went wrong</p>
                <p className="error-message">{error}</p>
              </div>
              <button className="error-dismiss" onClick={() => setError('')} aria-label="Dismiss error" title="Dismiss error">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>
          )}

          {/* Step Content */}
          <div className="step-content">
            {step === 'upload' && (
              <div className="fade-in">
                <FileUpload onFileSelect={handleFileSelect} isLoading={isLoading} />
              </div>
            )}

            {step === 'preview' && file && (
              <div className="fade-in">
                <CSVPreview
                  headers={headers}
                  records={rawRecords}
                  fileName={file.name}
                  fileSize={file.size}
                />
                <div className="action-bar">
                  <button className="btn btn-secondary" onClick={handleBack}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <line x1="19" y1="12" x2="5" y2="12" />
                      <polyline points="12 19 5 12 12 5" />
                    </svg>
                    Back
                  </button>
                  <button className="btn btn-primary" onClick={handleConfirmImport}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                      <polyline points="17 8 12 3 7 8" />
                      <line x1="12" y1="3" x2="12" y2="15" />
                    </svg>
                    Confirm Import
                  </button>
                </div>
              </div>
            )}

            {step === 'processing' && (
              <div className="fade-in">
                <ProgressBar />
              </div>
            )}

            {step === 'results' && (
              <div className="fade-in">
                <ImportStats
                  totalProcessed={totalProcessed}
                  totalImported={crmRecords.length}
                  totalSkipped={totalSkipped}
                  skippedReasons={skippedReasons}
                />
                <ResultsTable records={crmRecords} />
                <div className="action-bar">
                  <button className="btn btn-secondary" onClick={handleReset}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="1 4 1 10 7 10" />
                      <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10" />
                    </svg>
                    Import Another File
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="app-footer">
        <p>
          Built for <strong>GrowEasy</strong> · AI-Powered CSV Importer
        </p>
      </footer>
    </div>
  );
}
