const fs = require('fs');
const path = require('path');

const dir = path.join(__dirname, '..');
console.log("Root directory:", dir);

const files = fs.readdirSync(dir);
console.log("Root files:", files);

const csvFile = files.find(f => f.toLowerCase().endsWith('.csv'));
if (csvFile) {
  console.log("Found CSV file:", csvFile);
  const content = fs.readFileSync(path.join(dir, csvFile), 'utf8');
  console.log("Content:\n", content);
} else {
  console.log("No CSV file found.");
}
