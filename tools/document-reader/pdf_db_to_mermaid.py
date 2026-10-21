"""Extract the OLTP table catalogue in the DMS database-design PDF to Mermaid ERD."""

from __future__ import annotations

import argparse
import re
import sys
from collections import OrderedDict
from dataclasses import dataclass, field
from pathlib import Path

import fitz


TABLE_HEADING = re.compile(r"2[.]([0-9]+)\s+B.ng\s+([A-Z][A-Z0-9_ ]+)")
TYPE_PATTERN = re.compile(
    r"^(?:n?varchar|n?char|bigint|integer|int|smallint|tinyint|decimal|numeric|double|float|"
    r"bool|boolean|date|datetime|timestamp|time|text|json|blob|longtext|mediumtext|uuid)\b",
    re.IGNORECASE,
)


@dataclass
class Column:
    name: str
    data_type: str
    key: str = ""


@dataclass
class Entity:
    number: int
    name: str
    columns: OrderedDict[str, Column] = field(default_factory=OrderedDict)


def clean_identifier(value: str) -> str:
    value = value.replace("\n", " ").strip().upper()
    value = re.sub(r"[^A-Z0-9]+", "_", value)
    return re.sub(r"_+", "_", value).strip("_")


def clean_type(value: str) -> str:
    value = " ".join(value.replace("\n", " ").split()).lower()
    value = value.replace(" ", "")
    return re.sub(r"[^a-z0-9_(),]", "", value) or "unknown"


def headings(page: fitz.Page) -> list[tuple[float, int, str]]:
    result = []
    for block in page.get_text("blocks", sort=True):
        text = " ".join(block[4].splitlines())
        for match in TABLE_HEADING.finditer(text):
            name = match.group(2).strip()
            # Stop before the field-table header when it occurs in the same text block.
            name = re.split(r"\s+STT\s+T.n tr", name, maxsplit=1)[0].strip()
            result.append((float(block[1]), int(match.group(1)), clean_identifier(name)))
    return result


def row_to_column(row: list[str | None]) -> Column | None:
    cells = ["" if value is None else str(value).strip() for value in row]
    if len(cells) < 3 or not re.fullmatch(r"\d+[.]?", cells[0]):
        return None
    name = clean_identifier(cells[1])
    if not name or name in {"TEN_TRUONG", "STT"}:
        return None
    type_index = next(
        (index for index, value in enumerate(cells[2:], 2) if TYPE_PATTERN.match(" ".join(value.split()))),
        None,
    )
    if type_index is None:
        return None
    key_values = {value.strip().upper() for value in cells[type_index + 1 :]}
    key = "PK" if "P" in key_values else "FK" if "F" in key_values else ""
    return Column(name, clean_type(cells[type_index]), key)


def extract(pdf_path: Path, start_page: int = 124, end_page: int = 543) -> OrderedDict[str, Entity]:
    document = fitz.open(pdf_path)
    entities: OrderedDict[str, Entity] = OrderedDict()
    current: Entity | None = None

    for page_number in range(start_page - 1, min(end_page, len(document))):
        page = document[page_number]
        page_headings = headings(page)
        for _, number, name in page_headings:
            entities.setdefault(name, Entity(number, name))

        for table in page.find_tables().tables:
            # A heading above the table starts a new entity; otherwise this is a continuation.
            candidates = [item for item in page_headings if item[0] < table.bbox[1]]
            if candidates:
                _, number, name = max(candidates, key=lambda item: item[0])
                current = entities.setdefault(name, Entity(number, name))
            if current is None:
                continue
            for row in table.extract():
                column = row_to_column(row)
                if column:
                    previous = current.columns.get(column.name)
                    if previous is None or (not previous.key and column.key):
                        current.columns[column.name] = column

    return OrderedDict(
        (name, entity)
        for name, entity in sorted(entities.items(), key=lambda item: item[1].number)
        if entity.columns
    )


def infer_relations(entities: OrderedDict[str, Entity]) -> list[tuple[str, str, str]]:
    names = set(entities)
    relations: set[tuple[str, str, str]] = set()
    aliases = {
        "DIST_UNIT": "DIST_UNIT",
        "DISTRIBUTION_UNIT": "DIST_UNIT",
        "PRODUCT": "PRODUCT",
        "CUSTOMER": "CUSTOMER",
        "STAFF": "STAFF",
        "TENANT": "TENANT",
        "USER_ACCOUNT": "USER_ACCOUNT",
        "WAREHOUSE": "WAREHOUSE",
        "MCP": "MCP",
        "AREA": "AREA",
    }
    for child in entities.values():
        for column in child.columns.values():
            if column.key != "FK" or not column.name.endswith("_ID"):
                continue
            base = column.name[:-3]
            candidates = [base, aliases.get(base, "")]
            parent = next((candidate for candidate in candidates if candidate in names), None)
            if parent and parent != child.name:
                relations.add((parent, child.name, column.name))
    return sorted(relations)


def mermaid(entities: OrderedDict[str, Entity]) -> str:
    lines = ["erDiagram"]
    for entity in entities.values():
        lines.append(f"    {entity.name} {{")
        for column in entity.columns.values():
            key = f" {column.key}" if column.key else ""
            lines.append(f"        {column.data_type} {column.name}{key}")
        lines.append("    }")
    for parent, child, field_name in infer_relations(entities):
        lines.append(f'    {parent} ||--o{{ {child} : "{field_name} (inferred)"')
    return "\n".join(lines) + "\n"


def write_parts(entities: OrderedDict[str, Entity], output_dir: Path, size: int = 50) -> int:
    items = list(entities.items())
    output_dir.mkdir(parents=True, exist_ok=True)
    for index, start in enumerate(range(0, len(items), size), 1):
        chunk = OrderedDict(items[start : start + size])
        (output_dir / f"part-{index:02d}.mmd").write_text(mermaid(chunk), encoding="utf-8")
    return (len(items) + size - 1) // size


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("pdf", type=Path)
    parser.add_argument("output", type=Path)
    parser.add_argument("--parts-dir", type=Path)
    parser.add_argument("--start-page", type=int, default=124)
    parser.add_argument("--end-page", type=int, default=543)
    args = parser.parse_args()
    entities = extract(args.pdf, args.start_page, args.end_page)
    args.output.parent.mkdir(parents=True, exist_ok=True)
    args.output.write_text(mermaid(entities), encoding="utf-8")
    part_message = ""
    if args.parts_dir:
        part_message = f", {write_parts(entities, args.parts_dir)} part files"
    if hasattr(sys.stdout, "reconfigure"):
        sys.stdout.reconfigure(encoding="utf-8")
    print(
        f"Wrote {len(entities)} entities, {sum(len(x.columns) for x in entities.values())} columns, "
        f"and {len(infer_relations(entities))} inferred relations to {args.output}{part_message}"
    )


if __name__ == "__main__":
    main()
