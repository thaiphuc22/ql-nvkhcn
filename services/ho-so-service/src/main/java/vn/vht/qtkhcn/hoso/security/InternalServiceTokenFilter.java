package vn.vht.qtkhcn.hoso.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.annotation.Order;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

@Component
@Order(10)
public class InternalServiceTokenFilter extends OncePerRequestFilter {

    private final byte[] expectedAuthorization;

    public InternalServiceTokenFilter(@Value("${qtkhcn.internal.service-token:}") String serviceToken) {
        this.expectedAuthorization = ("Bearer " + serviceToken).getBytes(StandardCharsets.UTF_8);
    }

    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) {
        return !request.getRequestURI().startsWith("/api/");
    }

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain) throws ServletException, IOException {
        String authorization = request.getHeader(HttpHeaders.AUTHORIZATION);
        byte[] actual = authorization == null ? new byte[0] : authorization.getBytes(StandardCharsets.UTF_8);
        if (expectedAuthorization.length == "Bearer ".length()
                || !MessageDigest.isEqual(expectedAuthorization, actual)) {
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            response.setContentType(MediaType.APPLICATION_JSON_VALUE);
            response.setCharacterEncoding(StandardCharsets.UTF_8.name());
            response.getWriter().write("{\"message\":\"Unauthorized\"}");
            return;
        }
        filterChain.doFilter(request, response);
    }
}
