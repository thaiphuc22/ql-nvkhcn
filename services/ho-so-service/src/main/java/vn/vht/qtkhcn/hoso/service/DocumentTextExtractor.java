package vn.vht.qtkhcn.hoso.service;

import java.io.IOException;
import java.io.InputStream;
import java.nio.charset.StandardCharsets;
import java.util.Locale;
import java.util.Optional;
import org.apache.pdfbox.Loader;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.text.PDFTextStripper;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.ss.usermodel.Sheet;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.apache.poi.xwpf.extractor.XWPFWordExtractor;
import org.apache.poi.xwpf.usermodel.XWPFDocument;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.core.io.Resource;
import org.springframework.stereotype.Component;
import vn.vht.qtkhcn.hoso.domain.TaiLieu;

/**
 * Trích text thuần từ nội dung tệp đính kèm (PDF/Word .docx/Excel .xlsx/.csv/.txt/.md) để đưa vào
 * ngữ cảnh cho AI_Summarize. Archive/Image và định dạng nhị phân cũ (.doc/.xls) không hỗ trợ —
 * trả rỗng, KHÔNG ném lỗi: một tệp lỗi/không đọc được không được phép chặn cả tóm tắt AI, gọi nơi
 * dùng (AiSummaryService) chỉ bỏ qua tệp đó.
 */
@Component
public class DocumentTextExtractor {
    private static final Logger log = LoggerFactory.getLogger(DocumentTextExtractor.class);

    public Optional<String> extract(TaiLieu document, Resource resource) {
        String ten = document.getTen().toLowerCase(Locale.ROOT);
        try (InputStream input = resource.getInputStream()) {
            if ("PDF".equals(document.getLoai())) {
                return extractPdf(input);
            }
            if (ten.endsWith(".docx")) {
                return extractDocx(input);
            }
            if (ten.endsWith(".xlsx")) {
                return extractXlsx(input);
            }
            if (ten.endsWith(".csv") || ten.endsWith(".txt") || ten.endsWith(".md")) {
                return Optional.of(new String(input.readAllBytes(), StandardCharsets.UTF_8));
            }
            return Optional.empty();
        } catch (Exception e) {
            log.warn("Khong trich xuat duoc noi dung tep '{}': {}", document.getTen(), e.getMessage());
            return Optional.empty();
        }
    }

    private static Optional<String> extractPdf(InputStream input) throws IOException {
        try (PDDocument pdf = Loader.loadPDF(input.readAllBytes())) {
            return Optional.of(new PDFTextStripper().getText(pdf));
        }
    }

    private static Optional<String> extractDocx(InputStream input) throws IOException {
        try (XWPFDocument doc = new XWPFDocument(input); XWPFWordExtractor extractor = new XWPFWordExtractor(doc)) {
            return Optional.of(extractor.getText());
        }
    }

    private static Optional<String> extractXlsx(InputStream input) throws IOException {
        StringBuilder sb = new StringBuilder();
        try (XSSFWorkbook workbook = new XSSFWorkbook(input)) {
            for (int s = 0; s < workbook.getNumberOfSheets(); s++) {
                Sheet sheet = workbook.getSheetAt(s);
                for (Row row : sheet) {
                    for (org.apache.poi.ss.usermodel.Cell cell : row) {
                        sb.append(cell.toString()).append(' ');
                    }
                    sb.append('\n');
                }
            }
        }
        return Optional.of(sb.toString());
    }
}
