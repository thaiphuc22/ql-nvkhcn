package vn.vht.qtkhcn.service;

import java.io.StringReader;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.HexFormat;
import java.util.List;
import javax.xml.XMLConstants;
import javax.xml.parsers.DocumentBuilderFactory;
import javax.xml.parsers.ParserConfigurationException;
import org.springframework.stereotype.Component;
import org.xml.sax.InputSource;

@Component
public class DmnArtifactValidator {
    public String validateAndChecksum(String xml) {
        try {
            DocumentBuilderFactory factory = secureFactory();
            var document = factory.newDocumentBuilder().parse(new InputSource(new StringReader(xml)));
            var root = document.getDocumentElement();
            String namespace = root.getNamespaceURI();
            if (!"definitions".equals(root.getLocalName())
                    || namespace == null
                    || !namespace.contains("/DMN/")) {
                throw invalid("Phần tử gốc phải là DMN definitions với namespace OMG DMN.");
            }
            if (document.getElementsByTagNameNS("*", "decision").getLength() == 0) {
                throw invalid("DMN phải chứa ít nhất một decision.");
            }
            if (document.getElementsByTagNameNS("*", "decisionTable").getLength() == 0) {
                throw invalid("DMN phải chứa ít nhất một decisionTable.");
            }
            return checksum(xml);
        } catch (DmnValidationException e) {
            throw e;
        } catch (Exception e) {
            throw new DmnValidationException("DMN XML không hợp lệ.",
                    List.of("Không thể parse DMN XML an toàn: " + safeMessage(e)));
        }
    }

    private static DocumentBuilderFactory secureFactory() throws ParserConfigurationException {
        DocumentBuilderFactory factory = DocumentBuilderFactory.newInstance();
        factory.setNamespaceAware(true);
        factory.setXIncludeAware(false);
        factory.setExpandEntityReferences(false);
        factory.setFeature("http://apache.org/xml/features/disallow-doctype-decl", true);
        factory.setFeature("http://xml.org/sax/features/external-general-entities", false);
        factory.setFeature("http://xml.org/sax/features/external-parameter-entities", false);
        factory.setFeature("http://apache.org/xml/features/nonvalidating/load-external-dtd", false);
        factory.setAttribute(XMLConstants.ACCESS_EXTERNAL_DTD, "");
        factory.setAttribute(XMLConstants.ACCESS_EXTERNAL_SCHEMA, "");
        return factory;
    }

    public static String checksum(String xml) {
        try {
            return HexFormat.of().formatHex(
                    MessageDigest.getInstance("SHA-256").digest(xml.getBytes(StandardCharsets.UTF_8)));
        } catch (NoSuchAlgorithmException e) {
            throw new IllegalStateException("JVM không hỗ trợ SHA-256.", e);
        }
    }

    private static DmnValidationException invalid(String error) {
        return new DmnValidationException("DMN XML không hợp lệ.", List.of(error));
    }

    private static String safeMessage(Exception e) {
        String message = e.getMessage();
        return message == null || message.isBlank() ? e.getClass().getSimpleName() : message;
    }
}

