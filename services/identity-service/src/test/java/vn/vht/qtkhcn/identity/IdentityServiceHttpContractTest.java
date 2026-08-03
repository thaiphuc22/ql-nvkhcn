package vn.vht.qtkhcn.identity;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.context.SpringBootTest.WebEnvironment;
import org.springframework.boot.test.web.server.LocalServerPort;
import org.springframework.boot.testcontainers.service.connection.ServiceConnection;
import org.springframework.http.HttpStatus;
import org.springframework.test.web.servlet.client.RestTestClient;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;
import org.testcontainers.postgresql.PostgreSQLContainer;

@Testcontainers
@SpringBootTest(
        webEnvironment = WebEnvironment.RANDOM_PORT,
        properties = {"qtkhcn.internal.service-token=test-token", "qtkhcn.dev-api-key=test-dev-key"})
class IdentityServiceHttpContractTest {

    @Container
    @ServiceConnection
    static PostgreSQLContainer db = new PostgreSQLContainer("postgres:16-alpine");

    @LocalServerPort
    private int port;

    private RestTestClient client;

    @BeforeEach
    void setUp() {
        client = RestTestClient.bindToServer().baseUrl("http://localhost:" + port).build();
    }

    @Test
    void apiEndpointsRejectMissingDevKey() {
        client.get().uri("/api/organizations").exchange().expectStatus().isEqualTo(HttpStatus.UNAUTHORIZED);
    }

    @Test
    void apiEndpointsAcceptCorrectDevKey() {
        client.get()
                .uri("/api/organizations")
                .header("X-QTKHCN-Dev-Key", "test-dev-key")
                .exchange()
                .expectStatus()
                .isOk();
    }

    @Test
    void publicEffectivePermissionsRequiresDevKeyAndReturnsRoles() {
        client.get()
                .uri("/api/effective-permissions/pm@example.com")
                .exchange()
                .expectStatus()
                .isEqualTo(HttpStatus.UNAUTHORIZED);

        client.get()
                .uri("/api/effective-permissions/pm@example.com")
                .header("X-QTKHCN-Dev-Key", "test-dev-key")
                .exchange()
                .expectStatus()
                .isOk()
                .expectBody()
                .jsonPath("$.roleCodes")
                .value(java.util.List.class, roleCodes -> org.assertj.core.api.Assertions.assertThat(roleCodes)
                        .contains("PM"));
    }

    @Test
    void internalEndpointIgnoresDevKeyFilterButStillRequiresBearerToken() {
        client.get()
                .uri("/internal/users/pm@example.com/effective-permissions")
                .exchange()
                .expectStatus()
                .isEqualTo(HttpStatus.UNAUTHORIZED);

        client.get()
                .uri("/internal/users/pm@example.com/effective-permissions")
                .header("Authorization", "Bearer test-token")
                .exchange()
                .expectStatus()
                .isOk();
    }

    @Test
    void catalogsAndEffectiveProjectionExposeNewAuthorizationDimensions() {
        client.get().uri("/api/features").header("X-QTKHCN-Dev-Key", "test-dev-key").exchange()
                .expectStatus().isOk().expectBody()
                .jsonPath("$[?(@.code == 'DOSSIER')]").exists()
                .jsonPath("$[?(@.code == 'DOSSIER' && @.appCode == 'qlnvkhcn')]").exists();
        client.get().uri("/api/data-scopes").header("X-QTKHCN-Dev-Key", "test-dev-key").exchange()
                .expectStatus().isOk().expectBody().jsonPath("$[?(@.code == 'OWN_MISSION')]").exists();
        client.get().uri("/api/effective-permissions/pm@example.com").header("X-QTKHCN-Dev-Key", "test-dev-key").exchange()
                .expectStatus().isOk().expectBody().jsonPath("$.assignments[0].dataScope").exists()
                .jsonPath("$.apps[0]").isEqualTo("qlnvkhcn")
                // Không khoá theo index: từ V3, PM có thêm DOSSIER/MISSION và toMatrix() sắp theo
                // TreeMap. Không dùng WORKLIST nữa: quyền duy nhất của PM trên đó (PROCESS_STEP)
                // bị V6 deactivate nên cả feature entry biến mất khỏi projection — DOSSIER vẫn có
                // CREATE/EDIT (còn active) nên vẫn chứng minh được grant thật sự tồn tại.
                .jsonPath("$.featurePermissions[?(@.featureCode == 'DOSSIER')]").exists();
    }

    @Test
    void roleMatrixEndpointSavesOneFeatureWithoutTouchingTheOthers() {
        String before = client.get().uri("/api/roles").header("X-QTKHCN-Dev-Key", "test-dev-key").exchange()
                .expectStatus().isOk().expectBody(String.class).returnResult().getResponseBody();
        org.assertj.core.api.Assertions.assertThat(before).isNotNull();

        // CREATE/EDIT thay vì VIEW/EXPORT cũ: từ V6 chỉ 2 mã này còn active, nên là mã duy nhất
        // còn hiện trong matrix sau khi lưu.
        client.put().uri("/api/role-matrix/REPORT")
                .header("X-QTKHCN-Dev-Key", "test-dev-key")
                .contentType(org.springframework.http.MediaType.APPLICATION_JSON)
                .body("{\"roles\":[{\"roleCode\":\"PM\",\"permissionCodes\":[\"CREATE\",\"EDIT\"],\"enabled\":true}]}")
                .exchange()
                .expectStatus().isOk()
                .expectBody()
                .jsonPath("$[0].code").isEqualTo("PM")
                .jsonPath("$[0].matrix[?(@.featureCode == 'REPORT')].permissionCodes").exists()
                // Chức năng cũ của PM (seed V3) phải còn nguyên sau khi lưu riêng REPORT. Không
                // dùng WORKLIST: quyền duy nhất của PM ở đó (PROCESS_STEP) bị V6 deactivate nên
                // cả feature entry biến mất khỏi matrix — dùng MISSION (còn CREATE/EDIT active).
                .jsonPath("$[0].matrix[?(@.featureCode == 'DOSSIER')]").exists()
                .jsonPath("$[0].matrix[?(@.featureCode == 'MISSION')]").exists();

        client.put().uri("/api/role-matrix/KHONG_TON_TAI")
                .header("X-QTKHCN-Dev-Key", "test-dev-key")
                .contentType(org.springframework.http.MediaType.APPLICATION_JSON)
                .body("{\"roles\":[{\"roleCode\":\"PM\",\"permissionCodes\":[\"VIEW\"],\"enabled\":true}]}")
                .exchange()
                .expectStatus().isNotFound();
    }

    @Test
    void bulkAssignmentEndpointCreatesManyRolesThenBecomesNoOp() throws Exception {
        String created = client.post().uri("/api/users")
                .header("X-QTKHCN-Dev-Key", "test-dev-key")
                .contentType(org.springframework.http.MediaType.APPLICATION_JSON)
                .body("{\"email\":\"bulk.http@example.com\",\"fullName\":\"Bulk HTTP\",\"employeeCode\":null,"
                        + "\"jobTitle\":null,\"organizationId\":null,\"status\":\"ACTIVE\",\"administrator\":false}")
                .exchange().expectStatus().isCreated()
                .expectBody(String.class).returnResult().getResponseBody();
        String id = new com.fasterxml.jackson.databind.ObjectMapper().readTree(created).get("id").asText();

        String payload = "{\"roleCodes\":[\"PM\",\"PA\",\"NNC\"],\"dataScope\":\"OWN_MISSION\","
                + "\"organizationId\":null,\"effectiveFrom\":null,\"effectiveTo\":null}";
        client.post().uri("/api/users/" + id + "/role-assignments/bulk")
                .header("X-QTKHCN-Dev-Key", "test-dev-key")
                .contentType(org.springframework.http.MediaType.APPLICATION_JSON)
                .body(payload)
                .exchange().expectStatus().isCreated()
                .expectBody().jsonPath("$.length()").isEqualTo(3);

        // Gửi lại y hệt: không sinh dòng trùng.
        client.post().uri("/api/users/" + id + "/role-assignments/bulk")
                .header("X-QTKHCN-Dev-Key", "test-dev-key")
                .contentType(org.springframework.http.MediaType.APPLICATION_JSON)
                .body(payload)
                .exchange().expectStatus().isCreated()
                .expectBody().jsonPath("$.length()").isEqualTo(0);

        client.get().uri("/api/users/" + id + "/role-assignments").header("X-QTKHCN-Dev-Key", "test-dev-key")
                .exchange().expectStatus().isOk().expectBody().jsonPath("$.length()").isEqualTo(3);

        // Route "mọi user" không bị bắt làm /users/{id} (nếu bị, Spring trả 400 vì không parse được UUID).
        client.get().uri("/api/users/role-assignments").header("X-QTKHCN-Dev-Key", "test-dev-key")
                .exchange().expectStatus().isOk()
                .expectBody().jsonPath("$[?(@.userId == '" + id + "')]").exists();

        client.delete().uri("/api/users/" + id).header("X-QTKHCN-Dev-Key", "test-dev-key")
                .exchange().expectStatus().isNoContent();
    }
}
