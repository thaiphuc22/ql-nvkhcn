package vn.vht.qtkhcn.identity.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;
import org.springframework.web.cors.CorsUtils;

/**
 * Mirror của {@code vn.vht.qtkhcn.security.DevApiKeyFilter} (backend, 8090) — cùng header và cùng
 * quy ước: chặn {@code /api/*} bằng 1 API key tĩnh trong lúc dev, KHÔNG chặn {@code /internal/*}
 * (đã có {@link InternalServiceTokenFilter} riêng cho service-to-service). Trước khi thêm filter
 * này, mọi CRUD Organization/Role/Permission/User/Assignment ở đây hoàn toàn không có auth.
 *
 * Thay bằng OIDC/SAML thật ngay khi OQ-021 được chốt — đừng mở rộng file này thành 1 hệ thống JWT
 * tự chế.
 */
@Component
public class DevApiKeyFilter extends OncePerRequestFilter {

    private static final String HEADER = "X-QTKHCN-Dev-Key";

    @Value("${qtkhcn.dev-api-key:dev-local-only}")
    private String expectedKey;

    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) {
        return request.getRequestURI().startsWith("/internal/") || CorsUtils.isPreFlightRequest(request);
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain chain)
            throws ServletException, IOException {
        String provided = request.getHeader(HEADER);
        if (!expectedKey.equals(provided)) {
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            response.setContentType("application/json;charset=UTF-8");
            response.getWriter().write("{\"message\":\"Thiếu hoặc sai header " + HEADER
                    + " (dev API key stub — xem DevApiKeyFilter.java, KHÔNG phải auth thật)\"}");
            return;
        }
        chain.doFilter(request, response);
    }
}
