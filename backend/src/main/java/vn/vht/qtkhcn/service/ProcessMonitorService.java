package vn.vht.qtkhcn.service;

import java.time.OffsetDateTime;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import vn.vht.qtkhcn.camunda.CamundaProcessInstanceQuery;
import vn.vht.qtkhcn.domain.ProcessDefinitionCatalog;
import vn.vht.qtkhcn.repository.ProcessDefinitionCatalogRepository;
import vn.vht.qtkhcn.web.dto.ProcessMonitorResponse;

@Service
public class ProcessMonitorService {
    private static final Logger log = LoggerFactory.getLogger(ProcessMonitorService.class);
    private final CamundaProcessInstanceQuery query;
    private final ProcessDefinitionCatalogRepository catalogs;

    public ProcessMonitorService(CamundaProcessInstanceQuery query, ProcessDefinitionCatalogRepository catalogs) {
        this.query = query;
        this.catalogs = catalogs;
    }

    @Transactional(readOnly = true)
    public ProcessMonitorResponse snapshot() {
        Map<String, ProcessDefinitionCatalog> catalogByProcess = catalogs.findAll().stream()
                .collect(Collectors.toMap(ProcessDefinitionCatalog::getBpmnProcessId, Function.identity(), (a, b) -> a));
        try {
            var rows = query.monitoredInstances().stream().map(row -> {
                var catalog = catalogByProcess.get(row.bpmnProcessId());
                return new ProcessMonitorResponse.Instance(row.processInstanceKey(), row.businessId(),
                        row.bpmnProcessId(), catalog == null ? row.bpmnProcessId() : catalog.getName(), row.version(),
                        row.state(), row.startedAt(), row.endedAt(), row.hasIncident(), row.currentSteps().stream()
                                .map(step -> new ProcessMonitorResponse.Step(step.elementId(), step.name(), step.type(),
                                        step.startedAt(), step.hasIncident())).toList());
            }).toList();
            int active = (int) rows.stream().filter(row -> "ACTIVE".equals(row.state())).count();
            int incidents = (int) rows.stream().filter(ProcessMonitorResponse.Instance::hasIncident).count();
            int completed = (int) rows.stream().filter(row -> "COMPLETED".equals(row.state())).count();
            int terminated = (int) rows.stream().filter(row -> "TERMINATED".equals(row.state())).count();
            return new ProcessMonitorResponse(true, null, OffsetDateTime.now(),
                    new ProcessMonitorResponse.Stats(active, incidents, completed, terminated), rows);
        } catch (RuntimeException failure) {
            log.warn("Không đọc được dữ liệu giám sát tiến trình từ Camunda", failure);
            Throwable root = failure;
            while (root.getCause() != null) root = root.getCause();
            String detail = root.getMessage() == null ? root.getClass().getSimpleName() : root.getMessage();
            return ProcessMonitorResponse.unavailable("Không đọc được trạng thái runtime từ Camunda: " + detail);
        }
    }
}
