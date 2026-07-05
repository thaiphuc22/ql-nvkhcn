// Danh mục JOB TYPE (zeebe:TaskDefinition.type) chuẩn của hệ KHCN — nguồn duy nhất
// cho dropdown "Tích hợp (KHCN)" trên Service Task và cho lint đối chiếu sau này.
// Khớp với 5 hệ tích hợp trong docs/arch/camunda-design.md (Seam B) + worker nội bộ.

export interface JobTypeDef {
  type: string
  label: string
  nhom: 'Tích hợp hệ ngoài' | 'Worker nội bộ'
}

export const JOB_TYPES: JobTypeDef[] = [
  { type: 'khcn.sync.qlns', label: 'Đồng bộ QLNS (nhân sự)', nhom: 'Tích hợp hệ ngoài' },
  { type: 'khcn.sync.ms', label: 'Đồng bộ Mua sắm (MS)', nhom: 'Tích hợp hệ ngoài' },
  { type: 'khcn.sync.sap', label: 'Đồng bộ SAP (kinh phí)', nhom: 'Tích hợp hệ ngoài' },
  { type: 'khcn.sync.qlts', label: 'Đồng bộ QLTS (tài sản)', nhom: 'Tích hợp hệ ngoài' },
  { type: 'khcn.sync.plm', label: 'Đồng bộ PLM (tiến độ)', nhom: 'Tích hợp hệ ngoài' },
  { type: 'khcn.rd0101.check-default-condition', label: 'Kiểm tra điều kiện mặc định (RD01.01)', nhom: 'Worker nội bộ' },
]
