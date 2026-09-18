const fs = require('fs');
const babelParser = require('@babel/parser');

const content = fs.readFileSync('src/screens/main/CreateCampaignScreen.jsx', 'utf8');

try {
  babelParser.parse(content, {
    sourceType: 'module',
    plugins: ['jsx']
  });
  console.log('No syntax errors found!');
} catch (e) {
  console.error('Syntax error:', e.message);
  console.error('Line:', e.loc.line, 'Column:', e.loc.column);
}
