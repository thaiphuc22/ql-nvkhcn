package vn.vht.qtkhcn.camunda;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

import com.fasterxml.jackson.databind.ObjectMapper;
import io.camunda.client.api.response.ActivatedJob;
import java.util.Map;
import java.util.Optional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import vn.vht.qtkhcn.domain.ServiceTaskTypeCode;
import vn.vht.qtkhcn.service.ResolvedServiceTaskConfig;
import vn.vht.qtkhcn.service.ServiceTaskConfigResolver;

class SystemCheckJobWorkerTest {

    private static final ObjectMapper MAPPER = new ObjectMapper();

    private ServiceTaskConfigResolver resolver;
    private Rd0202ConditionValidator rd0202Validator;
    private SystemCheckJobWorker worker;

    @BeforeEach
    void setUp() {
        resolver = mock(ServiceTaskConfigResolver.class);
        rd0202Validator = mock(Rd0202ConditionValidator.class);
        worker = new SystemCheckJobWorker(resolver, rd0202Validator);
    }

    @Test
    void usesResultVariableAndStubResultFromConfig() throws Exception {
        givenConfig("{\"resultVariable\":\"dieuKienMacDinhDat\",\"stubResult\":false}");

        Map<String, Object> variables = worker.checkChuTruongTapDoan(job());

        // Đây là điểm mấu chốt của seam: đổi cấu hình -> đổi hành vi, không build lại Java.
        assertEquals(false, variables.get("dieuKienMacDinhDat"));
    }

    @Test
    void writesToTheVariableNameTheConfigAsksFor() throws Exception {
        givenConfig("{\"resultVariable\":\"bienKhac\",\"stubResult\":true}");

        Map<String, Object> variables = worker.checkChuTruongTapDoan(job());

        assertEquals(true, variables.get("bienKhac"));
        assertFalse(variables.containsKey(ProcessVariableContract.DIEU_KIEN_MAC_DINH_DAT));
    }

    @Test
    void keepsLegacyBehaviourWhenNoConfigResolved() {
        when(resolver.resolve(any(), any(), any())).thenReturn(Optional.empty());

        Map<String, Object> variables = worker.checkChuTruongTapDoan(job());

        // Thiếu cấu hình quản trị KHÔNG được làm hỏng process đang chạy — giữ nguyên hành vi cũ.
        assertEquals(true, variables.get(ProcessVariableContract.DIEU_KIEN_MAC_DINH_DAT));
    }

    @Test
    void stillSeedsDmnInputsForRulePhanCap() {
        when(resolver.resolve(any(), any(), any())).thenReturn(Optional.empty());

        Map<String, Object> variables = worker.checkChuTruongTapDoan(job());

        assertEquals(12_000_000_000L, variables.get("tongDuToan"));
        assertEquals("de_tai", variables.get("loaiNhiemVu"));
    }

    @Test
    void doesNotOverwriteDmnInputsAlreadyPresentOnTheInstance() {
        when(resolver.resolve(any(), any(), any())).thenReturn(Optional.empty());
        ActivatedJob job = job();
        when(job.getVariablesAsMap()).thenReturn(Map.of("tongDuToan", 500L, "loaiNhiemVu", "du_an"));

        Map<String, Object> variables = worker.checkChuTruongTapDoan(job);

        assertEquals(500L, variables.get("tongDuToan"));
        assertEquals("du_an", variables.get("loaiNhiemVu"));
    }

    @Test
    void configWithoutStubResultFallsBackToTrue() throws Exception {
        givenConfig("{\"resultVariable\":\"dieuKienMacDinhDat\",\"decisionCode\":\"rd0202-check-chu-truong-td\"}");

        Map<String, Object> variables = worker.checkChuTruongTapDoan(job());

        assertTrue((Boolean) variables.get("dieuKienMacDinhDat"));
    }

    @Test
    void rd0202DefaultCheckCompletesWithTheGatewayVariable() {
        ActivatedJob job = mock(ActivatedJob.class);
        when(job.getType()).thenReturn("khcn.rd0202.check-default-condition");
        when(job.getProcessInstanceKey()).thenReturn(2251799813685299L);

        when(rd0202Validator.validate(2251799813685299L)).thenReturn(true);
        Map<String, Object> variables = worker.checkRd0202DefaultCondition(job);

        assertEquals(Map.of(ProcessVariableContract.DIEU_KIEN_MAC_DINH_DAT, true), variables);
    }

    @Test
    void rd0202BusinessFailureReturnsFalseSoGatewayRoutesBackToT02() {
        ActivatedJob job = mock(ActivatedJob.class);
        when(job.getType()).thenReturn("khcn.rd0202.check-default-condition");
        when(job.getProcessInstanceKey()).thenReturn(2251799813685300L);
        when(rd0202Validator.validate(2251799813685300L)).thenReturn(false);

        assertEquals(Map.of(ProcessVariableContract.DIEU_KIEN_MAC_DINH_DAT, false),
                worker.checkRd0202DefaultCondition(job));
    }

    private void givenConfig(String configJson) throws Exception {
        when(resolver.resolve(any(), any(), any())).thenReturn(Optional.of(new ResolvedServiceTaskConfig(
                "CHECK_CHU_TRUONG_TD", ServiceTaskTypeCode.EVALUATE_DECISION, 1, MAPPER.readTree(configJson))));
    }

    private ActivatedJob job() {
        ActivatedJob job = mock(ActivatedJob.class);
        when(job.getType()).thenReturn("khcn.rd0202.check-chu-truong-td");
        when(job.getBpmnProcessId()).thenReturn("RD02_02");
        when(job.getElementId()).thenReturn("Check_ChuTruongTD");
        when(job.getProcessInstanceKey()).thenReturn(2251799813685284L);
        when(job.getVariablesAsMap()).thenReturn(Map.of());
        return job;
    }
}
