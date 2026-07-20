package vn.vht.qtkhcn.service;

import com.fasterxml.jackson.databind.JsonNode;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import org.springframework.stereotype.Component;
import vn.vht.qtkhcn.web.dto.ResolveApprovalResponse.DelegationAppliedResponse;
import vn.vht.qtkhcn.web.dto.ResolveApprovalResponse.ResolvedApproverResponse;

@Component
public class ApprovalDirectory {
    private static final Set<String> USERS = Set.of(
            "U-001", "U-002", "U-003", "U-004", "U-005", "U-006", "U-007",
            "U-008", "U-009", "U-010", "U-011", "U-012", "U-013");
    private static final Map<String, List<String>> ROLE_USERS = roleUsers();

    public Resolution resolve(JsonNode assignment, LocalDate at) {
        String mode = assignment.path("mode").asText();
        List<ResolvedApproverResponse> out = new ArrayList<>();
        List<String> warnings = new ArrayList<>();
        List<DelegationAppliedResponse> delegations = new ArrayList<>();
        Set<String> seen = new LinkedHashSet<>();

        for (JsonNode target : assignment.path("targets")) {
            String type = target.path("type").asText();
            if ("GROUP".equals(type)) {
                for (JsonNode codeNode : target.path("roleCodes")) {
                    String code = codeNode.asText();
                    List<String> users = ROLE_USERS.getOrDefault(code, List.of());
                    if (users.isEmpty()) {
                        String id = "__missing_" + code;
                        add(out, seen, new ResolvedApproverResponse(id, code, type, true, null, null));
                        warnings.add("Nhóm \"" + code + "\" chưa có thành viên.");
                    } else {
                        for (String user : users) addUser(out, seen, delegations, user, code, type, at);
                    }
                }
            } else if ("USER".equals(type)) {
                for (JsonNode userNode : target.path("userIds")) {
                    String user = userNode.asText();
                    if (USERS.contains(user)) addUser(out, seen, delegations, user, null, type, at);
                    else warnings.add("Không tìm thấy người dùng " + user + ".");
                }
            } else {
                String key = switch (type) {
                    case "ORG_POSITION" -> target.path("positionCode").asText("unknown");
                    case "COUNCIL" -> target.path("councilType").asText("unknown");
                    case "EXPRESSION" -> Integer.toHexString(target.path("expression").asText().hashCode());
                    default -> "unknown";
                };
                add(out, seen, new ResolvedApproverResponse("__placeholder_" + type + "_" + key,
                        null, type, true, null, null));
                warnings.add("Đích " + type + " chưa có nguồn dữ liệu chính thức; trả placeholder.");
            }
        }
        return new Resolution(mode, out, warnings, delegations);
    }

    private static void addUser(List<ResolvedApproverResponse> out, Set<String> seen,
            List<DelegationAppliedResponse> delegations, String user, String role, String type,
            LocalDate at) {
        if ("U-007".equals(user) && !at.isBefore(LocalDate.of(2026, 7, 1))
                && !at.isAfter(LocalDate.of(2026, 7, 15))) {
            String reason = "TGĐ đi công tác — uỷ quyền Phó TGĐ Chuyên trách";
            add(out, seen, new ResolvedApproverResponse("U-005", role, type, false, user, reason));
            if (delegations.stream().noneMatch(item -> item.fromUserId().equals(user))) {
                delegations.add(new DelegationAppliedResponse(user, "U-005", reason));
            }
        } else {
            add(out, seen, new ResolvedApproverResponse(user, role, type, false, null, null));
        }
    }

    private static void add(List<ResolvedApproverResponse> out, Set<String> seen,
            ResolvedApproverResponse item) {
        if (seen.add(item.userId())) out.add(item);
    }

    private static Map<String, List<String>> roleUsers() {
        Map<String, List<String>> map = new LinkedHashMap<>();
        put(map, "PM", "U-004"); put(map, "PA", "U-004"); put(map, "NNC", "U-004");
        put(map, "BGD_TT", "U-002"); put(map, "BGD_KHOI", "U-002");
        put(map, "CQ_KHCN", "U-003"); put(map, "CQ_MS", "U-003");
        put(map, "CQ_NS", "U-003"); put(map, "CQ_TCKT", "U-003");
        put(map, "CQ_QLKHCN", "U-006");
        put(map, "TP_CLKHCN", "U-008"); put(map, "TP_TCKT", "U-008");
        put(map, "TP_NS", "U-008"); put(map, "GD_TTMS", "U-008");
        put(map, "PTGD_CT", "U-005"); put(map, "TGD_VHT", "U-007");
        for (String code : List.of("HDKHCN", "HDXD", "HDXD_DC", "HDNT", "HD_DGHT")) put(map, code, "U-009");
        put(map, "CQ_KHCN_TD", "U-010"); put(map, "CQNV_TD", "U-011");
        for (String code : List.of("HDKHCN_TD", "HDXD_TD", "HDNT_TD")) put(map, code, "U-012");
        put(map, "BTGD_TD", "U-013");
        return Map.copyOf(map);
    }

    private static void put(Map<String, List<String>> map, String role, String user) {
        map.put(role, List.of(user));
    }

    public record Resolution(String mode, List<ResolvedApproverResponse> approvers,
            List<String> warnings, List<DelegationAppliedResponse> delegations) {
    }
}
