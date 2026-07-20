package vn.vht.qtkhcn.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.fasterxml.jackson.databind.ObjectMapper;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import vn.vht.qtkhcn.domain.ApprovalRule;
import vn.vht.qtkhcn.repository.ApprovalRuleAuditRepository;
import vn.vht.qtkhcn.repository.ApprovalRuleRepository;
import vn.vht.qtkhcn.repository.ApprovalRuleVersionRepository;
import vn.vht.qtkhcn.repository.ApprovalSlotRepository;
import vn.vht.qtkhcn.web.dto.ResolveApprovalRequest;
import vn.vht.qtkhcn.web.dto.UpdateApprovalRuleRequest;

class ApprovalMatrixServiceTest {
    private final ObjectMapper mapper = new ObjectMapper();
    private ApprovalRuleRepository rules;
    private ApprovalSlotRepository slots;
    private ApprovalMatrixService service;

    @BeforeEach
    void setUp() {
        rules = mock(ApprovalRuleRepository.class);
        slots = mock(ApprovalSlotRepository.class);
        service = new ApprovalMatrixService(rules, slots, mock(ApprovalRuleVersionRepository.class),
                mock(ApprovalRuleAuditRepository.class), new ApprovalConditionEngine(),
                new ApprovalDirectory(), new ApprovalMatrixAnalyzer(), mapper);
        when(slots.existsById("PHE_DUYET")).thenReturn(true);
    }

    @Test
    void resolveUsesFirstMatchAndReturnsAuditWithConcreteUser() throws Exception {
        ApprovalRule specific = rule("AM-05", 25,
                "[{\"kind\":\"condition\",\"field\":\"tongDuToan\",\"operator\":\"gte\",\"value\":5000000000}]",
                "BTGD_TD");
        ApprovalRule fallback = rule("AM-07", 40, "[]", "CQNV_TD");
        when(rules.findBySlotCodeOrderByPriorityAscIdAsc("PHE_DUYET")).thenReturn(List.of(specific, fallback));

        var result = service.resolve(new ResolveApprovalRequest("PHE_DUYET", LocalDate.of(2026, 7, 16),
                Map.of("tongDuToan", 6_000_000_000L)));

        assertThat(result.matchedRuleId()).isEqualTo("AM-05");
        assertThat(result.approvers()).extracting(item -> item.userId()).containsExactly("U-013");
        assertThat(result.audit().skipped()).singleElement().satisfies(item ->
                assertThat(item.reason()).contains("ưu tiên thấp hơn"));
    }

    @Test
    void resolveWithoutMatchIsFailClosed() throws Exception {
        when(rules.findBySlotCodeOrderByPriorityAscIdAsc("PHE_DUYET"))
                .thenReturn(List.of(rule("AM-05", 25,
                        "[{\"kind\":\"condition\",\"field\":\"capNhiemVu\",\"operator\":\"eq\",\"value\":\"TD\"}]",
                        "BTGD_TD")));

        var result = service.resolve(new ResolveApprovalRequest("PHE_DUYET", LocalDate.of(2026, 7, 16),
                Map.of("capNhiemVu", "CS")));

        assertThat(result.matchedRuleId()).isNull();
        assertThat(result.approvers()).isEmpty();
        assertThat(result.reason()).contains("fail-closed");
    }

    @Test
    void updateRejectsStaleVersionBeforeMutating() throws Exception {
        ApprovalRule current = rule("AM-05", 25, "[]", "BTGD_TD");
        current.setVersion(3);
        when(rules.findByIdForUpdate("AM-05")).thenReturn(Optional.of(current));

        assertThatThrownBy(() -> service.update("AM-05", 2,
                new UpdateApprovalRuleRequest("Changed", null, null, null, null, null, null), "alice"))
                .isInstanceOf(ApprovalMatrixConflictException.class)
                .hasMessageContaining("expected version 2");
        verify(rules).findByIdForUpdate("AM-05");
    }

    private ApprovalRule rule(String id, int priority, String items, String role) throws Exception {
        ApprovalRule rule = new ApprovalRule();
        rule.setId(id);
        rule.setName(id);
        rule.setSlotCode("PHE_DUYET");
        rule.setConditions(mapper.readTree("{\"kind\":\"group\",\"logic\":\"AND\",\"items\":" + items + "}"));
        rule.setAssignment(mapper.readTree("{\"mode\":\"ANY_ONE\",\"targets\":[{\"type\":\"GROUP\",\"roleCodes\":[\"" + role + "\"]}]}"));
        rule.setPriority(priority);
        rule.setEnabled(true);
        rule.setVersion(1);
        return rule;
    }
}
