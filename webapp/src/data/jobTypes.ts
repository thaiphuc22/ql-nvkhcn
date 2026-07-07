// Danh mục JOB TYPE (zeebe:TaskDefinition.type) chuẩn của hệ KHCN — nguồn duy nhất
// cho dropdown "Tích hợp (KHCN)" trên Service Task và cho lint đối chiếu sau này.
// Khớp với 5 hệ tích hợp trong docs/arch/camunda-design.md (Seam B) + worker nội bộ.

export interface JobTypeDef {
  type: string;
  label: string;
  nhom: "Tích hợp" | "Worker nội bộ";
}

export const JOB_TYPES: JobTypeDef[] = [
  { type: "khcn.sync.qlns", label: "Đồng bộ QLNS (nhân sự)", nhom: "Tích hợp" },
  { type: "khcn.sync.ms", label: "Đồng bộ Mua sắm (MS)", nhom: "Tích hợp" },
  { type: "khcn.sync.sap", label: "Đồng bộ SAP (kinh phí)", nhom: "Tích hợp" },
  { type: "khcn.sync.qlts", label: "Đồng bộ QLTS (tài sản)", nhom: "Tích hợp" },
  { type: "khcn.sync.plm", label: "Đồng bộ PLM (tiến độ)", nhom: "Tích hợp" },
  {
    type: "khcn.rd0101.check-default-condition",
    label: "Kiểm tra điều kiện mặc định (RD01.01)",
    nhom: "Worker nội bộ",
  },
  {
    // EPIC09 — worker đánh giá DRD "Định tuyến thẩm định RD02" qua EvaluateDecision
    // (standalone, giữ D3: business data không vào Camunda). Xem
    // docs/research/EPIC09-dmn-design.md §2/§6; DMN: src/dmn/rd02Routing.dmn.ts.
    type: "khcn.rule.evaluate-routing",
    label: "Đánh giá luật định tuyến (DMN EPIC09)",
    nhom: "Worker nội bộ",
  },
];
