package vn.vht.qtkhcn.security;

import static org.junit.jupiter.api.Assertions.assertEquals;

import jakarta.servlet.ServletException;
import java.io.IOException;
import java.util.concurrent.atomic.AtomicBoolean;
import org.junit.jupiter.api.Test;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpServletResponse;

class LegacyHoSoWriteGuardFilterTest {

    @Test
    void blocksBusinessCreateWhenNewServiceOwnsWrites() throws ServletException, IOException {
        var request = new MockHttpServletRequest("POST", "/api/ho-so");
        var response = new MockHttpServletResponse();
        new LegacyHoSoWriteGuardFilter(false).doFilter(request, response, (req, res) -> { });
        assertEquals(409, response.getStatus());
    }

    @Test
    void neverBlocksWorkflowCommands() throws ServletException, IOException {
        var request = new MockHttpServletRequest("POST", "/api/ho-so/HS-001/submit");
        var response = new MockHttpServletResponse();
        AtomicBoolean continued = new AtomicBoolean();
        new LegacyHoSoWriteGuardFilter(false).doFilter(request, response, (req, res) -> continued.set(true));
        assertEquals(true, continued.get());
    }

    @Test
    void blocksLegacyDossierActionWhenWorkflowServiceOwnsTaskActions() throws ServletException, IOException {
        var request = new MockHttpServletRequest("POST", "/api/ho-so/HS-001/actions");
        var response = new MockHttpServletResponse();
        new LegacyHoSoWriteGuardFilter(false).doFilter(request, response, (req, res) -> { });
        assertEquals(409, response.getStatus());
    }

    @Test
    void neverBlocksTaskCentricWorkflowAction() throws ServletException, IOException {
        var request = new MockHttpServletRequest("POST", "/api/tasks/225179981/actions");
        var response = new MockHttpServletResponse();
        AtomicBoolean continued = new AtomicBoolean();
        new LegacyHoSoWriteGuardFilter(false).doFilter(request, response, (req, res) -> continued.set(true));
        assertEquals(true, continued.get());
    }

    @Test
    void featureFlagRestoresLegacyWritesForRollback() throws ServletException, IOException {
        var request = new MockHttpServletRequest("POST", "/api/nhiem-vu");
        var response = new MockHttpServletResponse();
        AtomicBoolean continued = new AtomicBoolean();
        new LegacyHoSoWriteGuardFilter(true).doFilter(request, response, (req, res) -> continued.set(true));
        assertEquals(true, continued.get());
    }
}
