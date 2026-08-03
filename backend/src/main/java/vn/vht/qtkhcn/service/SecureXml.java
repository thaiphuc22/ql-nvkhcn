package vn.vht.qtkhcn.service;

import java.io.ByteArrayInputStream;
import java.nio.charset.StandardCharsets;
import javax.xml.XMLConstants;
import javax.xml.parsers.DocumentBuilderFactory;
import org.w3c.dom.Document;

/**
 * Đọc lại BPMN ĐÃ nằm trong catalog (đã qua {@code ProcessDefinitionImportValidator} khi nhập) với
 * cấu hình parser tắt DTD/external entity.
 *
 * <p>Gom lại vì Lát 3 sẽ là chỗ thứ tư lặp nguyên khối cấu hình này. KHÔNG gom
 * {@code ProcessDefinitionImportValidator}: đó là cổng kiểm duyệt dữ liệu từ ngoài vào, nó cứng hơn
 * (có thêm EntityResolver ném lỗi và ErrorHandler biến warning thành lỗi) và không nên bị kéo theo
 * mỗi lần chỗ khác cần đọc XML.
 */
final class SecureXml {

    private SecureXml() {
    }

    static Document parse(String xml) throws Exception {
        return factory().newDocumentBuilder()
                .parse(new ByteArrayInputStream(xml.getBytes(StandardCharsets.UTF_8)));
    }

    static DocumentBuilderFactory factory() throws Exception {
        DocumentBuilderFactory factory = DocumentBuilderFactory.newInstance();
        factory.setNamespaceAware(true);
        factory.setFeature("http://apache.org/xml/features/disallow-doctype-decl", true);
        factory.setFeature("http://xml.org/sax/features/external-general-entities", false);
        factory.setFeature("http://xml.org/sax/features/external-parameter-entities", false);
        factory.setAttribute(XMLConstants.ACCESS_EXTERNAL_DTD, "");
        factory.setAttribute(XMLConstants.ACCESS_EXTERNAL_SCHEMA, "");
        return factory;
    }
}
