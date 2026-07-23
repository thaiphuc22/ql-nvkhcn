package vn.vht.qtkhcn.camunda;

public class DmnCamundaException extends RuntimeException {
    private final String detail;

    public DmnCamundaException(String message, String detail, Throwable cause) {
        super(message, cause);
        this.detail = detail;
    }

    public String getDetail() {
        return detail;
    }
}
