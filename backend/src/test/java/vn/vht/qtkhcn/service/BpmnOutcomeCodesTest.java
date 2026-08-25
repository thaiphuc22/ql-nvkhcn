package vn.vht.qtkhcn.service;

import static org.assertj.core.api.Assertions.assertThat;

import java.util.List;
import org.junit.jupiter.api.Test;

/**
 * Chốt tập mã nút theo <b>D10, đã sửa bởi D10.1</b>. Test này cố ý cứng nhắc: nó vỡ ngay khi có người
 * thêm mã nút mới, để việc đó buộc phải đi kèm sửa quyết định trong
 * {@code .harness/state/decisions.md} chứ không lọt vào bằng một dòng {@code Set.of} nào đó.
 */
class BpmnOutcomeCodesTest {

    @Test
    void tapMaNutDungNamMaTheoD10VaD101() {
        assertThat(BpmnOutcomeCodes.OUTCOME_ACTIONS).containsExactlyInAnyOrder(
                "SUBMIT", "APPROVE_STEP", "RETURN_STEP", "REJECT_STEP", "APPROVE_WITH_SUPPLEMENT");
    }

    /**
     * SUBMIT không hoàn tất user task nào (nó khởi tạo tiến trình qua DossierActionService), nên tập
     * thực thi ở task đúng bằng D10 trừ SUBMIT — không phải một danh sách riêng chép tay.
     */
    @Test
    void tapThucThiOTaskBangD10TruSubmit() {
        assertThat(BpmnOutcomeCodes.TASK_RUNTIME_ACTIONS)
                .isSubsetOf(BpmnOutcomeCodes.OUTCOME_ACTIONS)
                .doesNotContain("SUBMIT")
                .hasSize(BpmnOutcomeCodes.OUTCOME_ACTIONS.size() - 1);
    }

    /**
     * D10.1 đưa APPROVE_WITH_SUPPLEMENT vào tập, gỡ mâu thuẫn kéo dài giữa dữ liệu seed (V20 có nút,
     * V37 có từ khoá `dong_y_bo_sung`, sẵn luật AP-BPMN-RD01_01-Task_6-SUPPLEMENT) và mã nguồn.
     */
    @Test
    void approveWithSupplementNamTrongTapSauD101() {
        assertThat(BpmnOutcomeCodes.isOutcomeAction("APPROVE_WITH_SUPPLEMENT")).isTrue();
        assertThat(BpmnOutcomeCodes.TASK_RUNTIME_ACTIONS).contains("APPROVE_WITH_SUPPLEMENT");
    }

    /**
     * Bảng cứng {@code actionCode()} là lưới an toàn khi tra hụt CSDL, còn seed V37 là dữ liệu thật.
     * Hai bên lệch nhau thì xoá một từ khoá trong Danh mục nút sẽ bị bảng cứng âm thầm hồi sinh. Test
     * này khoá quan hệ đó: mọi từ khoá bảng cứng nhận PHẢI có mặt trong seed V37.
     */
    @Test
    void moiTuKhoaTrongBangCungDeuCoTrongSeedV37() throws java.io.IOException {
        String seed = java.nio.file.Files.readString(
                java.nio.file.Path.of("src/main/resources/db/migration/V37__action_outcome_keyword.sql"));
        List<String> hardcoded = List.of("submit", "gui", "gui_duyet", "tiep_tuc", "approve", "dong_y",
                "dat", "phe_duyet", "dong_y_bo_sung", "return", "hieu_chinh", "yeu_cau_hieu_chinh",
                "tra_lai", "reject", "khong_dong_y", "khong_dat", "tu_choi");
        for (String keyword : hardcoded) {
            assertThat(BpmnOutcomeCodes.actionCode(keyword))
                    .as("bảng cứng phải nhận từ khoá %s", keyword).isNotNull();
            assertThat(seed).as("seed V37 phải có từ khoá %s", keyword).contains("('" + keyword + "'");
        }
    }
}
