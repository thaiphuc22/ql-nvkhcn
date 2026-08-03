from pathlib import Path
import sys

root = Path(__file__).resolve().parent
sys.path.insert(0, str(root / "pdf_runtime"))
import pypdfium2 as pdfium

preview_dir = root / "previews"
for pdf_path in sorted(preview_dir.glob("*.pdf")):
    pdf = pdfium.PdfDocument(str(pdf_path))
    page = pdf[0]
    bitmap = page.render(scale=1.6)
    bitmap.to_pil().save(preview_dir / f"{pdf_path.stem}.png")
    page.close()
    pdf.close()
