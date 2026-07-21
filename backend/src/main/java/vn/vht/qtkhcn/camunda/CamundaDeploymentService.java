package vn.vht.qtkhcn.camunda;

import io.camunda.client.CamundaClient;
import io.camunda.client.api.response.DeploymentEvent;
import java.util.List;
import org.springframework.stereotype.Service;
import vn.vht.qtkhcn.service.ProcessImportException;

/** Single deployment path shared by startup resources and the import API. */
@Service
public class CamundaDeploymentService {

    private final CamundaClient camundaClient;

    public CamundaDeploymentService(CamundaClient camundaClient) {
        this.camundaClient = camundaClient;
    }

    /** Deploys một hoặc nhiều classpath resource (ví dụ BPMN + DMN) trong cùng một deployment của Zeebe. */
    public DeploymentResult deployClasspath(String... classpathResources) {
        try {
            var command = camundaClient.newDeployResourceCommand()
                    .addResourceFromClasspath(classpathResources[0]);
            for (int i = 1; i < classpathResources.length; i++) {
                command = command.addResourceFromClasspath(classpathResources[i]);
            }
            return toResult(command.send().join());
        } catch (Exception e) {
            throw deploymentFailure(e);
        }
    }

    public DeploymentResult deploy(byte[] bytes, String resourceName) {
        try {
            return toResult(camundaClient.newDeployResourceCommand()
                    .addResourceBytes(bytes, resourceName).send().join());
        } catch (Exception e) {
            throw deploymentFailure(e);
        }
    }

    private static DeploymentResult toResult(DeploymentEvent event) {
        if (event.getProcesses().size() != 1) {
            throw new ProcessImportException(ProcessImportException.Kind.DEPLOYMENT,
                    "Camunda không trả về đúng một process definition.",
                    List.of("Số process definition trong kết quả deploy: " + event.getProcesses().size()));
        }
        var process = event.getProcesses().getFirst();
        return new DeploymentResult(event.getKey(), process.getBpmnProcessId(), process.getVersion(),
                process.getProcessDefinitionKey(), process.getResourceName());
    }

    private static ProcessImportException deploymentFailure(Exception e) {
        Throwable root = e;
        while (root.getCause() != null) {
            root = root.getCause();
        }
        String detail = root.getMessage() == null ? root.getClass().getSimpleName() : root.getMessage();
        return new ProcessImportException(ProcessImportException.Kind.DEPLOYMENT,
                "Camunda từ chối hoặc không thể deploy BPMN.", List.of(detail), e);
    }

    public record DeploymentResult(
            long deploymentKey,
            String bpmnProcessId,
            int version,
            long processDefinitionKey,
            String resourceName
    ) {
    }
}
