package vn.vht.qtkhcn.web.dto;

import java.time.OffsetDateTime;
import java.util.UUID;
import vn.vht.qtkhcn.domain.ProcessDefinitionSource;
import vn.vht.qtkhcn.domain.ProcessDefinitionStatus;

/**
 * @param source nguồn của BẢN MỚI NHẤT, không phải của cả quy trình: một quy trình deploy qua app
 *               rồi sau đó deploy thẳng lên Camunda sẽ chuyển sang EXTERNAL từ lần đó.
 */
public record ProcessDefinitionSummaryResponse(
        UUID id,
        String bpmnProcessId,
        String name,
        int latestVersion,
        String resourceName,
        ProcessDefinitionStatus status,
        ProcessDefinitionSource source,
        OffsetDateTime updatedAt
) {
}
