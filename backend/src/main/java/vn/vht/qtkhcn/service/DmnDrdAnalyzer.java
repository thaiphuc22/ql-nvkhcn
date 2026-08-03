package vn.vht.qtkhcn.service;

import java.io.StringReader;
import java.util.LinkedHashSet;
import java.util.Set;
import org.springframework.stereotype.Component;
import org.w3c.dom.Element;
import org.w3c.dom.NodeList;
import org.xml.sax.InputSource;

/**
 * Suy ra decision "gốc" (terminal) trong một DRD (Decision Requirements Diagram) nhiều decision
 * nối chuỗi. `io.camunda.client.api.response.Decision` không mang thông tin phụ thuộc chéo (xác
 * nhận qua javap trên jar client) nên phải tự parse lại đúng DMN XML vừa deploy.
 *
 * Terminal = mọi id decision KHÔNG bị decision nào khác tham chiếu qua
 * {@code <informationRequirement><requiredDecision href="#id"/></informationRequirement>}.
 */
@Component
public class DmnDrdAnalyzer {

    public Set<String> terminalDecisionIds(String dmnXml) {
        try {
            var document = DmnArtifactValidator.secureFactory().newDocumentBuilder()
                    .parse(new InputSource(new StringReader(dmnXml)));

            NodeList decisionNodes = document.getElementsByTagNameNS("*", "decision");
            Set<String> allIds = new LinkedHashSet<>();
            for (int i = 0; i < decisionNodes.getLength(); i++) {
                Element decision = (Element) decisionNodes.item(i);
                String id = decision.getAttribute("id");
                if (!id.isBlank()) allIds.add(id);
            }

            Set<String> requiredIds = new LinkedHashSet<>();
            NodeList requiredDecisionNodes = document.getElementsByTagNameNS("*", "requiredDecision");
            for (int i = 0; i < requiredDecisionNodes.getLength(); i++) {
                Element ref = (Element) requiredDecisionNodes.item(i);
                String href = ref.getAttribute("href");
                if (href.startsWith("#")) href = href.substring(1);
                if (!href.isBlank()) requiredIds.add(href);
            }

            Set<String> terminal = new LinkedHashSet<>(allIds);
            terminal.removeAll(requiredIds);
            if (terminal.isEmpty()) {
                throw new IllegalStateException(
                        "Không xác định được decision gốc — DRD có thể có chu trình phụ thuộc.");
            }
            return terminal;
        } catch (IllegalStateException e) {
            throw e;
        } catch (Exception e) {
            throw new IllegalStateException("Không thể phân tích cấu trúc DRD của DMN XML.", e);
        }
    }
}
