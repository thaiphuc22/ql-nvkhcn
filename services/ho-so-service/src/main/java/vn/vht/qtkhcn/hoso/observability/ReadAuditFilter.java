package vn.vht.qtkhcn.hoso.observability;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import io.micrometer.core.instrument.MeterRegistry;
import io.micrometer.core.instrument.Timer;
import java.io.IOException;
import java.time.Duration;
import java.util.UUID;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.slf4j.MDC;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

@Component
@Order(20)
public class ReadAuditFilter extends OncePerRequestFilter {

    public static final String CORRELATION_HEADER = "X-Correlation-Id";
    public static final String CANARY_HEADER = "X-QTKHCN-Read-Canary";
    private static final Logger log = LoggerFactory.getLogger(ReadAuditFilter.class);
    private final MeterRegistry meterRegistry;

    public ReadAuditFilter(MeterRegistry meterRegistry) {
        this.meterRegistry = meterRegistry;
    }

    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) {
        return !"GET".equals(request.getMethod()) || !request.getRequestURI().startsWith("/api/");
    }

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain) throws ServletException, IOException {
        String correlationId = request.getHeader(CORRELATION_HEADER);
        if (correlationId == null || correlationId.isBlank()) {
            correlationId = UUID.randomUUID().toString();
        }
        response.setHeader(CORRELATION_HEADER, correlationId);
        MDC.put("correlationId", correlationId);
        String traffic = "true".equalsIgnoreCase(request.getHeader(CANARY_HEADER)) ? "canary" : "direct";
        long started = System.nanoTime();
        try {
            filterChain.doFilter(request, response);
        } finally {
            long elapsedNanos = System.nanoTime() - started;
            long elapsedMs = elapsedNanos / 1_000_000;
            String outcome = outcome(response.getStatus());
            Timer.builder("qtkhcn.read.requests")
                    .description("Observed read requests served by the Ho So service")
                    .tag("route", normalizedRoute(request.getRequestURI()))
                    .tag("traffic", traffic)
                    .tag("outcome", outcome)
                    .publishPercentileHistogram()
                    .minimumExpectedValue(Duration.ofMillis(1))
                    .maximumExpectedValue(Duration.ofSeconds(10))
                    .register(meterRegistry)
                    .record(elapsedNanos, java.util.concurrent.TimeUnit.NANOSECONDS);
            log.info("READ_AUDIT method={} path={} status={} elapsedMs={} traffic={} correlationId={}",
                    request.getMethod(), request.getRequestURI(), response.getStatus(), elapsedMs, traffic, correlationId);
            MDC.remove("correlationId");
        }
    }

    private static String outcome(int status) {
        if (status >= 500) {
            return "server_error";
        }
        if (status >= 400) {
            return "client_error";
        }
        return "success";
    }

    private static String normalizedRoute(String path) {
        if ("/api/ho-so".equals(path) || "/api/ho-so/".equals(path)) {
            return "/api/ho-so";
        }
        if (path.startsWith("/api/ho-so/")) {
            return "/api/ho-so/{id}";
        }
        if ("/api/nhiem-vu".equals(path) || "/api/nhiem-vu/".equals(path)) {
            return "/api/nhiem-vu";
        }
        if (path.startsWith("/api/nhiem-vu/")) {
            return "/api/nhiem-vu/{id}";
        }
        if ("/api/my-tasks".equals(path) || "/api/my-tasks/".equals(path)) {
            return "/api/my-tasks";
        }
        return "/api/other";
    }
}
