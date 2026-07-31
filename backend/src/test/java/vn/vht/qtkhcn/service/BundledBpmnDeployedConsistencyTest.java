package vn.vht.qtkhcn.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.HexFormat;
import java.util.stream.Stream;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.Arguments;
import org.junit.jupiter.params.provider.MethodSource;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.data.jpa.test.autoconfigure.DataJpaTest;
import org.springframework.boot.jdbc.test.autoconfigure.AutoConfigureTestDatabase;
import org.springframework.boot.jpa.test.autoconfigure.TestEntityManager;
import org.springframework.boot.testcontainers.service.connection.ServiceConnection;
import org.springframework.core.io.ClassPathResource;
import org.testcontainers.containers.PostgreSQLContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;
import vn.vht.qtkhcn.camunda.CamundaDeploymentService;
import vn.vht.qtkhcn.domain.ProcessDefinitionVersion;
import vn.vht.qtkhcn.repository.ProcessDefinitionCatalogRepository;
import vn.vht.qtkhcn.repository.ProcessDefinitionVersionRepository;

/**
 * CI check "BPMN đã deploy vs file repo" (item #3 trong follow-up RD02.02 v3,
 * .harness/state/active-task.md). {@code Rd0202JobWorkerContractTest} chỉ đối chiếu job type; test này
 * chạy toàn bộ pipeline validate -> deploy -> persist thật (Postgres 16 qua Testcontainers, đúng image
 * dùng ở infra/docker-compose.override.yml, không phải H2) rồi đọc lại {@code process_definition_version}
 * để xác nhận nội dung/checksum lưu lại KHỚP TUYỆT ĐỐI với file bundled trong repo — bắt được lỗi
 * encoding/mojibake (đã từng gặp thật ở charset cp1252, xem DELIVERY_STATE.md) hoặc lệch bpmnProcessId
 * so với hằng số deploy ở {@code ProcessDeploymentRunner}.
 *
 * <p><b>Giới hạn có chủ đích:</b> test này không phát hiện được trường hợp một engine ĐANG CHẠY đã có
 * catalog cũ và bị bỏ qua đồng bộ (xem {@code BundledProcessCatalogSyncService} — "Once a catalog exists,
 * all changes must go through Draft -> Validate -> Deploy"), vì CI luôn chạy từ database rỗng nên không
 * có lịch sử để so sánh. Đây là giới hạn cố hữu của một CI job stateless, không phải thiếu sót của test.</p>
 */
@DataJpaTest
@AutoConfigureTestDatabase(replace = AutoConfigureTestDatabase.Replace.NONE)
@Testcontainers
class BundledBpmnDeployedConsistencyTest {

    @Container
    @ServiceConnection
    static final PostgreSQLContainer<?> POSTGRES = new PostgreSQLContainer<>("postgres:16-alpine");

    @Autowired
    private ProcessDefinitionCatalogRepository catalogRepository;

    @Autowired
    private ProcessDefinitionVersionRepository versionRepository;

    @Autowired
    private TestEntityManager entityManager;

    private static final long MAX_FILE_SIZE_BYTES = 5_242_880L;

    static Stream<Arguments> bundledProcesses() {
        // Phải khớp hằng số BUNDLED_PROCESS_ID/RD0202_PROCESS_ID trong
        // vn.vht.qtkhcn.camunda.ProcessDeploymentRunner (package-private, không import chéo được từ đây).
        return Stream.of(
                Arguments.of("RD01_01", "processes/rd0101.bpmn", 900_101L),
                Arguments.of("RD02_02", "processes/rd0202.bpmn", 900_202L));
    }

    @ParameterizedTest(name = "{0} ({1}) đã persist khớp tuyệt đối file repo")
    @MethodSource("bundledProcesses")
    void deployedContentMatchesBundledFileExactly(String expectedProcessId, String classpathResource,
            long fakeProcessDefinitionKey) throws Exception {
        ClassPathResource resource = new ClassPathResource(classpathResource);
        byte[] fileBytes = resource.getInputStream().readAllBytes();
        String fileXml = new String(fileBytes, StandardCharsets.UTF_8);
        String resourceName = resource.getFilename();

        var validator = new ProcessDefinitionImportValidator(MAX_FILE_SIZE_BYTES);
        ValidatedBpmn validated = validator.validate(fileXml, resourceName);
        assertThat(validated.bpmnProcessId())
                .as("Process id khai báo trong %s phải khớp hằng số deploy ở ProcessDeploymentRunner", classpathResource)
                .isEqualTo(expectedProcessId);
        assertThat(validated.hasErrors())
                .as("%s không được có lỗi lint chặn deploy", classpathResource)
                .isFalse();

        CamundaDeploymentService deploymentService = mock(CamundaDeploymentService.class);
        when(deploymentService.deploy(any(byte[].class), eq(resourceName)))
                .thenReturn(new CamundaDeploymentService.DeploymentResult(
                        fakeProcessDefinitionKey, expectedProcessId, 1, fakeProcessDefinitionKey, resourceName));

        var service = new ProcessDefinitionService(validator, deploymentService, catalogRepository, versionRepository,
                mock(DeployedBpmnRoutingReader.class),
                mock(org.springframework.context.ApplicationEventPublisher.class));
        service.publishValidated(validated, "ci-bpmn-drift-check");

        // Buộc round-trip qua Postgres thật (không đọc lại từ persistence-context cache trong JVM) —
        // đây chính là phần "so sánh với bản đã deploy", không phải so sánh chuỗi Java với chính nó.
        entityManager.flush();
        entityManager.clear();

        ProcessDefinitionVersion persisted = versionRepository.findByCamundaProcessDefinitionKey(fakeProcessDefinitionKey)
                .orElseThrow(() -> new AssertionError("Không tìm thấy version vừa publish cho " + expectedProcessId));

        assertThat(persisted.getBpmnXml())
                .as("Nội dung BPMN đọc lại từ Postgres phải giống hệt byte-for-byte file trong repo")
                .isEqualTo(fileXml);
        assertThat(persisted.getChecksumSha256())
                .as("Checksum lưu lại phải khớp SHA-256 tính độc lập trên nội dung file repo hiện tại")
                .isEqualTo(sha256Hex(fileBytes));
        assertThat(persisted.getResourceName()).isEqualTo(resourceName);
    }

    @AfterEach
    void cleanUp() {
        versionRepository.deleteAll();
        catalogRepository.deleteAll();
    }

    private static String sha256Hex(byte[] bytes) {
        try {
            return HexFormat.of().formatHex(MessageDigest.getInstance("SHA-256").digest(bytes));
        } catch (NoSuchAlgorithmException e) {
            throw new IllegalStateException("JVM không hỗ trợ SHA-256.", e);
        }
    }
}
