package vn.vht.qtkhcn.hoso.web;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.multipart;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import vn.vht.qtkhcn.hoso.domain.TaiLieu;
import vn.vht.qtkhcn.hoso.security.InternalServiceTokenFilter;
import vn.vht.qtkhcn.hoso.service.DocumentFileService;

class DocumentFileControllerTest {
    private static final String AUTH = "Bearer test-service-token";
    private DocumentFileService service;
    private MockMvc mvc;

    @BeforeEach
    void setUp() {
        service = mock(DocumentFileService.class);
        mvc = MockMvcBuilders.standaloneSetup(new DocumentFileController(service))
                .setControllerAdvice(new GlobalExceptionHandler())
                .addFilters(new InternalServiceTokenFilter("test-service-token"))
                .build();
    }

    @Test
    void uploadsMultipartFileAndReturnsContentMetadata() throws Exception {
        TaiLieu document = document();
        when(service.upload(eq("HS-2026-001"), any(), eq("alice"))).thenReturn(document);
        MockMultipartFile file = new MockMultipartFile(
                "file", "bao-cao.pdf", MediaType.APPLICATION_PDF_VALUE, "pdf-content".getBytes());

        mvc.perform(multipart("/api/ho-so/HS-2026-001/documents").file(file)
                        .header(HttpHeaders.AUTHORIZATION, AUTH).header("X-QTKHCN-Actor", "alice"))
                .andExpect(status().isCreated())
                .andExpect(header().string(HttpHeaders.ETAG, "\"0\""))
                .andExpect(jsonPath("$.id").value(7))
                .andExpect(jsonPath("$.hasContent").value(true))
                .andExpect(jsonPath("$.sizeBytes").value(11));
    }

    @Test
    void servesInlineForViewAndAttachmentForDownload() throws Exception {
        TaiLieu document = document();
        byte[] bytes = "pdf-content".getBytes();
        when(service.content("HS-2026-001", 7L))
                .thenReturn(new DocumentFileService.DocumentContent(document, new ByteArrayResource(bytes)));

        mvc.perform(get("/api/ho-so/HS-2026-001/documents/7/content")
                        .header(HttpHeaders.AUTHORIZATION, AUTH))
                .andExpect(status().isOk())
                .andExpect(content().bytes(bytes))
                .andExpect(content().contentType(MediaType.APPLICATION_PDF))
                .andExpect(header().string(HttpHeaders.CONTENT_DISPOSITION,
                        org.hamcrest.Matchers.startsWith("inline")));

        mvc.perform(get("/api/ho-so/HS-2026-001/documents/7/download")
                        .header(HttpHeaders.AUTHORIZATION, AUTH))
                .andExpect(status().isOk())
                .andExpect(content().bytes(bytes))
                .andExpect(header().string(HttpHeaders.CONTENT_DISPOSITION,
                        org.hamcrest.Matchers.startsWith("attachment")));
    }

    @Test
    void remainsFailClosedWithoutServiceToken() throws Exception {
        mvc.perform(get("/api/ho-so/HS-2026-001/documents/7/content"))
                .andExpect(status().isUnauthorized());
    }

    private static TaiLieu document() {
        TaiLieu document = new TaiLieu();
        document.setId(7L);
        document.setTen("bao-cao.pdf");
        document.setLoai("PDF");
        document.setContentType(MediaType.APPLICATION_PDF_VALUE);
        document.setSizeBytes(11L);
        document.setStorageKey("01234567-89ab-cdef-0123-456789abcdef");
        return document;
    }
}
