package vn.vht.qtkhcn.hoso.web;

import java.util.List;
import org.springframework.web.bind.annotation.GetMapping;
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
}
