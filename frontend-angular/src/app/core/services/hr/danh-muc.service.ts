import { Injectable, Signal, computed, signal } from '@angular/core';

import {
  DANH_MUC_DINH_NGHIA,
  DanhMucLoai,
  DanhMucRow,
  SEED_DANH_MUC,
} from '../../models/hr/danh-muc';
import {
  ImportDongPreview,
  ImportVanDe,
  docFilePhanCach,
} from '../../../shared/hr/import-preview/import-preview.model';

/**
 * Signal store in-memory cho **11 danh mục phẳng** của HR Tools — cùng khuôn `NhiemVuService`
 * (không `HttpClient`, xem ghi chú ở đó). Đơn vị (cây 5 cấp) nằm ở `don-vi.service.ts`.
 *
 * Một store cho cả 11 danh mục chứ không phải 11 store: chúng khác nhau ở **cấu hình cột và
 * trường**, không khác ở vòng đời. Bộ hàm public giữ đúng khuôn mà kế hoạch §10.2 quy định
 * (`list/get/create/update/remove/importRows`) để đợt 6 thay ruột bằng HTTP mà không màn nào phải
 * sửa — chỉ khác là mọi hàm nhận thêm tham số `loai` ở đầu.
 */

function id(loai: DanhMucLoai): string {
  return `${loai}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

/**
 * Bản ghi mới do người dùng nhập — `id` do store cấp, `hoatDong` mặc định bật.
 *
 * Khai lại `ma`/`ten` thay vì `Omit<DanhMucRow, 'id'>`: `DanhMucRow` có index signature, mà `Omit`
 * trên kiểu có index signature **nuốt luôn** các thuộc tính khai tường minh — kết quả là `ma` và
 * `ten` thành tuỳ chọn kiểu `unknown`, và mọi lỗi thiếu tên bản ghi lọt qua kiểm kiểu.
 */
export interface DanhMucInput {
  ma: string;
  ten: string;
  hoatDong?: boolean;
  [truong: string]: unknown;
}

type Kho = Record<DanhMucLoai, DanhMucRow[]>;

function khoBanDau(): Kho {
  const kho = {} as Kho;
  for (const loai of Object.keys(SEED_DANH_MUC) as DanhMucLoai[]) {
    kho[loai] = SEED_DANH_MUC[loai].map((r) => ({ ...r }));
  }
  return kho;
}

@Injectable({ providedIn: 'root' })
export class DanhMucService {
  private readonly khoSignal = signal<Kho>(khoBanDau());

  /**
   * Signal chỉ đọc của một danh mục.
   *
   * `computed` mới chứ không phải một signal có sẵn: trang gọi hàm này **một lần** trong field
   * khởi tạo (`readonly rows = this.service.rows(loai)`), nên không có chuyện tạo lại computed mỗi
   * chu kỳ phát hiện thay đổi.
   */
  rows(loai: DanhMucLoai): Signal<readonly DanhMucRow[]> {
    return computed(() => this.khoSignal()[loai]);
  }

  list(loai: DanhMucLoai): readonly DanhMucRow[] {
    return this.khoSignal()[loai];
  }

  get(loai: DanhMucLoai, rowId: string): DanhMucRow | undefined {
    return this.khoSignal()[loai].find((r) => r.id === rowId);
  }

  /** Tra theo **mã nghiệp vụ** — đường mà route chi tiết và luồng import dùng, không phải `id`. */
  theoMa(loai: DanhMucLoai, ma: string): DanhMucRow | undefined {
    const can = ma.trim().toLocaleUpperCase('vi');
    return this.khoSignal()[loai].find((r) => r.ma.toLocaleUpperCase('vi') === can);
  }

  /** Chỉ các bản ghi còn hoạt động — nguồn cho mọi ô `select` ở màn nghiệp vụ. */
  dangHoatDong(loai: DanhMucLoai): readonly DanhMucRow[] {
    return this.khoSignal()[loai].filter((r) => r.hoatDong);
  }

  daTonTai(loai: DanhMucLoai, ma: string, boQuaId?: string): boolean {
    const can = ma.trim().toLocaleUpperCase('vi');
    return this.khoSignal()[loai].some(
      (r) => r.ma.toLocaleUpperCase('vi') === can && r.id !== boQuaId,
    );
  }

  create(loai: DanhMucLoai, input: DanhMucInput): DanhMucRow {
    const row: DanhMucRow = { hoatDong: true, ...input, id: id(loai), ma: input.ma.trim() };
    this.ghi(loai, (prev) => [row, ...prev]);
    return row;
  }

  update(loai: DanhMucLoai, rowId: string, patch: Partial<DanhMucInput>): void {
    // `id` không cho patch đổi: nó là thứ các bảng con (nhân sự, nội dung CV) đang trỏ tới.
    this.ghi(loai, (prev) => prev.map((r) => (r.id === rowId ? { ...r, ...patch, id: r.id } : r)));
  }

  /**
   * Xoá cứng — **chỉ dùng cho bản ghi chưa đi vào dữ liệu nghiệp vụ nào**.
   *
   * Đường mặc định của màn danh mục là `doiHoatDong(false)` (*Ngừng hoạt động*), theo đúng ghi chú
   * ở artboard 12B: master data đã vào bảng công kỳ trước mà xoá cứng thì số báo cáo cũ đổi sau
   * lưng người đã ký.
   */
  remove(loai: DanhMucLoai, rowId: string): void {
    this.ghi(loai, (prev) => prev.filter((r) => r.id !== rowId));
  }

  doiHoatDong(loai: DanhMucLoai, rowId: string, hoatDong: boolean): void {
    this.ghi(loai, (prev) => prev.map((r) => (r.id === rowId ? { ...r, hoatDong } : r)));
  }

  // ------------------------------------------------------------------------- import

  /**
   * Đọc file và **chấm điểm từng dòng** — không ghi gì.
   *
   * Tách đôi `phanTichFile` / `importRows` là cố ý, cùng lý do đã ghi ở `nhan-su.service.ts`: bắt
   * màn hình phải hiện preview trước khi nhập. Bộ luật ở đây là bộ **danh mục** (§6.6 bảng đầu),
   * KHÔNG phải bộ luật của `PhanBoCong` — hai bộ khác hẳn, đừng gọi nhầm.
   */
  phanTichFile(loai: DanhMucLoai, noiDung: string): ImportDongPreview[] {
    const dinhNghia = DANH_MUC_DINH_NGHIA[loai];
    const cot = dinhNghia.importCot;
    const raws = docFilePhanCach(noiDung, cot.length);
    const daThayTrongFile = new Set<string>();

    return raws.map((o, i) => {
      const vanDe: ImportVanDe[] = [];
      const ma = (o[0] ?? '').trim();
      const ten = (o[1] ?? '').trim();

      // Thông báo nêu NHÃN người dùng đọc được ("Thiếu Mã chức danh"), không phải tên trường
      // trong file ("Thiếu ma") — người sửa file là cán bộ HR, không phải người viết code.
      const nhan = (field: string) =>
        dinhNghia.truong.find((t) => t.field === field)?.label ?? field;

      if (!ma) vanDe.push({ mucDo: 'LOI', moTa: `Thiếu ${nhan(cot[0])} — dòng không định danh được.` });
      if (!ten) vanDe.push({ mucDo: 'LOI', moTa: `Thiếu ${nhan(cot[1])}.` });

      const key = ma.toLocaleUpperCase('vi');
      if (ma && daThayTrongFile.has(key)) {
        vanDe.push({ mucDo: 'LOI', moTa: `Mã ${ma} lặp lại trong chính file này.` });
      }
      if (ma) daThayTrongFile.add(key);

      // Trùng với dữ liệu đang có là **cảnh báo cho qua**: nhập lại danh mục để cập nhật là việc
      // bình thường của HR. Khác hẳn import BM0 — ở đó trùng kỳ phải hỏi "đè cả kỳ" (§6.6).
      if (ma && this.daTonTai(loai, ma)) {
        vanDe.push({
          mucDo: 'CANH_BAO',
          moTa: `Mã ${ma} đã có trong danh mục — dòng này sẽ GHI ĐÈ bản ghi hiện tại.`,
          xuLy: 'Ghi đè',
        });
      }

      // Trường `chon` chỉ nhận đúng tập tuỳ chọn đã khai; giá trị lạ là lỗi chặn, vì nó sẽ trở
      // thành một ô select rỗng ở màn nghiệp vụ và không ai biết vì sao.
      for (let c = 2; c < cot.length; c++) {
        const truong = dinhNghia.truong.find((t) => t.field === cot[c]);
        const giaTri = (o[c] ?? '').trim();
        if (truong?.kieu === 'chon' && giaTri && !truong.options?.includes(giaTri)) {
          vanDe.push({
            mucDo: 'LOI',
            moTa: `${truong.label} "${giaTri}" không có trong tập giá trị hợp lệ.`,
            xuLy: 'Đối chiếu danh mục',
          });
        }
      }

      return {
        soDong: i + 2, // +2: dòng 1 là tiêu đề, người dùng đếm từ 1.
        khoa: ma || '—',
        nhan: ten || '—',
        vanDe,
        hopLe: !vanDe.some((v) => v.mucDo === 'LOI'),
        duLieu: Object.fromEntries(cot.map((c, k) => [c, (o[k] ?? '').trim()])),
      };
    });
  }

  /** Ghi các dòng hợp lệ; dòng trùng mã ghi đè bản ghi cũ. Trả về số dòng đã ghi. */
  importRows(loai: DanhMucLoai, preview: readonly ImportDongPreview[]): number {
    const dinhNghia = DANH_MUC_DINH_NGHIA[loai];
    const hopLe = preview.filter((p) => p.hopLe);

    for (const dong of hopLe) {
      const duLieu = dong.duLieu ?? {};
      const patch: Record<string, unknown> = { ten: duLieu[dinhNghia.importCot[1]] ?? dong.nhan };

      for (let c = 2; c < dinhNghia.importCot.length; c++) {
        const field = dinhNghia.importCot[c];
        const truong = dinhNghia.truong.find((t) => t.field === field);
        const tho = duLieu[field] ?? '';
        if (truong?.kieu === 'so') patch[field] = Number(tho) || 0;
        else if (truong?.kieu === 'bat-tat') patch[field] = /^(1|true|có|co|x)$/i.test(tho);
        else patch[field] = tho;
      }

      const dangCo = this.theoMa(loai, dong.khoa);
      if (dangCo) this.update(loai, dangCo.id, patch as Partial<DanhMucInput>);
      else this.create(loai, { ma: dong.khoa, ...patch } as DanhMucInput);
    }
    return hopLe.length;
  }

  /** Nội dung file mẫu `.csv` — hàng tiêu đề + một dòng ví dụ lấy từ chính seed. */
  fileMau(loai: DanhMucLoai): string {
    const cot = DANH_MUC_DINH_NGHIA[loai].importCot;
    const mau = this.list(loai)[0];
    const dong = cot
      .map((c) => {
        const v = c === 'ma' ? mau?.ma : c === 'ten' || c === 'hoTen' ? mau?.ten : mau?.[c];
        return v === undefined || v === null ? '' : String(v);
      })
      .join(',');
    return `${cot.join(',')}\n${dong}\n`;
  }

  private ghi(loai: DanhMucLoai, fn: (prev: DanhMucRow[]) => DanhMucRow[]): void {
    this.khoSignal.update((kho) => ({ ...kho, [loai]: fn(kho[loai]) }));
  }
}
