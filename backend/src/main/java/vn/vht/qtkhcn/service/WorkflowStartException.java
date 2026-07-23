package vn.vht.qtkhcn.service;

import org.springframework.http.HttpStatus;

public class WorkflowStartException extends RuntimeException {
    private final String code;
    private final HttpStatus status;

    public WorkflowStartException(String code, HttpStatus status, String message) {
        super(message);
        this.code = code;
        this.status = status;
    }
    public String getCode() { return code; }
    public HttpStatus getStatus() { return status; }
}
