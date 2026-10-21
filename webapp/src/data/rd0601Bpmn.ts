// BPMN RD06.01 — Quyết toán NV KHCN cấp Cơ sở.
// Bám sơ đồ nghiệp vụ 8 lane / 16 bước (CQ TCKT · CLKHCN/TS · PM · TTMS · P.NS ·
// GĐ TT/BGĐ Khối · CQNV VHT · BTGĐ VHT). Song song BM 3–6 được tuần tự hoá để
// khớp taskSteps mock + tránh token song song (cùng cách xử lý RD01.02).
// Gateway loop (PDF trang 61): bước 7 Chưa đạt→4; bước 8 Chưa đạt→2; bước 16 Yêu cầu chỉnh sửa→9.

export const RD0601_BPMN = `<?xml version="1.0" encoding="UTF-8"?>
<bpmn:definitions xmlns:bpmn="http://www.omg.org/spec/BPMN/20100524/MODEL"
  xmlns:bpmndi="http://www.omg.org/spec/BPMN/20100524/DI"
  xmlns:dc="http://www.omg.org/spec/DD/20100524/DC"
  xmlns:di="http://www.omg.org/spec/DD/20100524/DI"
  xmlns:zeebe="http://camunda.org/schema/zeebe/1.0"
  xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
  id="Definitions_RD06_01" targetNamespace="http://vht.vn/qtkhcn/bpmn">
  <bpmn:collaboration id="Collaboration_RD06_01">
    <bpmn:participant id="Participant_RD06_01" name="RD06.01 — Quyết toán NV KHCN cấp Cơ sở" processRef="RD06_01" />
  </bpmn:collaboration>
  <bpmn:process id="RD06_01" name="Quyết toán NV KHCN cấp Cơ sở" isExecutable="true">
    <bpmn:laneSet id="LaneSet_RD06_01">
      <bpmn:lane id="Lane_TCKT" name="CQ TCKT">
        <bpmn:flowNodeRef>Start_RD06_01</bpmn:flowNodeRef>
        <bpmn:flowNodeRef>rd0601_t1</bpmn:flowNodeRef>
        <bpmn:flowNodeRef>rd0601_t2</bpmn:flowNodeRef>
        <bpmn:flowNodeRef>rd0601_t3</bpmn:flowNodeRef>
        <bpmn:flowNodeRef>rd0601_t8</bpmn:flowNodeRef>
        <bpmn:flowNodeRef>Gateway_8</bpmn:flowNodeRef>
        <bpmn:flowNodeRef>rd0601_t9</bpmn:flowNodeRef>
      </bpmn:lane>
      <bpmn:lane id="Lane_CLKHCN" name="CQ.CLKHCN, CQ TS">
        <bpmn:flowNodeRef>rd0601_t7</bpmn:flowNodeRef>
        <bpmn:flowNodeRef>Gateway_7</bpmn:flowNodeRef>
        <bpmn:flowNodeRef>rd0601_t10</bpmn:flowNodeRef>
      </bpmn:lane>
      <bpmn:lane id="Lane_PM" name="PM">
        <bpmn:flowNodeRef>rd0601_t4</bpmn:flowNodeRef>
        <bpmn:flowNodeRef>rd0601_t11</bpmn:flowNodeRef>
      </bpmn:lane>
      <bpmn:lane id="Lane_TTMS" name="TTMS">
        <bpmn:flowNodeRef>rd0601_t5</bpmn:flowNodeRef>
        <bpmn:flowNodeRef>rd0601_t12</bpmn:flowNodeRef>
      </bpmn:lane>
      <bpmn:lane id="Lane_NS" name="P.NS">
        <bpmn:flowNodeRef>rd0601_t6</bpmn:flowNodeRef>
        <bpmn:flowNodeRef>rd0601_t13</bpmn:flowNodeRef>
      </bpmn:lane>
      <bpmn:lane id="Lane_BGD" name="GĐ TT, BGĐ KHỐI">
        <bpmn:flowNodeRef>rd0601_t14</bpmn:flowNodeRef>
      </bpmn:lane>
      <bpmn:lane id="Lane_CQNV" name="CQNV VHT">
        <bpmn:flowNodeRef>rd0601_t15</bpmn:flowNodeRef>
      </bpmn:lane>
      <bpmn:lane id="Lane_BTGD" name="BTGĐ VHT">
        <bpmn:flowNodeRef>rd0601_t16</bpmn:flowNodeRef>
        <bpmn:flowNodeRef>Gateway_16</bpmn:flowNodeRef>
        <bpmn:flowNodeRef>End_RD06_01</bpmn:flowNodeRef>
      </bpmn:lane>
    </bpmn:laneSet>

    <bpmn:startEvent id="Start_RD06_01" name="Bắt đầu (đã có QĐ nghiệm thu)">
      <bpmn:outgoing>Flow_s1</bpmn:outgoing>
    </bpmn:startEvent>

    <bpmn:userTask id="rd0601_t1" name="1. Khởi động luồng QT RD06.01">
      <bpmn:extensionElements><zeebe:AssignmentDefinition candidateGroups="CQ_TCKT" /></bpmn:extensionElements>
      <bpmn:incoming>Flow_s1</bpmn:incoming><bpmn:outgoing>Flow_12</bpmn:outgoing>
    </bpmn:userTask>
    <bpmn:userTask id="rd0601_t2" name="2. Gửi VT34, triển khai xây dựng BM">
      <bpmn:extensionElements><zeebe:AssignmentDefinition candidateGroups="CQ_TCKT" /></bpmn:extensionElements>
      <bpmn:incoming>Flow_12</bpmn:incoming><bpmn:incoming>Flow_8_Fail</bpmn:incoming><bpmn:outgoing>Flow_23</bpmn:outgoing>
    </bpmn:userTask>
    <bpmn:userTask id="rd0601_t3" name="3. Lập BM3, 4, 8">
      <bpmn:extensionElements><zeebe:AssignmentDefinition candidateGroups="CQ_TCKT" /></bpmn:extensionElements>
      <bpmn:incoming>Flow_23</bpmn:incoming><bpmn:outgoing>Flow_34</bpmn:outgoing>
    </bpmn:userTask>
    <bpmn:userTask id="rd0601_t4" name="4. Lập BM5, 6, 7; Chứng từ tài sản">
      <bpmn:extensionElements><zeebe:AssignmentDefinition candidateGroups="PM" /></bpmn:extensionElements>
      <bpmn:incoming>Flow_34</bpmn:incoming><bpmn:incoming>Flow_7_Fail</bpmn:incoming><bpmn:outgoing>Flow_45</bpmn:outgoing>
    </bpmn:userTask>
    <bpmn:userTask id="rd0601_t5" name="5. Lập BM2">
      <bpmn:extensionElements><zeebe:AssignmentDefinition candidateGroups="CQ_MS,GD_TTMS" /></bpmn:extensionElements>
      <bpmn:incoming>Flow_45</bpmn:incoming><bpmn:outgoing>Flow_56</bpmn:outgoing>
    </bpmn:userTask>
    <bpmn:userTask id="rd0601_t6" name="6. Lập BM Chi phí nhân công">
      <bpmn:extensionElements><zeebe:AssignmentDefinition candidateGroups="CQ_NS,TP_NS" /></bpmn:extensionElements>
      <bpmn:incoming>Flow_56</bpmn:incoming><bpmn:outgoing>Flow_67</bpmn:outgoing>
    </bpmn:userTask>
    <bpmn:userTask id="rd0601_t7" name="7. Rà soát, thẩm định BM5, 6, 7">
      <bpmn:extensionElements>
        <zeebe:AssignmentDefinition candidateGroups="CQ_KHCN,TP_CLKHCN" />
        <zeebe:FormDefinition formKey="phieu-dat-chua-dat" />
      </bpmn:extensionElements>
      <bpmn:incoming>Flow_67</bpmn:incoming><bpmn:outgoing>Flow_7g</bpmn:outgoing>
    </bpmn:userTask>
    <bpmn:exclusiveGateway id="Gateway_7" name="Thẩm định BM5–7" default="Flow_7_Fail">
      <bpmn:incoming>Flow_7g</bpmn:incoming><bpmn:outgoing>Flow_7_OK</bpmn:outgoing><bpmn:outgoing>Flow_7_Fail</bpmn:outgoing>
    </bpmn:exclusiveGateway>
    <bpmn:userTask id="rd0601_t8" name="8. Tổng hợp, thẩm định chung">
      <bpmn:extensionElements>
        <zeebe:AssignmentDefinition candidateGroups="CQ_TCKT" />
        <zeebe:FormDefinition formKey="phieu-dat-chua-dat" />
      </bpmn:extensionElements>
      <bpmn:incoming>Flow_7_OK</bpmn:incoming><bpmn:outgoing>Flow_8g</bpmn:outgoing>
    </bpmn:userTask>
    <bpmn:exclusiveGateway id="Gateway_8" name="Thẩm định chung" default="Flow_8_Fail">
      <bpmn:incoming>Flow_8g</bpmn:incoming><bpmn:outgoing>Flow_8_OK</bpmn:outgoing><bpmn:outgoing>Flow_8_Fail</bpmn:outgoing>
    </bpmn:exclusiveGateway>
    <bpmn:userTask id="rd0601_t9" name="9. Lập, trình BC TH Quyết toán; Lập QĐ phê duyệt QT">
      <bpmn:extensionElements><zeebe:AssignmentDefinition candidateGroups="CQ_TCKT" /></bpmn:extensionElements>
      <bpmn:incoming>Flow_8_OK</bpmn:incoming><bpmn:incoming>Flow_16_Rework</bpmn:incoming><bpmn:outgoing>Flow_910</bpmn:outgoing>
    </bpmn:userTask>
    <bpmn:userTask id="rd0601_t10" name="10. Ký thẩm định HS">
      <bpmn:extensionElements><zeebe:AssignmentDefinition candidateGroups="CQ_KHCN,TP_CLKHCN" /></bpmn:extensionElements>
      <bpmn:incoming>Flow_910</bpmn:incoming><bpmn:outgoing>Flow_1011</bpmn:outgoing>
    </bpmn:userTask>
    <bpmn:userTask id="rd0601_t11" name="11. Ký thẩm định HS">
      <bpmn:extensionElements><zeebe:AssignmentDefinition candidateGroups="PM" /></bpmn:extensionElements>
      <bpmn:incoming>Flow_1011</bpmn:incoming><bpmn:outgoing>Flow_1112</bpmn:outgoing>
    </bpmn:userTask>
    <bpmn:userTask id="rd0601_t12" name="12. Ký thẩm định HS">
      <bpmn:extensionElements><zeebe:AssignmentDefinition candidateGroups="CQ_MS,GD_TTMS" /></bpmn:extensionElements>
      <bpmn:incoming>Flow_1112</bpmn:incoming><bpmn:outgoing>Flow_1213</bpmn:outgoing>
    </bpmn:userTask>
    <bpmn:userTask id="rd0601_t13" name="13. Ký thẩm định HS">
      <bpmn:extensionElements><zeebe:AssignmentDefinition candidateGroups="CQ_NS,TP_NS" /></bpmn:extensionElements>
      <bpmn:incoming>Flow_1213</bpmn:incoming><bpmn:outgoing>Flow_1314</bpmn:outgoing>
    </bpmn:userTask>
    <bpmn:userTask id="rd0601_t14" name="14. Ký duyệt HS">
      <bpmn:extensionElements><zeebe:AssignmentDefinition candidateGroups="BGD_TT,BGD_KHOI" /></bpmn:extensionElements>
      <bpmn:incoming>Flow_1314</bpmn:incoming><bpmn:outgoing>Flow_1415</bpmn:outgoing>
    </bpmn:userTask>
    <bpmn:userTask id="rd0601_t15" name="15. Ký duyệt BC">
      <bpmn:extensionElements><zeebe:AssignmentDefinition candidateGroups="TP_CLKHCN,TP_TCKT" /></bpmn:extensionElements>
      <bpmn:incoming>Flow_1415</bpmn:incoming><bpmn:outgoing>Flow_1516</bpmn:outgoing>
    </bpmn:userTask>
    <bpmn:userTask id="rd0601_t16" name="16. Phê duyệt Quyết định Quyết toán">
      <bpmn:extensionElements>
        <zeebe:AssignmentDefinition candidateGroups="PTGD_CT,TGD_VHT" />
        <zeebe:FormDefinition formKey="phieu-phe-duyet" />
      </bpmn:extensionElements>
      <bpmn:incoming>Flow_1516</bpmn:incoming><bpmn:outgoing>Flow_16g</bpmn:outgoing>
    </bpmn:userTask>
    <bpmn:exclusiveGateway id="Gateway_16" name="Kết quả phê duyệt" default="Flow_16_Rework">
      <bpmn:incoming>Flow_16g</bpmn:incoming><bpmn:outgoing>Flow_16_OK</bpmn:outgoing><bpmn:outgoing>Flow_16_Rework</bpmn:outgoing>
    </bpmn:exclusiveGateway>
    <bpmn:endEvent id="End_RD06_01" name="Hoàn tất quyết toán CS">
      <bpmn:incoming>Flow_16_OK</bpmn:incoming>
    </bpmn:endEvent>

    <bpmn:sequenceFlow id="Flow_s1" sourceRef="Start_RD06_01" targetRef="rd0601_t1" />
    <bpmn:sequenceFlow id="Flow_12" sourceRef="rd0601_t1" targetRef="rd0601_t2" />
    <bpmn:sequenceFlow id="Flow_23" sourceRef="rd0601_t2" targetRef="rd0601_t3" />
    <bpmn:sequenceFlow id="Flow_34" sourceRef="rd0601_t3" targetRef="rd0601_t4" />
    <bpmn:sequenceFlow id="Flow_45" sourceRef="rd0601_t4" targetRef="rd0601_t5" />
    <bpmn:sequenceFlow id="Flow_56" sourceRef="rd0601_t5" targetRef="rd0601_t6" />
    <bpmn:sequenceFlow id="Flow_67" sourceRef="rd0601_t6" targetRef="rd0601_t7" />
    <bpmn:sequenceFlow id="Flow_7g" sourceRef="rd0601_t7" targetRef="Gateway_7" />
    <bpmn:sequenceFlow id="Flow_7_OK" name="Đạt" sourceRef="Gateway_7" targetRef="rd0601_t8">
      <bpmn:conditionExpression xsi:type="bpmn:tFormalExpression">=ketQua = "DAT"</bpmn:conditionExpression>
    </bpmn:sequenceFlow>
    <bpmn:sequenceFlow id="Flow_7_Fail" name="Chưa đạt" sourceRef="Gateway_7" targetRef="rd0601_t4" />
    <bpmn:sequenceFlow id="Flow_8g" sourceRef="rd0601_t8" targetRef="Gateway_8" />
    <bpmn:sequenceFlow id="Flow_8_OK" name="Đạt" sourceRef="Gateway_8" targetRef="rd0601_t9">
      <bpmn:conditionExpression xsi:type="bpmn:tFormalExpression">=ketQua = "DAT"</bpmn:conditionExpression>
    </bpmn:sequenceFlow>
    <bpmn:sequenceFlow id="Flow_8_Fail" name="Chưa đạt" sourceRef="Gateway_8" targetRef="rd0601_t2" />
    <bpmn:sequenceFlow id="Flow_910" sourceRef="rd0601_t9" targetRef="rd0601_t10" />
    <bpmn:sequenceFlow id="Flow_1011" sourceRef="rd0601_t10" targetRef="rd0601_t11" />
    <bpmn:sequenceFlow id="Flow_1112" sourceRef="rd0601_t11" targetRef="rd0601_t12" />
    <bpmn:sequenceFlow id="Flow_1213" sourceRef="rd0601_t12" targetRef="rd0601_t13" />
    <bpmn:sequenceFlow id="Flow_1314" sourceRef="rd0601_t13" targetRef="rd0601_t14" />
    <bpmn:sequenceFlow id="Flow_1415" sourceRef="rd0601_t14" targetRef="rd0601_t15" />
    <bpmn:sequenceFlow id="Flow_1516" sourceRef="rd0601_t15" targetRef="rd0601_t16" />
    <bpmn:sequenceFlow id="Flow_16g" sourceRef="rd0601_t16" targetRef="Gateway_16" />
    <bpmn:sequenceFlow id="Flow_16_OK" name="Phê duyệt" sourceRef="Gateway_16" targetRef="End_RD06_01">
      <bpmn:conditionExpression xsi:type="bpmn:tFormalExpression">=ketQua = "PHE_DUYET"</bpmn:conditionExpression>
    </bpmn:sequenceFlow>
    <bpmn:sequenceFlow id="Flow_16_Rework" name="Yêu cầu chỉnh sửa" sourceRef="Gateway_16" targetRef="rd0601_t9" />
  </bpmn:process>

  <bpmndi:BPMNDiagram id="Diagram_RD06_01">
    <bpmndi:BPMNPlane id="Plane_RD06_01" bpmnElement="Collaboration_RD06_01">
      <bpmndi:BPMNShape id="Participant_RD06_01_di" bpmnElement="Participant_RD06_01" isHorizontal="true">
        <dc:Bounds x="120" y="40" width="1680" height="980" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Lane_TCKT_di" bpmnElement="Lane_TCKT" isHorizontal="true"><dc:Bounds x="150" y="40" width="1650" height="120" /></bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Lane_CLKHCN_di" bpmnElement="Lane_CLKHCN" isHorizontal="true"><dc:Bounds x="150" y="160" width="1650" height="120" /></bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Lane_PM_di" bpmnElement="Lane_PM" isHorizontal="true"><dc:Bounds x="150" y="280" width="1650" height="120" /></bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Lane_TTMS_di" bpmnElement="Lane_TTMS" isHorizontal="true"><dc:Bounds x="150" y="400" width="1650" height="120" /></bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Lane_NS_di" bpmnElement="Lane_NS" isHorizontal="true"><dc:Bounds x="150" y="520" width="1650" height="120" /></bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Lane_BGD_di" bpmnElement="Lane_BGD" isHorizontal="true"><dc:Bounds x="150" y="640" width="1650" height="110" /></bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Lane_CQNV_di" bpmnElement="Lane_CQNV" isHorizontal="true"><dc:Bounds x="150" y="750" width="1650" height="110" /></bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Lane_BTGD_di" bpmnElement="Lane_BTGD" isHorizontal="true"><dc:Bounds x="150" y="860" width="1650" height="160" /></bpmndi:BPMNShape>

      <bpmndi:BPMNShape id="Start_RD06_01_di" bpmnElement="Start_RD06_01"><dc:Bounds x="200" y="82" width="36" height="36" /></bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="rd0601_t1_di" bpmnElement="rd0601_t1"><dc:Bounds x="270" y="60" width="140" height="80" /></bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="rd0601_t2_di" bpmnElement="rd0601_t2"><dc:Bounds x="450" y="60" width="150" height="80" /></bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="rd0601_t3_di" bpmnElement="rd0601_t3"><dc:Bounds x="650" y="60" width="130" height="80" /></bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="rd0601_t8_di" bpmnElement="rd0601_t8"><dc:Bounds x="980" y="60" width="140" height="80" /></bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Gateway_8_di" bpmnElement="Gateway_8" isMarkerVisible="true"><dc:Bounds x="1170" y="75" width="50" height="50" /></bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="rd0601_t9_di" bpmnElement="rd0601_t9"><dc:Bounds x="1280" y="60" width="160" height="80" /></bpmndi:BPMNShape>

      <bpmndi:BPMNShape id="rd0601_t7_di" bpmnElement="rd0601_t7"><dc:Bounds x="820" y="180" width="150" height="80" /></bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Gateway_7_di" bpmnElement="Gateway_7" isMarkerVisible="true"><dc:Bounds x="1010" y="195" width="50" height="50" /></bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="rd0601_t10_di" bpmnElement="rd0601_t10"><dc:Bounds x="1480" y="180" width="120" height="80" /></bpmndi:BPMNShape>

      <bpmndi:BPMNShape id="rd0601_t4_di" bpmnElement="rd0601_t4"><dc:Bounds x="650" y="300" width="150" height="80" /></bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="rd0601_t11_di" bpmnElement="rd0601_t11"><dc:Bounds x="1480" y="300" width="120" height="80" /></bpmndi:BPMNShape>

      <bpmndi:BPMNShape id="rd0601_t5_di" bpmnElement="rd0601_t5"><dc:Bounds x="650" y="420" width="120" height="80" /></bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="rd0601_t12_di" bpmnElement="rd0601_t12"><dc:Bounds x="1480" y="420" width="120" height="80" /></bpmndi:BPMNShape>

      <bpmndi:BPMNShape id="rd0601_t6_di" bpmnElement="rd0601_t6"><dc:Bounds x="650" y="540" width="150" height="80" /></bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="rd0601_t13_di" bpmnElement="rd0601_t13"><dc:Bounds x="1480" y="540" width="120" height="80" /></bpmndi:BPMNShape>

      <bpmndi:BPMNShape id="rd0601_t14_di" bpmnElement="rd0601_t14"><dc:Bounds x="1480" y="655" width="120" height="80" /></bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="rd0601_t15_di" bpmnElement="rd0601_t15"><dc:Bounds x="1480" y="765" width="120" height="80" /></bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="rd0601_t16_di" bpmnElement="rd0601_t16"><dc:Bounds x="1480" y="890" width="150" height="80" /></bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Gateway_16_di" bpmnElement="Gateway_16" isMarkerVisible="true"><dc:Bounds x="1680" y="905" width="50" height="50" /></bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="End_RD06_01_di" bpmnElement="End_RD06_01"><dc:Bounds x="1760" y="912" width="36" height="36" /></bpmndi:BPMNShape>
    </bpmndi:BPMNPlane>
  </bpmndi:BPMNDiagram>
</bpmn:definitions>
`
