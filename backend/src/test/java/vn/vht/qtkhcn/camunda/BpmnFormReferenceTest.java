package vn.vht.qtkhcn.camunda;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNull;

import java.io.ByteArrayInputStream;
import java.nio.charset.StandardCharsets;
import javax.xml.parsers.DocumentBuilderFactory;
import org.junit.jupiter.api.Test;
import org.w3c.dom.Element;
import vn.vht.qtkhcn.camunda.BpmnFormReference.Kind;

class BpmnFormReferenceTest {

    /** Dạng các BPMN bundled của dự án đang dùng — khoá biểu mẫu của chính app. */
    @Test
    void formKeyThuongLaKhoaBieuMauCuaApp() {
        var reference = parse("<zeebe:formDefinition formKey=\"phieu-chu-truong\" />");

        assertEquals(Kind.APP, reference.kind());
        assertEquals("phieu-chu-truong", reference.formKey());
    }

    /** Khách bấm "Create new form" ngay trong Modeler ⇒ schema nằm trong chính BPMN. */
    @Test
    void formKeyCoTienToCamundaFormsLaFormNhung() {
        var reference = parse("<zeebe:formDefinition formKey=\"camunda-forms:bpmn:UserTaskForm_1\" />");

        assertEquals(Kind.EMBEDDED, reference.kind());
        assertEquals("UserTaskForm_1", reference.formKey());
    }

    /**
     * Chính là ca đã làm hỏng luồng: khách khai eForm trên Camunda rồi gắn vào task thì Modeler ghi
     * {@code formId}, mà hai reader runtime chỉ đọc {@code formKey} nên trả rỗng — bước không có
     * form, scaffold không ghim được gì, màn Chi tiết Hồ sơ bấm nút ra form trống.
     */
    @Test
    void formIdLaLinkedFormDeployRiengTrenEngine() {
        var reference = parse("<zeebe:formDefinition formId=\"approval-form\" />");

        assertEquals(Kind.LINKED, reference.kind());
        assertEquals("approval-form", reference.formKey());
    }

    /** Giữ nguyên văn: {@code eformRepository.findById} so khớp chính xác, id BPMN phân biệt hoa thường. */
    @Test
    void khongHaChuThuongIdCuaCamunda() {
        assertEquals("Don_Xin_PheDuyet", parse("<zeebe:formDefinition formId=\"Don_Xin_PheDuyet\" />").formKey());
    }

    /** Form ngoài Camunda — app không render được, trả null để không ai ghim nhầm vào luật hành động. */
    @Test
    void externalReferenceKhongCoKhoaBieuMau() {
        var reference = parse("<zeebe:formDefinition externalReference=\"https://forms.example.com/x\" />");

        assertEquals(Kind.EXTERNAL, reference.kind());
        assertNull(reference.formKey());
    }

    @Test
    void khongCoFormDefinitionThiKhongCoKhoa() {
        assertNull(BpmnFormReference.of(null).formKey());
        assertNull(parse("<zeebe:formDefinition />").formKey());
    }

    private static BpmnFormReference parse(String formDefinitionXml) {
        String xml = """
                <bpmn:definitions xmlns:bpmn="http://www.omg.org/spec/BPMN/20100524/MODEL"
                    xmlns:zeebe="http://camunda.org/schema/zeebe/1.0">%s</bpmn:definitions>
                """.formatted(formDefinitionXml);
        try {
            DocumentBuilderFactory factory = DocumentBuilderFactory.newInstance();
            factory.setNamespaceAware(true);
            var document = factory.newDocumentBuilder()
                    .parse(new ByteArrayInputStream(xml.getBytes(StandardCharsets.UTF_8)));
            var nodes = document.getElementsByTagNameNS("*", "formDefinition");
            return nodes.getLength() == 0 ? BpmnFormReference.NONE : BpmnFormReference.of((Element) nodes.item(0));
        } catch (Exception exception) {
            throw new IllegalStateException(exception);
        }
    }
}
