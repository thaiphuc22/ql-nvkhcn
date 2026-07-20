package vn.vht.qtkhcn.service;

import java.util.List;
import org.springframework.stereotype.Component;
import vn.vht.qtkhcn.web.dto.ActionStudioDtos.ProcessRoutingResponse;

@Component
public class ActionStudioRoutingCatalog {
    private final DeployedBpmnRoutingReader reader;

    public ActionStudioRoutingCatalog(DeployedBpmnRoutingReader reader) {
        this.reader = reader;
    }

    public List<ProcessRoutingResponse> processes() {
        return reader.processes();
    }

    public ProcessRoutingResponse require(String code) {
        return reader.require(code);
    }
}
