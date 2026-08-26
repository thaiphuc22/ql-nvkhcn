import { Observable, of } from 'rxjs';

import { TranslateLoader, TranslationObject } from '@ngx-translate/core';

/**
 * Từ điển tiếng Việt cho **phần chữ nằm bên trong `@khcn-core/ui`**.
 *
 * ## Vì sao bắt buộc phải có
 *
 * `@khcn-core/ui` khai `@ngx-translate/core` là **peer bắt buộc** và dùng pipe `| translate` ở 61
 * chỗ — phân trang, hộp nhập file, khối upload, khung tải xuống. Không cấp từ điển thì ngx-translate
 * trả về **chính cái khoá**: chân bảng sẽ hiện đúng chữ `PAGINATOR.SHOW` thay vì
 * *"Hiển thị bản ghi/trang"*. Không có lỗi console, không có build đỏ — chỉ là chữ sai trên màn.
 *
 * Danh sách khoá dưới đây là **toàn bộ** khoá thư viện dùng, quét từ
 * `UI-ubck/ui-0.0.1-v21/package/fesm2022/khcn-core-ui.mjs` ngày 2026-08-26. Khi nâng cấp package,
 * quét lại bằng `grep -o "'[A-Z][A-Z_]*\.[A-Z_.]*'"` và bổ sung khoá mới.
 *
 * Nhóm `IMPORT.*` chép nguyên từ hằng `IMPORT_TRANSLATIONS_VI` mà chính thư viện xuất ra (bản thân
 * nó có chú thích *"COPY VÀO FILE public/translate/vi.json"*). Chép chứ không `import` hằng đó: gộp
 * mọi khoá vào một chỗ để người sau đọc một file là thấy đủ, và tránh phụ thuộc vào một hằng có thể
 * biến mất giữa hai phiên bản.
 *
 * ## Vì sao là loader tĩnh trong mã, không phải `public/i18n/vi.json`
 *
 * Ứng dụng **chỉ có một ngôn ngữ**. Tải một file JSON qua HTTP chỉ để lấy 35 dòng chữ cố định là
 * thêm một request có thể hỏng (404 lúc triển khai dưới thư mục con) đổi lấy đúng con số 0 lợi ích.
 * Cần đa ngữ thì đổi `KhcnCoreTranslateLoader` sang `TranslateHttpLoader`, phần còn lại giữ nguyên.
 */
export const KHCN_CORE_VI: TranslationObject = {
  PAGINATOR: {
    // `{{count}}` / `{{page}}` là tham số ngx-translate — thư viện truyền vào qua
    // `translate: { count: ... }`. Đổi tên tham số là mất số, chỉ còn cái ngoặc rỗng.
    ALL_RECORDS: 'Tổng số bản ghi: {{count}}',
    SHOW: 'Hiển thị bản ghi/trang:',
    PAGE: '{{page}}',
  },

  IMPORT: {
    TEMPLATE: { INSTRUCTION: 'Để có kết quả nhập khẩu chính xác, hãy sử dụng tệp mẫu' },
    DOWNLOAD: { TEMPLATE: 'Tải tệp mẫu' },
    RECORD: { INSTRUCTION: 'Mỗi dòng dữ liệu trong tệp nhập khẩu tương ứng với 1 bản ghi.' },
    BUTTON: {
      CLOSE: 'Đóng',
      CONTINUE: 'Tiếp tục',
      CHOOSE_ANOTHER: 'Chọn tệp khác',
    },
    FILE: {
      INPROGRESS: { TITLE: 'Đang tải file...' },
      SUCCESS: { TITLE: 'Tải file thành công' },
    },
    SUCCESS: { MESSAGE: 'Nhập dữ liệu thành công' },
    REPORT: {
      TITLE: 'Kết quả tải lên tệp tin',
      SUCCESS: { COUNT: 'Số bản ghi thành công:' },
      FAILURE: { COUNT: 'Số bản ghi thất bại:' },
      DOWNLOAD: {
        DESCRIPTION:
          'Tải tệp tin về để xem thông tin chi tiết, nguyên nhân về kết quả tải lên tập tin',
      },
    },
    ERROR: {
      SUMMARY: 'Lỗi tải file',
      FILE: {
        SIZE: 'File quá lớn. Giới hạn tối đa 5MB.',
        LIMIT: 'Số lượng file vượt quá giới hạn cho phép.',
        TYPE: {
          XLSX: 'File tải lên không đúng định dạng .xlsx. Bạn vui lòng kiểm tra lại.',
          GENERIC: 'File tải lên không đúng định dạng. Bạn vui lòng kiểm tra lại.',
        },
      },
    },
  },

  COMMON: {
    UPLOAD: {
      ACTION: 'Kéo thả tệp vào đây',
      OR: 'hoặc',
      BROWSE_LABEL: 'Chọn từ máy',
      MAX_SIZE: 'Dung lượng tối đa',
      EACH_FILE: 'mỗi tệp',
      REGULATIONS: { FILE_TYPE: 'Định dạng cho phép' },
      WRONG: { FORMAT: 'Tệp không đúng định dạng cho phép.' },
    },
  },

  DOWNLOAD: {
    TITLE: 'Tải xuống',
    SUBTITLE: 'Danh sách tệp đang tải',
    PREPARING: 'Đang chuẩn bị...',
    WAITING: 'Đang chờ',
    PAUSE: 'Tạm dừng',
    RESUME: 'Tiếp tục',
    CANCEL: 'Huỷ',
    RETRY: 'Thử lại',
  },
};

/**
 * Loader tĩnh: trả thẳng `KHCN_CORE_VI` cho mọi mã ngôn ngữ.
 *
 * Trả cho **mọi** mã chứ không riêng `'vi'` là có chủ ý — nếu chỗ nào lỡ đặt ngôn ngữ khác thì vẫn
 * ra chữ tiếng Việt đọc được, thay vì trơ ra khoá.
 */
export class KhcnCoreTranslateLoader extends TranslateLoader {
  override getTranslation(): Observable<TranslationObject> {
    return of(KHCN_CORE_VI);
  }
}
