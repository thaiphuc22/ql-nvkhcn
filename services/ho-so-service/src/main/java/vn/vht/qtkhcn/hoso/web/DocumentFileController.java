package vn.vht.qtkhcn.hoso.web;

import java.nio.charset.StandardCharsets;
import org.springframework.core.io.Resource;
import org.springframework.http.ContentDisposition;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;
import vn.vht.qtkhcn.hoso.domain.TaiLieu;
import vn.vht.qtkhcn.hoso.service.DocumentFileService;
import vn.vht.qtkhcn.hoso.web.dto.DocumentResponse;

@RestController
@RequestMapping("/api/ho-so/{id}/documents")
public class DocumentFileController {
    private final DocumentFileService service;

    public DocumentFileController(DocumentFileService service) {
        this.service = service;
    }

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<DocumentResponse> upload(@PathVariable String id,
            @RequestHeader(value = "X-QTKHCN-Actor", required = false) String actor,
            @RequestPart("file") MultipartFile file) {
        TaiLieu document = service.upload(id, file, actor);
        return ResponseEntity.status(201).eTag(HttpVersion.etag(document.getVersion()))
                .body(DocumentResponse.from(document));
    }

    @GetMapping("/{documentId}/content")
    public ResponseEntity<Resource> view(@PathVariable String id, @PathVariable long documentId) {
        return fileResponse(service.content(id, documentId), false);
    }

    @GetMapping("/{documentId}/download")
    public ResponseEntity<Resource> download(@PathVariable String id, @PathVariable long documentId) {
        return fileResponse(service.content(id, documentId), true);
    }

    private static ResponseEntity<Resource> fileResponse(DocumentFileService.DocumentContent content,
            boolean attachment) {
        String disposition = (attachment ? ContentDisposition.attachment() : ContentDisposition.inline())
                .filename(content.document().getTen(), StandardCharsets.UTF_8).build().toString();
        MediaType mediaType;
        try {
            mediaType = MediaType.parseMediaType(content.document().getContentType());
        } catch (IllegalArgumentException ignored) {
            mediaType = MediaType.APPLICATION_OCTET_STREAM;
        }
        return ResponseEntity.ok()
                .contentType(mediaType)
                .contentLength(content.document().getSizeBytes())
                .header(HttpHeaders.CONTENT_DISPOSITION, disposition)
                .header("X-Content-Type-Options", "nosniff")
                .body(content.resource());
    }
}
