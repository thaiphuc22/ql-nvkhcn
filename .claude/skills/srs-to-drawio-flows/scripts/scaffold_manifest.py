from __future__ import annotations

import json
import re
import sys
from pathlib import Path


def clean_title(title: str) -> str:
    result = title.strip()
    for prefix in ("–", "-", ":"):
        result = result.lstrip(prefix).strip()
    result = re.sub(r"\bdashbroad\b", "dashboard", result, flags=re.IGNORECASE)
    return result


def main(functions_path: Path, output_path: Path) -> None:
    functions = json.loads(functions_path.read_text(encoding="utf-8"))
    manifest = {
        "metadata": {
            "source": str(functions_path),
            "template_page": "Template",
            "language": "vi",
        },
        "functions": [],
    }
    for function in functions:
        title = clean_title(function.get("title") or "TODO")
        actor = function.get("actors") or "TODO - xác định actor từ SRS"
        source_ref = f"{function.get('id', '')} blocks {function.get('source_start')}-{function.get('source_end')}"
        manifest["functions"].append(
            {
                "id": function.get("id") or "TODO",
                "title": title,
                "actor": actor,
                "screen": function.get("path") or "TODO - tên màn hình/điểm truy cập",
                "data": function.get("api_data_candidates", [])[:6],
                "flow": {
                    "simple": {
                        "steps": ["TODO - bước người dùng chính"],
                        "process": "TODO - xử lý hệ thống chính",
                        "success": "TODO - kết quả thành công",
                        "case_ids": ["C1"],
                    },
                    "medium": {
                        "steps": [
                            "TODO - bước truy cập/thao tác",
                            "TODO - nhập/chọn/xác nhận",
                        ],
                        "process": "TODO - quyền, phạm vi, validation và xử lý nghiệp vụ",
                        "success": "TODO - dữ liệu/trạng thái/màn hình sau thành công",
                        "case_ids": ["C1", "C2"],
                    },
                    "detailed": {
                        "steps": [
                            "TODO - mở chức năng",
                            "TODO - nhập/chọn dữ liệu",
                            "TODO - xác nhận và gửi yêu cầu",
                        ],
                        "process": "TODO - xử lý đầy đủ, API/CSDL và transaction",
                        "success": "TODO - ghi dữ liệu, trạng thái, audit và thông báo",
                        "case_ids": ["C1", "C2", "C3"],
                    },
                },
                "cases": [
                    {
                        "id": "C1",
                        "title": "TODO - case quan trọng nhất của chức năng",
                        "condition": "TODO - điều kiện kích hoạt",
                        "handling": "TODO - UI và dữ liệu/trạng thái sau xử lý",
                        "source": source_ref,
                    },
                    {
                        "id": "C2",
                        "title": "TODO - case nghiệp vụ thứ hai",
                        "condition": "TODO - điều kiện kích hoạt",
                        "handling": "TODO - UI và dữ liệu/trạng thái sau xử lý",
                        "source": source_ref,
                    },
                    {
                        "id": "C3",
                        "title": "TODO - case lỗi/xung đột quan trọng",
                        "condition": "TODO - điều kiện kích hoạt",
                        "handling": "TODO - UI và dữ liệu/trạng thái sau xử lý",
                        "source": source_ref,
                    },
                ],
                "business_rules": ["TODO - quy tắc nghiệp vụ có bằng chứng"],
                "audit": "",
                "ui_evidence": function.get("images") or ["not_provided"],
                "source_refs": [source_ref],
                "review_context": {
                    "purpose": function.get("purpose", ""),
                    "precondition": function.get("precondition", ""),
                    "postcondition": function.get("postcondition", ""),
                    "candidate_exceptions": function.get("exception_candidates", []),
                },
            }
        )
    output_path.parent.mkdir(parents=True, exist_ok=True)
    output_path.write_text(json.dumps(manifest, ensure_ascii=False, indent=2), encoding="utf-8")
    print(json.dumps({"output": str(output_path), "functions": len(functions)}, ensure_ascii=False))


if __name__ == "__main__":
    if len(sys.argv) != 3:
        raise SystemExit("Usage: scaffold_manifest.py FUNCTIONS.json OUTPUT.json")
    main(Path(sys.argv[1]), Path(sys.argv[2]))
