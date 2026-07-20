package vn.vht.qtkhcn.web.dto;

import java.time.OffsetDateTime;
import java.util.List;

public record ProcessMonitorResponse(
        boolean available,
        String message,
        OffsetDateTime observedAt,
        Stats stats,
        List<Instance> instances
) {
    public record Stats(int active, int incidents, int completed, int terminated) {}

    public record Step(String elementId, String name, String type, OffsetDateTime startedAt,
            boolean hasIncident) {}

    public record Instance(String processInstanceKey, String businessId, String bpmnProcessId,
            String processName, int version, String state, OffsetDateTime startedAt, OffsetDateTime endedAt,
            boolean hasIncident, List<Step> currentSteps) {}

    public static ProcessMonitorResponse unavailable(String message) {
        return new ProcessMonitorResponse(false, message, OffsetDateTime.now(),
                new Stats(0, 0, 0, 0), List.of());
    }
}
