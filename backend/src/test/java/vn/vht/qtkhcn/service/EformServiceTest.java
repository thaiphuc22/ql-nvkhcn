package vn.vht.qtkhcn.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.fasterxml.jackson.databind.ObjectMapper;
import java.time.OffsetDateTime;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.NoSuchElementException;
import java.util.Optional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import vn.vht.qtkhcn.domain.Eform;
import vn.vht.qtkhcn.repository.EformRepository;
import vn.vht.qtkhcn.repository.EformVersionRepository;
import vn.vht.qtkhcn.web.dto.EformDtos.CreateEformRequest;
import vn.vht.qtkhcn.web.dto.EformDtos.UpdateMetaRequest;
import vn.vht.qtkhcn.web.dto.EformDtos.UpdateSchemaRequest;

class EformServiceTest {
    private EformRepository repository;
    private final ObjectMapper objectMapper = new ObjectMapper();
    private EformService service;

    @BeforeEach
    void setUp() {
        repository = mock(EformRepository.class);
        service = new EformService(repository, mock(EformVersionRepository.class), objectMapper);
    }

    private Map<String, Object> schema(String id) {
        Map<String, Object> node = new LinkedHashMap<>();
        node.put("type", "default");
        node.put("id", id);
        node.put("components", List.of());
        return node;
    }

    private Eform entity(String key, long version) throws Exception {
        Eform item = new Eform();
        item.setKey(key);
        item.setTen("Phiếu " + key);
        item.setMoTa("");
        item.setLoai("Soạn thảo");
        item.setSchemaJson(objectMapper.writeValueAsString(schema(key)));
        item.setVersion(version);
        item.setCreatedAt(OffsetDateTime.now());
        item.setUpdatedBy("seed");
        item.setUpdatedAt(OffsetDateTime.now());
        return item;
    }

    @Test
    void createRejectsDuplicateKey() {
        when(repository.existsById("phieu-x")).thenReturn(true);
        CreateEformRequest request = new CreateEformRequest("phieu-x", "Phiếu X", "", "Soạn thảo", schema("phieu-x"));

        assertThatThrownBy(() -> service.create(request, "alice"))
                .isInstanceOf(EformConflictException.class)
                .hasMessageContaining("phieu-x");
    }

    @Test
    void createRejectsInvalidLoai() {
        when(repository.existsById("phieu-x")).thenReturn(false);
        CreateEformRequest request = new CreateEformRequest("phieu-x", "Phiếu X", "", "Không hợp lệ", schema("phieu-x"));

        assertThatThrownBy(() -> service.create(request, "alice"))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("loai");
    }

    @Test
    @SuppressWarnings("unchecked")
    void createPersistsSchemaAsJsonText() {
        when(repository.existsById("phieu-x")).thenReturn(false);
        when(repository.saveAndFlush(any())).thenAnswer(invocation -> invocation.getArgument(0));
        CreateEformRequest request = new CreateEformRequest("phieu-x", "Phiếu X", "Mô tả", "Soạn thảo", schema("phieu-x"));

        var response = service.create(request, "alice");

        assertThat(response.key()).isEqualTo("phieu-x");
        assertThat(((Map<String, Object>) response.schema()).get("id")).isEqualTo("phieu-x");
        assertThat(response.updatedBy()).isEqualTo("alice");
    }

    @Test
    void updateSchemaRejectsStaleVersion() throws Exception {
        when(repository.findById("phieu-x")).thenReturn(Optional.of(entity("phieu-x", 3)));

        assertThatThrownBy(() -> service.updateSchema("phieu-x", new UpdateSchemaRequest(schema("phieu-x")), 2, "alice"))
                .isInstanceOf(EformConflictException.class)
                .hasMessageContaining("expected version 2");
    }

    @Test
    void updateMetaValidatesLoaiAndBumpsAuditFields() throws Exception {
        when(repository.findById("phieu-x")).thenReturn(Optional.of(entity("phieu-x", 1)));
        when(repository.saveAndFlush(any())).thenAnswer(invocation -> invocation.getArgument(0));

        var response = service.updateMeta("phieu-x", new UpdateMetaRequest("Tên mới", "Mô tả mới", "Phê duyệt"), 1, "bob");

        assertThat(response.ten()).isEqualTo("Tên mới");
        assertThat(response.loai()).isEqualTo("Phê duyệt");
        assertThat(response.updatedBy()).isEqualTo("bob");
    }

    @Test
    void deleteRequiresMatchingVersionAndRemovesRow() throws Exception {
        when(repository.findById("phieu-x")).thenReturn(Optional.of(entity("phieu-x", 1)));

        service.delete("phieu-x", 1);

        verify(repository).delete(any());
    }

    @Test
    void getUnknownKeyThrowsNotFound() {
        when(repository.findById("missing")).thenReturn(Optional.empty());

        assertThatThrownBy(() -> service.get("missing")).isInstanceOf(NoSuchElementException.class);
    }
}
