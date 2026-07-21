package vn.vht.qtkhcn.hoso.web;

import jakarta.persistence.EntityNotFoundException;
import org.springframework.dao.OptimisticLockingFailureException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import vn.vht.qtkhcn.hoso.service.VersionConflictException;
import vn.vht.qtkhcn.hoso.service.WorkflowEventConflictException;
import vn.vht.qtkhcn.hoso.service.DocumentStorageException;
import org.springframework.web.multipart.MaxUploadSizeExceededException;
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

    @ExceptionHandler(MaxUploadSizeExceededException.class)
    public ResponseEntity<ErrorBody> uploadTooLarge(MaxUploadSizeExceededException exception) {
        return ResponseEntity.status(HttpStatus.PAYLOAD_TOO_LARGE)
                .body(new ErrorBody("Tep vuot qua gioi han dung luong cho phep."));
    }

    @ExceptionHandler(DocumentStorageException.class)
    public ResponseEntity<ErrorBody> storageFailure(DocumentStorageException exception) {
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(new ErrorBody(exception.getMessage()));
    }

    public record ErrorBody(String message) {
    }
}
