// Mock dữ liệu cơ cấu tổ chức (đơn vị) cho màn Quản trị đơn vị.
// Lưu dạng phẳng (parentId) để CRUD dễ; dựng cây khi hiển thị.
// Tên đơn vị (name) khớp trường donVi trong data/users.ts để gán người dùng vào đơn vị.

export interface OrgUnit {
  id: string
  name: string
  /** Mã đơn vị ngắn — hiển thị phụ. */
  code: string
  /** Cha trực tiếp; null = gốc. */
  parentId: string | null
  /** Loại đơn vị — chỉ để hiển thị nhãn. */
  loai: 'tap-doan' | 'khoi' | 'don-vi'
}

export const orgUnits: OrgUnit[] = [
  { id: 'U0', name: 'Tập đoàn CN – VT VHT', code: 'VHT', parentId: null, loai: 'tap-doan' },
  { id: 'U1', name: 'Ban Tổng Giám đốc', code: 'BTGD', parentId: 'U0', loai: 'khoi' },
  { id: 'U2', name: 'Ban Giám đốc', code: 'BGD', parentId: 'U0', loai: 'khoi' },
  { id: 'U3', name: 'Khối Nghiệp vụ KHCN', code: 'KNV', parentId: 'U0', loai: 'khoi' },
  { id: 'U4', name: 'CQNV VHT', code: 'CQNV', parentId: 'U3', loai: 'don-vi' },
  { id: 'U5', name: 'CQ QLKHCN', code: 'QLKHCN', parentId: 'U3', loai: 'don-vi' },
  { id: 'U6', name: 'Khối Phòng ban', code: 'KPB', parentId: 'U0', loai: 'khoi' },
  { id: 'U7', name: 'Trung tâm Nghiên cứu', code: 'TTNC', parentId: 'U0', loai: 'don-vi' },
  { id: 'U8', name: 'CNTT', code: 'CNTT', parentId: 'U0', loai: 'don-vi' },
  // Đơn vị hội đồng & cấp Tập đoàn — chứa các tài khoản demo phê duyệt (users.ts).
  { id: 'U9', name: 'Hội đồng KHCN VHT', code: 'HDKHCN', parentId: 'U0', loai: 'don-vi' },
  { id: 'U10', name: 'Ban CNCNC Tập đoàn', code: 'CNCNC-TD', parentId: 'U0', loai: 'don-vi' },
  { id: 'U11', name: 'CQNV Tập đoàn', code: 'CQNV-TD', parentId: 'U0', loai: 'don-vi' },
  { id: 'U12', name: 'Hội đồng KHCN Tập đoàn', code: 'HDKHCN-TD', parentId: 'U0', loai: 'don-vi' },
  { id: 'U13', name: 'Ban TGĐ Tập đoàn', code: 'BTGD-TD', parentId: 'U0', loai: 'khoi' },
]

export const ORG_LOAI_LABEL: Record<OrgUnit['loai'], string> = {
  'tap-doan': 'Tập đoàn',
  khoi: 'Khối',
  'don-vi': 'Đơn vị',
}

export interface OrgTreeNode extends OrgUnit {
  children: OrgTreeNode[]
}

/** Dựng cây từ danh sách phẳng (theo parentId). Giữ nguyên thứ tự khai báo. */
export function buildOrgTree(units: OrgUnit[]): OrgTreeNode[] {
  const byId = new Map<string, OrgTreeNode>()
  units.forEach((u) => byId.set(u.id, { ...u, children: [] }))
  const roots: OrgTreeNode[] = []
  units.forEach((u) => {
    const node = byId.get(u.id)!
    if (u.parentId && byId.has(u.parentId)) byId.get(u.parentId)!.children.push(node)
    else roots.push(node)
  })
  return roots
}
