import type { OfficialDoc, DocSection } from '../data/docTemplates'

/**
 * Render VĂN BẢN HÀNH CHÍNH chuẩn VN (Quốc hiệu – tiêu ngữ, cơ quan ban hành,
 * số hiệu, căn cứ, nội dung, nơi nhận, chức danh ký) theo dạng A4 để xem trước
 * và IN / xuất PDF bằng trình duyệt (`window.print` trên cửa sổ riêng).
 *
 * Cùng một nguồn dữ liệu `OfficialDoc` cấp cho cả bản xem trước (React) lẫn bản
 * in (HTML string) — đảm bảo khớp tuyệt đối.
 */

// CSS dùng chung cho cả preview lẫn cửa sổ in.
export const DOC_CSS = `
.vb { font-family: 'Times New Roman', Times, serif; color:#000; background:#fff;
  width:210mm; min-height:297mm; box-sizing:border-box; padding:20mm 22mm;
  margin:0 auto; font-size:13.5pt; line-height:1.5; }
.vb .row { display:flex; justify-content:space-between; align-items:flex-start; gap:16px; }
.vb .cell { width:48%; text-align:center; }
.vb .b { font-weight:bold; }
.vb .u { text-decoration:underline; }
.vb .center { text-align:center; }
.vb .small { font-size:12pt; }
.vb .line { border-bottom:1px solid #000; width:120px; margin:2px auto 0; }
.vb hr.sep { border:none; border-top:1px solid #000; width:60px; margin:3px auto 10px; }
.vb .title { text-align:center; margin:18px 0 4px; }
.vb .title .loai { font-weight:bold; font-size:15pt; letter-spacing:0.5px; }
.vb .trichyeu { text-align:center; font-style:italic; margin:2px 0 14px; }
.vb .cancu p { text-align:justify; font-style:italic; margin:2px 0; }
.vb .sec { margin:10px 0; text-align:justify; }
.vb .sec .h { font-weight:bold; }
.vb .sec ul, .vb .sec ol { margin:4px 0 4px 22px; padding:0; }
.vb .sec li { margin:2px 0; text-align:justify; }
.vb .sign { display:flex; justify-content:space-between; margin-top:26px; }
.vb .sign .recv { width:52%; font-size:11.5pt; }
.vb .sign .recv .h { font-style:italic; }
.vb .sign .signer { width:44%; text-align:center; }
.vb .sign .signer .role { font-weight:bold; }
.vb .sign .signer .name { font-weight:bold; margin-top:52px; }
@media print { body { margin:0; } .vb { width:auto; min-height:auto; padding:16mm 20mm; box-shadow:none; margin:0; } }
`

function sectionsHTML(sections: DocSection[]): string {
  return sections
    .map((s) => {
      const head = s.heading ? `<div class="h">${s.heading}</div>` : ''
      const paras = (s.paragraphs ?? []).map((p) => `<p style="margin:4px 0">${p}</p>`).join('')
      const items = (s.list ?? []).map((li) => `<li>${li}</li>`).join('')
      const list = items ? (s.ordered ? `<ol>${items}</ol>` : `<ul>${items}</ul>`) : ''
      return `<div class="sec">${head}${paras}${list}</div>`
    })
    .join('')
}

/** Sinh HTML đầy đủ của văn bản (dùng cho cửa sổ in). */
export function docInnerHTML(doc: OfficialDoc): string {
  const canCu = doc.canCu?.length
    ? `<div class="cancu">${doc.canCu.map((c) => `<p>${c}</p>`).join('')}</div>`
    : ''
  const noiNhan = doc.noiNhan?.length
    ? `<div class="recv"><div class="h">Nơi nhận:</div>${doc.noiNhan.map((n) => `<div>- ${n}</div>`).join('')}</div>`
    : '<div class="recv"></div>'
  return `
  <div class="vb">
    <div class="row">
      <div class="cell">
        <div class="small">${doc.coQuanChuQuan}</div>
        <div class="b small">${doc.coQuan}</div>
        <div class="line"></div>
        <div class="b small" style="margin-top:8px">${doc.soHieu}</div>
      </div>
      <div class="cell">
        <div class="b">CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM</div>
        <div class="b">Độc lập - Tự do - Hạnh phúc</div>
        <hr class="sep" />
        <div style="font-style:italic;margin-top:8px">${doc.diaDanhNgay}</div>
      </div>
    </div>

    <div class="title">
      <div class="loai">${doc.loai}</div>
      <div class="trichyeu">${doc.trichYeu}</div>
    </div>

    ${canCu}
    ${sectionsHTML(doc.sections)}

    <div class="sign">
      ${noiNhan}
      <div class="signer">
        <div class="role">${doc.chucDanhKy}</div>
        <div style="font-style:italic">(Ký, ghi rõ họ tên, đóng dấu)</div>
        <div class="name">${doc.nguoiKy}</div>
      </div>
    </div>
  </div>`
}

/** Mở cửa sổ in với đúng văn bản + CSS, gọi print → người dùng chọn "Lưu PDF". */
export function printOfficialDoc(doc: OfficialDoc): boolean {
  const w = window.open('', '_blank', 'width=900,height=1000')
  if (!w) return false
  w.document.write(
    `<!doctype html><html lang="vi"><head><meta charset="utf-8" />` +
      `<title>${doc.loai} — ${doc.soHieu}</title><style>${DOC_CSS}</style></head>` +
      `<body>${docInnerHTML(doc)}</body></html>`,
  )
  w.document.close()
  w.focus()
  // Cho trình duyệt render xong rồi mới in. Có 2 nguồn kích hoạt (onload + fallback
  // setTimeout cho trường hợp onload không fire với document.write) nhưng chốt cờ
  // `printed` để CHỈ gọi print() đúng 1 lần, tránh mở hộp thoại in 2 lần.
  let printed = false
  const doPrint = () => {
    if (printed) return
    printed = true
    try { w.print() } catch { /* cửa sổ đã đóng */ }
  }
  w.onload = doPrint
  setTimeout(doPrint, 400)
  return true
}

/** Bản xem trước trên màn hình — dùng chung DOC_CSS + docInnerHTML. */
export default function OfficialDocument({ doc }: { doc: OfficialDoc }) {
  return (
    <div style={{ background: '#e9edf2', padding: 16, overflow: 'auto', maxHeight: '68vh' }}>
      <style>{DOC_CSS}</style>
      <div
        style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.18)' }}
        dangerouslySetInnerHTML={{ __html: docInnerHTML(doc) }}
      />
    </div>
  )
}
