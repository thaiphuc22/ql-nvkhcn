package vn.vht.qtkhcn.web;

import jakarta.persistence.EntityNotFoundException;
import java.util.NoSuchElementException;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.web.multipart.MaxUploadSizeExceededException;
import org.springframework.dao.OptimisticLockingFailureException;
import org.springframework.dao.DataIntegrityViolationException;
import vn.vht.qtkhcn.service.DmnRuleConflictException;
import vn.vht.qtkhcn.service.DmnValidationException;
import vn.vht.qtkhcn.service.DraftRevisionConflictException;
import vn.vht.qtkhcn.service.ProcessImportException;
import vn.vht.qtkhcn.camunda.DmnCamundaException;
import vn.vht.qtkhcn.service.ActionStudioConflictException;
import vn.vht.qtkhcn.service.ApprovalMatrixConflictException;
import vn.vht.qtkhcn.service.EformConflictException;
import vn.vht.qtkhcn.service.IntegrationConflictException;
import vn.vht.qtkhcn.service.WorkflowStartException;
import vn.vht.qtkhcn.service.TaskActionException;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(TaskActionException.class)
    public ResponseEntity<InternalErrorBody> taskAction(TaskActionException e) {
        return ResponseEntity.status(e.getStatus())
                .body(new InternalErrorBody(e.getCode(), e.getMessage(), null, List.of()));
    }

    @ExceptionHandler(WorkflowStartException.class)
    public ResponseEntity<InternalErrorBody> workflowStart(WorkflowStartException e) {
        return ResponseEntity.status(e.getStatus())
                .body(new InternalErrorBody(e.getCode(), e.getMessage(), null, List.of()));
    }

    @ExceptionHandler({NoSuchElementException.class, EntityNotFoundException.class})
    public ResponseEntity<ErrorBody> notFound(RuntimeException e) {
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(new ErrorBody(e.getMessage()));
    }

    @ExceptionHandler(IllegalStateException.class)
    public ResponseEntity<ErrorBody> conflict(IllegalStateException e) {
        return ResponseEntity.status(HttpStatus.CONFLICT).body(new ErrorBody(e.getMessage()));
    }

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<ErrorBody> badRequest(IllegalArgumentException e) {
        return ResponseEntity.badRequest().body(new ErrorBody(e.getMessage()));
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<RequestErrorBody> invalidRequest(MethodArgumentNotValidException e) {
        List<String> errors = e.getBindingResult().getFieldErrors().stream()
                .map(error -> error.getField() + ": " + error.getDefaultMessage())
                .toList();
        return ResponseEntity.badRequest().body(new RequestErrorBody("Request không hợp lệ.", errors));
    }

    @ExceptionHandler(HttpMessageNotReadableException.class)
    public ResponseEntity<RequestErrorBody> malformedJson(HttpMessageNotReadableException e) {
        return ResponseEntity.badRequest().body(new RequestErrorBody("JSON request không hợp lệ.",
                List.of("Kiểm tra kiểu dữ liệu và cấu trúc JSON; variables phải là một object.")));
    }

    @ExceptionHandler({DraftRevisionConflictException.class, OptimisticLockingFailureException.class})
    public ResponseEntity<ErrorBody> optimisticConflict(RuntimeException e) {
        return ResponseEntity.status(HttpStatus.CONFLICT).body(new ErrorBody(e.getMessage()));
    }

    @ExceptionHandler(DmnRuleConflictException.class)
    public ResponseEntity<ErrorBody> dmnConflict(DmnRuleConflictException e) {
        return ResponseEntity.status(HttpStatus.CONFLICT).body(new ErrorBody(e.getMessage()));
    }

    @ExceptionHandler(ActionStudioConflictException.class)
    public ResponseEntity<ErrorBody> actionStudioConflict(ActionStudioConflictException e) {
        return ResponseEntity.status(HttpStatus.CONFLICT).body(new ErrorBody(e.getMessage()));
    }

    @ExceptionHandler(ApprovalMatrixConflictException.class)
    public ResponseEntity<ErrorBody> approvalMatrixConflict(ApprovalMatrixConflictException e) {
        return ResponseEntity.status(HttpStatus.CONFLICT).body(new ErrorBody(e.getMessage()));
    }

    @ExceptionHandler(EformConflictException.class)
    public ResponseEntity<ErrorBody> eformConflict(EformConflictException e) {
        return ResponseEntity.status(HttpStatus.CONFLICT).body(new ErrorBody(e.getMessage()));
    }

    @ExceptionHandler(IntegrationConflictException.class)
    public ResponseEntity<ErrorBody> integrationConflict(IntegrationConflictException e) {
        return ResponseEntity.status(HttpStatus.CONFLICT).body(new ErrorBody(e.getMessage()));
    }

    @ExceptionHandler(DmnValidationException.class)
    public ResponseEntity<ImportErrorBody> invalidDmn(DmnValidationException e) {
        return ResponseEntity.badRequest().body(new ImportErrorBody(e.getMessage(), e.getErrors()));
    }

    @ExceptionHandler(DmnCamundaException.class)
    public ResponseEntity<ImportErrorBody> dmnCamunda(DmnCamundaException e) {
        return ResponseEntity.unprocessableEntity()
                .body(new ImportErrorBody(e.getMessage(),
                        List.of(e.getDetail() == null ? "Camunda không trả chi tiết lỗi." : e.getDetail())));
    }

    @ExceptionHandler(DataIntegrityViolationException.class)
    public ResponseEntity<ErrorBody> dataConflict(DataIntegrityViolationException e) {
        return ResponseEntity.status(HttpStatus.CONFLICT)
                .body(new ErrorBody("Dữ liệu đã tồn tại hoặc vi phạm ràng buộc phiên bản."));
    }

    @ExceptionHandler(UnsupportedOperationException.class)
    public ResponseEntity<ErrorBody> notImplemented(UnsupportedOperationException e) {
        return ResponseEntity.status(HttpStatus.NOT_IMPLEMENTED).body(new ErrorBody(e.getMessage()));
    }

    @ExceptionHandler(ProcessImportException.class)
    public ResponseEntity<ImportErrorBody> processImport(ProcessImportException e) {
        HttpStatus status = e.getKind() == ProcessImportException.Kind.VALIDATION
                ? HttpStatus.BAD_REQUEST : HttpStatus.UNPROCESSABLE_ENTITY;
        return ResponseEntity.status(status).body(new ImportErrorBody(e.getMessage(), e.getErrors()));
    }

    @ExceptionHandler(MaxUploadSizeExceededException.class)
    public ResponseEntity<ImportErrorBody> uploadTooLarge(MaxUploadSizeExceededException e) {
        return ResponseEntity.status(HttpStatus.PAYLOAD_TOO_LARGE)
                .body(new ImportErrorBody("File BPMN vượt giới hạn upload.",
                        List.of("Giới hạn hiện tại là 5 MB.")));
    }

    public record ErrorBody(String message) {
    }

    public record ImportErrorBody(String message, List<String> errors) {
    }

    public record RequestErrorBody(String message, List<String> errors) {
    }

    public record InternalErrorBody(String code, String message, String correlationId, List<String> details) {
    }
}
