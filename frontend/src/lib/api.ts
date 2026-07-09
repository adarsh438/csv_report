const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

/**
 * Upload and parse a CSV file for preview (no AI processing).
 */
export async function parseCSV(file: File) {
  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch(`${API_BASE}/api/import/parse`, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    const data = await response.json().catch(() => ({ error: 'Network error' }));
    throw new Error(data.error || `Server error: ${response.status}`);
  }

  return response.json();
}

/**
 * Upload CSV and run AI extraction to get CRM records.
 */
export async function importCSV(file: File) {
  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch(`${API_BASE}/api/import`, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    const data = await response.json().catch(() => ({ error: 'Network error' }));
    throw new Error(data.error || `Server error: ${response.status}`);
  }

  return response.json();
}

/**
 * Check backend health.
 */
export async function checkHealth() {
  const response = await fetch(`${API_BASE}/api/health`);
  return response.json();
}
