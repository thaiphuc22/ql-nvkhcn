#!/usr/bin/env python3
"""
doc_tool.py — Parse + Annotate tools for ba-doc-review skill.

Subcommands:
    parse     Parse .docx/.md/.txt → structured JSON
    annotate  Generate inline-annotated copy of doc with findings

Usage:
    python doc_tool.py parse <input> [--output <out.json>] [--verbose]
    python doc_tool.py annotate <input> <findings.json> [--output <out.md>]
    python doc_tool.py --help
    python doc_tool.py <command> --help

Dependencies:
    python-docx>=1.1.0   (only if parsing .docx; checked at runtime)
"""

import argparse
import json
import re
import sys
from pathlib import Path


# ─────────────────────────────────────────────────────────────────────────
# PARSE — Convert doc to structured JSON
# ─────────────────────────────────────────────────────────────────────────

def parse_docx(path: Path) -> dict:
    """Parse .docx file using python-docx. Returns structured dict."""
    try:
        from docx import Document
    except ImportError:
        print(
            "❌ Missing dependency: python-docx\n"
            "   Install: pip install python-docx>=1.1.0",
            file=sys.stderr,
        )
        sys.exit(2)

    doc = Document(path)
    sections = []
    current_section = {"heading": "_root", "level": 0, "paragraphs": [], "tables": []}

    for block in iter_block_items(doc):
        if block["type"] == "paragraph":
            para = block["data"]
            style = para.style.name if para.style else ""
            text = para.text.strip()
            if not text:
                continue
            if style.startswith("Heading"):
                # New section
                if current_section["paragraphs"] or current_section["tables"]:
                    sections.append(current_section)
                level = int(style.replace("Heading ", "")) if style[-1].isdigit() else 1
                current_section = {
                    "heading": text,
                    "level": level,
                    "paragraphs": [],
                    "tables": [],
                }
            else:
                current_section["paragraphs"].append(text)
        elif block["type"] == "table":
            current_section["tables"].append(block["data"])

    if current_section["paragraphs"] or current_section["tables"]:
        sections.append(current_section)

    return {
        "format": "docx",
        "source": str(path),
        "sections": sections,
        "total_paragraphs": sum(len(s["paragraphs"]) for s in sections),
        "total_tables": sum(len(s["tables"]) for s in sections),
    }


def iter_block_items(doc):
    """Yield paragraphs and tables in document order."""
    from docx.oxml.ns import qn
    from docx.table import Table
    from docx.text.paragraph import Paragraph

    parent = doc.element.body
    for child in parent.iterchildren():
        if child.tag == qn("w:p"):
            yield {"type": "paragraph", "data": Paragraph(child, doc)}
        elif child.tag == qn("w:tbl"):
            tbl = Table(child, doc)
            rows = []
            for row in tbl.rows:
                rows.append([cell.text.strip() for cell in row.cells])
            yield {"type": "table", "data": rows}


def parse_markdown(path: Path) -> dict:
    """Parse .md/.txt → structured JSON by heading hierarchy."""
    text = path.read_text(encoding="utf-8")
    lines = text.split("\n")

    sections = []
    current = {"heading": "_root", "level": 0, "lines": [], "line_start": 1}

    for i, line in enumerate(lines, start=1):
        m = re.match(r"^(#+)\s+(.+)$", line)
        if m:
            if current["lines"] or current["heading"] != "_root":
                current["line_end"] = i - 1
                sections.append(current)
            level = len(m.group(1))
            current = {
                "heading": m.group(2).strip(),
                "level": level,
                "lines": [],
                "line_start": i,
            }
        else:
            current["lines"].append(line)

    current["line_end"] = len(lines)
    if current["lines"] or current["heading"] != "_root":
        sections.append(current)

    return {
        "format": "markdown",
        "source": str(path),
        "sections": [
            {
                "heading": s["heading"],
                "level": s["level"],
                "content": "\n".join(s["lines"]).strip(),
                "line_start": s["line_start"],
                "line_end": s["line_end"],
            }
            for s in sections
        ],
        "total_lines": len(lines),
    }


def cmd_parse(args):
    path = Path(args.input)
    if not path.exists():
        print(f"❌ File not found: {path}", file=sys.stderr)
        sys.exit(1)

    suffix = path.suffix.lower()
    if suffix == ".docx":
        result = parse_docx(path)
    elif suffix in (".md", ".markdown", ".txt"):
        result = parse_markdown(path)
    else:
        print(f"❌ Unsupported format: {suffix}", file=sys.stderr)
        print("   Supported: .docx, .md, .markdown, .txt", file=sys.stderr)
        sys.exit(1)

    output = json.dumps(result, ensure_ascii=False, indent=2)
    if args.output:
        Path(args.output).write_text(output, encoding="utf-8")
        if args.verbose:
            print(f"✅ Parsed → {args.output}")
            print(f"   Sections: {len(result['sections'])}")
    else:
        print(output)


# ─────────────────────────────────────────────────────────────────────────
# ANNOTATE — Insert inline comments based on findings
# ─────────────────────────────────────────────────────────────────────────

def cmd_annotate(args):
    input_path = Path(args.input)
    findings_path = Path(args.findings)

    if not input_path.exists():
        print(f"❌ Input not found: {input_path}", file=sys.stderr)
        sys.exit(1)
    if not findings_path.exists():
        print(f"❌ Findings not found: {findings_path}", file=sys.stderr)
        sys.exit(1)

    findings = json.loads(findings_path.read_text(encoding="utf-8"))
    if not isinstance(findings, list):
        print("❌ findings.json must be a list of findings", file=sys.stderr)
        sys.exit(1)

    # Currently support only .md/.txt for annotation (in-place HTML comments).
    # .docx annotation requires more complex python-docx manipulation.
    suffix = input_path.suffix.lower()
    if suffix == ".docx":
        print(
            "⚠️  .docx annotation not yet supported. Convert to .md first:\n"
            "    python doc_tool.py parse <doc.docx> > parsed.json\n"
            "   Then export as .md manually.",
            file=sys.stderr,
        )
        sys.exit(2)
    if suffix not in (".md", ".markdown", ".txt"):
        print(f"❌ Unsupported format for annotate: {suffix}", file=sys.stderr)
        sys.exit(1)

    text = input_path.read_text(encoding="utf-8")
    lines = text.split("\n")

    # Group findings by line number
    by_line: dict[int, list] = {}
    for f in findings:
        line = f.get("line")
        if line is None:
            continue
        by_line.setdefault(line, []).append(f)

    # Insert HTML comment after each affected line
    out_lines = []
    severity_icon = {
        "critical": "🔴 CRITICAL",
        "major": "🟠 MAJOR",
        "minor": "🟡 MINOR",
        "info": "ℹ️ INFO",
    }
    for i, line in enumerate(lines, start=1):
        out_lines.append(line)
        if i in by_line:
            for f in by_line[i]:
                sev = severity_icon.get(f.get("severity", "info").lower(), "ℹ️")
                fid = f.get("id", "F???")
                issue = f.get("issue", "").replace("-->", "--&gt;")
                fix = f.get("suggested_fix", "").replace("-->", "--&gt;")
                comment = (
                    f"<!-- {sev} {fid}: {issue}\n"
                    f"     SUGGESTED FIX: {fix} -->"
                )
                out_lines.append(comment)

    # Write summary header
    summary = generate_summary_header(findings)
    output = summary + "\n\n" + "\n".join(out_lines)

    out_path = Path(args.output) if args.output else input_path.with_suffix(
        ".annotated" + input_path.suffix
    )
    out_path.write_text(output, encoding="utf-8")
    print(f"✅ Annotated → {out_path}")
    print(f"   Findings inserted: {sum(len(v) for v in by_line.values())}/{len(findings)}")
    if len(findings) - sum(len(v) for v in by_line.values()) > 0:
        skipped = len(findings) - sum(len(v) for v in by_line.values())
        print(f"   ⚠️  {skipped} findings skipped (no line number)")


def generate_summary_header(findings: list) -> str:
    counts = {"critical": 0, "major": 0, "minor": 0, "info": 0}
    for f in findings:
        sev = f.get("severity", "info").lower()
        if sev in counts:
            counts[sev] += 1

    score = max(0, 100 - counts["critical"] * 20 - counts["major"] * 5 - counts["minor"] * 1)
    grade = (
        "S" if score >= 95 else
        "A" if score >= 85 else
        "B" if score >= 70 else
        "C" if score >= 50 else
        "D" if score >= 30 else
        "F"
    )
    return (
        f"<!-- Annotated by ba-doc-review v1.0\n"
        f"     Score: {score}/100 — Grade {grade}\n"
        f"     🔴 Critical: {counts['critical']} | "
        f"🟠 Major: {counts['major']} | "
        f"🟡 Minor: {counts['minor']} | "
        f"ℹ️ Info: {counts['info']}\n"
        f"-->"
    )


# ─────────────────────────────────────────────────────────────────────────
# MAIN
# ─────────────────────────────────────────────────────────────────────────

def main():
    parser = argparse.ArgumentParser(
        description="Parse + Annotate tools for ba-doc-review skill",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog=__doc__,
    )
    sub = parser.add_subparsers(dest="command", required=True)

    # parse
    p_parse = sub.add_parser("parse", help="Parse doc → structured JSON")
    p_parse.add_argument("input", help="Path to .docx/.md/.txt file")
    p_parse.add_argument("-o", "--output", help="Output JSON file (default: stdout)")
    p_parse.add_argument("-v", "--verbose", action="store_true")
    p_parse.set_defaults(func=cmd_parse)

    # annotate
    p_ann = sub.add_parser("annotate", help="Insert inline comments from findings")
    p_ann.add_argument("input", help="Original doc (.md/.txt)")
    p_ann.add_argument("findings", help="findings.json from review")
    p_ann.add_argument("-o", "--output", help="Output annotated file")
    p_ann.set_defaults(func=cmd_annotate)

    args = parser.parse_args()
    args.func(args)


if __name__ == "__main__":
    main()
