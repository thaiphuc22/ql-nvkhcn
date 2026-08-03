from pathlib import Path
import sys

root = Path(__file__).resolve().parent
runtime = root.parent / "wbs_xlsx_20260717" / "pdf_runtime"
sys.path.insert(0, str(runtime))
import pypdfium2 as pdfium

preview_dir = root / "previews"
for pdf_path in sorted(preview_dir.glob("*.pdf")):
    pdf = pdfium.PdfDocument(str(pdf_path))
    page = pdf[0]
    bitmap = page.render(scale=1.5)
    bitmap.to_pil().save(preview_dir / f"{pdf_path.stem}.png")
    page.close()
    pdf.close()
