"""Extract PDF and image content into LLM-friendly Markdown, JSON, or text."""

from __future__ import annotations

import argparse
import os
import sys
from pathlib import Path
from typing import Iterable

# Prefer the repo-local OCR languages installed by the setup instructions.
LOCAL_TESSDATA = Path(__file__).with_name(".tessdata")
if LOCAL_TESSDATA.is_dir():
    os.environ["TESSDATA_PREFIX"] = str(LOCAL_TESSDATA)

# Activate PyMuPDF Layout before importing pymupdf4llm. Import order is significant.
import pymupdf.layout
import pymupdf
import pymupdf4llm


SUPPORTED_EXTENSIONS = {
    ".pdf",
    ".png",
    ".jpg",
    ".jpeg",
    ".tif",
    ".tiff",
    ".bmp",
}


def input_files(path: Path, recursive: bool) -> Iterable[Path]:
    if path.is_file():
        if path.suffix.lower() not in SUPPORTED_EXTENSIONS:
            raise ValueError(f"Unsupported file type: {path.suffix or '(none)'}")
        yield path
        return

    if not path.is_dir():
        raise FileNotFoundError(f"Input does not exist: {path}")

    iterator = path.rglob("*") if recursive else path.glob("*")
    yield from sorted(
        item
        for item in iterator
        if item.is_file() and item.suffix.lower() in SUPPORTED_EXTENSIONS
    )


def apply_tesseract_ocr(page: pymupdf.Page, language: str, dpi: int = 300, pixmap=None) -> None:
    """Add a searchable Tesseract text layer to a page in place."""
    pix = pixmap or page.get_pixmap(dpi=dpi)
    pdf_data = pix.pdfocr_tobytes(language=language, tessdata=pymupdf.get_tessdata())
    ocr_document = pymupdf.open("pdf", pdf_data)
    ocr_page = ocr_document[0]
    ocr_page.add_redact_annot(ocr_page.rect)
    ocr_page.apply_redactions(
        images=pymupdf.PDF_REDACT_IMAGE_REMOVE,
        graphics=pymupdf.PDF_REDACT_LINE_ART_NONE,
        text=pymupdf.PDF_REDACT_TEXT_NONE,
    )
    page.show_pdf_page(page.rect, ocr_document, 0)
    ocr_document.close()


def extract(source: Path, output_format: str, language: str, force_ocr: bool) -> str:
    document = None
    input_document: str | pymupdf.Document = str(source)
    if source.suffix.lower() != ".pdf":
        image_document = pymupdf.open(source)
        document = pymupdf.open("pdf", image_document.convert_to_pdf())
        image_document.close()
        input_document = document

    options = {
        "ocr_language": language,
        "force_ocr": force_ocr,
        "show_progress": True,
    }
    if force_ocr:
        options["ocr_function"] = lambda page, **kwargs: apply_tesseract_ocr(
            page, language, **kwargs
        )
    try:
        if output_format == "markdown":
            return pymupdf4llm.to_markdown(input_document, **options)
        if output_format == "json":
            return pymupdf4llm.to_json(input_document, **options)
        return pymupdf4llm.to_text(input_document, **options)
    finally:
        if document is not None:
            document.close()


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Read PDF/image files and export their content with PyMuPDF4LLM."
    )
    parser.add_argument("input", type=Path, help="A PDF/image file or a directory")
    parser.add_argument(
        "-o", "--output", type=Path, default=Path("extracted"), help="Output directory"
    )
    parser.add_argument(
        "-f",
        "--format",
        choices=("markdown", "json", "text"),
        default="markdown",
        help="Output format (default: markdown)",
    )
    parser.add_argument(
        "--language", default="vie+eng", help="OCR language code(s) (default: vie+eng)"
    )
    parser.add_argument(
        "--force-ocr", action="store_true", help="OCR every page, including PDFs with text"
    )
    parser.add_argument("-r", "--recursive", action="store_true", help="Scan subdirectories")
    return parser.parse_args()


def main() -> int:
    # Windows PowerShell commonly uses a legacy code page; document paths are UTF-8.
    if hasattr(sys.stdout, "reconfigure"):
        sys.stdout.reconfigure(encoding="utf-8", errors="replace")
        sys.stderr.reconfigure(encoding="utf-8", errors="replace")

    args = parse_args()
    source_root = args.input.resolve()
    output_root = args.output.resolve()
    suffix = {"markdown": ".md", "json": ".json", "text": ".txt"}[args.format]

    try:
        files = list(input_files(source_root, args.recursive))
    except (FileNotFoundError, ValueError) as exc:
        print(f"Error: {exc}", file=sys.stderr)
        return 2

    if not files:
        print("No supported PDF or image files found.", file=sys.stderr)
        return 2

    output_root.mkdir(parents=True, exist_ok=True)
    failures = 0
    for source in files:
        relative = source.name if source_root.is_file() else source.relative_to(source_root)
        destination = (output_root / relative).with_suffix(suffix)
        destination.parent.mkdir(parents=True, exist_ok=True)
        try:
            content = extract(source, args.format, args.language, args.force_ocr)
            destination.write_text(content, encoding="utf-8")
            print(f"OK  {source} -> {destination}")
        except Exception as exc:  # continue a directory batch when one file is malformed
            failures += 1
            print(f"ERR {source}: {exc}", file=sys.stderr)

    return 1 if failures else 0


if __name__ == "__main__":
    raise SystemExit(main())
