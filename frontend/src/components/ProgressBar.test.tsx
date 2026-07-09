import React from 'react';
import { render, screen } from '@testing-library/react';
import ProgressBar from './ProgressBar';

describe('ProgressBar Component', () => {
  it('renders the default processing title', () => {
    render(<ProgressBar />);
    expect(screen.getByText('AI is extracting CRM records...')).toBeInTheDocument();
  });

  it('renders the default subtitle when no message is provided', () => {
    render(<ProgressBar />);
    expect(screen.getByText('Analyzing columns, mapping fields, and extracting structured data')).toBeInTheDocument();
  });

  it('renders a custom message when provided', () => {
    const customMessage = 'Processing batch 1 of 10...';
    render(<ProgressBar message={customMessage} />);
    expect(screen.getByText(customMessage)).toBeInTheDocument();
    expect(screen.queryByText('Analyzing columns, mapping fields, and extracting structured data')).not.toBeInTheDocument();
  });

  it('renders all processing steps', () => {
    render(<ProgressBar />);
    expect(screen.getByText('Parsing CSV')).toBeInTheDocument();
    expect(screen.getByText('Mapping Fields')).toBeInTheDocument();
    expect(screen.getByText('AI Extraction')).toBeInTheDocument();
    expect(screen.getByText('Formatting Output')).toBeInTheDocument();
  });
});
