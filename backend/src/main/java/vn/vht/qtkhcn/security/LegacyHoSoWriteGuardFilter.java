package vn.vht.qtkhcn.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.util.Set;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

/** Kill switch for writes that are no longer owned by the legacy Ho So module. */
@Component
public class LegacyHoSoWriteGuardFilter extends OncePerRequestFilter {

    private static final Set<String> MUTATION_METHODS = Set.of("POST", "PUT", "PATCH", "DELETE");
    private final boolean legacyWritesEnabled;

    public LegacyHoSoWriteGuardFilter(
            @Value("${qtkhcn.ho-so.legacy-writes-enabled:true}") boolean legacyWritesEnabled) {
        this.legacyWritesEnabled = legacyWritesEnabled;
    }

    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) {
        if (legacyWritesEnabled || !MUTATION_METHODS.contains(request.getMethod())) {
            return true;
        }
        String path = request.getRequestURI();
        if ("POST".equals(request.getMethod())) {
            boolean legacyCreate = "/api/ho-so".equals(path) || "/api/nhiem-vu".equals(path);
            boolean legacyDossierAction = path.matches("/api/ho-so/[^/]+/actions/?");
            return !(legacyCreate || legacyDossierAction);
        }
        return !(path.startsWith("/api/ho-so/") || path.startsWith("/api/nhiem-vu/"));
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response,
                                    FilterChain filterChain) throws ServletException, IOException {
        response.setStatus(HttpServletResponse.SC_CONFLICT);
        response.setContentType(MediaType.APPLICATION_JSON_VALUE);
        response.setCharacterEncoding(StandardCharsets.UTF_8.name());
        response.getWriter().write("{\"message\":\"Legacy Ho So write is disabled. "
                + "Use the owning service API (including /api/tasks/{taskKey}/actions for workflow actions).\"}");
    }
}
