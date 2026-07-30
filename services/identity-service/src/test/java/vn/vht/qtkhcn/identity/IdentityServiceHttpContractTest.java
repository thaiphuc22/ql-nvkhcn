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
                .expectStatus().isOk().expectBody().jsonPath("$[?(@.code == 'DOSSIER')]").exists();
        client.get().uri("/api/data-scopes").header("X-QTKHCN-Dev-Key", "test-dev-key").exchange()
                .expectStatus().isOk().expectBody().jsonPath("$[?(@.code == 'OWN_MISSION')]").exists();
        client.get().uri("/api/effective-permissions/pm@example.com").header("X-QTKHCN-Dev-Key", "test-dev-key").exchange()
                .expectStatus().isOk().expectBody().jsonPath("$.assignments[0].dataScope").exists()
                .jsonPath("$.apps[0]").isEqualTo("qlnvkhcn")
                .jsonPath("$.featurePermissions[0].featureCode").isEqualTo("GENERAL");
    }
}
