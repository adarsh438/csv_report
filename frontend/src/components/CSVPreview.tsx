'use client';

import React, { useCallback, useRef, useEffect, useState } from 'react';
import { RawRecord } from '@/types';

interface CSVPreviewProps {
  headers: string[];
  records: RawRecord[];
  fileName: string;
  fileSize: number;
}

export default function CSVPreview({
  headers,
  records,
  fileName,
  fileSize,
}: CSVPreviewProps) {
  const tableContainerRef = useRef<HTMLDivElement>(null);
  const tbodyRef = useRef<HTMLTableSectionElement>(null);
  const spacerRef = useRef<HTMLTableRowElement>(null);
  const [visibleRange, setVisibleRange] = useState({ start: 0, end: 50 });
  const ROW_HEIGHT = 44;
  const BUFFER_ROWS = 10;

  // Virtualization: only render visible rows for large CSVs
  const handleScroll = useCallback(() => {
    const container = tableContainerRef.current;
    if (!container) return;

    const scrollTop = container.scrollTop;
    const containerHeight = container.clientHeight;
    const headerHeight = 48;

    const startRow = Math.max(0, Math.floor((scrollTop - headerHeight) / ROW_HEIGHT) - BUFFER_ROWS);
    const endRow = Math.min(
      records.length,
      Math.ceil((scrollTop - headerHeight + containerHeight) / ROW_HEIGHT) + BUFFER_ROWS
    );

    setVisibleRange({ start: startRow, end: endRow });
  }, [records.length]);

  useEffect(() => {
    const container = tableContainerRef.current;
    if (!container) return;

    container.addEventListener('scroll', handleScroll);
    handleScroll();

    return () => container.removeEventListener('scroll', handleScroll);
  }, [handleScroll]);

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const totalHeight = records.length * ROW_HEIGHT;
  const topPadding = visibleRange.start * ROW_HEIGHT;
  const visibleRecords = records.slice(visibleRange.start, visibleRange.end);

  useEffect(() => {
    if (tbodyRef.current) {
      tbodyRef.current.style.setProperty('--total-height', `${totalHeight}px`);
    }
    if (spacerRef.current) {
      spacerRef.current.style.setProperty('--top-padding', `${topPadding}px`);
    }
  }, [totalHeight, topPadding]);

  return (
    <div className="csv-preview">
      <div className="preview-header">
        <div className="preview-file-info">
          <div className="preview-file-icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
            </svg>
            <span className="file-badge-sm">CSV</span>
          </div>
          <div>
            <p className="preview-filename">{fileName}</p>
            <p className="preview-meta">{formatSize(fileSize)} · {records.length} rows · {headers.length} columns</p>
          </div>
        </div>
      </div>

      <div className="table-container" ref={tableContainerRef}>
        <table className="data-table">
          <thead>
            <tr>
              <th className="row-number-header">#</th>
              {headers.map((header, i) => (
                <th key={i}>{header}</th>
              ))}
            </tr>
          </thead>
          <tbody className="virtualized-tbody" ref={tbodyRef}>
            {/* Spacer for virtualization */}
            {topPadding > 0 && (
              <tr className="spacer-row" ref={spacerRef}>
                <td colSpan={headers.length + 1} className="spacer-cell" />
              </tr>
            )}
            {visibleRecords.map((record, i) => {
              const actualIndex = visibleRange.start + i;
              return (
                <tr key={actualIndex}>
                  <td className="row-number">{actualIndex + 1}</td>
                  {headers.map((header, j) => (
                    <td key={j} title={record[header] || ''}>
                      <span className="cell-content">
                        {record[header] || <span className="empty-cell">—</span>}
                      </span>
                    </td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="preview-footer">
        <span className="preview-footer-text">
          Showing {Math.min(records.length, visibleRange.end - visibleRange.start)} of {records.length} rows
        </span>
      </div>
    </div>
  );
}
