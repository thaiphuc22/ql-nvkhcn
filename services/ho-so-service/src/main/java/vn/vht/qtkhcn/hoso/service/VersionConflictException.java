package vn.vht.qtkhcn.hoso.service;

public class VersionConflictException extends RuntimeException {
    public VersionConflictException(String aggregateType, String id, long expected, long actual) {
        super("Version conflict for %s %s: expected %d but was %d."
                .formatted(aggregateType, id, expected, actual));
    }
}
