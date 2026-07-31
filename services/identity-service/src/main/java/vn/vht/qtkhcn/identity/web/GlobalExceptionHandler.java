package vn.vht.qtkhcn.identity.web;
import jakarta.persistence.EntityNotFoundException; import java.util.stream.Collectors; import org.springframework.dao.DataIntegrityViolationException; import org.springframework.http.*; import org.springframework.web.bind.MethodArgumentNotValidException; import org.springframework.web.bind.annotation.*;
@RestControllerAdvice public class GlobalExceptionHandler { public record ErrorBody(String message){}
 @ExceptionHandler(EntityNotFoundException.class) ResponseEntity<ErrorBody> notFound(RuntimeException e){return ResponseEntity.status(404).body(new ErrorBody(e.getMessage()));}
 @ExceptionHandler({IllegalArgumentException.class,DataIntegrityViolationException.class}) ResponseEntity<ErrorBody> badRequest(RuntimeException e){return ResponseEntity.badRequest().body(new ErrorBody(e.getMessage()));}
 @ExceptionHandler(MethodArgumentNotValidException.class) ResponseEntity<ErrorBody> invalid(MethodArgumentNotValidException e){String m=e.getBindingResult().getFieldErrors().stream().map(x->x.getField()+" "+x.getDefaultMessage()).collect(Collectors.joining(", "));return ResponseEntity.badRequest().body(new ErrorBody(m));}
}
