import { Injectable } from '@angular/core';

/** Hành động ghi vào lịch sử một phiên họp. */
export type HanhDongLichHop = 'LEN_LICH' | 'NHAC_NHO' | 'DIEU_CHINH' | 'HUY' | 'THEM_PHIEN';

export interface LichSuPhienHop {
  id: string;
  thoiDiem: string;
  nguoi: string;
  hanhDong: HanhDongLichHop;
  moTa: string;
}

export type TrangThaiPhienHop = 'chua_dien_ra' | 'da_dien_ra' | 'da_huy';

export interface PhienHopLich {
  id: string;
  /** Số thứ tự phiên, bắt đầu từ 1. */
  loaiPhien: number;
  ten: string;
  /** Giá trị `datetime-local`: `yyyy-MM-ddTHH:mm`. */
  thoiGian: string;
  diaDiem: string;
  ghiChu: string;
  trangThai: TrangThaiPhienHop;
  lichSu: LichSuPhienHop[];
}

export interface LenLichHopInput {
  ten: string;
  thoiGian: string;
  diaDiem: string;
  ghiChu: string;
  nguoi: string;
}

const STORAGE_KEY = 'qtkhcn.phien-hop.v1';

/** Ví dụ trên màn tạo hội đồng (mã 0), khi chưa có lịch thật. */
const VI_DU_XEM_TRUOC: PhienHopLich[] = [
  {
    id: 'vd-phien-1',
    loaiPhien: 1,
    ten: 'Họp xét duyệt thuyết minh',
    thoiGian: '2026-09-18T09:00',
    diaDiem: 'Phòng họp A, tầng 5',
    ghiChu: 'Đã họp xong, chờ biên bản.',
    trangThai: 'da_dien_ra',
    lichSu: [
      {
        id: 'vd-ls-1',
        thoiDiem: '2026-09-10T09:15:00+07:00',
        nguoi: 'Lê Văn Cường',
        hanhDong: 'LEN_LICH',
        moTa: 'Lên lịch Họp xét duyệt thuyết minh: 18/09/2026 08:30 tại Phòng họp A, tầng 5.',
      },
      {
        id: 'vd-ls-2',
        thoiDiem: '2026-09-12T14:02:00+07:00',
        nguoi: 'Lê Văn Cường',
        hanhDong: 'DIEU_CHINH',
        moTa: 'Sửa lịch: 18/09/2026 08:30 tại Phòng họp A, tầng 5 → 18/09/2026 09:00 tại Phòng họp A, tầng 5.',
      },
    ],
  },
  {
    id: 'vd-phien-2',
    loaiPhien: 2,
    ten: 'Họp phiên bổ sung',
    thoiGian: '2026-10-02T09:00',
    diaDiem: 'Phòng họp A, tầng 5',
    ghiChu: 'Họp bổ sung sau phiên 1.',
    trangThai: 'chua_dien_ra',
    lichSu: [
      {
        id: 'vd-ls-3',
        thoiDiem: '2026-09-23T10:05:00+07:00',
        nguoi: 'Lê Văn Cường',
        hanhDong: 'THEM_PHIEN',
        moTa: 'Thêm phiên họp 2 — Họp phiên bổ sung: 02/10/2026 09:00 tại Phòng họp A, tầng 5.',
      },
    ],
  },
  {
    id: 'vd-phien-3',
    loaiPhien: 3,
    ten: 'Họp thống nhất biên bản',
    thoiGian: '2026-10-06T15:30',
    diaDiem: 'Phòng họp C, tầng 2',
    ghiChu: 'Hủy vì chưa đủ thành viên.',
    trangThai: 'da_huy',
    lichSu: [
      {
        id: 'vd-ls-4',
        thoiDiem: '2026-09-24T08:20:00+07:00',
        nguoi: 'Lê Văn Cường',
        hanhDong: 'THEM_PHIEN',
        moTa: 'Thêm phiên họp 3 — Họp thống nhất biên bản: 06/10/2026 15:30 tại Phòng họp C, tầng 2.',
      },
      {
        id: 'vd-ls-5',
        thoiDiem: '2026-09-24T11:15:00+07:00',
        nguoi: 'Lê Văn Cường',
        hanhDong: 'HUY',
        moTa: 'Hủy lịch Họp thống nhất biên bản.',
      },
    ],
  },
];

/**
 * Lịch phiên họp của hội đồng, kèm lịch sử lên lịch / thêm phiên / nhắc / điều chỉnh / hủy.
 * Chưa có API phiên họp trên ho-so-service nên lưu theo mã hội đồng trên trình duyệt.
 */
@Injectable({ providedIn: 'root' })
export class PhienHopLichService {
  list(hoiDongId: number): PhienHopLich[] {
    const stored = this.read()[String(hoiDongId)];
    if (stored?.length) return stored;
    return hoiDongId === 0 ? VI_DU_XEM_TRUOC : [];
  }

  /** Bản xem trước chưa lưu lịch thật — đang hiện dữ liệu ví dụ. */
  laViDu(hoiDongId: number): boolean {
    return hoiDongId === 0 && !this.read()[String(hoiDongId)]?.length;
  }

  lenLich(hoiDongId: number, input: LenLichHopInput): PhienHopLich {
    const ten = input.ten.trim();
    const diaDiem = input.diaDiem.trim();
    if (!ten || !input.thoiGian || !diaDiem) {
      throw new Error('Nhập tên phiên, ngày, giờ và địa điểm.');
    }
    const current = this.list(hoiDongId);
    const soPhien = current.reduce((max, phien) => Math.max(max, phien.loaiPhien), 0) + 1;
    const now = new Date().toISOString();
    const phien: PhienHopLich = {
      id: this.nextId(),
      loaiPhien: soPhien,
      ten,
      thoiGian: input.thoiGian,
      diaDiem,
      ghiChu: input.ghiChu.trim(),
      trangThai: 'chua_dien_ra',
      lichSu: [
        this.entry(
          input.nguoi,
          soPhien === 1 ? 'LEN_LICH' : 'THEM_PHIEN',
          soPhien === 1
            ? `Lên lịch ${ten}: ${input.thoiGian} tại ${diaDiem}.`
            : `Thêm phiên họp ${soPhien} — ${ten}: ${input.thoiGian} tại ${diaDiem}.`,
        ),
      ],
    };
    phien.lichSu[0].thoiDiem = now;
    this.write(hoiDongId, [...current, phien]);
    return phien;
  }

  dieuChinh(
    hoiDongId: number,
    phienId: string,
    patch: { thoiGian: string; diaDiem: string; ghiChu: string; nguoi: string },
  ): PhienHopLich {
    const diaDiem = patch.diaDiem.trim();
    if (!patch.thoiGian || !diaDiem) {
      throw new Error('Chọn ngày, giờ và địa điểm.');
    }
    return this.update(hoiDongId, phienId, (phien) => {
      if (phien.trangThai !== 'chua_dien_ra') {
        throw new Error('Chỉ sửa được phiên chưa diễn ra.');
      }
      const truoc = `${phien.thoiGian} tại ${phien.diaDiem}`;
      const sau = `${patch.thoiGian} tại ${diaDiem}`;
      return {
        ...phien,
        thoiGian: patch.thoiGian,
        diaDiem,
        ghiChu: patch.ghiChu.trim(),
        lichSu: [...phien.lichSu, this.entry(patch.nguoi, 'DIEU_CHINH', `Sửa lịch: ${truoc} → ${sau}.`)],
      };
    });
  }

  huy(hoiDongId: number, phienId: string, nguoi: string): PhienHopLich {
    return this.update(hoiDongId, phienId, (phien) => {
      if (phien.trangThai !== 'chua_dien_ra') {
        throw new Error('Chỉ hủy được phiên chưa diễn ra.');
      }
      return {
        ...phien,
        trangThai: 'da_huy',
        lichSu: [...phien.lichSu, this.entry(nguoi, 'HUY', `Hủy lịch ${phien.ten}.`)],
      };
    });
  }

  nhacNho(hoiDongId: number, phienId: string, nguoi: string, nguoiNhan: string[]): PhienHopLich {
    const danhSach = nguoiNhan.map((n) => n.trim()).filter(Boolean);
    if (danhSach.length === 0) {
      throw new Error('Chưa có thành viên hội đồng để nhắc.');
    }
    return this.update(hoiDongId, phienId, (phien) => {
      if (phien.trangThai === 'da_huy') {
        throw new Error('Phiên đã hủy, không gửi nhắc.');
      }
      return {
        ...phien,
        lichSu: [...phien.lichSu, this.entry(
          nguoi,
          'NHAC_NHO',
          `Nhắc lịch ${phien.ten} (${phien.thoiGian}, ${phien.diaDiem}) tới: ${danhSach.join(', ')}.`,
        )],
      };
    });
  }

  private update(hoiDongId: number, phienId: string, map: (phien: PhienHopLich) => PhienHopLich): PhienHopLich {
    const current = this.list(hoiDongId);
    // Bản xem trước (id 0) chưa lưu — thao tác Sửa/Hủy cần ghi xuống localStorage.
    const base = current.length ? current : (hoiDongId === 0 ? [...VI_DU_XEM_TRUOC] : []);
    const index = base.findIndex((p) => p.id === phienId);
    if (index < 0) {
      throw new Error('Không tìm thấy phiên họp.');
    }
    const next = map(base[index]);
    const list = base.slice();
    list[index] = next;
    this.write(hoiDongId, list);
    return next;
  }

  private entry(nguoi: string, hanhDong: HanhDongLichHop, moTa: string): LichSuPhienHop {
    return {
      id: this.nextId(),
      thoiDiem: new Date().toISOString(),
      nguoi: nguoi.trim() || 'Người dùng',
      hanhDong,
      moTa,
    };
  }

  private nextId(): string {
    return globalThis.crypto?.randomUUID?.() ?? `ph-${Date.now()}-${Math.random().toString(16).slice(2)}`;
  }

  private read(): Record<string, PhienHopLich[]> {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) as Record<string, PhienHopLich[]> : {};
    } catch {
      return {};
    }
  }

  private write(hoiDongId: number, list: PhienHopLich[]): void {
    const all = this.read();
    all[String(hoiDongId)] = list;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
  }
}
