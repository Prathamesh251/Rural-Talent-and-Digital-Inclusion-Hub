const fs = require('fs');
const csv = require('csv-parser');
const xlsx = require('xlsx');

/**
 * Parses uploaded CSV or XLSX file and returns array of object rows
 */
async function parseUploadedFile(filePath, mimeType, originalName) {
  const isExcel = originalName.endsWith('.xlsx') || originalName.endsWith('.xls');
  const isCsv = originalName.endsWith('.csv') || mimeType === 'text/csv';

  if (isExcel) {
    const workbook = xlsx.readFile(filePath);
    const firstSheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[firstSheetName];
    const data = xlsx.utils.sheet_to_json(sheet, { defval: '' });
    return data;
  }

  if (isCsv) {
    return new Promise((resolve, reject) => {
      const results = [];
      fs.createReadStream(filePath)
        .pipe(csv())
        .on('data', (row) => results.push(row))
        .on('end', () => resolve(results))
        .on('error', (err) => reject(err));
    });
  }

  throw new Error('Unsupported file format. Please upload a .csv or .xlsx file.');
}

module.exports = {
  parseUploadedFile,
};
