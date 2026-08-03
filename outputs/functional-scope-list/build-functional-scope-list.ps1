$ErrorActionPreference = 'Stop'

$inputPath = 'C:\Users\phuctd7\Downloads\VTH\VHT_WBS.xlsx'
$outputDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$outputPath = Join-Path $outputDir 'VHT_Functional_Scope_List_v4.xlsx'

New-Item -ItemType Directory -Force -Path $outputDir | Out-Null
if (Test-Path -LiteralPath $outputPath) { Remove-Item -LiteralPath $outputPath -Force }

$features = [System.Collections.Generic.List[object]]::new()
$seqByModule = @{}
$globalSeq = 0

function Add-Feature {
    param(
        [string]$DomainCode,
        [string]$Domain,
        [string]$ModuleCode,
        [string]$Module,
        [string]$Group,
        [string]$Feature,
        [string]$Description,
        [string]$Roles = 'Người dùng nghiệp vụ',
        [string]$Type = 'Nghiệp vụ',
        [string]$Process = '',
        [string]$Priority = 'Should',
        [string]$Release = 'Pha 2',
        [string]$ScopeStatus = 'Đề xuất trong phạm vi',
        [string]$Source = 'Bổ sung',
        [string]$Acceptance = ''
    )
    $script:globalSeq++
    $key = "$DomainCode.$ModuleCode"
    if (-not $script:seqByModule.ContainsKey($key)) { $script:seqByModule[$key] = 0 }
    $script:seqByModule[$key]++
    $id = '{0}-{1}-{2:D3}' -f $DomainCode, $ModuleCode, $script:seqByModule[$key]
    $script:features.Add([pscustomobject]@{
        STT = $script:globalSeq
        ID = $id
        Domain = $Domain
        Module = $Module
        Group = $Group
        Feature = $Feature
        Description = $Description
        Roles = $Roles
        Type = $Type
        Process = $Process
        Priority = $Priority
        Release = $Release
        ScopeStatus = $ScopeStatus
        Source = $Source
        Acceptance = $Acceptance
    })
}

function Add-CrudSet {
    param(
        [string]$DomainCode,[string]$Domain,[string]$ModuleCode,[string]$Module,[string]$Entity,
        [string]$Roles='Cán bộ nghiệp vụ',[string]$Process='',[string]$Priority='Must',[string]$Release='Pha 1',
        [string]$Source='Bổ sung',[switch]$Submit,[switch]$History,[switch]$Clone
    )
    Add-Feature $DomainCode $Domain $ModuleCode $Module $Entity "Xem danh sách $Entity" "Tra cứu danh sách, phân trang, sắp xếp và lọc $Entity theo các tiêu chí nghiệp vụ." $Roles 'Nghiệp vụ' $Process $Priority $Release 'Đề xuất trong phạm vi' $Source 'Danh sách hiển thị đúng phạm vi dữ liệu và hỗ trợ lọc/xuất theo quyền.'
    Add-Feature $DomainCode $Domain $ModuleCode $Module $Entity "Tạo mới $Entity" "Khởi tạo $Entity, kiểm tra dữ liệu bắt buộc và lưu nháp trước khi hoàn tất." $Roles 'Nghiệp vụ' $Process $Priority $Release 'Đề xuất trong phạm vi' $Source 'Dữ liệu hợp lệ được lưu; lỗi validation hiển thị tại trường tương ứng.'
    if ($Clone) { Add-Feature $DomainCode $Domain $ModuleCode $Module $Entity "Sao chép $Entity" "Tạo bản mới từ một $Entity hiện hữu và loại bỏ các thông tin không được kế thừa." $Roles 'Nghiệp vụ' $Process 'Should' $Release 'Đề xuất trong phạm vi' $Source 'Bản sao có mã/phiên bản mới và không làm thay đổi bản nguồn.' }
    Add-Feature $DomainCode $Domain $ModuleCode $Module $Entity "Xem chi tiết $Entity" "Hiển thị thông tin tổng quan, dữ liệu chi tiết, tài liệu liên quan và trạng thái của $Entity." $Roles 'Nghiệp vụ' $Process $Priority $Release 'Đề xuất trong phạm vi' $Source 'Thông tin hiển thị đúng phiên bản và quyền truy cập.'
    Add-Feature $DomainCode $Domain $ModuleCode $Module $Entity "Chỉnh sửa $Entity" "Cập nhật $Entity khi trạng thái và quyền người dùng cho phép; kiểm soát xung đột cập nhật." $Roles 'Nghiệp vụ' $Process $Priority $Release 'Đề xuất trong phạm vi' $Source 'Chỉ trường được phép sửa có hiệu lực và thay đổi được ghi lịch sử.'
    Add-Feature $DomainCode $Domain $ModuleCode $Module $Entity "Xóa/Ngừng sử dụng $Entity" "Xóa logic hoặc ngừng sử dụng $Entity sau khi kiểm tra ràng buộc tham chiếu." 'Quản trị/Cán bộ nghiệp vụ' 'Nghiệp vụ' $Process 'Should' $Release 'Đề xuất trong phạm vi' $Source 'Không xóa vật lý dữ liệu đã phát sinh giao dịch; cảnh báo rõ quan hệ phụ thuộc.'
    if ($Submit) { Add-Feature $DomainCode $Domain $ModuleCode $Module $Entity "Trình duyệt $Entity" "Kiểm tra điều kiện, khóa phiên bản trình và khởi tạo/tiếp tục quy trình phê duyệt $Entity." 'Người lập/Chủ nhiệm nhiệm vụ' 'Workflow' $Process 'Must' $Release 'Đề xuất trong phạm vi' $Source 'Tạo đúng process instance, business key và task đầu tiên; không submit trùng.' }
    if ($History) { Add-Feature $DomainCode $Domain $ModuleCode $Module $Entity "Xem lịch sử $Entity" "Theo dõi phiên bản, thay đổi dữ liệu, người thực hiện và lịch sử xử lý của $Entity." 'Cán bộ nghiệp vụ/Quản trị' 'Audit' $Process 'Must' $Release 'Đề xuất trong phạm vi' $Source 'Lịch sử không thể sửa và truy vết được trước/sau của thay đổi quan trọng.' }
}

# 01. Truy cập, tổ chức và phân quyền
$d='Truy cập, Tổ chức & Phân quyền'
Add-Feature 'IAM' $d 'SSO' 'Đăng nhập & SSO' 'Xác thực' 'Đăng nhập qua SSO/OIDC' 'Chuyển hướng đến Identity Provider, nhận token và tạo phiên làm việc hợp lệ.' 'Tất cả người dùng' 'Nền tảng' '' 'Must' 'Pha 1' 'Đề xuất trong phạm vi' 'Hiệu chỉnh từ VHT_WBS' 'Đăng nhập thành công bằng tài khoản hợp lệ; lỗi xác thực không làm lộ thông tin nhạy cảm.'
Add-Feature 'IAM' $d 'SSO' 'Đăng nhập & SSO' 'Xác thực' 'Đăng xuất tập trung' 'Kết thúc phiên ứng dụng và phiên SSO theo chính sách tổ chức.' 'Tất cả người dùng' 'Nền tảng' '' 'Must' 'Pha 1' 'Đề xuất trong phạm vi' 'Hiệu chỉnh từ VHT_WBS'
Add-Feature 'IAM' $d 'SSO' 'Đăng nhập & SSO' 'Bảo mật phiên' 'Gia hạn và hết hạn phiên' 'Quản lý refresh token, timeout không hoạt động và bắt buộc đăng nhập lại.' 'Tất cả người dùng' 'Bảo mật' '' 'Must' 'Pha 1'
Add-Feature 'IAM' $d 'SSO' 'Đăng nhập & SSO' 'Hồ sơ người dùng' 'Xem hồ sơ và ngữ cảnh đăng nhập' 'Hiển thị người dùng, đơn vị, vai trò, phạm vi dữ liệu và quyền hiệu lực.' 'Tất cả người dùng' 'Nền tảng' '' 'Must' 'Pha 1'
Add-CrudSet 'IAM' $d 'ORG' 'Cơ cấu tổ chức' 'Đơn vị tổ chức' 'Quản trị hệ thống' '' 'Must' 'Pha 1' 'Bổ sung theo EPIC01' -History
Add-Feature 'IAM' $d 'ORG' 'Cơ cấu tổ chức' 'Cây tổ chức' 'Quản lý cây tổ chức đa cấp' 'Thiết lập quan hệ cha-con, cấp đơn vị, hiệu lực và lịch sử thay đổi cơ cấu.' 'Quản trị hệ thống' 'Cấu hình' '' 'Must' 'Pha 1'
Add-Feature 'IAM' $d 'ORG' 'Cơ cấu tổ chức' 'Chức danh' 'Quản lý chức danh và vị trí công việc' 'Khai báo chức danh, vị trí, cấp quản lý và ánh xạ dữ liệu nhân sự.' 'Quản trị hệ thống' 'Cấu hình' '' 'Should' 'Pha 1'
Add-CrudSet 'IAM' $d 'USR' 'Người dùng & định danh' 'Người dùng ứng dụng' 'Quản trị hệ thống' '' 'Must' 'Pha 1' 'Bổ sung theo EPIC02' -History
Add-Feature 'IAM' $d 'USR' 'Người dùng & định danh' 'Đồng bộ' 'Đồng bộ người dùng từ AD/QLNS' 'Đồng bộ hồ sơ, đơn vị, chức danh và trạng thái người dùng; ghi nhận sai lệch.' 'Quản trị hệ thống' 'Tích hợp' '' 'Must' 'Pha 1'
Add-Feature 'IAM' $d 'USR' 'Người dùng & định danh' 'Phân công' 'Gán vai trò và phạm vi dữ liệu cho người dùng' 'Mỗi assignment gồm user, role, data scope, đơn vị/nhiệm vụ và thời hạn hiệu lực.' 'Quản trị hệ thống' 'Phân quyền' '' 'Must' 'Pha 1' 'Đề xuất trong phạm vi' 'Bổ sung theo recfactor-module-user-role'
Add-Feature 'IAM' $d 'USR' 'Người dùng & định danh' 'Phân công' 'Ủy quyền và người thay thế' 'Thiết lập ủy quyền theo thời gian, phạm vi task/quy trình và ngăn xung đột phân quyền.' 'Người dùng/Quản trị' 'Phân quyền' '' 'Should' 'Pha 2'
Add-CrudSet 'IAM' $d 'RBAC' 'Vai trò & phân quyền' 'Vai trò nghiệp vụ' 'Quản trị hệ thống' '' 'Must' 'Pha 1' 'Bổ sung theo EPIC03' -History
Add-Feature 'IAM' $d 'RBAC' 'Vai trò & phân quyền' 'Ma trận quyền' 'Cấu hình ma trận Role × Chức năng × Quyền' 'Quản lý quyền xem, tạo, sửa, xóa, trình, duyệt, xuất và quản trị theo vai trò.' 'Quản trị hệ thống' 'Phân quyền' '' 'Must' 'Pha 1'
Add-Feature 'IAM' $d 'RBAC' 'Vai trò & phân quyền' 'Phạm vi dữ liệu' 'Cấu hình loại phạm vi dữ liệu' 'Hỗ trợ bản thân, đơn vị, cây đơn vị, nhiệm vụ được giao và toàn hệ thống.' 'Quản trị hệ thống' 'Phân quyền' '' 'Must' 'Pha 1'
Add-Feature 'IAM' $d 'RBAC' 'Vai trò & phân quyền' 'Mô phỏng' 'Mô phỏng quyền hiệu lực' 'Giải thích quyền thao tác từ role policy và phạm vi dữ liệu từ user assignment.' 'Quản trị hệ thống/Audit' 'Phân quyền' '' 'Should' 'Pha 2'

# 02. Quản lý nhiệm vụ
$d='Quản lý Nhiệm vụ KHCN'
Add-CrudSet 'MIS' $d 'MISSION' 'Hồ sơ nhiệm vụ' 'Nhiệm vụ KHCN' 'Cán bộ KHCN/Chủ nhiệm' '' 'Must' 'Pha 1' 'Hiệu chỉnh từ VHT_WBS' -History
Add-Feature 'MIS' $d 'MISSION' 'Hồ sơ nhiệm vụ' 'Vòng đời' 'Quản lý trạng thái vòng đời nhiệm vụ' 'Quản lý chuyển trạng thái từ đề xuất, phê duyệt, thực hiện, điều chỉnh, nghiệm thu, quyết toán đến đóng nhiệm vụ.' 'Cán bộ KHCN' 'Nghiệp vụ' 'RD01-RD10' 'Must' 'Pha 1'
Add-Feature 'MIS' $d 'MISSION' 'Hồ sơ nhiệm vụ' 'Cột mốc quản trị' 'Ánh xạ mọi quy trình vào bộ cột mốc bất biến' 'Mọi process version phải ánh xạ về các cột mốc KhoiTao, xét duyệt, thực hiện, nghiệm thu, quyết toán, tạm dừng, dừng và lưu trữ để báo cáo không phụ thuộc chi tiết BPMN.' 'Quản trị quy trình/Cán bộ KHCN' 'Nền tảng' 'RD01-RD10' 'Must' 'Pha 1' 'Đề xuất trong phạm vi' 'Bổ sung theo BRD mục 7'
Add-Feature 'MIS' $d 'MISSION' 'Hồ sơ nhiệm vụ' 'Điều kiện chuyển giai đoạn' 'Kiểm tra sự kiện kết thúc và điều kiện ràng buộc' 'Chỉ cho khởi tạo giai đoạn kế tiếp khi cột mốc và bằng chứng bắt buộc của giai đoạn trước đã hợp lệ.' 'Cán bộ KHCN/Hệ thống' 'Workflow' 'RD01-RD06' 'Must' 'Pha 1' 'Đề xuất trong phạm vi' 'Bổ sung theo CAP-02/BRD 0.9'
Add-Feature 'MIS' $d 'MISSION' 'Hồ sơ nhiệm vụ' 'Hoàn thành nội dung' 'Xác nhận đủ điều kiện chuyển sang nghiệm thu' 'Người có thẩm quyền xác nhận nội dung đề tài hoàn thành; hệ thống chỉ gợi ý từ PLM/QLNS và không tự động làm kẹt hồ sơ khi đồng bộ lỗi.' 'Cán bộ KHCN/Người có thẩm quyền' 'Workflow' 'RD03→RD05' 'Must' 'Pha 1' 'Cần xác nhận' 'Chờ chốt B2 của BRD.'
Add-Feature 'MIS' $d 'MISSION' 'Hồ sơ nhiệm vụ' 'Quan hệ hồ sơ' 'Liên kết nhiệm vụ với các hồ sơ quy trình' 'Tổng hợp toàn bộ dossier, process instance, quyết định, tài liệu và sản phẩm theo missionId.' 'Cán bộ KHCN/Chủ nhiệm' 'Nghiệp vụ' 'RD01-RD10' 'Must' 'Pha 1'
Add-Feature 'MIS' $d 'MISSION' 'Hồ sơ nhiệm vụ' 'Tra cứu' 'Tìm kiếm nâng cao nhiệm vụ' 'Tìm theo mã, tên, lĩnh vực, cấp, đơn vị, chủ nhiệm, trạng thái, thời gian và nguồn kinh phí.' 'Người dùng nghiệp vụ' 'Nghiệp vụ' '' 'Must' 'Pha 1'
Add-Feature 'MIS' $d 'MISSION' 'Hồ sơ nhiệm vụ' 'Mã hóa' 'Sinh và quản lý mã nhiệm vụ' 'Sinh mã theo quy tắc cấu hình, bảo đảm duy nhất và hỗ trợ mã kế thừa từ hệ thống ngoài.' 'Cán bộ KHCN' 'Cấu hình' '' 'Should' 'Pha 1'
Add-Feature 'MIS' $d 'MISSION' 'Hồ sơ nhiệm vụ' 'Tổng quan 360°' 'Xem hồ sơ nhiệm vụ 360°' 'Hiển thị thông tin, tiến độ, kinh phí, nhân sự, hồ sơ, hội đồng, sản phẩm, rủi ro và lịch sử trên một màn hình.' 'Cán bộ KHCN/Lãnh đạo/Chủ nhiệm' 'Nghiệp vụ' '' 'Should' 'Pha 2'
Add-Feature 'MIS' $d 'MISSION' 'Hồ sơ nhiệm vụ' 'Phân loại' 'Quản lý lĩnh vực, cấp và loại nhiệm vụ' 'Áp dụng danh mục và rule theo lĩnh vực nghiên cứu, cấp quản lý, loại hình và mức độ bảo mật.' 'Cán bộ KHCN' 'Nghiệp vụ' '' 'Must' 'Pha 1'

# 03. Chủ trương và xét duyệt
$d='Chủ trương & Xét duyệt'
Add-CrudSet 'PRP' $d 'RD01' 'Xét duyệt chủ trương' 'Hồ sơ chủ trương' 'Người đề xuất/Cán bộ KHCN' 'RD01.01/RD01.02' 'Must' 'Pha 1' 'Hiệu chỉnh theo BRD 0.9' -Submit -History
Add-Feature 'PRP' $d 'RD01' 'Xét duyệt chủ trương' 'Nội dung đề xuất' 'Khai báo căn cứ, mục tiêu, phạm vi và hiệu quả dự kiến' 'Ghi nhận đầy đủ cơ sở hình thành, mục tiêu, phạm vi, sản phẩm và giá trị dự kiến của chủ trương.' 'Người đề xuất' 'Nghiệp vụ' 'RD01' 'Must' 'Pha 1'
Add-Feature 'PRP' $d 'RD01' 'Xét duyệt chủ trương' 'Dự kiến nguồn lực' 'Khai báo kinh phí, tiến độ và nguồn lực dự kiến' 'Quản lý tổng mức dự kiến, nguồn vốn, thời gian và đơn vị chủ trì/phối hợp.' 'Người đề xuất' 'Nghiệp vụ' 'RD01' 'Must' 'Pha 1'
Add-Feature 'PRP' $d 'RD01' 'Xét duyệt chủ trương' 'Kết quả' 'Lập và ban hành quyết định chủ trương' 'Tạo quyết định từ mẫu, thực hiện xác nhận điện tử hoặc ký số theo phương án được chốt, ban hành và cập nhật kết quả vào nhiệm vụ.' 'Cán bộ KHCN/Lãnh đạo' 'Workflow' 'RD01' 'Must' 'Pha 1' 'Cần xác nhận' 'Chờ chốt A2 của BRD.'
Add-CrudSet 'PRP' $d 'RD02' 'Xét duyệt nhiệm vụ' 'Hồ sơ xét duyệt nhiệm vụ' 'Chủ nhiệm/Cán bộ KHCN' 'RD02.01/RD02.02' 'Must' 'Pha 1' 'Hiệu chỉnh theo BRD 0.9' -Submit -History
Add-Feature 'PRP' $d 'RD02' 'Xét duyệt nhiệm vụ' 'Thuyết minh' 'Lập thuyết minh nhiệm vụ' 'Quản lý mục tiêu, nội dung nghiên cứu, phương pháp, sản phẩm, kế hoạch và tổ chức thực hiện.' 'Chủ nhiệm nhiệm vụ' 'Nghiệp vụ' 'RD02' 'Must' 'Pha 1'
Add-Feature 'PRP' $d 'RD02' 'Xét duyệt nhiệm vụ' 'Dự toán' 'Lập và thẩm định dự toán' 'Khai báo khoản mục, nguồn kinh phí, năm thực hiện; kiểm tra định mức và tổng hợp thẩm định.' 'Chủ nhiệm/Tài chính/Cán bộ KHCN' 'Nghiệp vụ' 'RD02' 'Must' 'Pha 1'
Add-Feature 'PRP' $d 'RD02' 'Xét duyệt nhiệm vụ' 'Thẩm định' 'Phân công thẩm định và tổng hợp ý kiến' 'Phân công chuyên gia/đơn vị, thu nhận ý kiến, yêu cầu bổ sung và tổng hợp kết quả.' 'Cán bộ KHCN/Chuyên gia' 'Workflow' 'RD02' 'Must' 'Pha 1'
Add-Feature 'PRP' $d 'RD02' 'Xét duyệt nhiệm vụ' 'Kết quả' 'Ban hành quyết định giao nhiệm vụ' 'Sinh quyết định từ kết quả duyệt, thực hiện xác nhận điện tử hoặc ký số theo phương án được chốt, cấp mã và kích hoạt giai đoạn thực hiện.' 'Cán bộ KHCN/Lãnh đạo' 'Workflow' 'RD02' 'Must' 'Pha 1' 'Cần xác nhận' 'Chờ chốt A2 của BRD.'

# 04. Không gian làm việc và xử lý task
$d='Không gian làm việc & Task'
Add-Feature 'TSK' $d 'WORK' 'Việc của tôi' 'Danh sách công việc' 'Xem danh sách việc của tôi' 'Tổng hợp task Camunda và ngữ cảnh nghiệp vụ, phân nhóm chờ xử lý, đã xử lý, quá hạn và được ủy quyền.' 'Tất cả người dùng nghiệp vụ' 'Workflow' '' 'Must' 'Pha 1' 'Đề xuất trong phạm vi' 'Hiệu chỉnh từ VHT_WBS'
Add-Feature 'TSK' $d 'WORK' 'Việc của tôi' 'Danh sách công việc' 'Tìm kiếm, lọc và lưu chế độ xem' 'Lọc theo quy trình, loại hồ sơ, đơn vị, hạn xử lý, trạng thái và mức ưu tiên; lưu bộ lọc cá nhân.' 'Tất cả người dùng nghiệp vụ' 'Workflow' '' 'Must' 'Pha 1'
Add-Feature 'TSK' $d 'WORK' 'Việc của tôi' 'Chi tiết task' 'Xem màn hình xử lý task hợp nhất' 'Hiển thị nhiệm vụ, hồ sơ, tài liệu, biểu mẫu, lịch sử, SLA và action khả dụng.' 'Người xử lý' 'Workflow' '' 'Must' 'Pha 1'
foreach($x in @(
    @('Nhận/claim task','Nhận xử lý task đang ở nhóm ứng viên.'),
    @('Gửi duyệt hồ sơ','Khóa phiên bản hồ sơ và chuyển vào tuyến xử lý.'),
    @('Đồng ý duyệt','Hoàn tất task với outcome APPROVE và định tuyến bước tiếp theo.'),
    @('Yêu cầu điều chỉnh/bổ sung','Trả hồ sơ theo nhánh RETURN, bắt buộc ghi lý do và nội dung cần bổ sung.'),
    @('Từ chối duyệt','Hoàn tất task theo nhánh REJECT, bắt buộc lý do và xác nhận.'),
    @('Bổ sung ý kiến/thảo luận','Trao đổi theo hồ sơ/task, hỗ trợ mention và thông báo.'),
    @('Tải lên và xem tài liệu','Quản lý tài liệu hỗ trợ theo quyền xem/tải.'),
    @('Xuất PDF/In hồ sơ','Kết xuất hồ sơ theo mẫu và quyền dữ liệu.'),
    @('Xem lịch sử và audit','Theo dõi timeline xử lý, action và thay đổi dữ liệu.'),
    @('Ủy quyền/chuyển giao task','Delegate hoặc reassign theo quyền, thời hạn và audit.'),
    @('Gửi thay mặt','Cho phép người có quyền tạo/trình hồ sơ thay mặt người khác với audit rõ ràng.')
)){ Add-Feature 'TSK' $d 'ACTION' 'Xử lý task' 'Thao tác chuẩn' $x[0] $x[1] 'Người xử lý/Người lập' 'Workflow' '' 'Must' 'Pha 1' }
$proxyRelations=@(
    @('CQ KHCN Tập đoàn','Chuyên quản CLKHCN','Nhận xét, công văn, báo cáo thẩm định'),
    @('Hội đồng xét duyệt Tập đoàn','Chuyên quản CLKHCN','Danh sách hội đồng, phiếu nhận xét, phiếu đánh giá, biên bản các phiên'),
    @('Hội đồng Tập đoàn','Chuyên quản CLKHCN/TCKT/MS/NS','Nhận xét và kết quả phê duyệt'),
    @('HĐ KHCN Tập đoàn','Chuyên quản CLKHCN/TCKT/MS/NS','Nhận xét, công văn, báo cáo thẩm định'),
    @('Cơ quan nghiệp vụ Tập đoàn','Chuyên quản CLKHCN/TCKT/MS/NS','Nhận xét và kết quả phê duyệt'),
    @('BTGĐ Tập đoàn','Chuyên quản CLKHCN','Kết quả phê duyệt các quyết định')
)
foreach($proxy in $proxyRelations){
    Add-Feature 'TSK' $d 'PROXY' 'Nhập liệu thay cấp Tập đoàn' 'Quan hệ nhập liệu thay' ("Nhập liệu thay cho " + $proxy[0]) ("Người thao tác: " + $proxy[1] + "; phạm vi: " + $proxy[2] + ". Bắt buộc lưu người quyết định thật, người nhập và văn bản gốc.") 'Chuyên quản VHT' 'Workflow' 'Các luồng cấp Tập đoàn (.02)' 'Must' 'Pha 1' 'Đề xuất trong phạm vi' 'Bổ sung theo CAP-12/BRD 0.9'
}
foreach($x in @(
    @('Yêu cầu bỏ qua Hội đồng','Tạo exception request, yêu cầu lý do/bằng chứng và cấp duyệt độc lập.'),
    @('Yêu cầu trình cấp cao hơn','Xin thay đổi tuyến phê duyệt chuẩn theo exception policy.'),
    @('Yêu cầu bỏ qua bước','Xin bỏ qua bước được phép và ghi rõ bước bị bỏ qua.'),
    @('Yêu cầu thêm người thẩm định','Bổ sung reviewer ngoài tuyến chuẩn theo chính sách.'),
    @('Yêu cầu thay người xử lý','Thay approver khi vắng mặt, sai phân công hoặc đổi thẩm quyền.'),
    @('Yêu cầu mở lại bước','Mở lại bước đã hoàn tất với kiểm soát chặt và bằng chứng.'),
    @('Yêu cầu hoàn tất thủ công','Xử lý trường hợp lỗi tích hợp/Camunda, yêu cầu quyền vận hành.'),
    @('Yêu cầu phê duyệt khẩn','Áp dụng tuyến khẩn, SLA riêng và audit đầy đủ.')
)){ Add-Feature 'TSK' $d 'EXC' 'Xử lý ngoại lệ có kiểm soát' 'Exception action' $x[0] $x[1] 'Người yêu cầu/Người duyệt ngoại lệ' 'Workflow' '' 'Could' 'Pha 3' 'Cần xác nhận' 'Bổ sung theo controlled-exception-handling' }

# 05. Hồ sơ, tài liệu và biểu mẫu
$d='Hồ sơ, Tài liệu & Biểu mẫu'
Add-Feature 'DOC' $d 'DOS' 'Quản trị hồ sơ' 'Hồ sơ dùng chung' 'Quản lý hồ sơ theo loại và phiên bản' 'Dùng mô hình dossier chung cho RD01-RD10; lưu trạng thái, phiên bản, chủ thể và business key.' 'Cán bộ KHCN' 'Nền tảng' 'RD01-RD10' 'Must' 'Pha 1'
Add-Feature 'DOC' $d 'DOS' 'Quản trị hồ sơ' 'Hồ sơ dùng chung' 'Checklist thành phần hồ sơ' 'Cấu hình và kiểm tra thành phần bắt buộc theo loại hồ sơ, bước và điều kiện nghiệp vụ.' 'Người lập/Cán bộ KHCN' 'Nghiệp vụ' 'RD01-RD10' 'Must' 'Pha 1'
Add-Feature 'DOC' $d 'DOS' 'Quản trị hồ sơ' 'Hồ sơ dùng chung' 'So sánh phiên bản hồ sơ' 'Hiển thị khác biệt dữ liệu và tài liệu giữa các lần trình/bổ sung.' 'Người xử lý/Audit' 'Audit' 'RD01-RD10' 'Should' 'Pha 2'
Add-Feature 'DOC' $d 'DOS' 'Quản trị hồ sơ' 'Hồ sơ dùng chung' 'Khóa/mở khóa phiên bản trình duyệt' 'Ngăn sửa dữ liệu đã trình; chỉ tạo phiên bản bổ sung theo đúng luồng.' 'Người lập/Cán bộ KHCN' 'Nền tảng' 'RD01-RD10' 'Must' 'Pha 1'
Add-CrudSet 'DOC' $d 'FORM' 'Biểu mẫu động' 'Biểu mẫu điện tử (eForm)' 'Quản trị cấu hình' '' 'Must' 'Pha 1' 'Hiệu chỉnh từ VHT_WBS' -History -Clone
foreach($x in @(
    @('Thiết kế section, field và layout','Thiết kế form kéo-thả hoặc cấu hình schema với nhóm trường, cột và tab.'),
    @('Cấu hình kiểu dữ liệu và validation','Khai báo text, number, date, list, table, attachment và rule validation.'),
    @('Điều kiện hiển thị/readonly/bắt buộc','Điều khiển trường theo vai trò, bước, trạng thái và business rule.'),
    @('Gắn eForm vào quy trình và bước','Version-lock form schema theo workflow version.'),
    @('Xem trước và kiểm thử eForm','Mô phỏng form với dữ liệu và ngữ cảnh quyền khác nhau.'),
    @('Import/Export schema eForm','Trao đổi schema có kiểm tra phiên bản và tính hợp lệ.')
)){ Add-Feature 'DOC' $d 'FORM' 'Biểu mẫu động' 'Thiết kế biểu mẫu' $x[0] $x[1] 'Quản trị cấu hình/BA' 'Cấu hình' '' 'Must' 'Pha 1' }
Add-CrudSet 'DOC' $d 'TPL' 'Mẫu văn bản' 'Mẫu tài liệu Word/PDF' 'Quản trị cấu hình' '' 'Should' 'Pha 2' 'Bổ sung theo EPIC08' -History -Clone
Add-Feature 'DOC' $d 'TPL' 'Mẫu văn bản' 'Merge field' 'Quản lý biến trộn dữ liệu' 'Khai báo và kiểm tra biến như mã nhiệm vụ, chủ nhiệm, kinh phí, kết quả duyệt.' 'Quản trị cấu hình' 'Cấu hình' '' 'Should' 'Pha 2'
Add-Feature 'DOC' $d 'TPL' 'Mẫu văn bản' 'Sinh tài liệu' 'Sinh Word/PDF từ mẫu' 'Trộn dữ liệu đúng phiên bản, lưu file sinh ra và liên kết với hồ sơ.' 'Người dùng nghiệp vụ' 'Nền tảng' 'RD01-RD10' 'Should' 'Pha 2'
Add-Feature 'DOC' $d 'FILE' 'Quản lý tệp' 'Tài liệu đính kèm' 'Tải lên, tải xuống và xem trước tài liệu' 'Lưu file ở object storage/DMS, metadata trong Core System; kiểm soát loại, dung lượng và virus.' 'Người dùng nghiệp vụ' 'Nền tảng' '' 'Must' 'Pha 1'
Add-Feature 'DOC' $d 'FILE' 'Quản lý tệp' 'Tài liệu đính kèm' 'Phiên bản hóa tài liệu' 'Lưu nhiều phiên bản, người tải lên, checksum và trạng thái tài liệu.' 'Người dùng nghiệp vụ' 'Nền tảng' '' 'Must' 'Pha 1'
Add-Feature 'DOC' $d 'FILE' 'Quản lý tệp' 'Bảo mật tài liệu' 'Phân quyền tài liệu và hồ sơ mật' 'Kiểm soát quyền xem/tải/in theo vai trò, nhiệm vụ, mức mật và watermark.' 'Quản trị/Người dùng nghiệp vụ' 'Bảo mật' '' 'Must' 'Pha 1'
Add-Feature 'DOC' $d 'FILE' 'Quản lý tệp' 'Ký số' 'Ký số và kiểm tra chữ ký' 'Tích hợp dịch vụ ký số, lưu chứng thư, thời gian ký và trạng thái kiểm tra.' 'Lãnh đạo/Cán bộ KHCN' 'Tích hợp' 'RD01-RD10' 'Should' 'Pha 2' 'Cần xác nhận' 'Bổ sung theo kiến trúc'

# 06. Hội đồng và thẩm định
$d='Hội đồng & Thẩm định'
Add-CrudSet 'COU' $d 'COUNCIL' 'Quản lý hội đồng' 'Hội đồng KHCN' 'Cán bộ KHCN/Thư ký' 'RD01,RD02,RD04,RD05' 'Must' 'Pha 1' 'Hiệu chỉnh theo BRD 0.9' -History
foreach($councilType in @('HĐ KHCN Tổng Công ty theo lĩnh vực/giai đoạn','HĐ xét duyệt cấp Cơ sở theo nhiệm vụ','HĐ đánh giá cấp Cơ sở theo nhiệm vụ','HĐ nghiệm thu theo nhiệm vụ','HĐ KHCN Tập đoàn do hệ thống cập nhật')){
    Add-Feature 'COU' $d 'COUNCIL' 'Quản lý hội đồng' 'Loại hội đồng' ("Quản lý " + $councilType) 'Sinh danh sách tự động hoặc thủ công theo Quyết định thành lập; quản lý hiệu lực và lịch sử thay đổi.' 'Cán bộ KHCN/Thư ký' 'Nghiệp vụ' 'RD01,RD02,RD04,RD05' 'Must' 'Pha 1' 'Đề xuất trong phạm vi' 'Bổ sung theo CAP-10/BRD 0.9'
}
Add-Feature 'COU' $d 'COUNCIL' 'Quản lý hội đồng' 'Thành viên' 'Quản lý thành viên, vai trò và xung đột lợi ích' 'Gán chủ tịch, thư ký, phản biện, ủy viên; kiểm tra điều kiện và xung đột lợi ích.' 'Cán bộ KHCN/Thư ký' 'Nghiệp vụ' 'RD01,RD02,RD04,RD05' 'Must' 'Pha 1'
Add-Feature 'COU' $d 'COUNCIL' 'Quản lý hội đồng' 'Lịch họp' 'Lập lịch và mời họp hội đồng' 'Quản lý thời gian, địa điểm/online, tài liệu, RSVP và thông báo thay đổi.' 'Thư ký/Thành viên hội đồng' 'Nghiệp vụ' 'RD01,RD02,RD04,RD05' 'Must' 'Pha 1'
Add-Feature 'COU' $d 'APPRAISAL' 'Đánh giá & thẩm định' 'Phiếu đánh giá' 'Cấu hình và nhập phiếu đánh giá' 'Phiếu theo loại hội đồng, tiêu chí, trọng số, nhận xét và kết luận.' 'Chuyên gia/Thành viên hội đồng' 'Nghiệp vụ' 'RD02,RD05' 'Must' 'Pha 1'
Add-Feature 'COU' $d 'APPRAISAL' 'Đánh giá & thẩm định' 'Phiếu nhận xét' 'Lập và ký Phiếu nhận xét (PNX)' 'Nhập nhận xét theo biểu mẫu chuẩn, gắn người nhận xét, phiên họp, hồ sơ và bằng chứng; không thay bằng bình luận tự do.' 'Chuyên gia/Cơ quan nghiệp vụ' 'Nghiệp vụ' 'RD01,RD02,RD04,RD05' 'Must' 'Pha 1' 'Đề xuất trong phạm vi' 'Bổ sung theo CAP-09/BRD 0.9'
Add-Feature 'COU' $d 'APPRAISAL' 'Đánh giá & thẩm định' 'Phiếu đánh giá' 'Lập và ký Phiếu đánh giá (PĐG)' 'Chấm theo tiêu chí/trọng số của biểu mẫu chuẩn, lưu kết quả và bằng chứng thẩm định.' 'Thành viên hội đồng' 'Nghiệp vụ' 'RD01,RD02,RD04,RD05' 'Must' 'Pha 1' 'Đề xuất trong phạm vi' 'Bổ sung theo CAP-09/BRD 0.9'
Add-Feature 'COU' $d 'APPRAISAL' 'Đánh giá & thẩm định' 'Phiên họp' 'Quản lý nhiều phiên họp cho một nhiệm vụ' 'Mỗi phiên có danh sách tham dự, PNX/PĐG, kết luận và biên bản riêng; theo dõi quan hệ giữa các phiên.' 'Thư ký/Hội đồng' 'Nghiệp vụ' 'RD01,RD02,RD04,RD05' 'Must' 'Pha 1' 'Đề xuất trong phạm vi' 'Bổ sung theo CAP-11/BRD 0.9'
Add-Feature 'COU' $d 'APPRAISAL' 'Đánh giá & thẩm định' 'Phiên họp' 'Kiểm tra tính hợp lệ của phiên họp' 'Kiểm tra quorum và quy tắc kết luận trước khi khóa biên bản.' 'Thư ký/Chủ tịch hội đồng' 'Nghiệp vụ' 'RD01,RD02,RD04,RD05' 'Must' 'Pha 1' 'Cần xác nhận' 'Chờ chốt câu hỏi B4 của BRD.'
Add-Feature 'COU' $d 'APPRAISAL' 'Đánh giá & thẩm định' 'Tổng hợp' 'Tổng hợp kết quả chấm và ý kiến' 'Tổng hợp điểm, ý kiến khác biệt, quorum và đề xuất kết luận.' 'Thư ký/Cán bộ KHCN' 'Nghiệp vụ' 'RD02,RD05' 'Must' 'Pha 1'
Add-Feature 'COU' $d 'APPRAISAL' 'Đánh giá & thẩm định' 'Biên bản' 'Lập và ban hành biên bản hội đồng' 'Sinh biên bản từ mẫu, thu chữ ký/xác nhận theo phương án được chốt và gắn vào hồ sơ.' 'Thư ký/Chủ tịch hội đồng' 'Nghiệp vụ' 'RD02,RD05' 'Must' 'Pha 1' 'Cần xác nhận' 'Chờ chốt A2 của BRD.'
Add-Feature 'COU' $d 'APPRAISAL' 'Đánh giá & thẩm định' 'Chuyên gia' 'Quản lý kho chuyên gia' 'Quản lý chuyên môn, đơn vị, kinh nghiệm, tình trạng và lịch sử tham gia.' 'Cán bộ KHCN' 'Nghiệp vụ' '' 'Should' 'Pha 2'

# 07. Thực hiện nhiệm vụ
$d='Thực hiện Nhiệm vụ'
Add-Feature 'EXE' $d 'PLAN' 'Kế hoạch & tiến độ' 'Kế hoạch thực hiện' 'Đọc cấu trúc công việc và mốc tiến độ từ PLM' 'Đồng bộ work package, milestone, deliverable, thời hạn và người phụ trách; PLM là hệ thống chủ dữ liệu.' 'Chủ nhiệm/Cán bộ KHCN' 'Tích hợp' 'RD03.05' 'Must' 'Pha 2' 'Đề xuất trong phạm vi' 'Hiệu chỉnh theo CAP-16/BRD 0.9'
Add-Feature 'EXE' $d 'PLAN' 'Kế hoạch & tiến độ' 'Theo dõi tiến độ' 'Hiển thị phần trăm hoàn thành và bằng chứng từ PLM' 'Hiển thị dữ liệu đồng bộ, độ trễ và trạng thái đồng bộ; không cho PM QLKHCN ghi đè dữ liệu nguồn.' 'Chủ nhiệm/Cán bộ KHCN' 'Tích hợp' 'RD03.05' 'Must' 'Pha 2' 'Đề xuất trong phạm vi' 'Hiệu chỉnh theo CAP-16/BRD 0.9'
Add-Feature 'EXE' $d 'PLAN' 'Kế hoạch & tiến độ' 'Cảnh báo' 'Cảnh báo chậm tiến độ và milestone' 'So sánh kế hoạch/thực tế, phát hiện quá hạn và tạo cảnh báo/escalation.' 'Chủ nhiệm/Cán bộ KHCN/Lãnh đạo' 'Báo cáo' 'RD03' 'Should' 'Pha 2'
Add-Feature 'EXE' $d 'HR' 'Nhân sự đề tài' 'Thành viên' 'Hiển thị nhân sự và trạng thái công việc từ QLNS' 'Đồng bộ vai trò, thời gian tham gia, phân bổ và trạng thái công việc; QLNS là hệ thống chủ dữ liệu.' 'Chủ nhiệm/Cán bộ KHCN' 'Tích hợp' 'RD03.01' 'Must' 'Pha 2' 'Đề xuất trong phạm vi' 'Hiệu chỉnh theo CAP-16/BRD 0.9'
Add-Feature 'EXE' $d 'HR' 'Nhân sự đề tài' 'Chi phí nhân sự' 'Theo dõi công sức và chi phí nhân sự' 'Ghi nhận workload/timesheet khi áp dụng, đơn giá và chi phí theo nguồn.' 'Chủ nhiệm/Tài chính' 'Nghiệp vụ' 'RD03' 'Could' 'Pha 3' 'Cần xác nhận'
Add-Feature 'EXE' $d 'BUD' 'Kinh phí thực hiện' 'Ngân sách' 'Hiển thị ngân sách và chi phí từ SAP' 'Đọc dự toán được duyệt, đã chi và còn lại; SAP là hệ thống chủ dữ liệu, PM QLKHCN chỉ hiển thị và cảnh báo.' 'Chủ nhiệm/Tài chính/Cán bộ KHCN' 'Tích hợp' 'RD03.03' 'Must' 'Pha 2' 'Đề xuất trong phạm vi' 'Hiệu chỉnh theo CAP-16/BRD 0.9'
Add-Feature 'EXE' $d 'BUD' 'Kinh phí thực hiện' 'Giải ngân' 'Theo dõi giải ngân và chi phí thực tế' 'Nhận dữ liệu từ SAP hoặc nhập có kiểm soát; đối chiếu kế hoạch, cam kết và thực chi.' 'Tài chính/Chủ nhiệm' 'Tích hợp' 'RD03' 'Must' 'Pha 2'
Add-Feature 'EXE' $d 'PROC' 'Mua sắm' 'Nhu cầu mua sắm' 'Hiển thị tờ trình, gói thầu và hợp đồng từ hệ thống MS' 'Liên kết dữ liệu mua sắm với nhiệm vụ; hệ thống MS là nguồn sự thật, PM QLKHCN chỉ đọc và cảnh báo.' 'Chủ nhiệm/Mua sắm' 'Tích hợp' 'RD03.02' 'Must' 'Pha 2' 'Đề xuất trong phạm vi' 'Hiệu chỉnh theo CAP-16/BRD 0.9'
Add-Feature 'EXE' $d 'ASSET' 'Tài sản/Vật tư' 'Tài sản hình thành' 'Hiển thị VTLK, CCDC và TSCĐ từ QLTS' 'Đồng bộ tài sản hình thành và trạng thái bàn giao; QLTS là nguồn sự thật.' 'Chủ nhiệm/Quản lý tài sản' 'Tích hợp' 'RD03.04' 'Must' 'Pha 2' 'Đề xuất trong phạm vi' 'Hiệu chỉnh theo CAP-16/BRD 0.9'
Add-CrudSet 'EXE' $d 'REPORT' 'Báo cáo thực hiện' 'Báo cáo định kỳ/đột xuất' 'Chủ nhiệm/Cán bộ KHCN' 'RD03.06' 'Must' 'Pha 1' 'Hiệu chỉnh theo BRD 0.9' -Submit -History
Add-Feature 'EXE' $d 'REPORT' 'Báo cáo thực hiện' 'Tổng hợp' 'Tổng hợp tiến độ, kinh phí, sản phẩm và rủi ro' 'Tạo báo cáo kỳ từ dữ liệu thực hiện và cho phép giải trình sai lệch. Nguồn dữ liệu Pha 1 cần chốt theo câu hỏi A3 của BRD.' 'Chủ nhiệm/Cán bộ KHCN' 'Báo cáo' 'RD03.06' 'Must' 'Pha 1' 'Cần xác nhận' 'Hiệu chỉnh theo BRD 0.9'

# 08. Điều chỉnh
$d='Điều chỉnh, Tạm dừng & Dừng'
$rd04Flows=@(
    @('RD04.01','Hồ sơ đổi chủ nhiệm cấp Cơ sở'),
    @('RD04.02','Hồ sơ điều chỉnh nội dung/dự toán không tăng tổng cấp Cơ sở'),
    @('RD04.03','Hồ sơ điều chỉnh mục tiêu/tăng dự toán không vượt chủ trương cấp Cơ sở'),
    @('RD04.04','Hồ sơ tạm dừng nhiệm vụ cấp Cơ sở'),
    @('RD04.05','Hồ sơ dừng nhiệm vụ cấp Cơ sở'),
    @('RD04.06','Hồ sơ đổi chủ nhiệm cấp Tập đoàn'),
    @('RD04.07','Hồ sơ điều chỉnh nội dung/dự toán không tăng tổng cấp Tập đoàn'),
    @('RD04.08','Hồ sơ điều chỉnh mục tiêu/tăng dự toán không vượt chủ trương cấp Tập đoàn'),
    @('RD04.09','Hồ sơ tạm dừng nhiệm vụ cấp Tập đoàn'),
    @('RD04.10','Hồ sơ dừng nhiệm vụ cấp Tập đoàn')
)
foreach($flow in $rd04Flows) {
    Add-CrudSet 'ADJ' $d 'RD04' 'Điều chỉnh nhiệm vụ' $flow[1] 'Chủ nhiệm/Cán bộ KHCN' $flow[0] 'Must' 'Pha 2' 'Hiệu chỉnh theo BRD 0.9' -Submit -History
}
Add-Feature 'ADJ' $d 'RD04' 'Điều chỉnh nhiệm vụ' 'Đánh giá tác động' 'So sánh trước/sau và đánh giá tác động điều chỉnh' 'Hiển thị thay đổi phạm vi, thời gian, kinh phí, nhân sự, sản phẩm và các hồ sơ phụ thuộc.' 'Cán bộ KHCN/Người duyệt' 'Nghiệp vụ' 'RD04' 'Must' 'Pha 2'
Add-Feature 'ADJ' $d 'RD04' 'Điều chỉnh nhiệm vụ' 'Áp dụng kết quả' 'Cập nhật baseline sau phê duyệt' 'Chỉ cập nhật dữ liệu nhiệm vụ khi quyết định điều chỉnh đã được ban hành; giữ lịch sử baseline cũ.' 'Cán bộ KHCN' 'Workflow' 'RD04' 'Must' 'Pha 2'

# 09. Nghiệm thu
$d='Nghiệm thu'
Add-CrudSet 'ACC' $d 'RD05' 'Nghiệm thu nhiệm vụ' 'Hồ sơ nghiệm thu' 'Chủ nhiệm/Cán bộ KHCN' 'RD05.01/RD05.02' 'Must' 'Pha 1' 'Hiệu chỉnh theo BRD 0.9' -Submit -History
Add-Feature 'ACC' $d 'RD05' 'Nghiệm thu nhiệm vụ' 'Điều kiện' 'Kiểm tra điều kiện đăng ký nghiệm thu' 'Kiểm tra tiến độ, sản phẩm, báo cáo, tài chính, tài liệu và nghĩa vụ cần hoàn thành.' 'Chủ nhiệm/Cán bộ KHCN' 'Nghiệp vụ' 'RD05.01/RD05.02' 'Must' 'Pha 1'
Add-Feature 'ACC' $d 'RD05' 'Nghiệm thu nhiệm vụ' 'Sản phẩm' 'Đối chiếu sản phẩm đăng ký và thực tế' 'So sánh số lượng, chất lượng, chỉ tiêu, bằng chứng và trạng thái bàn giao.' 'Hội đồng/Cán bộ KHCN' 'Nghiệp vụ' 'RD05.01/RD05.02' 'Must' 'Pha 1'
Add-Feature 'ACC' $d 'RD05' 'Nghiệm thu nhiệm vụ' 'Kết luận' 'Xếp loại và công nhận kết quả nghiệm thu' 'Tổng hợp hội đồng, xếp loại, yêu cầu hoàn thiện và ban hành quyết định công nhận.' 'Hội đồng/Lãnh đạo/Cán bộ KHCN' 'Workflow' 'RD05.01/RD05.02' 'Must' 'Pha 1'
Add-Feature 'ACC' $d 'RD05' 'Nghiệm thu nhiệm vụ' 'Sau nghiệm thu' 'Theo dõi hoàn thiện sau nghiệm thu' 'Quản lý yêu cầu chỉnh sửa, hạn hoàn thành và xác nhận hồ sơ cuối cùng.' 'Chủ nhiệm/Cán bộ KHCN' 'Nghiệp vụ' 'RD05.01/RD05.02' 'Should' 'Pha 1'

# 10. Quyết toán
$d='Quyết toán'
Add-CrudSet 'SET' $d 'RD06' 'Quyết toán nhiệm vụ' 'Hồ sơ quyết toán' 'Chủ nhiệm/Tài chính/Cán bộ KHCN' 'RD06.01/RD06.02' 'Must' 'Pha 1' 'Hiệu chỉnh theo BRD 0.9' -Submit -History
Add-Feature 'SET' $d 'RD06' 'Quyết toán nhiệm vụ' 'Tổng hợp tài chính' 'Tổng hợp dự toán, giải ngân và thực chi' 'Đối chiếu theo nguồn, khoản mục, năm và chứng từ; tính chênh lệch có giải trình.' 'Tài chính/Chủ nhiệm' 'Nghiệp vụ' 'RD06.01/RD06.02' 'Must' 'Pha 1'
Add-Feature 'SET' $d 'RD06' 'Quyết toán nhiệm vụ' 'Chứng từ' 'Quản lý chứng từ quyết toán' 'Liên kết chứng từ SAP/DMS, kiểm tra trùng, trạng thái hợp lệ và tài liệu bổ sung.' 'Tài chính/Chủ nhiệm' 'Tích hợp' 'RD06.01/RD06.02' 'Must' 'Pha 1'
Add-Feature 'SET' $d 'RD06' 'Quyết toán nhiệm vụ' 'Đối soát' 'Đối soát dữ liệu tài chính với SAP' 'Ghi nhận sai lệch, trạng thái xử lý và lịch sử đồng bộ/đối soát.' 'Tài chính/Quản trị tích hợp' 'Tích hợp' 'RD06.01/RD06.02' 'Must' 'Pha 1'
Add-Feature 'SET' $d 'RD06' 'Quyết toán nhiệm vụ' 'Kết quả' 'Ban hành kết quả quyết toán và đóng tài chính' 'Sinh quyết định/biên bản, cập nhật số quyết toán và khóa dữ liệu tài chính.' 'Tài chính/Lãnh đạo' 'Workflow' 'RD06.01/RD06.02' 'Must' 'Pha 1'

# 11. Sản phẩm nghiên cứu và SHTT
$d='Sản phẩm Nghiên cứu & SHTT'
Add-CrudSet 'OUT' $d 'PROD' 'Sản phẩm nghiên cứu' 'Sản phẩm nghiên cứu' 'Chủ nhiệm/Cán bộ KHCN' 'RD07' 'Must' 'Pha 2' 'Bổ sung theo decomposite-diagram' -History
Add-Feature 'OUT' $d 'PROD' 'Sản phẩm nghiên cứu' 'Đối chiếu' 'Đối chiếu sản phẩm cam kết và thực tế' 'Theo dõi chỉ tiêu, số lượng, chất lượng, trạng thái nghiệm thu, bàn giao và ứng dụng.' 'Chủ nhiệm/Cán bộ KHCN' 'Nghiệp vụ' 'RD07' 'Must' 'Pha 2'
Add-CrudSet 'OUT' $d 'IP' 'Sở hữu trí tuệ' 'Hồ sơ sở hữu trí tuệ' 'Chủ nhiệm/Cán bộ SHTT' 'RD08' 'Must' 'Pha 1' 'Hiệu chỉnh theo BRD 0.9' -Submit -History
Add-Feature 'OUT' $d 'IP' 'Sở hữu trí tuệ' 'Quyền sở hữu' 'Quản lý tác giả, chủ sở hữu và tỷ lệ quyền' 'Theo dõi cá nhân/tổ chức, quyền và căn cứ phân chia cho từng tài sản SHTT.' 'Cán bộ SHTT' 'Nghiệp vụ' 'RD08' 'Must' 'Pha 1' 'Cần xác nhận' 'RD08 thuộc Pha 1 nhưng nguồn mô tả còn mỏng (A4).'
Add-Feature 'OUT' $d 'IP' 'Sở hữu trí tuệ' 'Đăng ký bảo hộ' 'Theo dõi trạng thái đơn và văn bằng bảo hộ' 'Quản lý số đơn, ngày nộp, quốc gia, giai đoạn thẩm định, hiệu lực và gia hạn.' 'Cán bộ SHTT' 'Nghiệp vụ' 'RD08' 'Must' 'Pha 1' 'Cần xác nhận' 'RD08 thuộc Pha 1 nhưng nguồn mô tả còn mỏng (A4).'
Add-CrudSet 'OUT' $d 'PUB' 'Công bố khoa học' 'Bài báo/Sáng chế/Giải pháp hữu ích' 'Chủ nhiệm/Cán bộ KHCN' 'RD07,RD08' 'Should' 'Pha 3' 'Bổ sung theo decomposite-diagram' -History
Add-Feature 'OUT' $d 'TECH' 'Công nghệ & chuyển giao' 'Công nghệ lõi' 'Quản lý công nghệ hình thành từ nhiệm vụ' 'Theo dõi mô tả, TRL, khả năng ứng dụng, đơn vị tiếp nhận và bằng chứng chuyển giao.' 'Chủ nhiệm/Cán bộ KHCN' 'Nghiệp vụ' 'RD07' 'Could' 'Pha 3'

# 12. Báo cáo và điều hành
$d='Báo cáo & Điều hành'
Add-Feature 'RPT' $d 'DASH' 'Dashboard lãnh đạo' 'Tổng quan' 'Dashboard đa cấp theo phạm vi dữ liệu' 'Hiển thị KPI theo tập đoàn/đơn vị/lĩnh vực/cấp nhiệm vụ và hỗ trợ drill-down.' 'Lãnh đạo/Cán bộ KHCN' 'Báo cáo' 'RD09' 'Must' 'Pha 2' 'Đề xuất trong phạm vi' 'Hiệu chỉnh từ VHT_WBS'
foreach($x in @(
    @('KPI vòng đời nhiệm vụ','Số lượng và trạng thái nhiệm vụ theo giai đoạn, đơn vị và lĩnh vực.'),
    @('KPI tiến độ và SLA','Tỷ lệ đúng hạn, task quá hạn, thời gian phê duyệt và bottleneck.'),
    @('KPI kinh phí','Dự toán, giải ngân, thực chi, quyết toán và chênh lệch.'),
    @('KPI nhân sự','Phân bổ chủ nhiệm, thành viên, chuyên gia và tải công việc.'),
    @('KPI sản phẩm/SHTT','Sản phẩm cam kết/thực tế, bài báo, sáng chế và trạng thái bảo hộ.'),
    @('Cảnh báo điều hành','Nhiệm vụ trễ, vượt dự toán, hồ sơ thiếu, hội đồng chậm và tích hợp lỗi.')
)){ Add-Feature 'RPT' $d 'DASH' 'Dashboard lãnh đạo' 'KPI' $x[0] $x[1] 'Lãnh đạo/Cán bộ KHCN' 'Báo cáo' 'RD09' 'Should' 'Pha 2' }
Add-Feature 'RPT' $d 'REPORT' 'Báo cáo nghiệp vụ' 'Báo cáo chuẩn' 'Danh mục báo cáo chuẩn RD09' 'Cung cấp báo cáo tổng hợp nhiệm vụ, hồ sơ, tiến độ, kinh phí, nhân sự, sản phẩm và phê duyệt.' 'Cán bộ KHCN/Lãnh đạo' 'Báo cáo' 'RD09' 'Must' 'Pha 2'
Add-Feature 'RPT' $d 'REPORT' 'Báo cáo nghiệp vụ' 'Bộ lọc' 'Lọc, nhóm và drill-down báo cáo' 'Áp dụng thời gian, đơn vị, lĩnh vực, cấp nhiệm vụ, trạng thái và quyền dữ liệu.' 'Người xem báo cáo' 'Báo cáo' 'RD09' 'Must' 'Pha 2'
Add-Feature 'RPT' $d 'REPORT' 'Báo cáo nghiệp vụ' 'Kết xuất' 'Xuất Excel/PDF và lập lịch gửi báo cáo' 'Kết xuất đúng dữ liệu theo quyền, lưu cấu hình và gửi định kỳ.' 'Người xem báo cáo' 'Báo cáo' 'RD09' 'Should' 'Pha 2'

# 13. Lưu trữ, pháp lý và tra cứu
$d='Lưu trữ, Pháp lý & Tra cứu'
Add-CrudSet 'ARC' $d 'LEGAL' 'Hồ sơ pháp lý' 'Hồ sơ pháp lý' 'Cán bộ KHCN/Pháp chế' 'RD10' 'Must' 'Pha 1' 'Hiệu chỉnh theo BRD 0.9' -Submit -History
Add-Feature 'ARC' $d 'LEGAL' 'Hồ sơ pháp lý' 'Phân loại' 'Phân loại quyết định, hợp đồng, phụ lục và biên bản' 'Gắn loại tài liệu, nhiệm vụ, hiệu lực, mức mật và thời hạn lưu trữ.' 'Cán bộ KHCN/Pháp chế' 'Nghiệp vụ' 'RD10' 'Must' 'Pha 1' 'Cần xác nhận' 'RD10 thuộc Pha 1 nhưng phạm vi cần chốt theo A4/A5.'
Add-Feature 'ARC' $d 'ARCH' 'Lưu trữ điện tử' 'Nộp lưu' 'Đóng gói và nộp lưu hồ sơ hoàn tất' 'Kiểm tra checklist, tạo gói hồ sơ, checksum, metadata và biên bản nộp lưu.' 'Văn thư/Cán bộ KHCN' 'Nghiệp vụ' 'RD10' 'Must' 'Pha 1' 'Cần xác nhận' 'Cần xác định Storage là hệ ngoài hay kho nội bộ.'
Add-Feature 'ARC' $d 'ARCH' 'Lưu trữ điện tử' 'Vòng đời lưu trữ' 'Quản lý thời hạn lưu và tiêu hủy' 'Áp dụng retention schedule, legal hold và quy trình phê duyệt tiêu hủy.' 'Văn thư/Pháp chế' 'Nghiệp vụ' 'RD10' 'Could' 'Pha 3'
Add-Feature 'ARC' $d 'SEARCH' 'Tra cứu toàn văn' 'Tìm kiếm' 'Tìm kiếm toàn cục' 'Tìm nhiệm vụ, hồ sơ, quyết định, tài liệu, sản phẩm và metadata theo quyền.' 'Người dùng nghiệp vụ' 'Nền tảng' '' 'Should' 'Pha 2'
Add-Feature 'ARC' $d 'SEARCH' 'Tra cứu toàn văn' 'Tìm kiếm' 'Tìm kiếm toàn văn tài liệu' 'Đánh chỉ mục nội dung được phép, hỗ trợ từ khóa, bộ lọc và highlight.' 'Người dùng nghiệp vụ' 'Nền tảng' '' 'Could' 'Pha 3'

# 14. Cấu hình workflow platform
$d='Quy trình & Cấu hình Nghiệp vụ'
Add-CrudSet 'CFG' $d 'WFD' 'Định nghĩa quy trình' 'Quy trình nghiệp vụ' 'Quản trị quy trình/BA' '' 'Must' 'Pha 1' 'Hiệu chỉnh từ VHT_WBS' -History -Clone
Add-Feature 'CFG' $d 'WFD' 'Định nghĩa quy trình' 'Vòng đời' 'Quản lý trạng thái Draft/Test/Deployed/Suspended/Retired' 'Kiểm soát chuyển trạng thái, quyền thao tác và điều kiện triển khai/ngừng sử dụng.' 'Quản trị quy trình' 'Cấu hình' '' 'Must' 'Pha 1'
Add-Feature 'CFG' $d 'WFD' 'Định nghĩa quy trình' 'Phiên bản' 'So sánh và rollback phiên bản quy trình' 'So sánh metadata/BPMN/DMN/form; rollback bằng phiên bản mới, không sửa bản production đang chạy.' 'Quản trị quy trình' 'Cấu hình' '' 'Must' 'Pha 1'
Add-Feature 'CFG' $d 'WFD' 'Định nghĩa quy trình' 'Ban hành phiên bản' 'Quản lý mã hiệu, lần ban hành và thời hạn hiệu lực' 'Mỗi phiên bản có mã hiệu, lần ban hành, ngày hiệu lực, ngày hết hiệu lực và bảng theo dõi sửa đổi theo chuẩn văn bản VHT.' 'Quản trị quy trình/BA' 'Cấu hình' 'RD10' 'Must' 'Pha 1' 'Đề xuất trong phạm vi' 'Bổ sung theo CAP-03/BRD 0.9'
Add-Feature 'CFG' $d 'WFD' 'Định nghĩa quy trình' 'Ban hành phiên bản' 'Phê duyệt phiên bản quy trình trước khi có hiệu lực' 'Áp dụng chuỗi Biên soạn → Kiểm tra → Thẩm định → Phê duyệt; chỉ phiên bản đã ban hành mới được dùng để khởi tạo hồ sơ.' 'BA/Kiểm soát/Thẩm định/Phê duyệt' 'Workflow' 'RD10' 'Must' 'Pha 1' 'Cần xác nhận' 'Cần chốt A5: RD10 hay phân hệ quy trình chịu trách nhiệm.'
Add-Feature 'CFG' $d 'WFD' 'Định nghĩa quy trình' 'Hiệu lực phiên bản' 'Chọn phiên bản có hiệu lực khi khởi tạo hồ sơ' 'Hồ sơ mới dùng phiên bản có hiệu lực tại thời điểm khởi tạo; lưu cố định workflow version trên process instance.' 'Hệ thống/Quản trị quy trình' 'Nền tảng' '' 'Must' 'Pha 1' 'Đề xuất trong phạm vi' 'Bổ sung theo CAP-03/BRD 0.9'
Add-Feature 'CFG' $d 'WFD' 'Định nghĩa quy trình' 'Hiệu lực phiên bản' 'Giữ phiên bản cho hồ sơ đang xử lý' 'Mặc định hồ sơ chạy hết theo phiên bản lúc khởi tạo; chỉ migration khi có quyết định và công cụ riêng.' 'Quản trị quy trình/Vận hành' 'Workflow' '' 'Must' 'Pha 1' 'Cần xác nhận' 'Chờ chốt câu hỏi B1 của BRD.'
Add-Feature 'CFG' $d 'BPMN' 'BPMN Designer' 'Thiết kế' 'Vẽ và import/export BPMN' 'Canvas BPMN, palette, validation và import/export tệp .bpmn.' 'BA/Quản trị quy trình' 'Cấu hình' '' 'Must' 'Pha 1' 'Đề xuất trong phạm vi' 'Hiệu chỉnh từ VHT_WBS'
Add-Feature 'CFG' $d 'BPMN' 'BPMN Designer' 'Thiết kế' 'Thư viện element và mẫu quy trình' 'Cung cấp element mẫu, subprocess, boundary event và template tái sử dụng.' 'BA/Quản trị quy trình' 'Cấu hình' '' 'Should' 'Pha 1'
Add-Feature 'CFG' $d 'BPMN' 'BPMN Designer' 'Kiểm tra' 'Validate BPMN và cấu hình liên quan' 'Kiểm tra cú pháp, user task, service task, form, action, SLA, message và biến.' 'BA/Quản trị quy trình' 'Cấu hình' '' 'Must' 'Pha 1'
Add-Feature 'CFG' $d 'BPMN' 'BPMN Designer' 'Triển khai' 'Test deploy và deploy Camunda 8' 'Triển khai môi trường test/production, lưu deployment key và kết quả.' 'Quản trị quy trình' 'Tích hợp' '' 'Must' 'Pha 1'
Add-Feature 'CFG' $d 'BPMN' 'BPMN Designer' 'Governance' 'Review và phê duyệt phiên bản BPMN' 'Áp dụng peer review, BA validation, technical validation, UAT và version lock.' 'BA/Kỹ thuật/Quản trị quy trình' 'Cấu hình' '' 'Should' 'Pha 2'
Add-CrudSet 'CFG' $d 'DMN' 'Luật nghiệp vụ & DMN' 'Quyết định DMN' 'BA/Quản trị cấu hình' '' 'Must' 'Pha 1' 'Hiệu chỉnh từ VHT_WBS' -History -Clone
Add-Feature 'CFG' $d 'DMN' 'Luật nghiệp vụ & DMN' 'Thiết kế' 'Thiết kế decision table, FEEL và DRD' 'Quản lý input/output, hit policy, expression, quan hệ quyết định và kiểm tra cú pháp.' 'BA/Quản trị cấu hình' 'Cấu hình' '' 'Must' 'Pha 1'
Add-Feature 'CFG' $d 'DMN' 'Luật nghiệp vụ & DMN' 'Kiểm thử' 'Test và mô phỏng quyết định' 'Chạy bộ dữ liệu test, hiển thị rule match và kết quả giải thích được.' 'BA/QA' 'Cấu hình' '' 'Must' 'Pha 1'
Add-Feature 'CFG' $d 'DMN' 'Luật nghiệp vụ & DMN' 'Tái sử dụng' 'Quản lý rule set dùng chung' 'Cho phép nhiều workflow/module gọi chung một quyết định có version.' 'BA/Quản trị cấu hình' 'Cấu hình' '' 'Should' 'Pha 2'
Add-CrudSet 'CFG' $d 'APM' 'Ma trận phê duyệt' 'Ma trận phê duyệt' 'BA/Quản trị cấu hình' '' 'Must' 'Pha 1' 'Hiệu chỉnh từ VHT_WBS' -History -Clone
Add-Feature 'CFG' $d 'APM' 'Ma trận phê duyệt' 'Routing' 'Cấu hình tuyến tuần tự/song song' 'Định nghĩa step, approver resolver, quorum, sequence và điều kiện áp dụng.' 'BA/Quản trị cấu hình' 'Cấu hình' '' 'Must' 'Pha 1'
Add-Feature 'CFG' $d 'APM' 'Ma trận phê duyệt' 'Resolver' 'Xác định người xử lý động' 'Resolve theo role, đơn vị, cấp trên, hội đồng, danh sách chỉ định, delegation và substitute.' 'BA/Quản trị cấu hình' 'Cấu hình' '' 'Must' 'Pha 1'
Add-Feature 'CFG' $d 'APM' 'Ma trận phê duyệt' 'Kiểm thử' 'Mô phỏng tuyến phê duyệt' 'Nhập ngữ cảnh nhiệm vụ và giải thích tuyến, người xử lý, rule áp dụng.' 'BA/QA' 'Cấu hình' '' 'Must' 'Pha 1'
Add-Feature 'CFG' $d 'APM' 'Ma trận phê duyệt' 'Loại phê duyệt' 'Quản lý danh mục loại phê duyệt' 'CRUD, trạng thái, thứ tự, quan hệ với action/outcome và kiểm tra sử dụng.' 'Quản trị cấu hình' 'Cấu hình' '' 'Should' 'Pha 1' 'Đề xuất trong phạm vi' 'Sửa lỗi nhóm dòng 33-36 VHT_WBS'
Add-CrudSet 'CFG' $d 'ACT' 'Cấu hình hành động' 'Luật hiển thị hành động' 'BA/Quản trị cấu hình' '' 'Must' 'Pha 1' 'Hiệu chỉnh từ VHT_WBS' -History
Add-Feature 'CFG' $d 'ACT' 'Cấu hình hành động' 'Action Registry' 'Xem danh mục hành động hệ thống' 'Quản lý metadata hiển thị cho action chuẩn/support/exception; không cho tạo logic action tùy ý.' 'BA/Quản trị cấu hình' 'Cấu hình' '' 'Must' 'Pha 1'
Add-Feature 'CFG' $d 'ACT' 'Cấu hình hành động' 'Presentation' 'Cấu hình nhãn, icon, tooltip, nhóm và thứ tự' 'Tùy biến trình bày theo workflow/step mà không thay đổi hành vi backend.' 'BA/Quản trị cấu hình' 'Cấu hình' '' 'Must' 'Pha 1'
Add-Feature 'CFG' $d 'ACT' 'Cấu hình hành động' 'Đối soát BPMN' 'Đồng bộ và đối soát User Task với action policy' 'Phát hiện step thiếu policy, action không hợp lệ và cấu hình không còn tham chiếu.' 'BA/Quản trị cấu hình' 'Cấu hình' '' 'Must' 'Pha 1'
Add-Feature 'CFG' $d 'ACT' 'Cấu hình hành động' 'Mô phỏng' 'Mô phỏng available-actions' 'Giải thích action hiển thị/ẩn theo workflow context, permission, rule, dossier state và exception policy.' 'BA/QA' 'Cấu hình' '' 'Should' 'Pha 2'
Add-CrudSet 'CFG' $d 'NTF' 'Thông báo' 'Mẫu thông báo' 'Quản trị cấu hình' '' 'Should' 'Pha 2' 'Bổ sung theo EPIC10' -History -Clone
Add-Feature 'CFG' $d 'NTF' 'Thông báo' 'Kênh' 'Cấu hình Email/SMS/Web/App/Teams' 'Quản lý kênh, endpoint, sender, giới hạn và fallback.' 'Quản trị cấu hình' 'Cấu hình' '' 'Should' 'Pha 2'
Add-Feature 'CFG' $d 'NTF' 'Thông báo' 'Trigger' 'Gắn thông báo với sự kiện nghiệp vụ' 'Cấu hình event, đối tượng nhận, mẫu, delay và điều kiện gửi.' 'BA/Quản trị cấu hình' 'Cấu hình' '' 'Should' 'Pha 2'
Add-Feature 'CFG' $d 'NTF' 'Thông báo' 'Theo dõi' 'Theo dõi trạng thái gửi và gửi lại' 'Ghi nhận pending/sent/failed, retry có kiểm soát và audit.' 'Quản trị vận hành' 'Vận hành' '' 'Should' 'Pha 2'
Add-CrudSet 'CFG' $d 'SLA' 'SLA & Escalation' 'Chính sách SLA' 'BA/Quản trị cấu hình' '' 'Should' 'Pha 2' 'Bổ sung theo EPIC11' -History -Clone
Add-Feature 'CFG' $d 'SLA' 'SLA & Escalation' 'Lịch làm việc' 'Cấu hình lịch làm việc và ngày nghỉ' 'Tính hạn theo timezone, ngày làm việc, ngày nghỉ và lịch đặc thù đơn vị.' 'Quản trị cấu hình' 'Cấu hình' '' 'Should' 'Pha 2'
Add-Feature 'CFG' $d 'SLA' 'SLA & Escalation' 'Escalation' 'Cấu hình nhắc việc và escalation chain' 'Cấu hình mốc nhắc, người nhận, cấp escalation và action khi vi phạm.' 'BA/Quản trị cấu hình' 'Cấu hình' '' 'Should' 'Pha 2'
Add-CrudSet 'CFG' $d 'MST' 'Danh mục dùng chung' 'Danh mục nghiệp vụ' 'Quản trị dữ liệu' '' 'Must' 'Pha 1' 'Bổ sung theo EPIC12' -History
Add-Feature 'CFG' $d 'MST' 'Danh mục dùng chung' 'Giá trị danh mục' 'Import/Export và version danh mục' 'Hỗ trợ hiệu lực, mã ngoài, mapping và kiểm tra tham chiếu trước khi ngừng dùng.' 'Quản trị dữ liệu' 'Cấu hình' '' 'Should' 'Pha 1'
Add-Feature 'CFG' $d 'DSH' 'Cấu hình dashboard' 'Dashboard' 'Thiết kế dashboard và bố cục widget' 'Tạo dashboard, widget, layout, filter, permission và view cá nhân.' 'Quản trị báo cáo' 'Cấu hình' 'RD09' 'Could' 'Pha 3'
Add-Feature 'CFG' $d 'DSH' 'Cấu hình dashboard' 'Metric' 'Quản lý metric và nguồn dữ liệu' 'Khai báo công thức, đơn vị đo, dimension, refresh và quyền truy cập.' 'Quản trị báo cáo' 'Cấu hình' 'RD09' 'Could' 'Pha 3'

# 15. Tích hợp
$d='Tích hợp Hệ thống'
Add-CrudSet 'INT' $d 'HUB' 'Integration Hub' 'Cấu hình tích hợp' 'Quản trị tích hợp' '' 'Must' 'Pha 1' 'Thay thế dòng Tích hợp chung trong VHT_WBS' -History -Clone
foreach($x in @(
    @('QLNS/AD','Đồng bộ người dùng, tổ chức, chức danh và trạng thái nhân sự.'),
    @('MS/Mua sắm','Đồng bộ nhu cầu, gói mua sắm và trạng thái thực hiện.'),
    @('SAP/Tài chính','Đồng bộ ngân sách, giải ngân, chi phí, chứng từ và quyết toán.'),
    @('QLTS','Đồng bộ tài sản hình thành, bàn giao và trạng thái quản lý.'),
    @('PLM','Đồng bộ milestone, deliverable và tiến độ kỹ thuật.'),
    @('Storage/DMS','Lưu trữ, phiên bản và tìm kiếm tài liệu; phạm vi ký số được xác nhận riêng.'),
    @('CRM/Hệ thống khác','Trao đổi dữ liệu đối tác, ứng dụng/chuyển giao và thông tin liên quan.'),
    @('Camunda 8','Tích hợp Zeebe/REST cho deploy, start, task, variable, incident và monitoring.')
)){ Add-Feature 'INT' $d 'CONN' 'Connector hệ thống' 'Connector' ("Tích hợp " + $x[0]) $x[1] 'Quản trị tích hợp/Worker' 'Tích hợp' '' 'Should' 'Pha 2' 'Cần xác nhận' 'Bổ sung theo decomposite-diagram' }
Add-Feature 'INT' $d 'OPS' 'Vận hành tích hợp' 'Giám sát' 'Theo dõi giao dịch và lỗi tích hợp' 'Tra cứu request/response đã che dữ liệu nhạy cảm, trạng thái, retry và correlation id.' 'Quản trị tích hợp' 'Vận hành' '' 'Must' 'Pha 1'
Add-Feature 'INT' $d 'OPS' 'Vận hành tích hợp' 'Độ tin cậy' 'Outbox/Inbox, idempotency và retry' 'Bảo đảm không mất/trùng event, hỗ trợ dead-letter và replay có kiểm soát.' 'Quản trị tích hợp/Kỹ thuật' 'Nền tảng' '' 'Must' 'Pha 1'
Add-Feature 'INT' $d 'OPS' 'Vận hành tích hợp' 'Đối soát' 'Đối soát dữ liệu định kỳ' 'So sánh dữ liệu hai hệ thống, ghi nhận sai lệch, phân công và xác nhận xử lý.' 'Quản trị tích hợp/Cán bộ nghiệp vụ' 'Vận hành' '' 'Should' 'Pha 2'

# 16. Vận hành workflow
$d='Vận hành Workflow & Hệ thống'
foreach($x in @(
    @('Tra cứu process instance','Tìm theo business key, process, version, trạng thái, thời gian và đơn vị.'),
    @('Xem sơ đồ và bước đang chạy','Hiển thị BPMN overlay, active token, completed activity và timeline.'),
    @('Xem process variables an toàn','Che dữ liệu nhạy cảm và giới hạn chỉnh sửa theo quyền.'),
    @('Quản lý incident và failed job','Xem nguyên nhân, stack/correlation và tác động nghiệp vụ.'),
    @('Retry failed job','Retry đơn lẻ/batch với xác nhận, giới hạn và audit.'),
    @('Reassign/Delegate task','Can thiệp task theo quy trình phê duyệt vận hành và audit.'),
    @('Cancel/Terminate instance','Kết thúc instance có lý do, kiểm tra tác động và đồng bộ trạng thái nghiệp vụ.'),
    @('Restart từ một bước','Tạo instance mới hoặc process modification theo chính sách, giữ liên kết instance cũ.'),
    @('Batch operation','Thực hiện thao tác hàng loạt có preview, quyền riêng và báo cáo kết quả.'),
    @('Theo dõi SLA instance','Xem hạn, vi phạm, escalation và thời gian chờ theo từng bước.')
)){ Add-Feature 'OPS' $d 'RUNTIME' 'Workflow Runtime Administration' 'Process operation' $x[0] $x[1] 'Quản trị vận hành' 'Vận hành' '' 'Must' 'Pha 2' 'Đề xuất trong phạm vi' 'Bổ sung theo EPIC16' }
Add-Feature 'OPS' $d 'MON' 'Giám sát hệ thống' 'Application' 'Theo dõi sức khỏe ứng dụng và worker' 'Dashboard API latency, error rate, DB, queue, worker failure và tài nguyên.' 'Quản trị vận hành/Kỹ thuật' 'Vận hành' '' 'Should' 'Pha 2'
Add-Feature 'OPS' $d 'MON' 'Giám sát hệ thống' 'Business' 'Theo dõi cảnh báo nghiệp vụ' 'Hồ sơ quá hạn, nhiệm vụ trễ, quyết toán chậm, hội đồng chưa hoàn tất và đồng bộ lỗi.' 'Quản trị vận hành/Cán bộ KHCN' 'Vận hành' '' 'Should' 'Pha 2'

# 17. Audit và cấu hình hệ thống
$d='Audit, An toàn & Cấu hình Hệ thống'
foreach($x in @(
    @('Audit đăng nhập và phiên','Ghi nhận đăng nhập, đăng xuất, thất bại, thiết bị và phiên.'),
    @('Audit thay đổi dữ liệu','Ghi trước/sau, actor, nguồn, thời gian và correlation id.'),
    @('Audit phê duyệt và workflow','Ghi task, outcome, lý do, người đại diện, process/step/version.'),
    @('Audit chữ ký số','Ghi chứng thư, kết quả xác minh, thời gian và tài liệu ký.'),
    @('Audit tích hợp','Ghi hệ thống nguồn/đích, giao dịch, retry và kết quả đối soát.'),
    @('Tra cứu và xuất audit','Lọc theo đối tượng, người dùng, thời gian, action và xuất theo quyền.')
)){ Add-Feature 'SYS' $d 'AUD' 'Audit & tuân thủ' 'Audit' $x[0] $x[1] 'Audit/Quản trị hệ thống' 'Audit' '' 'Must' 'Pha 1' 'Đề xuất trong phạm vi' 'Bổ sung theo EPIC14' }
Add-Feature 'SYS' $d 'CFG' 'Cấu hình hệ thống' 'Tham số' 'Quản lý tham số hệ thống' 'Quản lý key/value, kiểu dữ liệu, môi trường, hiệu lực, secret masking và lịch sử.' 'Quản trị hệ thống' 'Cấu hình' '' 'Must' 'Pha 1'
Add-Feature 'SYS' $d 'CFG' 'Cấu hình hệ thống' 'Feature toggle' 'Quản lý feature toggle' 'Bật/tắt theo môi trường, đơn vị hoặc nhóm người dùng; có audit và thời hạn.' 'Quản trị hệ thống' 'Cấu hình' '' 'Should' 'Pha 2'
Add-Feature 'SYS' $d 'CFG' 'Cấu hình hệ thống' 'Job' 'Quản lý tác vụ nền và lịch chạy' 'Theo dõi scheduler, trạng thái, chạy lại và khóa chạy trùng.' 'Quản trị vận hành' 'Vận hành' '' 'Should' 'Pha 2'
Add-Feature 'SYS' $d 'SEC' 'An toàn thông tin' 'Bảo mật' 'Phân loại và che dữ liệu nhạy cảm' 'Áp dụng mask, encryption, field/document permission và chính sách tải xuống.' 'Quản trị an toàn thông tin' 'Bảo mật' '' 'Must' 'Pha 1'
Add-Feature 'SYS' $d 'SEC' 'An toàn thông tin' 'Bảo mật' 'Quản lý phiên và chính sách truy cập' 'Timeout, khóa tài khoản ứng dụng, giới hạn phiên, IP/device policy khi áp dụng.' 'Quản trị an toàn thông tin' 'Bảo mật' '' 'Must' 'Pha 1'

# 18. Trợ giúp
$d='Trợ giúp & Hỗ trợ Người dùng'
Add-Feature 'HLP' $d 'HELP' 'Hướng dẫn sử dụng' 'Nội dung' 'Tra cứu hướng dẫn theo chức năng' 'Cung cấp hướng dẫn, quy trình thao tác, FAQ và liên kết từ màn hình hiện tại.' 'Tất cả người dùng' 'Hỗ trợ' '' 'Should' 'Pha 2'
Add-Feature 'HLP' $d 'HELP' 'Hướng dẫn sử dụng' 'Onboarding' 'Hướng dẫn người dùng mới' 'Tour theo vai trò, checklist bắt đầu và dữ liệu mẫu khi được phép.' 'Tất cả người dùng' 'Hỗ trợ' '' 'Could' 'Pha 3'
Add-Feature 'HLP' $d 'SUP' 'Hỗ trợ' 'Yêu cầu hỗ trợ' 'Gửi yêu cầu hỗ trợ kèm ngữ cảnh' 'Gửi màn hình, mã lỗi/correlation id và mô tả; không đính kèm dữ liệu nhạy cảm mặc định.' 'Tất cả người dùng' 'Hỗ trợ' '' 'Could' 'Pha 3'

# 19. Trợ lý AI hỗ trợ nghiệp vụ (CAP-21 — đề xuất tùy chọn, nguồn VHT_AIAgnet.xlsx, chờ chốt A7)
$d='Trợ lý AI hỗ trợ nghiệp vụ'
$aiScope='Cần xác nhận'; $aiSrc='Bổ sung theo CAP-21/VHT_AIAgnet'; $aiAcc='Phạm vi tùy chọn; chờ chốt A7 của BRD. Nghiệm thu theo AI-AC-01…AI-AC-07 nếu được duyệt.'
# Nền tảng AI dùng chung (bổ sung khi hiệu chỉnh — quản trị và kiểm soát AI)
Add-Feature 'AIA' $d 'PLT' 'Nền tảng AI' 'Quản trị tri thức' 'Quản lý checklist và tri thức cho AI' 'Khai báo checklist soát xét, biểu mẫu chuẩn và tri thức nghiệp vụ theo loại hồ sơ; phiên bản hóa và phê duyệt trước khi AI sử dụng, theo mô hình ban hành của CAP-03.' 'Quản trị cấu hình/BA' 'Cấu hình' '' 'Could' 'Pha 3' $aiScope $aiSrc $aiAcc
Add-Feature 'AIA' $d 'PLT' 'Nền tảng AI' 'Cấu hình' 'Bật/tắt trợ lý AI theo luồng và bước' 'Cấu hình phạm vi áp dụng AI theo quy trình, bước và loại hồ sơ; tắt được toàn cục khi cần.' 'Quản trị hệ thống' 'Cấu hình' '' 'Could' 'Pha 3' $aiScope $aiSrc $aiAcc
Add-Feature 'AIA' $d 'PLT' 'Nền tảng AI' 'Retrieval & căn cứ' 'Truy xuất tài liệu và giữ căn cứ nguồn' 'Chỉ tìm trong tập hồ sơ/tài liệu đã được Core Backend lọc quyền; mỗi đoạn sử dụng giữ định danh tài liệu, phiên bản và vị trí để người dùng truy ngược.' 'Quản trị tri thức/Người dùng nghiệp vụ' 'AI hỗ trợ' '' 'Could' 'Pha 3' $aiScope $aiSrc $aiAcc
Add-Feature 'AIA' $d 'PLT' 'Nền tảng AI' 'Model serving' 'Vận hành mô hình AI on-premise' 'Quản lý endpoint mô hình, phiên bản, trạng thái sẵn sàng và cấu hình triển khai trong hạ tầng được VHT chấp thuận; không gửi dữ liệu hồ sơ tới dịch vụ AI bên ngoài.' 'Quản trị AI/Hạ tầng' 'Vận hành' '' 'Could' 'Pha 3' $aiScope $aiSrc $aiAcc
Add-Feature 'AIA' $d 'PLT' 'Nền tảng AI' 'Kết quả & phản hồi' 'Lưu kết quả AI và phản hồi người dùng' 'Lưu bất biến kết quả AI ban đầu, căn cứ, phiên bản mô hình/checklist, quyết định xác nhận/chỉnh sửa/bác bỏ và nội dung sau chỉnh sửa; phản hồi không tự động trở thành dữ liệu huấn luyện.' 'Người dùng nghiệp vụ/Quản trị AI' 'AI hỗ trợ' '' 'Could' 'Pha 3' $aiScope $aiSrc $aiAcc
Add-Feature 'AIA' $d 'PLT' 'Nền tảng AI' 'Truy vết' 'Nhật ký nội dung do AI gợi ý' 'Ghi lại nội dung AI sinh ra, hồ sơ/User Task liên quan, nguồn tham chiếu, phiên bản mô hình/checklist và người xác nhận; phân biệt rõ nội dung do AI gợi ý và nội dung do người quyết định (gắn CAP-19).' 'Audit/Quản trị hệ thống' 'Audit' '' 'Could' 'Pha 3' $aiScope $aiSrc $aiAcc
Add-Feature 'AIA' $d 'PLT' 'Nền tảng AI' 'Bảo mật' 'Giới hạn dữ liệu AI truy cập theo quyền người dùng' 'Core Backend kiểm tra quyền trước khi cấp ngữ cảnh; AI chỉ đọc dữ liệu trong phạm vi quyền của người đang thao tác (NFR-008/NFR-009).' 'Quản trị hệ thống' 'Bảo mật' '' 'Could' 'Pha 3' $aiScope $aiSrc $aiAcc
Add-Feature 'AIA' $d 'PLT' 'Nền tảng AI' 'Khả dụng' 'Fallback khi dịch vụ AI không sẵn sàng' 'Khi AI lỗi, timeout hoặc không đủ căn cứ, hiển thị trạng thái rõ ràng và cho phép người dùng tiếp tục xử lý thủ công; không làm kẹt User Task hoặc cột mốc nghiệp vụ.' 'Người dùng nghiệp vụ/Quản trị hệ thống' 'AI hỗ trợ' '' 'Could' 'Pha 3' $aiScope $aiSrc $aiAcc
# Xét duyệt cấp cơ sở
Add-Feature 'AIA' $d 'REV1' 'AI xét duyệt cấp cơ sở' 'Gợi ý nội dung' 'AI gợi ý nội dung hồ sơ xét duyệt cấp cơ sở' 'Gợi ý nội dung hồ sơ xét duyệt từ chủ trương đã duyệt, biểu mẫu, checklist và dữ liệu nhiệm vụ tương tự nếu có; người lập kiểm tra trước khi dùng.' 'Người lập hồ sơ/Chuyên viên' 'AI hỗ trợ' 'RD01.01, RD02.01' 'Could' 'Pha 3' $aiScope $aiSrc $aiAcc
Add-Feature 'AIA' $d 'REV1' 'AI xét duyệt cấp cơ sở' 'Soát xét' 'AI soát xét hồ sơ xét duyệt cấp cơ sở' 'Đọc hồ sơ/eForm/tài liệu và đối chiếu checklist về mục tiêu, thuyết minh, dự toán, nhân sự, mua sắm, nguồn tiền, định mức.' 'Chuyên viên/Chuyên quản' 'AI hỗ trợ' 'RD01.01, RD02.01' 'Could' 'Pha 3' $aiScope $aiSrc $aiAcc
Add-Feature 'AIA' $d 'REV1' 'AI xét duyệt cấp cơ sở' 'Kết quả' 'Xem kết quả AI soát xét cấp cơ sở' 'Hiển thị kết quả theo tiêu chí đạt/chưa đạt/cần lưu ý; cảnh báo thiếu hồ sơ, sai lệch dữ liệu, chưa đủ căn cứ.' 'Chuyên viên/Chuyên quản' 'AI hỗ trợ' 'RD01.01, RD02.01' 'Could' 'Pha 3' $aiScope $aiSrc $aiAcc
Add-Feature 'AIA' $d 'REV1' 'AI xét duyệt cấp cơ sở' 'Human-in-the-loop' 'Xác nhận/chỉnh sửa phản hồi AI cấp cơ sở' 'Chuyên viên xác nhận, bác bỏ hoặc chỉnh sửa nhận xét AI; lưu feedback phục vụ cải thiện checklist/skill.' 'Chuyên viên/Chuyên quản' 'AI hỗ trợ' 'RD01.01, RD02.01' 'Could' 'Pha 3' $aiScope $aiSrc $aiAcc
# Xét duyệt cấp Tập đoàn
Add-Feature 'AIA' $d 'REV2' 'AI xét duyệt cấp Tập đoàn' 'Soát xét' 'AI soát xét hồ sơ xét duyệt cấp Tập đoàn' 'Đọc hồ sơ cấp Tập đoàn, đối chiếu checklist về hồ sơ, thuyết minh, dự toán, nhân sự, mua sắm, sản phẩm, căn cứ pháp lý.' 'Chuyên quản' 'AI hỗ trợ' 'RD01.02, RD02.02' 'Could' 'Pha 3' $aiScope $aiSrc $aiAcc
Add-Feature 'AIA' $d 'REV2' 'AI xét duyệt cấp Tập đoàn' 'Kết quả' 'Xem kết quả AI soát xét cấp Tập đoàn' 'Hiển thị kết quả theo tiêu chí; cảnh báo thiếu/sai lệch hồ sơ; đề xuất bổ sung hoặc lưu ý thẩm định trước khi trình.' 'Chuyên quản' 'AI hỗ trợ' 'RD01.02, RD02.02' 'Could' 'Pha 3' $aiScope $aiSrc $aiAcc
Add-Feature 'AIA' $d 'REV2' 'AI xét duyệt cấp Tập đoàn' 'Human-in-the-loop' 'Xác nhận/chỉnh sửa phản hồi AI cấp Tập đoàn' 'Chuyên quản xác nhận, chỉnh sửa hoặc bác bỏ kết quả AI; lưu feedback phục vụ checklist/skill.' 'Chuyên quản' 'AI hỗ trợ' 'RD01.02, RD02.02' 'Could' 'Pha 3' $aiScope $aiSrc $aiAcc
# Điều chỉnh
Add-Feature 'AIA' $d 'ADJ' 'AI điều chỉnh nhiệm vụ' 'Soát xét' 'AI soát xét hồ sơ điều chỉnh' 'Đọc hồ sơ/eForm/tài liệu, đối chiếu checklist theo loại điều chỉnh; phát hiện thiếu hồ sơ, sai lệch dữ liệu, vượt điều kiện điều chỉnh.' 'Chuyên viên' 'AI hỗ trợ' 'RD04' 'Could' 'Pha 3' $aiScope $aiSrc $aiAcc
Add-Feature 'AIA' $d 'ADJ' 'AI điều chỉnh nhiệm vụ' 'Kết quả' 'Xem kết quả AI soát xét điều chỉnh' 'Hiển thị kết quả theo loại cảnh báo, điều kiện đạt/chưa đạt và dữ liệu chênh lệch trước/sau điều chỉnh.' 'Chuyên viên' 'AI hỗ trợ' 'RD04' 'Could' 'Pha 3' $aiScope $aiSrc $aiAcc
Add-Feature 'AIA' $d 'ADJ' 'AI điều chỉnh nhiệm vụ' 'Human-in-the-loop' 'Xác nhận/chỉnh sửa kết quả AI điều chỉnh' 'Chuyên viên xác nhận, chỉnh sửa hoặc bác bỏ kết quả AI; lưu feedback phục vụ checklist/skill.' 'Chuyên viên' 'AI hỗ trợ' 'RD04' 'Could' 'Pha 3' $aiScope $aiSrc $aiAcc
# Thực hiện
Add-Feature 'AIA' $d 'EXE' 'AI theo dõi thực hiện' 'Cảnh báo rủi ro' 'AI phát hiện rủi ro chậm tiến độ/vượt chi phí' 'Phân tích tiến độ, chi phí, mua sắm, tài liệu để cảnh báo nguy cơ chậm tiến độ, thiếu dữ liệu hoặc vượt dự toán; phụ thuộc dữ liệu tích hợp Pha 2.' 'Chủ nhiệm/Cán bộ KHCN' 'AI hỗ trợ' 'RD03' 'Could' 'Pha 3' $aiScope $aiSrc $aiAcc
Add-Feature 'AIA' $d 'EXE' 'AI theo dõi thực hiện' 'Gợi ý nội dung' 'AI gợi ý nội dung cập nhật tiến độ/vướng mắc' 'Tổng hợp dữ liệu thực hiện để gợi ý nội dung cập nhật tiến độ, vướng mắc, kiến nghị cho người phụ trách kiểm tra.' 'Chủ nhiệm/Cán bộ KHCN' 'AI hỗ trợ' 'RD03.06' 'Could' 'Pha 3' $aiScope $aiSrc $aiAcc
Add-Feature 'AIA' $d 'EXE' 'AI theo dõi thực hiện' 'Human-in-the-loop' 'Xác nhận/chỉnh sửa cảnh báo AI thực hiện' 'Chuyên viên xác nhận, bác bỏ hoặc chỉnh sửa cảnh báo/gợi ý AI; lưu feedback phục vụ cải thiện skill/checklist.' 'Chủ nhiệm/Cán bộ KHCN' 'AI hỗ trợ' 'RD03' 'Could' 'Pha 3' $aiScope $aiSrc $aiAcc
# Sản phẩm nghiên cứu
Add-Feature 'AIA' $d 'PROD' 'AI sản phẩm nghiên cứu' 'Chuẩn hóa' 'AI gợi ý chuẩn hóa mô tả sản phẩm' 'Đọc hồ sơ nhiệm vụ/nghiệm thu/tài liệu kỹ thuật để gợi ý mô tả sản phẩm, từ khóa, lĩnh vực ứng dụng và nhóm sản phẩm.' 'Cán bộ quản lý sản phẩm' 'AI hỗ trợ' 'RD07' 'Could' 'Pha 3' $aiScope $aiSrc $aiAcc
Add-Feature 'AIA' $d 'PROD' 'AI sản phẩm nghiên cứu' 'Chống trùng lặp' 'AI phát hiện trùng/lặp sản phẩm' 'So sánh tên, mô tả, tài liệu và nhiệm vụ nguồn để cảnh báo sản phẩm trùng hoặc gần trùng trong danh mục.' 'Cán bộ quản lý sản phẩm' 'AI hỗ trợ' 'RD07' 'Could' 'Pha 3' $aiScope $aiSrc $aiAcc
Add-Feature 'AIA' $d 'PROD' 'AI sản phẩm nghiên cứu' 'Human-in-the-loop' 'Xác nhận/chỉnh sửa gợi ý AI cho sản phẩm' 'Người dùng xác nhận, chỉnh sửa hoặc bác bỏ gợi ý AI; lưu feedback để cải thiện checklist/skill.' 'Cán bộ quản lý sản phẩm' 'AI hỗ trợ' 'RD07' 'Could' 'Pha 3' $aiScope $aiSrc $aiAcc
# Sở hữu trí tuệ
Add-Feature 'AIA' $d 'IP' 'AI sở hữu trí tuệ' 'Rà soát' 'AI rà soát hồ sơ SHTT' 'Đọc hồ sơ/tài liệu SHTT; kiểm tra thiếu tài liệu, sai biểu mẫu, thiếu thông tin tác giả/sản phẩm/nhiệm vụ liên quan.' 'Cán bộ SHTT' 'AI hỗ trợ' 'RD08' 'Could' 'Pha 3' $aiScope $aiSrc $aiAcc
Add-Feature 'AIA' $d 'IP' 'AI sở hữu trí tuệ' 'Phân loại' 'AI gợi ý phân loại bài báo/sáng chế/công nghệ lõi' 'Gợi ý loại hồ sơ SHTT, lĩnh vực công nghệ, từ khóa và sản phẩm/nhiệm vụ liên quan dựa trên nội dung tài liệu.' 'Cán bộ SHTT' 'AI hỗ trợ' 'RD08' 'Could' 'Pha 3' $aiScope $aiSrc $aiAcc
Add-Feature 'AIA' $d 'IP' 'AI sở hữu trí tuệ' 'Human-in-the-loop' 'Xác nhận/chỉnh sửa kết quả AI SHTT' 'Chuyên viên xác nhận, chỉnh sửa hoặc bác bỏ kết quả AI; lưu feedback phục vụ cải thiện skill/checklist.' 'Cán bộ SHTT' 'AI hỗ trợ' 'RD08' 'Could' 'Pha 3' $aiScope $aiSrc $aiAcc
# Thẩm định
Add-Feature 'AIA' $d 'APP' 'AI hỗ trợ thẩm định' 'Rà soát' 'AI rà soát hồ sơ trước thẩm định' 'Đọc hồ sơ nguồn, tài liệu, dữ liệu tích hợp và checklist để gợi ý điểm thiếu/sai lệch/cần lưu ý cho người thẩm định.' 'Người thẩm định' 'AI hỗ trợ' 'RD01, RD02, RD04, RD05' 'Could' 'Pha 3' $aiScope $aiSrc $aiAcc
Add-Feature 'AIA' $d 'APP' 'AI hỗ trợ thẩm định' 'Gợi ý nhận xét' 'AI gợi ý nhận xét thẩm định' 'Gợi ý nhận xét/kiến nghị dựa trên checklist, dữ liệu hồ sơ và tài liệu liên quan để người thẩm định xem xét; không thay thế phiếu nhận xét chính thức (CAP-09).' 'Người thẩm định' 'AI hỗ trợ' 'RD01, RD02, RD04, RD05' 'Could' 'Pha 3' $aiScope $aiSrc $aiAcc
Add-Feature 'AIA' $d 'APP' 'AI hỗ trợ thẩm định' 'Kết quả' 'Xem kết quả AI hỗ trợ thẩm định' 'Hiển thị kết quả theo tiêu chí, mức cảnh báo, căn cứ, tài liệu tham chiếu và trạng thái xác nhận của người dùng.' 'Người thẩm định' 'AI hỗ trợ' 'RD01, RD02, RD04, RD05' 'Could' 'Pha 3' $aiScope $aiSrc $aiAcc
Add-Feature 'AIA' $d 'APP' 'AI hỗ trợ thẩm định' 'Human-in-the-loop' 'Xác nhận/chỉnh sửa kết quả AI thẩm định' 'Người thẩm định xác nhận, chỉnh sửa hoặc bác bỏ gợi ý AI; lưu feedback để cải thiện checklist/skill.' 'Người thẩm định' 'AI hỗ trợ' 'RD01, RD02, RD04, RD05' 'Could' 'Pha 3' $aiScope $aiSrc $aiAcc

function Get-CapabilityCodes {
    param($FeatureRow)
    $caps=[System.Collections.Generic.List[string]]::new()
    function Add-Cap([string]$code){ if(-not $caps.Contains($code)){ $caps.Add($code) } }
    $domain=[string]$FeatureRow.Domain; $module=[string]$FeatureRow.Module; $feature=[string]$FeatureRow.Feature; $group=[string]$FeatureRow.Group; $type=[string]$FeatureRow.Type
    if($domain -eq 'Quản lý Nhiệm vụ KHCN'){ Add-Cap 'CAP-02'; Add-Cap 'CAP-04' }
    if($domain -in @('Chủ trương & Xét duyệt','Nghiệm thu','Quyết toán')){ Add-Cap 'CAP-04'; Add-Cap 'CAP-08' }
    if($domain -eq 'Không gian làm việc & Task'){
        if($module -eq 'Việc của tôi'){ Add-Cap 'CAP-07' }
        if($module -eq 'Xử lý task'){ Add-Cap 'CAP-08' }
        if($module -eq 'Nhập liệu thay cấp Tập đoàn'){ Add-Cap 'CAP-12' }
        if($feature -match 'Ủy quyền|chuyển giao'){ Add-Cap 'CAP-13' }
        if($module -eq 'Xử lý ngoại lệ có kiểm soát'){ Add-Cap 'CAP-14' }
    }
    if($domain -eq 'Hồ sơ, Tài liệu & Biểu mẫu'){
        if($module -eq 'Quản trị hồ sơ'){ Add-Cap 'CAP-04' }
        elseif($module -eq 'Biểu mẫu động'){ Add-Cap 'CAP-05' }
        else { Add-Cap 'CAP-06' }
    }
    if($domain -eq 'Hội đồng & Thẩm định'){
        if($module -eq 'Quản lý hội đồng'){ Add-Cap 'CAP-10' }
        if($feature -match 'Phiếu nhận xét|Phiếu đánh giá|chấm|đánh giá'){ Add-Cap 'CAP-09' }
        if($feature -match 'phiên|Biên bản|biên bản'){ Add-Cap 'CAP-11' }
    }
    if($domain -eq 'Thực hiện Nhiệm vụ'){ Add-Cap 'CAP-16'; if($type -eq 'Tích hợp'){ Add-Cap 'CAP-15' }; if($module -eq 'Báo cáo thực hiện'){ Add-Cap 'CAP-18' } }
    if($domain -eq 'Điều chỉnh, Tạm dừng & Dừng'){ Add-Cap 'CAP-14' }
    if($domain -eq 'Sản phẩm Nghiên cứu & SHTT'){ Add-Cap 'CAP-04'; if($type -eq 'Tích hợp'){ Add-Cap 'CAP-15' } }
    if($domain -eq 'Báo cáo & Điều hành'){ if($feature -match 'Cảnh báo'){ Add-Cap 'CAP-17' } else { Add-Cap 'CAP-18' } }
    if($domain -eq 'Lưu trữ, Pháp lý & Tra cứu'){ Add-Cap 'CAP-06' }
    if($domain -eq 'Quy trình & Cấu hình Nghiệp vụ'){
        if($module -in @('Định nghĩa quy trình','BPMN Designer','Luật nghiệp vụ & DMN')){ Add-Cap 'CAP-01' }
        if($module -eq 'Định nghĩa quy trình' -and ($feature -match 'phiên bản|Phiên bản|ban hành|Ban hành|hiệu lực|Hiệu lực|rollback')){ Add-Cap 'CAP-03' }
        if($module -in @('Ma trận phê duyệt','Cấu hình hành động')){ Add-Cap 'CAP-08' }
        if($module -eq 'SLA & Escalation'){ Add-Cap 'CAP-17' }
    }
    if($domain -eq 'Tích hợp Hệ thống'){ Add-Cap 'CAP-15' }
    if($domain -eq 'Vận hành Workflow & Hệ thống'){ Add-Cap 'CAP-01'; Add-Cap 'CAP-17' }
    if($domain -eq 'Audit, An toàn & Cấu hình Hệ thống'){ if($module -eq 'Audit & tuân thủ'){ Add-Cap 'CAP-19' } else { Add-Cap 'CAP-20' } }
    if($domain -eq 'Truy cập, Tổ chức & Phân quyền'){ Add-Cap 'CAP-20'; if($feature -match 'Ủy quyền'){ Add-Cap 'CAP-13' } }
    if($domain -eq 'Trợ lý AI hỗ trợ nghiệp vụ'){ Add-Cap 'CAP-21' }
    if($caps.Count -eq 0){ return 'N/A' }
    return ($caps -join '; ')
}

function Get-RequirementCodes {
    param($FeatureRow)
    if ([string]$FeatureRow.Domain -ne 'Trợ lý AI hỗ trợ nghiệp vụ') { return '' }
    $reqs=[System.Collections.Generic.List[string]]::new()
    function Add-Req([string]$code){ if(-not $reqs.Contains($code)){ $reqs.Add($code) } }
    $module=[string]$FeatureRow.Module; $group=[string]$FeatureRow.Group; $feature=[string]$FeatureRow.Feature
    if($module -eq 'Nền tảng AI'){
        switch($group){
            'Quản trị tri thức' { Add-Req 'REQ-064'; Add-Req 'REQ-065'; Add-Req 'NFR-010'; Add-Req 'NFR-012' }
            'Cấu hình' { Add-Req 'NFR-009'; Add-Req 'NFR-011' }
            'Retrieval & căn cứ' { Add-Req 'REQ-064'; Add-Req 'REQ-065'; Add-Req 'REQ-066'; Add-Req 'NFR-010' }
            'Model serving' { Add-Req 'NFR-008' }
            'Kết quả & phản hồi' { Add-Req 'REQ-067'; Add-Req 'REQ-068'; Add-Req 'NFR-010'; Add-Req 'NFR-012' }
            'Truy vết' { Add-Req 'REQ-068'; Add-Req 'NFR-010' }
            'Bảo mật' { Add-Req 'NFR-008'; Add-Req 'NFR-009' }
            'Khả dụng' { Add-Req 'NFR-011' }
        }
    } else {
        if($group -eq 'Human-in-the-loop'){ Add-Req 'REQ-068' }
        elseif($group -eq 'Kết quả'){ Add-Req 'REQ-067'; if($module -eq 'AI điều chỉnh nhiệm vụ'){ Add-Req 'REQ-066' } }
        elseif($feature -match 'rủi ro|trùng/lặp'){ Add-Req 'REQ-066' }
        elseif($feature -match 'soát xét|rà soát'){ Add-Req 'REQ-065'; if($module -eq 'AI điều chỉnh nhiệm vụ'){ Add-Req 'REQ-066' } }
        elseif($feature -match 'gợi ý|chuẩn hóa|phân loại'){ Add-Req 'REQ-064' }
    }
    return ($reqs -join '; ')
}

function Get-AIAcceptance {
    param($FeatureRow,[string]$RequirementCodes)
    if ([string]$FeatureRow.Domain -ne 'Trợ lý AI hỗ trợ nghiệp vụ') { return [string]$FeatureRow.Acceptance }
    $criteria=[System.Collections.Generic.List[string]]::new()
    $criteria.Add('Phạm vi tùy chọn; chờ chốt A7. Áp dụng AI-AC-01…AI-AC-07 nếu được duyệt.')
    if($RequirementCodes -match 'REQ-064'){ $criteria.Add('Gợi ý tách biệt với dữ liệu đã xác nhận, có căn cứ và chỉ được ghi sau khi người dùng xác nhận.') }
    if($RequirementCodes -match 'REQ-065'){ $criteria.Add('Kết quả theo từng tiêu chí đạt/chưa đạt/cần lưu ý và truy được phiên bản checklist.') }
    if($RequirementCodes -match 'REQ-066'){ $criteria.Add('Cảnh báo có loại, mức độ, dữ liệu so sánh và lý do; không tự chặn/chuyển bước.') }
    if($RequirementCodes -match 'REQ-067'){ $criteria.Add('Hiển thị cấu trúc gồm tiêu chí, trạng thái, mức cảnh báo, gợi ý, căn cứ và trạng thái xác nhận.') }
    if($RequirementCodes -match 'REQ-068'){ $criteria.Add('Lưu bất biến kết quả gốc, quyết định, nội dung sau sửa, người/thời điểm và phiên bản mô hình/checklist.') }
    if($RequirementCodes -match 'NFR-008'){ $criteria.Add('Chạy trên hạ tầng được VHT chấp thuận; không gửi dữ liệu hồ sơ tới dịch vụ AI ngoài.') }
    if($RequirementCodes -match 'NFR-009'){ $criteria.Add('AI không hoàn tất User Task, đổi cột mốc, phê duyệt hoặc ghi đè dữ liệu nghiệp vụ.') }
    if($RequirementCodes -match 'NFR-010'){ $criteria.Add('Audit truy được hồ sơ/Task, nguồn, mô hình, checklist và quyết định người dùng.') }
    if($RequirementCodes -match 'NFR-011'){ $criteria.Add('Lỗi/timeout/thiếu căn cứ không làm kẹt quy trình; người dùng tiếp tục thủ công.') }
    if($RequirementCodes -match 'NFR-012'){ $criteria.Add('Phản hồi không tự thay đổi mô hình/checklist hoặc thành dữ liệu huấn luyện khi chưa phê duyệt.') }
    return ($criteria -join ' ')
}

foreach($f in $features){
    if($f.Feature -eq 'Tích hợp Storage/DMS'){
        $f.Release='Pha 1'; $f.Priority='Must'; $f.ScopeStatus='Cần xác nhận'; $f.Source='Hiệu chỉnh theo BRD 0.9'; $f.Acceptance='RD08 thuộc Pha 1 và phụ thuộc Storage; cần chốt B5.'
    }
}
foreach($f in $features){
    $f | Add-Member -NotePropertyName Capability -NotePropertyValue (Get-CapabilityCodes $f)
    $reqCodes=Get-RequirementCodes $f
    $f | Add-Member -NotePropertyName Requirement -NotePropertyValue $reqCodes
    if($f.Domain -eq 'Trợ lý AI hỗ trợ nghiệp vụ'){ $f.Acceptance=Get-AIAcceptance $f $reqCodes }
}

$excel = New-Object -ComObject Excel.Application
$excel.Visible = $false
$excel.DisplayAlerts = $false
$excel.ScreenUpdating = $false

try {
    $wb = $excel.Workbooks.Add()
    while ($wb.Worksheets.Count -lt 7) { $wb.Worksheets.Add() | Out-Null }
    $names = @('00_Tong_quan','01_Functional_Scope','02_Phan_he','03_Danh_muc','04_Thay_doi','05_Cau_hoi_mo','99_Danh_sach_goc')
    for ($i=1; $i -le 7; $i++) { $wb.Worksheets.Item($i).Name = $names[$i-1] }

    $navy = 0x6B3412
    $blue = 0xC68642
    $lightBlue = 0xEFD9C4
    $lightGray = 0xF2F2F2
    $green = 0xD9EAD3
    $yellow = 0xD9EAD3
    $orange = 0xCCE5FF
    $red = 0xCECEFF
    $white = 0xFFFFFF
    $dark = 0x333333

    # Danh mục dùng cho dropdown
    $ws = $wb.Worksheets.Item('03_Danh_muc')
    $ws.Cells.Clear()
    $lists = [ordered]@{
        'Priority' = @('Must','Should','Could','Won''t/Để sau')
        'Release' = @('Pha 1','Pha 2','Pha 3','Chưa xếp pha')
        'Trạng thái phạm vi' = @('Đề xuất trong phạm vi','Cần xác nhận','Ngoài phạm vi','Hoãn')
        'Loại' = @('Nghiệp vụ','Workflow','Nền tảng','Cấu hình','Tích hợp','Báo cáo','Phân quyền','Bảo mật','Audit','Vận hành','Hỗ trợ','AI hỗ trợ')
        'Nguồn' = @('Giữ từ VHT_WBS','Hiệu chỉnh từ VHT_WBS','Bổ sung','Bổ sung theo tài liệu kiến trúc','Cần xác nhận')
    }
    $col=1
    foreach($entry in $lists.GetEnumerator()) {
        $ws.Cells.Item(1,$col).Value2=$entry.Key
        for($r=0;$r -lt $entry.Value.Count;$r++){ $ws.Cells.Item($r+2,$col).Value2=$entry.Value[$r] }
        $ws.Range($ws.Cells.Item(1,$col),$ws.Cells.Item(1,$col)).Interior.Color=$navy
        $ws.Cells.Item(1,$col).Font.Color=$white; $ws.Cells.Item(1,$col).Font.Bold=$true
        $col++
    }
    $wb.Names.Add('FSL_Priority',"='03_Danh_muc'!`$A`$2:`$A`$5") | Out-Null
    $wb.Names.Add('FSL_Release',"='03_Danh_muc'!`$B`$2:`$B`$5") | Out-Null
    $wb.Names.Add('FSL_ScopeStatus',"='03_Danh_muc'!`$C`$2:`$C`$5") | Out-Null
    $ws.Columns('A:E').ColumnWidth=28
    $ws.Range('A1:E8').Borders.LineStyle=1
    $ws.Range('A1:E8').Borders.Color=0xD9D9D9
    $ws.Application.ActiveWindow.DisplayGridlines=$false

    # Functional Scope List
    $ws = $wb.Worksheets.Item('01_Functional_Scope')
    $headers = @('STT','Feature ID','Phân hệ','Module','Nhóm chức năng','Chức năng','Mô tả phạm vi','Vai trò chính','Loại','Quy trình/RD','Capability ID','Priority','Release đề xuất','Trạng thái phạm vi','Nguồn/Thay đổi','Định hướng nghiệm thu/Ghi chú','Requirement/NFR ID')
    $ws.Range('A1:Q1').Merge()
    $ws.Range('A1').Value2='FUNCTIONAL SCOPE LIST – HỆ THỐNG QUẢN LÝ NHIỆM VỤ KHCN'
    $ws.Range('A1:Q1').Interior.Color=$navy; $ws.Range('A1:Q1').Font.Color=$white; $ws.Range('A1:Q1').Font.Bold=$true; $ws.Range('A1:Q1').Font.Size=16; $ws.Range('A1:Q1').HorizontalAlignment=-4108
    $ws.Range('A2:Q2').Merge(); $ws.Range('A2').Value2='Phiên bản đồng bộ theo BRD 0.9.3 và HLD 3.3-draft: CAP-01…CAP-20, 28 luồng nghiệp vụ, phân pha chính thức, nguyên tắc nghiệm thu hai mức (CAP-14…CAP-18 nghiệm thu năng lực nền tại Pha 1). Phân hệ Trợ lý AI (CAP-21) là đề xuất tùy chọn, chờ khách chốt A7; 23 tính năng nguồn được truy vết qua REQ-064…REQ-068. Đây là danh mục phạm vi chức năng, chưa phải WBS ước lượng.'
    $ws.Range('A2:Q2').Interior.Color=$lightBlue; $ws.Range('A2:Q2').Font.Italic=$true; $ws.Range('A2:Q2').WrapText=$true
    for($c=0;$c -lt $headers.Count;$c++){ $ws.Cells.Item(4,$c+1).Value2=$headers[$c] }
    $startRow=5
    $r=$startRow
    foreach($f in $features){
        $vals=@($f.STT,$f.ID,$f.Domain,$f.Module,$f.Group,$f.Feature,$f.Description,$f.Roles,$f.Type,$f.Process,$f.Capability,$f.Priority,$f.Release,$f.ScopeStatus,$f.Source,$f.Acceptance,$f.Requirement)
        for($c=0;$c -lt $vals.Count;$c++){ $ws.Cells.Item($r,$c+1).Value2=[string]$vals[$c] }
        $ws.Cells.Item($r,1).Value2=[int]$f.STT
        $r++
    }
    $lastRow=$r-1
    $table=$ws.ListObjects.Add(1,$ws.Range("A4:Q$lastRow"),$null,1)
    $table.Name='tblFunctionalScope'; $table.TableStyle='TableStyleMedium2'
    $ws.Range("L5:L$lastRow").Validation.Delete(); $ws.Range("L5:L$lastRow").Validation.Add(3,1,1,'=FSL_Priority')
    $ws.Range("M5:M$lastRow").Validation.Delete(); $ws.Range("M5:M$lastRow").Validation.Add(3,1,1,'=FSL_Release')
    $ws.Range("N5:N$lastRow").Validation.Delete(); $ws.Range("N5:N$lastRow").Validation.Add(3,1,1,'=FSL_ScopeStatus')
    $ws.Range("L5:L$lastRow").FormatConditions.Delete()
    foreach($cf in @(@('Must',0xCCE5FF),@('Should',0xD9EAD3),@('Could',0xE0E0E0),@("Won't/Để sau",0xCECEFF))){
        $fc=$ws.Range("L5:L$lastRow").FormatConditions.Add(2,$null,"=`$L5=`"$($cf[0])`"")
        $fc.Interior.Color=$cf[1]
    }
    $ws.Range("N5:N$lastRow").FormatConditions.Delete()
    $fc=$ws.Range("N5:N$lastRow").FormatConditions.Add(2,$null,'=$N5="Cần xác nhận"'); $fc.Interior.Color=0x99CCFF
    $ws.Range("A4:Q$lastRow").VerticalAlignment=-4160
    $ws.Range("C5:Q$lastRow").WrapText=$true
    $ws.Range("A4:Q4").Interior.Color=$navy; $ws.Range("A4:Q4").Font.Color=$white; $ws.Range("A4:Q4").Font.Bold=$true; $ws.Range("A4:Q4").HorizontalAlignment=-4108; $ws.Range("A4:Q4").WrapText=$true
    $widths=@(6,16,27,25,24,34,48,30,15,18,20,12,15,22,25,42,24)
    for($c=1;$c -le 17;$c++){ $ws.Columns.Item($c).ColumnWidth=$widths[$c-1] }
    $ws.Rows.Item(1).RowHeight=30; $ws.Rows.Item(2).RowHeight=34; $ws.Rows.Item(4).RowHeight=34
    $ws.Activate(); $excel.ActiveWindow.SplitRow=4; $excel.ActiveWindow.SplitColumn=2; $excel.ActiveWindow.FreezePanes=$true; $excel.ActiveWindow.DisplayGridlines=$false

    # Phân hệ summary
    $domainDescriptions = [ordered]@{
        'Truy cập, Tổ chức & Phân quyền'='SSO, tổ chức, người dùng, vai trò, quyền và phạm vi dữ liệu.'
        'Quản lý Nhiệm vụ KHCN'='Hồ sơ nhiệm vụ trung tâm và vòng đời RD01–RD10.'
        'Chủ trương & Xét duyệt'='RD01 chủ trương và RD02 xét duyệt/giao nhiệm vụ.'
        'Không gian làm việc & Task'='Worklist, task UI, action chuẩn và ngoại lệ có kiểm soát.'
        'Hồ sơ, Tài liệu & Biểu mẫu'='Dossier, eForm, mẫu văn bản, file và ký số.'
        'Hội đồng & Thẩm định'='Hội đồng, chuyên gia, lịch họp, phiếu và biên bản.'
        'Thực hiện Nhiệm vụ'='Kế hoạch, nhân sự, kinh phí, mua sắm, tài sản và báo cáo.'
        'Điều chỉnh, Tạm dừng & Dừng'='Các loại điều chỉnh nhiệm vụ thuộc RD04.'
        'Nghiệm thu'='Hồ sơ, điều kiện, hội đồng và kết quả RD05.'
        'Quyết toán'='Hồ sơ, chứng từ, đối soát và kết quả RD06.'
        'Sản phẩm Nghiên cứu & SHTT'='Sản phẩm, công bố, công nghệ và SHTT RD07–RD08.'
        'Báo cáo & Điều hành'='Dashboard, KPI, cảnh báo và báo cáo RD09.'
        'Lưu trữ, Pháp lý & Tra cứu'='Hồ sơ pháp lý, nộp lưu và tìm kiếm RD10.'
        'Quy trình & Cấu hình Nghiệp vụ'='Workflow definition, BPMN, DMN, approval, action, notification, SLA, master data.'
        'Tích hợp Hệ thống'='Integration Hub, connector, đối soát và độ tin cậy.'
        'Vận hành Workflow & Hệ thống'='Runtime administration, incident, monitoring và SLA instance.'
        'Audit, An toàn & Cấu hình Hệ thống'='Audit bất biến, tham số, feature toggle và bảo mật.'
        'Trợ giúp & Hỗ trợ Người dùng'='Hướng dẫn, onboarding và yêu cầu hỗ trợ.'
        'Trợ lý AI hỗ trợ nghiệp vụ'='23 tính năng nghiệp vụ AI-Agent và 8 năng lực nền tảng kiểm soát AI; CAP-21 tùy chọn, chờ A7.'
    }
    $ws=$wb.Worksheets.Item('02_Phan_he')
    $ws.Range('A1:H1').Merge(); $ws.Range('A1').Value2='MA TRẬN PHÂN HỆ VÀ MỨC BAO PHỦ'
    $ws.Range('A1:H1').Interior.Color=$navy; $ws.Range('A1:H1').Font.Color=$white; $ws.Range('A1:H1').Font.Bold=$true; $ws.Range('A1:H1').Font.Size=16; $ws.Range('A1:H1').HorizontalAlignment=-4108
    $sumHeaders=@('STT','Phân hệ','Mô tả phạm vi','Tổng chức năng','Must','Should','Could','Cần xác nhận')
    for($c=0;$c -lt $sumHeaders.Count;$c++){ $ws.Cells.Item(3,$c+1).Value2=$sumHeaders[$c] }
    $rr=4; $idx=1
    foreach($entry in $domainDescriptions.GetEnumerator()){
        $ws.Cells.Item($rr,1).Value2=[string]$idx
        $ws.Cells.Item($rr,2).Value2=[string]$entry.Key
        $ws.Cells.Item($rr,3).Value2=[string]$entry.Value
        $ws.Cells.Item($rr,4).Formula="=COUNTIF('01_Functional_Scope'!`$C`$5:`$C`$$lastRow,B$rr)"
        $ws.Cells.Item($rr,5).Formula="=COUNTIFS('01_Functional_Scope'!`$C`$5:`$C`$$lastRow,B$rr,'01_Functional_Scope'!`$L`$5:`$L`$$lastRow,E`$3)"
        $ws.Cells.Item($rr,6).Formula="=COUNTIFS('01_Functional_Scope'!`$C`$5:`$C`$$lastRow,B$rr,'01_Functional_Scope'!`$L`$5:`$L`$$lastRow,F`$3)"
        $ws.Cells.Item($rr,7).Formula="=COUNTIFS('01_Functional_Scope'!`$C`$5:`$C`$$lastRow,B$rr,'01_Functional_Scope'!`$L`$5:`$L`$$lastRow,G`$3)"
        $ws.Cells.Item($rr,8).Formula="=COUNTIFS('01_Functional_Scope'!`$C`$5:`$C`$$lastRow,B$rr,'01_Functional_Scope'!`$N`$5:`$N`$$lastRow,H`$3)"
        $rr++; $idx++
    }
    $sumLast=$rr-1
    $t=$ws.ListObjects.Add(1,$ws.Range("A3:H$sumLast"),$null,1); $t.Name='tblDomains'; $t.TableStyle='TableStyleMedium2'
    $ws.Range("A3:H3").Interior.Color=$navy; $ws.Range("A3:H3").Font.Color=$white; $ws.Range("A3:H3").Font.Bold=$true
    $ws.Columns('A').ColumnWidth=7; $ws.Columns('B').ColumnWidth=34; $ws.Columns('C').ColumnWidth=65; $ws.Columns('D:H').ColumnWidth=15
    $ws.Range("B4:C$sumLast").WrapText=$true; $ws.Range("A3:H$sumLast").VerticalAlignment=-4160
    $ws.Activate(); $excel.ActiveWindow.SplitRow=3; $excel.ActiveWindow.FreezePanes=$true; $excel.ActiveWindow.DisplayGridlines=$false

    # Dashboard
    $ws=$wb.Worksheets.Item('00_Tong_quan')
    $ws.Range('A1:L2').Merge(); $ws.Range('A1').Value2='FUNCTIONAL SCOPE LIST – QTKHCN'
    $ws.Range('A1:L2').Interior.Color=$navy; $ws.Range('A1:L2').Font.Color=$white; $ws.Range('A1:L2').Font.Bold=$true; $ws.Range('A1:L2').Font.Size=22; $ws.Range('A1:L2').HorizontalAlignment=-4108; $ws.Range('A1:L2').VerticalAlignment=-4108
    $ws.Range('A4:B4').Merge(); $ws.Range('A4').Value2='Tổng chức năng'; $ws.Range('A5:B6').Merge(); $ws.Range('A5').Formula="=COUNTA('01_Functional_Scope'!`$B`$5:`$B`$$lastRow)"
    $ws.Range('D4:E4').Merge(); $ws.Range('D4').Value2='Phân hệ'; $ws.Range('D5:E6').Merge(); $ws.Range('D5').Formula="=COUNTA('02_Phan_he'!`$B`$4:`$B`$$sumLast)"
    $ws.Range('G4:H4').Merge(); $ws.Range('G4').Value2='Priority Must'; $ws.Range('G5:H6').Merge(); $ws.Range('G5').Formula="=COUNTIF('01_Functional_Scope'!`$L`$5:`$L`$$lastRow,`"Must`")"
    $ws.Range('J4:K4').Merge(); $ws.Range('J4').Value2='Cần xác nhận'; $ws.Range('J5:K6').Merge(); $ws.Range('J5').Formula="=COUNTIF('01_Functional_Scope'!`$N`$5:`$N`$$lastRow,`"Cần xác nhận`")"
    foreach($rng in @('A4:B4','D4:E4','G4:H4','J4:K4')){ $ws.Range($rng).Interior.Color=$blue; $ws.Range($rng).Font.Color=$white; $ws.Range($rng).Font.Bold=$true; $ws.Range($rng).HorizontalAlignment=-4108 }
    foreach($rng in @('A5:B6','D5:E6','G5:H6','J5:K6')){ $ws.Range($rng).Interior.Color=$lightBlue; $ws.Range($rng).Font.Bold=$true; $ws.Range($rng).Font.Size=20; $ws.Range($rng).HorizontalAlignment=-4108; $ws.Range($rng).VerticalAlignment=-4108 }
    $ws.Range('A8:F8').Merge(); $ws.Range('A8').Value2='Hướng dẫn sử dụng'; $ws.Range('A8:F8').Interior.Color=$navy; $ws.Range('A8:F8').Font.Color=$white; $ws.Range('A8:F8').Font.Bold=$true
    $instructions=@(
        '1. Sheet 01 là nguồn chính: lọc theo phân hệ, module, Capability ID, priority, release và trạng thái phạm vi.',
        '2. Catalogue CAP-01…CAP-20 và phân pha được đồng bộ theo BRD 0.9.3/HLD 3.3-draft; nghiệm thu hai mức theo BRD mục 9 (chờ A6); phân hệ Trợ lý AI CAP-21 là tùy chọn (chờ A7), truy vết REQ-064…REQ-068 và NFR-008…NFR-012.',
        '3. Các dòng “Cần xác nhận” liên kết với câu hỏi A/B/C/D tại sheet 05_Cau_hoi_mo.',
        '4. Functional Scope List chưa chứa effort, owner và timeline; các trường này thuộc WBS/roadmap tiếp theo.',
        '5. Sheet 99 giữ danh sách gốc để truy vết các sửa đổi và phần bổ sung.'
    )
    for($i=0;$i -lt $instructions.Count;$i++){ $ws.Range("A$($i+9):F$($i+9)").Merge(); $ws.Cells.Item($i+9,1).Value2=$instructions[$i] }
    $ws.Range('A9:F13').WrapText=$true; $ws.Range('A9:F13').Interior.Color=0xF7F7F7
    $ws.Range('A15').Value2='Phân hệ'; $ws.Range('B15').Value2='Số chức năng'
    $rr=16
    foreach($name in $domainDescriptions.Keys){ $ws.Cells.Item($rr,1).Value2=$name; $ws.Cells.Item($rr,2).Formula="=COUNTIF('01_Functional_Scope'!`$C`$5:`$C`$$lastRow,A$rr)"; $rr++ }
    $chartLast=$rr-1
    $ws.Range("A15:B$chartLast").Borders.LineStyle=1; $ws.Range('A15:B15').Interior.Color=$navy; $ws.Range('A15:B15').Font.Color=$white; $ws.Range('A15:B15').Font.Bold=$true
    $chartObj=$ws.ChartObjects().Add($ws.Range('D15').Left,$ws.Range('D15').Top,650,420)
    $chart=$chartObj.Chart; $chart.ChartType=57; $chart.SetSourceData($ws.Range("A15:B$chartLast")); $chart.HasTitle=$true; $chart.ChartTitle.Text='Số chức năng theo phân hệ'; $chart.HasLegend=$false
    $ws.Columns('A').ColumnWidth=38; $ws.Columns('B').ColumnWidth=14; $ws.Columns('C').ColumnWidth=3; $ws.Columns('D:L').ColumnWidth=12
    $ws.Rows('9:13').RowHeight=28; $ws.Application.ActiveWindow.DisplayGridlines=$false

    # Change log
    $ws=$wb.Worksheets.Item('04_Thay_doi')
    $ws.Range('A1:F1').Merge(); $ws.Range('A1').Value2='NHẬT KÝ HIỆU CHỈNH VÀ BỔ SUNG PHẠM VI'; $ws.Range('A1:F1').Interior.Color=$navy; $ws.Range('A1:F1').Font.Color=$white; $ws.Range('A1:F1').Font.Bold=$true; $ws.Range('A1:F1').Font.Size=16; $ws.Range('A1:F1').HorizontalAlignment=-4108
    $changeHeaders=@('STT','Loại thay đổi','Tham chiếu gốc','Nội dung','Xử lý trong FSL','Ghi chú')
    for($c=0;$c -lt 6;$c++){ $ws.Cells.Item(3,$c+1).Value2=$changeHeaders[$c] }
    $changes=@(
        @('Sửa cấu trúc','Cột D','Cột không có tiêu đề','Đặt tên thành Nhóm chức năng/Sub-module và chuẩn hóa thành trường Nhóm chức năng.',''),
        @('Bổ sung mã','Cột TT','Cột trống toàn bộ','Sinh STT và Feature ID duy nhất theo phân hệ/module.',''),
        @('Bổ sung ưu tiên','Cột Priority','Cột trống toàn bộ','Gán MoSCoW sơ bộ và thêm dropdown để hiệu chỉnh.','Cần workshop chốt.'),
        @('Sửa lỗi','Dòng 22','ma trạn quyết định','Chuẩn hóa thành ma trận quyết định/DMN.',''),
        @('Sửa lỗi','Dòng 27','Copy ma trận quyết định trong module phê duyệt','Chuẩn hóa thành sao chép ma trận phê duyệt.',''),
        @('Sửa lỗi','Dòng 34–36','Trùng tạo Loại phê duyệt, thiếu CRUD','Thay bằng chức năng quản lý danh mục loại phê duyệt đầy đủ.',''),
        @('Sửa lỗi','Dòng 113','Lịch sử Hồ sơ quyết toán trong eForm','Thay bằng quản lý lịch sử eForm.',''),
        @('Phân rã','Dòng 55','Tích hợp','Tách Integration Hub, 8 connector, monitoring, retry và đối soát.','Phạm vi từng connector cần xác nhận.'),
        @('Phân rã','Dòng 107','Dashboard đa cấp','Tách KPI nhiệm vụ, SLA, kinh phí, nhân sự, sản phẩm và cảnh báo.',''),
        @('Bổ sung phân hệ','Không có','Hội đồng & Thẩm định','Bổ sung hội đồng, chuyên gia, lịch, phiếu, tổng hợp và biên bản.',''),
        @('Bổ sung phân hệ','Không có','Thực hiện nhiệm vụ','Bổ sung tiến độ, nhân sự, kinh phí, mua sắm, tài sản và báo cáo.',''),
        @('Bổ sung phân hệ','Không có','Sản phẩm nghiên cứu & SHTT','Bổ sung RD07, RD08, công bố và công nghệ lõi.',''),
        @('Bổ sung phân hệ','Không có','Runtime Administration','Bổ sung instance, incident, retry, reassign, cancel, restart và batch.',''),
        @('Bổ sung nền tảng','Không có','SSO/RBAC/Audit/SLA/Notification/Search','Bổ sung các capability xuyên suốt theo kiến trúc mục tiêu.',''),
        @('Chuẩn hóa truy vết','BRD 0.9/HLD 3.0','Catalogue CAP không đồng nhất','Chốt CAP-01…CAP-20 theo BRD và thêm cột Capability ID.',''),
        @('Hiệu chỉnh phân pha','BRD mục 8','Pha trong bản FSL đầu chưa theo nguồn chính thức','Đưa RD03.06, RD05, RD06, RD08 và RD10 về Pha 1.',''),
        @('Phân rã nghiệp vụ','RD04','Bốn nhóm điều chỉnh khái quát','Phân rã thành 10 luồng RD04.01–RD04.10 theo loại và cấp.',''),
        @('Chuẩn hóa chủ dữ liệu','CAP-16','PM QLKHCN bị mô tả như nguồn dữ liệu thực hiện','Đổi thành đọc/hiển thị/cảnh báo dữ liệu từ QLNS, MS, SAP, QLTS, PLM.',''),
        @('Bổ sung đặc thù','CAP-12','Nhập liệu thay còn khái quát','Bổ sung sáu quan hệ người quyết định thật/người nhập/văn bản gốc.',''),
        @('Đồng bộ BRD 0.9.1','BRD 0.9.1/HLD 3.1','FSL v2 chưa phản ánh hiệu chỉnh ngày 17/07','Cập nhật tổng 28 luồng con; nguyên tắc nghiệm thu hai mức CAP-14…CAP-18; bổ sung câu hỏi mở A6, B8, B9, C5.',''),
        @('Bổ sung phân hệ AI','VHT_AIAgnet.xlsx/BRD 0.9.2','Danh mục AI-Agent nằm rời, chưa có trong FSL','Hiệu chỉnh 23 tính năng AI thành phân hệ Trợ lý AI (CAP-21, Could/Pha 3, chờ A7); bổ sung 4 tính năng nền tảng quản trị AI: checklist có ban hành, bật/tắt theo luồng, truy vết người/máy, giới hạn quyền dữ liệu.',''),
        @('Đồng bộ AI Agent','BRD 0.9.3/HLD 3.3-draft','FSL v3 chưa có mã REQ/NFR và thiếu ranh giới kiến trúc AI','Ánh xạ 23 tính năng nguồn vào REQ-064…REQ-068; mở rộng nền tảng AI thành 8 chức năng gồm checklist, cấu hình, retrieval/căn cứ, model serving on-premise, result/feedback store, audit, phân quyền và fallback; áp dụng NFR-008…012, AI-AC-01…07.','CAP-21 vẫn ngoài phạm vi cho đến khi A7 được duyệt.')
    )
    $rr=4; $idx=1
    foreach($ch in $changes){
        $ws.Cells.Item($rr,1).Value2=[string]$idx
        for($c=0;$c -lt $ch.Count;$c++){ $ws.Cells.Item($rr,$c+2).Value2=[string]$ch[$c] }
        $rr++; $idx++
    }
    $changeLast=$rr-1; $t=$ws.ListObjects.Add(1,$ws.Range("A3:F$changeLast"),$null,1); $t.Name='tblChanges'; $t.TableStyle='TableStyleMedium2'
    $ws.Columns('A').ColumnWidth=7; $ws.Columns('B').ColumnWidth=20; $ws.Columns('C').ColumnWidth=22; $ws.Columns('D:F').ColumnWidth=45; $ws.Range("B4:F$changeLast").WrapText=$true; $ws.Range("A3:F$changeLast").VerticalAlignment=-4160
    $ws.Activate(); $excel.ActiveWindow.SplitRow=3; $excel.ActiveWindow.FreezePanes=$true; $excel.ActiveWindow.DisplayGridlines=$false

    # Open questions from BRD
    $ws=$wb.Worksheets.Item('05_Cau_hoi_mo')
    $ws.Range('A1:F1').Merge(); $ws.Range('A1').Value2='CÂU HỎI MỞ, GIẢ ĐỊNH VÀ ĐIỂM CẦN XÁC NHẬN'; $ws.Range('A1:F1').Interior.Color=$navy; $ws.Range('A1:F1').Font.Color=$white; $ws.Range('A1:F1').Font.Bold=$true; $ws.Range('A1:F1').Font.Size=16; $ws.Range('A1:F1').HorizontalAlignment=-4108
    $oqHeaders=@('Nhóm','Mã','Nội dung cần xác nhận','Phương án/Đề xuất hiện tại','Ảnh hưởng','Trạng thái')
    for($c=0;$c -lt 6;$c++){ $ws.Cells.Item(3,$c+1).Value2=$oqHeaders[$c] }
    $openQuestions=@(
        @('A - Chặn phạm vi','A1','Mức độ VHT tự điều chỉnh quy trình','Mức 1: VHT IT dùng công cụ chuyên dụng; chưa mặc định xây Admin T2.','Rất cao','Chưa chốt'),
        @('A - Chặn phạm vi','A2','Ký duyệt là xác nhận điện tử hay ký số','Chưa đưa ký số pháp lý vào phạm vi chắc chắn.','Rất cao','Chưa chốt'),
        @('A - Chặn phạm vi','A3','Nguồn dữ liệu báo cáo RD03.06 Pha 1','Người dùng nhập tay hoặc kéo một phần tích hợp lên Pha 1.','Rất cao','Chưa chốt'),
        @('A - Chặn phạm vi','A4','Chi tiết RD08 và RD10 Pha 1','Yêu cầu khách cung cấp quy trình riêng hoặc thu hẹp cam kết.','Rất cao','Chưa chốt'),
        @('A - Chặn phạm vi','A5','RD10 là kho văn bản hay nơi ban hành quy trình chạy','Tạm tách kho tài liệu và quản trị workflow; chờ xác nhận.','Rất cao','Chưa chốt'),
        @('A - Chặn phạm vi','A6','Nguyên tắc nghiệm thu hai mức cho CAP-14…CAP-18','Mức B: nghiệm thu năng lực nền bằng cấu hình mẫu và dữ liệu mô phỏng tại Pha 1; đầy đủ khi tích hợp Pha 2 hoàn thành (BRD 0.9.1 mục 9).','Rất cao','Đề xuất'),
        @('A - Chặn phạm vi','A7','Phạm vi trợ lý AI hỗ trợ nghiệp vụ (CAP-21)','Đề xuất pha tùy chọn sau Pha 1; AI chỉ gợi ý, người quyết; mô hình on-premise. Chốt luồng thí điểm, checklist, bộ dữ liệu kiểm thử, người đánh giá và ngưỡng chất lượng trước phát triển. Chưa thuộc phạm vi/nghiệm thu cho đến khi khách chấp thuận (BRD 0.9.3 mục 5.6/9).','Rất cao','Đề xuất'),
        @('B - Thiết kế','B1','Phiên bản áp dụng cho hồ sơ đang chạy','Giữ phiên bản có hiệu lực lúc khởi tạo.','Cao','Đề xuất'),
        @('B - Thiết kế','B2','Ai xác nhận nội dung đề tài hoàn thành','Người dùng xác nhận; hệ thống chỉ gợi ý từ dữ liệu tích hợp.','Cao','Đề xuất'),
        @('B - Thiết kế','B3','Điều chỉnh vượt chủ trương','Quay lại RD01 hoặc tạo luồng riêng theo quyết định khách hàng.','Cao','Chưa chốt'),
        @('B - Thiết kế','B4','Quorum và quy tắc kết luận hội đồng','Cấu hình theo loại hội đồng/quy chế.','Cao','Chưa chốt'),
        @('B - Thiết kế','B5','Storage là hệ ngoài hay kho nội bộ','Tạm coi là hệ riêng cần connector.','Cao','Chưa chốt'),
        @('B - Thiết kế','B6','Ngưỡng và người nhận cảnh báo','Cấu hình theo loại cảnh báo, đơn vị và vai trò.','Trung bình','Chưa chốt'),
        @('B - Thiết kế','B7','Xác nhận sáu khó khăn As-Is','Dùng làm cơ sở giải pháp cho đến khi khách xác nhận.','Cao','Chưa chốt'),
        @('B - Thiết kế','B8','Phạm vi ủy quyền: cấp áp dụng, thời hạn, phạm vi hồ sơ','CAP-13 thiết kế theo quy chế ủy quyền của khách; chưa mặc định áp dụng cấp VHT.','Cao','Chưa chốt'),
        @('B - Thiết kế','B9','Nguồn dữ liệu kế hoạch năm cho điều kiện Khởi tạo nhiệm vụ','Pha 1 nhập tay danh mục đề tài trong kế hoạch năm; xem xét kết nối ở pha sau.','Cao','Chưa chốt'),
        @('C - NFR','C1','On-premise hay cloud','Đề xuất triển khai trên hạ tầng VHT.','Rất cao','Chưa chốt'),
        @('C - NFR','C2','Bảo mật và phân loại thông tin','Cần workshop riêng về phân loại, mã hóa, audit và quyền tài liệu.','Rất cao','Chưa chốt'),
        @('C - NFR','C3','Khối lượng nhiệm vụ, người dùng và tải','Thu thập số liệu trước khi chốt kiến trúc/hiệu năng.','Rất cao','Chưa chốt'),
        @('C - NFR','C4','Định hướng kiến trúc kỹ thuật','Đồng thuận VHT và các bên liên quan trước LLD.','Rất cao','Chưa chốt'),
        @('C - NFR','C5','Tuân thủ NĐ 13/2023 về dữ liệu cá nhân và thời hạn lưu trữ hồ sơ RD10','Bổ sung NFR-006/NFR-007 vào HLD; chờ khách cung cấp quy định nội bộ và thời hạn lưu trữ.','Cao','Chưa chốt'),
        @('D - Lỗi nguồn','D1','RD06.01/.02 ghi nhầm luồng nghiệm thu','Đề nghị xác nhận là luồng quyết toán.','Trung bình','Chưa chốt'),
        @('D - Lỗi nguồn','D2','RD05.02 trùng cấp Cơ sở','Đề nghị xác nhận RD05.02 là cấp Tập đoàn.','Trung bình','Chưa chốt'),
        @('D - Lỗi nguồn','D3','RD03.04 ghi quản trị kinh phí','Đề nghị xác nhận là quản trị tài sản.','Trung bình','Chưa chốt'),
        @('D - Lỗi nguồn','D4','RD03.05 và RD03.06 cùng số thứ tự 3.5','Đề nghị xác nhận số thứ tự.','Thấp','Chưa chốt'),
        @('D - Lỗi nguồn','D5','RD04 thiếu sự kiện bắt đầu/kết thúc/ràng buộc','Đề nghị bổ sung hoặc xác nhận đặc thù.','Cao','Chưa chốt'),
        @('D - Lỗi nguồn','D6','Mã hiệu QT.VHT.CLKHCN còn dấu chấm lửng','Đề nghị cung cấp mã đầy đủ.','Thấp','Chưa chốt')
    )
    $rr=4
    foreach($oq in $openQuestions){ for($c=0;$c -lt 6;$c++){ $ws.Cells.Item($rr,$c+1).Value2=[string]$oq[$c] }; $rr++ }
    $oqLast=$rr-1; $t=$ws.ListObjects.Add(1,$ws.Range("A3:F$oqLast"),$null,1); $t.Name='tblOpenQuestions'; $t.TableStyle='TableStyleMedium2'
    $ws.Columns('A').ColumnWidth=20; $ws.Columns('B').ColumnWidth=10; $ws.Columns('C:D').ColumnWidth=48; $ws.Columns('E:F').ColumnWidth=16; $ws.Range("A3:F$oqLast").WrapText=$true; $ws.Range("A3:F$oqLast").VerticalAlignment=-4160
    $fc=$ws.Range("F4:F$oqLast").FormatConditions.Add(2,$null,'=$F4="Chưa chốt"'); $fc.Interior.Color=0x99CCFF
    $ws.Activate(); $excel.ActiveWindow.SplitRow=3; $excel.ActiveWindow.FreezePanes=$true; $excel.ActiveWindow.DisplayGridlines=$false

    # Original source sheet
    $ws=$wb.Worksheets.Item('99_Danh_sach_goc')
    $ws.Range('A1:G1').Merge(); $ws.Range('A1').Value2='DANH SÁCH GỐC – VHT_WBS.xlsx (THAM CHIẾU, KHÔNG CHỈNH SỬA)'; $ws.Range('A1:G1').Interior.Color=$navy; $ws.Range('A1:G1').Font.Color=$white; $ws.Range('A1:G1').Font.Bold=$true; $ws.Range('A1:G1').Font.Size=14; $ws.Range('A1:G1').HorizontalAlignment=-4108
    if(Test-Path -LiteralPath $inputPath){
        $src=$excel.Workbooks.Open($inputPath,0,$true); $srcWs=$src.Worksheets.Item(1); $srcRange=$srcWs.UsedRange
        $srcRange.Copy(); $ws.Range('A3').PasteSpecial(-4163); $src.Close($false)
        $lastSource=2+$srcRange.Rows.Count
        $ws.Cells.Item(3,4).Value2='Nhóm chức năng (tiêu đề suy luận)'
        $t=$ws.ListObjects.Add(1,$ws.Range("A3:G$lastSource"),$null,1); $t.Name='tblOriginal'; $t.TableStyle='TableStyleMedium9'
    }
    $ws.Columns('A').ColumnWidth=8; $ws.Columns('B:C').ColumnWidth=28; $ws.Columns('D').ColumnWidth=30; $ws.Columns('E').ColumnWidth=50; $ws.Columns('F:G').ColumnWidth=24; $ws.Range("A3:G$lastSource").WrapText=$true
    $ws.Activate(); $excel.ActiveWindow.SplitRow=3; $excel.ActiveWindow.FreezePanes=$true; $excel.ActiveWindow.DisplayGridlines=$false

    # Common styling and properties
    foreach($sheet in $wb.Worksheets){ $sheet.Cells.Font.Name='Aptos'; $sheet.Tab.Color=$blue }
    $wb.Worksheets.Item('00_Tong_quan').Tab.Color=$navy
    $wb.Worksheets.Item('01_Functional_Scope').Tab.Color=$blue
    $wb.Worksheets.Item('04_Thay_doi').Tab.Color=0x99CCFF
    $wb.Worksheets.Item('05_Cau_hoi_mo').Tab.Color=0x99CCFF
    $wb.Worksheets.Item('99_Danh_sach_goc').Tab.Color=0xBFBFBF
    $wb.Worksheets.Item('00_Tong_quan').Activate()
    $excel.ActiveWindow.Zoom=90
    $wb.SaveAs($outputPath,51)
    $wb.Close($true)
    Write-Output "OUTPUT=$outputPath"
    Write-Output "FEATURES=$($features.Count)"
    Write-Output "DOMAINS=$($domainDescriptions.Count)"
}
finally {
    $excel.Quit()
    [Runtime.InteropServices.Marshal]::ReleaseComObject($excel) | Out-Null
    [GC]::Collect(); [GC]::WaitForPendingFinalizers()
}
