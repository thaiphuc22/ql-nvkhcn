from __future__ import annotations

import argparse
import html
import json
import re
import uuid
import xml.etree.ElementTree as ET
from pathlib import Path


STYLE_ACTOR = "rounded=0;whiteSpace=wrap;html=1;fontSize=16;fillColor=#FFFF33;strokeColor=default;"
STYLE_SYSTEM = "rounded=0;whiteSpace=wrap;html=1;fontSize=16;fillColor=#FFFFFF;strokeColor=default;"
STYLE_GATE = (
    "verticalLabelPosition=bottom;verticalAlign=top;html=1;shape=process;whiteSpace=wrap;"
    "rounded=1;size=0.14;arcSize=6;rotation=90;horizontal=0;fillColor=#FFFF33;"
    "fillStyle=auto;gradientColor=none;strokeColor=default;gradientDirection=south;"
    "shadow=0;perimeterSpacing=0;flipH=0;legacyAnchorPoints=0;flipV=0;"
)
STYLE_DATA = (
    "strokeWidth=2;html=1;shape=mxgraph.flowchart.annotation_1;align=left;"
    "pointerEvents=1;fillColor=#FFFF33;strokeColor=default;fontSize=16;whiteSpace=wrap;"
)
STYLE_D = (
    "rounded=0;whiteSpace=wrap;html=1;fillColor=#CCCCCC;"
    "strokeColor=default;fontSize=16;fontStyle=1;"
)
STYLE_HEADER = (
    "rounded=0;whiteSpace=wrap;html=1;fontSize=16;fontStyle=1;"
    "fillColor=#FFFFFF;strokeColor=default;align=left;spacingLeft=8;"
)
STYLE_NOTE = (
    "shape=note;strokeWidth=2;fontSize=14;size=20;whiteSpace=wrap;html=1;"
    "fillColor=#fff2cc;strokeColor=default;fontColor=#666600;"
    "verticalAlign=top;align=left;spacing=8;"
)
EDGE_RIGHT = (
    "endArrow=classic;html=1;rounded=0;edgeStyle=orthogonalEdgeStyle;"
    "orthogonalLoop=1;jettySize=auto;strokeColor=default;"
    "exitX=1;exitY=0.5;exitDx=0;exitDy=0;"
    "entryX=0;entryY=0.5;entryDx=0;entryDy=0;"
)
EDGE_DOWN = (
    "endArrow=classic;html=1;rounded=0;edgeStyle=orthogonalEdgeStyle;"
    "orthogonalLoop=1;jettySize=auto;strokeColor=default;"
    "exitX=0.5;exitY=1;exitDx=0;exitDy=0;"
    "entryX=0.5;entryY=0;entryDx=0;entryDy=0;"
)

LEVELS = ("simple", "medium", "detailed")
MIN_STEPS = {"simple": 1, "medium": 2, "detailed": 3}
MAX_STEPS = {"simple": 2, "medium": 3, "detailed": 4}
MIN_CASES = {"simple": 1, "medium": 2, "detailed": 3}
PLACEHOLDER_RE = re.compile(
    r"TODO|\[đối tượng\]|\[tên bảng đối tượng\]|cần điền",
    re.IGNORECASE,
)
GENERIC_TITLES = {
    "XEM BÁO CÁO / THỐNG KÊ",
    "XEM DANH SÁCH",
    "THÊM MỚI / CẬP NHẬT",
    "XEM CHI TIẾT",
}


def clean(value: object) -> str:
    return re.sub(r"\s+", " ", str(value or "")).strip()


def node_text(value: object) -> str:
    return html.escape(str(value or "")).replace("\n", "<br>")


def shorten(value: object, limit: int) -> str:
    text = clean(value)
    if len(text) <= limit:
        return text
    return text[: limit - 1].rstrip() + "…"


def edge_case(exit_y: float) -> str:
    return (
        "endArrow=classic;html=1;rounded=0;edgeStyle=orthogonalEdgeStyle;"
        "orthogonalLoop=1;jettySize=auto;strokeColor=default;"
        f"exitX=1;exitY={exit_y:.3f};exitDx=0;exitDy=0;"
        "entryX=0;entryY=0.5;entryDx=0;entryDy=0;"
    )


def add_vertex(
    root: ET.Element,
    cell_id: str,
    value: str,
    style: str,
    x: float,
    y: float,
    width: float,
    height: float,
) -> None:
    cell = ET.SubElement(
        root,
        "mxCell",
        {
            "id": cell_id,
            "value": value,
            "style": style,
            "vertex": "1",
            "parent": "1",
        },
    )
    ET.SubElement(
        cell,
        "mxGeometry",
        {
            "x": str(round(x, 2)),
            "y": str(round(y, 2)),
            "width": str(round(width, 2)),
            "height": str(round(height, 2)),
            "as": "geometry",
        },
    )


def add_edge(
    root: ET.Element,
    cell_id: str,
    source: str,
    target: str,
    style: str,
    value: str = "",
) -> None:
    cell = ET.SubElement(
        root,
        "mxCell",
        {
            "id": cell_id,
            "value": value,
            "style": style,
            "edge": "1",
            "parent": "1",
            "source": source,
            "target": target,
        },
    )
    ET.SubElement(cell, "mxGeometry", {"relative": "1", "as": "geometry"})


def process_box(
    root: ET.Element,
    cell_id: str,
    value: str,
    x: float,
    y: float,
    width: float,
    height: float,
) -> str:
    background_id = f"{cell_id}_bg"
    outer_height = height + 10
    add_vertex(
        root,
        background_id,
        "",
        STYLE_GATE,
        x + width / 2 - outer_height / 2,
        y + height / 2 - width / 2,
        outer_height,
        width,
    )
    add_vertex(root, cell_id, value, STYLE_SYSTEM, x, y, width, height)
    return cell_id


def data_box(
    root: ET.Element,
    prefix: str,
    lines: list[str],
    x: float,
    y: float,
    width: float,
    height: float,
) -> str:
    data_id = f"{prefix}_data"
    d_id = f"{prefix}_d"
    pad = "&nbsp;" * 8
    value = "<br>".join(node_text(line) for line in lines) or "Dữ liệu nghiệp vụ"
    add_vertex(root, data_id, pad + value.replace("<br>", "<br>" + pad), STYLE_DATA, x, y, width, height)
    add_vertex(root, d_id, "D", STYLE_D, x, y, 58, height)
    return data_id


def placeholder_paths(value: object, path: str = "$") -> list[str]:
    issues: list[str] = []
    if isinstance(value, dict):
        for key, child in value.items():
            issues.extend(placeholder_paths(child, f"{path}.{key}"))
    elif isinstance(value, list):
        for index, child in enumerate(value):
            issues.extend(placeholder_paths(child, f"{path}[{index}]"))
    elif isinstance(value, str) and PLACEHOLDER_RE.search(value):
        issues.append(path)
    return issues


def validate_manifest(manifest: dict, requested_levels: list[str]) -> None:
    issues: list[str] = []
    functions = manifest.get("functions")
    if not isinstance(functions, list) or not functions:
        issues.append("manifest.functions must be a non-empty list")
    else:
        ids = [clean(function.get("id")) for function in functions]
        titles = [clean(function.get("title")) for function in functions]
        if len(ids) != len(set(ids)):
            issues.append("function ids are not unique")
        if len(titles) != len(set(titles)):
            issues.append("function titles are not unique")
        for function in functions:
            fid = clean(function.get("id")) or "<missing-id>"
            title = clean(function.get("title"))
            if not title:
                issues.append(f"{fid}: missing title")
            if re.match(r"^F\d+(?:\.\d+)?\s*[-–—:]", title, flags=re.IGNORECASE):
                issues.append(f"{fid}: visible title contains an internal function id")
            if title.upper() in GENERIC_TITLES:
                issues.append(f"{fid}: visible title is a generic category title")
            if not clean(function.get("actor")):
                issues.append(f"{fid}: missing actor")
            if not function.get("source_refs"):
                issues.append(f"{fid}: missing source_refs")
            cases = function.get("cases") or []
            case_map = {clean(case.get("id")): case for case in cases}
            if len(case_map) != len(cases):
                issues.append(f"{fid}: case ids are missing or duplicated")
            for case in cases:
                case_id = clean(case.get("id")) or "<missing-case-id>"
                for field in ("title", "condition", "handling", "source"):
                    if not clean(case.get(field)):
                        issues.append(f"{fid}/{case_id}: missing {field}")
            flow = function.get("flow") or {}
            for level in requested_levels:
                level_flow = flow.get(level) or {}
                steps = level_flow.get("steps") or []
                case_ids = [clean(case_id) for case_id in level_flow.get("case_ids") or []]
                if not MIN_STEPS[level] <= len(steps) <= MAX_STEPS[level]:
                    issues.append(
                        f"{fid}/{level}: steps must contain {MIN_STEPS[level]}-{MAX_STEPS[level]} items"
                    )
                if len(case_ids) < MIN_CASES[level]:
                    issues.append(
                        f"{fid}/{level}: requires at least {MIN_CASES[level]} case ids"
                    )
                if len(case_ids) != len(set(case_ids)):
                    issues.append(f"{fid}/{level}: duplicate case ids")
                missing = [case_id for case_id in case_ids if case_id not in case_map]
                if missing:
                    issues.append(f"{fid}/{level}: unknown case ids {missing}")
                for field in ("process", "success"):
                    if not clean(level_flow.get(field)):
                        issues.append(f"{fid}/{level}: missing {field}")
    placeholders = placeholder_paths(manifest)
    if placeholders:
        issues.append("placeholders remain at: " + ", ".join(placeholders[:20]))
    if issues:
        raise ValueError("Manifest validation failed:\n- " + "\n- ".join(issues))


def case_value(case: dict, index: int, level: str) -> str:
    title = node_text(f"CASE {index} - {clean(case['title'])}")
    condition = node_text(shorten(case["condition"], 150))
    handling = node_text(shorten(case["handling"], 180))
    if level == "simple":
        return f"<b>{title}</b><br>{handling}"
    if level == "medium":
        return f"<b>{title}</b><br>Điều kiện: {condition}<br>Xử lý: {handling}"
    return f"<b>{title}</b><br><b>Điều kiện:</b> {condition}<br><b>Xử lý:</b> {handling}"


def create_page(function: dict, level: str) -> ET.Element:
    flow = function["flow"][level]
    cases_by_id = {clean(case["id"]): case for case in function["cases"]}
    cases = [cases_by_id[clean(case_id)] for case_id in flow["case_ids"]]
    steps = flow["steps"]

    node_height = {"simple": 82, "medium": 92, "detailed": 104}[level]
    case_height = {"simple": 92, "medium": 118, "detailed": 140}[level]
    case_gap = {"simple": 35, "medium": 32, "detailed": 28}[level]
    case_start_y = 120
    case_bottom = case_start_y + (len(cases) - 1) * (case_height + case_gap) + case_height
    main_y = max(330, case_start_y + (case_bottom - case_start_y - node_height) / 2)

    x_actor, actor_width = 80, 230
    x_step_start, step_width, step_gap = 380, 300, 60
    process_x = x_step_start + len(steps) * (step_width + step_gap)
    process_width = 380
    case_x = process_x + 500
    case_width = 420 if level == "detailed" else 390
    success_y = max(main_y + 280, case_bottom + 90)
    success_height = 105 if level == "detailed" else 94
    data_limit = {"simple": 2, "medium": 4, "detailed": 7}[level]
    data_lines = [shorten(line, 95) for line in (function.get("data") or [])[:data_limit]]
    data_height = max(70, 36 + 18 * max(1, len(data_lines)))

    model = ET.Element(
        "mxGraphModel",
        {
            "dx": str(int(case_x + case_width)),
            "dy": str(int(success_y + success_height)),
            "grid": "1",
            "gridSize": "10",
            "guides": "1",
            "tooltips": "1",
            "connect": "1",
            "arrows": "1",
            "fold": "1",
            "page": "1",
            "pageScale": "1",
            "pageWidth": "827",
            "pageHeight": "1169",
            "math": "0",
            "shadow": "0",
        },
    )
    root = ET.SubElement(model, "root")
    ET.SubElement(root, "mxCell", {"id": "0"})
    ET.SubElement(root, "mxCell", {"id": "1", "parent": "0"})
    prefix = f"srs_{level}_{re.sub(r'[^A-Za-z0-9_.-]+', '_', clean(function['id']))}"

    add_vertex(
        root,
        f"{prefix}_header",
        node_text(function["title"]),
        STYLE_HEADER,
        x_actor,
        30,
        max(980, process_x + process_width - x_actor),
        40,
    )
    add_vertex(
        root,
        f"{prefix}_actor",
        node_text(function["actor"]),
        STYLE_ACTOR,
        x_actor,
        main_y,
        actor_width,
        node_height,
    )

    step_ids: list[str] = []
    for index, step in enumerate(steps, 1):
        step_id = f"{prefix}_step{index}"
        process_box(
            root,
            step_id,
            node_text(step),
            x_step_start + (index - 1) * (step_width + step_gap),
            main_y,
            step_width,
            node_height,
        )
        step_ids.append(step_id)

    process_id = process_box(
        root,
        f"{prefix}_process",
        node_text(flow["process"]),
        process_x,
        main_y,
        process_width,
        node_height,
    )
    data_id = data_box(
        root,
        prefix,
        data_lines,
        process_x,
        70,
        process_width,
        data_height,
    )
    success_text = f"<b>THÀNH CÔNG</b><br>{node_text(flow['success'])}"
    if level == "detailed" and clean(function.get("audit")):
        success_text += f"<br><b>Audit:</b> {node_text(function['audit'])}"
    success_id = process_box(
        root,
        f"{prefix}_success",
        success_text,
        process_x,
        success_y,
        process_width,
        success_height,
    )

    case_ids: list[str] = []
    for index, case in enumerate(cases, 1):
        case_id = f"{prefix}_case{index}"
        process_box(
            root,
            case_id,
            case_value(case, index, level),
            case_x,
            case_start_y + (index - 1) * (case_height + case_gap),
            case_width,
            case_height,
        )
        case_ids.append(case_id)

    sequence = [f"{prefix}_actor", *step_ids, process_id]
    for index in range(len(sequence) - 1):
        add_edge(
            root,
            f"{prefix}_main_e{index + 1}",
            sequence[index],
            sequence[index + 1],
            EDGE_RIGHT,
        )
    add_edge(root, f"{prefix}_data_edge", data_id, process_id, EDGE_DOWN)
    add_edge(
        root,
        f"{prefix}_success_edge",
        process_id,
        success_id,
        EDGE_DOWN,
        "Hợp lệ / Thành công",
    )
    for index, (case, case_id) in enumerate(zip(cases, case_ids), 1):
        anchor = index / (len(cases) + 1)
        add_edge(
            root,
            f"{prefix}_case{index}_edge",
            process_id,
            case_id,
            edge_case(anchor),
            shorten(case["title"], 38),
        )

    if level == "detailed" and function.get("business_rules"):
        rules = [clean(rule) for rule in function["business_rules"] if clean(rule)]
        if rules:
            note_value = "<b>Quy tắc nghiệp vụ</b><br>" + "<br>".join(
                f"• {node_text(shorten(rule, 125))}" for rule in rules[:6]
            )
            note_width = max(420, process_x - x_step_start - 80)
            note_height = 55 + min(6, len(rules)) * 22
            add_vertex(
                root,
                f"{prefix}_rules_note",
                note_value,
                STYLE_NOTE,
                x_step_start,
                main_y + node_height + 120,
                note_width,
                note_height,
            )

    return model


def generate_level(
    template_path: Path,
    manifest: dict,
    level: str,
    output_path: Path,
) -> dict:
    tree = ET.parse(template_path)
    mxfile = tree.getroot()
    function_ids = {clean(function["id"]) for function in manifest["functions"]}
    for diagram in list(mxfile.findall("diagram")):
        name = clean(diagram.attrib.get("name"))
        if diagram.attrib.get("srsGenerated") == "1" or any(
            name.startswith(f"{function_id} -") for function_id in function_ids
        ):
            mxfile.remove(diagram)

    for function in manifest["functions"]:
        diagram = ET.SubElement(
            mxfile,
            "diagram",
            {
                "id": f"srs-{level}-" + uuid.uuid4().hex[:18],
                "name": f"{clean(function['id'])} - {clean(function['title'])[:90]}",
                "srsGenerated": "1",
                "srsLevel": level,
            },
        )
        diagram.append(create_page(function, level))
    mxfile.set("pages", str(len(mxfile.findall("diagram"))))
    output_path.parent.mkdir(parents=True, exist_ok=True)
    tree.write(output_path, encoding="utf-8", xml_declaration=False)
    return {
        "level": level,
        "output": str(output_path),
        "pages": len(mxfile.findall("diagram")),
        "functions": len(manifest["functions"]),
    }


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser()
    parser.add_argument("--template", required=True, type=Path)
    parser.add_argument("--manifest", required=True, type=Path)
    parser.add_argument("--level", choices=(*LEVELS, "all"), default="all")
    parser.add_argument("--output-dir", required=True, type=Path)
    parser.add_argument("--prefix", default="srs_flows")
    return parser.parse_args()


def main() -> None:
    args = parse_args()
    manifest = json.loads(args.manifest.read_text(encoding="utf-8"))
    levels = list(LEVELS) if args.level == "all" else [args.level]
    validate_manifest(manifest, levels)
    results = []
    for level in levels:
        output = args.output_dir / f"{args.prefix}_{level}.drawio"
        results.append(generate_level(args.template, manifest, level, output))
    print(json.dumps({"generated": results}, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()

