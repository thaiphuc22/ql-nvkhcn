package vn.vht.qtkhcn.hoso.web.dto;

import java.time.OffsetDateTime;
import java.util.List;

public record MyTaskResponse(
        String processInstanceKey,
        String taskKey,
        String taskDefinitionKey,
        String maHoSo,
        String tenBuoc,
        String assignee,
        List<String> candidateUsers,
        List<String> candidateGroups,
        OffsetDateTime createdAt,
        OffsetDateTime dueAt,
        String formKey) {
}
