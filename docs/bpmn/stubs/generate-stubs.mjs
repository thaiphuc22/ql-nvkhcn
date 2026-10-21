/**
 * Sinh stub BPMN Zeebe (linear user tasks) từ danh sách luồng ưu tiên.
 * Không deploy Camunda — chỉ artifact để import thủ công / review.
 *
 * Chạy: node docs/bpmn/stubs/generate-stubs.mjs
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/** @type {{ ma: string; ten: string; groups: string[]; steps: string[] }[]} */
const STUBS = [
  {
    ma: 'RD03.06',
    ten: 'Báo cáo tiến độ thực hiện đề tài',
    groups: ['PM', 'CQ_KHCN', 'BGD_TT', 'CQNV_VHT', 'BTGD_VHT'],
    steps: [
      'Khởi tạo / cập nhật báo cáo tiến độ',
      'CQ nhận xét / ký',
      'BGĐ TT/Khối ký duyệt',
      'CQNV VHT ký duyệt',
      'BTGĐ phê duyệt Báo cáo',
    ],
  },
  {
    ma: 'RD05.01',
    ten: 'Nghiệm thu NV KHCN cấp Cơ sở',
    groups: ['PM', 'BGD_TT', 'CQ_KHCN', 'HDNT', 'TGD'],
    steps: [
      'PM lập & trình HS nghiệm thu',
      'BGĐ ký duyệt HS',
      'CQ lập QĐ TL HĐNT',
      'HĐNT đánh giá phiên 1–2',
      'TGĐ phê duyệt QĐ công nhận KQ',
    ],
  },
  {
    ma: 'RD06.01',
    ten: 'Quyết toán NV KHCN cấp Cơ sở',
    groups: ['PM', 'TCKT', 'CQ_KHCN', 'CQNV_VHT', 'BTGD_VHT'],
    steps: [
      'PM khởi tạo HS QT + neo mã SAP',
      'TCKT đối soát số liệu / lập BC',
      'CQ nhận xét',
      'CQNV thẩm định',
      'BTGĐ/TGĐ phê duyệt BC QT',
    ],
  },
  {
    ma: 'RD06.02',
    ten: 'Quyết toán NV KHCN cấp Tập đoàn',
    groups: ['PM', 'TCKT', 'CQNV_VHT', 'CQ_KHCN_TD', 'BTGD_TD'],
    steps: [
      'Khởi tạo & neo mã NV–SAP',
      'Lập BM & chứng từ đa đơn vị',
      'Thẩm định & ký trong VHT',
      'CQ KHCN TĐ thẩm định',
      'BTGĐ TĐ phê duyệt & khóa số',
    ],
  },
  {
    ma: 'RD07',
    ten: 'Quản lý Danh mục SPDV',
    groups: ['QLDM_SPDV', 'TT_KD_VHT', 'TTNCSP', 'TCKT'],
    steps: [
      'Cập nhật DM đầu năm',
      'Gửi yêu cầu cập nhật quý',
      'TT KD / TTNCSP / TCKT cập nhật song song',
      'Tổng hợp & xác thực căn cứ',
      'Cập nhật DM Quý N',
    ],
  },
  {
    ma: 'RD08',
    ten: 'Quản lý sở hữu trí tuệ',
    groups: ['PM', 'BGD_TT', 'CQ_KHCN', 'PHAP_CHE', 'BTGD_VHT'],
    steps: [
      'PM/tác giả tạo HS SHTT',
      'BGĐ xác nhận đơn vị / tỷ lệ quyền',
      'CQ KHCN thẩm định',
      'Pháp chế rà hồ sơ nộp đơn',
      'BTGĐ phê duyệt trình nộp',
    ],
  },
  {
    ma: 'RD10',
    ten: 'Khai báo cấu hình lưu trữ tài liệu',
    groups: ['PM', 'BGD_TT', 'BGD_KHOI', 'CNTT'],
    steps: [
      'PM lập phiếu PYC',
      'BGĐ TT thẩm định',
      'BGĐ Khối phê duyệt',
      'P.CNTT khai báo phân vùng',
    ],
  },
];

function processId(ma) {
  return ma.replace(/\./g, '_');
}

function esc(s) {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;');
}

function buildBpmn(stub) {
  const pid = processId(stub.ma);
  const n = stub.steps.length;
  const tasks = stub.steps
    .map((name, i) => {
      const id = `Task_${i + 1}`;
      const group = stub.groups[Math.min(i, stub.groups.length - 1)];
      const prev = i === 0 ? `Start_${pid}` : `Task_${i}`;
      const next = i === n - 1 ? `End_${pid}` : `Task_${i + 2}`;
      return `
    <bpmn:userTask id="${id}" name="${esc(`${i + 1}. ${name}`)}">
      <bpmn:extensionElements>
        <zeebe:assignmentDefinition candidateGroups="${group}" />
      </bpmn:extensionElements>
      <bpmn:incoming>Flow_${i}</bpmn:incoming>
      <bpmn:outgoing>Flow_${i + 1}</bpmn:outgoing>
    </bpmn:userTask>`;
    })
    .join('\n');

  const flows = [
    `<bpmn:sequenceFlow id="Flow_0" sourceRef="Start_${pid}" targetRef="Task_1" />`,
    ...stub.steps.map((_, i) => {
      const src = `Task_${i + 1}`;
      const tgt = i === n - 1 ? `End_${pid}` : `Task_${i + 2}`;
      return `<bpmn:sequenceFlow id="Flow_${i + 1}" sourceRef="${src}" targetRef="${tgt}" />`;
    }),
  ].join('\n    ');

  return `<?xml version="1.0" encoding="UTF-8"?>
<!--
  STUB BPMN — ${stub.ma} ${stub.ten}
  Sinh tự động ${new Date().toISOString().slice(0, 10)}.
  Linear user-task skeleton + candidateGroups tạm (khảo sát BA).
  KHÔNG phải bản baseline ký duyệt / production. Import thủ công vào Zeebe khi sẵn sàng.
-->
<bpmn:definitions xmlns:bpmn="http://www.omg.org/spec/BPMN/20100524/MODEL"
  xmlns:zeebe="http://camunda.org/schema/zeebe/1.0"
  id="Definitions_${pid}" targetNamespace="http://vht.vn/qtkhcn/bpmn/stubs">
  <bpmn:process id="${pid}" name="${esc(stub.ten)}" isExecutable="true">
    <bpmn:startEvent id="Start_${pid}" name="Bắt đầu">
      <bpmn:outgoing>Flow_0</bpmn:outgoing>
    </bpmn:startEvent>
${tasks}
    <bpmn:endEvent id="End_${pid}" name="Kết thúc">
      <bpmn:incoming>Flow_${n}</bpmn:incoming>
    </bpmn:endEvent>
    ${flows}
  </bpmn:process>
</bpmn:definitions>
`;
}

const outDir = __dirname;
const manifest = [];

for (const stub of STUBS) {
  const file = `${processId(stub.ma).toLowerCase()}-stub.bpmn`;
  const full = path.join(outDir, file);
  fs.writeFileSync(full, buildBpmn(stub), 'utf8');
  manifest.push({ ma: stub.ma, file, bpmnProcessId: processId(stub.ma), steps: stub.steps.length });
  console.log('wrote', file);
}

fs.writeFileSync(path.join(outDir, 'manifest.json'), JSON.stringify({ generatedAt: new Date().toISOString(), items: manifest }, null, 2));
console.log('manifest.json —', manifest.length, 'stubs');
