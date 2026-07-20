package vn.vht.qtkhcn.service;

public class ApprovalMatrixConflictException extends RuntimeException {
    public ApprovalMatrixConflictException(String message) {
        super(message);
    }

    public static ApprovalMatrixConflictException staleVersion(int expected, int actual) {
        return new ApprovalMatrixConflictException(
                "Luật ma trận đã thay đổi: expected version " + expected + " nhưng version hiện tại là " + actual + ".");
    }
}
