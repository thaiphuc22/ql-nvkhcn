import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  Document,
  Packer,
  Paragraph,
  TextRun as Text,
  HeadingLevel,
  ImageRun,
  Table,
  TableRow,
  TableCell,
  WidthType,
  BorderStyle,
  AlignmentType,
  PageNumber,
  Header,
  Footer,
} from 'docx';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const mdPath = path.resolve(__dirname, '../SRS-RD10-01-quan-ly-cau-hinh-luu-tru-tai-lieu-du-an-v0.1.md');
const outPath = path.resolve(__dirname, '../SRS-RD10-01-quan-ly-cau-hinh-luu-tru-tai-lieu-du-an-v0.1.docx');
const imgRoot = path.resolve(__dirname, '../img/SRS-RD10-01');

const raw = fs.readFileSync(mdPath, 'utf8');
const body = raw.replace(/^---[\s\S]*?---\s*/, '');

const thin = { style: BorderStyle.SINGLE, size: 4, color: '999999' };
const borders = { top: thin, bottom: thin, left: thin, right: thin };

function textRuns(line, bold = false) {
  const parts = [];
  const re = /(\*\*[^*]+\*\*|`[^`]+`)/g;
  let last = 0;
  let m;
  while ((m = re.exec(line))) {
    if (m.index > last) {
      parts.push(new Text({ text: line.slice(last, m.index), bold, size: 20, font: 'Times New Roman' }));
    }
    const token = m[0];
    if (token.startsWith('**')) {
      parts.push(new Text({ text: token.slice(2, -2), bold: true, size: 20, font: 'Times New Roman' }));
    } else {
      parts.push(new Text({ text: token.slice(1, -1), bold, size: 18, font: 'Consolas' }));
    }
    last = m.index + token.length;
  }
  if (last < line.length) {
    parts.push(new Text({ text: line.slice(last), bold, size: 20, font: 'Times New Roman' }));
  }
  if (!parts.length) parts.push(new Text({ text: line || ' ', size: 20, font: 'Times New Roman' }));
  return parts;
}

function para(line, opts = {}) {
  return new Paragraph({
    spacing: { after: 120 },
    ...opts,
    children: textRuns(line, opts.bold),
  });
}

function heading(level, text) {
  const map = { 1: HeadingLevel.HEADING_1, 2: HeadingLevel.HEADING_2, 3: HeadingLevel.HEADING_3, 4: HeadingLevel.HEADING_4 };
  return new Paragraph({
    heading: map[level] || HeadingLevel.HEADING_4,
    spacing: { before: 240, after: 120 },
    children: [new Text({ text, bold: true, size: level === 1 ? 28 : level === 2 ? 24 : 22, font: 'Times New Roman' })],
  });
}

function cell(text, opts = {}) {
  return new TableCell({
    borders,
    width: { size: opts.width || 1400, type: WidthType.DXA },
    children: [new Paragraph({
      children: textRuns(String(text ?? '').replace(/<br\s*\/?>/gi, ' / '), !!opts.header),
    })],
  });
}

function parseTable(lines) {
  const rows = lines
    .filter((l) => !/^\|?\s*-+/.test(l))
    .map((l) => l.replace(/^\|/, '').replace(/\|$/, '').split('|').map((c) => c.trim()));
  if (!rows.length) return null;
  const colCount = Math.max(...rows.map((r) => r.length));
  const width = Math.floor(9000 / colCount);
  return new Table({
    width: { size: 9000, type: WidthType.DXA },
    rows: rows.map((r, i) => new TableRow({
      children: Array.from({ length: colCount }, (_, j) => cell(r[j] ?? '', { header: i === 0, width })),
    })),
  });
}

function loadImage(rel) {
  const cleaned = rel.replace(/^\.\//, '');
  const abs = path.resolve(path.dirname(mdPath), cleaned);
  if (!fs.existsSync(abs)) {
    const base = path.basename(cleaned);
    const alt = path.join(imgRoot, base);
    if (!fs.existsSync(alt)) return null;
    return fs.readFileSync(alt);
  }
  return fs.readFileSync(abs);
}

const children = [];
const lines = body.split(/\r?\n/);
let i = 0;
while (i < lines.length) {
  const line = lines[i];

  if (!line.trim()) {
    i += 1;
    continue;
  }

  if (line.startsWith('```')) {
    const buf = [];
    i += 1;
    while (i < lines.length && !lines[i].startsWith('```')) {
      buf.push(lines[i]);
      i += 1;
    }
    i += 1;
    children.push(para(buf.join(' | ')));
    continue;
  }

  if (line.trim().startsWith('|')) {
    const buf = [];
    while (i < lines.length && lines[i].trim().startsWith('|')) {
      buf.push(lines[i]);
      i += 1;
    }
    const table = parseTable(buf);
    if (table) children.push(table);
    children.push(new Paragraph({ children: [] }));
    continue;
  }

  const img = line.match(/^!\[([^\]]*)\]\(([^)]+)\)/);
  if (img) {
    const bytes = loadImage(img[2]);
    children.push(para(img[1] ? `HÌNH: ${img[1]}` : 'HÌNH', { bold: true }));
    if (bytes) {
      children.push(new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { after: 200 },
        children: [new ImageRun({ type: 'png', data: bytes, transformation: { width: 520, height: 320 }, altText: { title: img[1], description: img[1], name: img[1] } })],
      }));
    } else {
      children.push(para(`[Không tìm thấy ảnh: ${img[2]}]`));
    }
    i += 1;
    continue;
  }

  const h = line.match(/^(#{1,4})\s+(.*)$/);
  if (h) {
    children.push(heading(h[1].length, h[2].replace(/\*\*/g, '')));
    i += 1;
    continue;
  }

  if (line.startsWith('> ')) {
    children.push(para(line.slice(2)));
    i += 1;
    continue;
  }

  if (/^[-*]\s+/.test(line)) {
    children.push(new Paragraph({
      spacing: { after: 80 },
      indent: { left: 360 },
      children: [new Text({ text: '• ', size: 20, font: 'Times New Roman' }), ...textRuns(line.replace(/^[-*]\s+/, ''))],
    }));
    i += 1;
    continue;
  }

  children.push(para(line));
  i += 1;
}

const doc = new Document({
  styles: {
    default: {
      document: {
        styles: [{ id: 'Normal', run: { font: 'Times New Roman', size: 20 } }],
      },
    },
  },
  sections: [{
    properties: {
      page: {
        margin: { top: 720, bottom: 720, left: 720, right: 720 },
      },
    },
    headers: {
      default: new Header({
        children: [new Paragraph({
          children: [new Text({ text: 'SRS-RD10-01 — Quản lý cấu hình lưu trữ hồ sơ tài liệu dự án', italics: true, size: 16, font: 'Times New Roman', color: '666666' })],
        })],
      }),
    },
    footers: {
      default: new Footer({
        children: [new Paragraph({
          alignment: AlignmentType.CENTER,
          children: [
            new Text({ text: 'Trang ', size: 16, font: 'Times New Roman' }),
            new Text({ children: [PageNumber.CURRENT], size: 16, font: 'Times New Roman' }),
          ],
        })],
      }),
    },
    children,
  }],
});

const buffer = await Packer.toBuffer(doc);
fs.writeFileSync(outPath, buffer);
console.log('Wrote', outPath, `(${buffer.length} bytes)`);
