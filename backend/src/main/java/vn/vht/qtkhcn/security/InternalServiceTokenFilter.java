package vn.vht.qtkhcn.security;

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
@Order(5)
public class InternalServiceTokenFilter extends OncePerRequestFilter {
    private final byte[] expected;

    public InternalServiceTokenFilter(@Value("${qtkhcn.internal.service-token:}") String token) {
        expected = ("Bearer " + token).getBytes(StandardCharsets.UTF_8);
    }

    @Override protected boolean shouldNotFilter(HttpServletRequest request) {
        return !request.getRequestURI().startsWith("/internal/");
    }

    @Override protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response,
            FilterChain chain) throws ServletException, IOException {
        String header = request.getHeader(HttpHeaders.AUTHORIZATION);
        byte[] actual = header == null ? new byte[0] : header.getBytes(StandardCharsets.UTF_8);
        if (expected.length == "Bearer ".length() || !MessageDigest.isEqual(expected, actual)) {
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            response.setContentType(MediaType.APPLICATION_JSON_VALUE);
            response.setCharacterEncoding(StandardCharsets.UTF_8.name());
            response.getWriter().write("{\"code\":\"UNAUTHORIZED\",\"message\":\"Unauthorized\","
                    + "\"correlationId\":null,\"details\":[]}");
            return;
        }
        chain.doFilter(request, response);
    }
}
