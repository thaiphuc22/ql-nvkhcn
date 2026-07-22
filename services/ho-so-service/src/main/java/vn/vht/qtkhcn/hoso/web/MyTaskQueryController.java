package vn.vht.qtkhcn.hoso.web;

import java.util.List;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RestController;
import vn.vht.qtkhcn.hoso.service.MyTaskQueryService;
import vn.vht.qtkhcn.hoso.security.DemoIdentityProvider;
import vn.vht.qtkhcn.hoso.web.dto.MyTaskResponse;

@RestController
public class MyTaskQueryController {

    public static final String USER_ID_HEADER = "X-QTKHCN-User-Id";
    private final MyTaskQueryService service;
    private final DemoIdentityProvider identities;

    public MyTaskQueryController(MyTaskQueryService service, DemoIdentityProvider identities) {
        this.service = service;
        this.identities = identities;
    }

    @GetMapping("/api/my-tasks")
    public List<MyTaskResponse> findMine(
            @RequestHeader(value = USER_ID_HEADER, required = false) String userId) {
        return service.findActiveTasks(identities.resolve(userId));
    }

    @GetMapping("/api/ho-so/{id}/active-task")
    public ResponseEntity<MyTaskResponse> findMineForHoSo(
            @PathVariable("id") String hoSoId,
            @RequestHeader(value = USER_ID_HEADER, required = false) String userId) {
        return service.findActiveTaskForHoSo(identities.resolve(userId), hoSoId)
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }
}
