package vn.vht.qtkhcn.service;

public class DmnRuleConflictException extends RuntimeException {
    public DmnRuleConflictException(String message) {
        super(message);
    }

    public static DmnRuleConflictException staleVersion(int expected, int actual) {
        return new DmnRuleConflictException(
                "Luật DMN đã thay đổi: expected version %d nhưng version hiện tại là %d."
                        .formatted(expected, actual));
    }
}

