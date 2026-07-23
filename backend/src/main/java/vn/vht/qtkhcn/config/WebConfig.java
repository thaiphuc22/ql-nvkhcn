package vn.vht.qtkhcn.config;

import java.util.Arrays;
import org.springframework.core.env.Environment;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

/**
 * CORS cho dev: cho phép Angular dev server (`ng serve`, mặc định localhost:4200) gọi
 * `/api/**` — chưa cần cho `webapp/` (React) vì bản đó build tĩnh/không gọi API này.
 * KHÔNG phải cấu hình production (danh sách origin cứng, chưa theo domain thật) — thay khi
 * có domain/CDN thật.
 */
@Configuration
public class WebConfig implements WebMvcConfigurer {

    private static final String LOCAL_ANGULAR_ORIGIN = "http://localhost:4200";
    private final String[] allowedOrigins;

    public WebConfig(Environment environment) {
        String configured = environment.getProperty("qtkhcn.cors.allowed-origins", LOCAL_ANGULAR_ORIGIN);
        this.allowedOrigins = Arrays.stream(configured.split(","))
                .map(String::trim)
                .filter(origin -> !origin.isEmpty())
                .distinct()
                .toArray(String[]::new);
        if (allowedOrigins.length == 0) {
            throw new IllegalArgumentException("qtkhcn.cors.allowed-origins must contain at least one origin");
        }
    }

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/api/**")
                .allowedOrigins(allowedOrigins)
                .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
                .allowedHeaders("*");
    }
}
