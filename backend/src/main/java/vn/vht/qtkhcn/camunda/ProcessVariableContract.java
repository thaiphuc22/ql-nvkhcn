package vn.vht.qtkhcn.camunda;

/**
 * Contract biến process — NGUỒN CHUẨN webapp/src/data/variableContract.ts, port sang hằng số Java.
 * Đồng bộ với docs/arch/camunda-design.md §5.2: process CHỈ giữ mã hồ sơ (correlation) + biến
 * điều khiển rẽ nhánh dưới đây — KHÔNG bao giờ thêm dữ liệu nghiệp vụ vào process variables (D3).
 * Sửa contract → sửa ở variableContract.ts trước, rồi đồng bộ file này (không tự bịa tên biến mới).
 */
public final class ProcessVariableContract {

    private ProcessVariableContract() {
    }

    public static final String MA_HO_SO = "maHoSo";
    public static final String CAP = "cap";
    public static final String KET_QUA_THAM_DINH = "ketQuaThamDinh";
    public static final String KET_QUA_KY_DUYET = "ketQuaKyDuyet";
    public static final String KET_QUA_HDKHCN = "ketQuaHDKHCN";
    public static final String KET_QUA_PHE_DUYET = "ketQuaPheDuyet";
    public static final String LOAI_DIEU_CHINH = "loaiDieuChinh";
    public static final String DIEU_KIEN_MAC_DINH_DAT = "dieuKienMacDinhDat";
    public static final String QUORUM_DAT = "quorumDat";
    public static final String CAN_HOI_DONG = "canHoiDong";
    public static final String LOAI_HOI_DONG = "loaiHoiDong";

    // Giá trị slug hợp lệ cho `cap` (ASCII, an toàn so sánh FEEL) — khớp variableContract.ts.
    public static final String CAP_CO_SO = "CS";
    public static final String CAP_TAP_DOAN = "TD";
}
