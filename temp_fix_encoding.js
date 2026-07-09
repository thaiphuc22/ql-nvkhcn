const fs = require('fs');
const path = 'c:/Users/phuctd7/ql-nvkhcn/webapp/src/pages/ServiceTaskConfig.tsx';

// Read as Latin-1 to preserve all bytes
let s = fs.readFileSync(path, 'latin1');

// Map of garbled patterns → correct Vietnamese
// These are the specific garbled forms found in the current file state
const fixes = [
  // Tab labels
  ["'Tï¿½\"ng quan'", "'Tổng quan'"],
  ["'Cáº¥u hÃ¬nh',", "'Cấu hình',"],
  ["'Ä¿½\u0018i soÃ¡t BPMN'", "'Đối soát BPMN'"],
  ["'Kiá»m thá»'", "'Kiểm thử'"],
  ["'Log thï¿½c thi'", "'Log thực thi'"],
  ["'Phiï¿½n bï¿½n & audit'", "'Phiên bản & audit'"],
  
  // Breadcrumb / PageHeader
  ["'Há»‡ thá»‘ng QTKHCN'", "'Hệ thống QTKHCN'"],
  ["'Quáº£n trá»‹ quy trÃ¬nh'", "'Quản trị quy trình'"],
  ["'Cáº¥u hÃ¬nh Service Task'", "'Cấu hình Service Task'"],
  
  // Card titles
  ["'Cáº§n chÃº Ã½'", "'Cần chú ý'"],
  
  // Column titles
  ["title: 'MÃ£',", "title: 'Mã',"],
  ["title: 'TÃªn',", "title: 'Tên',"],
  ["title: 'Loáº¡i',", "title: 'Loại',"],
  ["title: 'Tráº¡ng thÃ¡i',", "title: 'Trạng thái',"],
  ["title: 'Thao tÃ¡c',", "title: 'Thao tác',"],
  ["title: 'Cáº­p nháº­t',", "title: 'Cập nhật',"],
  ["title: 'Incident má»Ÿ',", "title: 'Incident mở',"],
  ["title: 'Success 7 ngÃ y',", "title: 'Success 7 ngày',"],
  
  // Filter placeholders
  ["'Loáº¡i'", "'Loại'"],
  ["'Tráº¡ng thÃ¡i'", "'Trạng thái'"],
  ["'Quy trÃ¬nh'", "'Quy trình'"],
  
  // Filter options
  ["'CÃ³ incident'", "'Có incident'"],
  ["'KhÃ´ng incident'", "'Không incident'"],
  
  // Button text
  [">Sá»­a<", ">Sửa<"],
  ["'Táº¡o cáº¥u hÃ¬nh'", "'Tạo cấu hình'"],
  ["'Sá»­a cáº¥u hÃ¬nh Service Task'", "'Sửa cấu hình Service Task'"],
  ["'Táº¡o cáº¥u hÃ¬nh Service Task'", "'Tạo cấu hình Service Task'"],
  
  // Status meta labels (in SERVICE_TASK_STATUS_META usage)
  ["label: 'NhÃ¡p'", "label: 'Nháp'"],
  ["label: 'Sáºµn sÃ ng'", "label: 'Sẵn sàng'"],
  ["label: 'Äang dÃ¹ng'", "label: 'Đang dùng'"],
  ["label: 'Ngá»«ng dÃ¹ng'", "label: 'Ngừng dùng'"],
  ["label: 'CÃ³ lá»—i'", "label: 'Có lỗi'"],
  
  // Messages
  ["'ChÆ°a cÃ³ version Ä‘á»ƒ validate.'", "'Chưa có version để validate.'"],
  ["'Cáº¥u hÃ¬nh há»£p lá»‡, Ä‘Ã£ chuyá»ƒn tráº¡ng thÃ¡i sáºµn sÃ ng.'", "'Cấu hình hợp lệ, đã chuyển trạng thái sẵn sàng.'"],
  ["'Cáº¥u hÃ¬nh chÆ°a há»£p lá»‡'", "'Cấu hình chưa hợp lệ'"],
  ["'ChÆ°a cÃ³ version Ä‘á»ƒ active.'", "'Chưa có version để active.'"],
  ["'ÄÃ£ active version", "'Đã active version"],
  ["'KhÃ´ng thá»ƒ active do cáº¥u hÃ¬nh chÆ°a há»£p lá»‡.'", "'Không thể active do cấu hình chưa hợp lệ.'"],
  ["'ÄÃ£ táº¡o báº£n sao cáº¥u hÃ¬nh.'", "'Đã tạo bản sao cấu hình.'"],
  ["'Active tá»« mÃ n cáº¥u hÃ¬nh.'", "'Active từ màn cấu hình.'"],
  
  // Binding column text
  ["'ChÆ°a gáº¯n'", "'Chưa gắn'"],
  
  // Execution status labels (already fixed? check)
  
  // Miscellaneous
  ["'Sá»­a'", "'Sửa'"],
];

let count = 0;
for (const [garbled, correct] of fixes) {
  const before = s;
  s = s.split(garbled).join(correct);
  if (s !== before) {
    count++;
    console.log('Fixed:', garbled.substring(0, 50));
  }
}

// Write as UTF-8
fs.writeFileSync(path, s, 'utf8');
console.log(`\nTotal fixes applied: ${count}`);
console.log('Done.');
