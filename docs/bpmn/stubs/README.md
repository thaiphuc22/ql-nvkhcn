# BPMN stubs (Camunda 8 / Zeebe)

Artifact **không deploy** — skeleton linear user-task + `zeebe:assignmentDefinition` `candidateGroups` tạm theo khảo sát BA (OQ-043/044, ASSUMP-005).

## Sinh lại

```bash
node docs/bpmn/stubs/generate-stubs.mjs
```

## Files

| Mã | File | bpmnProcessId |
|---|---|---|
| RD03.06 | `rd03_06-stub.bpmn` | `RD03_06` |
| RD05.01 | `rd05_01-stub.bpmn` | `RD05_01` |
| RD06.01 | `rd06_01-stub.bpmn` | `RD06_01` |
| RD06.02 | `rd06_02-stub.bpmn` | `RD06_02` |
| RD07 | `rd07-stub.bpmn` | `RD07` |
| RD08 | `rd08-stub.bpmn` | `RD08` |
| RD10 | `rd10-stub.bpmn` | `RD10` |

Xem `manifest.json` cho metadata lần sinh.

## Ràng buộc

- Không thay thế BPMN production (RD01/RD02 đã deploy).
- Candidate groups tạm — chốt sau khi VTS xác nhận OQ-043/044.
- Import thủ công vào Zeebe / Modelers khi sẵn sàng; chưa có CI deploy stub.
