// Biểu mẫu mẫu cho luồng RD07 "Quản lý Danh mục Dịch vụ, Sản phẩm Nghiên cứu"
// Bám sơ đồ BPMN: 4 tuyến · 7 bước · timer 20 cuối quý · gateway đủ/không đủ căn cứ.
//
// Seed client-side tạm thời (xem `.harness/state/DELIVERY_STATE.md`): khi backend
// `/api/eform` trả rỗng, Angular nạp mảng này vào cache. KHÔNG persist qua POST API.

import type { FormMeta } from '../models/eform';

const text = (id: string, text: string) => ({ type: 'text', id, text });

const textfield = (id: string, key: string, label: string, required = false) => ({
  type: 'textfield',
  id,
  key,
  label,
  validate: required ? { required: true } : undefined,
});

const textarea = (id: string, key: string, label: string, required = false) => ({
  type: 'textarea',
  id,
  key,
  label,
  validate: required ? { required: true } : undefined,
});

const datepicker = (id: string, key: string, label: string, required = false) => ({
  type: 'datetime',
  subtype: 'date',
  id,
  key,
  label,
  validate: required ? { required: true } : undefined,
});

const checkbox = (id: string, key: string, label: string) => ({
  type: 'checkbox',
  id,
  key,
  label,
});

const numberfield = (id: string, key: string, label: string, required = false) => ({
  type: 'number',
  id,
  key,
  label,
  validate: required ? { required: true } : undefined,
});

export const RD07_FORM_SEEDS: FormMeta[] = [
  {
    key: 'bm-07-01-cnhap-dm-spdv-dau-nam',
    ten: 'B1 — Cập nhật DM SPDV đầu năm',
    moTa:
      'Bước 1 — Đơn vị QLDM SPDV: cập nhật danh mục SPDV & trạng thái SPDV đầu năm (sau khi KHN được phê duyệt hoặc chỉ đạo BTGĐ).',
    loai: 'Soạn thảo',
    nhomRD: 'RD07',
    version: 1,
    schema: {
      type: 'default',
      id: 'bm-07-01-cnhap-dm-spdv-dau-nam',
      components: [
        text('h', '## Cập nhật Danh mục SPDV đầu năm'),
        text('d', '*(Bước 1 · Đơn vị Quản lý Danh mục SPDV · Trigger: KHN phê duyệt / chỉ đạo BTGĐ)*'),
        textfield('dv', 'donVi', 'Đơn vị QLDM SPDV', true),
        datepicker('ng', 'ngayCapNhat', 'Ngày cập nhật', true),
        textarea('ds', 'danhSachSPDV', 'Danh sách SPDV cập nhật (mã, tên, phân loại KD/NCPT, trạng thái vòng đời)', true),
        textarea('ct', 'canCu', 'Căn cứ (QĐ BTGĐ / KHN được phê duyệt)', true),
        checkbox('ht', 'hoanTat', 'Đã rà soát đầy đủ danh mục hiện hành'),
      ],
    },
  },
  {
    key: 'bm-07-02-yeu-cau-cap-nhat',
    ten: 'B2 — Yêu cầu cập nhật DM SPDV quý',
    moTa:
      'Bước 2 — Đơn vị QLDM SPDV: gửi yêu cầu cập nhật thông tin trong danh mục SPDV (timer: ngày 20 tháng cuối Quý N).',
    loai: 'Soạn thảo',
    nhomRD: 'RD07',
    version: 1,
    schema: {
      type: 'default',
      id: 'bm-07-02-yeu-cau-cap-nhat',
      components: [
        text('h', '## Yêu cầu cập nhật DM SPDV'),
        text('d', '*(Bước 2 · Timer ngày 20 tháng cuối Quý N → mở song song Bước 3/4/5)*'),
        textfield('dv', 'donVi', 'Đơn vị gửi yêu cầu', true),
        textfield('q', 'quy', 'Quý / Năm (vd. 2026-Q2)', true),
        datepicker('ng', 'ngayGui', 'Ngày gửi yêu cầu', true),
        textarea('yc', 'noiDungYeuCau', 'Nội dung yêu cầu (thêm / sửa / xoá / cập nhật trạng thái SPDV)', true),
        checkbox('kd', 'guiTTKD', 'Đã gửi tới TT KD VHT (Bước 3)'),
        checkbox('nc', 'guiTTNCSP', 'Đã gửi tới TTNCSP (Bước 4)'),
        checkbox('tc', 'guiTCKT', 'Đã gửi tới P.TCKT VHT (Bước 5)'),
      ],
    },
  },
  {
    key: 'bm-07-03-tt-kd-cap-nhat',
    ten: 'B3 — TT KD cập nhật SPDV kinh doanh',
    moTa: 'Bước 3 — TT KD VHT: cập nhật thay đổi trong danh mục SPDV kinh doanh của TCT (song song với B4/B5).',
    loai: 'Soạn thảo',
    nhomRD: 'RD07',
    version: 1,
    schema: {
      type: 'default',
      id: 'bm-07-03-tt-kd-cap-nhat',
      components: [
        text('h', '## Cập nhật SPDV kinh doanh (TCT)'),
        text('d', '*(Bước 3 · Tuyến TT KD VHT · song song)*'),
        textfield('q', 'quy', 'Quý / Năm', true),
        textarea('ds', 'thayDoiSPDV_KD', 'Danh sách thay đổi SPDV kinh doanh (mã, tên, trạng thái)', true),
        textarea('cc', 'canCu', 'Căn cứ / nguồn CRM', true),
        checkbox('xong', 'hoanTat', 'Đã hoàn tất cập nhật phía TT KD VHT'),
      ],
    },
  },
  {
    key: 'bm-07-04-ttncsp-cap-nhat',
    ten: 'B4 — TTNCSP cập nhật SPDV NCPT',
    moTa: 'Bước 4 — TTNCSP: cập nhật thay đổi trong danh mục SPDV NCPT (song song với B3/B5).',
    loai: 'Soạn thảo',
    nhomRD: 'RD07',
    version: 1,
    schema: {
      type: 'default',
      id: 'bm-07-04-ttncsp-cap-nhat',
      components: [
        text('h', '## Cập nhật SPDV NCPT'),
        text('d', '*(Bước 4 · Tuyến TTNCSP · song song)*'),
        textfield('q', 'quy', 'Quý / Năm', true),
        textarea('ds', 'thayDoiSPDV_NCPT', 'Danh sách thay đổi SPDV nghiên cứu/phát triển', true),
        textfield('nv', 'maNVLienQuan', 'Mã NV KHCN liên quan (nếu có)'),
        textarea('cc', 'canCu', 'Căn cứ điều chỉnh', true),
        checkbox('xong', 'hoanTat', 'Đã hoàn tất cập nhật phía TTNCSP'),
      ],
    },
  },
  {
    key: 'bm-07-05-tckt-dt-cp-ln',
    ten: 'B5 — P.TCKT cập nhật DT/CP/LN',
    moTa: 'Bước 5 — P.TCKT VHT: cập nhật thông tin doanh thu, chi phí, lợi nhuận cho SPDV (song song với B3/B4).',
    loai: 'Soạn thảo',
    nhomRD: 'RD07',
    version: 1,
    schema: {
      type: 'default',
      id: 'bm-07-05-tckt-dt-cp-ln',
      components: [
        text('h', '## Cập nhật doanh thu / chi phí / lợi nhuận SPDV'),
        text('d', '*(Bước 5 · Tuyến P.TCKT VHT · song song)*'),
        textfield('q', 'quy', 'Quý / Năm', true),
        textfield('ma', 'maSPDV', 'Mã SPDV', true),
        numberfield('dt', 'doanhThu', 'Doanh thu (VNĐ)', true),
        numberfield('cp', 'chiPhi', 'Chi phí (VNĐ)', true),
        numberfield('ln', 'loiNhuan', 'Lợi nhuận (VNĐ)'),
        checkbox('xong', 'hoanTat', 'Đã hoàn tất cập nhật phía P.TCKT VHT'),
      ],
    },
  },
  {
    key: 'bm-07-06-tong-hop-xac-thuc',
    ten: 'B6 — Tổng hợp & xác thực căn cứ',
    moTa:
      'Bước 6 — Đơn vị QLDM SPDV: tổng hợp thông tin và xác thực căn cứ điều chỉnh. Gateway: Đủ căn cứ → B7; Không đủ căn cứ → gửi thông báo, kết thúc.',
    loai: 'Thẩm định',
    nhomRD: 'RD07',
    version: 1,
    schema: {
      type: 'default',
      id: 'bm-07-06-tong-hop-xac-thuc',
      components: [
        text('h', '## Tổng hợp thông tin & xác thực căn cứ điều chỉnh'),
        text('d', '*(Bước 6 · Đơn vị QLDM SPDV · đầu vào: B3 + B4 + B5)*'),
        textfield('q', 'quy', 'Quý / Năm', true),
        textarea('kd', 'thongTinKD', 'Tổng hợp từ TT KD VHT (SPDV kinh doanh TCT)'),
        textarea('ncpt', 'thongTinNCPT', 'Tổng hợp từ TTNCSP (SPDV NCPT)'),
        textarea('tc', 'thongTinTC', 'Tổng hợp từ P.TCKT VHT (DT/CP/LN)'),
        checkbox('du', 'duCanCu', 'Đủ căn cứ — chuyển Bước 7 cập nhật Danh mục SPDV Quý N'),
        checkbox('khong', 'khongDuCanCu', 'Không đủ căn cứ — gửi thông báo, không cập nhật DB'),
        textarea('gc', 'ghiChu', 'Ghi chú / lý do không đủ căn cứ (nếu có)'),
      ],
    },
  },
  {
    key: 'bm-07-07-cap-nhat-dm-quy-n',
    ten: 'B7 — Cập nhật DM SPDV Quý N',
    moTa: 'Bước 7 — Đơn vị QLDM SPDV: cập nhật vào Danh mục SPDV tại Quý N (ghi DB).',
    loai: 'Phê duyệt',
    nhomRD: 'RD07',
    version: 1,
    schema: {
      type: 'default',
      id: 'bm-07-07-cap-nhat-dm-quy-n',
      components: [
        text('h', '## Cập nhật Danh mục SPDV tại Quý N'),
        text('d', '*(Bước 7 · kết thúc · ghi vào Cập nhật Danh mục SPDV)*'),
        textfield('q', 'quy', 'Quý / Năm cập nhật', true),
        textfield('nd', 'nguoiDuyet', 'Người xác nhận cập nhật', true),
        datepicker('ng', 'ngayCapNhat', 'Ngày áp dụng', true),
        textarea('pl', 'phienBanSPDV', 'Phiên bản / mô tả thay đổi danh mục sau cập nhật', true),
        checkbox('ht', 'hoanTat', 'Đã cập nhật vào Danh mục SPDV tại Quý N trên hệ thống'),
      ],
    },
  },
];
