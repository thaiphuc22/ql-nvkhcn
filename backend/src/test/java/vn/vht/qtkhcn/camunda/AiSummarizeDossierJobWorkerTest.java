package vn.vht.qtkhcn.camunda;

import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import io.camunda.client.api.response.ActivatedJob;
import java.util.List;
import java.util.Optional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import vn.vht.qtkhcn.ai.AiSummaryGenerator;
import vn.vht.qtkhcn.camunda.AiSummaryHoSoGateway.AiSummaryContext;
import vn.vht.qtkhcn.domain.WorkflowProcessMapping;
import vn.vht.qtkhcn.repository.WorkflowProcessMappingRepository;

class AiSummarizeDossierJobWorkerTest {

    private WorkflowProcessMappingRepository mappings;
    private AiSummaryHoSoGateway gateway;
    private AiSummaryGenerator generator;
    private AiSummarizeDossierJobWorker worker;

    @BeforeEach
    void setUp() {
        mappings = mock(WorkflowProcessMappingRepository.class);
        gateway = mock(AiSummaryHoSoGateway.class);
        generator = mock(AiSummaryGenerator.class);
        worker = new AiSummarizeDossierJobWorker(mappings, gateway, generator);

        WorkflowProcessMapping mapping = new WorkflowProcessMapping();
        mapping.setHoSoId("HS-2026-033");
        when(mappings.findByProcessInstanceId("2251799813685284")).thenReturn(Optional.of(mapping));
        when(gateway.fetchContext("HS-2026-033")).thenReturn(new AiSummaryContext(
                "HS-2026-033", "Nghiên cứu nền tảng mô phỏng số", "TS. Nguyễn Văn A", "VHT-RD",
                "2026-2027", "2.500.000.000 VND", "Co_So",
                List.of(new AiSummaryContext.BuocHoanTat("1. Khởi tạo", "pm01", "Đạt")),
                List.of(new AiSummaryContext.TepDinhKem("thuyet-minh.pdf", "PDF", "Nội dung thuyết minh...", false))));
    }

    @Test
    void includesAttachmentExcerptInPromptSentToGenerator() {
        org.mockito.ArgumentCaptor<String> promptCaptor = org.mockito.ArgumentCaptor.forClass(String.class);
        when(generator.summarize(promptCaptor.capture())).thenReturn(Optional.of("Tóm tắt."));

        worker.summarize(job());

        String prompt = promptCaptor.getValue();
        org.junit.jupiter.api.Assertions.assertTrue(prompt.contains("thuyet-minh.pdf"));
        org.junit.jupiter.api.Assertions.assertTrue(prompt.contains("Nội dung thuyết minh..."));
    }

    @Test
    void savesRealLlmSummaryWhenGeneratorSucceeds() {
        when(generator.summarize(org.mockito.ArgumentMatchers.anyString()))
                .thenReturn(Optional.of("Hồ sơ mô tả nền tảng mô phỏng số, đã qua bước khởi tạo."));

        worker.summarize(job());

        verify(gateway).saveSummary(eq("HS-2026-033"),
                eq("Hồ sơ mô tả nền tảng mô phỏng số, đã qua bước khởi tạo."));
    }

    @Test
    void fallsBackWithoutBlockingWhenGeneratorHasNoResult() {
        when(generator.summarize(org.mockito.ArgumentMatchers.anyString())).thenReturn(Optional.empty());

        worker.summarize(job());

        verify(gateway).saveSummary(eq("HS-2026-033"),
                eq("Chưa sinh được tóm tắt tự động (dịch vụ AI tạm thời không khả dụng)."));
    }

    @Test
    void throwsWhenProcessInstanceHasNoCorrelatedDossier() {
        when(mappings.findByProcessInstanceId("999")).thenReturn(Optional.empty());
        ActivatedJob job = mock(ActivatedJob.class);
        when(job.getProcessInstanceKey()).thenReturn(999L);

        assertThrows(IllegalStateException.class, () -> worker.summarize(job));
    }

    private ActivatedJob job() {
        ActivatedJob job = mock(ActivatedJob.class);
        when(job.getProcessInstanceKey()).thenReturn(2251799813685284L);
        return job;
    }
}
