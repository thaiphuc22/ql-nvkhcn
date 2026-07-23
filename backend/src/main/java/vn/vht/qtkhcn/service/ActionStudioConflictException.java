package vn.vht.qtkhcn.service;

public class ActionStudioConflictException extends RuntimeException {
    public ActionStudioConflictException(String message) {
        super(message);
    }

    public static ActionStudioConflictException stale(String id, long expected, long actual) {
        return new ActionStudioConflictException("Cấu hình " + id + " đã thay đổi: expected version "
                + expected + " nhưng version hiện tại là " + actual + ".");
    }
}
