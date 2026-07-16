package vn.vht.qtkhcn.security;

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
 * Auth TỐI THIỂU để chặn API trong lúc dev (D14 note: "JWT stub tạm thời") — KHÔNG phải JWT/OIDC
 * thật. So khớp 1 API key tĩnh trong header; đủ để ngăn truy cập trần trụi từ mạng LAN dev, không
 * đủ cho bất kỳ môi trường nào ngoài máy dev cá nhân.
 *
 * Thay bằng OIDC/SAML thật ngay khi OQ-021 (SSO/IAM protocol) được chốt — xem
 * "Open decisions blocking Foundation 1" trong decisions.md. Đừng mở rộng file này thành 1 hệ
 * thống JWT tự chế; đó là việc làm lại khi có quyết định thật.
 */
@Component
public class DevApiKeyFilter extends OncePerRequestFilter {

    private static final String HEADER = "X-QTKHCN-Dev-Key";

    @Value("${qtkhcn.dev-api-key:dev-local-only}")
    private String expectedKey;

    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) {
        // CORS preflight contains no application credentials. Spring MVC still validates the
        // requested origin/method/headers against WebConfig before the actual request is allowed.
        return CorsUtils.isPreFlightRequest(request);
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
