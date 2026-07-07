// Seed DMN cho DRD "Định tuyến thẩm định RD02" — artifact source-of-truth (EPIC09).
// Xem docs/research/EPIC09-dmn-design.md §4. Ba decision nối chuỗi:
//   capNhiemVu → canHoiDong → loaiHoiDong.
// Output (cap / canHoiDong / loaiHoiDong) là biến điều khiển đã khai ở
// variableContract.ts. Input tongDuToan là business data — chỉ truyền vào lúc eval.
// Ngưỡng 10 tỷ / 5 tỷ là placeholder (OQ-008). Số FEEL KHÔNG dùng dấu '_'.

export const RD02_ROUTING_DMN = `<?xml version="1.0" encoding="UTF-8"?>
<definitions xmlns="https://www.omg.org/spec/DMN/20191111/MODEL/"
             xmlns:dmndi="https://www.omg.org/spec/DMN/20191111/DMNDI/"
             xmlns:dc="http://www.omg.org/spec/DMN/20180521/DC/"
             xmlns:di="http://www.omg.org/spec/DMN/20180521/DI/"
             id="drd_rd02_routing"
             name="Định tuyến thẩm định RD02"
             namespace="http://vht.com.vn/qtkhcn/dmn/rd02">
  <inputData id="in_tongDuToan" name="tongDuToan">
    <variable id="var_tongDuToan" name="tongDuToan" typeRef="number" />
  </inputData>

  <decision id="capNhiemVu" name="Phân cấp nhiệm vụ">
    <informationRequirement id="ir_cap_ind">
      <requiredInput href="#in_tongDuToan" />
    </informationRequirement>
    <decisionTable id="dt_cap" hitPolicy="FIRST">
      <input id="dt_cap_i1" label="Tổng dự toán (đồng)">
        <inputExpression id="dt_cap_i1e" typeRef="number"><text>tongDuToan</text></inputExpression>
      </input>
      <output id="dt_cap_o1" name="cap" typeRef="string" />
      <rule id="dt_cap_r1">
        <inputEntry id="dt_cap_r1i1"><text>&gt;= 10000000000</text></inputEntry>
        <outputEntry id="dt_cap_r1o1"><text>"TD"</text></outputEntry>
      </rule>
      <rule id="dt_cap_r2">
        <inputEntry id="dt_cap_r2i1"><text>-</text></inputEntry>
        <outputEntry id="dt_cap_r2o1"><text>"CS"</text></outputEntry>
      </rule>
    </decisionTable>
  </decision>

  <decision id="canHoiDong" name="Cần Hội đồng">
    <informationRequirement id="ir_ch_cap">
      <requiredDecision href="#capNhiemVu" />
    </informationRequirement>
    <informationRequirement id="ir_ch_ind">
      <requiredInput href="#in_tongDuToan" />
    </informationRequirement>
    <decisionTable id="dt_ch" hitPolicy="FIRST">
      <input id="dt_ch_i1" label="Cấp">
        <inputExpression id="dt_ch_i1e" typeRef="string"><text>cap</text></inputExpression>
      </input>
      <input id="dt_ch_i2" label="Tổng dự toán (đồng)">
        <inputExpression id="dt_ch_i2e" typeRef="number"><text>tongDuToan</text></inputExpression>
      </input>
      <output id="dt_ch_o1" name="canHoiDong" typeRef="boolean" />
      <rule id="dt_ch_r1">
        <inputEntry id="dt_ch_r1i1"><text>"TD"</text></inputEntry>
        <inputEntry id="dt_ch_r1i2"><text>-</text></inputEntry>
        <outputEntry id="dt_ch_r1o1"><text>true</text></outputEntry>
      </rule>
      <rule id="dt_ch_r2">
        <inputEntry id="dt_ch_r2i1"><text>"CS"</text></inputEntry>
        <inputEntry id="dt_ch_r2i2"><text>&gt;= 5000000000</text></inputEntry>
        <outputEntry id="dt_ch_r2o1"><text>true</text></outputEntry>
      </rule>
      <rule id="dt_ch_r3">
        <inputEntry id="dt_ch_r3i1"><text>-</text></inputEntry>
        <inputEntry id="dt_ch_r3i2"><text>-</text></inputEntry>
        <outputEntry id="dt_ch_r3o1"><text>false</text></outputEntry>
      </rule>
    </decisionTable>
  </decision>

  <decision id="loaiHoiDong" name="Loại hội đồng">
    <informationRequirement id="ir_lh_cap">
      <requiredDecision href="#capNhiemVu" />
    </informationRequirement>
    <informationRequirement id="ir_lh_ch">
      <requiredDecision href="#canHoiDong" />
    </informationRequirement>
    <decisionTable id="dt_lh" hitPolicy="UNIQUE">
      <input id="dt_lh_i1" label="Cấp">
        <inputExpression id="dt_lh_i1e" typeRef="string"><text>cap</text></inputExpression>
      </input>
      <input id="dt_lh_i2" label="Cần hội đồng">
        <inputExpression id="dt_lh_i2e" typeRef="boolean"><text>canHoiDong</text></inputExpression>
      </input>
      <output id="dt_lh_o1" name="loaiHoiDong" typeRef="string" />
      <rule id="dt_lh_r1">
        <inputEntry id="dt_lh_r1i1"><text>"TD"</text></inputEntry>
        <inputEntry id="dt_lh_r1i2"><text>true</text></inputEntry>
        <outputEntry id="dt_lh_r1o1"><text>"HD_KHCN_TD"</text></outputEntry>
      </rule>
      <rule id="dt_lh_r2">
        <inputEntry id="dt_lh_r2i1"><text>"CS"</text></inputEntry>
        <inputEntry id="dt_lh_r2i2"><text>true</text></inputEntry>
        <outputEntry id="dt_lh_r2o1"><text>"HD_CS"</text></outputEntry>
      </rule>
      <rule id="dt_lh_r3">
        <inputEntry id="dt_lh_r3i1"><text>-</text></inputEntry>
        <inputEntry id="dt_lh_r3i2"><text>false</text></inputEntry>
        <outputEntry id="dt_lh_r3o1"><text>"KHONG"</text></outputEntry>
      </rule>
    </decisionTable>
  </decision>

  <dmndi:DMNDI>
    <dmndi:DMNDiagram id="drd_diagram">
      <dmndi:DMNShape id="sh_loaiHoiDong" dmnElementRef="loaiHoiDong">
        <dc:Bounds x="340" y="80" width="180" height="80" />
      </dmndi:DMNShape>
      <dmndi:DMNShape id="sh_canHoiDong" dmnElementRef="canHoiDong">
        <dc:Bounds x="340" y="220" width="180" height="80" />
      </dmndi:DMNShape>
      <dmndi:DMNShape id="sh_capNhiemVu" dmnElementRef="capNhiemVu">
        <dc:Bounds x="340" y="360" width="180" height="80" />
      </dmndi:DMNShape>
      <dmndi:DMNShape id="sh_in_tongDuToan" dmnElementRef="in_tongDuToan">
        <dc:Bounds x="368" y="500" width="125" height="45" />
      </dmndi:DMNShape>
      <dmndi:DMNEdge id="e_cap_ind" dmnElementRef="ir_cap_ind">
        <di:waypoint x="430" y="500" />
        <di:waypoint x="430" y="440" />
      </dmndi:DMNEdge>
      <dmndi:DMNEdge id="e_ch_cap" dmnElementRef="ir_ch_cap">
        <di:waypoint x="420" y="360" />
        <di:waypoint x="420" y="300" />
      </dmndi:DMNEdge>
      <dmndi:DMNEdge id="e_ch_ind" dmnElementRef="ir_ch_ind">
        <di:waypoint x="470" y="512" />
        <di:waypoint x="470" y="300" />
      </dmndi:DMNEdge>
      <dmndi:DMNEdge id="e_lh_cap" dmnElementRef="ir_lh_cap">
        <di:waypoint x="380" y="360" />
        <di:waypoint x="380" y="160" />
      </dmndi:DMNEdge>
      <dmndi:DMNEdge id="e_lh_ch" dmnElementRef="ir_lh_ch">
        <di:waypoint x="430" y="220" />
        <di:waypoint x="430" y="160" />
      </dmndi:DMNEdge>
    </dmndi:DMNDiagram>
  </dmndi:DMNDI>
</definitions>`
