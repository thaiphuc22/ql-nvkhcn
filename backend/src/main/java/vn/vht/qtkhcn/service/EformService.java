package vn.vht.qtkhcn.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.NoSuchElementException;
import java.util.Set;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import vn.vht.qtkhcn.domain.Eform;
import vn.vht.qtkhcn.repository.EformRepository;
import vn.vht.qtkhcn.web.dto.EformDtos.CreateEformRequest;
import vn.vht.qtkhcn.web.dto.EformDtos.EformResponse;
import vn.vht.qtkhcn.web.dto.EformDtos.UpdateMetaRequest;
import vn.vht.qtkhcn.web.dto.EformDtos.UpdateSchemaRequest;

@Service
public class EformService {
    private static final Set<String> LOAI_VALUES =
            Set.of("Soạn thảo", "Góp ý", "Nhận xét", "Thẩm định", "Phê duyệt");

    private final EformRepository repository;
    private final ObjectMapper objectMapper;

    public EformService(EformRepository repository, ObjectMapper objectMapper) {
        this.repository = repository;
        this.objectMapper = objectMapper;
    }

    @Transactional(readOnly = true)
    public List<EformResponse> list() {
        return repository.findAllByOrderByCreatedAtDesc().stream().map(this::toResponse).toList();
    }

    @Transactional(readOnly = true)
    public EformResponse get(String key) {
        return toResponse(find(key));
    }

    @Transactional
    public EformResponse create(CreateEformRequest request, String actor) {
        String key = request.key().trim().toLowerCase();
        if (repository.existsById(key)) {
            throw EformConflictException.duplicateKey(key);
        }
        validateLoai(request.loai());
        Eform entity = new Eform();
        entity.setKey(key);
        entity.setTen(request.ten().trim());
        entity.setMoTa(request.moTa() == null ? "" : request.moTa().trim());
        entity.setLoai(request.loai());
        entity.setSchemaJson(writeSchema(request.schema()));
        OffsetDateTime now = OffsetDateTime.now();
        entity.setCreatedAt(now);
        entity.setUpdatedBy(actorOrDefault(actor));
        entity.setUpdatedAt(now);
        entity = repository.saveAndFlush(entity);
        return toResponse(entity);
    }

    @Transactional
    public EformResponse updateMeta(String key, UpdateMetaRequest request, long expectedVersion, String actor) {
        Eform entity = find(key);
        assertVersion(key, expectedVersion, entity.getVersion());
        validateLoai(request.loai());
        entity.setTen(request.ten().trim());
        entity.setMoTa(request.moTa() == null ? "" : request.moTa().trim());
        entity.setLoai(request.loai());
        touch(entity, actor);
        entity = repository.saveAndFlush(entity);
        return toResponse(entity);
    }

    @Transactional
    public EformResponse updateSchema(String key, UpdateSchemaRequest request, long expectedVersion, String actor) {
        Eform entity = find(key);
        assertVersion(key, expectedVersion, entity.getVersion());
        entity.setSchemaJson(writeSchema(request.schema()));
        touch(entity, actor);
        entity = repository.saveAndFlush(entity);
        return toResponse(entity);
    }

    @Transactional
    public void delete(String key, long expectedVersion) {
        Eform entity = find(key);
        assertVersion(key, expectedVersion, entity.getVersion());
        repository.delete(entity);
        repository.flush();
    }

    private Eform find(String key) {
        return repository.findById(key)
                .orElseThrow(() -> new NoSuchElementException("Không tìm thấy biểu mẫu: " + key));
    }

    private void assertVersion(String key, long expected, long actual) {
        if (expected != actual) {
            throw EformConflictException.stale(key, expected, actual);
        }
    }

    private void validateLoai(String loai) {
        if (loai != null && !LOAI_VALUES.contains(loai)) {
            throw new IllegalArgumentException("loai không hợp lệ: " + loai);
        }
    }

    private void touch(Eform entity, String actor) {
        entity.setUpdatedBy(actorOrDefault(actor));
        entity.setUpdatedAt(OffsetDateTime.now());
    }

    private static String actorOrDefault(String actor) {
        return actor == null || actor.isBlank() ? "system" : actor;
    }

    private String writeSchema(Object schema) {
        try {
            return objectMapper.writeValueAsString(schema);
        } catch (JsonProcessingException e) {
            throw new IllegalArgumentException("schema không hợp lệ: " + e.getMessage());
        }
    }

    private EformResponse toResponse(Eform entity) {
        Object schema;
        try {
            schema = objectMapper.readValue(entity.getSchemaJson(), Object.class);
        } catch (JsonProcessingException e) {
            throw new IllegalStateException("schema lưu trong DB không hợp lệ: " + entity.getKey());
        }
        return new EformResponse(entity.getKey(), entity.getTen(), entity.getMoTa(), entity.getLoai(), schema,
                entity.getVersion(), entity.getUpdatedBy(), entity.getUpdatedAt(), entity.getCreatedAt());
    }
}
