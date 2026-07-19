package vn.vht.qtkhcn.hoso.web;

import jakarta.persistence.EntityNotFoundException;
import org.springframework.dao.OptimisticLockingFailureException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import vn.vht.qtkhcn.hoso.service.VersionConflictException;
import vn.vht.qtkhcn.hoso.service.WorkflowEventConflictException;
import vn.vht.qtkhcn.hoso.security.UnknownDemoIdentityException;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(EntityNotFoundException.class)
    public ResponseEntity<ErrorBody> notFound(EntityNotFoundException exception) {
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(new ErrorBody(exception.getMessage()));
    }

    @ExceptionHandler(IllegalStateException.class)
    public ResponseEntity<ErrorBody> inconsistentProjection(IllegalStateException exception) {
        return ResponseEntity.status(HttpStatus.CONFLICT).body(new ErrorBody(exception.getMessage()));
    }

    @ExceptionHandler({VersionConflictException.class, WorkflowEventConflictException.class,
            OptimisticLockingFailureException.class})
    public ResponseEntity<ErrorBody> versionConflict(RuntimeException exception) {
        return ResponseEntity.status(HttpStatus.CONFLICT).body(new ErrorBody(exception.getMessage()));
    }

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<ErrorBody> invalidRequest(IllegalArgumentException exception) {
        return ResponseEntity.badRequest().body(new ErrorBody(exception.getMessage()));
    }

    @ExceptionHandler(UnknownDemoIdentityException.class)
    public ResponseEntity<ErrorBody> forbidden(UnknownDemoIdentityException exception) {
        return ResponseEntity.status(HttpStatus.FORBIDDEN).body(new ErrorBody(exception.getMessage()));
    }

    public record ErrorBody(String message) {
    }
}
