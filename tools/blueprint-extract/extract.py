#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""Trích blueprint VTS (.DOC/.docx/.xlsx/.xls) ra Markdown có neo truy vết.

Mục tiêu KHÔNG phải là bản Markdown đẹp, mà là bản **kiểm chứng được**: mỗi đoạn
văn, mỗi bảng, mỗi ảnh đều có một mã neo ổn định để trích dẫn trong Blueprint
Review Note, và người đọc mở file gốc Ctrl+F là ra.

Dùng:
    python tools/blueprint-extract/extract.py "<file hoặc thư mục>" [-o <thư mục đích>]

Mặc định đích: "BA/Blueprint Review/_extracted/<slug>/"

Đầu ra mỗi tài liệu Word:
    <slug>/noi-dung.md   toàn văn, có ¶số / §mục / Bảng N / [HÌNH nnn]
    <slug>/muc-luc.md    chỉ cây heading — dùng để đối chiếu độ phủ chức năng
    <slug>/img/hinh-NNN.png

Đầu ra mỗi file Excel:
    <slug>/<tên-sheet>.md   bảng markdown có đánh số dòng theo đúng dòng Excel

LƯU Ý stdout trên Windows: đặt PYTHONIOENCODING=utf-8 nếu không sẽ lỗi cp1252.
"""

import argparse
import os
import re
import sys
import unicodedata

NS_A = "http://schemas.openxmlformats.org/drawingml/2006/main"
NS_R = "http://schemas.openxmlformats.org/officeDocument/2006/relationships"
NS_V = "urn:schemas-microsoft-com:vml"
NS_W = "http://schemas.openxmlformats.org/wordprocessingml/2006/main"

HEADING_RE = re.compile(r"^(?:heading|đầu đề|tiêu đề)\s*(\d)", re.IGNORECASE)
NUMBER_PREFIX_RE = re.compile(r"^\s*(\d+(?:\.\d+)*)\.?\s+")


def slugify(text):
    text = unicodedata.normalize("NFD", text)
    text = "".join(c for c in text if unicodedata.category(c) != "Mn")
    text = text.replace("đ", "d").replace("Đ", "D")
    text = re.sub(r"[^A-Za-z0-9]+", "-", text).strip("-").lower()
    return re.sub(r"-{2,}", "-", text)[:60]


def heading_level(paragraph):
    """Trả về cấp heading (1..9) hoặc None. Bắt cả style tiếng Việt."""
    name = (paragraph.style.name or "") if paragraph.style is not None else ""
    m = HEADING_RE.match(name.strip())
    if m:
        return int(m.group(1))
    # Dự phòng: style tuỳ biến nhưng có outlineLvl trong pPr
    ppr = paragraph._p.find("{%s}pPr" % NS_W)
    if ppr is not None:
        lvl = ppr.find("{%s}outlineLvl" % NS_W)
        if lvl is not None:
            val = lvl.get("{%s}val" % NS_W)
            if val is not None and val.isdigit() and int(val) < 9:
                return int(val) + 1
    return None


def image_rids(element):
    """Mọi rId ảnh trong một element, theo thứ tự xuất hiện (DrawingML + VML)."""
    rids = []
    for blip in element.iter("{%s}blip" % NS_A):
        rid = blip.get("{%s}embed" % NS_R) or blip.get("{%s}link" % NS_R)
        if rid:
            rids.append(rid)
    for imagedata in element.iter("{%s}imagedata" % NS_V):
        rid = imagedata.get("{%s}id" % NS_R)
        if rid:
            rids.append(rid)
    return rids


class ImageDumper:
    """Đánh số ảnh theo thứ tự xuất hiện trong tài liệu và ghi ra đĩa."""

    def __init__(self, doc, outdir):
        self.doc = doc
        self.dir = os.path.join(outdir, "img")
        os.makedirs(self.dir, exist_ok=True)
        self.seen = {}          # rid -> số hình
        self.n = 0

    def emit(self, rid):
        """Trả về số hình cho rId; ghi file nếu là lần đầu gặp."""
        if rid in self.seen:
            return self.seen[rid]
        try:
            part = self.doc.part.related_parts[rid]
        except KeyError:
            return None
        self.n += 1
        ext = os.path.splitext(str(part.partname))[1] or ".png"
        name = "hinh-%03d%s" % (self.n, ext)
        with open(os.path.join(self.dir, name), "wb") as f:
            f.write(part.blob)
        self.seen[rid] = self.n
        return self.n

    def orphans(self):
        """Ảnh có trong rels nhưng không gặp khi duyệt thân tài liệu."""
        out = []
        for rid, rel in self.doc.part.rels.items():
            if "image" in rel.reltype and rid not in self.seen:
                num = self.emit(rid)
                if num:
                    out.append(num)
        return out


def cell_text(cell, dumper):
    parts = []
    for p in cell.paragraphs:
        t = p.text.strip()
        if t:
            parts.append(t)
    for rid in image_rids(cell._tc):
        num = dumper.emit(rid)
        if num:
            parts.append("[HÌNH %03d]" % num)
    return " <br> ".join(parts).replace("|", "\\|") or " "


def render_table(table, index, dumper):
    lines = ["", "**Bảng %d**" % index, ""]
    for r, row in enumerate(table.rows, start=1):
        cells = [cell_text(c, dumper) for c in row.cells]
        lines.append("| d%-2d | %s |" % (r, " | ".join(cells)))
        if r == 1:
            lines.append("|:---|" + "---|" * len(cells))
    lines.append("")
    return lines


def extract_docx(path, outroot):
    import docx
    from docx.table import Table
    from docx.text.paragraph import Paragraph

    doc = docx.Document(path)
    slug = slugify(os.path.splitext(os.path.basename(path))[0])
    outdir = os.path.join(outroot, slug)
    os.makedirs(outdir, exist_ok=True)
    dumper = ImageDumper(doc, outdir)

    body = ["<!-- Trích tự động từ: %s -->" % os.path.basename(path),
            "<!-- Neo trích dẫn: [%s §<mục> ¶<số đoạn>] -->" % slug.upper(), ""]
    toc = ["# Mục lục — %s" % os.path.basename(path), ""]

    counters = [0] * 9          # bộ đếm heading tự sinh theo cấp
    section = "~0"              # đường dẫn mục hiện hành
    para_no = 0
    table_no = 0

    for child in doc.element.body.iterchildren():
        tag = child.tag.split("}")[-1]

        if tag == "p":
            p = Paragraph(child, doc)
            para_no += 1
            text = p.text.strip()
            lvl = heading_level(p)

            if lvl and text:
                counters[lvl - 1] += 1
                for i in range(lvl, 9):
                    counters[i] = 0
                own = NUMBER_PREFIX_RE.match(text)
                if own:
                    # Blueprint tự đánh số -> dùng số của blueprint (kiểm chứng được)
                    section = own.group(1)
                else:
                    # Không có số -> số do script sinh, đánh dấu "~" để phân biệt
                    section = "~" + ".".join(str(c) for c in counters[:lvl])
                body.append("")
                body.append("%s §%s ¶%d — %s" % ("#" * min(lvl, 6), section, para_no, text))
                body.append("")
                toc.append("%s- §%s ¶%d — %s" % ("  " * (lvl - 1), section, para_no, text))
                continue

            rids = image_rids(child)
            marks = []
            for rid in rids:
                num = dumper.emit(rid)
                if num:
                    marks.append("[HÌNH %03d → img/hinh-%03d.png]" % (num, num))
            if text:
                body.append("`¶%d`  %s" % (para_no, text))
            for m in marks:
                body.append("`¶%d`  %s" % (para_no, m))

        elif tag == "tbl":
            table_no += 1
            body.extend(render_table(Table(child, doc), table_no, dumper))

    orphans = dumper.orphans()
    if orphans:
        body.append("")
        body.append("## Ảnh mồ côi (có trong file nhưng không nằm trong luồng văn bản)")
        body.append("")
        for num in orphans:
            body.append("- [HÌNH %03d → img/hinh-%03d.png]" % (num, num))

    with open(os.path.join(outdir, "noi-dung.md"), "w", encoding="utf-8") as f:
        f.write("\n".join(body) + "\n")
    with open(os.path.join(outdir, "muc-luc.md"), "w", encoding="utf-8") as f:
        f.write("\n".join(toc) + "\n")

    print("  %-40s ¶%-5d bảng %-3d hình %-4d -> %s"
          % (slug[:40], para_no, table_no, dumper.n, outdir))


def extract_excel(path, outroot):
    slug = slugify(os.path.splitext(os.path.basename(path))[0])
    outdir = os.path.join(outroot, slug)
    os.makedirs(outdir, exist_ok=True)
    ext = os.path.splitext(path)[1].lower()

    if ext == ".xls":
        import xlrd
        book = xlrd.open_workbook(path)
        sheets = [(s.name, [[s.cell_value(r, c) for c in range(s.ncols)]
                            for r in range(s.nrows)]) for s in book.sheets()]
    else:
        import openpyxl
        wb = openpyxl.load_workbook(path, data_only=True, read_only=True)
        sheets = [(ws.title, [list(row) for row in ws.iter_rows(values_only=True)])
                  for ws in wb.worksheets]

    for name, rows in sheets:
        if not rows:
            continue
        lines = ["<!-- %s :: sheet %s -->" % (os.path.basename(path), name),
                 "<!-- Neo: [%s#%s · dòng N · cột \"...\"] -->" % (slug.upper(), name), ""]
        width = max(len(r) for r in rows)
        for i, row in enumerate(rows, start=1):
            cells = [("" if v is None else str(v)).replace("|", "\\|").replace("\n", " <br> ")
                     for v in list(row) + [None] * (width - len(row))]
            lines.append("| d%-3d | %s |" % (i, " | ".join(cells)))
            if i == 1:
                lines.append("|:---|" + "---|" * width)
        with open(os.path.join(outdir, slugify(name) + ".md"), "w", encoding="utf-8") as f:
            f.write("\n".join(lines) + "\n")
    print("  %-40s %d sheet -> %s" % (slug[:40], len(sheets), outdir))


def main():
    ap = argparse.ArgumentParser(description=__doc__,
                                 formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("target", help="file hoặc thư mục blueprint")
    ap.add_argument("-o", "--out", default=os.path.join("BA", "Blueprint Review", "_extracted"))
    args = ap.parse_args()

    if os.path.isdir(args.target):
        files = []
        for root, _, names in os.walk(args.target):
            for n in names:
                if not n.startswith("~$"):
                    files.append(os.path.join(root, n))
    else:
        files = [args.target]

    word = {".doc", ".docx"}
    excel = {".xlsx", ".xls", ".xlsm"}
    done = skipped = failed = 0

    for path in sorted(files):
        ext = os.path.splitext(path)[1].lower()
        try:
            if ext in word:
                extract_docx(path, args.out)
            elif ext in excel:
                extract_excel(path, args.out)
            else:
                skipped += 1
                continue
            done += 1
        except Exception as e:
            failed += 1
            print("  FAIL %s :: %s: %s" % (os.path.basename(path), type(e).__name__, e))

    print("\nXong: %d trích, %d bỏ qua (không phải Word/Excel), %d lỗi" % (done, skipped, failed))
    return 1 if failed else 0


if __name__ == "__main__":
    sys.exit(main())
