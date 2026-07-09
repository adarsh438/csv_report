'use client';

import React from 'react';
import { CRMRecord } from '@/types';

interface ResultsTableProps {
  records: CRMRecord[];
}

const STATUS_LABELS: Record<string, { label: string; className: string }> = {
  GOOD_LEAD_FOLLOW_UP: { label: 'Good Lead', className: 'status-good' },
  DID_NOT_CONNECT: { label: 'Not Connected', className: 'status-not-connected' },
  BAD_LEAD: { label: 'Bad Lead', className: 'status-bad' },
  SALE_DONE: { label: 'Sale Done', className: 'status-done' },
};

const CRM_COLUMNS: { key: keyof CRMRecord; label: string; width?: string }[] = [
  { key: 'name', label: 'Name', width: '150px' },
  { key: 'email', label: 'Email', width: '200px' },
  { key: 'mobile_without_country_code', label: 'Mobile', width: '130px' },
  { key: 'country_code', label: 'Code', width: '60px' },
  { key: 'company', label: 'Company', width: '140px' },
  { key: 'city', label: 'City', width: '110px' },
  { key: 'state', label: 'State', width: '110px' },
  { key: 'country', label: 'Country', width: '100px' },
  { key: 'crm_status', label: 'Status', width: '130px' },
  { key: 'lead_owner', label: 'Lead Owner', width: '160px' },
  { key: 'crm_note', label: 'Notes', width: '200px' },
  { key: 'data_source', label: 'Source', width: '130px' },
  { key: 'created_at', label: 'Created At', width: '160px' },
  { key: 'possession_time', label: 'Possession', width: '120px' },
  { key: 'description', label: 'Description', width: '180px' },
];

export default function ResultsTable({ records }: ResultsTableProps) {
  const formatDate = (dateStr: string): string => {
    if (!dateStr) return '—';
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return dateStr;
      return d.toLocaleString('en-IN', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return dateStr;
    }
  };

  const renderCell = (record: CRMRecord, key: keyof CRMRecord) => {
    const value = record[key];

    if (key === 'crm_status' && value) {
      const statusInfo = STATUS_LABELS[value] || { label: value, className: 'status-default' };
      return <span className={`status-badge ${statusInfo.className}`}>{statusInfo.label}</span>;
    }

    if (key === 'created_at') {
      return <span className="date-cell">{formatDate(value)}</span>;
    }

    if (key === 'mobile_without_country_code' && value) {
      return (
        <span className="phone-cell">
          {record.country_code ? `${record.country_code} ` : ''}{value}
        </span>
      );
    }

    if (!value) return <span className="empty-cell">—</span>;
    return <span className="cell-content">{value}</span>;
  };

  const exportCSV = () => {
    const csvHeaders = CRM_COLUMNS.map((c) => c.key).join(',');
    const csvRows = records.map((record) =>
      CRM_COLUMNS.map((col) => {
        const val = record[col.key] || '';
        // Escape quotes and wrap in quotes if contains comma/quotes/newlines
        if (val.includes(',') || val.includes('"') || val.includes('\n')) {
          return `"${val.replace(/"/g, '""')}"`;
        }
        return val;
      }).join(',')
    );

    const csvContent = [csvHeaders, ...csvRows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `groweasy_crm_import_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="results-table-wrapper">
      <div className="results-header">
        <h3 className="results-title">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
            <polyline points="22 4 12 14.01 9 11.01" />
          </svg>
          Extracted CRM Records
        </h3>
        <button className="btn-export" onClick={exportCSV}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="7 10 12 15 17 10" />
            <line x1="12" y1="15" x2="12" y2="3" />
          </svg>
          Export CSV
        </button>
      </div>

      <div className="table-container results-table-container">
        <table className="data-table results-table">
          <thead>
            <tr>
              <th className="row-number-header">#</th>
              {CRM_COLUMNS.map((col) => (
                <th key={col.key} style={{ minWidth: col.width }}>
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {records.map((record, i) => (
              <tr key={i}>
                <td className="row-number">{i + 1}</td>
                {CRM_COLUMNS.map((col) => (
                  <td key={col.key}>{renderCell(record, col.key)}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
