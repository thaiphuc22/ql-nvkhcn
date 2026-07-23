package vn.vht.qtkhcn.hoso.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

import java.io.ByteArrayOutputStream;
import java.util.Optional;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.pdmodel.PDPage;
import org.apache.pdfbox.pdmodel.PDPageContentStream;
import org.apache.pdfbox.pdmodel.font.PDType1Font;
import org.apache.pdfbox.pdmodel.font.Standard14Fonts;
import org.apache.poi.xwpf.usermodel.XWPFDocument;
import org.apache.poi.xwpf.usermodel.XWPFParagraph;
import org.apache.poi.xwpf.usermodel.XWPFRun;
import org.junit.jupiter.api.Test;
import org.springframework.core.io.ByteArrayResource;
import vn.vht.qtkhcn.hoso.domain.TaiLieu;

class DocumentTextExtractorTest {
    private final DocumentTextExtractor extractor = new DocumentTextExtractor();

    @Test
    void extractsTextFromPdf() throws Exception {
        Optional<String> text = extractor.extract(document("thuyet-minh.pdf", "PDF"),
                new ByteArrayResource(buildPdf("Noi dung thuyet minh de tai.")));

        assertTrue(text.isPresent());
        assertTrue(text.get().contains("Noi dung thuyet minh de tai."));
    }

    @Test
    void extractsTextFromDocx() throws Exception {
        Optional<String> text = extractor.extract(document("bao-cao.docx", "File"),
                new ByteArrayResource(buildDocx("Bao cao tien do.")));

        assertTrue(text.isPresent());
        assertTrue(text.get().contains("Bao cao tien do."));
    }

    @Test
    void extractsPlainTextForCsvAndTxt() {
        Optional<String> text = extractor.extract(document("du-lieu.csv", "Excel"),
                new ByteArrayResource("a,b,c".getBytes()));

        assertEquals(Optional.of("a,b,c"), text);
    }

    @Test
    void extractsPlainTextForMarkdown() {
        Optional<String> text = extractor.extract(document("brd_v1.0_theo_template.md", "File"),
                new ByteArrayResource("# BRD\n\nNoi dung yeu cau nghiep vu.".getBytes()));

        assertEquals(Optional.of("# BRD\n\nNoi dung yeu cau nghiep vu."), text);
    }

    @Test
    void skipsArchiveAndImageWithoutError() {
        assertEquals(Optional.empty(),
                extractor.extract(document("nen.zip", "Archive"), new ByteArrayResource(new byte[] {1, 2, 3})));
        assertEquals(Optional.empty(),
                extractor.extract(document("anh.png", "Image"), new ByteArrayResource(new byte[] {1, 2, 3})));
    }

    @Test
    void returnsEmptyInsteadOfThrowingOnCorruptFile() {
        Optional<String> text = extractor.extract(document("hong.pdf", "PDF"),
                new ByteArrayResource("khong-phai-pdf".getBytes()));

        assertEquals(Optional.empty(), text);
    }

    private static TaiLieu document(String ten, String loai) {
        TaiLieu document = new TaiLieu();
        document.setTen(ten);
        document.setLoai(loai);
        return document;
    }

    private static byte[] buildPdf(String text) throws Exception {
        try (PDDocument pdf = new PDDocument(); ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            PDPage page = new PDPage();
            pdf.addPage(page);
            try (PDPageContentStream content = new PDPageContentStream(pdf, page)) {
                content.beginText();
                content.setFont(new PDType1Font(Standard14Fonts.FontName.HELVETICA), 12);
                content.newLineAtOffset(50, 700);
                content.showText(text);
                content.endText();
            }
            pdf.save(out);
            return out.toByteArray();
        }
    }

    private static byte[] buildDocx(String text) throws Exception {
        try (XWPFDocument doc = new XWPFDocument(); ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            XWPFParagraph paragraph = doc.createParagraph();
            XWPFRun run = paragraph.createRun();
            run.setText(text);
            doc.write(out);
            return out.toByteArray();
        }
    }
}
