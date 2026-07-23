package vn.vht.qtkhcn.service;

import jakarta.persistence.EntityNotFoundException;
import java.util.List;
import java.util.UUID;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import vn.vht.qtkhcn.camunda.CamundaProcessInstanceQuery;
import vn.vht.qtkhcn.domain.ProcessDefinitionCatalog;
import vn.vht.qtkhcn.repository.ProcessDefinitionCatalogRepository;
import vn.vht.qtkhcn.web.dto.ProcessInstanceOverviewDtos.CurrentStepResponse;
import vn.vht.qtkhcn.web.dto.ProcessInstanceOverviewDtos.RunningInstanceCountsResponse;
import vn.vht.qtkhcn.web.dto.ProcessInstanceOverviewDtos.RunningInstanceListResponse;
import vn.vht.qtkhcn.web.dto.ProcessInstanceOverviewDtos.RunningInstanceResponse;

/**
 * Serves the runtime instance columns of the process catalog. Camunda outages are returned as
 * {@code available=false} rather than thrown: the catalog is a PostgreSQL read that must stay usable
 * even when the engine is unreachable.
 */
@Service
public class ProcessInstanceOverviewService {

    private static final Logger log = LoggerFactory.getLogger(ProcessInstanceOverviewService.class);

    private final CamundaProcessInstanceQuery instanceQuery;
    private final ProcessDefinitionCatalogRepository catalogRepository;

    public ProcessInstanceOverviewService(CamundaProcessInstanceQuery instanceQuery,
            ProcessDefinitionCatalogRepository catalogRepository) {
        this.instanceQuery = instanceQuery;
        this.catalogRepository = catalogRepository;
    }

    public RunningInstanceCountsResponse runningCounts() {
        try {
            return RunningInstanceCountsResponse.of(instanceQuery.runningCountsByProcessId());
        } catch (RuntimeException engineFailure) {
            log.warn("Không đọc được số instance đang chạy từ Camunda", engineFailure);
            return RunningInstanceCountsResponse.unavailable(engineMessage(engineFailure));
        }
    }

    @Transactional(readOnly = true)
    public RunningInstanceListResponse runningInstances(UUID catalogId) {
        ProcessDefinitionCatalog catalog = catalogRepository.findById(catalogId)
                .orElseThrow(() -> new EntityNotFoundException(
                        "Không tìm thấy process definition catalog " + catalogId));
        String bpmnProcessId = catalog.getBpmnProcessId();
        try {
            List<RunningInstanceResponse> instances = instanceQuery.runningInstances(bpmnProcessId).stream()
                    .map(ProcessInstanceOverviewService::toResponse).toList();
            return RunningInstanceListResponse.of(bpmnProcessId, instances);
        } catch (RuntimeException engineFailure) {
            log.warn("Không đọc được danh sách instance đang chạy của {} từ Camunda", bpmnProcessId, engineFailure);
            return RunningInstanceListResponse.unavailable(bpmnProcessId, engineMessage(engineFailure));
        }
    }

    private static RunningInstanceResponse toResponse(CamundaProcessInstanceQuery.RunningInstance instance) {
        return new RunningInstanceResponse(instance.processInstanceKey(), instance.businessId(),
                instance.version(), instance.startedAt(), instance.hasIncident(),
                instance.currentSteps().stream()
                        .map(step -> new CurrentStepResponse(step.elementId(), step.name(), step.type(),
                                step.startedAt(), step.hasIncident()))
                        .toList());
    }

    private static String engineMessage(RuntimeException failure) {
        Throwable root = failure;
        while (root.getCause() != null) root = root.getCause();
        String detail = root.getMessage() == null ? root.getClass().getSimpleName() : root.getMessage();
        return "Không đọc được trạng thái runtime từ Camunda: " + detail;
    }
}
