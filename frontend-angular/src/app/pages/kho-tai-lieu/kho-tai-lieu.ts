import { DatePipe } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzEmptyModule } from 'ng-zorro-antd/empty';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalModule } from 'ng-zorro-antd/modal';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { NzTabsModule } from 'ng-zorro-antd/tabs';
import { NzTreeModule, NzFormatEmitEvent, NzTreeNodeOptions } from 'ng-zorro-antd/tree';

import { AuthService } from '../../core/auth/auth.service';
import {
  GIAI_DOAN_LABEL,
  GiaiDoanSanPham,
  NodeKhoNhiemVu,
  PycKhaiBaoCauHinh,
  TRANG_THAI_PYC_COLOR,
  TRANG_THAI_PYC_LABEL,
  TrangThaiPyc,
  VI_TRI_PHAN_QUYEN_MAU,
  buildTenTaiLieuChuan,
  validateTenTaiLieu,
} from '../../core/models/kho-tai-lieu';
import { KhoTaiLieuService } from '../../core/services/kho-tai-lieu.service';

@Component({
  selector: 'app-kho-tai-lieu',
  imports: [
    DatePipe, FormsModule, NzButtonModule, NzCardModule, NzEmptyModule, NzIconModule, NzInputModule,
    NzModalModule, NzSelectModule, NzTagModule, NzTabsModule, NzTreeModule,
  ],
  templateUrl: './kho-tai-lieu.html',
  styleUrl: './kho-tai-lieu.scss',
})
export class KhoTaiLieuPage {
  private readonly service = inject(KhoTaiLieuService);
  private readonly message = inject(NzMessageService);
  readonly auth = inject(AuthService);

  readonly revision = signal(0);
  readonly tab = signal(0);
  readonly giaiDoanXem = signal<GiaiDoanSanPham>('EVT');

  readonly pycModal = signal(false);
  readonly uploadModal = signal(false);
  readonly selectedFolder = signal<NodeKhoNhiemVu | null>(null);
  readonly selectedKhoMa = signal('');

  readonly donViDeXuat = signal('Trung tâm Ra-đa');
  readonly maNhiemVu = signal('');
  readonly tenNhiemVu = signal('');
  readonly maSanPham = signal('');
  readonly khoi = signal<'K1' | 'K2' | 'K3'>('K1');
  readonly trungTam = signal('Rada');
  readonly giaiDoanPyc = signal<GiaiDoanSanPham[]>(['EVT']);
  readonly soQd = signal('');
  readonly ngayQd = signal('');
  readonly chuNhiem = signal('');
  readonly uploadTen = signal('');
  readonly uploadModule = signal('');
  readonly uploadVersion = signal('V1.0');
  readonly uploadGiaiDoan = signal<GiaiDoanSanPham>('EVT');

  readonly giaiDoanLabel = GIAI_DOAN_LABEL;
  readonly trangThaiLabel = TRANG_THAI_PYC_LABEL;
  readonly trangThaiColor = TRANG_THAI_PYC_COLOR;
  readonly viTriOptions = VI_TRI_PHAN_QUYEN_MAU;
  readonly trungTamOptions = this.service.trungTamOptions();
  readonly giaiDoanOptions = Object.keys(GIAI_DOAN_LABEL) as GiaiDoanSanPham[];

  readonly mauCay = computed(() => {
    this.revision();
    return this.service.listMauCay();
  });

  readonly mauDangXem = computed(() =>
    this.mauCay().find((m) => m.giaiDoan === this.giaiDoanXem()) ?? this.mauCay()[0]);

  readonly cayMauTree = computed((): NzTreeNodeOptions[] => {
    const mau = this.mauDangXem();
    if (!mau) return [];
    return mau.cay.map((n) => this.toTree(n.ma, n.ten, n.moTa, n.children));
  });

  readonly pycList = computed(() => {
    this.revision();
    return this.service.listPyc();
  });

  readonly khoList = computed(() => {
    this.revision();
    return this.service.listKho();
  });

  readonly khoDangXem = computed(() => {
    this.revision();
    const ma = this.selectedKhoMa() || this.khoList()[0]?.maNhiemVu;
    return ma ? this.service.getKho(ma) : undefined;
  });

  readonly cayKhoTree = computed((): NzTreeNodeOptions[] => {
    const kho = this.khoDangXem();
    if (!kho) return [];
    return kho.cay.map((n) => this.nodeToTree(n));
  });

  readonly tenChuanPreview = computed(() =>
    buildTenTaiLieuChuan({
      maSanPham: this.pycForUpload()?.maSanPham || this.maSanPham() || 'MASANPHAM',
      giaiDoan: this.uploadGiaiDoan(),
      module: this.uploadModule() || undefined,
      tenHoSo: this.uploadTen().replace(/\.[^.]+$/, '') || 'TenHoSo',
      version: this.uploadVersion() || 'V1.0',
    }));

  readonly tenChuanCheck = computed(() => validateTenTaiLieu(this.tenChuanPreview()));

  chonTab(index: number): void {
    this.tab.set(index);
  }

  chonGiaiDoanMau(gd: GiaiDoanSanPham): void {
    this.giaiDoanXem.set(gd);
  }

  resetMau(): void {
    this.service.resetMauCay();
    this.revision.update((n) => n + 1);
    this.message.success('Đã khôi phục mẫu cây thư mục theo QĐ 1752 / BM-PYC.');
  }

  moTaoPyc(): void {
    this.maNhiemVu.set('');
    this.tenNhiemVu.set('');
    this.maSanPham.set('');
    this.giaiDoanPyc.set(['EVT']);
    this.soQd.set('');
    this.ngayQd.set('');
    this.chuNhiem.set(this.auth.user()?.hoTen || '');
    this.pycModal.set(true);
  }

  luuPyc(): void {
    if (!this.maNhiemVu().trim() || !this.maSanPham().trim() || !this.tenNhiemVu().trim()) {
      this.message.error('Nhập mã nhiệm vụ, mã sản phẩm và tên nhiệm vụ.');
      return;
    }
    if (!this.giaiDoanPyc().length) {
      this.message.error('Chọn ít nhất một giai đoạn.');
      return;
    }
    const pyc: PycKhaiBaoCauHinh = {
      id: globalThis.crypto?.randomUUID?.() ?? `pyc-${Date.now()}`,
      maPyc: `PYC-${new Date().getFullYear()}-${String(this.pycList().length + 1).padStart(3, '0')}`,
      ngayTao: new Date().toISOString(),
      donViDeXuat: this.donViDeXuat(),
      maNhiemVu: this.maNhiemVu().trim(),
      tenNhiemVu: this.tenNhiemVu().trim(),
      maSanPham: this.maSanPham().trim().slice(0, 8),
      khoi: this.khoi(),
      trungTam: this.trungTam(),
      giaiDoan: [...this.giaiDoanPyc()],
      soQuyetDinh: this.soQd().trim(),
      ngayQuyetDinh: this.ngayQd(),
      chuNhiem: this.chuNhiem().trim() || 'PM',
      dauMoiTrungTam: this.donViDeXuat(),
      trangThai: 'nhap',
      users: [
        { viTri: 'PM', hoTen: this.chuNhiem() || 'PM', maNv: '', quyenMacDinh: 'update' },
      ],
      ghiChu: '',
      nguoiTao: this.auth.user()?.hoTen || 'Người dùng',
    };
    this.service.savePyc(pyc);
    this.revision.update((n) => n + 1);
    this.pycModal.set(false);
    this.message.success(`Đã tạo ${pyc.maPyc}. Đường dẫn gợi ý: ${this.service.pathGoiY(pyc)}`);
  }

  chuyen(pyc: PycKhaiBaoCauHinh, trangThai: TrangThaiPyc): void {
    try {
      this.service.chuyenTrangThai(pyc.id, trangThai, this.auth.user()?.hoTen || 'Người dùng');
      this.revision.update((n) => n + 1);
      if (trangThai === 'da_khai_bao') {
        this.selectedKhoMa.set(pyc.maNhiemVu);
        this.tab.set(2);
        this.message.success('P.CNTT đã khai báo — kho thư mục nhiệm vụ đã tạo.');
      } else {
        this.message.success(`Cập nhật trạng thái: ${TRANG_THAI_PYC_LABEL[trangThai]}`);
      }
    } catch (e) {
      this.message.error(e instanceof Error ? e.message : 'Không cập nhật được.');
    }
  }

  chonKho(ma: string): void {
    this.selectedKhoMa.set(ma);
    this.selectedFolder.set(null);
  }

  onKhoTreeClick(event: NzFormatEmitEvent): void {
    const raw = (event.node?.origin as NzTreeNodeOptions & { raw?: NodeKhoNhiemVu } | undefined)?.raw;
    if (raw) this.selectedFolder.set(raw);
  }

  moUpload(): void {
    if (!this.selectedFolder()) {
      this.message.warning('Chọn một thư mục trên cây trước.');
      return;
    }
    const pyc = this.pycForUpload();
    this.uploadGiaiDoan.set(pyc?.giaiDoan[0] ?? 'EVT');
    this.uploadTen.set('');
    this.uploadModule.set('');
    this.uploadVersion.set('V1.0');
    this.uploadModal.set(true);
  }

  luuUpload(): void {
    const folder = this.selectedFolder();
    const kho = this.khoDangXem();
    const pyc = this.pycForUpload();
    if (!folder || !kho || !pyc) return;
    try {
      const file = this.service.uploadFile(kho.maNhiemVu, folder.id, this.uploadTen() || 'TaiLieu.pdf', {
        maSanPham: pyc.maSanPham,
        giaiDoan: this.uploadGiaiDoan(),
        module: this.uploadModule() || undefined,
        version: this.uploadVersion(),
        nguoi: this.auth.user()?.hoTen || 'Người dùng',
      });
      this.revision.update((n) => n + 1);
      this.uploadModal.set(false);
      this.message.success(
        file.hopLeTen
          ? `Đã lưu với tên chuẩn: ${file.tenChuan}`
          : `Đã lưu nhưng tên chuẩn chưa đạt quy định: ${file.tenChuan}`,
      );
      // refresh selected folder from new tree
      const refreshed = this.findNode(this.service.getKho(kho.maNhiemVu)?.cay ?? [], folder.id);
      this.selectedFolder.set(refreshed);
    } catch (e) {
      this.message.error(e instanceof Error ? e.message : 'Không upload được.');
    }
  }

  pathGoiY(pyc: PycKhaiBaoCauHinh): string {
    return this.service.pathGoiY(pyc);
  }

  private pycForUpload(): PycKhaiBaoCauHinh | undefined {
    const kho = this.khoDangXem();
    return kho ? this.service.getPyc(kho.pycId) : undefined;
  }

  private toTree(key: string, title: string, moTa: string, children?: { ma: string; ten: string; moTa: string; children?: typeof children }[]): NzTreeNodeOptions {
    return {
      key,
      title: `${title} — ${moTa}`,
      children: (children ?? []).map((c) => this.toTree(c.ma, c.ten, c.moTa, c.children)),
    };
  }

  private nodeToTree(node: NodeKhoNhiemVu): NzTreeNodeOptions {
    return {
      key: node.id,
      title: `${node.ma}${node.files.length ? ` (${node.files.length})` : ''}`,
      raw: node,
      children: node.children.map((c) => this.nodeToTree(c)),
    } as NzTreeNodeOptions;
  }

  private findNode(nodes: NodeKhoNhiemVu[], id: string): NodeKhoNhiemVu | null {
    for (const n of nodes) {
      if (n.id === id) return n;
      const found = this.findNode(n.children, id);
      if (found) return found;
    }
    return null;
  }
}
