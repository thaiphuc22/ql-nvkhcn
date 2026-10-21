import { Injectable } from '@angular/core';

import {
  FileKhoNhiemVu,
  KhoNhiemVu,
  MAU_CAY_THEO_GIAI_DOAN,
  MauCayTheoGiaiDoan,
  NodeKhoNhiemVu,
  PycKhaiBaoCauHinh,
  ThuMucMau,
  TrangThaiPyc,
  TRUNG_TAM_KY_HIEU,
  buildTenTaiLieuChuan,
  validateTenTaiLieu,
} from '../models/kho-tai-lieu';

const KEY_PYC = 'qtkhcn.kho-tai-lieu.pyc.v1';
const KEY_KHO = 'qtkhcn.kho-tai-lieu.kho.v1';
const KEY_MAU = 'qtkhcn.kho-tai-lieu.mau.v1';

/**
 * Cấu hình cây thư mục + PYC khai báo phân vùng + kho theo nhiệm vụ.
 * Lưu localStorage (chưa có API storage/CNTT).
 */
@Injectable({ providedIn: 'root' })
export class KhoTaiLieuService {
  listMauCay(): MauCayTheoGiaiDoan[] {
    const stored = this.readJson<MauCayTheoGiaiDoan[]>(KEY_MAU);
    return stored?.length ? stored : structuredClone(MAU_CAY_THEO_GIAI_DOAN);
  }

  resetMauCay(): MauCayTheoGiaiDoan[] {
    localStorage.removeItem(KEY_MAU);
    return this.listMauCay();
  }

  saveMauCay(list: MauCayTheoGiaiDoan[]): void {
    localStorage.setItem(KEY_MAU, JSON.stringify(list));
  }

  listPyc(): PycKhaiBaoCauHinh[] {
    return this.readJson<PycKhaiBaoCauHinh[]>(KEY_PYC) ?? this.seedPyc();
  }

  getPyc(id: string): PycKhaiBaoCauHinh | undefined {
    return this.listPyc().find((p) => p.id === id);
  }

  savePyc(pyc: PycKhaiBaoCauHinh): PycKhaiBaoCauHinh {
    const list = this.listPyc().filter((p) => p.id !== pyc.id);
    list.unshift(pyc);
    localStorage.setItem(KEY_PYC, JSON.stringify(list));
    return pyc;
  }

  chuyenTrangThai(id: string, trangThai: TrangThaiPyc, nguoi: string): PycKhaiBaoCauHinh {
    const pyc = this.getPyc(id);
    if (!pyc) throw new Error('Không tìm thấy phiếu PYC.');
    const next = { ...pyc, trangThai };
    this.savePyc(next);
    if (trangThai === 'da_khai_bao') {
      this.taoKhoTuPyc(next, nguoi);
    }
    return next;
  }

  listKho(): KhoNhiemVu[] {
    return this.readJson<KhoNhiemVu[]>(KEY_KHO) ?? [];
  }

  getKho(maNhiemVu: string): KhoNhiemVu | undefined {
    return this.listKho().find((k) => k.maNhiemVu === maNhiemVu);
  }

  uploadFile(
    maNhiemVu: string,
    folderId: string,
    tenGoc: string,
    meta: { maSanPham: string; giaiDoan: PycKhaiBaoCauHinh['giaiDoan'][number]; module?: string; version?: string; nguoi: string },
  ): FileKhoNhiemVu {
    const kho = this.getKho(maNhiemVu);
    if (!kho) throw new Error('Chưa có kho — cần PYC đã khai báo.');
    const stem = tenGoc.replace(/\.[^.]+$/, '').replace(/\s+/g, '-');
    const tenChuan = buildTenTaiLieuChuan({
      maSanPham: meta.maSanPham,
      giaiDoan: meta.giaiDoan,
      module: meta.module,
      tenHoSo: stem,
      version: meta.version ?? 'V1.0',
    });
    const check = validateTenTaiLieu(tenChuan);
    const file: FileKhoNhiemVu = {
      id: this.id(),
      ten: tenGoc,
      tenChuan,
      hopLeTen: check.ok,
      uploadedAt: new Date().toISOString(),
      nguoi: meta.nguoi,
    };
    const nextCay = this.mapNode(kho.cay, (node) => {
      if (node.id !== folderId) return node;
      return { ...node, files: [...node.files, file] };
    });
    this.writeKho({ ...kho, cay: nextCay, capNhat: new Date().toISOString() });
    return file;
  }

  pathGoiY(pyc: Pick<PycKhaiBaoCauHinh, 'khoi' | 'trungTam' | 'maSanPham' | 'maNhiemVu'>): string {
    return `VHT/${pyc.khoi}/${pyc.trungTam}/${pyc.maSanPham}/${pyc.maNhiemVu}`;
  }

  trungTamOptions() {
    return TRUNG_TAM_KY_HIEU;
  }

  private taoKhoTuPyc(pyc: PycKhaiBaoCauHinh, _nguoi: string): void {
    const mau = this.listMauCay();
    const rootPath = this.pathGoiY(pyc);
    const children: NodeKhoNhiemVu[] = pyc.giaiDoan.map((gd) => {
      const template = mau.find((m) => m.giaiDoan === gd);
      return {
        id: this.id(),
        path: `${rootPath}/${gd}`,
        ma: gd,
        ten: gd,
        moTa: template?.ten ?? gd,
        files: [],
        children: [
          {
            id: this.id(),
            path: `${rootPath}/${gd}/${pyc.maNhiemVu}`,
            ma: pyc.maNhiemVu,
            ten: pyc.maNhiemVu,
            moTa: 'Mã đề tài/dự án (Level 6)',
            files: [],
            children: (template?.cay ?? []).map((t) => this.mauToNode(t, `${rootPath}/${gd}/${pyc.maNhiemVu}`)),
          },
        ],
      };
    });
    const kho: KhoNhiemVu = {
      maNhiemVu: pyc.maNhiemVu,
      pycId: pyc.id,
      rootPath,
      cay: children,
      capNhat: new Date().toISOString(),
    };
    const all = this.listKho().filter((k) => k.maNhiemVu !== pyc.maNhiemVu);
    all.unshift(kho);
    localStorage.setItem(KEY_KHO, JSON.stringify(all));
  }

  private mauToNode(mau: ThuMucMau, parentPath: string): NodeKhoNhiemVu {
    const path = `${parentPath}/${mau.ma}`;
    return {
      id: this.id(),
      path,
      ma: mau.ma,
      ten: mau.ten,
      moTa: mau.moTa,
      files: [],
      children: (mau.children ?? []).map((c) => this.mauToNode(c, path)),
    };
  }

  private mapNode(nodes: NodeKhoNhiemVu[], fn: (n: NodeKhoNhiemVu) => NodeKhoNhiemVu): NodeKhoNhiemVu[] {
    return nodes.map((n) => {
      const self = fn(n);
      return { ...self, children: this.mapNode(self.children, fn) };
    });
  }

  private writeKho(kho: KhoNhiemVu): void {
    const all = this.listKho().filter((k) => k.maNhiemVu !== kho.maNhiemVu);
    all.unshift(kho);
    localStorage.setItem(KEY_KHO, JSON.stringify(all));
  }

  private seedPyc(): PycKhaiBaoCauHinh[] {
    const sample: PycKhaiBaoCauHinh = {
      id: 'pyc-demo-1',
      maPyc: 'PYC-2026-001',
      ngayTao: '2026-09-20T09:00:00+07:00',
      donViDeXuat: 'Trung tâm Ra-đa',
      maNhiemVu: '011-26-TĐ-RDP-QD',
      tenNhiemVu: 'Nghiên cứu radar cảnh giới tầm gần',
      maSanPham: 'VRS-LRS',
      khoi: 'K1',
      trungTam: 'Rada',
      giaiDoan: ['EVT', 'DVT'],
      soQuyetDinh: '120/QĐ-VHT-KHCN',
      ngayQuyetDinh: '2026-08-15',
      chuNhiem: 'Nguyễn Văn An',
      dauMoiTrungTam: 'Trung tâm Ra-đa',
      trangThai: 'da_khai_bao',
      users: [
        { viTri: 'PM', hoTen: 'Nguyễn Văn An', maNv: 'NV001', quyenMacDinh: 'update' },
        { viTri: 'PA', hoTen: 'Trần Thị Bình', maNv: 'NV002', quyenMacDinh: 'update' },
        { viTri: 'HW', hoTen: 'Phạm Quốc Dũng', maNv: 'NV010', quyenMacDinh: 'update' },
        { viTri: 'P.KHCN', hoTen: 'Lê Thị Hoa', maNv: 'NV020', quyenMacDinh: 'view' },
      ],
      ghiChu: 'Phiếu mẫu theo BM-PYC — đã khai báo phân vùng.',
      nguoiTao: 'Nguyễn Văn An',
    };
    localStorage.setItem(KEY_PYC, JSON.stringify([sample]));
    this.taoKhoTuPyc(sample, sample.nguoiTao);
    return [sample];
  }

  private readJson<T>(key: string): T | null {
    try {
      const raw = localStorage.getItem(key);
      return raw ? (JSON.parse(raw) as T) : null;
    } catch {
      return null;
    }
  }

  private id(): string {
    return globalThis.crypto?.randomUUID?.() ?? `id-${Date.now()}-${Math.random().toString(16).slice(2)}`;
  }
}
