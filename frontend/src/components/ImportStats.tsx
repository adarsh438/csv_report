'use client';

import React from 'react';

interface ImportStatsProps {
  totalProcessed: number;
  totalImported: number;
  totalSkipped: number;
  skippedReasons: string[];
}

export default function ImportStats({
  totalProcessed,
  totalImported,
  totalSkipped,
  skippedReasons,
}: ImportStatsProps) {
  const successRate = totalProcessed > 0 ? Math.round((totalImported / totalProcessed) * 100) : 0;

  return (
    <div className="import-stats">
      <div className="stats-grid">
        <div className="stat-card stat-total">
          <div className="stat-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
            </svg>
          </div>
          <div className="stat-content">
            <p className="stat-value">{totalProcessed}</p>
            <p className="stat-label">Total Processed</p>
          </div>
        </div>

        <div className="stat-card stat-success">
          <div className="stat-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
              <polyline points="22 4 12 14.01 9 11.01" />
            </svg>
          </div>
          <div className="stat-content">
            <p className="stat-value">{totalImported}</p>
            <p className="stat-label">Imported</p>
          </div>
        </div>

        <div className="stat-card stat-skipped">
          <div className="stat-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <line x1="4.93" y1="4.93" x2="19.07" y2="19.07" />
            </svg>
          </div>
          <div className="stat-content">
            <p className="stat-value">{totalSkipped}</p>
            <p className="stat-label">Skipped</p>
          </div>
        </div>

        <div className="stat-card stat-rate">
          <div className="stat-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="20" x2="18" y2="10" />
              <line x1="12" y1="20" x2="12" y2="4" />
              <line x1="6" y1="20" x2="6" y2="14" />
            </svg>
          </div>
          <div className="stat-content">
            <p className="stat-value">{successRate}%</p>
            <p className="stat-label">Success Rate</p>
          </div>
        </div>
      </div>

      {skippedReasons.length > 0 && (
        <div className="skipped-reasons">
          <h4 className="skipped-title">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            Skipped Records
          </h4>
          <ul className="skipped-list">
            {skippedReasons.map((reason, i) => (
              <li key={i}>{reason}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
