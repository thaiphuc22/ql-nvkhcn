package vn.vht.qtkhcn.hoso.service;

import jakarta.persistence.EntityNotFoundException;
import java.time.OffsetDateTime;
import org.springframework.core.io.Resource;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.support.TransactionSynchronization;
import org.springframework.transaction.support.TransactionSynchronizationManager;
import org.springframework.web.multipart.MultipartFile;
import vn.vht.qtkhcn.hoso.domain.HoSo;
import vn.vht.qtkhcn.hoso.domain.TaiLieu;
import vn.vht.qtkhcn.hoso.repository.HoSoRepository;
import vn.vht.qtkhcn.hoso.repository.TaiLieuRepository;

@Service
public class DocumentFileService {
    private final HoSoRepository hoSoRepository;
    private final TaiLieuRepository taiLieuRepository;
    private final DocumentStorageService storage;
    private final MutationSupport mutations;

    public DocumentFileService(HoSoRepository hoSoRepository, TaiLieuRepository taiLieuRepository,
            DocumentStorageService storage, MutationSupport mutations) {
        this.hoSoRepository = hoSoRepository;
        this.taiLieuRepository = taiLieuRepository;
        this.storage = storage;
        this.mutations = mutations;
    }

    @Transactional
    public TaiLieu upload(String hoSoId, MultipartFile file, String actorHeader) {
        String actor = mutations.requireActor(actorHeader);
        HoSo hoSo = hoSoRepository.findById(hoSoId)
                .orElseThrow(() -> new EntityNotFoundException("Khong tim thay HoSo " + hoSoId));
        validate(file);

        DocumentStorageService.StoredFile stored = storage.store(file);
        registerRollbackCleanup(stored.storageKey());

        TaiLieu document = new TaiLieu();
        document.setHoSo(hoSo);
        document.setTen(safeFileName(file.getOriginalFilename()));
        document.setLoai(fileType(document.getTen(), file.getContentType()));
        document.setContentType(normalizeContentType(file.getContentType()));
        document.setSizeBytes(stored.sizeBytes());
        document.setStorageKey(stored.storageKey());
        document.setUploadedAt(OffsetDateTime.now());
        document = taiLieuRepository.saveAndFlush(document);
        mutations.audit("TAI_LIEU", String.valueOf(document.getId()), document.getVersion(),
                "UPLOAD", actor, "hoSoId=" + hoSoId + ";size=" + stored.sizeBytes());
        return document;
    }

    @Transactional(readOnly = true)
    public DocumentContent content(String hoSoId, long documentId) {
        TaiLieu document = taiLieuRepository.findByIdAndHoSoId(documentId, hoSoId)
                .orElseThrow(() -> new EntityNotFoundException(
                        "Khong tim thay TaiLieu " + documentId + " trong HoSo " + hoSoId));
        if (document.getStorageKey() == null) {
            throw new EntityNotFoundException("Tai lieu chi co metadata, chua co noi dung tep.");
        }
        return new DocumentContent(document, storage.load(document.getStorageKey()));
    }

    private void registerRollbackCleanup(String storageKey) {
        if (!TransactionSynchronizationManager.isSynchronizationActive()) return;
        TransactionSynchronizationManager.registerSynchronization(new TransactionSynchronization() {
            @Override
            public void afterCompletion(int status) {
                if (status != STATUS_COMMITTED) storage.deleteQuietly(storageKey);
            }
        });
    }

    private static void validate(MultipartFile file) {
        if (file == null || file.isEmpty()) throw new IllegalArgumentException("Vui long chon tep de tai len.");
        if (file.getOriginalFilename() == null || file.getOriginalFilename().isBlank()) {
            throw new IllegalArgumentException("Ten tep khong hop le.");
        }
    }

    static String safeFileName(String original) {
        String normalized = original.replace('\\', '/');
        String name = normalized.substring(normalized.lastIndexOf('/') + 1).trim();
        if (name.isBlank() || name.equals(".") || name.equals("..")) {
            throw new IllegalArgumentException("Ten tep khong hop le.");
        }
        return name.length() <= 255 ? name : name.substring(name.length() - 255);
    }

    private static String normalizeContentType(String contentType) {
        return contentType == null || contentType.isBlank() ? "application/octet-stream" : contentType;
    }

    private static String fileType(String fileName, String contentType) {
        String lower = fileName.toLowerCase();
        if (lower.endsWith(".pdf")) return "PDF";
        if (lower.endsWith(".xls") || lower.endsWith(".xlsx") || lower.endsWith(".csv")) return "Excel";
        if (lower.endsWith(".zip") || lower.endsWith(".rar") || lower.endsWith(".7z")) return "Archive";
        if (contentType != null && contentType.startsWith("image/")) return "Image";
        return "File";
    }

    public record DocumentContent(TaiLieu document, Resource resource) {}
}
