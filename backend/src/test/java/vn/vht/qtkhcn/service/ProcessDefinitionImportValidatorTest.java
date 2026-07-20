package vn.vht.qtkhcn.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;

import java.nio.charset.StandardCharsets;
import org.junit.jupiter.api.Test;
import org.springframework.mock.web.MockMultipartFile;

class ProcessDefinitionImportValidatorTest {

    @Test
    void bundledRd0202IsDeployableAndKeepsItsProcessIdentity() throws Exception {
        String xml = java.nio.file.Files.readString(
                java.nio.file.Path.of("src/main/resources/processes/rd0202.bpmn"));

        ValidatedBpmn result = new ProcessDefinitionImportValidator(5_242_880)
                .validate(xml, "rd0202.bpmn");

        assertEquals("RD02_02", result.bpmnProcessId());
        assertTrue(!result.hasErrors(), () -> "RD02.02 lint errors: " + result.issues());
    }

    private final ProcessDefinitionImportValidator validator = new ProcessDefinitionImportValidator(1024);

    @Test
    void acceptsSingleExecutableProcessAndUsesIdWhenNameMissing() {
        ValidatedBpmn result = validator.validate(file("ok.bpmn", validProcess("demo", "")));

        assertEquals("demo", result.bpmnProcessId());
        assertEquals("demo", result.processName());
        assertTrue(hasIssue(result, "PROCESS_NAME_MISSING", BpmnIssueSeverity.SUGGESTION));
        assertTrue(hasIssue(result, "START_EVENT_MISSING", BpmnIssueSeverity.ERROR));
        assertEquals(64, result.checksumSha256().length());
    }

    @Test
    void rejectsWrongExtensionAndOversizedFile() {
        var wrongType = new MockMultipartFile("file", "process.txt", "text/plain",
                validProcess("demo", "Demo").getBytes(StandardCharsets.UTF_8));
        ProcessImportException typeError = assertThrows(ProcessImportException.class,
                () -> validator.validate(wrongType));
        assertTrue(typeError.getErrors().size() >= 1);

        byte[] tooLarge = new byte[1025];
        var large = new MockMultipartFile("file", "large.bpmn", "application/xml", tooLarge);
        ProcessImportException sizeError = assertThrows(ProcessImportException.class,
                () -> validator.validate(large));
        assertTrue(sizeError.getErrors().getFirst().contains("1024"));
    }

    @Test
    void rejectsMalformedXmlAndMissingExecutableProcessOrId() {
        assertThrows(ProcessImportException.class,
                () -> validator.validate(file("broken.bpmn", "<definitions>")));
        ProcessImportException missing = assertThrows(ProcessImportException.class,
                () -> validator.validate(file("no-executable.bpmn", validNonExecutableProcess())));
        ProcessImportException noId = assertThrows(ProcessImportException.class,
                () -> validator.validate(file("no-id.bpmn", validProcess("", "No id"))));
        assertEquals("PROCESS_MISSING", missing.getValidationCode());
        assertEquals("PROCESS_ID_MISSING", noId.getValidationCode());
    }

    @Test
    void warnsWhenGatewayWithMultipleOutgoingFlowsHasNoDefaultFlow() {
        ValidatedBpmn result = validator.validate(file("no-default.bpmn", gatewayProcess(false)));

        assertTrue(hasIssue(result, "GATEWAY_DEFAULT_FLOW_MISSING", BpmnIssueSeverity.WARNING));
        assertTrue(result.issues().stream().filter(i -> i.code().equals("GATEWAY_DEFAULT_FLOW_MISSING"))
                .findFirst().orElseThrow().message().contains("Kiểm tra kết quả"));
    }

    @Test
    void noWarningWhenGatewayHasDefaultFlow() {
        ValidatedBpmn result = validator.validate(file("with-default.bpmn", gatewayProcess(true)));

        assertTrue(!hasIssue(result, "GATEWAY_DEFAULT_FLOW_MISSING", BpmnIssueSeverity.WARNING));
    }

    @Test
    void missingNameWarningStillWorksAlongsideDefaultFlowCheck() {
        ValidatedBpmn result = validator.validate(file("ok.bpmn", validProcess("demo", "")));

        assertTrue(hasIssue(result, "PROCESS_NAME_MISSING", BpmnIssueSeverity.SUGGESTION));
    }

    @Test
    void reportsStableCodesForGatewayUserTaskAndGraphRules() {
        ValidatedBpmn result = validator.validate(file("lint.bpmn", """
                <definitions xmlns="http://www.omg.org/spec/BPMN/20100524/MODEL">
                  <process id="lint" name="Lint" isExecutable="true">
                    <startEvent id="start"/><sequenceFlow id="f1" sourceRef="start" targetRef="user"/>
                    <userTask id="user" name="Duyệt"/><sequenceFlow id="f2" sourceRef="user" targetRef="gate"/>
                    <exclusiveGateway id="gate" name="Đạt?"/>
                    <sequenceFlow id="orphan" sourceRef="missing" targetRef="user"/>
                  </process>
                </definitions>
                """));

        assertTrue(hasIssue(result, "USER_TASK_ASSIGNMENT_MISSING", BpmnIssueSeverity.WARNING));
        assertTrue(hasIssue(result, "USER_TASK_FORM_MISSING", BpmnIssueSeverity.WARNING));
        assertTrue(hasIssue(result, "GATEWAY_NO_OUTGOING", BpmnIssueSeverity.ERROR));
        assertTrue(hasIssue(result, "SEQUENCE_FLOW_BROKEN", BpmnIssueSeverity.ERROR));
        assertEquals("gate", result.issues().stream().filter(i -> i.code().equals("GATEWAY_NO_OUTGOING"))
                .findFirst().orElseThrow().elementId());
    }

    @Test
    void acceptsConfiguredUserAndServiceTasksWithoutConfigurationIssues() {
        ValidatedBpmn result = validator.validate(file("configured.bpmn", """
                <definitions xmlns="http://www.omg.org/spec/BPMN/20100524/MODEL"
                    xmlns:zeebe="http://camunda.org/schema/zeebe/1.0">
                  <process id="configured" name="Configured" isExecutable="true">
                    <startEvent id="start"/><sequenceFlow id="f1" sourceRef="start" targetRef="user"/>
                    <userTask id="user" name="Duyệt"><extensionElements>
                      <zeebe:assignmentDefinition candidateGroups="reviewers"/>
                      <zeebe:formDefinition formId="approval-form"/>
                    </extensionElements></userTask>
                    <sequenceFlow id="f2" sourceRef="user" targetRef="service"/>
                    <serviceTask id="service" name="Đồng bộ"><extensionElements>
                      <zeebe:taskDefinition type="sync" retries="3"/>
                    </extensionElements></serviceTask>
                    <sequenceFlow id="f3" sourceRef="service" targetRef="end"/><endEvent id="end"/>
                  </process>
                </definitions>
                """));

        assertTrue(result.issues().stream().noneMatch(i -> i.code().startsWith("USER_TASK_")
                || i.code().startsWith("SERVICE_TASK_")));
        assertTrue(!result.hasErrors());
    }

    private static boolean hasIssue(ValidatedBpmn result, String code, BpmnIssueSeverity severity) {
        return result.issues().stream().anyMatch(issue -> issue.code().equals(code) && issue.severity() == severity);
    }

    private static String gatewayProcess(boolean withDefault) {
        String defaultAttr = withDefault ? " default=\"flow-reject\"" : "";
        return """
                <?xml version="1.0" encoding="UTF-8"?>
                <definitions xmlns="http://www.omg.org/spec/BPMN/20100524/MODEL"
                    xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
                  <process id="demo" name="Demo" isExecutable="true">
                    <startEvent id="start"/>
                    <sequenceFlow id="f1" sourceRef="start" targetRef="Gateway_133yb7i"/>
                    <exclusiveGateway id="Gateway_133yb7i" name="Kiểm tra kết quả"%s/>
                    <sequenceFlow id="flow-approve" sourceRef="Gateway_133yb7i" targetRef="approve">
                      <conditionExpression xsi:type="tFormalExpression">=decision = "approve"</conditionExpression>
                    </sequenceFlow>
                    <sequenceFlow id="flow-reject" sourceRef="Gateway_133yb7i" targetRef="reject">
                      <conditionExpression xsi:type="tFormalExpression">=decision = "reject"</conditionExpression>
                    </sequenceFlow>
                    <endEvent id="approve"/>
                    <endEvent id="reject"/>
                  </process>
                </definitions>
                """.formatted(defaultAttr);
    }

    @Test
    void blocksDoctypeAndExternalEntity() {
        String xxe = """
                <?xml version="1.0"?>
                <!DOCTYPE definitions [<!ENTITY xxe SYSTEM "file:///etc/passwd">]>
                <definitions xmlns="http://www.omg.org/spec/BPMN/20100524/MODEL">
                  <process id="evil" name="&xxe;" isExecutable="true"/>
                </definitions>
                """;

        ProcessImportException error = assertThrows(ProcessImportException.class,
                () -> validator.validate(file("xxe.bpmn", xxe)));
        assertEquals(ProcessImportException.Kind.VALIDATION, error.getKind());
        assertTrue(error.getMessage().contains("phân tích"));
    }

    private static MockMultipartFile file(String name, String xml) {
        return new MockMultipartFile("file", name, "application/xml", xml.getBytes(StandardCharsets.UTF_8));
    }

    private static String validProcess(String id, String name) {
        return """
                <?xml version="1.0" encoding="UTF-8"?>
                <definitions xmlns="http://www.omg.org/spec/BPMN/20100524/MODEL">
                  <process id="%s" name="%s" isExecutable="true"/>
                </definitions>
                """.formatted(id, name);
    }

    private static String validNonExecutableProcess() {
        return """
                <definitions xmlns="http://www.omg.org/spec/BPMN/20100524/MODEL">
                  <process id="draft" isExecutable="false"/>
                </definitions>
                """;
    }
}
