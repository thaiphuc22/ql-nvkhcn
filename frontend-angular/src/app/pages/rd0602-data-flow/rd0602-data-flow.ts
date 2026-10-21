import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzTagModule } from 'ng-zorro-antd/tag';

interface NhomDuLieu {
  stt: number;
  ten: string;
  truong: string[];
  buoc: string;
  chot: string;
}

interface PhaLuong {
  ma: string;
  ten: string;
  buoc: string;
  moTa: string;
}

@Component({
  selector: 'app-rd0602-data-flow',
  imports: [RouterLink, NzButtonModule, NzCardModule, NzIconModule, NzTagModule],
  templateUrl: './rd0602-data-flow.html',
  styleUrl: './rd0602-data-flow.scss',
})
export class Rd0602DataFlowPage {
  readonly phas: PhaLuong[] = [
    {
      ma: 'A',
      ten: 'Khởi tạo',
      buoc: 'B01 → B04',
      moTa: 'Kiểm tra điều kiện; neo Mã nhiệm vụ ↔ Mã SAP trước khi lập hồ sơ quyết toán.',
    },
    {
      ma: 'B',
      ten: 'Lập biểu mẫu & chứng từ',
      buoc: 'B05 → B13',
      moTa: 'Song song: dự toán–chi phí (TCKT), tài sản (PM), mua sắm–HĐ (TTMS), nhân công (PNS).',
    },
    {
      ma: 'C',
      ten: 'Thẩm định & ký trong VHT',
      buoc: 'B14 → B24',
      moTa: 'Đối soát chéo số liệu; Báo cáo tổng hợp + Tờ trình; chuỗi ký tới BTGĐ VHT.',
    },
    {
      ma: 'D',
      ten: 'Thẩm định Tập đoàn',
      buoc: 'B25 → B37',
      moTa: 'Công văn đề nghị; Phiếu nhận xét; hoàn thiện đa đơn vị; kết quả thẩm định.',
    },
    {
      ma: 'E',
      ten: 'Phê duyệt & khóa số',
      buoc: 'B38 → B44',
      moTa: 'Báo cáo thẩm tra + QĐ phê duyệt; cập nhật đã quyết toán cấp TĐ; khóa số liệu.',
    },
  ];

  readonly nhoms: NhomDuLieu[] = [
    {
      stt: 1,
      ten: 'Dữ liệu đối soát',
      truong: ['Mã nhiệm vụ KHCN', 'Mã SAP theo nhiệm vụ (IO/WBS)', 'Trạng thái mapping'],
      buoc: 'B02 kiểm tra · B04–B07 gắn số liệu · B14 đối soát',
      chot: 'B43 khóa theo cặp mã đã chốt',
    },
    {
      stt: 2,
      ten: 'Dữ liệu dự toán',
      truong: [
        'Dự toán ban đầu và điều chỉnh',
        'Phiên bản · ngày hiệu lực',
        'Số tiền theo từng khoản mục',
        'Ngày chuyển sang DTMS và KTTC',
      ],
      buoc: 'B07 lập BM3/BM4/BM8 · B14 đối chiếu thực chi với khung dự toán hiệu lực',
      chot: 'B16 / B38 đưa vào báo cáo · B43 khóa phiên bản dự toán đã dùng',
    },
    {
      stt: 3,
      ten: 'Bút toán chi phí',
      truong: [
        'Số chứng từ ghi sổ · Số chứng từ gốc',
        'Nội dung chứng từ · Số tiền',
        'Khoản mục chi phí · Đối tượng chi',
        'Bút toán điều chỉnh hoặc hoàn nhập theo số chứng từ',
      ],
      buoc: 'Đồng bộ SAP → B07 · đối soát B14 / B26 / B35',
      chot: 'B43 khóa bộ bút toán; không xóa lịch sử dòng đã đồng bộ',
    },
    {
      stt: 4,
      ten: 'Hạch toán quỹ KHCN',
      truong: [
        'Số chứng từ ghi sổ · ngày và giá trị hạch toán quỹ',
        'Số phát sinh trên TK 3561.02',
        'Số đã quyết toán quỹ · hoàn quỹ',
        'Nhận / điều chỉnh quỹ',
      ],
      buoc: 'Tập hợp tại nhánh TCKT (B07, B14) · giải trình khi thẩm định TĐ',
      chot: 'B43: quyết toán quỹ + hoàn quỹ + còn lại khớp phát sinh 3561.02',
    },
    {
      stt: 5,
      ten: 'Chứng từ thanh toán',
      truong: [
        'Số chứng từ · ngày thanh toán · đối tượng nhận tiền',
        'Hợp đồng kèm theo · số tiền',
        'Nguồn vốn · phân loại nguồn vốn',
        'Số đầu kỳ · phát sinh trong kỳ · lũy kế',
      ],
      buoc: 'B07 (TCKT) + B11 (BM2) · B14 / B19 đối soát với HĐ',
      chot: 'B43 khóa bảng giải ngân theo kỳ',
    },
    {
      stt: 6,
      ten: 'Hợp đồng và công nợ',
      truong: [
        'Mã / số / ngày hợp đồng · tên đơn vị đối tác',
        'Giá trị thực hiện trước VAT / sau VAT',
        'Số đã thanh toán · số phải thu / phải trả',
        'Ngày thanh toán kế tiếp',
      ],
      buoc: 'B11 lập BM2 · B19 TTMS ký · B32 hoàn thiện nếu TĐ yêu cầu',
      chot: 'Đã TT + phải trả/thu khớp giá trị HĐ và chứng từ thanh toán',
    },
    {
      stt: 7,
      ten: 'Số liệu báo cáo theo kỳ',
      truong: [
        'Chi phí thực hiện và giải ngân theo năm / tháng / kỳ',
        'Đầu kỳ · phát sinh · cuối kỳ',
        'Đã quyết toán · đang thực hiện · hoàn thành chờ quyết toán',
        'Giá trị quỹ đã hình thành · tài sản còn lại',
      ],
      buoc: 'B16 Báo cáo tổng hợp VHT · B38 Báo cáo thẩm tra TĐ',
      chot: 'B43–B44 khóa số liệu; sửa sau chốt phải qua hồ sơ điều chỉnh',
    },
  ];
}
