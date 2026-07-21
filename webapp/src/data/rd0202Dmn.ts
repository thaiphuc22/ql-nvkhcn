// DMN cho RD02.02 — Xác định hướng xử lý sau HĐXD Tập đoàn phiên 2.
// Nguồn: File gốc "Xác định hướng xử lý sau HĐXD Tập đoàn phiên 2.dmn" (2026-07-21).
// DMN này được gọi từ Activity_03fbbgn trong BPMN RD02.02.
// Input: hasEnoughScoreData (number) - điểm trung bình HĐXD Tập đoàn (0-100).
// Output: vhtCouncilResult (string) - "APPROVED" = thông qua, "REJECTED" = không đạt.

export const RD0202_DMN = `<?xml version="1.0" encoding="UTF-8"?>
<definitions xmlns="https://www.omg.org/spec/DMN/20191111/MODEL/" xmlns:dmndi="https://www.omg.org/spec/DMN/20191111/DMNDI/" xmlns:dc="http://www.omg.org/spec/DMN/20180521/DC/" xmlns:modeler="http://camunda.org/schema/modeler/1.0" xmlns:biodi="http://bpmn.io/schema/dmn/biodi/2.0" id="Definitions_109veuf" name="DRD" namespace="http://camunda.org/schema/1.0/dmn" exporter="Camunda Web Modeler" exporterVersion="0a0ba04" modeler:executionPlatform="Camunda Cloud" modeler:executionPlatformVersion="8.9.0">
  <decision id="decision-1l9z3ao" name="Xác định hướng xử lý sau HĐXD Tập đoàn phiên 2">
    <decisionTable id="DecisionTable_0fr936i" hitPolicy="FIRST">
      <input id="InputClause_0jgh31s" label="Điểm trung bình HĐXD TĐ" biodi:width="192">
        <inputExpression id="LiteralExpression_16ifd0u" typeRef="number">
          <text>hasEnoughScoreData</text>
        </inputExpression>
      </input>
      <output id="Output_1" label="Kết quả HĐXD VHT" name="vhtCouncilResult" typeRef="string" biodi:width="192" />
      <rule id="DecisionRule_1muojh0">
        <description>Điểm trung bình dưới 70/100 thì không đủ điều kiện trình ký, hồ sơ bị từ chối.</description>
        <inputEntry id="UnaryTests_18jx0ij">
          <text>&lt; 70</text>
        </inputEntry>
        <outputEntry id="LiteralExpression_0wdiqq9">
          <text>"REJECTED"</text>
        </outputEntry>
      </rule>
      <rule id="DecisionRule_0twcdh7">
        <description>Điểm từ 70 trở lên: đủ điều kiện, kết luận thông qua để hoàn thiện và trình ký.</description>
        <inputEntry id="UnaryTests_1hyom3v">
          <text>&gt;= 70</text>
        </inputEntry>
        <outputEntry id="LiteralExpression_0q4ecag">
          <text>"APPROVED"</text>
        </outputEntry>
      </rule>
    </decisionTable>
  </decision>
  <dmndi:DMNDI>
    <dmndi:DMNDiagram>
      <dmndi:DMNShape dmnElementRef="decision-1l9z3ao">
        <dc:Bounds height="80" width="180" x="160" y="100" />
      </dmndi:DMNShape>
    </dmndi:DMNDiagram>
  </dmndi:DMNDI>
</definitions>
`