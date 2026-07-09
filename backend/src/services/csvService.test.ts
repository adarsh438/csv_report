import { parseCSV, batchRecords } from './csvService';

describe('CSV Service', () => {
  describe('parseCSV', () => {
    it('should correctly parse standard comma-separated CSV', () => {
      const csv = 'name,age\nJohn,30\nJane,25';
      const result = parseCSV(Buffer.from(csv));
      
      expect(result.headers).toEqual(['name', 'age']);
      expect(result.records).toHaveLength(2);
      expect(result.records[0]).toEqual({ name: 'John', age: '30' });
    });

    it('should correctly detect and parse semicolon-separated CSV', () => {
      const csv = 'name;age\nJohn;30\nJane;25';
      const result = parseCSV(Buffer.from(csv));
      
      expect(result.headers).toEqual(['name', 'age']);
      expect(result.records).toHaveLength(2);
    });

    it('should throw an error for empty CSV data', () => {
      const csv = 'name,age\n';
      expect(() => parseCSV(Buffer.from(csv))).toThrow(/no data rows/);
    });
  });

  describe('batchRecords', () => {
    it('should correctly batch records into specified sizes', () => {
      const records = [
        { id: '1' }, { id: '2' }, { id: '3' }, { id: '4' }, { id: '5' }
      ];
      
      const batches = batchRecords(records, 2);
      
      expect(batches).toHaveLength(3);
      expect(batches[0]).toHaveLength(2);
      expect(batches[1]).toHaveLength(2);
      expect(batches[2]).toHaveLength(1);
    });

    it('should return empty array if records is empty', () => {
      const batches = batchRecords([], 10);
      expect(batches).toHaveLength(0);
    });
  });
});
