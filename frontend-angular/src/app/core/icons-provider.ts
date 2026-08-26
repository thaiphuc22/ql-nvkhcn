import {
  AlignLeftOutline,
  ApartmentOutline,
  ApiOutline,
  AppstoreOutline,
  ArrowLeftOutline,
  ArrowRightOutline,
  BankOutline,
  BellOutline,
  BlockOutline,
  BookOutline,
  BranchesOutline,
  CalendarOutline,
  CarryOutOutline,
  CheckCircleOutline,
  CheckOutline,
  CheckSquareOutline,
  ClockCircleOutline,
  CloseCircleOutline,
  CloseOutline,
  CloudDownloadOutline,
  ColumnHeightOutline,
  CopyOutline,
  DashboardOutline,
  DatabaseOutline,
  DeleteOutline,
  DisconnectOutline,
  DownOutline,
  DownSquareOutline,
  DownloadOutline,
  EditOutline,
  ExclamationCircleOutline,
  ExperimentOutline,
  EyeInvisibleOutline,
  EyeOutline,
  FieldNumberOutline,
  FileAddOutline,
  FileExcelOutline,
  FilePdfOutline,
  FileTextOutline,
  FileZipOutline,
  FilterOutline,
  FolderOpenOutline,
  FontSizeOutline,
  FormOutline,
  FunctionOutline,
  GroupOutline,
  HistoryOutline,
  Html5Outline,
  InfoCircleOutline,
  KeyOutline,
  LeftOutline,
  LinkOutline,
  LockOutline,
  LoginOutline,
  LogoutOutline,
  MailOutline,
  MenuFoldOutline,
  MenuUnfoldOutline,
  MinusOutline,
  MoreOutline,
  PaperClipOutline,
  PartitionOutline,
  PictureOutline,
  PlayCircleOutline,
  PlusOutline,
  PrinterOutline,
  ProfileOutline,
  ProjectOutline,
  RedoOutline,
  ReloadOutline,
  RetweetOutline,
  RightOutline,
  RobotOutline,
  SafetyCertificateOutline,
  SafetyOutline,
  SaveOutline,
  SearchOutline,
  SendOutline,
  SettingOutline,
  ShoppingCartOutline,
  SolutionOutline,
  StopOutline,
  SwapOutline,
  SyncOutline,
  TableOutline,
  TagsOutline,
  TeamOutline,
  ThunderboltOutline,
  ToolOutline,
  UndoOutline,
  UnorderedListOutline,
  UpOutline,
  UploadOutline,
  UserOutline,
  WarningOutline,
} from '@ant-design/icons-angular/icons';

/** Icon dùng trong shell (sider/header) + login — đăng ký tường minh, tránh bundle cả bộ icon. */
export const NAV_ICONS = [
  ArrowRightOutline,
  ApartmentOutline,
  ApiOutline,
  BookOutline,
  CarryOutOutline,
  DashboardOutline,
  DatabaseOutline,
  ExperimentOutline,
  FormOutline,
  HistoryOutline,
  KeyOutline,
  LockOutline,
  LoginOutline,
  LogoutOutline,
  MailOutline,
  MenuFoldOutline,
  MenuUnfoldOutline,
  PartitionOutline,
  SafetyOutline,
  TeamOutline,
  ThunderboltOutline,
  UserOutline,
];

/**
 * Icon dùng trong màn Ma trận phê duyệt (`/ma-tran-phe-duyet`, D17 Angular
 * migration) — đăng ký tường minh cùng lý do với NAV_ICONS ở trên. Trước khi có
 * danh sách này, `nz-icon` với các mã dưới đây phải fetch động qua HTTP (yêu cầu
 * mạng, không chạy được trong unit test) — đăng ký tĩnh tránh phụ thuộc mạng.
 */
export const APPROVAL_MATRIX_ICONS = [
  AppstoreOutline,
  BranchesOutline,
  CopyOutline,
  DeleteOutline,
  EditOutline,
  PlusOutline,
  SaveOutline,
  SolutionOutline,
  SwapOutline,
  SyncOutline,
  WarningOutline,
];

/**
 * Icon dùng trong màn Cấu hình Service Task (`/cau-hinh-service-task`, nav "Tác vụ
 * hệ thống") — đăng ký tường minh cùng lý do với NAV_ICONS/APPROVAL_MATRIX_ICONS.
 */
export const SERVICE_TASK_ICONS = [
  CheckCircleOutline,
  ClockCircleOutline,
  CloseCircleOutline,
  DisconnectOutline,
  ExclamationCircleOutline,
  EyeOutline,
  FileTextOutline,
  FilterOutline,
  LinkOutline,
  MoreOutline,
  PlayCircleOutline,
  ReloadOutline,
  RetweetOutline,
  RobotOutline,
  SendOutline,
  ToolOutline,
];

/**
 * Icon dùng trong Thư viện biểu mẫu / Trình thiết kế biểu mẫu (`/phan-he/PH3/bieu-mau`,
 * D17 Angular migration) — đăng ký tường minh cùng lý do với các mảng icon phía trên.
 */
export const EFORM_ICONS = [
  AlignLeftOutline,
  BlockOutline,
  CalendarOutline,
  CheckSquareOutline,
  CloseOutline,
  ColumnHeightOutline,
  DownSquareOutline,
  EyeInvisibleOutline,
  FieldNumberOutline,
  FontSizeOutline,
  FunctionOutline,
  GroupOutline,
  Html5Outline,
  MinusOutline,
  PaperClipOutline,
  PictureOutline,
  ProfileOutline,
  RedoOutline,
  SearchOutline,
  TableOutline,
  TagsOutline,
  UndoOutline,
  UnorderedListOutline,
  UploadOutline,
];

export const NHIEM_VU_ICONS = [
  ArrowLeftOutline,
  FileAddOutline,
  FileExcelOutline,
  FilePdfOutline,
  FileZipOutline,
  FolderOpenOutline,
];

/**
 * Icon dùng trong màn Trạng thái Tích hợp (`/tich-hop`, D17 Angular migration) —
 * đăng ký tường minh cùng lý do với các mảng icon phía trên. `apartment`/`api`/
 * `database`/`disconnect`/`link`/`team` đã có sẵn ở NAV_ICONS/khác, chỉ thêm phần
 * chưa đăng ký (icon tile SystemCard + nút Cấu hình/Kết nối).
 */
export const INTEGRATION_ICONS = [
  BankOutline,
  SafetyCertificateOutline,
  SettingOutline,
  ShoppingCartOutline,
];

/**
 * Icon dùng ở màn Danh mục quy trình (`/quy-trinh`) — cùng lý do với các nhóm trên: chưa có nhóm
 * nào đăng ký `reload`/`upload`/`plus`/`search`, nên trước đây `nz-icon` phải fetch SVG động qua
 * HTTP. `cloud-download` là icon của nút "Đồng bộ từ Camunda".
 */
export const PROCESS_CATALOG_ICONS = [
  CloudDownloadOutline,
  PlusOutline,
  ReloadOutline,
  SearchOutline,
  UploadOutline,
];

/**
 * Icon **dùng động** — mã icon đến từ DỮ LIỆU chứ không viết cứng trong template.
 *
 * Trước 2026-08-26 nhóm này tên `HR_TOOLS_ICONS` và được cho là chỉ phục vụ phân hệ HR Tools. Sai:
 * `ho-so-detail.html`, `action-studio.html` và `app-list.html` bind `[nzType]="item.icon"` với mã
 * lấy từ danh mục hành động / `APP_REGISTRY`, nên các mã này vẫn nổ ra ở ba phân hệ ng-zorro.
 *
 * Bằng chứng, không phải suy đoán: HR Tools chuyển sang PrimeNG (D23) rồi gỡ nhóm này đi thì
 * `ho-so-detail.spec.ts` từ 8 fail có sẵn vọt lên 16 và `ho-so-create.spec.ts` thêm 1 fail —
 * `nz-icon` với mã chưa đăng ký phải fetch SVG động qua HTTP, mà unit test không có mạng.
 *
 * ⚠ Vì vậy **đừng gỡ nhóm này** khi thấy HR Tools không còn dùng `nz-icon`. Muốn gỡ mã nào thì phải
 * soát cả các chỗ bind `[nzType]` động trước.
 */
export const DYNAMIC_NZ_ICONS = [
  BellOutline,
  CheckOutline,
  DownOutline,
  DownloadOutline,
  InfoCircleOutline,
  LeftOutline,
  PrinterOutline,
  ProjectOutline,
  RightOutline,
  StopOutline,
  UpOutline,
];
