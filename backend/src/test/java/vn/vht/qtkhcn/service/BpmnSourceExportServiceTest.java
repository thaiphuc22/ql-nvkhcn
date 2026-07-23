package vn.vht.qtkhcn.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNull;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.io.TempDir;

class BpmnSourceExportServiceTest {

    @Test
    void mapsMavenClassesRootToMatchingSourceResourcesPath(@TempDir Path tempDir) {
        Path classesRoot = tempDir.resolve("backend").resolve("target").resolve("classes");

        Path resolved = BpmnSourceExportService.toSourceResourcePath(classesRoot, "processes/rd0202.bpmn");

        assertEquals(tempDir.resolve("backend").resolve("src").resolve("main").resolve("resources")
                .resolve("processes").resolve("rd0202.bpmn"), resolved);
    }

    @Test
    void returnsNullWhenNotRunningFromAMavenClassesLayout(@TempDir Path tempDir) {
        Path packagedLayout = tempDir.resolve("app").resolve("BOOT-INF").resolve("classes");

        Path resolved = BpmnSourceExportService.toSourceResourcePath(packagedLayout, "processes/rd0202.bpmn");

        assertNull(resolved);
    }

    @Test
    void returnsNullWhenClassesIsNotDirectlyUnderTarget(@TempDir Path tempDir) {
        Path testClasses = tempDir.resolve("backend").resolve("target").resolve("test-classes");

        Path resolved = BpmnSourceExportService.toSourceResourcePath(testClasses, "processes/rd0202.bpmn");

        assertNull(resolved);
    }

    @Test
    void writesFileWhenMissingAndOverwritesWhenContentChanges(@TempDir Path tempDir) throws IOException {
        Path target = tempDir.resolve("processes").resolve("rd0202.bpmn");

        BpmnSourceExportService.writeIfChanged(target, "<xml>v1</xml>", "processes/rd0202.bpmn");
        assertEquals("<xml>v1</xml>", Files.readString(target));

        BpmnSourceExportService.writeIfChanged(target, "<xml>v2</xml>", "processes/rd0202.bpmn");
        assertEquals("<xml>v2</xml>", Files.readString(target));
    }

    @Test
    void doesNothingWhenContentIsAlreadyIdentical(@TempDir Path tempDir) throws IOException {
        Path target = tempDir.resolve("processes").resolve("rd0202.bpmn");
        Files.createDirectories(target.getParent());
        Files.writeString(target, "<xml>same</xml>");
        var before = Files.getLastModifiedTime(target);

        BpmnSourceExportService.writeIfChanged(target, "<xml>same</xml>", "processes/rd0202.bpmn");

        assertEquals(before, Files.getLastModifiedTime(target));
        assertEquals("<xml>same</xml>", Files.readString(target));
    }
}
