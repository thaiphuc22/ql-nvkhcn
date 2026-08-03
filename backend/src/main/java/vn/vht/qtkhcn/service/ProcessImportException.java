package vn.vht.qtkhcn.service;

import java.util.List;

public class ProcessImportException extends RuntimeException {

    public enum Kind { VALIDATION, DEPLOYMENT }

    private final Kind kind;
    private final List<String> errors;
    private final String validationCode;

    public ProcessImportException(Kind kind, String message, List<String> errors) {
        super(message);
        this.kind = kind;
        this.errors = List.copyOf(errors);
        this.validationCode = null;
    }

    public ProcessImportException(Kind kind, String message, List<String> errors, Throwable cause) {
        super(message, cause);
        this.kind = kind;
        this.errors = List.copyOf(errors);
        this.validationCode = null;
    }

    public ProcessImportException(Kind kind, String message, List<String> errors, String validationCode) {
        super(message);
        this.kind = kind;
        this.errors = List.copyOf(errors);
        this.validationCode = validationCode;
    }

    public Kind getKind() {
        return kind;
    }

    public List<String> getErrors() {
        return errors;
    }

    public String getValidationCode() {
        return validationCode;
    }
}
