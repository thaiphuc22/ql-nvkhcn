import { useState, useEffect, useMemo } from 'react';
import {
  Layout,
  Typography,
  Collapse,
  Card,
  Tag,
  Divider,
  Input,
  Alert,
  Steps,
  Table,
  Image,
  Empty,
} from 'antd';
import {
  ApiOutlined,
  ApartmentOutlined,
  AppstoreOutlined,
  BookOutlined,
  CarryOutOutlined,
  ClusterOutlined,
  ControlOutlined,
  DashboardOutlined,
  ExperimentOutlined,
  FileTextOutlined,
  FormOutlined,
  HistoryOutlined,
  KeyOutlined,
  NodeIndexOutlined,
  PartitionOutlined,
  QuestionCircleOutlined,
  SafetyCertificateOutlined,
  SafetyOutlined,
  SearchOutlined,
  SolutionOutlined,
  SyncOutlined,
  TeamOutlined,
  ThunderboltOutlined,
} from '@ant-design/icons';
import { useSearchParams, useNavigate } from 'react-router-dom';
import type { ReactNode } from 'react';

const { Title, Text, Paragraph } = Typography;
const { Sider, Content } = Layout;

// ─── types ──────────────────────────────────────────────────────────────────
interface HelpSection {
  key: string;
  icon: ReactNode;
  label: string;
  content: () => ReactNode;
  category: string;
}

// ─── dữ liệu sections ────────────────────────────────────────────────────────

function OverviewContent() {
  return (
    <div>
      <Title level={3}><ExperimentOutlined style={{ color: '#bf0027' }} /> Tổng quan hệ thống QTKHCN</Title>
      <Paragraph>
        Hệ thống <Text strong>Quản trị Khoa học Công nghệ (QTKHCN)</Text> là nền tảng số hoá toàn trình
        các quy trình nghiệp vụ KHCN tại Viettel High Tech (VHT), thay thế hồ sơ giấy và thao tác đa hệ
        thống bằng một luồng số xuyên suốt.
      </Paragraph>

      <Card title="Vòng đời một Nhiệm vụ KHCN" style={{ marginBottom: 16 }}>
        <Steps
          direction="vertical"
          current={-1}
          size="small"
          items={[
            { title: 'RD01 — Xét duyệt Chủ trương', description: 'Khởi tạo → Phê duyệt QĐ chủ trương (Cơ sở / Tập đoàn)' },
            { title: 'RD02 — Xét duyệt NV KHCN', description: 'Kế thừa chủ trương → Hội đồng xét duyệt → Phê duyệt mở mới đề tài' },
            { title: 'RD03 — Thực hiện NV KHCN', description: 'Quản lý nhân sự, mua sắm, chi phí, tài sản, nội dung nghiên cứu' },
            { title: 'RD04 — Điều chỉnh NV KHCN', description: '10 luồng điều chỉnh: chủ nhiệm, nội dung, mục tiêu, tạm dừng…' },
            { title: 'RD05 — Nghiệm thu', description: 'Hội đồng nghiệm thu đánh giá → Công nhận kết quả' },
            { title: 'RD06 — Quyết toán', description: 'Lập & phê duyệt báo cáo quyết toán chi phí' },
          ]}
        />
      </Card>

      <RowSection title="Kiến trúc tổng thể">
        <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
          <FeatureCard
            icon={<NodeIndexOutlined />}
            title="Camunda 8 Engine"
            desc="Điều phối luồng phê duyệt: BPMN, DMN, worklist, SLA, audit. Giữ dữ liệu định tuyến, không giữ dữ liệu nghiệp vụ."
          />
          <FeatureCard
            icon={<FileTextOutlined />}
            title="Ứng dụng nghiệp vụ"
            desc="Quản lý hồ sơ, biểu mẫu, dự toán, chữ ký số. Gọi Camunda qua backend job worker."
          />
          <FeatureCard
            icon={<SafetyOutlined />}
            title="Phân quyền (RBAC)"
            desc="26 mã vai trò làm candidateGroup Camunda. Fail-closed: không có quyền = không thao tác."
          />
          <FeatureCard
            icon={<ApiOutlined />}
            title="Tích hợp 5 hệ thống"
            desc="Kết nối QLNS, MS, SAP, QLTS, PLM — đồng bộ dữ liệu nhân sự, tài chính, tài sản."
          />
        </div>
      </RowSection>
    </div>
  );
}

function DashboardContent() {
  return (
    <div>
      <Title level={3}><DashboardOutlined style={{ color: '#bf0027' }} /> Tổng quan</Title>
      <Paragraph>Trang Tổng quan (Dashboard) hiển thị các chỉ số thống kê tổng hợp giúp người dùng nắm bắt nhanh tình hình nhiệm vụ KHCN.</Paragraph>

      <SectionBlock title="Các thông số hiển thị">
        <ul>
          <li><Text strong>Tổng số NV KHCN:</Text> toàn bộ nhiệm vụ trong hệ thống, phân theo trạng thái (Đang thực hiện / Đang xử lý / Đã hoàn thành).</li>
          <li><Text strong>Hồ sơ chờ xử lý:</Text> số hồ sơ đến lượt người dùng xử lý.</li>
          <li><Text strong>Tiến độ:</Text> biểu đồ tổng quan tiến độ các đề tài đang triển khai.</li>
          <li><Text strong>Thông báo:</Text> các cảnh báo quá hạn, hồ sơ mới được giao.</li>
        </ul>
      </SectionBlock>

      <SectionBlock title="Thao tác chính">
        <ul>
          <li>Nhấn vào thẻ số liệu để xem chi tiết danh sách.</li>
          <li>Tại mục "Việc cần làm" — các hồ sơ đang chờ xử lý được liệt kê để truy cập nhanh.</li>
        </ul>
      </SectionBlock>
    </div>
  );
}

function WorklistContent() {
  return (
    <div>
      <Title level={3}><CarryOutOutlined style={{ color: '#bf0027' }} /> Việc của tôi</Title>
      <Paragraph>Danh sách các hồ sơ / công việc đang chờ người dùng xử lý, được phân loại theo quy trình và mức độ ưu tiên.</Paragraph>

      <SectionBlock title="Chức năng chính">
        <ul>
          <li><Text strong>Danh sách việc:</Text> hiển thị các hồ sơ đến lượt xử lý, kèm thông tin: mã hồ sơ, quy trình, bước hiện tại, hạn xử lý, người gửi.</li>
          <li><Text strong>Lọc & Tìm kiếm:</Text> lọc theo quy trình, trạng thái, khoảng thời gian. Tìm kiếm theo mã hồ sơ / tiêu đề.</li>
          <li><Text strong>Xử lý:</Text> nhấn vào hồ sơ để mở trang chi tiết và thực hiện các thao tác phê duyệt / góp ý / từ chối.</li>
          <li><Text strong>Badge số lượng:</Text> menu trái hiển thị số lượng việc đang chờ (real-time).</li>
        </ul>
      </SectionBlock>

      <Alert
        type="info"
        showIcon
        message="Mẹo"
        description="Bạn nên kiểm tra 'Việc của tôi' đầu mỗi ngày làm việc để không bỏ lỡ hồ sơ đến hạn."
        style={{ marginTop: 12 }}
      />
    </div>
  );
}

function NhiemVuContent() {
  return (
    <div>
      <Title level={3}><ExperimentOutlined style={{ color: '#bf0027' }} /> Nhiệm vụ KHCN</Title>

      {/* ── Tổng quan ── */}
      <Card size="small" title="Tổng quan chức năng" style={{ marginBottom: 16, borderLeft: '3px solid #bf0027' }}>
        <Paragraph>
          Trang <Text strong>Nhiệm vụ KHCN</Text> quản lý danh sách các Nhiệm vụ Khoa học Công nghệ (đề tài)
          trong toàn bộ vòng đời, từ khởi tạo → phê duyệt → thực hiện → nghiệm thu → quyết toán.
        </Paragraph>
        <ul>
          <li><Text strong>Danh sách NV KHCN:</Text> hiển thị tất cả nhiệm vụ, lọc theo trạng thái / đơn vị / lĩnh vực / năm</li>
          <li><Text strong>Chi tiết NV KHCN:</Text> thông tin chung, vòng đời (timeline), hồ sơ liên quan, sản phẩm</li>
          <li><Text strong>Tạo mới NV KHCN:</Text> khởi tạo nhiệm vụ mới + hồ sơ Chủ trương</li>
        </ul>
      </Card>

      {/* ── Hướng dẫn tạo mới ── */}
      <Title level={4} style={{ marginTop: 24, color: '#bf0027' }}>
        <ExperimentOutlined /> Hướng dẫn tạo Nhiệm vụ KHCN mới
      </Title>
      <Paragraph>
        Tính năng <Text strong>"Tạo Nhiệm vụ KHCN mới"</Text> cho phép <Text strong>Chủ nhiệm đề tài (PM/PA/NNC)</Text>
        khởi tạo một nhiệm vụ khoa học công nghệ. Theo quy trình RD01, khi tạo nhiệm vụ, hệ thống sẽ
        <Text strong> đồng thời khởi tạo hồ sơ Chủ trương</Text> ở trạng thái <Text strong>Khởi tạo</Text> —
        sẵn sàng để trình ký và bắt đầu luồng phê duyệt.
      </Paragraph>

      {/* Ảnh chụp màn hình */}
      <div style={{ marginBottom: 20, textAlign: 'center' }}>
        <Image
          src="/screenshots/nhiemvu-create-form.png"
          alt="Giao diện tạo Nhiệm vụ KHCN mới"
          style={{ border: '1px solid #e6e9ee', borderRadius: 8, maxWidth: '100%' }}
          preview={{ mask: 'Bấm để phóng to' }}
        />
        <div style={{ marginTop: 6 }}>
          <Text type="secondary" style={{ fontSize: 12 }}>
            Hình 1: Giao diện tạo Nhiệm vụ KHCN mới — gồm 2 thẻ thông tin và cụm nút hành động phía dưới
          </Text>
        </div>
      </div>

      {/* Bảng mô tả trường dữ liệu */}
      <SectionBlock title="Mô tả các trường dữ liệu">
        <Table
          size="small"
          bordered
          pagination={false}
          dataSource={[
            { field: 'Tên nhiệm vụ KHCN', required: 'Bắt buộc', type: 'Văn bản (Input)', desc: 'Tên đầy đủ của nhiệm vụ KHCN. VD: "Nghiên cứu, chế tạo module thu phát VHF băng rộng"' },
            { field: 'Cấp', required: 'Bắt buộc', type: 'Dropdown (Select)', desc: 'Phân cấp xử lý: Cơ sở (RD01.01, trong VHT) hoặc Tập đoàn (RD01.02, trình lên Viettel Group)' },
            { field: 'Mã NV KHCN (tạm cấp)', required: 'Tự động', type: 'Chỉ đọc (Disabled)', desc: 'Mã dự kiến do hệ thống cấp, VD: RD.2026.032. Quy tắc cấp mã chính thức đang chờ xác nhận.' },
            { field: 'Đơn vị chủ trì', required: 'Bắt buộc', type: 'Văn bản (Input)', desc: 'Đơn vị chịu trách nhiệm chính thực hiện đề tài. VD: "TT Nghiên cứu Vô tuyến"' },
            { field: 'Thời gian thực hiện', required: 'Bắt buộc', type: 'Khoảng thời gian (RangePicker)', desc: 'Chọn tháng bắt đầu và tháng kết thúc dự kiến của nhiệm vụ.' },
            { field: 'Tổng dự toán (PL1–PL6)', required: 'Bắt buộc', type: 'Số (InputNumber)', desc: 'Tổng dự toán gồm 6 khoản mục (PL1: nhân công, PL2: khấu hao…). Đơn vị: đồng.' },
            { field: 'Học vị', required: 'Không bắt buộc', type: 'Dropdown (Select)', desc: 'Học hàm/học vị của chủ nhiệm (GS.TS / PGS.TS / TS / ThS / KS / CN).' },
            { field: 'Họ tên', required: 'Bắt buộc', type: 'Văn bản (Input)', desc: 'Họ và tên Chủ nhiệm đề tài (PM).' },
            { field: 'Mã nhân viên', required: 'Không bắt buộc', type: 'Văn bản (Input)', desc: 'Mã nhân viên của chủ nhiệm trong hệ thống QLNS.' },
            { field: 'Email', required: 'Không bắt buộc', type: 'Email (Input)', desc: 'Email liên hệ của chủ nhiệm. Có kiểm tra định dạng.' },
            { field: 'Điện thoại', required: 'Không bắt buộc', type: 'Văn bản (Input)', desc: 'Số điện thoại liên hệ.' },
            { field: 'Đơn vị công tác', required: 'Không bắt buộc', type: 'Văn bản (Input)', desc: 'Đơn vị của chủ nhiệm. Nếu để trống, sẽ lấy theo Đơn vị chủ trì.' },
          ]}
          columns={[
            { title: 'Tên trường', dataIndex: 'field', width: 200 },
            { title: 'Bắt buộc', dataIndex: 'required', width: 100 },
            { title: 'Kiểu dữ liệu', dataIndex: 'type', width: 180 },
            { title: 'Mô tả / Hướng dẫn nhập', dataIndex: 'desc' },
          ]}
        />
      </SectionBlock>

      {/* Bảng mô tả nút chức năng */}
      <SectionBlock title="Mô tả các nút chức năng">
        <Table
          size="small"
          bordered
          pagination={false}
          dataSource={[
            { button: '← (Nút quay lại)', location: 'Đầu trang (trái)', action: 'Quay về danh sách Nhiệm vụ KHCN mà không lưu.' },
            { button: '? (Trợ giúp)', location: 'Đầu trang (phải)', action: 'Mở trang Hướng dẫn sử dụng đến mục này.' },
            { button: 'Hủy', location: 'Cuối form (trái)', action: 'Huỷ thao tác, quay về danh sách NV KHCN. Không lưu dữ liệu đã nhập.' },
            { button: 'Tạo nhiệm vụ + hồ sơ Chủ trương', location: 'Cuối form (phải, primary)', action: 'Lưu nhiệm vụ mới, đồng thời tạo hồ sơ Chủ trương ở trạng thái Khởi tạo, sau đó chuyển đến trang chi tiết nhiệm vụ.' },
          ]}
          columns={[
            { title: 'Nút', dataIndex: 'button', width: 260 },
            { title: 'Vị trí', dataIndex: 'location', width: 180 },
            { title: 'Chức năng', dataIndex: 'action' },
          ]}
        />
      </SectionBlock>

      {/* Hướng dẫn từng bước */}
      <SectionBlock title="Hướng dẫn từng bước">
        <Steps
          direction="vertical"
          current={-1}
          size="small"
          items={[
            {
              title: 'Bước 1: Mở chức năng tạo mới',
              description: (
                <Text type="secondary">
                  Tại menu trái, chọn <Text strong>Quản trị KHCN → Danh sách NV KHCN</Text>.
                  Nhấn nút <Text strong>"Tạo Nhiệm vụ KHCN mới"</Text> (góc phải đầu trang).
                  — Hoặc truy cập trực tiếp: <Text code>/nhiem-vu/moi</Text>
                </Text>
              ),
            },
            {
              title: 'Bước 2: Nhập thông tin chung nhiệm vụ',
              description: (
                <Text type="secondary">
                  Điền các trường trong thẻ <Text strong>"Thông tin chung nhiệm vụ"</Text>:
                  Tên nhiệm vụ, Cấp (Cơ sở / Tập đoàn), Đơn vị chủ trì, Thời gian thực hiện
                  (chọn tháng bắt đầu và kết thúc), Tổng dự toán (PL1–PL6).
                  Các trường có dấu <Tag color="red">*</Tag> là bắt buộc.
                </Text>
              ),
            },
            {
              title: 'Bước 3: Nhập thông tin chủ nhiệm đề tài',
              description: (
                <Text type="secondary">
                  Điền các trường trong thẻ <Text strong>"Chủ nhiệm đề tài (PM)"</Text>:
                  Học vị, Họ tên (bắt buộc), Mã nhân viên, Email, Điện thoại, Đơn vị công tác.
                  Email được kiểm tra định dạng tự động. Nếu bỏ trống "Đơn vị công tác",
                  hệ thống sẽ lấy giá trị từ "Đơn vị chủ trì".
                </Text>
              ),
            },
            {
              title: 'Bước 4: Kiểm tra và xác nhận',
              description: (
                <Text type="secondary">
                  Rà soát lại toàn bộ thông tin đã nhập. Kiểm tra mã NV dự kiến (hệ thống tự cấp).
                  Khi đã chắc chắn, nhấn nút <Text strong>"Tạo nhiệm vụ + hồ sơ Chủ trương"</Text>.
                </Text>
              ),
            },
            {
              title: 'Bước 5: Sau khi tạo thành công',
              description: (
                <Text type="secondary">
                  Hệ thống chuyển đến trang chi tiết nhiệm vụ vừa tạo.
                  Vào mục <Text strong>"Hồ sơ liên quan"</Text> → chọn hồ sơ Chủ trương (trạng thái Khởi tạo)
                  → bấm <Text strong>"Gửi duyệt"</Text> để chọn quy trình (RD01.01 / RD01.02) và bắt đầu luồng phê duyệt.
                </Text>
              ),
            },
          ]}
        />
      </SectionBlock>

      <Alert
        type="info"
        showIcon
        message="Lưu ý quan trọng"
        description={(
          <Text>
            - Chỉ Chủ nhiệm đề tài (PM/PA/NNC) mới có quyền tạo nhiệm vụ mới.<br />
            - Nhiệm vụ và hồ sơ Chủ trương được tạo đồng thời (1 lần bấm nút).<br />
            - Hồ sơ sau khi tạo ở trạng thái <Text strong>Khởi tạo</Text> — cần bấm "Gửi duyệt" để bắt đầu quy trình.<br />
            - Dự toán nhập theo đơn vị <Text strong>đồng (VNĐ)</Text>, tự động format dấu phân cách hàng nghìn.
          </Text>
        )}
        style={{ marginTop: 16 }}
      />
    </div>
  );
}

function HoSoContent() {
  return (
    <div>
      <Title level={3}><FileTextOutlined style={{ color: '#bf0027' }} /> Hồ sơ KHCN</Title>
      <Paragraph>Mỗi hồ sơ (Dossier) là một gói tài liệu của một giai đoạn trong vòng đời nhiệm vụ. Hồ sơ luân chuyển qua các bước phê duyệt.</Paragraph>

      <SectionBlock title="Các thao tác trên hồ sơ">
        <ul>
          <li><Text strong>Xem chi tiết:</Text> nội dung hồ sơ, biểu mẫu đã điền, tài liệu đính kèm</li>
          <li><Text strong>Dòng thời gian phê duyệt:</Text> lịch sử các bước đã qua, người xử lý, ý kiến</li>
          <li><Text strong>Xử lý hồ sơ:</Text> các nút hành động theo quyền — Đồng ý / Yêu cầu điều chỉnh / Từ chối</li>
          <li><Text strong>Ngoại lệ:</Text> yêu cầu xử lý ngoại lệ (bỏ qua hội đồng, nhảy bước…) nếu được phép</li>
          <li><Text strong>Thao tác khác:</Text> thêm bình luận, tải hồ sơ, xem lịch sử</li>
        </ul>
      </SectionBlock>

      <SectionBlock title="Sơ đồ nhánh (Routing Diagram)">
        <Paragraph>
          Khi hồ sơ đang xử lý, hệ thống hiển thị sơ đồ trực quan các nhánh kết quả:
        </Paragraph>
        <ul>
          <li><Tag color="green">Đồng ý</Tag> → chuyển tiếp bước tiếp theo</li>
          <li><Tag color="orange">Yêu cầu điều chỉnh</Tag> → trả về bước trước để sửa</li>
          <li><Tag color="red">Từ chối</Tag> → kết thúc hồ sơ (nếu được phép)</li>
        </ul>
      </SectionBlock>
    </div>
  );
}

function AdminTongQuanContent() {
  return (
    <div>
      <Title level={3}><AppstoreOutlined style={{ color: '#7c3aed' }} /> Tổng quan Quản trị</Title>
      <Paragraph>
        Nhóm <Text strong>Quản trị</Text> tập hợp 4 công cụ cấu hình cốt lõi, phối hợp với nhau
        để định nghĩa cách một hồ sơ luân chuyển và ai được làm gì trên từng bước.
      </Paragraph>

      {/* ── Workflow Designer (BPMN) ── */}
      <Title level={4} style={{ marginTop: 24, color: '#1677ff' }}>
        <PartitionOutlined /> Workflow Designer (BPMN) — Quy trình xử lý hồ sơ
      </Title>
      <SectionBlock title="Vai trò">
        <Paragraph>
          Workflow Designer dùng để thiết kế <Text strong>quy trình xử lý của hồ sơ</Text> dưới dạng sơ đồ BPMN.
          Một quy trình mô tả <Text strong>hồ sơ sẽ đi qua những bước nào, theo thứ tự nào, có những nhánh xử lý nào,
          khi nào kết thúc</Text>.
        </Paragraph>
        <Paragraph>
          Workflow chỉ mô tả <Text strong>trình tự xử lý</Text>, <Text strong>không quyết định người xử lý cụ thể</Text>
          và <Text strong>không chứa các luật nghiệp vụ chi tiết</Text>.
        </Paragraph>
        <Paragraph style={{ marginBottom: 0 }}>
          <Text strong>Ví dụ:</Text> Hồ sơ đi qua các bước: Tiếp nhận → Thẩm định → Phê duyệt → Ban hành.
          Sau bước Thẩm định có thể chuyển sang Hội đồng hoặc Phê duyệt cuối cùng. Mỗi bước sử dụng biểu mẫu (Form) nào.
          Thời hạn xử lý (SLA) của từng bước.
        </Paragraph>
      </SectionBlock>
      <SectionBlock title="Dùng khi">
        <ul>
          <li>Thiết kế quy trình mới.</li>
          <li>Thêm hoặc xóa bước xử lý.</li>
          <li>Thay đổi thứ tự các bước.</li>
          <li>Thêm hoặc sửa nhánh điều hướng.</li>
          <li>Gắn biểu mẫu cho từng bước.</li>
          <li>Cấu hình thời hạn xử lý của từng bước.</li>
        </ul>
      </SectionBlock>

      <Divider />

      {/* ── Business Rule Studio (DMN) ── */}
      <Title level={4} style={{ marginTop: 24, color: '#d48806' }}>
        <ClusterOutlined /> Business Rule Studio (DMN) — Luật nghiệp vụ
      </Title>
      <SectionBlock title="Vai trò">
        <Paragraph>
          Business Rule Studio dùng để định nghĩa <Text strong>các quyết định nghiệp vụ</Text> dưới dạng
          Decision Table (DMN). DMN nhận dữ liệu của hồ sơ làm đầu vào và trả về các quyết định để quy trình
          sử dụng trong quá trình xử lý.
        </Paragraph>
        <Paragraph>
          DMN <Text strong>không điều khiển quy trình trực tiếp</Text>, mà cung cấp các kết quả để BPMN quyết định
          bước tiếp theo hoặc cấu hình quá trình xử lý.
        </Paragraph>
        <Paragraph style={{ marginBottom: 0 }}>
          <Text strong>Ví dụ:</Text> Hồ sơ này thuộc cấp nào? Có cần Hội đồng thẩm định hay không?
          Cấp phê duyệt là L1, L2 hay L3? SLA xử lý là bao nhiêu ngày? Có cần gửi thông báo cho lãnh đạo không?
        </Paragraph>
      </SectionBlock>
      <SectionBlock title="Ví dụ Decision Table">
        <Table
          size="small"
          bordered
          pagination={false}
          dataSource={[
            { condition: '≤ 100 triệu', risk: 'Thấp', result: 'L1' },
            { condition: '100–500 triệu', risk: 'Trung bình', result: 'L2' },
            { condition: '> 500 triệu', risk: 'Cao', result: 'L3 + Hội đồng' },
          ]}
          columns={[
            { title: 'Tổng dự toán', dataIndex: 'condition', width: 180 },
            { title: 'Mức rủi ro', dataIndex: 'risk', width: 140 },
            { title: 'Kết quả', dataIndex: 'result' },
          ]}
        />
      </SectionBlock>
      <SectionBlock title="Dùng khi">
        <ul>
          <li>Thay đổi điều kiện nghiệp vụ.</li>
          <li>Điều chỉnh ngưỡng xét duyệt.</li>
          <li>Bổ sung hoặc sửa Decision Table.</li>
          <li>Kiểm thử và mô phỏng luật nghiệp vụ.</li>
        </ul>
      </SectionBlock>

      <Divider />

      {/* ── Approval Matrix ── */}
      <Title level={4} style={{ marginTop: 24, color: '#52c41a' }}>
        <SolutionOutlined /> Approval Matrix — Xác định người xử lý
      </Title>
      <SectionBlock title="Vai trò">
        <Paragraph>
          Approval Matrix dùng để <Text strong>xác định người hoặc nhóm người thực hiện</Text> tại từng bước
          của quy trình. Sau khi BPMN xác định đang ở bước nào và DMN xác định cần cấp phê duyệt nào,
          Approval Matrix sẽ tra cứu cơ cấu tổ chức để tìm đúng người xử lý.
        </Paragraph>
        <Paragraph style={{ marginBottom: 0 }}>
          Approval Matrix trả lời câu hỏi:
          <Text strong> Ở bước này, với hồ sơ này, ai sẽ là người thực hiện?</Text>
        </Paragraph>
        <Paragraph style={{ marginBottom: 0 }}>
          Approval Matrix có thể căn cứ vào: loại hồ sơ, cấp hồ sơ, vai trò cần xử lý, đơn vị, chức danh,
          cơ cấu tổ chức, hiệu lực theo thời gian, quy tắc ủy quyền.
        </Paragraph>
      </SectionBlock>
      <SectionBlock title="Ví dụ">
        <Table
          size="small"
          bordered
          pagination={false}
          dataSource={[
            { role: 'Trưởng phòng', dept: 'CNTT', level: 'L1', assignee: 'Nguyễn Văn A' },
            { role: 'Giám đốc', dept: 'CNTT', level: 'L3', assignee: 'Trần Văn B' },
            { role: 'Giám đốc (được ủy quyền)', dept: 'CNTT', level: 'L3', assignee: 'Phạm Văn C' },
          ]}
          columns={[
            { title: 'Vai trò', dataIndex: 'role', width: 200 },
            { title: 'Đơn vị', dataIndex: 'dept', width: 80 },
            { title: 'Cấp', dataIndex: 'level', width: 70 },
            { title: 'Người xử lý', dataIndex: 'assignee' },
          ]}
        />
      </SectionBlock>
      <SectionBlock title="Dùng khi">
        <ul>
          <li>Thay đổi người phê duyệt.</li>
          <li>Thay đổi cơ cấu tổ chức.</li>
          <li>Thiết lập ủy quyền tạm thời.</li>
          <li>Thay đổi quy tắc phân công.</li>
          <li>Kiểm tra ai sẽ xử lý một hồ sơ cụ thể.</li>
        </ul>
      </SectionBlock>

      <Divider />

      {/* ── Action Studio ── */}
      <Title level={4} style={{ marginTop: 24, color: '#bf0027' }}>
        <ControlOutlined /> Action Studio — Hành động trên hồ sơ
      </Title>
      <SectionBlock title="Vai trò">
        <Paragraph>
          Action Studio dùng để cấu hình <Text strong>các hành động mà người dùng được phép thực hiện</Text>
          tại từng bước của quy trình. Hệ thống sẽ xác định:
        </Paragraph>
        <ul>
          <li>Hành động nào được hiển thị.</li>
          <li>Hành động nào bị ẩn.</li>
          <li>Hành động nào bị vô hiệu hóa.</li>
          <li>Hành động nào yêu cầu mở biểu mẫu trước khi thực hiện.</li>
        </ul>
        <Paragraph style={{ marginBottom: 0 }}>
          Action Studio trả lời câu hỏi:
          <Text strong> Người dùng này, tại bước này, được phép thực hiện những hành động gì?</Text>
        </Paragraph>
      </SectionBlock>
      <SectionBlock title="Ví dụ">
        <Paragraph>
          Ở bước <Text strong>"Thẩm định"</Text>, người thẩm định có thể thấy:
        </Paragraph>
        <ul>
          <li>Đồng ý</li>
          <li>Yêu cầu bổ sung</li>
          <li>Từ chối</li>
          <li>Chuyển xử lý</li>
        </ul>
      </SectionBlock>
      <SectionBlock title="Dùng khi">
        <ul>
          <li>Thêm hoặc xóa hành động.</li>
          <li>Thay đổi quyền hiển thị hành động.</li>
          <li>Cấu hình hành động ngoại lệ.</li>
          <li>Điều chỉnh giao diện theo từng vai trò.</li>
          <li>Mô phỏng trải nghiệm người dùng.</li>
        </ul>
      </SectionBlock>

      <Divider />

      {/* ── Mối quan hệ & vòng đời ── */}
      <Title level={4} style={{ marginTop: 24, color: '#7c3aed' }}>
        <ApartmentOutlined /> Mối quan hệ giữa bốn thành phần
      </Title>
      <Table
        size="small"
        bordered
        pagination={false}
        style={{ marginBottom: 16 }}
        dataSource={[
          { component: '1. Workflow Designer (BPMN)', question: 'Hồ sơ đi qua những bước nào?' },
          { component: '2. Business Rule Studio (DMN)', question: 'Quy trình cần áp dụng chính sách hoặc quyết định nào?' },
          { component: '3. Approval Matrix', question: 'Ai là người thực hiện tại bước đó?' },
          { component: '4. Action Studio', question: 'Người đó được phép thực hiện những hành động gì?' },
        ]}
        columns={[
          { title: 'Thành phần', dataIndex: 'component', width: 280 },
          { title: 'Câu hỏi trả lời', dataIndex: 'question' },
        ]}
      />

      <SectionBlock title="Toàn bộ vòng đời xử lý">
        <Steps
          direction="vertical"
          current={-1}
          size="small"
          items={[
            { title: 'Hồ sơ', description: 'Hồ sơ được khởi tạo và gửi vào quy trình.' },
            { title: 'Workflow Designer (BPMN)', description: 'Xác định hồ sơ đi qua những bước nào.' },
            { title: 'Business Rule Studio (DMN)', description: 'Xác định quy trình cần áp dụng quyết định nào.' },
            { title: 'Approval Matrix', description: 'Xác định ai là người thực hiện tại bước đó.' },
            { title: 'Camunda tạo User Task', description: 'Hệ thống tạo công việc cho người được chỉ định.' },
            { title: 'Action Studio', description: 'Xác định người đó được phép thực hiện những hành động gì.' },
            { title: 'Người dùng thực hiện', description: 'Người dùng thao tác trên hồ sơ (phê duyệt / trả lại / từ chối).' },
            { title: 'BPMN chuyển sang bước tiếp theo', description: 'Sau khi xử lý, quy trình chuyển sang bước kế tiếp.' },
            { title: 'Kết thúc', description: 'Hồ sơ kết thúc quy trình.' },
          ]}
        />
      </SectionBlock>

      {/* ── Ghi nhớ nhanh ── */}
      <SectionBlock title="Ghi nhớ nhanh">
        <Table
          size="small"
          bordered
          pagination={false}
          dataSource={[
            { component: 'Workflow Designer (BPMN)', question: 'Hồ sơ đi qua những bước nào?' },
            { component: 'Business Rule Studio (DMN)', question: 'Quy trình cần áp dụng quyết định nào?' },
            { component: 'Approval Matrix', question: 'Ai là người thực hiện?' },
            { component: 'Action Studio', question: 'Người đó được phép làm gì?' },
          ]}
          columns={[
            { title: 'Thành phần', dataIndex: 'component', width: 280 },
            { title: 'Câu hỏi trả lời', dataIndex: 'question' },
          ]}
        />
        <Paragraph style={{ marginTop: 12, marginBottom: 0 }}>
          Bốn thành phần phối hợp để bảo đảm mỗi hồ sơ được xử lý{' '}
          <Text strong>đúng quy trình, đúng luật nghiệp vụ, đúng người thực hiện và đúng quyền thao tác</Text>,
          đồng thời giảm thiểu việc phải sửa mã nguồn khi nghiệp vụ thay đổi.
        </Paragraph>
      </SectionBlock>
    </div>
  );
}

function QuyTrinhContent() {
  return (
    <div>
      <Title level={3}><PartitionOutlined style={{ color: '#bf0027' }} /> Quản lý quy trình</Title>

      {/* ── Tổng quan ── */}
      <Card size="small" title="Tổng quan chức năng" style={{ marginBottom: 16, borderLeft: '3px solid #bf0027' }}>
        <Paragraph>
          Trang <Text strong>Quản lý quy trình</Text> cho phép quản trị viên định nghĩa và vận hành các quy trình
          BPMN (RD01–RD10) sử dụng <Text strong>Camunda 8</Text> làm workflow engine. Đây là nền tảng định nghĩa luồng
          phê duyệt cho toàn bộ hệ thống QTKHCN.
        </Paragraph>
        <ul>
          <li><Text strong>Danh mục quy trình:</Text> danh sách tất cả quy trình, lọc theo trạng thái / nhóm</li>
          <li><Text strong>Tạo & vẽ BPMN:</Text> thiết kế quy trình trực quan, cấu hình các bước phê duyệt</li>
          <li><Text strong>Chi tiết quy trình:</Text> xem BPMN, ban hành phiên bản mới, tạm ngừng / kích hoạt</li>
        </ul>
      </Card>

      {/* ── Hướng dẫn tạo mới quy trình ── */}
      <Title level={4} style={{ marginTop: 24, color: '#bf0027' }}>
        <PartitionOutlined /> Hướng dẫn tạo & vẽ BPMN (Tạo mới quy trình)
      </Title>
      <Paragraph>
        Tính năng <Text strong>"Tạo mới quy trình"</Text> cho phép quản trị viên thiết kế một quy trình BPMN từ đầu
        bằng trình vẽ trực quan. Chỉ <Text strong>Quản trị hệ thống</Text> mới có quyền truy cập chức năng này.
      </Paragraph>

      {/* Ảnh chụp màn hình */}
      <div style={{ marginBottom: 20, textAlign: 'center' }}>
        <Image
          src="/screenshots/process-create-form.png"
          alt="Giao diện tạo mới quy trình BPMN"
          style={{ border: '1px solid #e6e9ee', borderRadius: 8, maxWidth: '100%' }}
          preview={{ mask: 'Bấm để phóng to' }}
        />
        <div style={{ marginTop: 6 }}>
          <Text type="secondary" style={{ fontSize: 12 }}>
            Hình 1: Giao diện tạo mới quy trình — thông tin chung phía trên + sơ đồ BPMN phía dưới
          </Text>
        </div>
      </div>

      {/* Bảng mô tả trường dữ liệu */}
      <SectionBlock title="Mô tả các trường dữ liệu (Thông tin chung)">
        <Table
          size="small"
          bordered
          pagination={false}
          dataSource={[
            { field: 'Mã quy trình', required: 'Bắt buộc', type: 'Văn bản (Input)', desc: 'Mã định danh duy nhất của quy trình. VD: RD07.01, RD03.06. Không được trùng với quy trình đã có.' },
            { field: 'Tên quy trình', required: 'Bắt buộc', type: 'Văn bản (Input)', desc: 'Tên hiển thị của quy trình. VD: "Quản lý danh mục SPDV", "Báo cáo tiến độ".' },
            { field: 'Nhóm', required: 'Bắt buộc', type: 'Dropdown (Select)', desc: 'Nhóm quy trình (RD01–RD10). Dùng để phân loại và lọc trong danh mục.' },
            { field: 'Mô tả luồng', required: 'Không bắt buộc', type: 'Văn bản (Input)', desc: 'Mô tả tóm tắt các bước chính của quy trình. Sẽ hiển thị trong trang chi tiết quy trình.' },
          ]}
          columns={[
            { title: 'Tên trường', dataIndex: 'field', width: 180 },
            { title: 'Bắt buộc', dataIndex: 'required', width: 90 },
            { title: 'Kiểu dữ liệu', dataIndex: 'type', width: 170 },
            { title: 'Mô tả / Hướng dẫn nhập', dataIndex: 'desc' },
          ]}
        />
      </SectionBlock>

      {/* Bảng mô tả nút chức năng */}
      <SectionBlock title="Mô tả các nút chức năng">
        <Table
          size="small"
          bordered
          pagination={false}
          dataSource={[
            { button: '← (Nút quay lại)', location: 'Đầu trang (trái)', action: 'Quay về danh mục quy trình. Dữ liệu đang nhập sẽ mất nếu chưa lưu.' },
            { button: 'Tải .bpmn', location: 'Đầu trang (phải)', action: 'Xuất file BPMN XML của sơ đồ hiện tại. Dùng để backup hoặc import vào Camunda Modeler.' },
            { button: 'Lưu & tạo quy trình', location: 'Đầu trang (phải, primary)', action: 'Kiểm tra lỗi → nếu không có lỗi, lưu quy trình kèm sơ đồ BPMN và chuyển đến trang chi tiết.' },
            { button: '? (Trợ giúp)', location: 'Đầu trang (phải)', action: 'Mở trang Hướng dẫn sử dụng đến mục này.' },
          ]}
          columns={[
            { title: 'Nút', dataIndex: 'button', width: 220 },
            { title: 'Vị trí', dataIndex: 'location', width: 170 },
            { title: 'Chức năng', dataIndex: 'action' },
          ]}
        />
      </SectionBlock>

      {/* Bảng mô tả thanh công cụ BPMN */}
      <SectionBlock title="Mô tả thanh công cụ (Toolbar) và các thành phần BPMN">
        <Paragraph>
          Sau khi nhập thông tin chung, phần <Text strong>"Sơ đồ BPMN"</Text> chiếm phần lớn màn hình và bao gồm:
        </Paragraph>

        <Title level={5}>Thanh công cụ (Toolbar) — trên cùng canvas</Title>
        <Table
          size="small"
          bordered
          pagination={false}
          dataSource={[
            { tool: 'Chuột (Select)', icon: '↖️', action: 'Chọn / di chuyển phần tử trên canvas. Bấm vào phần tử để cấu hình.' },
            { tool: 'Bàn tay (Hand)', icon: '✋', action: 'Kéo để di chuyển vùng nhìn canvas, không làm thay đổi sơ đồ.' },
            { tool: 'Lasso', icon: '〰️', action: 'Khoanh vùng chọn nhiều phần tử cùng lúc.' },
            { tool: 'Thu phóng (Zoom)', icon: '🔍', action: 'Phóng to / thu nhỏ sơ đồ. Hiển thị tỉ lệ % hiện tại.' },
            { tool: 'Hoàn tác (Undo)', icon: '↩️', action: 'Quay lại thao tác trước đó.' },
            { tool: 'Làm lại (Redo)', icon: '↪️', action: 'Áp dụng lại thao tác đã hoàn tác.' },
            { tool: 'Lưới (Grid)', icon: '▦', action: 'Bật / tắt lưới nền để căn chỉnh phần tử dễ dàng hơn.' },
            { tool: 'Hiệu chỉnh màu', icon: '🎨', action: 'Mở bảng màu để tô màu phần tử (phân biệt luồng, vai trò).' },
          ]}
          columns={[
            { title: 'Công cụ', dataIndex: 'tool', width: 200 },
            { title: '', dataIndex: 'icon', width: 40 },
            { title: 'Chức năng', dataIndex: 'action' },
          ]}
        />

        <Title level={5} style={{ marginTop: 16 }}>Palette (hộp công cụ vẽ) — bên trái canvas</Title>
        <Table
          size="small"
          bordered
          pagination={false}
          dataSource={[
            { element: 'Start Event', desc: 'Điểm bắt đầu quy trình. Mỗi BPMN bắt buộc có 1 Start Event.' },
            { element: 'User Task', desc: 'Bước có người xử lý. Cấu hình candidateGroups, biểu mẫu (formKey).' },
            { element: 'Service Task', desc: 'Bước tự động gọi backend / tích hợp hệ thống ngoài (QLNS, SAP…).' },
            { element: 'Business Rule Task', desc: 'Bước gọi DMN decision table để quyết định luồng.' },
            { element: 'Call Activity', desc: 'Gọi một quy trình con (subprocess) — dùng cho quy trình hội đồng.' },
            { element: 'Exclusive Gateway', desc: 'Rẽ nhánh có điều kiện (VD: Đạt → 1 nhánh, Chưa đạt → nhánh khác).' },
            { element: 'Parallel Gateway', desc: 'Rẽ nhiều nhánh chạy song song hoặc đồng bộ lại.' },
            { element: 'Timer Event', desc: 'Định thời gian / hạn xử lý (SLA) cho bước.' },
            { element: 'End Event', desc: 'Điểm kết thúc quy trình. Mỗi nhánh phải có ít nhất 1 End Event.' },
            { element: 'Sequence Flow', desc: 'Đường nối giữa các phần tử, vẽ bằng cách kéo từ phần tử nguồn → đích.' },
          ]}
          columns={[
            { title: 'Phần tử', dataIndex: 'element', width: 180 },
            { title: 'Mô tả & cách dùng', dataIndex: 'desc' },
          ]}
        />

        <Title level={5} style={{ marginTop: 16 }}>Properties Panel — bên phải canvas</Title>
        <Paragraph>
          Khi bấm chọn một phần tử trên canvas, Properties Panel (tiếng Việt) hiển thị bên phải để cấu hình:
        </Paragraph>
        <ul>
          <li><Text strong>General:</Text> tên, ID, mô tả phần tử</li>
          <li><Text strong>Assignment (zeebe):</Text> gán candidateGroups (vai trò xử lý), assignee (người cụ thể)</li>
          <li><Text strong>Form (zeebe):</Text> chọn formKey từ Thư viện biểu mẫu (form-js)</li>
          <li><Text strong>Condition (FEEL):</Text> điều kiện rẽ nhánh bằng ngôn ngữ FEEL — preset sẵn Đồng ý / Từ chối</li>
          <li><Text strong>Multi-Instance:</Text> cấu hình xử lý đồng thời nhiều người (hội đồng)</li>
          <li><Text strong>Timer:</Text> cấu hình thời gian / SLA</li>
        </ul>
      </SectionBlock>

      {/* Hướng dẫn từng bước */}
      <SectionBlock title="Hướng dẫn từng bước">
        <Steps
          direction="vertical"
          current={-1}
          size="small"
          items={[
            {
              title: 'Bước 1: Mở chức năng tạo quy trình',
              description: (
                <Text type="secondary">
                  Tại menu trái, chọn <Text strong>Quản lý quy trình</Text> → nhấn nút <Text strong>"Tạo & vẽ BPMN"</Text>
                  (góc phải đầu trang). — Hoặc truy cập: <Text code>/quy-trinh/moi</Text>
                </Text>
              ),
            },
            {
              title: 'Bước 2: Nhập thông tin chung',
              description: (
                <Text type="secondary">
                  Điền <Text strong>Mã quy trình</Text> (duy nhất, VD: RD07.01), <Text strong>Tên quy trình</Text>,
                  chọn <Text strong>Nhóm</Text> (RD01–RD10), và nhập <Text strong>Mô tả luồng</Text> (không bắt buộc).
                  Các trường có dấu <Tag color="red">*</Tag> là bắt buộc.
                </Text>
              ),
            },
            {
              title: 'Bước 3: Vẽ sơ đồ BPMN',
              description: (
                <Text type="secondary">
                  Kéo phần tử từ <Text strong>Palette bên trái</Text> thả vào canvas trung tâm.
                  Nối các phần tử bằng <Text strong>Sequence Flow</Text> (kéo từ viền phần tử nguồn đến phần tử đích).
                  Sử dụng <Text strong>Exclusive Gateway</Text> để tạo nhánh rẽ (VD: Đồng ý / Từ chối).
                  Bấm vào từng phần tử để cấu hình trong <Text strong>Properties Panel bên phải</Text>.
                </Text>
              ),
            },
            {
              title: 'Bước 4: Cấu hình các bước',
              description: (
                <Text type="secondary">
                  Với mỗi <Text strong>User Task</Text>: gán vai trò xử lý (candidateGroups), chọn biểu mẫu (formKey)
                  từ Thư viện biểu mẫu.<br />
                  Với <Text strong>Gateway</Text>: thiết lập điều kiện FEEL (VD: <Text code>=ketQua = "dat"</Text>).<br />
                  Với <Text strong>Service Task</Text>: chọn job type tương ứng (VD: <Text code>qlns</Text>, <Text code>sap</Text>).<br />
                  Bấm <Text strong>"Kiểm tra lỗi"</Text> (lint) bất kỳ lúc nào để rà soát sơ đồ.
                </Text>
              ),
            },
            {
              title: 'Bước 5: Kiểm tra và lưu',
              description: (
                <div>
                  <Text type="secondary">
                    Nhấn nút <Text strong>"Lưu & tạo quy trình"</Text>. Hệ thống sẽ tự động kiểm tra lỗi:
                  </Text>
                  <ul style={{ marginTop: 4 }}>
                    <li>Nếu còn lỗi (severity=error): chặn lưu, hiển thị danh sách lỗi kèm vị trí cần sửa.</li>
                    <li>Nếu không lỗi: lưu quy trình (trạng thái Nháp), chuyển đến trang chi tiết quy trình.</li>
                  </ul>
                </div>
              ),
            },
            {
              title: 'Bước 6: Sau khi tạo thành công',
              description: (
                <div>
                  <Text type="secondary">
                    Tại trang chi tiết quy trình vừa tạo, bạn có thể:
                  </Text>
                  <ul style={{ marginTop: 4 }}>
                    <li>Xem lại / chỉnh sửa sơ đồ BPMN (nút <Text strong>"Chỉnh sửa"</Text>).</li>
                    <li><Text strong>Ban hành phiên bản mới</Text> để deploy lên Camunda engine (khi đã có backend).</li>
                    <li><Text strong>Tạm ngừng / Kích hoạt</Text> quy trình.</li>
                  </ul>
                </div>
              ),
            },
          ]}
        />
      </SectionBlock>

      <Alert
        type="info"
        showIcon
        message="Lưu ý quan trọng"
        description={(
          <Text>
            - Chỉ <Text strong>Quản trị hệ thống</Text> mới có quyền tạo và chỉnh sửa quy trình.<br />
            - Quy trình sau khi tạo ở trạng thái <Text strong>Nháp</Text> — cần ban hành phiên bản để đưa vào sử dụng.<br />
            - <Text strong>Cổng chất lượng (Live Lint)</Text>: hệ thống tự động kiểm tra lỗi mỗi khi vẽ. Các lỗi thường gặp: thiếu Start/End Event, thiếu điều kiện Gateway, chưa gán formKey cho User Task.<br />
            - Mỗi quy trình phải có 1 Start Event và ít nhất 1 End Event.<br />
            - Gateway mặc định an toàn: nhánh đầu tiên là "Đồng ý", nếu không khớp điều kiện sẽ đi nhánh "Từ chối".
          </Text>
        )}
        style={{ marginTop: 16 }}
      />
    </div>
  );
}

function BienMauContent() {
  return (
    <div>
      <Title level={3}><FormOutlined style={{ color: '#bf0027' }} /> Thư viện biểu mẫu</Title>
      <Paragraph>Quản lý tập trung các biểu mẫu điện tử (eForms) sử dụng trong các bước phê duyệt.</Paragraph>

      <SectionBlock title="Chức năng">
        <ul>
          <li><Text strong>Danh sách biểu mẫu:</Text> xem tất cả biểu mẫu có sẵn, tìm kiếm theo tên</li>
          <li><Text strong>Tạo biểu mẫu:</Text> thiết kế form động với các trường: văn bản, số, ngày tháng, tệp đính kèm, bảng…</li>
          <li><Text strong>Sửa biểu mẫu:</Text> cập nhật cấu trúc form, thêm/bớt trường</li>
          <li><Text strong>Xoá biểu mẫu:</Text> chỉ xoá khi biểu mẫu không được tham chiếu bởi hành động nào</li>
        </ul>
      </SectionBlock>

      <SectionBlock title="Liên kết biểu mẫu">
        <Paragraph>
          Biểu mẫu được gắn với <Text strong>Action Availability Policy</Text> trong Action Studio.
          Mỗi hành động (Đồng ý, Yêu cầu điều chỉnh, Từ chối) có thể cần một biểu mẫu riêng.
          Quan hệ giữa biểu mẫu và hành động là <Text strong>1 biểu mẫu : N hành động</Text>.
        </Paragraph>
      </SectionBlock>
    </div>
  );
}

function ToChucContent() {
  return (
    <div>
      <Title level={3}><ApartmentOutlined style={{ color: '#bf0027' }} /> Quản trị đơn vị</Title>
      <Paragraph>Quản lý cơ cấu tổ chức của Viettel High Tech — các đơn vị, phòng ban, trung tâm.</Paragraph>

      <SectionBlock title="Chức năng">
        <ul>
          <li>Xem sơ đồ cây tổ chức (Parent–Child hierarchy)</li>
          <li>Thêm / sửa / xoá đơn vị</li>
          <li>Gán người đứng đầu đơn vị</li>
          <li>Thiết lập mối quan hệ trực thuộc</li>
        </ul>
      </SectionBlock>

      <Divider />

      <Title level={3}><TeamOutlined style={{ color: '#bf0027' }} /> Quản trị người dùng</Title>
      <Paragraph>Danh sách người dùng hệ thống — mỗi người dùng có một hoặc nhiều vai trò (Role).</Paragraph>

      <SectionBlock title="Thao tác">
        <ul>
          <li>Thêm người dùng mới (họ tên, email, đơn vị, chức danh)</li>
          <li>Gán vai trò (Role) cho người dùng</li>
          <li>Khoá / mở khoá tài khoản</li>
          <li>Tìm kiếm người dùng theo tên / email / đơn vị</li>
        </ul>
      </SectionBlock>

      <Divider />

      <Title level={3}><KeyOutlined style={{ color: '#bf0027' }} /> Phân quyền</Title>
      <Paragraph>Quản lý vai trò (Role) và quyền hạn (Permission) — nguyên tắc fail-closed: quyền phải được cấp rõ ràng.</Paragraph>

      <SectionBlock title="Mô hình phân quyền">
        <ul>
          <li><Text strong>26 mã vai trò</Text> ánh xạ tới Camunda candidateGroup</li>
          <li>Nhóm vai trò: Khởi tạo (PM/PA/NNC), Chuyên quản, Ban Giám đốc, Hội đồng, Cấp Tập đoàn…</li>
          <li>Mỗi bước quy trình khai báo danh sách vai trò được phép xử lý</li>
          <li>Quản trị viên (admin) có toàn quyền trên mọi bước</li>
        </ul>
      </SectionBlock>
    </div>
  );
}

function GiamSatContent() {
  return (
    <div>
      <Title level={3}><ThunderboltOutlined style={{ color: '#bf0027' }} /> Giám sát tiến trình</Title>
      <Paragraph>Theo dõi trạng thái các luồng quy trình đang hoạt động trong hệ thống.</Paragraph>

      <SectionBlock title="Các chỉ số giám sát">
        <ul>
          <li><Text strong>Số luồng đang hoạt động:</Text> tổng số process instance đang chạy</li>
          <li><Text strong>Thời gian xử lý trung bình:</Text> SLA theo từng bước</li>
          <li><Text strong>Tỉ lệ quá hạn:</Text> % hồ sơ vượt quá hạn xử lý</li>
          <li><Text strong>Lỗi & Incident:</Text> các luồng gặp lỗi cần can thiệp thủ công</li>
        </ul>
      </SectionBlock>

      <SectionBlock title="Thao tác">
        <ul>
          <li>Xem chi tiết từng luồng (process instance)</li>
          <li>Lọc theo quy trình, trạng thái, khoảng thời gian</li>
          <li>Xem biểu đồ thời gian thực (real-time dashboard)</li>
        </ul>
      </SectionBlock>

      <Alert
        type="warning"
        showIcon
        message="Lưu ý"
        description="Dữ liệu hiện tại là mô phỏng (mock). Sẽ kết nối Camunda Operate thật khi backend hoàn thiện."
        style={{ marginTop: 12 }}
      />
    </div>
  );
}

function TichHopContent() {
  return (
    <div>
      <Title level={3}><ApiOutlined style={{ color: '#bf0027' }} /> Trạng thái Tích hợp</Title>
      <Paragraph>Theo dõi trạng thái kết nối giữa hệ thống QTKHCN và các hệ thống bên ngoài.</Paragraph>

      <SectionBlock title="Các hệ thống tích hợp">
        <ul>
          <li><Text strong>QLNS:</Text> đồng bộ nhân sự, đơn vị, chức danh</li>
          <li><Text strong>MS:</Text> đồng bộ mã số đề tài, hợp đồng</li>
          <li><Text strong>SAP:</Text> đồng bộ dự toán, chi phí, quyết toán</li>
          <li><Text strong>QLTS:</Text> đồng bộ tài sản hình thành từ đề tài</li>
          <li><Text strong>PLM:</Text> đồng bộ sản phẩm, tiến độ nghiên cứu</li>
        </ul>
      </SectionBlock>

      <SectionBlock title="Trạng thái kết nối">
        <ul>
          <li><Tag color="green">Kết nối OK</Tag> — hệ thống đang hoạt động bình thường</li>
          <li><Tag color="orange">Chậm</Tag> — độ trễ vượt ngưỡng cho phép</li>
          <li><Tag color="red">Mất kết nối</Tag> — cần kiểm tra / can thiệp kỹ thuật</li>
        </ul>
      </SectionBlock>
    </div>
  );
}

function NhatKyContent() {
  return (
    <div>
      <Title level={3}><HistoryOutlined style={{ color: '#bf0027' }} /> Nhật ký</Title>
      <Paragraph>Audit log toàn bộ thao tác trên hệ thống — phục vụ kiểm tra, truy xuất nguồn gốc và đối chiếu.</Paragraph>

      <SectionBlock title="Nội dung nhật ký">
        <ul>
          <li>Thời gian thao tác</li>
          <li>Người thực hiện (user + vai trò)</li>
          <li>Hành động (tạo hồ sơ, ký duyệt, từ chối, sửa dữ liệu…)</li>
          <li>Đối tượng bị ảnh hưởng (mã hồ sơ, mã nhiệm vụ)</li>
          <li>Thông tin chi tiết (ý kiến, lý do, tệp đính kèm)</li>
        </ul>
      </SectionBlock>

      <SectionBlock title="Tra cứu">
        <Paragraph>Lọc theo thời gian, người dùng, loại hành động, mã hồ sơ. Hỗ trợ xuất báo cáo audit.</Paragraph>
      </SectionBlock>
    </div>
  );
}

function LuatContent() {
  return (
    <div>
      <Title level={3}><ClusterOutlined style={{ color: '#bf0027' }} /> Quản lý luật (Business Rule)</Title>
      <Paragraph>Khai báo và quản lý các luật nghiệp vụ dạng decision table (DMN) dùng trong định tuyến và phê duyệt.</Paragraph>

      <SectionBlock title="Các loại luật">
        <ul>
          <li><Text strong>Luật định tuyến:</Text> phân cấp Cơ sở / Tập đoàn dựa trên dự toán</li>
          <li><Text strong>Luật đánh giá:</Text> Đạt / Chưa đạt dựa trên kết quả thẩm định</li>
          <li><Text strong>Luật phê duyệt:</Text> điều kiện để trình TGĐ, hội đồng…</li>
        </ul>
      </SectionBlock>

      <SectionBlock title="Giao diện">
        <ul>
          <li>Rule Manager: tạo / sửa / xoá / nhân bản luật</li>
          <li>Decision Table: trực quan dạng bảng điều kiện → kết quả</li>
          <li>Test mô phỏng: nhập đầu vào → xem đầu ra dự kiến</li>
        </ul>
      </SectionBlock>
    </div>
  );
}

function MaTranContent() {
  return (
    <div>
      <Title level={3}><SolutionOutlined style={{ color: '#bf0027' }} /> Ma trận phê duyệt</Title>
      <Paragraph>Khai báo ai là người phê duyệt cho từng bước, dựa trên vai trò, đơn vị và hiệu lực.</Paragraph>

      <SectionBlock title="Cấu trúc ma trận">
        <ul>
          <li>Mỗi dòng = một quy tắc phê duyệt: {`{cấp, vai trò, đơn vị, bước} → người phê duyệt`}</li>
          <li>Hỗ trợ uỷ quyền theo thời gian (VD: TGĐ → Phó TGĐ từ 01/07 – 15/07)</li>
          <li>First-match: quy tắc đầu tiên khớp được áp dụng</li>
        </ul>
      </SectionBlock>

      <SectionBlock title="Mô phỏng">
        <Paragraph>Trang Ma trận có bảng mô phỏng để kiểm tra: nhập cấp, vai trò, đơn vị → xem ai sẽ là người phê duyệt theo ma trận hiện tại.</Paragraph>
      </SectionBlock>
    </div>
  );
}

function HanhDongContent() {
  return (
    <div>
      <Title level={3}><ControlOutlined style={{ color: '#bf0027' }} /> Ma trận Hành động (Action Studio)</Title>

      {/* ── Tổng quan logic nghiệp vụ ── */}
      <Card size="small" title="Tổng quan logic nghiệp vụ" style={{ marginBottom: 16, borderLeft: '3px solid #bf0027' }}>
        <Paragraph>
          Trang <Text strong>Ma trận Hành động</Text> (Action Studio) là trung tâm cấu hình toàn bộ hệ thống
          hành động (nút bấm) xuất hiện trên mỗi bước xử lý hồ sơ. Mục tiêu của trang này là trả lời một
          câu hỏi duy nhất: <Text strong>"Ở từng bước hồ sơ, người dùng được bấm nút nào?"</Text>
        </Paragraph>

        <Title level={5}>Vì sao cần trang này?</Title>
        <Paragraph>
          Thay vì viết cứng (hard-code) các nút (Trình duyệt, Đồng ý, Trả lại, Từ chối…) trong mã nguồn,
          UI chi tiết hồ sơ gọi API <Text code>GET /dossiers/{'{id}'}/available-actions</Text> để
          kết xuất động (render dynamically) — nút nào hiện, nút nào ẩn, nút nào mờ phụ thuộc vào:
        </Paragraph>
        <ul>
          <li><Text strong>Quy trình BPMN</Text> đang áp dụng cho hồ sơ (RD01, RD02, RD05…)</li>
          <li><Text strong>Bước xử lý hiện tại</Text> (taskDefinitionKey)</li>
          <li><Text strong>Vai trò người dùng</Text> (candidateGroup / role codes)</li>
          <li><Text strong>Trạng thái hồ sơ</Text> (dossierStatus)</li>
          <li><Text strong>Quyền được cấp</Text> (permissions: PROCESS_STEP, REQUEST_EXCEPTION…)</li>
          <li><Text strong>Điều kiện nghiệp vụ</Text> (conditionExpression: tài liệu đã đủ, còn hạn…)</li>
          <li><Text strong>Luật ngoại lệ</Text> đang có hiệu lực</li>
        </ul>
        <Paragraph>
          Nhờ mô hình này, khi quy trình thay đổi (thêm/bớt bước, đổi nhánh routing), admin
          <Text strong> không cần sửa code</Text> — chỉ cần cấu hình lại trên trang Action Studio.
        </Paragraph>

        <Title level={5}>Mô hình 3 lớp (Action Availability Model — mô hình khả dụng hành động)</Title>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginTop: 8 }}>
          <Card size="small" style={{ flex: '1 1 240px', borderLeft: '3px solid #1677ff' }} title={<><AppstoreOutlined /> 1. Action Registry</>}>
            <Text type="secondary" style={{ fontSize: 13 }}>
              Danh mục tĩnh tất cả hành động hệ thống hỗ trợ. Phân loại theo 3 nhóm:
              STANDARD (đi theo BPMN), SUPPORT (hỗ trợ — không đổi luồng), EXCEPTION (ngoại lệ — xin đi khác luồng chuẩn).
              Admin <Text strong>không tự tạo</Text> action logic mới nhưng có thể chỉnh nhãn hiển thị,
              icon, nhóm UI, thứ tự.
            </Text>
          </Card>
          <Card size="small" style={{ flex: '1 1 240px', borderLeft: '3px solid #faad14' }} title={<><ControlOutlined /> 2. Action Availability Policy</>}>
            <Text type="secondary" style={{ fontSize: 13 }}>
              Luật first-match (khớp theo thứ tự) quyết định action nào hiển thị ở surface (bề mặt)/bước/vai trò/trạng thái nào.
              Mỗi luật gồm điều kiện (processCode, taskDefinitionKey, dossierStatus, roleCodes…)
              và kết quả (displayOrder, formKey, requiredPermissions). Hệ thống fail-closed (đóng khi thiếu):
              không có luật = nút không hiện.
            </Text>
          </Card>
          <Card size="small" style={{ flex: '1 1 240px', borderLeft: '3px solid #ff4d4f' }} title={<><SafetyCertificateOutlined /> 3. Exception Action Policy</>}>
            <Text type="secondary" style={{ fontSize: 13 }}>
              Kiểm soát hành động ngoại lệ (exception) — nơi phát sinh, nút xin ngoại lệ, ai duyệt,
              cần căn cứ gì, sau duyệt đi đâu. Mỗi luật ngoại lệ tự động sinh một
              Availability Policy cho nút tương ứng, đảm bảo nút hiển thị đúng chỗ.
            </Text>
          </Card>
        </div>
      </Card>

      {/* ── Ảnh tổng quan ── */}
      <div style={{ marginBottom: 20, textAlign: 'center' }}>
        <Image
          src="/screenshots/action-studio-overview.png"
          alt="Tổng quan trang Ma trận Hành động"
          style={{ border: '1px solid #e6e9ee', borderRadius: 8, maxWidth: '100%' }}
          preview={{ mask: 'Bấm để phóng to' }}
        />
        <div style={{ marginTop: 6 }}>
          <Text type="secondary" style={{ fontSize: 12 }}>
            Hình 1: Trang Ma trận Hành động — gồm 7 tab chức năng, tab mặc định là "Tổng quan luồng"
          </Text>
        </div>
      </div>

      {/* ── Luồng cấu hình khuyến nghị ── */}
      <SectionBlock title="Luồng thao tác khuyến nghị">
        <Paragraph>
          Khi cần cấu hình hành động cho một quy trình, nên đi theo thứ tự sau:
        </Paragraph>
        <Steps
          direction="vertical"
          current={-1}
          size="small"
          items={[
            { title: 'Bước 1 — Đồng bộ BPMN', description: 'Đọc các bước (user task — tác vụ người dùng) và nhánh kết quả từ BPMN. Phát hiện bước chưa có nút xử lý (🔴) hoặc đang dùng luật chung (🟡). Bấm "Đồng bộ" để tạo/cập nhật (scaffold/upsert) policy.' },
            { title: 'Bước 2 — Xem đường đi của hồ sơ', description: 'Kiểm tra mỗi lựa chọn (Đồng ý, Trả lại, Từ chối…) đưa hồ sơ tới bước nào. Sửa tại data/stepRouting.ts nếu đích chưa đúng.' },
            { title: 'Bước 3 — Cấu hình luật hiển thị nút', description: 'Gắn nút với quy trình, trạng thái hồ sơ, vai trò, quyền và biểu mẫu cần điền. Dùng luật first-match (khớp theo thứ tự).' },
            { title: 'Bước 4 — Cấu hình luật ngoại lệ', description: 'Nếu có hành động đi khác luồng chuẩn (xin bỏ qua Hội đồng, xin chuyển luồng…), tạo luật ngoại lệ (exception policy). Hệ thống tự sinh nút hiển thị tương ứng.' },
            { title: 'Bước 5 — Mô phỏng kiểm thử', description: 'Chọn vai trò, trạng thái hồ sơ, quyền để xem UI chi tiết hồ sơ sẽ hiện những nút nào. Đối chiếu payload JSON để kiểm tra.' },
          ]}
        />
      </SectionBlock>

      {/* ── 1. Tổng quan luồng ── */}
      <Title level={4} style={{ marginTop: 24, color: '#bf0027' }}>
        <ControlOutlined /> 1. Tổng quan luồng (tab mặc định)
      </Title>
      <Paragraph>
        Tab <Text strong>Tổng quan luồng</Text> (Flow Overview) là màn hình chào khi vào trang, cung cấp hai khối thông tin:
      </Paragraph>
      <ul>
        <li><Text strong>Luồng cấu hình khuyến nghị:</Text> 5 bước đề xuất (Lấy bước từ quy trình → Xem đường đi → Quy định ai thấy nút → Kiểm soát ngoại lệ → Thử như người dùng thật).</li>
        <li><Text strong>Giải thích các phần trên màn hình:</Text> 3 thông báo (alert) giải thích ngắn về Luật hiển thị nút, Ngoại lệ và Mô phỏng — giúp người mới hiểu nhanh cấu trúc trang.</li>
      </ul>

      {/* ── 2. Danh mục nút ── */}
      <Title level={4} style={{ marginTop: 24, color: '#bf0027' }}>
        <AppstoreOutlined /> 2. Danh mục nút (Action Registry — sổ đăng ký hành động)
      </Title>
      <Paragraph>
        Tab <Text strong>Danh mục nút</Text> hiển thị toàn bộ <Text strong>Action Registry</Text> — danh mục
        tĩnh tất cả hành động mà hệ thống hỗ trợ, được sắp xếp theo nhóm: STANDARD (chuẩn), SUPPORT (hỗ trợ), EXCEPTION (ngoại lệ).
      </Paragraph>

      <div style={{ marginBottom: 16, textAlign: 'center' }}>
        <Image
          src="/screenshots/action-studio-registry.png"
          alt="Bảng Action Registry"
          style={{ border: '1px solid #e6e9ee', borderRadius: 8, maxWidth: '100%' }}
          preview={{ mask: 'Bấm để phóng to' }}
        />
        <div style={{ marginTop: 6 }}>
          <Text type="secondary" style={{ fontSize: 12 }}>
            Hình 2: Bảng Action Registry — hiển thị danh sách tất cả hành động, phân loại theo nhóm và cho phép sửa hiển thị
          </Text>
        </div>
      </div>

      <SectionBlock title="Các cột trong bảng">
        <ul>
          <li><Text strong>Mã action (Action Code):</Text> định danh duy nhất của hành động (VD: APPROVE, RETURN, BYPASS_COUNCIL).</li>
          <li><Text strong>Registry:</Text> tên hành động và nhóm (STANDARD / SUPPORT / EXCEPTION).</li>
          <li><Text strong>Hiển thị action (Presentation):</Text> nhãn hiển thị trên UI, nhóm UI (PRIMARY — chính / MORE — thêm / EXCEPTION — ngoại lệ), tone màu, icon.</li>
          <li><Text strong>Thứ tự (Order):</Text> thứ tự mặc định khi kết xuất (có thể ghi đè bởi Availability Policy).</li>
          <li><Text strong>Cần lý do / Cần căn cứ / Xác nhận:</Text> cờ từ Registry — có thể ghi đè bởi Policy.</li>
          <li><Text strong>Kích hoạt (Active):</Text> trạng thái bật/tắt toàn cục của action.</li>
        </ul>
      </SectionBlock>
      <SectionBlock title="Thao tác chính">
        <ul>
          <li><Text strong>Xem thông tin:</Text> duyệt bảng để biết action nào đang có sẵn trong hệ thống.</li>
          <li><Text strong>Sửa hiển thị action:</Text> nhấn icon bút chì (✏️) ở cuối dòng để mở cửa sổ (modal) chỉnh nhãn hiển thị, chú thích (tooltip), icon, nhóm UI, tone và thứ tự mặc định.</li>
        </ul>
      </SectionBlock>
      <Alert
        type="info"
        showIcon
        message="Admin không tự tạo action logic mới — action code do hệ thống định nghĩa sẵn."
        description="Tại đây admin chỉ chỉnh được nhãn hiển thị, icon, nhóm UI và thứ tự. Muốn thêm action mới cần can thiệp vào mã nguồn (data/actionRegistry.ts)."
        style={{ marginTop: 8 }}
      />

      {/* ── 3. Luật hiển thị nút ── */}
      <Title level={4} style={{ marginTop: 24, color: '#bf0027' }}>
        <ControlOutlined /> 3. Luật hiển thị nút (Action Availability Policy — chính sách khả dụng)
      </Title>
      <Paragraph>
        Tab <Text strong>Luật hiển thị nút</Text> là nơi cấu hình chính cho nghiệp vụ: quyết định
        <Text strong> action nào</Text> được hiển thị, ở <Text strong> quy trình/bước/trạng thái nào</Text>,
        cho <Text strong> vai trò nào</Text>, và có <Text strong> mở biểu mẫu nào</Text>.
        Hệ thống áp dụng luật theo cơ chế <Text strong>first-match</Text> (khớp theo thứ tự) — luật có thứ tự nhỏ hơn được
        xét trước.
      </Paragraph>

      <div style={{ marginBottom: 16, textAlign: 'center' }}>
        <Image
          src="/screenshots/action-studio-availability.png"
          alt="Bảng Luật hiển thị nút"
          style={{ border: '1px solid #e6e9ee', borderRadius: 8, maxWidth: '100%' }}
          preview={{ mask: 'Bấm để phóng to' }}
        />
        <div style={{ marginTop: 6 }}>
          <Text type="secondary" style={{ fontSize: 12 }}>
            Hình 3: Bảng Luật hiển thị nút — cấu hình action nào hiện ở quy trình/bước/vai trò nào
          </Text>
        </div>
      </div>

      <SectionBlock title="Các cột và ý nghĩa">
        <ul>
          <li><Text strong>Thứ tự (Display Order):</Text> quyết định thứ tự xét luật (first-match). Số nhỏ được xét trước.</li>
          <li><Text strong>Action:</Text> hành động áp dụng, hiển thị tên và nhóm.</li>
          <li><Text strong>Điều kiện hiển thị (Condition):</Text> tổ hợp các điều kiện — surface (bề mặt), quy trình (processCode), trạng thái hồ sơ (dossierStatus), bước BPMN (taskDefinitionKey), vai trò (allowedRoleCodes), điều kiện nghiệp vụ (conditionExpression) và biểu mẫu đính kèm (formKey).</li>
          <li><Text strong>Quyền yêu cầu (Required Permissions):</Text> người dùng phải có các quyền này mới thấy nút.</li>
          <li><Text strong>Bật (Enabled):</Text> công tắc (switch) bật/tắt luật mà không cần xoá.</li>
        </ul>
      </SectionBlock>
      <SectionBlock title="Thông báo đối soát BPMN (Reconcile Alert)">
        <Paragraph>
          Phía trên bảng luật hiển thị luôn có <Text strong>thông báo đối soát BPMN</Text> (Reconcile Alert) với các chỉ số:
        </Paragraph>
        <ul>
          <li><Text strong>🔴 Thiếu nút (Missing):</Text> số bước trong BPMN chưa có luật enabled → bước đó bị kẹt, không ai xử lý được.</li>
          <li><Text strong>🟡 Dùng luật chung (Generic / Wildcard):</Text> số nhánh outcome đang dùng luật chung (không ghim theo bước) — nên ghim cụ thể.</li>
          <li><Text strong>🟡 Thiếu biểu mẫu (Unfilled):</Text> số bước đã có luật nhưng chưa gán biểu mẫu (form).</li>
          <li><Text strong>⚪ Luật mồ côi (Orphan):</Text> số luật trỏ tới tác vụ (task) không còn trong BPMN.</li>
        </ul>
      </SectionBlock>
      <SectionBlock title="Thao tác chính">
        <ul>
          <li><Text strong>Thêm luật:</Text> nhấn "Thêm luật" (➕) → cửa sổ (modal) điền action, điều kiện, vai trò, quyền → lưu.</li>
          <li><Text strong>Sửa luật:</Text> nhấn icon bút chì (✏️) → chỉnh thông tin → lưu.</li>
          <li><Text strong>Xoá luật:</Text> nhấn icon thùng rác (🗑️) → xác nhận xoá.</li>
          <li><Text strong>Bật/tắt luật:</Text> gạt công tắc (switch) để tạm tắt luật mà không mất cấu hình.</li>
          <li><Text strong>Xem đối soát BPMN:</Text> nhấn "Xem đối soát BPMN" để chuyển sang tab Đối soát.</li>
        </ul>
      </SectionBlock>
      <Alert
        type="warning"
        showIcon
        message="Fail-closed (đóng khi thiếu): nếu không có luật nào khớp, action không hiện"
        description="Khi thêm luật mới, hãy đảm bảo luật có điều kiện đủ cụ thể (gắn processCode + taskDefinitionKey) để tránh ảnh hưởng các quy trình khác."
        style={{ marginTop: 8 }}
      />

      {/* ── 4. Đối soát BPMN ── */}
      <Title level={4} style={{ marginTop: 24, color: '#bf0027' }}>
        <SyncOutlined /> 4. Đối soát BPMN (BPMN Reconcile — đối chiếu quy trình)
      </Title>
      <Paragraph>
        Tab <Text strong>Đối soát BPMN</Text> thực hiện đối chiếu 2 chiều giữa mô hình BPMN (các user task — tác vụ người dùng
        và nhánh outcome — kết quả) với các <Text strong>Availability Policy</Text> đang có. Đây là kiểm tra
        <Text strong> đúng-sai (pass/fail)</Text>: nếu BPMN có bước mà policy thiếu, hồ sơ sẽ bị kẹt.
      </Paragraph>

      <div style={{ marginBottom: 16, textAlign: 'center' }}>
        <Image
          src="/screenshots/action-studio-reconcile.png"
          alt="Bảng Đối soát BPMN"
          style={{ border: '1px solid #e6e9ee', borderRadius: 8, maxWidth: '100%' }}
          preview={{ mask: 'Bấm để phóng to' }}
        />
        <div style={{ marginTop: 6 }}>
          <Text type="secondary" style={{ fontSize: 12 }}>
            Hình 4: Bảng Đối soát BPMN — kiểm tra user task ↔ Availability Policy, phát hiện thiếu sót
          </Text>
        </div>
      </div>

      <SectionBlock title="Các trạng thái đối soát (Reconcile Status)">
        <ul>
          <li><Text strong>🟢 Đã ghim đủ (Ok):</Text> tất cả nhánh outcome của bước đã có policy ghim cụ thể theo bước.</li>
          <li><Text strong>🟡 Luật chung (Generic):</Text> nhánh đang dùng policy wildcard (không ghim taskDefinitionKey) — nên ghim cụ thể.</li>
          <li><Text strong>🟡 Thiếu biểu mẫu (Unfilled):</Text> đã có policy nhưng chưa gán formKey.</li>
          <li><Text strong>🔴 Thiếu action (Missing):</Text> chưa có luật enabled cho nhánh outcome → bước bị kẹt.</li>
          <li><Text strong>⚪ Bỏ qua có chủ đích (Skipped):</Text> admin đánh dấu bước này không cần policy (VD: bước không cần thao tác trên UI).</li>
        </ul>
      </SectionBlock>
      <SectionBlock title="Thao tác chính">
        <ul>
          <li><Text strong>Chọn quy trình:</Text> chọn quy trình có BPMN + bảng định tuyến.</li>
          <li><Text strong>Đồng bộ / Đối soát từ BPMN:</Text> nhấn nút để hệ thống tự động tạo/cập nhật (scaffold/upsert) policy cho các nhánh outcome. ID policy là tất định nên chạy lại không đẻ trùng.</li>
          <li><Text strong>Bỏ qua có chủ đích:</Text> gạt công tắc (switch) nếu bước đó cố tình không cần nút xử lý (VD: bước chỉ để hiển thị thông tin).</li>
        </ul>
      </SectionBlock>

      {/* ── 5. Luồng ngoại lệ ── */}
      <Title level={4} style={{ marginTop: 24, color: '#bf0027' }}>
        <SafetyCertificateOutlined /> 5. Luồng ngoại lệ (Exception Policy — chính sách ngoại lệ)
      </Title>
      <Paragraph>
        Tab <Text strong>Luồng ngoại lệ</Text> quản lý các hành động <Text strong>đi khác luồng chuẩn</Text>
        BPMN — như xin bỏ qua Hội đồng (Bypass Council), xin chuyển luồng (Route To), xin duyệt khẩn cấp (Emergency Approval).
        Khác với action STANDARD (chuẩn — đi theo routing BPMN), action ngoại lệ cần được kiểm soát chặt:
      </Paragraph>
      <ul>
        <li>Ai được phép xin ngoại lệ?</li>
        <li>Ai có quyền duyệt ngoại lệ?</li>
        <li>Cần cung cấp căn cứ gì (văn bản, lý do)?</li>
        <li>Sau khi duyệt, hồ sơ đi đâu?</li>
        <li>Mỗi hồ sơ được xin ngoại lệ tối đa bao nhiêu lần?</li>
      </ul>

      <div style={{ marginBottom: 16, textAlign: 'center' }}>
        <Image
          src="/screenshots/action-studio-exception.png"
          alt="Bảng Luồng ngoại lệ"
          style={{ border: '1px solid #e6e9ee', borderRadius: 8, maxWidth: '100%' }}
          preview={{ mask: 'Bấm để phóng to' }}
        />
        <div style={{ marginTop: 6 }}>
          <Text type="secondary" style={{ fontSize: 12 }}>
            Hình 5: Bảng Luồng ngoại lệ — quản lý luật ngoại lệ và cấu hình nút xin ngoại lệ
          </Text>
        </div>
      </div>

      <SectionBlock title="Cấu trúc một luật ngoại lệ">
        <Paragraph>
          Khi tạo/sửa luật ngoại lệ, cửa sổ (modal) chia làm 4 phần:
        </Paragraph>
        <ol>
          <li><Text strong>Ngoại lệ xảy ra ở đâu?</Text> — tên, quy trình, đối tượng (hồ sơ/nhiệm vụ/đề xuất), trạng thái, bước phát sinh.</li>
          <li><Text strong>Nút xin ngoại lệ trên hồ sơ</Text> — chọn action ngoại lệ, vai trò thấy nút, thứ tự, bật/tắt. Hệ thống tự động tạo/cập nhật Availability Policy cho nút này.</li>
          <li><Text strong>Ai duyệt và cần căn cứ gì?</Text> — vai trò duyệt, có bắt buộc lý do/căn cứ, tối đa mỗi hồ sơ, độ ưu tiên.</li>
          <li><Text strong>Nếu được duyệt thì đi đâu?</Text> — chuyển tới bước BPMN khác, đổi trạng thái đối tượng, hoặc kết thúc xử lý.</li>
        </ol>
      </SectionBlock>
      <SectionBlock title="Xem trước luồng và preview nút">
        <Paragraph>
          Khi chỉnh sửa luật ngoại lệ, panel bên phải hiển thị:
        </Paragraph>
        <ul>
          <li><Text strong>Luật hiển thị nút sinh kèm:</Text> thông tin tóm tắt về Availability Policy tự động tạo.</li>
          <li><Text strong>Xem trước luồng xử lý (Routing Preview):</Text> sơ đồ routing — bước phát sinh, nhánh ngoại lệ, đích đến.</li>
          <li><Text strong>Xem trước hiển thị nút (Button Preview):</Text> nút xin ngoại lệ sẽ trông như thế nào trên UI chi tiết hồ sơ (màu sắc, chú thích, vai trò thấy nút).</li>
        </ul>
      </SectionBlock>
      <Alert
        type="warning"
        showIcon
        message="Mỗi luật ngoại lệ tự động sinh một Luật hiển thị nút"
        description="Khi lưu luật ngoại lệ, hệ thống đồng thời tạo/cập nhật một Availability Policy cho action ngoại lệ tương ứng. Nếu xoá luật ngoại lệ, policy liên quan cũng bị xoá theo. Admin cấu hình một lần nhưng vẫn thấy rõ: nút hiện ở đâu, ai được xin, ai duyệt và hồ sơ đi đâu."
        style={{ marginTop: 8 }}
      />

      {/* ── 6. Luồng xử lý ── */}
      <Title level={4} style={{ marginTop: 24, color: '#bf0027' }}>
        <PartitionOutlined /> 6. Luồng xử lý (Routing Matrix — ma trận định tuyến)
      </Title>
      <Paragraph>
        Tab <Text strong>Luồng xử lý</Text> hiển thị <Text strong>ma trận định tuyến</Text> (Routing Matrix) của từng quy trình
        — ứng với mỗi bước, các nhánh kết quả xử lý (Đồng ý → bước tiếp, Trả lại → bước trước, Từ chối → kết thúc…)
        đưa hồ sơ tới đâu. Cùng một thành phần <Text code>StepRoutingDiagram</Text> mà màn Chi tiết hồ sơ dùng
        ở thời gian chạy (runtime), nhưng ở đây xem theo <Text strong>loại bước</Text> (design-time), không gắn hồ sơ cụ thể.
      </Paragraph>

      <div style={{ marginBottom: 16, textAlign: 'center' }}>
        <Image
          src="/screenshots/action-studio-routing.png"
          alt="Bảng Luồng xử lý"
          style={{ border: '1px solid #e6e9ee', borderRadius: 8, maxWidth: '100%' }}
          preview={{ mask: 'Bấm để phóng to' }}
        />
        <div style={{ marginTop: 6 }}>
          <Text type="secondary" style={{ fontSize: 12 }}>
            Hình 6: Ma trận định tuyến (Routing Matrix) — xem các nhánh outcome và bước đích thiết kế
          </Text>
        </div>
      </div>

      <SectionBlock title="Thao tác chính">
        <ul>
          <li><Text strong>Chọn quy trình:</Text> danh sách thả xuống (dropdown) chọn quy trình cần xem (RD01.01, RD02, RD05…).</li>
          <li><Text strong>Xem sơ đồ:</Text> mỗi bước trong quy trình hiển thị dưới dạng thẻ (card) kèm sơ đồ routing — nhánh outcome (màu sắc), bước đích, vai trò xử lý.</li>
        </ul>
      </SectionBlock>
      <Alert
        type="info"
        showIcon
        message="Sửa luồng routing tại data/stepRouting.ts"
        description="Đây là tab xem, không phải cấu hình. Nếu cần thay đổi đích đến của một nhánh outcome (VD: 'Trả lại' về bước nào), sửa trực tiếp file data/stepRouting.ts. Routing ở tab này đồng bộ với routing ở runtime (Chi tiết hồ sơ)."
        style={{ marginTop: 8 }}
      />

      {/* ── 7. Mô phỏng ── */}
      <Title level={4} style={{ marginTop: 24, color: '#bf0027' }}>
        <ApiOutlined /> 7. Mô phỏng (Inspector / Simulator — công cụ mô phỏng)
      </Title>
      <Paragraph>
        Tab <Text strong>Mô phỏng</Text> cho phép admin kiểm thử ngay trên trình duyệt: chọn ngữ cảnh
        nghiệp vụ (surface — bề mặt, quy trình, trạng thái, bước) và ngữ cảnh người dùng (vai trò, quyền, admin),
        hệ thống sẽ kết xuất (render) kết quả API <Text code>available-actions</Text> giống hệt những gì UI chi tiết
        hồ sơ sẽ nhận được.
      </Paragraph>

      <div style={{ marginBottom: 16, textAlign: 'center' }}>
        <Image
          src="/screenshots/action-studio-inspector.png"
          alt="Tab Mô phỏng"
          style={{ border: '1px solid #e6e9ee', borderRadius: 8, maxWidth: '100%' }}
          preview={{ mask: 'Bấm để phóng to' }}
        />
        <div style={{ marginTop: 6 }}>
          <Text type="secondary" style={{ fontSize: 12 }}>
            Hình 7: Tab Mô phỏng — chọn ngữ cảnh và xem action được render tương ứng
          </Text>
        </div>
      </div>

      <SectionBlock title="Các bước mô phỏng (Simulation Steps)">
        <ol>
          <li><Text strong>Chọn ngữ cảnh nghiệp vụ (Business Context):</Text> surface (màn hình), quy trình, trạng thái hồ sơ, task key và cấp nhiệm vụ.</li>
          <li><Text strong>Chọn ngữ cảnh người dùng (User Context):</Text> vai trò (có thể chọn nhiều), quyền, trạng thái admin (bỏ qua kiểm tra role/permission).</li>
          <li><Text strong>Bật/tắt điều kiện ngoại lệ:</Text> còn bước phía sau để chuyển, user đang xử lý bước hiện tại, đang có yêu cầu ngoại lệ mở.</li>
          <li><Text strong>Đọc kết quả:</Text> action hiển thị theo nhóm UI (PRIMARY — chính / MORE — thêm / EXCEPTION — ngoại lệ). Action mờ = có rule hiển thị nhưng chưa đủ điều kiện bấm (di chuột để xem lý do).</li>
          <li><Text strong>Đối chiếu payload JSON:</Text> phần cuối cùng hiển thị chính xác dữ liệu (payload) UI nghiệp vụ sẽ nhận từ available-actions API.</li>
        </ol>
      </SectionBlock>
      <SectionBlock title="Công thức hiển thị nút (Button Visibility Formula)">
        <Text code>
          Action Definition + Workflow Step + User Role + Permission + Business Condition + Exception Policy + Dossier State
        </Text>
      </SectionBlock>
      <Alert
        type="success"
        showIcon
        message="Mô phỏng là bước cuối trước khi triển khai"
        description="Sau mỗi lần chỉnh sửa luật, vào tab Mô phỏng để kiểm tra ngay. Nếu kết quả không đúng như kỳ vọng, kiểm tra lại thứ tự luật, điều kiện, và trạng thái bật/tắt ở các tab trước."
        style={{ marginTop: 8 }}
      />
    </div>
  );
}

function FAQContent() {
  return (
    <div>
      <Title level={3}><QuestionCircleOutlined style={{ color: '#bf0027' }} /> Câu hỏi thường gặp (FAQ)</Title>
      <Divider />

      <Collapse
        defaultActiveKey={[]}
        expandIconPosition="end"
        items={[
          {
            key: '1',
            label: 'Tôi quên mật khẩu đăng nhập, phải làm sao?',
            children: (
              <Text>Trong giai đoạn demo, mật khẩu mặc định là <Text code>123456</Text>. Trong giai đoạn chính thức, liên hệ Quản trị viên hệ thống để được cấp lại mật khẩu.</Text>
            ),
          },
          {
            key: '2',
            label: 'Hồ sơ của tôi bị trả lại, tôi cần làm gì?',
            children: (
              <Text>Hồ sơ bị trả lại thường kèm lý do từ người phê duyệt. Bạn cần: (1) Đọc kỹ lý do và ý kiến trong dòng thời gian phê duyệt; (2) Sửa/chỉnh sửa hồ sơ theo yêu cầu; (3) Trình ký lại. Hệ thống sẽ tự động chuyển hồ sơ đến đúng bước cần sửa.</Text>
            ),
          },
          {
            key: '3',
            label: 'Làm thế nào để theo dõi tiến độ hồ sơ đã trình?',
            children: (
              <Text>Vào trang <Text strong>Hồ sơ KHCN</Text> → chọn hồ sơ đã trình → xem mục <Text strong>"Dòng thời gian phê duyệt"</Text> hoặc <Text strong>"Sơ đồ nhánh"</Text> để biết hồ sơ đang ở bước nào và ai đang xử lý.</Text>
            ),
          },
          {
            key: '4',
            label: 'Tôi có thể uỷ quyền cho người khác xử lý hồ sơ không?',
            children: (
              <Text>Tính năng uỷ quyền được quản lý qua <Text strong>Ma trận phê duyệt</Text> (mục Vận hành & Tích hợp). Quản trị viên có thể thiết lập uỷ quyền theo khoảng thời gian. Trong giai đoạn hiện tại, tính năng này đang được mô phỏng.</Text>
            ),
          },
          {
            key: '5',
            label: 'Sự khác nhau giữa "Nhiệm vụ KHCN" và "Hồ sơ KHCN" là gì?',
            children: (
              <div>
                <Paragraph>
                  <Text strong>Nhiệm vụ KHCN (Mission)</Text> là bản ghi chủ của một đề tài, xuyên suốt toàn bộ vòng đời
                  (từ chủ trương → nghiệm thu). Một nhiệm vụ <Text strong>chỉ có một</Text>.
                </Paragraph>
                <Paragraph>
                  <Text strong>Hồ sơ KHCN (Dossier)</Text> là gói tài liệu của từng giai đoạn (một hồ sơ chủ trương,
                  một hồ sơ xét duyệt, một hồ sơ nghiệm thu…). Một nhiệm vụ có <Text strong>nhiều hồ sơ</Text>.
                </Paragraph>
              </div>
            ),
          },
          {
            key: '6',
            label: 'Tôi muốn thêm người dùng mới vào hệ thống?',
            children: (
              <Text>Vào mục <Text strong>Quản trị tổ chức → Quản trị người dùng</Text>. Nhấn "Thêm người dùng", điền thông tin và gán vai trò phù hợp. Lưu ý: chỉ Quản trị viên hệ thống mới có quyền này.</Text>
            ),
          },
          {
            key: '7',
            label: 'Hạn xử lý (SLA) được tính thế nào?',
            children: (
              <Text>Mỗi bước trong quy trình có một thời hạn xử lý (số ngày làm việc). Hạn được đếm từ khi hồ sơ đến bước đó. Nếu quá hạn, hệ thống ghi nhận và cảnh báo. Chi tiết SLA đang được hoàn thiện (OQ-006).</Text>
            ),
          },
          {
            key: '8',
            label: 'Làm sao để xuất báo cáo / văn bản từ hệ thống?',
            children: (
              <Text>Các văn bản (Quyết định, Biên bản họp, Báo cáo thẩm định…) được sinh từ biểu mẫu đã điền. Khi xem hồ sơ chi tiết, nhấn nút <Text strong>"In văn bản"</Text> để xuất file văn bản chính thức.</Text>
            ),
          },
        ]}
      />
    </div>
  );
}

// ─── DANH SÁCH TẤT CẢ SECTIONS ──────────────────────────────────────────────
const ALL_SECTIONS: HelpSection[] = [
  { key: 'overview',  icon: <BookOutlined />,         label: 'Tổng quan hệ thống',  category: 'common', content: OverviewContent },
  { key: 'dashboard', icon: <DashboardOutlined />,     label: 'Tổng quan',           category: 'common', content: DashboardContent },
  { key: 'worklist',  icon: <CarryOutOutlined />,      label: 'Việc của tôi',        category: 'common', content: WorklistContent },
  { key: 'nhiemvu',   icon: <ExperimentOutlined />,    label: 'Nhiệm vụ KHCN',       category: 'work',   content: NhiemVuContent },
  { key: 'hoso',      icon: <FileTextOutlined />,      label: 'Hồ sơ KHCN',          category: 'work',   content: HoSoContent },
  { key: 'admin-overview', icon: <AppstoreOutlined />,       label: 'Tổng quan',            category: 'admin',  content: AdminTongQuanContent },
  { key: 'quytrinh',  icon: <PartitionOutlined />,     label: 'Quản lý quy trình',   category: 'admin',  content: QuyTrinhContent },
  { key: 'bieumau',   icon: <FormOutlined />,          label: 'Thư viện biểu mẫu',   category: 'admin',  content: BienMauContent },
  { key: 'donvi',     icon: <ApartmentOutlined />,     label: 'Quản trị đơn vị',     category: 'org',    content: ToChucContent },
  { key: 'giamsat',   icon: <ThunderboltOutlined />,   label: 'Giám sát tiến trình', category: 'ops',    content: GiamSatContent },
  { key: 'tichhop',   icon: <ApiOutlined />,           label: 'Trạng thái Tích hợp', category: 'ops',    content: TichHopContent },
  { key: 'nhatky',    icon: <HistoryOutlined />,       label: 'Nhật ký',             category: 'ops',    content: NhatKyContent },
  { key: 'luat',      icon: <ClusterOutlined />,       label: 'Quản lý luật',        category: 'admin',  content: LuatContent },
  { key: 'matran',    icon: <SolutionOutlined />,      label: 'Ma trận phê duyệt',   category: 'admin',  content: MaTranContent },
  { key: 'hanhdong',  icon: <ControlOutlined />,       label: 'Ma trận Hành động',  category: 'admin',  content: HanhDongContent },
  { key: 'faq',       icon: <QuestionCircleOutlined />, label: 'Câu hỏi thường gặp', category: 'common', content: FAQContent },
];

const CATEGORY_META: Record<string, { label: string; color: string }> = {
  common: { label: 'Chung', color: '#0958d9' },
  work:   { label: 'Nghiệp vụ KHCN', color: '#bf0027' },
  admin:  { label: 'Quản trị', color: '#7c3aed' },
  org:    { label: 'Tổ chức & Phân quyền', color: '#08979c' },
  ops:    { label: 'Vận hành & Tích hợp', color: '#d48806' },
};

// ─── component con ───────────────────────────────────────────────────────────

function RowSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div style={{ marginBottom: 20 }}>
      <Title level={4} style={{ color: '#333' }}>{title}</Title>
      {children}
    </div>
  );
}

function SectionBlock({ title, children }: { title: string; children: ReactNode }) {
  return (
    <Card size="small" title={title} style={{ marginBottom: 12, borderLeft: '3px solid #bf0027' }}>
      {children}
    </Card>
  );
}

function FeatureCard({ icon, title, desc }: { icon: ReactNode; title: string; desc: string }) {
  return (
    <Card
      hoverable
      style={{ flex: '1 1 220px', minWidth: 200 }}
      styles={{ body: { textAlign: 'center' } }}
    >
      <div style={{ fontSize: 32, color: '#bf0027', marginBottom: 8 }}>{icon}</div>
      <Text strong style={{ display: 'block', marginBottom: 4 }}>{title}</Text>
      <Text type="secondary" style={{ fontSize: 13 }}>{desc}</Text>
    </Card>
  );
}

// ─── page chính ──────────────────────────────────────────────────────────────
export default function TroGiup() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const sectionFromUrl = searchParams.get('section') || 'overview';
  const [activeKey, setActiveKey] = useState(sectionFromUrl);
  const [searchText, setSearchText] = useState('');

  // Đồng bộ URL → state
  useEffect(() => {
    const s = searchParams.get('section') || 'overview';
    setActiveKey(s);
  }, [searchParams]);

  const activeSection = ALL_SECTIONS.find((s) => s.key === activeKey);

  // Nhóm sections theo category cho sidebar
  const grouped = useMemo(() => {
    const map: Record<string, HelpSection[]> = {};
    for (const s of ALL_SECTIONS) {
      if (searchText) {
        const q = searchText.toLowerCase();
        if (!s.label.toLowerCase().includes(q)) continue;
      }
      if (!map[s.category]) map[s.category] = [];
      map[s.category].push(s);
    }
    return map;
  }, [searchText]);

  return (
    <Layout style={{ background: 'transparent', minHeight: 'calc(100vh - 140px)' }}>
      {/* Sidebar */}
      <Sider
        width={270}
        style={{
          background: '#fff',
          borderRadius: 8,
          marginRight: 16,
          border: '1px solid #e6e9ee',
          overflow: 'auto',
          padding: '12px 0',
        }}
      >
        <div style={{ padding: '0 12px 12px' }}>
          <Input
            prefix={<SearchOutlined />}
            placeholder="Tìm hướng dẫn..."
            allowClear
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
          />
        </div>

        {Object.entries(grouped).map(([cat, sections]) => (
          <div key={cat} style={{ marginBottom: 8 }}>
            <div style={{
              padding: '4px 16px',
              fontSize: 11,
              fontWeight: 600,
              textTransform: 'uppercase',
              color: CATEGORY_META[cat]?.color || '#999',
              letterSpacing: 0.5,
            }}>
              {CATEGORY_META[cat]?.label || cat}
            </div>
            {sections.map((s) => (
              <div
                key={s.key}
                onClick={() => {
                  setActiveKey(s.key);
                  navigate(`/tro-giup?section=${s.key}`, { replace: true });
                }}
                style={{
                  padding: '6px 16px 6px 24px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  fontSize: 14,
                  color: activeKey === s.key ? '#bf0027' : '#333',
                  background: activeKey === s.key ? '#fff1f0' : 'transparent',
                  borderRight: activeKey === s.key ? '3px solid #bf0027' : '3px solid transparent',
                  transition: 'all 0.15s',
                }}
                onMouseEnter={(e) => {
                  if (activeKey !== s.key) {
                    (e.currentTarget as HTMLElement).style.background = '#f5f5f5';
                  }
                }}
                onMouseLeave={(e) => {
                  if (activeKey !== s.key) {
                    (e.currentTarget as HTMLElement).style.background = 'transparent';
                  }
                }}
              >
                <span style={{ fontSize: 16, flexShrink: 0 }}>{s.icon}</span>
                <span>{s.label}</span>
              </div>
            ))}
          </div>
        ))}

        {Object.keys(grouped).length === 0 && (
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description="Không tìm thấy kết quả"
            style={{ marginTop: 24 }}
          />
        )}
      </Sider>

      {/* Nội dung */}
      <Content style={{ background: '#fff', borderRadius: 8, border: '1px solid #e6e9ee', padding: 32, overflow: 'auto' }}>
        {activeSection ? activeSection.content() : (
          <Empty description="Chọn một mục hướng dẫn từ bên trái" />
        )}
      </Content>
    </Layout>
  );
}
