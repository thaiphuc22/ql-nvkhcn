package vn.vht.qtkhcn.service;

import static org.assertj.core.api.Assertions.assertThatCode;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.util.List;
import org.junit.jupiter.api.Test;
import vn.vht.qtkhcn.web.dto.ActionStudioDtos.ScaffoldResponse;

class DeployedProcessPolicyScaffolderTest {

    private final ActionStudioService actionStudio = mock(ActionStudioService.class);
    private final DeployedProcessPolicyScaffolder scaffolder = new DeployedProcessPolicyScaffolder(actionStudio);

    @Test
    void scaffoldsForTheProcessThatWasJustDeployed() {
        when(actionStudio.scaffold("quy_trinh_moi", "alice"))
                .thenReturn(new ScaffoldResponse(3, List.of(), List.of()));

        scaffolder.onProcessDeployed(new ProcessDeployedEvent("quy_trinh_moi", "alice"));

        verify(actionStudio).scaffold("quy_trinh_moi", "alice");
    }

    /**
     * Quy trình có outcome BPMN chưa ánh xạ được, biểu mẫu chưa tồn tại… đều là "cần cấu hình thêm",
     * KHÔNG phải "deploy hỏng". BPMN lúc này đã nằm trên Zeebe rồi — ném ra ở đây chỉ tổ để lại một
     * lỗi khó hiểu sau khi thao tác deploy đã báo thành công.
     */
    @Test
    void aFailingScaffoldNeverPropagatesOutOfTheListener() {
        when(actionStudio.scaffold("quy_trinh_la", null))
                .thenThrow(new IllegalArgumentException("Quy trình chưa được deploy: quy_trinh_la"));

        assertThatCode(() -> scaffolder.onProcessDeployed(new ProcessDeployedEvent("quy_trinh_la", null)))
                .doesNotThrowAnyException();
    }
}
