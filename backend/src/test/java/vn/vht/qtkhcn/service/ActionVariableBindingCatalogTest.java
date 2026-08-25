package vn.vht.qtkhcn.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.Map;
import org.junit.jupiter.api.Test;
import vn.vht.qtkhcn.domain.ActionVariableBinding;
import vn.vht.qtkhcn.repository.ActionVariableBindingRepository;

class ActionVariableBindingCatalogTest {

    private static ActionVariableBinding binding(String processCode, String taskKey, String actionCode,
            String formField, String variableName) {
        ActionVariableBinding item = new ActionVariableBinding();
        item.setId(String.join("-", processCode, taskKey, actionCode, formField));
        item.setProcessCode(processCode);
        item.setTaskDefinitionKey(taskKey);
        item.setActionCode(actionCode);
        item.setFormField(formField);
        item.setVariableName(variableName);
        item.setUpdatedBy("test");
        item.setUpdatedAt(OffsetDateTime.now());
        return item;
    }

    private static ActionVariableBindingCatalog catalogWith(ActionVariableBinding... items) {
        ActionVariableBindingRepository repository = mock(ActionVariableBindingRepository.class);
        when(repository.findAll()).thenReturn(List.of(items));
        return new ActionVariableBindingCatalog(repository);
    }

    /** Tái lập đúng hành vi của withDiemSoForT24() cũ, giờ lấy từ dữ liệu. */
    @Test
    void chuyenTruongDaKhaiThanhBienZeebe() {
        var catalog = catalogWith(binding("RD02_02", "T24", "APPROVE_STEP", "diemSo", "diemSo"));

        Map<String, Object> result = catalog.apply("RD02_02", "T24", "APPROVE_STEP",
                Map.of("ketQuaThamDinh", "dong_y"), Map.of("diemSo", 88, "nhanXet", "tot"));

        assertThat(result).containsEntry("diemSo", 88).containsEntry("ketQuaThamDinh", "dong_y");
        // nhanXet KHÔNG được khai nên không đi kèm — binding là danh sách trắng, không phải "gửi cả form".
        assertThat(result).doesNotContainKey("nhanXet");
    }

    @Test
    void khongKhaiThiKhongGuiKemGiCa() {
        var catalog = catalogWith(binding("RD02_02", "T24", "APPROVE_STEP", "diemSo", "diemSo"));
        Map<String, Object> variables = Map.of("ketQuaThamDinh", "dong_y");

        assertThat(catalog.apply("RD02_02", "T07", "APPROVE_STEP", variables, Map.of("diemSo", 88)))
                .isSameAs(variables);
        assertThat(catalog.apply("RD02_02", "T24", "REJECT_STEP", variables, Map.of("diemSo", 88)))
                .isSameAs(variables);
    }

    /**
     * Bẫy mà hàm cứng cũ để ngỏ: nó chỉ so taskDefinitionKey = "T24" mà không so quy trình, nên quy
     * trình khác đặt tên bước là T24 cũng vô tình gửi kèm điểm số.
     */
    @Test
    void khongLanSangQuyTrinhKhacCoBuocTrungTen() {
        var catalog = catalogWith(binding("RD02_02", "T24", "APPROVE_STEP", "diemSo", "diemSo"));
        Map<String, Object> variables = Map.of("ketQuaThamDinh", "dong_y");

        assertThat(catalog.apply("RD05_01", "T24", "APPROVE_STEP", variables, Map.of("diemSo", 88)))
                .isSameAs(variables);
    }

    @Test
    void chapNhanCaHaiCachVietMaQuyTrinh() {
        var catalog = catalogWith(binding("RD02_02", "T24", "APPROVE_STEP", "diemSo", "diemSo"));

        assertThat(catalog.apply("RD02.02", "T24", "APPROVE_STEP", Map.of(), Map.of("diemSo", 88)))
                .containsEntry("diemSo", 88);
    }

    /** D3: chỉ biến điều khiển vô hướng được qua Camunda, không phải dữ liệu nghiệp vụ. */
    @Test
    void chanGiaTriKhongPhaiVoHuong() {
        var catalog = catalogWith(
                binding("RD02_02", "T24", "APPROVE_STEP", "danhSach", "danhSach"),
                binding("RD02_02", "T24", "APPROVE_STEP", "vanBanDai", "vanBanDai"),
                binding("RD02_02", "T24", "APPROVE_STEP", "dat", "dat"));
        Map<String, Object> variables = Map.of("ketQuaThamDinh", "dong_y");

        Map<String, Object> result = catalog.apply("RD02_02", "T24", "APPROVE_STEP", variables,
                Map.of("danhSach", List.of(1, 2, 3), "vanBanDai", "x".repeat(201), "dat", true));

        assertThat(result).doesNotContainKey("danhSach").doesNotContainKey("vanBanDai");
        assertThat(result).containsEntry("dat", true);
    }

    @Test
    void doiTenTruongBieuMauLamQuyTacHetTacDung() {
        var catalog = catalogWith(binding("RD02_02", "T24", "APPROVE_STEP", "diemSo", "diemSo"));
        Map<String, Object> variables = Map.of("ketQuaThamDinh", "dong_y");

        // Biểu mẫu đổi "diemSo" thành "diemCham": không nổ, chỉ lặng lẽ không gửi biến — đúng lý do
        // vì sao màn Đối soát phải soi được quy tắc này (trạng thái BINDING_FIELD_MISSING).
        assertThat(catalog.apply("RD02_02", "T24", "APPROVE_STEP", variables, Map.of("diemCham", 88)))
                .isSameAs(variables);
    }

    @Test
    void khongCoCsdlThiCoiNhuChuaKhaiDongNao() {
        Map<String, Object> variables = Map.of("ketQuaThamDinh", "dong_y");
        assertThat(new ActionVariableBindingCatalog().apply("RD02_02", "T24", "APPROVE_STEP", variables,
                Map.of("diemSo", 88))).isSameAs(variables);
    }
}
