const xlsx = require('xlsx');
const path = require('path');

const files = [
  '..\\danhgia_nlpc_data_3_1_CK2.xlsx',
  '..\\filemau_danhgia_dinhkyc1_tt27_2020_3_1_CK2 (1).xlsx',
  '..\\nhan_xet_GVCN_lop_3_1.xlsx'
];

files.forEach(file => {
  console.log(`\n--- Reading ${path.basename(file)} ---`);
  try {
    const filePath = path.join(__dirname, file);
    const workbook = xlsx.readFile(filePath);
    console.log(`Sheet Names: ${workbook.SheetNames.join(', ')}`);
    
    // Read the first sheet
    const firstSheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[firstSheetName];
    
    // Convert to JSON
    // header: 1 means array of arrays, which is good to see the exact structure including headers spanning multiple rows
    const data = xlsx.utils.sheet_to_json(worksheet, { header: 1 });
    
    // Print first 10 rows
    console.log(`First 10 rows of sheet '${firstSheetName}':`);
    for (let i = 0; i < Math.min(10, data.length); i++) {
      console.log(`Row ${i + 1}:`, data[i]);
    }
  } catch (error) {
    console.error(`Error reading ${file}:`, error.message);
  }
});
