package vn.vht.qtkhcn.service;

public class IntegrationConflictException extends RuntimeException {
    public IntegrationConflictException(String message) {
        super(message);
    }

    public static IntegrationConflictException staleSystem(String key, long expected, long actual) {
        return new IntegrationConflictException("Hệ tích hợp " + key + " đã thay đổi: expected version "
                + expected + " nhưng version hiện tại là " + actual + ".");
    }

    public static IntegrationConflictException staleMapping(String id, long expected, long actual) {
        return new IntegrationConflictException("Mapping " + id + " đã thay đổi: expected version "
                + expected + " nhưng version hiện tại là " + actual + ".");
    }
}
