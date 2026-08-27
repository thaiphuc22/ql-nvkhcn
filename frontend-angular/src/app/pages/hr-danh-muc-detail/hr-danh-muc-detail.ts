import { Component, computed, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs/operators';

import { CmmButtonComponent, ToastService } from '@khcn-core/ui';

import {
  DANH_MUC_DINH_NGHIA,
  DanhMucLoai,
  laDanhMucLoai,
  oDanhMuc,
} from '../../core/models/hr/danh-muc';
import { PHAN_NGUON_LABEL, PhanNguon, formatTien } from '../../core/models/hr/nhiem-vu';
import { DanhMucService } from '../../core/services/hr/danh-muc.service';
import { NhanSuService } from '../../core/services/hr/nhan-su.service';
import { NhiemVuService } from '../../core/services/hr/nhiem-vu.service';
import { NoiDungCongViecService } from '../../core/services/hr/noi-dung-cong-viec.service';
import { exportTableToXls } from '../../core/utils/export-bieu-mau';
import { HrPageCard } from '../../shared/hr/page-card/page-card';
import { HrTrangThaiTag } from '../../shared/hr/trang-thai-tag/trang-thai-tag';

/** Một dòng của bảng “đang được dùng ở đâu”. Ba cột là đủ cho mọi danh mục — xem chú thích lớp. */
interface DongThamChieu {
  ma: string;
  ten: string;
  vaiTro: string;
}

/**
 * Màn **chi tiết danh mục** — khuôn dùng chung cho cả 11 danh mục (artboard 12B).
 *
 * `Book1` yêu cầu mỗi danh mục đủ năm chức năng `Danh sách · Chi tiết · CRUD · Import · Export`.
 * Hộp thoại thêm/sửa 520px phủ được CRUD, **không** phủ được Chi tiết: nó không chứa nổi phần
 * *"bản ghi này đang dính vào những gì"*.
 *
 * ## Phần bắt buộc của màn này là bảng tham chiếu, không phải khối thuộc tính
 *
 * Khối thuộc tính chỉ lặp lại thứ đã thấy ở bảng. Thứ **chỉ** màn này trả lời được là câu hỏi
 * *"xoá bản ghi này thì hỏng cái gì"* — và với danh mục Nhân viên thì xoá nhầm là hỏng cả bảng
 * chấm công của kỳ. Vì vậy nút phá huỷ ở đây là **Ngừng hoạt động**, không phải Xoá.
 *
 * ## Vì sao chỉ 4 danh mục có bảng tham chiếu
 *
 * Tham chiếu chỉ dựng được khi **đã có dữ liệu nghiệp vụ trỏ tới** danh mục đó ở tầng mock hiện
 * tại: nhân viên → nhân sự nhiệm vụ, nguồn kinh phí → nội dung công việc, nhóm công việc →
 * nội dung công việc, sản phẩm → nội dung công việc. Bảy danh mục còn lại chỉ có người dùng ở các
 * đợt sau (ký hiệu công dùng ở bảng công đợt 2, loại CPNC ở BM3 đợt 3…). Chỗ đó hiện **một câu nói
 * rõ chưa có dữ liệu**, chứ không phải một bảng rỗng giả vờ đã nối — bảng rỗng đọc thành "không ai
 * dùng, xoá được", đúng thứ màn này sinh ra để ngăn.
 */
@Component({
  selector: 'app-hr-danh-muc-detail',
  imports: [CmmButtonComponent, HrPageCard, HrTrangThaiTag],
  templateUrl: './hr-danh-muc-detail.html',
  styleUrl: './hr-danh-muc-detail.scss',
})
export class HrDanhMucDetailPage {
  private readonly service = inject(DanhMucService);
  private readonly nhanSu = inject(NhanSuService);
  private readonly nhiemVu = inject(NhiemVuService);
  private readonly noiDung = inject(NoiDungCongViecService);
  private readonly toast = inject(ToastService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  private readonly params = toSignal(
    this.route.paramMap.pipe(
      map((p) => ({
        loai: laDanhMucLoai(p.get('loai')) ? (p.get('loai') as DanhMucLoai) : ('chuc-danh' as DanhMucLoai),
        ma: p.get('ma') ?? '',
      })),
    ),
    { initialValue: { loai: 'chuc-danh' as DanhMucLoai, ma: '' } },
  );

  readonly loai = computed(() => this.params().loai);
  readonly dinhNghia = computed(() => DANH_MUC_DINH_NGHIA[this.loai()]);

  /** Tra theo **mã**, không phải `id`: mã là thứ đứng trên URL và người dùng đọc được. */
  readonly banGhi = computed(() => this.service.theoMa(this.loai(), this.params().ma));

  readonly backTo = computed(() => `/hr/danh-muc/${this.loai()}`);

  /** Cặp nhãn–giá trị của khối thuộc tính, dựng từ đúng bộ trường của form. */
  readonly thuocTinh = computed(() => {
    const row = this.banGhi();
    if (!row) return [];
    return this.dinhNghia().truong.map((t) => ({
      label: t.label,
      value:
        t.kieu === 'bat-tat'
          ? row[t.field] === null || row[t.field] === undefined
            ? 'Chưa khai'
            : row[t.field]
              ? 'Có'
              : 'Không'
          : oDanhMuc(row[t.field], t.kieu === 'so' ? 'so' : 'chu'),
      moTa: t.moTa,
    }));
  });

  // -------------------------------------------------------------- tham chiếu

  readonly tieuDeThamChieu = computed(() => {
    switch (this.loai()) {
      case 'nhan-vien':
        return 'Đang tham gia các nhiệm vụ';
      case 'nguon-kinh-phi':
        return 'Nội dung công việc đang dùng nguồn này';
      case 'nhom-cong-viec':
        return 'Nội dung công việc thuộc nhóm này';
      case 'san-pham':
        return 'Nội dung công việc gắn với sản phẩm này';
      default:
        return 'Đang được dùng ở đâu';
    }
  });

  readonly thamChieu = computed<DongThamChieu[] | null>(() => {
    const row = this.banGhi();
    if (!row) return null;

    switch (this.loai()) {
      case 'nhan-vien': {
        const tenNhiemVu = new Map(this.nhiemVu.rows().map((n) => [n.maNhiemVu, n.tenNhiemVu]));
        return this.nhanSu
          .rows()
          .filter((ns) => ns.maNhanVien === row.ma)
          .map((ns) => ({
            ma: ns.nhiemVuId,
            ten: tenNhiemVu.get(ns.nhiemVuId) ?? '(nhiệm vụ đã xoá)',
            vaiTro: ns.vaiTroThamGia || 'Thành viên',
          }));
      }

      case 'nguon-kinh-phi': {
        // Mã danh mục viết liền (`BAN_HANG` → `BANHANG`) còn enum `PhanNguon` có gạch dưới. So
        // sánh sau khi bỏ gạch dưới thay vì bắt hai bên trùng chuỗi: gộp hai bảng mã lại là việc
        // của đợt 6, ép ngay bây giờ sẽ phải sửa cả seed lẫn model.
        const can = row.ma.replace(/_/g, '').toUpperCase();
        return this.noiDung
          .rows()
          .filter((nd) => nd.phanNguon.replace(/_/g, '').toUpperCase() === can)
          .map((nd) => ({
            ma: nd.nhiemVuId,
            ten: nd.ten,
            vaiTro: formatTien(nd.chiPhiNhanCongPheDuyet),
          }));
      }

      case 'nhom-cong-viec':
        return this.noiDung
          .rows()
          .filter((nd) => nd.nhomCongViecId === row.ma || nd.nhomCongViecId === row.ten)
          .map((nd) => ({ ma: nd.nhiemVuId, ten: nd.ten, vaiTro: nd.donViPhanBo }));

      case 'san-pham':
        return this.noiDung
          .rows()
          .filter((nd) => nd.sanPhamId === row.ma)
          .map((nd) => ({ ma: nd.nhiemVuId, ten: nd.ten, vaiTro: nd.donViPhanBo }));

      default:
        return null;
    }
  });

  readonly cotThamChieu = computed(() => {
    switch (this.loai()) {
      case 'nhan-vien':
        return { ma: 'Mã nhiệm vụ', ten: 'Tên nhiệm vụ', vaiTro: 'Vai trò tham gia' };
      case 'nguon-kinh-phi':
        return { ma: 'Mã nhiệm vụ', ten: 'Nội dung công việc', vaiTro: 'CPNC phê duyệt' };
      default:
        return { ma: 'Mã nhiệm vụ', ten: 'Nội dung công việc', vaiTro: 'Đơn vị phân bổ' };
    }
  });

  nhanNguon(v: string): string {
    return PHAN_NGUON_LABEL[v as PhanNguon] ?? v;
  }

  // ------------------------------------------------------------------ lệnh

  moSua(): void {
    // Form thêm/sửa sống ở trang danh sách; quay về đó kèm mã để người dùng không phải tự tìm lại.
    void this.router.navigate([this.backTo()], { queryParams: { sua: this.banGhi()?.ma } });
  }

  doiHoatDong(): void {
    const row = this.banGhi();
    if (!row) return;
    this.service.doiHoatDong(this.loai(), row.id, !row.hoatDong);
    this.toast.success(
      row.hoatDong
        ? `Đã ngừng hoạt động ${row.ma} — dữ liệu cũ giữ nguyên.`
        : `Đã bật lại ${row.ma}.`,
    );
  }

  xuatExcel(): void {
    const row = this.banGhi();
    if (!row) return;
    exportTableToXls(
      this.thuocTinh(),
      [
        { header: 'Thuộc tính', value: (t) => t.label },
        { header: 'Giá trị', value: (t) => String(t.value) },
      ],
      `${this.loai()}-${row.ma}`,
      `${this.dinhNghia().ten} — ${row.ma}`,
    );
  }
}
