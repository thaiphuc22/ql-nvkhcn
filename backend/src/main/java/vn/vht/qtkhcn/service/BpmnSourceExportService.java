package vn.vht.qtkhcn.service;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Service;

/**
 * Mirrors a just-deployed draft's BPMN XML back onto its git-tracked classpath resource file, so
 * the file used to bootstrap a fresh Camunda engine ({@code ProcessDeploymentRunner}) never drifts
 * from what a Draft -> Validate -> Deploy actually pushed to Zeebe. A real drift like this once
 * left {@code rd0202.bpmn} on stale skeleton task ids while Zeebe ran a version with T04/T13/T27/T29
 * split into *_PGDK/*_GDTT, silently breaking {@code WorkflowTaskActionRouting}.
 *
 * <p>Best-effort only: resolves the source file via the classpath's {@code target/classes} layout,
 * which only exists when running unpacked from a Maven build tree (local dev). Skips silently
 * (never throws) when that layout can't be found, e.g. running from a packaged jar.
 */
@Service
public class BpmnSourceExportService {
    private static final Logger log = LoggerFactory.getLogger(BpmnSourceExportService.class);

    public void exportAfterDeploy(String resourceName, String bpmnXml) {
        try {
            Path classesRoot = new ClassPathResource("").getFile().toPath();
            Path sourcePath = toSourceResourcePath(classesRoot, resourceName);
            if (sourcePath == null) {
                log.info("Bỏ qua export BPMN nguồn cho {}: không chạy từ cây mã nguồn dev (classesRoot={}).",
                        resourceName, classesRoot);
                return;
            }
            writeIfChanged(sourcePath, bpmnXml, resourceName);
        } catch (IOException e) {
            log.warn("Không thể export BPMN nguồn cho {}: {}", resourceName, e.getMessage());
        }
    }

    /** {@code target/classes/**} -> {@code src/main/resources/<resourceName>}; null if layout doesn't match. */
    static Path toSourceResourcePath(Path classesRoot, String resourceName) {
        if (!"classes".equals(String.valueOf(classesRoot.getFileName()))) {
            return null;
        }
        Path target = classesRoot.getParent();
        if (target == null || !"target".equals(String.valueOf(target.getFileName()))) {
            return null;
        }
        Path moduleRoot = target.getParent();
        if (moduleRoot == null) {
            return null;
        }
        return moduleRoot.resolve("src").resolve("main").resolve("resources").resolve(resourceName);
    }

    static void writeIfChanged(Path sourcePath, String bpmnXml, String resourceName) throws IOException {
        if (Files.exists(sourcePath) && bpmnXml.equals(Files.readString(sourcePath, StandardCharsets.UTF_8))) {
            return;
        }
        Files.createDirectories(sourcePath.getParent());
        Files.writeString(sourcePath, bpmnXml, StandardCharsets.UTF_8);
        log.warn("BPMN nguồn {} đã được ghi lại theo bản vừa deploy tại {}. "
                + "ĐỪNG QUÊN commit file này, nếu không lần deploy kế tiếp có thể lệch với Zeebe.",
                resourceName, sourcePath);
    }
}
