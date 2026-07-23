package vn.vht.qtkhcn.hoso.service;

import java.net.URLDecoder;
import java.nio.charset.StandardCharsets;
import org.springframework.stereotype.Component;
import vn.vht.qtkhcn.hoso.domain.DomainMutationAudit;
import vn.vht.qtkhcn.hoso.repository.DomainMutationAuditRepository;

@Component
public class MutationSupport {

    private final DomainMutationAuditRepository auditRepository;

    public MutationSupport(DomainMutationAuditRepository auditRepository) {
        this.auditRepository = auditRepository;
    }

    public String requireActor(String actor) {
        if (actor == null || actor.isBlank()) {
            throw new IllegalArgumentException("X-QTKHCN-Actor is required for mutations.");
        }
        String normalized = actor.trim();
        if (normalized.startsWith("UTF-8''")) {
            normalized = URLDecoder.decode(normalized.substring(7), StandardCharsets.UTF_8);
        }
        return normalized;
    }

    public void verifyVersion(String type, String id, long expected, long actual) {
        if (expected != actual) {
            throw new VersionConflictException(type, id, expected, actual);
        }
    }

    public void audit(String type, String id, long version, String action, String actor, String detail) {
        auditRepository.save(new DomainMutationAudit(type, id, version, action, actor, detail));
    }
}
