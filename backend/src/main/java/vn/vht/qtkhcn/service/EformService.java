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
import vn.vht.qtkhcn.domain.EformSource;
import vn.vht.qtkhcn.domain.EformVersion;
import vn.vht.qtkhcn.repository.EformRepository;
import vn.vht.qtkhcn.repository.EformVersionRepository;
import vn.vht.qtkhcn.web.dto.EformDtos.CreateEformRequest;
import vn.vht.qtkhcn.web.dto.EformDtos.EformResponse;
import vn.vht.qtkhcn.web.dto.EformDtos.UpdateMetaRequest;
import vn.vht.qtkhcn.web.dto.EformDtos.UpdateSchemaRequest;

@Service
public class EformService {
    private static final Set<String> LOAI_VALUES =
            Set.of("Soạn thảo", "Góp ý", "Nhận xét", "Thẩm định", "Phê duyệt");

    private final EformRepository repository;
    private final EformVersionRepository versionRepository;
    private final ObjectMapper objectMapper;

    public EformService(EformRepository repository, EformVersionRepository versionRepository, ObjectMapper objectMapper) {
        this.repository = repository;
        this.versionRepository = versionRepository;
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

    @Transactional(readOnly = true)
    public EformResponse getVersion(String key, long version) {
        return toResponse(versionRepository.findByFormKeyAndVersion(key, version)
                .orElseThrow(() -> new NoSuchElementException(
                        "Không tìm thấy phiên bản biểu mẫu: " + key + "@" + version)));
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
        snapshot(entity);
        return toResponse(entity);
    }

    @Transactional
    public EformResponse updateMeta(String key, UpdateMetaRequest request, long expectedVersion, String actor) {
        Eform entity = findEditable(key);
        assertVersion(key, expectedVersion, entity.getVersion());
        validateLoai(request.loai());
        entity.setTen(request.ten().trim());
        entity.setMoTa(request.moTa() == null ? "" : request.moTa().trim());
        entity.setLoai(request.loai());
        touch(entity, actor);
        entity = repository.saveAndFlush(entity);
        snapshot(entity);
        return toResponse(entity);
    }

    @Transactional
    public EformResponse updateSchema(String key, UpdateSchemaRequest request, long expectedVersion, String actor) {
        Eform entity = findEditable(key);
        assertVersion(key, expectedVersion, entity.getVersion());
        entity.setSchemaJson(writeSchema(request.schema()));
        touch(entity, actor);
        entity = repository.saveAndFlush(entity);
        snapshot(entity);
        return toResponse(entity);
    }

    @Transactional
    public void delete(String key, long expectedVersion) {
        Eform entity = findEditable(key);
        assertVersion(key, expectedVersion, entity.getVersion());
        repository.delete(entity);
        repository.flush();
    }

    /**
     * Ghi một biểu mẫu hút từ Camunda vào thư viện — dùng cho form NHÚNG lấy được lúc đồng bộ, và
     * sau này cho linked form hydrate lúc runtime.
     *
     * <p>Khác {@link #create}/{@link #updateSchema} ở ba điểm, đều có lý do:
     * <ul>
     *   <li><b>Không hạ chữ thường khoá.</b> {@code create} hạ chữ thường vì khoá do người gõ tay;
     *       ở đây khoá là id trong BPMN, phân biệt hoa thường, và phải khớp nguyên văn với khoá mà
     *       {@code BpmnFormReference} ghim vào luật hành động lúc scaffold.</li>
     *   <li><b>Không kiểm {@code If-Match}.</b> Đây không phải người sửa đồng thời mà là đồng bộ từ
     *       nguồn sự thật bên ngoài; chặn theo version chỉ làm lượt đồng bộ hỏng vô cớ.</li>
     *   <li><b>Không bao giờ đè dòng {@code source=APP}.</b> Trùng khoá với biểu mẫu BA tự vẽ thì
     *       BỎ QUA và báo lên, vì ghi đè là làm mất bài của người ta — mất im lặng, không hoàn tác
     *       được. Đổi tên bên nào là quyết định của người dùng, không phải của importer.</li>
     * </ul>
     */
    @Transactional
    public ImportOutcome importFromCamunda(String key, String camundaFormId, String ten, String moTa,
            String schemaJson, String actor) {
        Eform existing = repository.findById(key).orElse(null);
        if (existing != null && !EformSource.CAMUNDA.equals(existing.getSource())) {
            return ImportOutcome.SKIPPED_APP_OWNED;
        }
        if (existing != null && schemaJson.equals(existing.getSchemaJson()) && ten.equals(existing.getTen())) {
            return ImportOutcome.UNCHANGED;
        }
        boolean created = existing == null;
        OffsetDateTime now = OffsetDateTime.now();
        Eform entity = existing == null ? new Eform() : existing;
        if (created) {
            entity.setKey(key);
            entity.setCreatedAt(now);
            entity.setSource(EformSource.CAMUNDA);
        }
        entity.setCamundaFormId(camundaFormId);
        entity.setTen(trim(ten, 255));
        entity.setMoTa(trim(moTa == null ? "" : moTa, 1000));
        entity.setSchemaJson(schemaJson);
        touch(entity, actor);
        entity = repository.saveAndFlush(entity);
        snapshot(entity);
        return created ? ImportOutcome.CREATED : ImportOutcome.UPDATED;
    }

    public enum ImportOutcome { CREATED, UPDATED, UNCHANGED, SKIPPED_APP_OWNED }

    private static String trim(String value, int maxLength) {
        return value.length() <= maxLength ? value : value.substring(0, maxLength);
    }

    private Eform find(String key) {
        return repository.findById(key)
                .orElseThrow(() -> new NoSuchElementException("Không tìm thấy biểu mẫu: " + key));
    }

    /**
     * Biểu mẫu hút từ Camunda là READ-ONLY trong app: Camunda là nơi authoring duy nhất, và lượt đồng
     * bộ sau sẽ ghi đè. Không chặn ở đây thì BA sửa xong tưởng đã lưu, tới lượt đồng bộ kế tiếp mất
     * sạch mà không ai biết vì sao — mất im lặng, đúng loại lỗi khó truy nhất.
     */
    private Eform findEditable(String key) {
        Eform entity = find(key);
        if (EformSource.CAMUNDA.equals(entity.getSource())) {
            throw new IllegalArgumentException(
                    "Biểu mẫu " + key + " khai trên Camunda — sửa trên Camunda rồi đồng bộ lại, app không sửa được.");
        }
        return entity;
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

    private EformResponse toResponse(EformVersion entity) {
        return new EformResponse(entity.getFormKey(), entity.getTen(), entity.getMoTa(), entity.getLoai(),
                readSchema(entity.getSchemaJson(), entity.getFormKey()), entity.getVersion(),
                entity.getCreatedBy(), entity.getCreatedAt(), entity.getCreatedAt());
    }

    private Object readSchema(String schemaJson, String key) {
        try {
            return objectMapper.readValue(schemaJson, Object.class);
        } catch (JsonProcessingException e) {
            throw new IllegalStateException("schema lưu trong DB không hợp lệ: " + key);
        }
    }

    private void snapshot(Eform entity) {
        String revisionKey = entity.getKey() + ":" + entity.getVersion();
        if (versionRepository.existsById(revisionKey)) return;
        EformVersion revision = new EformVersion();
        revision.setRevisionKey(revisionKey);
        revision.setFormKey(entity.getKey());
        revision.setVersion(entity.getVersion());
        revision.setTen(entity.getTen());
        revision.setMoTa(entity.getMoTa());
        revision.setLoai(entity.getLoai());
        revision.setSchemaJson(entity.getSchemaJson());
        revision.setCreatedBy(entity.getUpdatedBy());
        revision.setCreatedAt(entity.getUpdatedAt());
        versionRepository.save(revision);
    }
}
