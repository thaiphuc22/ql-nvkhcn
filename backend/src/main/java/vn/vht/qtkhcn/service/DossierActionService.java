package vn.vht.qtkhcn.service;

import java.util.List;
import java.util.Map;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;
import vn.vht.qtkhcn.security.WorkflowDemoIdentityProvider;
import vn.vht.qtkhcn.web.dto.ActionStudioDtos.SimulatedActionResponse;
import vn.vht.qtkhcn.web.dto.ActionStudioDtos.SimulationRequest;
import vn.vht.qtkhcn.web.dto.DossierActionDtos.AvailableActionsResponse;
import vn.vht.qtkhcn.web.dto.DossierActionDtos.ExecuteActionRequest;
import vn.vht.qtkhcn.web.dto.DossierActionDtos.ExecuteActionResponse;

@Service
public class DossierActionService {
    private final RestClient dossiers;
    private final WorkflowDemoIdentityProvider identities;
    private final ActionStudioService studio;
    private final ActionStudioRoutingCatalog routing;

    public DossierActionService(WorkflowDemoIdentityProvider identities, ActionStudioService studio,
            ActionStudioRoutingCatalog routing,
            @Value("${qtkhcn.ho-so.base-url:http://127.0.0.1:8093}") String baseUrl,
            @Value("${qtkhcn.ho-so.service-token:}") String token) {
        this.identities = identities;
        this.studio = studio;
        this.routing = routing;
        this.dossiers = RestClient.builder().baseUrl(baseUrl)
                .defaultHeader(HttpHeaders.AUTHORIZATION, "Bearer " + token).build();
    }

    public AvailableActionsResponse available(String id, String userHeader) {
        var user = identities.resolve(userHeader);
        authorize(user);
        DossierView dossier = dossiers.get().uri("/api/ho-so/{id}", id).retrieve().body(DossierView.class);
        if (dossier == null) throw new TaskActionException("DOSSIER_NOT_FOUND", HttpStatus.NOT_FOUND, "Dossier not found.");
        if (!List.of("DRAFT", "START_FAILED").contains(dossier.trangThai()))
            return new AvailableActionsResponse(id, List.of());
        var context = Map.<String, Object>of("dossier", Map.of("id", id, "status", "draft",
                "docsComplete", dossier.taiLieu() != null && !dossier.taiLieu().isEmpty()),
                "user", user.roleCodes(), "currentStep", Map.of("candidateGroups", user.roleCodes()));
        String processCode = dossier.quyTrinh() == null ? null : dossier.quyTrinh().trim();
        var process = processCode == null || processCode.isEmpty() ? null : routing.require(processCode);
        String firstTask = process == null || process.steps().isEmpty() ? "__NO_TASK__" : process.steps().getFirst().key();
        List<SimulatedActionResponse> actions = studio.simulate(new SimulationRequest("DOSSIER_DETAIL",
                process == null ? "__UNASSIGNED__" : processCode, firstTask, "draft",
                List.copyOf(user.roleCodes()), List.copyOf(user.permissions()), user.administrator(),
                process == null ? null : process.processVersion(), context)).stream().filter(item -> "SUBMIT".equals(item.actionCode()))
                .filter(SimulatedActionResponse::visible).toList();
        return new AvailableActionsResponse(id, actions);
    }

    public ExecuteActionResponse execute(String id, ExecuteActionRequest request, String userHeader) {
        SimulatedActionResponse action = available(id, userHeader).actions().stream()
                .filter(item -> item.actionCode().equals(request.actionCode())).findFirst()
                .orElseThrow(() -> new TaskActionException("ACTION_FORBIDDEN", HttpStatus.FORBIDDEN, "Action is not available."));
        if (!action.enabled()) throw new TaskActionException("BUSINESS_CONDITION_FAILED", HttpStatus.CONFLICT,
                String.join(" ", action.reasons()));
        if (!action.policyId().equals(request.expectedPolicyId()) || !action.policyVersion().equals(request.expectedPolicyVersion()))
            throw new TaskActionException("ACTION_POLICY_CHANGED", HttpStatus.CONFLICT, "Action policy changed.");
        dossiers.post().uri("/api/ho-so/{id}/submit", id).header("X-QTKHCN-Actor", identities.resolve(userHeader).userId())
                .body(Map.of("quyTrinh", request.processCode(), "quyTrinhTen", request.processName())).retrieve().toBodilessEntity();
        return new ExecuteActionResponse(id, "ACCEPTED");
    }

    private static void authorize(vn.vht.qtkhcn.security.WorkflowDemoIdentity user) {
        if (!user.apps().contains("qlnvkhcn") || !user.hasFeaturePermission("DOSSIER", "VIEW_DETAIL"))
            throw new TaskActionException("FEATURE_FORBIDDEN", HttpStatus.FORBIDDEN, "Missing DOSSIER/VIEW_DETAIL.");
    }
    private record DossierView(String id, String quyTrinh, String trangThai, List<Object> taiLieu) {}
}
