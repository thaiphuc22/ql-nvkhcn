import fs from 'node:fs';

const xml = fs.readFileSync('D:/ql-nvkhcn/tmp-srs-ai-extract/unzip/word/document.xml', 'utf8');
const text = xml
  .replace(/<w:tab\/>/g, '\t')
  .replace(/<w:br\/>/g, '\n')
  .replace(/<\/w:p>/g, '\n')
  .replace(/<[^>]+>/g, '')
  .replace(/&amp;/g, '&')
  .replace(/&lt;/g, '<')
  .replace(/&gt;/g, '>')
  .replace(/&quot;/g, '"')
  .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(+n));
fs.writeFileSync('D:/ql-nvkhcn/tmp-srs-ai-extract/plain.txt', text, 'utf8');
console.log(text);
