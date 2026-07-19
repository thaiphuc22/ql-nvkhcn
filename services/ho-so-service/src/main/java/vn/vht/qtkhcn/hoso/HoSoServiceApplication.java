package vn.vht.qtkhcn.hoso;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class HoSoServiceApplication {

    // Integration code still uses Jackson 2 while Spring Boot 4's HTTP stack uses Jackson 3.
    @Bean
    ObjectMapper integrationObjectMapper() {
        return new ObjectMapper();
    }

    public static void main(String[] args) {
        SpringApplication.run(HoSoServiceApplication.class, args);
    }
}
