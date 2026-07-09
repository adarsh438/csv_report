import { parseCSVClient } from './csvParser';

describe('CSV Parser (Client)', () => {
  it('should parse simple CSV data correctly', () => {
    const csvData = 'name,email,age\nJohn,john@example.com,30\nJane,jane@example.com,25';
    const result = parseCSVClient(csvData);

    expect(result.headers).toEqual(['name', 'email', 'age']);
    expect(result.records).toHaveLength(2);
    expect(result.records[0]).toEqual({ name: 'John', email: 'john@example.com', age: '30' });
    expect(result.records[1]).toEqual({ name: 'Jane', email: 'jane@example.com', age: '25' });
  });

  it('should handle quoted fields correctly', () => {
    const csvData = 'name,desc\nJohn,"Developer, Senior"\nJane,"Manager, HR"';
    const result = parseCSVClient(csvData);

    expect(result.headers).toEqual(['name', 'desc']);
    expect(result.records[0].desc).toBe('Developer, Senior');
    expect(result.records[1].desc).toBe('Manager, HR');
  });

  it('should handle empty lines and ignore them', () => {
    const csvData = 'name,age\nJohn,30\n\nJane,25\n\n';
    const result = parseCSVClient(csvData);

    expect(result.records).toHaveLength(2);
  });

  it('should throw an error for empty data', () => {
    expect(() => parseCSVClient('')).toThrow(/empty/);
  });
});
