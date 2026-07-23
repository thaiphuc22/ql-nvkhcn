package vn.vht.qtkhcn.camunda;

import io.camunda.client.CamundaClient;
import java.util.Comparator;
import java.util.List;
import java.util.Optional;
import org.springframework.stereotype.Service;
import vn.vht.qtkhcn.service.ProcessImportException;

/** Read-only engine lookup used to keep bundled startup deployment idempotent. */
@Service
public class CamundaProcessDefinitionLookup {

    private final CamundaClient camundaClient;

    public CamundaProcessDefinitionLookup(CamundaClient camundaClient) {
        this.camundaClient = camundaClient;
    }

    public Optional<ProcessDefinitionInfo> findLatest(String bpmnProcessId) {
        try {
            List<io.camunda.client.api.search.response.ProcessDefinition> definitions = camundaClient
                    .newProcessDefinitionSearchRequest()
                    .filter(filter -> filter.processDefinitionId(bpmnProcessId))
                    .send().join().items();
            return definitions.stream()
                    .max(Comparator.comparingInt(
                            io.camunda.client.api.search.response.ProcessDefinition::getVersion))
                    .map(definition -> new ProcessDefinitionInfo(definition.getProcessDefinitionId(),
                            definition.getVersion(), definition.getProcessDefinitionKey()));
        } catch (Exception e) {
            throw lookupFailure(bpmnProcessId, e);
        }
    }

    private static ProcessImportException lookupFailure(String bpmnProcessId, Exception e) {
        Throwable root = e;
        while (root.getCause() != null) {
            root = root.getCause();
        }
        String detail = root.getMessage() == null ? root.getClass().getSimpleName() : root.getMessage();
        return new ProcessImportException(ProcessImportException.Kind.DEPLOYMENT,
                "Không thể kiểm tra process definition hiện có trên Camunda.",
                List.of("Process id: " + bpmnProcessId, detail), e);
    }

    public record ProcessDefinitionInfo(String bpmnProcessId, int version, long processDefinitionKey) {
    }
}
