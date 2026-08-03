package vn.vht.qtkhcn.hoso.service;

import jakarta.annotation.PostConstruct;
import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.StandardCopyOption;
import java.util.UUID;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.stereotype.Service;
import org.springframework.transaction.support.TransactionSynchronization;
import org.springframework.transaction.support.TransactionSynchronizationManager;
import org.springframework.web.multipart.MultipartFile;

@Service
public class DocumentStorageService {
    private final Path root;

    public DocumentStorageService(@Value("${qtkhcn.documents.storage-path:./data/ho-so-files}") String storagePath) {
        this.root = Path.of(storagePath).toAbsolutePath().normalize();
    }

    @PostConstruct
    void initialize() {
        try {
            Files.createDirectories(root);
        } catch (IOException exception) {
            throw new DocumentStorageException("Khong the khoi tao kho tep ho so.", exception);
        }
    }

    public StoredFile store(MultipartFile file) {
        String storageKey = UUID.randomUUID().toString();
        Path target = resolve(storageKey);
        try (InputStream input = file.getInputStream()) {
            Files.copy(input, target, StandardCopyOption.REPLACE_EXISTING);
            return new StoredFile(storageKey, file.getSize());
        } catch (IOException exception) {
            deleteQuietly(storageKey);
            throw new DocumentStorageException("Khong the luu tep tai lieu.", exception);
        }
    }

    public StoredFile storeGenerated(byte[] content) {
        String storageKey = UUID.randomUUID().toString();
        Path target = resolve(storageKey);
        try {
            Files.write(target, content);
            return new StoredFile(storageKey, content.length);
        } catch (IOException exception) {
            deleteQuietly(storageKey);
            throw new DocumentStorageException("Khong the luu tai lieu he thong sinh tu dong.", exception);
        }
    }

    public Resource load(String storageKey) {
        Path path = resolve(storageKey);
        try {
            Resource resource = new UrlResource(path.toUri());
            if (!resource.isReadable() || !resource.exists()) {
                throw new DocumentStorageException("Noi dung tep khong con ton tai trong kho luu tru.", null);
            }
            return resource;
        } catch (IOException exception) {
            throw new DocumentStorageException("Khong the doc tep tai lieu.", exception);
        }
    }

    public void deleteQuietly(String storageKey) {
        if (storageKey == null || storageKey.isBlank()) return;
        try {
            Files.deleteIfExists(resolve(storageKey));
        } catch (IOException ignored) {
            // Metadata remains authoritative; orphan cleanup can retry independently.
        }
    }

    public void deleteAfterCommit(String storageKey) {
        if (storageKey == null || storageKey.isBlank()) return;
        if (!TransactionSynchronizationManager.isSynchronizationActive()) {
            deleteQuietly(storageKey);
            return;
        }
        TransactionSynchronizationManager.registerSynchronization(new TransactionSynchronization() {
            @Override
            public void afterCommit() {
                deleteQuietly(storageKey);
            }
        });
    }

    private Path resolve(String storageKey) {
        if (storageKey == null || !storageKey.matches("[0-9a-fA-F-]{36}")) {
            throw new IllegalArgumentException("Khoa luu tru tep khong hop le.");
        }
        Path path = root.resolve(storageKey).normalize();
        if (!path.getParent().equals(root)) {
            throw new IllegalArgumentException("Duong dan tep khong hop le.");
        }
        return path;
    }

    public record StoredFile(String storageKey, long sizeBytes) {}
}
