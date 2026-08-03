package vn.vht.qtkhcn.hoso.service;

import java.time.LocalDate;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

@Component
public class BusinessIdGenerator {

    private final JdbcTemplate jdbcTemplate;

    public BusinessIdGenerator(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    public String nextNhiemVuId() {
        Long sequence = jdbcTemplate.queryForObject("select nextval('nhiem_vu_business_seq')", Long.class);
        return "RD.%d.%03d".formatted(LocalDate.now().getYear(), sequence);
    }

    public String nextHoSoId() {
        Long sequence = jdbcTemplate.queryForObject("select nextval('ho_so_business_seq')", Long.class);
        return "HS-%d-%03d".formatted(LocalDate.now().getYear(), sequence);
    }
}
