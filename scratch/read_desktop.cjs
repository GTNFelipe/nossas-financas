const fs = require('fs');
const path = require('path');

const dir = path.join(__dirname, '..', '..');
console.log("Desktop directory:", dir);

const files = fs.readdirSync(dir);
const csvFiles = files.filter(f => f.toLowerCase().endsWith('.csv'));
console.log("Found CSV files on Desktop:", csvFiles);

csvFiles.forEach(f => {
  console.log(`=== Content of ${f} ===`);
  try {
    const content = fs.readFileSync(path.join(dir, f), 'utf8');
    console.log(content.slice(0, 1000));
  } catch(e) {
    console.error(e);
  }
});
