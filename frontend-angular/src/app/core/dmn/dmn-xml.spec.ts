import { DecisionGrid } from '../models/business-rule';
import {
  decisionGridToDmnXml,
  dmnXmlToDecisionGrid,
  feelInputToCondition,
  rootInputColumns,
} from './dmn-xml';

/**
 * DRD 3 bảng nối chuỗi phỏng theo `webapp/src/dmn/rd02Routing.dmn.ts`:
 * capNhiemVu → canHoiDong → loaiHoiDong. Chỉ `tongDuToan`/`phamVi` là input gốc.
 */
const grid: DecisionGrid = [
  {
    id: 'capNhiemVu',
    name: 'Xác định cấp nhiệm vụ',
    hitPolicy: 'FIRST',
    requires: [],
    inputs: [
      {
        id: 'capNhiemVu_i1',
        label: 'Tổng dự toán',
        variable: 'tongDuToan',
        type: 'number',
        typeRef: 'number',
      },
    ],
    outputs: [
      { id: 'capNhiemVu_o1', label: 'cap', variable: 'cap', type: 'string', typeRef: 'string' },
    ],
    rows: [
      { id: 'capNhiemVu_r1', conditions: [{ operator: 'GTE', value: 10 }], outputs: ['TAP_DOAN'] },
      {
        id: 'capNhiemVu_r2',
        conditions: [{ operator: 'ANY', value: null }],
        outputs: ['CO_SO'],
      },
    ],
  },
  {
    id: 'canHoiDong',
    name: 'Có cần hội đồng',
    hitPolicy: 'UNIQUE',
    requires: [],
    inputs: [
      { id: 'canHoiDong_i1', label: 'cap', variable: 'cap', type: 'string', typeRef: 'string' },
      {
        id: 'canHoiDong_i2',
        label: 'Phạm vi',
        variable: 'phamVi',
        type: 'string',
        typeRef: 'string',
      },
    ],
    outputs: [
      {
        id: 'canHoiDong_o1',
        label: 'canHoiDong',
        variable: 'canHoiDong',
        type: 'boolean',
        typeRef: 'boolean',
      },
    ],
    rows: [
      {
        id: 'canHoiDong_r1',
        conditions: [
          { operator: 'EQ', value: 'TAP_DOAN' },
          { operator: 'ANY', value: null },
        ],
        outputs: [true],
      },
      {
        id: 'canHoiDong_r2',
        conditions: [
          { operator: 'ANY', value: null },
          { operator: 'ANY', value: null },
        ],
        outputs: [false],
      },
    ],
  },
  {
    id: 'loaiHoiDong',
    name: 'Loại hội đồng',
    hitPolicy: 'FIRST',
    requires: [],
    inputs: [
      {
        id: 'loaiHoiDong_i1',
        label: 'canHoiDong',
        variable: 'canHoiDong',
        type: 'boolean',
        typeRef: 'boolean',
      },
      { id: 'loaiHoiDong_i2', label: 'cap', variable: 'cap', type: 'string', typeRef: 'string' },
    ],
    outputs: [
      {
        id: 'loaiHoiDong_o1',
        label: 'loaiHoiDong',
        variable: 'loaiHoiDong',
        type: 'string',
        typeRef: 'string',
      },
    ],
    rows: [
      {
        id: 'loaiHoiDong_r1',
        conditions: [
          { operator: 'EQ', value: true },
          { operator: 'EQ', value: 'TAP_DOAN' },
        ],
        outputs: ['HDXD_TAP_DOAN'],
      },
      {
        id: 'loaiHoiDong_r2',
        conditions: [
          { operator: 'ANY', value: null },
          { operator: 'ANY', value: null },
        ],
        outputs: ['KHONG'],
      },
    ],
  },
];

describe('DMN XML decision grid converter', () => {
  it('round-trips a chained multi-table DRD without semantic loss', () => {
    const xml = decisionGridToDmnXml(grid);
    const parsed = dmnXmlToDecisionGrid(xml);

    expect(parsed.map((decision) => decision.id)).toEqual([
      'capNhiemVu',
      'canHoiDong',
      'loaiHoiDong',
    ]);
    expect(decisionGridToDmnXml(parsed)).toBe(xml);
  });

  it('derives requiredDecision from variable names, not from requires[]', () => {
    const xml = decisionGridToDmnXml(grid);

    // canHoiDong đọc biến `cap` do capNhiemVu sinh ra → phải có cạnh phụ thuộc dù requires rỗng.
    expect(xml).toContain('<requiredDecision href="#capNhiemVu" />');
    expect(xml).toContain('<requiredDecision href="#canHoiDong" />');
    // Biến gốc thành inputData, không thành requiredDecision.
    expect(xml).toContain('<inputData id="in_tongDuToan"');
    expect(xml).toContain('<inputData id="in_phamVi"');
    expect(xml).not.toContain('<inputData id="in_cap"');

    const parsed = dmnXmlToDecisionGrid(xml);
    expect(parsed[1].requires).toEqual(['capNhiemVu']);
    expect(parsed[0].requires).toEqual([]);
  });

  it('declares a decision variable so downstream tables can read the upstream result', () => {
    const xml = decisionGridToDmnXml(grid);

    // Thiếu <variable> thì Camunda trả null cho biến bảng trước → bảng sau không khớp dòng nào.
    expect(xml).toContain('<variable id="var_capNhiemVu" name="cap" typeRef="string" />');
    expect(xml).toContain('<variable id="var_canHoiDong" name="canHoiDong" typeRef="boolean" />');
    // Bảng 1 cột kết quả: bảng sau tham chiếu thẳng tên biến, không qua context.
    expect(xml).toContain('<text>cap</text>');
  });

  it('reads a multi-output table through its context variable', () => {
    const multiOutput: DecisionGrid = [
      {
        ...grid[0],
        outputs: [
          ...grid[0].outputs,
          { id: 'capNhiemVu_o2', label: 'ghiChu', variable: 'ghiChu', type: 'string' },
        ],
        rows: grid[0].rows.map((row) => ({ ...row, outputs: [...row.outputs, 'x'] })),
      },
      grid[1],
    ];

    const xml = decisionGridToDmnXml(multiOutput);
    expect(xml).toContain('<variable id="var_capNhiemVu" name="dv_capNhiemVu" />');
    expect(xml).toContain('<text>dv_capNhiemVu.cap</text>');
    // Tên biến trong lưới không đổi khi tải ngược.
    expect(dmnXmlToDecisionGrid(xml)[1].inputs[0].variable).toBe('cap');
  });

  it('preserves a non-FIRST hit policy through the round-trip', () => {
    const xml = decisionGridToDmnXml(grid);
    expect(xml).toContain('hitPolicy="UNIQUE"');
    expect(dmnXmlToDecisionGrid(xml)[1].hitPolicy).toBe('UNIQUE');
  });

  it('lists only variables no decision produces as root inputs', () => {
    expect(rootInputColumns(grid).map((column) => column.variable)).toEqual([
      'tongDuToan',
      'phamVi',
    ]);
  });

  it('fails closed for an unsupported FEEL expression', () => {
    expect(() => feelInputToCondition('not(1)', 'number')).toThrowError(
      'Biểu thức số FEEL chưa được hỗ trợ: not(1)',
    );
  });
});
