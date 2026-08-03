import {
  AlignLeftOutline,
  ApartmentOutline,
  ApiOutline,
  AppstoreOutline,
  BankOutline,
  BlockOutline,
  BookOutline,
  BranchesOutline,
  CalendarOutline,
  CarryOutOutline,
  CheckCircleOutline,
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
  DownSquareOutline,
  EditOutline,
  ExclamationCircleOutline,
  ExperimentOutline,
  EyeInvisibleOutline,
  EyeOutline,
  FieldNumberOutline,
  FileTextOutline,
  FileExcelOutline,
  FilePdfOutline,
  FileZipOutline,
  FilterOutline,
  FileAddOutline,
  FolderOpenOutline,
  FontSizeOutline,
  FormOutline,
  FunctionOutline,
  GroupOutline,
  HistoryOutline,
  Html5Outline,
  KeyOutline,
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
  ProfileOutline,
  RedoOutline,
  ReloadOutline,
  RetweetOutline,
  RobotOutline,
  SafetyCertificateOutline,
  SafetyOutline,
  SaveOutline,
  SearchOutline,
  SendOutline,
  SettingOutline,
  ShoppingCartOutline,
  SolutionOutline,
  SwapOutline,
  SyncOutline,
  TableOutline,
  TagsOutline,
  TeamOutline,
  ThunderboltOutline,
  ToolOutline,
  UndoOutline,
  UnorderedListOutline,
  UploadOutline,
  UserOutline,
  WarningOutline,
  ArrowLeftOutline,
  ArrowRightOutline,
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

export const NHIEM_VU_ICONS = [ArrowLeftOutline, FileAddOutline, FileExcelOutline, FilePdfOutline, FileZipOutline, FolderOpenOutline];

/**
 * Icon dùng trong màn Trạng thái Tích hợp (`/tich-hop`, D17 Angular migration) —
 * đăng ký tường minh cùng lý do với các mảng icon phía trên. `apartment`/`api`/
 * `database`/`disconnect`/`link`/`team` đã có sẵn ở NAV_ICONS/khác, chỉ thêm phần
 * chưa đăng ký (icon tile SystemCard + nút Cấu hình/Kết nối).
 */
export const INTEGRATION_ICONS = [BankOutline, SafetyCertificateOutline, SettingOutline, ShoppingCartOutline];

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
