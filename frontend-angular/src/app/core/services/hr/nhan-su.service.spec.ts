import { TestBed } from '@angular/core/testing';

import { nhanSuVuotPhanBo, tinhTongPhanBo, type NhanSuNhiemVu } from '../../models/hr/nhan-su';
import { NhanSuService } from './nhan-su.service';

/**
 * Hai quy tắc của phân hệ Quản lý chi phí nhân công mà kế hoạch ghi rõ "không được làm hời hợt":
 * ràng buộc tổng tỷ lệ dự kiến ≤ 100% và luồng import có soát lỗi từng dòng. Cả hai đều là logic
 * thuần, kiểm được không cần dựng UI.
 *
 * Sau bản hiệu chỉnh theo tài liệu khách, `tyLePhanBo` là **trường tham khảo, có thể bỏ trống**
 * (BM1 không có cột này) ⇒ có test riêng cho trường hợp trống, vì đó mới là hình dạng dữ liệu thật.
 */
function dong(patch: Partial<NhanSuNhiemVu>): NhanSuNhiemVu {
  return {
    id: 'x',
    maNhanVien: 'NV004',
    hoTen: 'Trần Văn Nam',
    email: 'pm@example.com',
    donVi: 'Trung tâm Nghiên cứu',
    chucDanh: 'PM',
    nhiemVuId: 'NV-2024-001',
    vaiTroThamGia: 'Thành viên',
    noiDungCongViecIds: [],
    tyLePhanBo: 50,
    tuNgay: '2026-01-01',
    denNgay: '2026-12-31',
    trangThaiDuyet: 'DA_DUYET',
    ghiChu: '',
    lichSu: [],
    ...patch,
  };
}

describe('ràng buộc tỷ lệ phân bổ nhân công', () => {
  it('chỉ cộng các dòng CHỒNG LẤN KỲ của cùng một người', () => {
    const rows = [
      dong({ id: 'a', tyLePhanBo: 70, tuNgay: '2026-01-01', denNgay: '2026-06-30' }),
      dong({ id: 'b', tyLePhanBo: 60, tuNgay: '2026-07-01', denNgay: '2026-12-31' }),
    ];

    // Hai kỳ rời nhau — mỗi kỳ chỉ thấy chính nó, không ai vượt.
    expect(tinhTongPhanBo(rows, 'NV004', rows[0])).toBe(70);
    expect(nhanSuVuotPhanBo(rows).size).toBe(0);
  });

  it('phát hiện vượt 100% khi hai phân công chồng kỳ', () => {
    const rows = [dong({ id: 'a', tyLePhanBo: 70 }), dong({ id: 'b', tyLePhanBo: 50, nhiemVuId: 'NV-2026-007' })];

    expect(tinhTongPhanBo(rows, 'NV004', rows[0])).toBe(120);
    expect([...nhanSuVuotPhanBo(rows)]).toEqual(['NV004']);
  });

  it('không tính dòng đã bị từ chối, và bỏ qua được dòng đang sửa', () => {
    const rows = [
      dong({ id: 'a', tyLePhanBo: 70 }),
      dong({ id: 'b', tyLePhanBo: 50, trangThaiDuyet: 'TU_CHOI' }),
    ];

    expect(tinhTongPhanBo(rows, 'NV004', rows[0])).toBe(70);
    // Màn sửa dòng 'a' phải thấy tổng của NHỮNG DÒNG KHÁC là 0, chứ không tự cộng chính nó.
    expect(tinhTongPhanBo(rows, 'NV004', rows[0], 'a')).toBe(0);
  });

  it('dòng bỏ trống tỷ lệ tính là 0, không phải NaN', () => {
    const rows = [
      dong({ id: 'a', tyLePhanBo: undefined }),
      dong({ id: 'b', tyLePhanBo: 40, nhiemVuId: 'NV-2026-007' }),
    ];

    expect(tinhTongPhanBo(rows, 'NV004', rows[0])).toBe(40);
    expect(nhanSuVuotPhanBo(rows).size).toBe(0);
  });
});

describe('NhanSuService — luồng import', () => {
  let service: NhanSuService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(NhanSuService);
  });

  it('đọc file CSV có dòng tiêu đề', () => {
    const raws = service.docFileImport(
      'maNhanVien,hoTen,email,maNhiemVu,vaiTro,tyLePhanBo,tuNgay,denNgay,ghiChu\r\n' +
        'NV012,Hoàng Minh Đức,hdtd@example.com,NV-2026-003,Thành viên,20,2026-09-01,2027-08-31,\r\n',
    );

    expect(raws.length).toBe(1);
    expect(raws[0].maNhanVien).toBe('NV012');
    expect(raws[0].nhiemVuId).toBe('NV-2026-003');
  });

  it('chấm điểm từng dòng và nêu rõ nguyên nhân thay vì bỏ im lặng', () => {
    const raws = service.docFileImport(
      [
        'maNhanVien,hoTen,email,maNhiemVu,vaiTro,tyLePhanBo,tuNgay,denNgay,ghiChu',
        'NV012,Hoàng Minh Đức,hdtd@example.com,NV-2026-003,Thành viên,20,2026-09-01,2027-08-31,',
        ',Thiếu mã,email-sai,NV-2024-001,Thành viên,10,2026-01-01,2026-12-31,',
        'NV013,Vũ Ngọc Toàn,btgdtd@example.com,NV-KHONG-CO,Thành viên,10,2026-01-01,2026-12-31,',
        'NV004,Trần Văn Nam,pm@example.com,PO-92166,Thành viên,60,2026-01-01,2026-12-31,',
      ].join('\n'),
    );
    const preview = service.phanTichFileImport(raws);

    expect(preview.length).toBe(4);
    expect(preview[0].hopLe).toBe(true);

    expect(preview[1].hopLe).toBe(false);
    expect(preview[1].loi).toContain('Thiếu mã nhân viên.');
    expect(preview[1].loi.some((m) => m.includes('không hợp lệ'))).toBe(true);

    expect(preview[2].loi).toContain('Nhiệm vụ NV-KHONG-CO không tồn tại.');

    // NV004 đã có 70% + 50% chồng kỳ trong seed → thêm 60% nữa là vượt.
    expect(preview[3].hopLe).toBe(false);
    expect(preview[3].loi.some((m) => m.includes('> 100%'))).toBe(true);
  });

  it('bỏ trống tỷ lệ là HỢP LỆ — BM1 không có cột này', () => {
    const raws = service.docFileImport(
      [
        'maNhanVien,hoTen,email,maNhiemVu,vaiTro,tyLePhanBo,tuNgay,denNgay,ghiChu',
        'NV012,Hoàng Minh Đức,hdtd@example.com,NV-2026-003,Thành viên,,2026-09-01,2027-08-31,',
      ].join('\n'),
    );
    const preview = service.phanTichFileImport(raws);

    expect(preview[0].hopLe).toBe(true);
    expect(service.importRows(preview, 'tester')).toBe(1);
    expect(service.list()[0].tyLePhanBo).toBeUndefined();
  });

  it('cộng dồn trong nội bộ file — 3 dòng 40% của cùng một người thì dòng thứ ba bị chặn', () => {
    const raws = service.docFileImport(
      [
        'maNhanVien,hoTen,email,maNhiemVu,vaiTro,tyLePhanBo,tuNgay,denNgay,ghiChu',
        'NV012,Hoàng Minh Đức,hdtd@example.com,NV-2024-001,Thành viên,40,2026-01-01,2026-12-31,',
        'NV012,Hoàng Minh Đức,hdtd@example.com,PO-92166,Thành viên,40,2026-01-01,2026-12-31,',
        'NV012,Hoàng Minh Đức,hdtd@example.com,NV-2026-003,Thành viên,40,2026-01-01,2026-12-31,',
      ].join('\n'),
    );
    const preview = service.phanTichFileImport(raws);

    expect(preview.map((p) => p.hopLe)).toEqual([true, true, false]);
    expect(preview[2].loi.some((m) => m.includes('120%'))).toBe(true);
  });

  it('chặn dòng trùng trong cùng file và dòng đã có sẵn trong nhiệm vụ', () => {
    const raws = service.docFileImport(
      [
        'maNhanVien,hoTen,email,maNhiemVu,vaiTro,tyLePhanBo,tuNgay,denNgay,ghiChu',
        'NV012,Hoàng Minh Đức,hdtd@example.com,NV-2026-003,Thành viên,10,2026-09-01,2027-08-31,',
        'NV012,Hoàng Minh Đức,hdtd@example.com,NV-2026-003,Thành viên,10,2026-09-01,2027-08-31,',
        'NV006,Vũ Thành Long,qlkhcn@example.com,NV-2026-003,Thành viên,10,2026-09-01,2027-08-31,',
      ].join('\n'),
    );
    const preview = service.phanTichFileImport(raws);

    expect(preview[1].loi).toContain('Trùng với một dòng khác trong cùng file.');
    expect(preview[2].loi).toContain('Nhân sự này đã có trong nhiệm vụ.');
  });

  it('chỉ ghi dòng hợp lệ, số dòng còn lại đúng như preview báo', () => {
    const truoc = service.list().length;
    const raws = service.docFileImport(
      [
        'maNhanVien,hoTen,email,maNhiemVu,vaiTro,tyLePhanBo,tuNgay,denNgay,ghiChu',
        'NV012,Hoàng Minh Đức,hdtd@example.com,NV-2026-003,Thành viên,20,2026-09-01,2027-08-31,',
        ',Thiếu mã,email-sai,NV-2024-001,Thành viên,10,2026-01-01,2026-12-31,',
      ].join('\n'),
    );
    const preview = service.phanTichFileImport(raws);

    expect(service.importRows(preview, 'tester')).toBe(1);
    expect(service.list().length).toBe(truoc + 1);
    expect(service.list()[0].trangThaiDuyet).toBe('NHAP');
    expect(service.list()[0].lichSu[0].hanhDong).toBe('Nhập từ file');
  });
});
