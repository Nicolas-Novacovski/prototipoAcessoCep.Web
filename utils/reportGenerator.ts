import * as XLSX from 'xlsx';

export const downloadXLSX = (data: any[], filename: string = 'relatorio.xlsx') => {
  if (data.length === 0) {
    return;
  }

  // Create a new workbook
  const workbook = XLSX.utils.book_new();

  // Convert the array of objects to a worksheet
  const worksheet = XLSX.utils.json_to_sheet(data);
  
  // Set column widths
    const colWidths = Object.keys(data[0]).map(key => {
        const maxLength = Math.max(
            key.length,
            ...data.map(row => String(row[key] ?? '').length)
        );
        return { wch: maxLength + 2 }; // +2 for padding
    });
    worksheet['!cols'] = colWidths;

  // Append the worksheet to the workbook with a sheet name
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Relatório');

  // Generate and trigger download
  XLSX.writeFile(workbook, filename);
};
