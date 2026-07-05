// Tầng "văn bản đầu ra" (tier-2 của chiến lược eForm — quyết định F2-D6).
//
// KHÁC với eForm nhập liệu (form-js): đây là VĂN BẢN CHÍNH THỨC (Quyết định,
// Biên bản, Báo cáo, Công văn) sinh từ TEMPLATE + dữ liệu hồ sơ, để in / xuất PDF.
// Trong sản phẩm thật, tầng này render bằng bộ template engine (DOCX/PDF) — ở
// mock ta dựng cấu trúc văn bản hành chính VN chuẩn rồi in bằng trình duyệt.
import type { Dossier } from './dossiers'

export interface DocSection {
  heading?: string
  paragraphs?: string[]
  list?: string[]
  ordered?: boolean
}

export interface OfficialDoc {
  coQuanChuQuan: string
  coQuan: string
  soHieu: string
  diaDanhNgay: string
  /** Loại văn bản in HOA ở tiêu đề: QUYẾT ĐỊNH / BIÊN BẢN / BÁO CÁO / CÔNG VĂN */
  loai: string
  trichYeu: string
  canCu?: string[]
  sections: DocSection[]
  chucDanhKy: string
  nguoiKy: string
  noiNhan?: string[]
}

export interface DocTemplate {
  id: string
  ten: string
  loai: 'Quyết định' | 'Biên bản' | 'Báo cáo' | 'Công văn'
  moTa: string
  applies: (d: Dossier) => boolean
  build: (d: Dossier) => OfficialDoc
}

const NGAY = 'Hà Nội, ngày 03 tháng 7 năm 2026'

function soThuTu(d: Dossier): string {
  const m = d.id.match(/(\d+)\s*$/)
  return m ? m[1] : '000'
}
function soHieu(d: Dossier, ky: string): string {
  return `Số: ${soThuTu(d)}/${ky}`
}
/** Cơ quan ban hành theo cấp xét duyệt. */
function coQuan(d: Dossier): { chuQuan: string; coQuan: string } {
  return d.cap === 'Tập đoàn'
    ? {
        chuQuan: 'TẬP ĐOÀN CN – VT QUÂN ĐỘI',
        coQuan: 'TỔNG CÔNG TY CN CÔNG NGHỆ CAO VIETTEL',
      }
    : {
        chuQuan: 'TCT CN CÔNG NGHỆ CAO VIETTEL',
        coQuan: 'HỘI ĐỒNG KHOA HỌC – CÔNG NGHỆ',
      }
}
function nguoiKyTGD(d: Dossier): { chucDanh: string; nguoi: string } {
  return d.cap === 'Tập đoàn'
    ? { chucDanh: 'TỔNG GIÁM ĐỐC TẬP ĐOÀN', nguoi: '(đã ký)' }
    : { chucDanh: 'TỔNG GIÁM ĐỐC', nguoi: '(đã ký)' }
}
/** Ý kiến thẩm định gần nhất (nếu có) để trích vào văn bản. */
function yKienThamDinh(d: Dossier): string | undefined {
  const s = [...d.steps].reverse().find((x) => x.yKien && /thẩm định|nghiệm thu|xét duyệt|góp ý|ký/i.test(x.ten))
  return s?.yKien
}

export const DOC_TEMPLATES: DocTemplate[] = [
  // ── Báo cáo thẩm định (RD01, RD02) ─────────────────────────────────────────
  {
    id: 'bao-cao-tham-dinh',
    ten: 'Báo cáo thẩm định hồ sơ',
    loai: 'Báo cáo',
    moTa: 'Tổng hợp ý kiến Cơ quan nghiệp vụ trình Hội đồng KHCN.',
    applies: (d) => /^RD0[12]/.test(d.quyTrinh),
    build: (d) => {
      const cq = coQuan(d)
      return {
        coQuanChuQuan: cq.chuQuan,
        coQuan: 'CƠ QUAN QUẢN LÝ KHOA HỌC – CÔNG NGHỆ',
        soHieu: soHieu(d, 'BC-KHCN'),
        diaDanhNgay: NGAY,
        loai: 'BÁO CÁO',
        trichYeu: `Kết quả thẩm định hồ sơ ${d.cap === 'Tập đoàn' ? 'chủ trương/nhiệm vụ cấp Tập đoàn' : 'nhiệm vụ KHCN cấp Cơ sở'}: “${d.tenDeTai}”`,
        sections: [
          {
            heading: 'I. THÔNG TIN HỒ SƠ',
            list: [
              `Mã đề tài: ${d.maDeTai} — Mã hồ sơ: ${d.id}`,
              `Chủ nhiệm: ${d.chuNhiem} — Đơn vị chủ trì: ${d.donVi}`,
              `Tổng dự toán đề xuất: ${d.duToan}`,
              `Quy trình áp dụng: ${d.quyTrinh} — ${d.quyTrinhTen}`,
            ],
          },
          {
            heading: 'II. NỘI DUNG THẨM ĐỊNH',
            paragraphs: [
              'Cơ quan nghiệp vụ đã thẩm định hồ sơ theo các tiêu chí: tính cấp thiết, tính khả thi khoa học – công nghệ, sự hợp lý của dự toán và năng lực nhân sự thực hiện.',
            ],
            list: [
              'Tính cấp thiết: phù hợp định hướng nghiên cứu – phát triển của Tổng công ty.',
              'Tính khả thi KH–CN: mục tiêu, sản phẩm và phương án kỹ thuật rõ ràng.',
              'Dự toán: các phụ lục PL1–PL6 đầy đủ; cơ cấu chi phí hợp lý.',
              'Nhân sự: đủ năng lực và kinh nghiệm triển khai.',
            ],
          },
          {
            heading: 'III. KẾT LUẬN & KIẾN NGHỊ',
            paragraphs: [
              yKienThamDinh(d) ? `Ý kiến thẩm định: ${yKienThamDinh(d)}` : 'Hồ sơ đủ điều kiện trình Hội đồng KHCN xem xét.',
              'Kính trình Hội đồng KHCN / Lãnh đạo xem xét, quyết định.',
            ],
          },
        ],
        chucDanhKy: 'TRƯỞNG CƠ QUAN QLKHCN',
        nguoiKy: '(đã ký)',
        noiNhan: ['Hội đồng KHCN;', 'Lãnh đạo TCT;', 'Lưu: VT, CQ QLKHCN.'],
      }
    },
  },

  // ── Quyết định phê duyệt chủ trương (RD01) ─────────────────────────────────
  {
    id: 'qd-chu-truong',
    ten: 'Quyết định phê duyệt chủ trương',
    loai: 'Quyết định',
    moTa: 'QĐ phê duyệt chủ trương thực hiện nhiệm vụ KHCN.',
    applies: (d) => /^RD01/.test(d.quyTrinh),
    build: (d) => {
      const cq = coQuan(d)
      const ky = nguoiKyTGD(d)
      return {
        coQuanChuQuan: cq.chuQuan,
        coQuan: cq.coQuan,
        soHieu: soHieu(d, 'QĐ-VHT'),
        diaDanhNgay: NGAY,
        loai: 'QUYẾT ĐỊNH',
        trichYeu: `Về việc phê duyệt chủ trương thực hiện nhiệm vụ KHCN “${d.tenDeTai}”`,
        canCu: [
          'Căn cứ Điều lệ tổ chức và hoạt động của Tổng công ty;',
          'Căn cứ Quy chế quản lý hoạt động khoa học – công nghệ;',
          `Căn cứ Báo cáo thẩm định và kết luận của Hội đồng KHCN về hồ sơ ${d.maDeTai};`,
          'Theo đề nghị của Cơ quan quản lý KHCN.',
        ],
        sections: [
          {
            heading: 'Điều 1.',
            paragraphs: [
              `Phê duyệt chủ trương thực hiện nhiệm vụ KHCN “${d.tenDeTai}” (mã ${d.maDeTai}) do ${d.chuNhiem} làm chủ nhiệm, ${d.donVi} chủ trì; tổng dự toán dự kiến ${d.duToan}.`,
            ],
          },
          { heading: 'Điều 2.', paragraphs: ['Giao Cơ quan quản lý KHCN hướng dẫn chủ nhiệm hoàn thiện hồ sơ, tổ chức xét duyệt thuyết minh và dự toán theo quy định.'] },
          { heading: 'Điều 3.', paragraphs: ['Quyết định có hiệu lực kể từ ngày ký. Các đơn vị liên quan chịu trách nhiệm thi hành Quyết định này.'] },
        ],
        chucDanhKy: ky.chucDanh,
        nguoiKy: ky.nguoi,
        noiNhan: ['Như Điều 3;', 'Chủ nhiệm, đơn vị chủ trì;', 'Lưu: VT, CQ QLKHCN.'],
      }
    },
  },

  // ── Quyết định phê duyệt mở mới NV KHCN (RD02) ─────────────────────────────
  {
    id: 'qd-mo-moi',
    ten: 'Quyết định phê duyệt mở mới NV KHCN',
    loai: 'Quyết định',
    moTa: 'QĐ mở mới đề tài/nhiệm vụ sau xét duyệt.',
    applies: (d) => /^RD02/.test(d.quyTrinh),
    build: (d) => {
      const cq = coQuan(d)
      const ky = nguoiKyTGD(d)
      return {
        coQuanChuQuan: cq.chuQuan,
        coQuan: cq.coQuan,
        soHieu: soHieu(d, 'QĐ-VHT'),
        diaDanhNgay: NGAY,
        loai: 'QUYẾT ĐỊNH',
        trichYeu: `Về việc phê duyệt mở mới nhiệm vụ KHCN “${d.tenDeTai}”`,
        canCu: [
          'Căn cứ Quy chế quản lý hoạt động khoa học – công nghệ;',
          `Căn cứ Biên bản họp Hội đồng xét duyệt và kết luận của Hội đồng KHCN về hồ sơ ${d.maDeTai};`,
          'Theo đề nghị của Cơ quan quản lý KHCN.',
        ],
        sections: [
          {
            heading: 'Điều 1.',
            paragraphs: [
              `Phê duyệt mở mới nhiệm vụ KHCN “${d.tenDeTai}” (mã ${d.maDeTai}), chủ nhiệm ${d.chuNhiem}, đơn vị chủ trì ${d.donVi}; tổng dự toán được duyệt ${d.duToan}.`,
            ],
          },
          { heading: 'Điều 2.', paragraphs: ['Chủ nhiệm và đơn vị chủ trì triển khai nhiệm vụ theo thuyết minh và dự toán đã được phê duyệt; định kỳ báo cáo tiến độ.'] },
          { heading: 'Điều 3.', paragraphs: ['Quyết định có hiệu lực kể từ ngày ký.'] },
        ],
        chucDanhKy: ky.chucDanh,
        nguoiKy: ky.nguoi,
        noiNhan: ['Như Điều 3;', 'Chủ nhiệm, đơn vị chủ trì;', 'Lưu: VT, CQ QLKHCN.'],
      }
    },
  },

  // ── Biên bản họp Hội đồng nghiệm thu (RD05) ────────────────────────────────
  {
    id: 'bien-ban-nghiem-thu',
    ten: 'Biên bản họp Hội đồng nghiệm thu',
    loai: 'Biên bản',
    moTa: 'Biên bản đánh giá kết quả nhiệm vụ tại Hội đồng nghiệm thu.',
    applies: (d) => /^RD05/.test(d.quyTrinh),
    build: (d) => {
      const cq = coQuan(d)
      return {
        coQuanChuQuan: cq.chuQuan,
        coQuan: `HỘI ĐỒNG NGHIỆM THU ${d.cap === 'Tập đoàn' ? 'CẤP TẬP ĐOÀN' : 'CẤP CƠ SỞ'}`,
        soHieu: soHieu(d, 'BB-HĐNT'),
        diaDanhNgay: NGAY,
        loai: 'BIÊN BẢN',
        trichYeu: `Họp Hội đồng nghiệm thu nhiệm vụ KHCN “${d.tenDeTai}”`,
        sections: [
          {
            heading: 'I. THỜI GIAN, ĐỊA ĐIỂM & THÀNH PHẦN',
            list: [
              'Thời gian: 03/7/2026. Địa điểm: Trụ sở Tổng công ty.',
              `Hội đồng nghiệm thu ${d.cap === 'Tập đoàn' ? 'cấp Tập đoàn (có Tổ kiểm tra)' : 'cấp Cơ sở'} — đủ số thành viên theo quyết định thành lập.`,
              `Đơn vị chủ trì: ${d.donVi}; Chủ nhiệm: ${d.chuNhiem}.`,
            ],
          },
          {
            heading: 'II. NỘI DUNG',
            paragraphs: [
              `Chủ nhiệm trình bày Báo cáo tổng kết nhiệm vụ “${d.tenDeTai}” (mã ${d.maDeTai}).`,
              'Hội đồng nghe phản biện, trao đổi và đánh giá theo các tiêu chí: mức độ hoàn thành mục tiêu, sản phẩm, chất lượng khoa học và khả năng ứng dụng.',
            ],
          },
          {
            heading: 'III. KẾT LUẬN CỦA HỘI ĐỒNG',
            list: [
              'Khối lượng, sản phẩm: hoàn thành theo thuyết minh được duyệt.',
              'Chất lượng khoa học – công nghệ: đạt yêu cầu.',
              `Kết luận: nhiệm vụ ĐẠT, đề nghị cấp có thẩm quyền công nhận kết quả.${yKienThamDinh(d) ? ' Ghi chú: ' + yKienThamDinh(d) : ''}`,
            ],
          },
        ],
        chucDanhKy: 'CHỦ TỊCH HỘI ĐỒNG',
        nguoiKy: '(đã ký)',
        noiNhan: ['Thư ký Hội đồng (ký);', 'CQ QLKHCN;', 'Lưu: hồ sơ nghiệm thu.'],
      }
    },
  },

  // ── Quyết định công nhận kết quả nghiệm thu (RD05) ─────────────────────────
  {
    id: 'qd-cong-nhan',
    ten: 'Quyết định công nhận kết quả',
    loai: 'Quyết định',
    moTa: 'QĐ công nhận kết quả nghiệm thu nhiệm vụ KHCN.',
    applies: (d) => /^RD05/.test(d.quyTrinh),
    build: (d) => {
      const cq = coQuan(d)
      const ky = nguoiKyTGD(d)
      return {
        coQuanChuQuan: cq.chuQuan,
        coQuan: cq.coQuan,
        soHieu: soHieu(d, 'QĐ-VHT'),
        diaDanhNgay: NGAY,
        loai: 'QUYẾT ĐỊNH',
        trichYeu: `Về việc công nhận kết quả nghiệm thu nhiệm vụ KHCN “${d.tenDeTai}”`,
        canCu: [
          'Căn cứ Quy chế quản lý hoạt động khoa học – công nghệ;',
          `Căn cứ Biên bản họp Hội đồng nghiệm thu ${d.cap === 'Tập đoàn' ? 'cấp Tập đoàn' : 'cấp Cơ sở'} đối với nhiệm vụ ${d.maDeTai};`,
          'Theo đề nghị của Cơ quan quản lý KHCN.',
        ],
        sections: [
          {
            heading: 'Điều 1.',
            paragraphs: [
              `Công nhận kết quả nghiệm thu nhiệm vụ KHCN “${d.tenDeTai}” (mã ${d.maDeTai}), chủ nhiệm ${d.chuNhiem}, đơn vị chủ trì ${d.donVi}. Kết quả: ĐẠT.`,
            ],
          },
          { heading: 'Điều 2.', paragraphs: ['Giao Cơ quan quản lý KHCN hoàn tất thủ tục lưu trữ hồ sơ, bàn giao sản phẩm và quyết toán nhiệm vụ theo quy định.'] },
          { heading: 'Điều 3.', paragraphs: ['Quyết định có hiệu lực kể từ ngày ký.'] },
        ],
        chucDanhKy: ky.chucDanh,
        nguoiKy: ky.nguoi,
        noiNhan: ['Như Điều 3;', 'Chủ nhiệm, đơn vị chủ trì;', 'Lưu: VT, CQ QLKHCN.'],
      }
    },
  },
]

/** Các template áp dụng cho một hồ sơ cụ thể (theo quy trình). */
export function templatesFor(d: Dossier): DocTemplate[] {
  return DOC_TEMPLATES.filter((t) => t.applies(d))
}
