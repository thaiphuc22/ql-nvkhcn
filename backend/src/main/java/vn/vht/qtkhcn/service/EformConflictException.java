package vn.vht.qtkhcn.service;

public class EformConflictException extends RuntimeException {
    public EformConflictException(String message) {
        super(message);
    }

    public static EformConflictException stale(String key, long expected, long actual) {
        return new EformConflictException("Biểu mẫu " + key + " đã thay đổi: expected version "
                + expected + " nhưng version hiện tại là " + actual + ".");
    }

    public static EformConflictException duplicateKey(String key) {
        return new EformConflictException("Mã biểu mẫu đã tồn tại: " + key);
    }
}
