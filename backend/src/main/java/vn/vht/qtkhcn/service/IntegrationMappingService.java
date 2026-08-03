package vn.vht.qtkhcn.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.NoSuchElementException;
import java.util.Set;
import java.util.UUID;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import vn.vht.qtkhcn.domain.IntegrationMapping;
import vn.vht.qtkhcn.repository.IntegrationMappingRepository;
import vn.vht.qtkhcn.web.dto.IntegrationMappingDtos.CreateMappingRequest;
import vn.vht.qtkhcn.web.dto.IntegrationMappingDtos.FieldMappingDto;
import vn.vht.qtkhcn.web.dto.IntegrationMappingDtos.IntegrationMappingResponse;
import vn.vht.qtkhcn.web.dto.IntegrationMappingDtos.StatusChangeResult;
import vn.vht.qtkhcn.web.dto.IntegrationMappingDtos.UpdateFieldsRequest;

/** Backend cho tab "Mapping dữ liệu" của màn Tích hợp (`/tich-hop`). Port của
 * webapp/src/store/IntegrationMappingContext.tsx (CRUD + status) và
 * webapp/src/data/integrationMapping.ts::validateMappingConfig (fail-closed trước Active). */
@Service
public class IntegrationMappingService {
    private static final DateTimeFormatter STAMP_FORMAT =
            DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm").withZone(ZoneOffset.of("+07:00"));
    private static final Set<String> DOI_TUONG_VALUES = Set.of("HoSo", "NhiemVu", "DuToan", "NhanSu", "TaiSan");
    private static final Set<String> CHIEU_VALUES = Set.of("out", "in");
    private static final Set<String> STATUS_VALUES = Set.of("draft", "ready", "active", "deprecated", "error");

    private final IntegrationMappingRepository repository;
    private final ObjectMapper objectMapper;

    public IntegrationMappingService(IntegrationMappingRepository repository, ObjectMapper objectMapper) {
        this.repository = repository;
        this.objectMapper = objectMapper;
    }

    @Transactional(readOnly = true)
    public List<IntegrationMappingResponse> list() {
        return repository.findAllByOrderByCreatedAtDesc().stream().map(this::toResponse).toList();
    }

    @Transactional(readOnly = true)
    public IntegrationMappingResponse get(String id) {
        return toResponse(find(id));
    }

    @Transactional
    public IntegrationMappingResponse create(CreateMappingRequest request, String actor) {
        if (!DOI_TUONG_VALUES.contains(request.doiTuong())) {
            throw new IllegalArgumentException("doiTuong không hợp lệ: " + request.doiTuong());
        }
        if (!CHIEU_VALUES.contains(request.chieu())) {
            throw new IllegalArgumentException("chieu không hợp lệ: " + request.chieu());
        }
        IntegrationMapping entity = new IntegrationMapping();
        entity.setId("map-" + request.he().trim().toLowerCase() + "-" + UUID.randomUUID().toString().substring(0, 8));
        entity.setHe(request.he().trim());
        entity.setDoiTuong(request.doiTuong());
        entity.setChieu(request.chieu());
        entity.setTrangThai("draft");
        entity.setFieldsJson(writeFields(List.of()));
        entity.setCapNhatLuc(nowStamp());
        entity.setCapNhatBoi(actorOrDefault(actor));
        entity.setCreatedAt(OffsetDateTime.now());
        entity = repository.saveAndFlush(entity);
        return toResponse(entity);
    }

    @Transactional
    public IntegrationMappingResponse updateFields(String id, UpdateFieldsRequest request, long expectedVersion, String actor) {
        IntegrationMapping entity = find(id);
        assertVersion(id, expectedVersion, entity.getVersion());
        entity.setFieldsJson(writeFields(request.fields()));
        entity.setTrangThai("draft");
        entity.setCapNhatLuc(nowStamp());
        entity.setCapNhatBoi(actorOrDefault(actor));
        entity = repository.saveAndFlush(entity);
        return toResponse(entity);
    }

    /** Đổi trạng thái. Chuyển sang 'active' chạy validate trước (fail-closed): nếu không hợp
     * lệ, mapping vẫn được ghi nhưng ở trạng thái 'error' thay vì 'active', lỗi trả kèm trong
     * kết quả — đúng hành vi IntegrationMappingContext.setStatus gốc (luôn ghi một trạng thái). */
    @Transactional
    public StatusChangeResult updateStatus(String id, String status, long expectedVersion, String actor) {
        if (!STATUS_VALUES.contains(status)) {
            throw new IllegalArgumentException("trangThai không hợp lệ: " + status);
        }
        IntegrationMapping entity = find(id);
        assertVersion(id, expectedVersion, entity.getVersion());

        List<String> errors = List.of();
        String nextStatus = status;
        if ("active".equals(status)) {
            errors = validateFields(readFields(entity.getFieldsJson()));
            if (!errors.isEmpty()) {
                nextStatus = "error";
            }
        }
        entity.setTrangThai(nextStatus);
        entity.setCapNhatLuc(nowStamp());
        entity.setCapNhatBoi(actorOrDefault(actor));
        entity = repository.saveAndFlush(entity);
        return new StatusChangeResult(errors.isEmpty(), errors, toResponse(entity));
    }

    @Transactional
    public void delete(String id, long expectedVersion) {
        IntegrationMapping entity = find(id);
        assertVersion(id, expectedVersion, entity.getVersion());
        repository.delete(entity);
        repository.flush();
    }

    /** Validate trước khi cho chuyển trạng thái sang Active — port trực tiếp của
     * data/integrationMapping.ts::validateMappingConfig (thiếu field bắt buộc, thiếu value
     * mapping cho enum, map trùng field hệ ngoài, không có khoá định danh). */
    private List<String> validateFields(List<FieldMappingDto> fields) {
        List<String> errors = new ArrayList<>();
        if (fields.isEmpty()) {
            errors.add("Chưa có field mapping nào.");
        }

        Set<String> seenExternal = new HashSet<>();
        boolean hasKey = false;

        for (FieldMappingDto f : fields) {
            String label = (f.truongQTKHCN() == null || f.truongQTKHCN().isBlank()) ? "(chưa đặt tên)" : f.truongQTKHCN();
            if (f.truongQTKHCN() == null || f.truongQTKHCN().isBlank()) {
                errors.add("Có dòng thiếu tên trường QTKHCN.");
            }
            if (f.truongHeNgoai() == null || f.truongHeNgoai().isBlank()) {
                errors.add("Trường \"" + label + "\" thiếu trường hệ ngoài tương ứng.");
            } else {
                if (!seenExternal.add(f.truongHeNgoai())) {
                    errors.add("Trường hệ ngoài \"" + f.truongHeNgoai() + "\" bị map trùng từ nhiều field QTKHCN.");
                }
            }
            if (Boolean.TRUE.equals(f.khoaDinhDanh())) hasKey = true;
            boolean isEnum = "enum".equals(f.kieuDuLieu()) || "enum-map".equals(f.transform());
            if (isEnum && (f.valueMappings() == null || f.valueMappings().isEmpty())) {
                errors.add("Trường \"" + label + "\" là enum nhưng chưa khai value mapping.");
            }
        }

        if (!hasKey) {
            errors.add("Chưa có field nào đánh dấu là khoá định danh (maHoSo/maNhiemVu hoặc id hệ ngoài).");
        }

        return errors;
    }

    private IntegrationMapping find(String id) {
        return repository.findById(id)
                .orElseThrow(() -> new NoSuchElementException("Không tìm thấy mapping: " + id));
    }

    private void assertVersion(String id, long expected, long actual) {
        if (expected != actual) {
            throw IntegrationConflictException.staleMapping(id, expected, actual);
        }
    }

    private static String actorOrDefault(String actor) {
        return actor == null || actor.isBlank() ? "system" : actor;
    }

    private static String nowStamp() {
        return STAMP_FORMAT.format(OffsetDateTime.now());
    }

    private String writeFields(List<FieldMappingDto> fields) {
        try {
            return objectMapper.writeValueAsString(fields);
        } catch (JsonProcessingException e) {
            throw new IllegalArgumentException("fields không hợp lệ: " + e.getMessage());
        }
    }

    private List<FieldMappingDto> readFields(String json) {
        try {
            return objectMapper.readValue(json, new TypeReference<List<FieldMappingDto>>() {
            });
        } catch (JsonProcessingException e) {
            throw new IllegalStateException("fields lưu trong DB không hợp lệ.");
        }
    }

    private IntegrationMappingResponse toResponse(IntegrationMapping e) {
        return new IntegrationMappingResponse(e.getId(), e.getHe(), e.getDoiTuong(), e.getChieu(), e.getTrangThai(),
                e.getVersion(), e.getCapNhatLuc(), e.getCapNhatBoi(), readFields(e.getFieldsJson()), e.getJobType());
    }
}
