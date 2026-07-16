package vn.vht.qtkhcn.service;

public class DraftRevisionConflictException extends RuntimeException {
    public DraftRevisionConflictException(long expected, long actual) {
        super("Draft đã được thay đổi: expected revision %d nhưng revision hiện tại là %d."
                .formatted(expected, actual));
    }
}
