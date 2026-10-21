/**
 * Xuất SRS AI Agent E-form v1.0.1 — ảnh đã đánh số + bảng STT khớp.
 * node update-srs-ai-eform.mjs
 */
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const docxPkg = path.resolve(__dirname, '../../RD10/_docx-export/node_modules/docx/package.json');
const require = createRequire(docxPkg);
const {
  Document, Packer, Paragraph, TextRun, HeadingLevel, ImageRun,
  Table, TableRow, TableCell, WidthType, BorderStyle, AlignmentType,
  Header, Footer, PageNumber,
} = require('docx');

const imgDir = 'D:/ql-nvkhcn/tmp-srs-ai-extract/img-numbered';
const plainPath = 'D:/ql-nvkhcn/tmp-srs-ai-extract/plain.txt';
const outDownloads = 'C:/Users/trangdt75/Downloads/SRS_BM04_Tich_hop_AI_Agent_Eform_VHT_v1.0.0.docx';
const outDocs = path.resolve(__dirname, '../SRS_BM04_Tich_hop_AI_Agent_Eform_VHT_v1.0.1.docx');

const FONT = 'Times New Roman';
const thin = { style: BorderStyle.SINGLE, size: 4, color: '999999' };
const borders = { top: thin, bottom: thin, left: thin, right: thin };

const t = (text, opts = {}) => new TextRun({ text, font: FONT, size: opts.size || 20, bold: !!opts.bold, italics: !!opts.italics });
const p = (text, opts = {}) => new Paragraph({
  spacing: { after: opts.after ?? 100, before: opts.before ?? 0 },
  alignment: opts.align,
  children: [t(text ?? '', opts)],
});
const h = (level, text) => new Paragraph({
  heading: { 1: HeadingLevel.HEADING_1, 2: HeadingLevel.HEADING_2, 3: HeadingLevel.HEADING_3, 4: HeadingLevel.HEADING_4 }[level],
  spacing: { before: 240, after: 100 },
  children: [t(text, { bold: true, size: level === 1 ? 28 : level === 2 ? 24 : 22 })],
});
const cell = (text, opts = {}) => new TableCell({
  borders,
  width: { size: opts.width || 2000, type: WidthType.DXA },
  children: [new Paragraph({ children: [t(String(text ?? ''), { bold: !!opts.header, size: 17 })] })],
});
const table = (rows, widths) => new Table({
  width: { size: 9000, type: WidthType.DXA },
  rows: rows.map((r, i) => new TableRow({
    children: r.map((c, j) => cell(c, { header: i === 0, width: widths[j] })),
  })),
});

function figure(file, caption) {
  const buf = fs.readFileSync(path.join(imgDir, file));
  return [
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 120, after: 60 },
      children: [new ImageRun({
        type: 'png', data: buf,
        transformation: { width: 520, height: 445 },
        altText: { title: caption, description: caption, name: file },
      })],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 160 },
      children: [t(caption, { italics: true, size: 17 })],
    }),
  ];
}

function syncUi(s) {
  return s
    .replace(/AI nhập thay/g, 'AI soạn thay')
    .replace(/AI đang nhập/g, 'AI đang soạn')
    .replace(/đã nhập dữ liệu xong/g, 'đã soạn nội dung xong')
    .replace(/nhập dữ liệu cho E-form/g, 'soạn nội dung E-form')
    .replace(/AI đã hoàn thành nhập dữ liệu E-form/g, 'AI đã hoàn thành soạn nội dung E-form')
    .replace(/đã hoàn thành nhập dữ liệu/g, 'đã hoàn thành soạn nội dung');
}

const lines = fs.readFileSync(plainPath, 'utf8').split(/\r?\n/);
const i322 = lines.findIndex((l) => l.trim() === '3.2.2 Màn hình và các thành phần');
const i323 = lines.findIndex((l) => l.trim() === '3.2.3 Luồng nghiệp vụ chính');
if (i322 < 0 || i323 < 0) throw new Error('section markers missing');

const before = lines.slice(0, i322).map(syncUi);
const after = lines.slice(i323).map(syncUi);
const children = [];

function emitPlain(block) {
  let skipCover = true;
  for (const line of block) {
    if (skipCover) {
      if (/^1 Giới thiệu$/.test(line.trim())) skipCover = false;
      else continue;
    }
    if (!line.trim()) continue;
    if (/^\d+(\.\d+){0,3}\s+\S/.test(line) && line.length < 140) {
      const depth = (line.match(/^(\d+(?:\.\d+)*)/) || ['', '1'])[1].split('.').length;
      children.push(h(Math.min(depth, 4), line.trim()));
      continue;
    }
    if (/^SRS FR \d+/.test(line)) {
      children.push(p(line, { bold: true }));
      continue;
    }
    children.push(p(line));
  }
}

// Cover
children.push(p('TẬP ĐOÀN CÔNG NGHIỆP VIỄN THÔNG QUÂN ĐỘI VIETTEL', { bold: true, align: AlignmentType.CENTER, size: 22 }));
children.push(p('DỰ ÁN CHUYỂN ĐỔI SỐ VHT KHOA HỌC CÔNG NGHỆ', { align: AlignmentType.CENTER }));
children.push(p(''));
children.push(p('TÀI LIỆU ĐẶC TẢ YÊU CẦU VÀ THIẾT KẾ CHI TIẾT', { bold: true, align: AlignmentType.CENTER, size: 26 }));
children.push(p('Tích hợp AI Agent soạn nội dung E-form', { bold: true, align: AlignmentType.CENTER, size: 24 }));
children.push(p(''));
children.push(table([
  ['Thông tin', 'Giá trị'],
  ['Biểu mẫu', 'BM.04 Thiết kế chi tiết'],
  ['Mã tài liệu', 'CDSVHT.KHCN.SRS.AI.EFORM'],
  ['Phiên bản', '1.0.1'],
  ['Ngày', '15/10/2026 (cập nhật ảnh đánh số 16/10/2026)'],
  ['Trạng thái', 'Dự thảo — rà soát'],
  ['Cập nhật v1.0.1', 'Chèn HÌNH 2–5 đã đánh số STT; đồng bộ nhãn UI «AI soạn thay» / «Trợ lý A»'],
], [2600, 6400]));
children.push(p(''));
children.push(table([
  ['Phiên bản', 'Ngày', 'Loại', 'Nội dung'],
  ['1.0.0', '15/10/2026', 'A', 'Tạo mới đặc tả tích hợp AI Agent E-form'],
  ['1.0.1', '16/10/2026', 'M', 'Ảnh UI có đánh số + bảng mô tả thành phần theo STT trên ảnh'],
], [1200, 1600, 800, 5400]));

emitPlain(before);

// === 3.2.2 with numbered figures ===
children.push(h(3, '3.2.2 Màn hình và các thành phần'));
children.push(p('Các ảnh dưới đây đã đánh số đỏ (STT) trùng với cột STT trong bảng mô tả ngay sau mỗi hình. Thuật ngữ UI chuẩn: «AI soạn thay» (biến thể panel «Trợ lý A» / nút «Gọi trợ lý AI»).'));

children.push(h(4, 'HÌNH 2 — Nhập E-form kèm Trợ lý AI (sẵn sàng)'));
children.push(...figure('HINH-002-nhap-eform-Tro-ly-A-so.png', 'Hình 2. Màn nhập E-form — panel Trợ lý A / Gọi trợ lý AI (đã đánh số).'));
children.push(table([
  ['STT', 'Tên thành phần', 'Kiểu', 'I/O', 'Mô tả'],
  ['1', 'Khối trường thông tin công văn', 'Form', 'I/O', 'Số CV*, Ngày CV*, Tên NV/đề tài*, Trích yếu*, Kính gửi*, CQ đề xuất*, Người ký*'],
  ['2', 'Nội dung đề nghị', 'Textarea', 'I/O', 'Vùng soạn nội dung; placeholder «Nhập nội dung đề nghị»'],
  ['3', 'Panel Trợ lý A', 'Panel', 'Output', 'Mô tả hỗ trợ soạn theo dữ liệu hồ sơ hiện có'],
  ['4', 'Nút Gọi trợ lý AI', 'Button', 'Input', 'Mở bước xác nhận AI soạn thay (chỉ khi task AI + form + quyền sửa)'],
  ['5', 'Thời gian dự kiến', 'Text', 'Output', '«khoảng 15–20 phút» — ước tính, không countdown'],
  ['6', 'Disclaimer kiểm soát nội dung', 'Info', 'Output', 'AI chỉ tạo bản nháp; chưa gửi/ký/ban hành đến khi xác nhận'],
  ['7', 'Footer Hủy / Lưu nháp / Xác nhận', 'Button', 'Input', 'Thao tác E-form chuẩn; ghi chú trường * bắt buộc'],
], [700, 2600, 1000, 700, 4000]));

children.push(h(4, 'HÌNH 3 — Xác nhận «Bắt đầu AI soạn thay?»'));
children.push(...figure('HINH-003-xac-nhan-AI-soan-thay-so.png', 'Hình 3. Modal xác nhận trước khi tạo request AI (đã đánh số).'));
children.push(table([
  ['STT', 'Tên thành phần', 'Kiểu', 'I/O', 'Mô tả'],
  ['1', 'Nút / panel AI soạn thay (nền)', 'Button', 'Input', 'Điểm kích hoạt trên E-form trước khi mở modal'],
  ['2', 'Tiêu đề modal', 'Label', 'Output', '«Bắt đầu AI soạn thay?» + nút đóng'],
  ['3', 'Nội dung cảnh báo thời gian', 'Info', 'Output', 'Ước lượng 15–20 phút; tự lưu nháp khi xong; chưa gửi/ký/ban hành'],
  ['4', 'Nút Hủy', 'Button', 'Input', 'Đóng modal, không tạo request AI'],
  ['5', 'Nút Bắt đầu soạn', 'Button', 'Input', 'Lưu nháp đang nhập (nếu có) → tạo request nền → sang màn đang xử lý'],
], [700, 2800, 1000, 700, 3800]));

children.push(h(4, 'HÌNH 4 — Đang tải dữ liệu và soạn nội dung'));
children.push(...figure('HINH-004-dang-tai-du-lieu-soan-thao-so.png', 'Hình 4. Trạng thái Đang xử lý / soạn thảo AI (đã đánh số).'));
children.push(table([
  ['STT', 'Tên thành phần', 'Kiểu', 'I/O', 'Mô tả'],
  ['1', 'Badge Đang xử lý', 'Badge', 'Output', 'Hiển thị khi request AI chưa kết thúc'],
  ['2', 'Tiêu đề + mô tả trạng thái', 'Text', 'Output', '«Đang tải dữ liệu và soạn nội dung»; AI đang xử lý hồ sơ'],
  ['3', 'Ô Thời gian dự kiến', 'Info', 'Output', '15–20 phút (ước tính)'],
  ['4', 'Cảnh báo vàng', 'Alert', 'Output', 'Không phải đếm ngược; thời gian thực tế có thể thay đổi'],
  ['5', 'Info tự lưu nháp', 'Info', 'Output', 'Tự lưu khi hoàn tất; chưa gửi/ký/ban hành'],
  ['6', 'Sidebar Công văn đang soạn', 'Panel', 'Output', 'Mã BM + đơn vị; nhắc giữ màn hình, tránh tạo thêm yêu cầu'],
  ['7', 'Footer Hủy / Lưu nháp / Xác nhận', 'Button', '—', 'Disabled trên UI mẫu trong lúc chờ (xem ghi chú O03 nếu FR007 khác UI)'],
], [700, 2800, 1000, 700, 3800]));

children.push(h(4, 'HÌNH 5 — Kết quả AI đã tự động lưu nháp'));
children.push(...figure('HINH-005-ket-qua-AI-luu-nhap-so.png', 'Hình 5. Kết quả soạn AI — bản nháp cần rà soát (đã đánh số).'));
children.push(table([
  ['STT', 'Tên thành phần', 'Kiểu', 'I/O', 'Mô tả'],
  ['1', 'Banner cần rà soát', 'Alert', 'Output', '«Nội dung mẫu do AI soạn – cần rà soát»'],
  ['2', 'Trường đã điền mẫu / còn trống', 'Form', 'I/O', 'Có [Mẫu] ở một số trường; Số CV, Ngày, Kính gửi, CQ, Người ký còn trống'],
  ['3', 'Nội dung đề nghị mẫu', 'Textarea', 'I/O', 'Khối [NỘI DUNG MẪU CẦN RÀ SOÁT] — user chỉnh trước xác nhận'],
  ['4', 'Panel Đã tự động lưu nháp', 'Status', 'Output', 'Xác nhận draft đã lưu; chưa xác nhận/ban hành'],
  ['5', 'AI soạn thay + Rà soát & chỉnh sửa', 'Panel/Button', 'Input', 'Đưa focus về form để chỉnh nội dung mẫu'],
  ['6', 'Checklist trước khi xác nhận', 'List', 'Output', 'Kiểm tra mẫu AI; bổ sung trống; Lưu sau chỉnh'],
  ['7', 'Footer status + Hủy / Lưu nháp / Xác nhận', 'Button', 'Input', 'Status: bản nháp chưa xác nhận/ban hành; Xác nhận do user'],
], [700, 3000, 1200, 700, 3400]));

children.push(p('Hình 1 (Extension properties Name=AI) giữ từ SRC06 / v1.0.0 — không thay trong đợt cập nhật ảnh UI này.', { italics: true, size: 17 }));

emitPlain(after);

const doc = new Document({
  sections: [{
    properties: { page: { margin: { top: 720, right: 720, bottom: 720, left: 864 } } },
    headers: { default: new Header({ children: [p('CDSVHT.KHCN.SRS.AI.EFORM — v1.0.1 — ảnh đánh số', { size: 15, italics: true })] }) },
    footers: {
      default: new Footer({
        children: [new Paragraph({
          alignment: AlignmentType.CENTER,
          children: [
            t('Trang ', { size: 15 }),
            new TextRun({ children: [PageNumber.CURRENT], font: FONT, size: 15 }),
            t(' / ', { size: 15 }),
            new TextRun({ children: [PageNumber.TOTAL_PAGES], font: FONT, size: 15 }),
          ],
        })],
      }),
    },
    children,
  }],
});

const buf = await Packer.toBuffer(doc);
fs.writeFileSync(outDocs, buf);
fs.writeFileSync(outDownloads, buf);
console.log('OK', outDocs);
console.log('OK', outDownloads, buf.length);
