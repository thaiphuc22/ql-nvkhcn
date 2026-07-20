package vn.vht.qtkhcn.web.dto;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.Map;

/**
 * Read models for the runtime columns on the "Đã deploy" tab. {@code available=false} means Camunda
 * could not be reached — the catalog row still renders, it just shows "—" instead of a wrong 0.
 */
public final class ProcessInstanceOverviewDtos {

    private ProcessInstanceOverviewDtos() {
    }

    public record RunningInstanceCountsResponse(
            boolean available,
            String message,
            Map<String, Integer> countsByProcessId
    ) {
        public static RunningInstanceCountsResponse of(Map<String, Integer> counts) {
            return new RunningInstanceCountsResponse(true, null, Map.copyOf(counts));
        }

        public static RunningInstanceCountsResponse unavailable(String message) {
            return new RunningInstanceCountsResponse(false, message, Map.of());
        }
    }

    public record CurrentStepResponse(
            String elementId,
            String name,
            String type,
            OffsetDateTime startedAt,
            boolean hasIncident
    ) {
    }

    public record RunningInstanceResponse(
            String processInstanceKey,
            String businessId,
            int version,
            OffsetDateTime startedAt,
            boolean hasIncident,
            List<CurrentStepResponse> currentSteps
    ) {
    }

    public record RunningInstanceListResponse(
            boolean available,
            String message,
            String bpmnProcessId,
            List<RunningInstanceResponse> instances
    ) {
        public static RunningInstanceListResponse of(String bpmnProcessId, List<RunningInstanceResponse> instances) {
            return new RunningInstanceListResponse(true, null, bpmnProcessId, List.copyOf(instances));
        }

        public static RunningInstanceListResponse unavailable(String bpmnProcessId, String message) {
            return new RunningInstanceListResponse(false, message, bpmnProcessId, List.of());
        }
    }
}
