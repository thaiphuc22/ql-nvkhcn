package vn.vht.qtkhcn.camunda;

import java.util.List;
import org.springframework.stereotype.Service;
import vn.vht.qtkhcn.service.ProcessImportException;

/** Deploys a bundled process only on a genuinely empty engine. */
@Service
public class StartupProcessDeploymentService {

    private final CamundaProcessDefinitionLookup lookup;
    private final CamundaDeploymentService deploymentService;

    public StartupProcessDeploymentService(CamundaProcessDefinitionLookup lookup,
            CamundaDeploymentService deploymentService) {
        this.lookup = lookup;
        this.deploymentService = deploymentService;
    }

    public StartupDeploymentResult deployIfAbsent(String expectedProcessId, String... classpathResources) {
        var existing = lookup.findLatest(expectedProcessId);
        if (existing.isPresent()) {
            var definition = existing.get();
            return new StartupDeploymentResult(false, definition.bpmnProcessId(), definition.version(),
                    definition.processDefinitionKey());
        }

        var deployed = deploymentService.deployClasspath(classpathResources);
        if (!expectedProcessId.equals(deployed.bpmnProcessId())) {
            throw new ProcessImportException(ProcessImportException.Kind.DEPLOYMENT,
                    "Bundled BPMN deploy không khớp process id mong đợi.",
                    List.of("Mong đợi %s nhưng Camunda trả %s."
                            .formatted(expectedProcessId, deployed.bpmnProcessId())));
        }
        return new StartupDeploymentResult(true, deployed.bpmnProcessId(), deployed.version(),
                deployed.processDefinitionKey());
    }

    public record StartupDeploymentResult(
            boolean deployed,
            String bpmnProcessId,
            int version,
            long processDefinitionKey
    ) {
    }
}
