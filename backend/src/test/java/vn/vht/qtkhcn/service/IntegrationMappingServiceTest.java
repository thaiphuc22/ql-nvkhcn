package vn.vht.qtkhcn.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.fasterxml.jackson.databind.ObjectMapper;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.NoSuchElementException;
import java.util.Optional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import vn.vht.qtkhcn.domain.IntegrationMapping;
import vn.vht.qtkhcn.repository.IntegrationMappingRepository;
import vn.vht.qtkhcn.web.dto.IntegrationMappingDtos.CreateMappingRequest;
import vn.vht.qtkhcn.web.dto.IntegrationMappingDtos.FieldMappingDto;
import vn.vht.qtkhcn.web.dto.IntegrationMappingDtos.UpdateFieldsRequest;
import vn.vht.qtkhcn.web.dto.IntegrationMappingDtos.ValueMappingDto;

class IntegrationMappingServiceTest {
    private IntegrationMappingRepository repository;
    private final ObjectMapper objectMapper = new ObjectMapper();
    private IntegrationMappingService service;

    @BeforeEach
    void setUp() {
        repository = mock(IntegrationMappingRepository.class);
        service = new IntegrationMappingService(repository, objectMapper);
    }

    private IntegrationMapping entity(String id, String trangThai, long version, List<FieldMappingDto> fields) throws Exception {
        IntegrationMapping m = new IntegrationMapping();
        m.setId(id);
        m.setHe("SAP");
        m.setDoiTuong("DuToan");
        m.setChieu("out");
        m.setTrangThai(trangThai);
        m.setCapNhatLuc("2026-07-08 09:10");
        m.setCapNhatBoi("admin");
        m.setFieldsJson(objectMapper.writeValueAsString(fields));
        m.setVersion(version);
        m.setCreatedAt(OffsetDateTime.now());
        return m;
    }

    @Test
    void createRejectsInvalidDoiTuong() {
        assertThatThrownBy(() -> service.create(new CreateMappingRequest("SAP", "KhongHopLe", "out"), "alice"))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("doiTuong");
    }

    @Test
    void createRejectsInvalidChieu() {
        assertThatThrownBy(() -> service.create(new CreateMappingRequest("SAP", "DuToan", "sideways"), "alice"))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("chieu");
    }

    @Test
    void createPersistsDraftWithEmptyFields() {
        when(repository.saveAndFlush(any())).thenAnswer(invocation -> invocation.getArgument(0));

        var response = service.create(new CreateMappingRequest("SAP", "DuToan", "out"), "alice");

        assertThat(response.trangThai()).isEqualTo("draft");
        assertThat(response.fields()).isEmpty();
        assertThat(response.id()).startsWith("map-sap-");
    }

    @Test
    void updateFieldsRejectsStaleVersion() throws Exception {
        when(repository.findById("map-x")).thenReturn(Optional.of(entity("map-x", "active", 3, List.of())));

        assertThatThrownBy(() -> service.updateFields("map-x", new UpdateFieldsRequest(List.of()), 2, "alice"))
                .isInstanceOf(IntegrationConflictException.class)
                .hasMessageContaining("expected version 2");
    }

    @Test
    void updateFieldsSetsBackToDraft() throws Exception {
        when(repository.findById("map-x")).thenReturn(Optional.of(entity("map-x", "active", 1, List.of())));
        when(repository.saveAndFlush(any())).thenAnswer(invocation -> invocation.getArgument(0));
        FieldMappingDto field = new FieldMappingDto("f-1", "ma", "string", "code", true, true, null, null, null);

        var response = service.updateFields("map-x", new UpdateFieldsRequest(List.of(field)), 1, "alice");

        assertThat(response.trangThai()).isEqualTo("draft");
        assertThat(response.fields()).hasSize(1);
    }

    @Test
    void activateFailsClosedWhenMissingIdentityKey() throws Exception {
        FieldMappingDto field = new FieldMappingDto("f-1", "ma", "string", "code", true, false, null, null, null);
        when(repository.findById("map-x")).thenReturn(Optional.of(entity("map-x", "draft", 1, List.of(field))));
        when(repository.saveAndFlush(any())).thenAnswer(invocation -> invocation.getArgument(0));

        var result = service.updateStatus("map-x", "active", 1, "alice");

        assertThat(result.ok()).isFalse();
        assertThat(result.errors()).anyMatch(e -> e.contains("khoá định danh"));
        assertThat(result.mapping().trangThai()).isEqualTo("error");
    }

    @Test
    void activateFailsClosedWhenEnumMissingValueMappings() throws Exception {
        FieldMappingDto key = new FieldMappingDto("f-1", "ma", "string", "code", true, true, null, null, null);
        FieldMappingDto enumField = new FieldMappingDto("f-2", "trangThai", "enum", "status", true, false, null, null, List.of());
        when(repository.findById("map-x")).thenReturn(Optional.of(entity("map-x", "draft", 1, List.of(key, enumField))));
        when(repository.saveAndFlush(any())).thenAnswer(invocation -> invocation.getArgument(0));

        var result = service.updateStatus("map-x", "active", 1, "alice");

        assertThat(result.ok()).isFalse();
        assertThat(result.errors()).anyMatch(e -> e.contains("value mapping"));
    }

    @Test
    void activateSucceedsWithValidFields() throws Exception {
        FieldMappingDto key = new FieldMappingDto("f-1", "ma", "string", "code", true, true, null, null, null);
        FieldMappingDto enumField = new FieldMappingDto("f-2", "trangThai", "enum", "status", true, false, "enum-map", null,
                List.of(new ValueMappingDto("draft", "DRAFT")));
        when(repository.findById("map-x")).thenReturn(Optional.of(entity("map-x", "draft", 1, List.of(key, enumField))));
        when(repository.saveAndFlush(any())).thenAnswer(invocation -> invocation.getArgument(0));

        var result = service.updateStatus("map-x", "active", 1, "alice");

        assertThat(result.ok()).isTrue();
        assertThat(result.errors()).isEmpty();
        assertThat(result.mapping().trangThai()).isEqualTo("active");
    }

    @Test
    void deleteRequiresMatchingVersion() throws Exception {
        when(repository.findById("map-x")).thenReturn(Optional.of(entity("map-x", "draft", 1, List.of())));

        service.delete("map-x", 1);

        verify(repository).delete(any());
    }

    @Test
    void getUnknownIdThrowsNotFound() {
        when(repository.findById("missing")).thenReturn(Optional.empty());

        assertThatThrownBy(() -> service.get("missing")).isInstanceOf(NoSuchElementException.class);
    }
}
