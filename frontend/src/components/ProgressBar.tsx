'use client';

import React from 'react';

interface ProgressBarProps {
  message?: string;
}

export default function ProgressBar({ message }: ProgressBarProps) {
  return (
    <div className="processing-container">
      <div className="processing-animation">
        <div className="processing-ring">
          <div className="spinner" />
        </div>
        <div className="processing-icon">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M12 2a4 4 0 0 0-4 4c0 2.5 2 4 4 6 2-2 4-3.5 4-6a4 4 0 0 0-4-4z" />
            <path d="M12 16v6" />
            <path d="M8 22h8" />
            <circle cx="12" cy="6" r="1" fill="currentColor" />
          </svg>
        </div>
      </div>

      <h3 className="processing-title">AI is extracting CRM records...</h3>
      <p className="processing-subtitle">
        {message || 'Analyzing columns, mapping fields, and extracting structured data'}
      </p>

      <div className="progress-bar-track">
        <div className="progress-bar-fill progress-bar-indeterminate" />
      </div>

      <div className="processing-steps">
        <div className="processing-step step-active">
          <div className="step-dot" />
          <span>Parsing CSV</span>
        </div>
        <div className="processing-step step-active">
          <div className="step-dot" />
          <span>Mapping Fields</span>
        </div>
        <div className="processing-step step-pulse">
          <div className="step-dot" />
          <span>AI Extraction</span>
        </div>
        <div className="processing-step">
          <div className="step-dot" />
          <span>Formatting Output</span>
        </div>
      </div>
    </div>
  );
}
