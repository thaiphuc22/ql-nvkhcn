import type { NzUploadFile } from 'ng-zorro-antd/upload';

/**
 * Lấy `File` gốc từ đối tượng của `nz-upload`. ng-zorro có lúc gói file trong `originFileObj`, có
 * lúc đưa thẳng `File` (tuỳ phiên bản và tuỳ hook) — nên phải thử cả hai; đoán một chiều là gặp
 * `undefined` ở đúng lần người dùng chọn file thật.
 *
 * Đặt ở `core/utils` vì hiện có hai màn dùng chung: nhập BPMN (`/quy-trinh`) và nhập nhân sự đề
 * tài (`/hr/nhan-su`). Trước đây hàm này nằm trong `pages/process-catalog/process-catalog.ts`.
 */
export function nativeUploadFile(upload: NzUploadFile): File | null {
  if (upload.originFileObj instanceof File) return upload.originFileObj;
  return upload instanceof File ? upload : null;
}
