package vn.vht.qtkhcn.web.dto;

import java.time.OffsetDateTime;
import java.util.UUID;
import vn.vht.qtkhcn.domain.DmnRuleVersion;
import vn.vht.qtkhcn.domain.DmnDeployStatus;

public record DmnRuleVersionResponse(
        UUID id,
        UUID ruleId,
        int version,
        String dmnXml,
        String checksumSha256,
        String changeNote,
        String createdBy,
        OffsetDateTime createdAt,
        DmnDeployStatus deployStatus,
        Long camundaDeploymentKey,
        Long camundaDecisionKey,
        String camundaDecisionId,
        Integer camundaDecisionVersion,
        OffsetDateTime deployedAt,
        String deployError
) {
    public static DmnRuleVersionResponse from(DmnRuleVersion version) {
        return new DmnRuleVersionResponse(version.getId(), version.getRuleId(), version.getVersion(),
                version.getDmnXml(), version.getChecksumSha256(), version.getChangeNote(),
                version.getCreatedBy(), version.getCreatedAt(), version.getDeployStatus(),
                version.getCamundaDeploymentKey(), version.getCamundaDecisionKey(),
                version.getCamundaDecisionId(), version.getCamundaDecisionVersion(),
                version.getDeployedAt(), version.getDeployError());
    }
}
