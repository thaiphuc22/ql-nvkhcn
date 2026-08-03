package vn.vht.qtkhcn.service;

import java.util.List;

public class DmnValidationException extends RuntimeException {
    private final List<String> errors;

    public DmnValidationException(String message, List<String> errors) {
        super(message);
        this.errors = List.copyOf(errors);
    }

    public List<String> getErrors() {
        return errors;
    }
}

