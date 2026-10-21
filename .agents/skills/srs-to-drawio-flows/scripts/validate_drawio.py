from __future__ import annotations

import argparse
import html
import json
import re
import xml.etree.ElementTree as ET
from collections import Counter
from pathlib import Path

from generate_drawio import GENERIC_TITLES, LEVELS, clean, validate_manifest


MOJIBAKE_MARKERS = ("Quáº", "Há»", "Dá»", "Ä‘", "CÃ", "Æ°")


def plain(value: str) -> str:
    text = re.sub(r"<br\s*/?>", "\n", value or "", flags=re.IGNORECASE)
    text = re.sub(r"<[^>]+>", "", text)
    return html.unescape(text).replace("\xa0", " ").strip()


def expected_page_name(function: dict) -> str:
    return f"{clean(function['id'])} - {clean(function['title'])[:90]}"


def validate(drawio_path: Path, manifest: dict, level: str) -> dict:
    validate_manifest(manifest, [level])
    issues: list[str] = []
    totals = Counter()
    mxfile = ET.parse(drawio_path).getroot()
    diagrams = mxfile.findall("diagram")
    generated = [
        diagram
        for diagram in diagrams
        if diagram.attrib.get("srsGenerated") == "1"
        and diagram.attrib.get("srsLevel") == level
    ]
    functions = manifest["functions"]
    function_by_page = {expected_page_name(function): function for function in functions}

    if int(mxfile.attrib.get("pages", -1)) != len(diagrams):
        issues.append("mxfile pages attribute does not match actual page count")
    if len(generated) != len(functions):
        issues.append(
            f"expected {len(functions)} generated pages for {level}, found {len(generated)}"
        )
    if len({diagram.attrib.get("id") for diagram in diagrams}) != len(diagrams):
        issues.append("duplicate diagram ids")
    if len({diagram.attrib.get("name") for diagram in diagrams}) != len(diagrams):
        issues.append("duplicate diagram names")

    case_fingerprints: list[tuple[str, str]] = []
    for diagram in generated:
        name = clean(diagram.attrib.get("name"))
        function = function_by_page.get(name)
        if function is None:
            issues.append(f"{name}: page does not match a manifest function")
            continue
        cells = diagram.findall(".//mxCell")
        ids = [cell.attrib.get("id", "") for cell in cells]
        idset = set(ids)
        if len(ids) != len(idset):
            issues.append(f"{name}: duplicate cell ids")
        vertices = [cell for cell in cells if cell.attrib.get("vertex") == "1"]
        edges = [cell for cell in cells if cell.attrib.get("edge") == "1"]
        totals["vertices"] += len(vertices)
        totals["edges"] += len(edges)

        styles = "\n".join(cell.attrib.get("style", "") for cell in vertices)
        for required_style in (
            "fillColor=#FFFF33",
            "fillColor=#FFFFFF",
            "fillColor=#CCCCCC",
            "shape=process",
            "shape=mxgraph.flowchart.annotation_1",
        ):
            if required_style not in styles:
                issues.append(f"{name}: missing template style {required_style}")

        header_cells = [
            cell for cell in vertices if (cell.attrib.get("id") or "").endswith("_header")
        ]
        if len(header_cells) != 1:
            issues.append(f"{name}: expected exactly one visible header")
        else:
            header = plain(header_cells[0].attrib.get("value", ""))
            if header != clean(function["title"]):
                issues.append(f"{name}: header differs from function title: {header!r}")
            if re.match(r"^F\d+(?:\.\d+)?\s*[-–—:]", header, flags=re.IGNORECASE):
                issues.append(f"{name}: visible header contains an internal function id")
            if header.upper() in GENERIC_TITLES:
                issues.append(f"{name}: visible header is a generic category title")

        expected_fragments = (
            "_actor",
            "_process",
            "_data",
            "_d",
            "_success",
        )
        for fragment in expected_fragments:
            if not any(fragment in cell_id for cell_id in ids):
                issues.append(f"{name}: missing {fragment}")

        expected_steps = len(function["flow"][level]["steps"])
        step_nodes = [
            cell for cell in vertices if re.search(r"_step\d+$", cell.attrib.get("id", ""))
        ]
        if len(step_nodes) != expected_steps:
            issues.append(
                f"{name}: expected {expected_steps} step nodes, found {len(step_nodes)}"
            )

        expected_cases = len(function["flow"][level]["case_ids"])
        case_nodes = sorted(
            [
                cell
                for cell in vertices
                if re.search(r"_case\d+$", cell.attrib.get("id", ""))
            ],
            key=lambda cell: cell.attrib.get("id", ""),
        )
        if len(case_nodes) != expected_cases:
            issues.append(
                f"{name}: expected {expected_cases} case nodes, found {len(case_nodes)}"
            )
        case_fingerprints.append(
            (name, "|".join(plain(cell.attrib.get("value", "")) for cell in case_nodes))
        )

        case_map = {clean(case["id"]): case for case in function["cases"]}
        for index, case_id in enumerate(function["flow"][level]["case_ids"], 1):
            case = case_map[clean(case_id)]
            expected_text = clean(case["title"])
            if index <= len(case_nodes) and expected_text not in plain(
                case_nodes[index - 1].attrib.get("value", "")
            ):
                issues.append(f"{name}: case {index} title differs from manifest")

        if level == "detailed" and function.get("business_rules"):
            if not any((cell.attrib.get("id") or "").endswith("_rules_note") for cell in vertices):
                issues.append(f"{name}: missing detailed business-rule note")

        for edge in edges:
            edge_id = edge.attrib.get("id", "")
            source = edge.attrib.get("source", "")
            target = edge.attrib.get("target", "")
            style = edge.attrib.get("style", "")
            if source not in idset or target not in idset:
                issues.append(f"{name}: broken edge {edge_id}")
            if source.endswith("_bg") or target.endswith("_bg"):
                issues.append(f"{name}: edge attached to decorative background {edge_id}")
            if (
                "orthogonalEdgeStyle" not in style
                or "entryX=" not in style
                or "exitX=" not in style
            ):
                issues.append(f"{name}: unanchored/non-orthogonal edge {edge_id}")

        main_edges = [
            edge for edge in edges if "_main_e" in (edge.attrib.get("id") or "")
        ]
        if len(main_edges) != expected_steps + 1:
            issues.append(
                f"{name}: expected {expected_steps + 1} main edges, found {len(main_edges)}"
            )
        if any(
            "exitY=0.5" not in edge.attrib.get("style", "") for edge in main_edges
        ):
            issues.append(f"{name}: main flow is not horizontally centered")

        data_edges = [
            edge
            for edge in edges
            if (edge.attrib.get("id") or "").endswith("_data_edge")
        ]
        success_edges = [
            edge
            for edge in edges
            if (edge.attrib.get("id") or "").endswith("_success_edge")
        ]
        case_edges = [
            edge
            for edge in edges
            if re.search(r"_case\d+_edge$", edge.attrib.get("id", ""))
        ]
        if len(data_edges) != 1 or "exitY=1" not in data_edges[0].attrib.get(
            "style", ""
        ):
            issues.append(f"{name}: data edge is not one anchored vertical edge")
        if len(success_edges) != 1 or "exitY=1" not in success_edges[0].attrib.get(
            "style", ""
        ):
            issues.append(f"{name}: success edge is not one anchored vertical edge")
        if len(case_edges) != expected_cases:
            issues.append(
                f"{name}: expected {expected_cases} case edges, found {len(case_edges)}"
            )
        anchors = []
        for edge in case_edges:
            match = re.search(r"exitY=([0-9.]+)", edge.attrib.get("style", ""))
            anchors.append(match.group(1) if match else "")
        if len(anchors) != len(set(anchors)):
            issues.append(f"{name}: case edges do not use distinct anchors")

    fingerprint_counts = Counter(fingerprint for _, fingerprint in case_fingerprints)
    duplicate_pages = [
        name
        for name, fingerprint in case_fingerprints
        if fingerprint and fingerprint_counts[fingerprint] > 1
    ]
    if duplicate_pages:
        issues.append(
            "identical complete case sets reused across pages: "
            + ", ".join(duplicate_pages)
        )

    raw = drawio_path.read_text(encoding="utf-8")
    generated_text = "\n".join(
        cell.attrib.get("value", "")
        for diagram in generated
        for cell in diagram.findall(".//mxCell")
    )
    if re.search(
        r"TODO|\[đối tượng\]|\[tên bảng đối tượng\]",
        generated_text,
        flags=re.IGNORECASE,
    ):
        issues.append("placeholder text remains in generated pages")
    for marker in MOJIBAKE_MARKERS:
        if marker in raw:
            issues.append(f"mojibake marker detected: {marker}")

    return {
        "drawio": str(drawio_path),
        "level": level,
        "pages": len(diagrams),
        "generated_pages": len(generated),
        "vertices": totals["vertices"],
        "edges": totals["edges"],
        "issues": issues,
    }


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser()
    parser.add_argument("--drawio", required=True, type=Path)
    parser.add_argument("--manifest", required=True, type=Path)
    parser.add_argument("--level", required=True, choices=LEVELS)
    return parser.parse_args()


def main() -> None:
    args = parse_args()
    manifest = json.loads(args.manifest.read_text(encoding="utf-8"))
    result = validate(args.drawio, manifest, args.level)
    print(json.dumps(result, ensure_ascii=False, indent=2))
    raise SystemExit(1 if result["issues"] else 0)


if __name__ == "__main__":
    main()
