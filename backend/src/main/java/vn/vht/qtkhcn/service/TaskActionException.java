package vn.vht.qtkhcn.service;

import org.springframework.http.HttpStatus;

public class TaskActionException extends RuntimeException {
    private final String code;
    private final HttpStatus status;

    public TaskActionException(String code, HttpStatus status, String message) {
        super(message);
        this.code = code;
        this.status = status;
    }

    public String getCode() { return code; }
    public HttpStatus getStatus() { return status; }
}
