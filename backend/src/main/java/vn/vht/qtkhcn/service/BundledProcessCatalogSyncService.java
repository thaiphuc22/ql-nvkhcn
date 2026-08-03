package vn.vht.qtkhcn.service;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import vn.vht.qtkhcn.repository.ProcessDefinitionCatalogRepository;
import vn.vht.qtkhcn.repository.ProcessDefinitionVersionRepository;

/** Ensures a bundled BPMN is initially visible in /quy-trinh without auto-publishing later edits. */
@Service
public class BundledProcessCatalogSyncService {

    private final ProcessDefinitionImportValidator validator;
    private final ProcessDefinitionService processDefinitionService;
    private final ProcessDefinitionCatalogRepository catalogs;
    private final ProcessDefinitionVersionRepository versions;

    public BundledProcessCatalogSyncService(ProcessDefinitionImportValidator validator,
            ProcessDefinitionService processDefinitionService,
            ProcessDefinitionCatalogRepository catalogs,
            ProcessDefinitionVersionRepository versions) {
        this.validator = validator;
        this.processDefinitionService = processDefinitionService;
        this.catalogs = catalogs;
        this.versions = versions;
    }

    @Transactional
    public SyncResult sync(String expectedProcessId, String classpathResource) {
        ValidatedBpmn bpmn = validateClasspath(classpathResource);
        if (!expectedProcessId.equals(bpmn.bpmnProcessId())) {
            throw new ProcessImportException(ProcessImportException.Kind.VALIDATION,
                    "Bundled BPMN không khớp process id mong đợi.",
                    java.util.List.of("Mong đợi %s nhưng file khai báo %s."
                            .formatted(expectedProcessId, bpmn.bpmnProcessId())));
        }

        var catalog = catalogs.findByBpmnProcessId(expectedProcessId);
        if (catalog.isPresent()) {
            var latest = versions.findFirstByCatalogIdOrderByCamundaVersionDesc(catalog.get().getId());
            if (latest.isPresent()) {
                // Once a catalog exists, all changes must go through Draft -> Validate -> Deploy.
                return new SyncResult(false, expectedProcessId, latest.get().getCamundaVersion());
            }
        }

        var published = processDefinitionService.publishValidated(bpmn, "bundled-process-sync");
        return new SyncResult(true, published.bpmnProcessId(), published.version());
    }

    private ValidatedBpmn validateClasspath(String classpathResource) {
        ClassPathResource resource = new ClassPathResource(classpathResource);
        try (var input = resource.getInputStream()) {
            String xml = new String(input.readAllBytes(), StandardCharsets.UTF_8);
            return validator.validate(xml, resource.getFilename());
        } catch (IOException e) {
            throw new ProcessImportException(ProcessImportException.Kind.VALIDATION,
                    "Không đọc được bundled BPMN.", java.util.List.of(classpathResource), e);
        }
    }

    public record SyncResult(boolean published, String bpmnProcessId, int version) {}
}
