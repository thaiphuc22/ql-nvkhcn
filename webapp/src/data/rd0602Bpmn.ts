// BPMN RD06.02 — Quyết toán NV KHCN cấp Tập đoàn (PDF trang 62).
// Pha CS (1–16): lập BM + chuỗi ký VHT + BTGĐ VHT phê duyệt Tờ trình đề nghị QT.
// Pha TĐ (17–26): Phòng QLDA TĐ · Chuyên hướng TĐ · CQ NV TĐ · BTGĐ TĐ.
// Song song BM / Hoàn thiện HS 19a–e được tuần tự hoá cho mock (như RD06.01).
// Loop: 5→4; 8→2; 16→9; 20→19; 26→22. (Sơ đồ gốc không có bước 25.)

export const RD0602_BPMN = `<?xml version="1.0" encoding="UTF-8"?>
<bpmn:definitions xmlns:bpmn="http://www.omg.org/spec/BPMN/20100524/MODEL"
  xmlns:bpmndi="http://www.omg.org/spec/BPMN/20100524/DI"
  xmlns:dc="http://www.omg.org/spec/DD/20100524/DC"
  xmlns:di="http://www.omg.org/spec/DD/20100524/DI"
  xmlns:zeebe="http://camunda.org/schema/zeebe/1.0"
  xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
  id="Definitions_RD06_02" targetNamespace="http://vht.vn/qtkhcn/bpmn">
  <bpmn:collaboration id="Collaboration_RD06_02">
    <bpmn:participant id="Participant_RD06_02" name="RD06.02 — Quyết toán NV KHCN cấp Tập đoàn" processRef="RD06_02" />
  </bpmn:collaboration>
  <bpmn:process id="RD06_02" name="Quyết toán NV KHCN cấp Tập đoàn" isExecutable="true">
    <bpmn:laneSet id="LaneSet_RD06_02">
      <bpmn:lane id="Lane_TCKT" name="CQ TCKT">
        <bpmn:flowNodeRef>Start_RD06_02</bpmn:flowNodeRef>
        <bpmn:flowNodeRef>rd0602_t1</bpmn:flowNodeRef>
        <bpmn:flowNodeRef>rd0602_t2</bpmn:flowNodeRef>
        <bpmn:flowNodeRef>rd0602_t3</bpmn:flowNodeRef>
        <bpmn:flowNodeRef>rd0602_t8</bpmn:flowNodeRef>
        <bpmn:flowNodeRef>Gateway_8</bpmn:flowNodeRef>
        <bpmn:flowNodeRef>rd0602_t9</bpmn:flowNodeRef>
        <bpmn:flowNodeRef>rd0602_t19</bpmn:flowNodeRef>
      </bpmn:lane>
      <bpmn:lane id="Lane_CLKHCN" name="CQ.CLKHCN, CQ TS">
        <bpmn:flowNodeRef>rd0602_t5</bpmn:flowNodeRef>
        <bpmn:flowNodeRef>Gateway_5</bpmn:flowNodeRef>
        <bpmn:flowNodeRef>rd0602_t10</bpmn:flowNodeRef>
      </bpmn:lane>
      <bpmn:lane id="Lane_PM" name="PM">
        <bpmn:flowNodeRef>rd0602_t4</bpmn:flowNodeRef>
        <bpmn:flowNodeRef>rd0602_t11</bpmn:flowNodeRef>
      </bpmn:lane>
      <bpmn:lane id="Lane_TTMS" name="TTMS">
        <bpmn:flowNodeRef>rd0602_t6</bpmn:flowNodeRef>
        <bpmn:flowNodeRef>rd0602_t12</bpmn:flowNodeRef>
      </bpmn:lane>
      <bpmn:lane id="Lane_NS" name="P.NS">
        <bpmn:flowNodeRef>rd0602_t7</bpmn:flowNodeRef>
        <bpmn:flowNodeRef>rd0602_t13</bpmn:flowNodeRef>
      </bpmn:lane>
      <bpmn:lane id="Lane_BGD" name="GĐ TT, BGĐ KHỐI">
        <bpmn:flowNodeRef>rd0602_t14</bpmn:flowNodeRef>
      </bpmn:lane>
      <bpmn:lane id="Lane_CQNV" name="CQNV VHT">
        <bpmn:flowNodeRef>rd0602_t15</bpmn:flowNodeRef>
      </bpmn:lane>
      <bpmn:lane id="Lane_BTGD_VHT" name="BTGĐ VHT">
        <bpmn:flowNodeRef>rd0602_t16</bpmn:flowNodeRef>
        <bpmn:flowNodeRef>Gateway_16</bpmn:flowNodeRef>
      </bpmn:lane>
      <bpmn:lane id="Lane_QLDA_TD" name="PHÒNG QLDA TĐ">
        <bpmn:flowNodeRef>rd0602_t17</bpmn:flowNodeRef>
        <bpmn:flowNodeRef>rd0602_t22</bpmn:flowNodeRef>
      </bpmn:lane>
      <bpmn:lane id="Lane_CH_TD" name="CHUYÊN HƯỚNG TĐ">
        <bpmn:flowNodeRef>rd0602_t18</bpmn:flowNodeRef>
        <bpmn:flowNodeRef>rd0602_t20</bpmn:flowNodeRef>
        <bpmn:flowNodeRef>Gateway_20</bpmn:flowNodeRef>
        <bpmn:flowNodeRef>rd0602_t21</bpmn:flowNodeRef>
        <bpmn:flowNodeRef>rd0602_t23</bpmn:flowNodeRef>
      </bpmn:lane>
      <bpmn:lane id="Lane_CQNV_TD" name="CQ NV TĐ">
        <bpmn:flowNodeRef>rd0602_t24</bpmn:flowNodeRef>
      </bpmn:lane>
      <bpmn:lane id="Lane_BTGD_TD" name="BTGĐ TĐ">
        <bpmn:flowNodeRef>rd0602_t26</bpmn:flowNodeRef>
        <bpmn:flowNodeRef>Gateway_26</bpmn:flowNodeRef>
        <bpmn:flowNodeRef>End_RD06_02</bpmn:flowNodeRef>
      </bpmn:lane>
    </bpmn:laneSet>

    <bpmn:startEvent id="Start_RD06_02" name="Bắt đầu (đã có QĐ nghiệm thu cấp TĐ)">
      <bpmn:outgoing>Flow_s1</bpmn:outgoing>
    </bpmn:startEvent>
    <bpmn:userTask id="rd0602_t1" name="1. Khởi động luồng quyết toán TĐ RD06.02">
      <bpmn:extensionElements><zeebe:AssignmentDefinition candidateGroups="CQ_TCKT" /></bpmn:extensionElements>
      <bpmn:incoming>Flow_s1</bpmn:incoming><bpmn:outgoing>Flow_12</bpmn:outgoing>
    </bpmn:userTask>
    <bpmn:userTask id="rd0602_t2" name="2. Gửi VT34, triển khai xây dựng BM">
      <bpmn:extensionElements><zeebe:AssignmentDefinition candidateGroups="CQ_TCKT" /></bpmn:extensionElements>
      <bpmn:incoming>Flow_12</bpmn:incoming><bpmn:incoming>Flow_8_Fail</bpmn:incoming><bpmn:outgoing>Flow_23</bpmn:outgoing>
    </bpmn:userTask>
    <bpmn:userTask id="rd0602_t3" name="3. Lập BM3, 4, 8">
      <bpmn:extensionElements><zeebe:AssignmentDefinition candidateGroups="CQ_TCKT" /></bpmn:extensionElements>
      <bpmn:incoming>Flow_23</bpmn:incoming><bpmn:outgoing>Flow_34</bpmn:outgoing>
    </bpmn:userTask>
    <bpmn:userTask id="rd0602_t4" name="4. Lập BM5, 6, 7; Chứng từ tài sản">
      <bpmn:extensionElements><zeebe:AssignmentDefinition candidateGroups="PM" /></bpmn:extensionElements>
      <bpmn:incoming>Flow_34</bpmn:incoming><bpmn:incoming>Flow_5_Fail</bpmn:incoming><bpmn:outgoing>Flow_45</bpmn:outgoing>
    </bpmn:userTask>
    <bpmn:userTask id="rd0602_t5" name="5. Rà soát, thẩm định BM5, 6, 7">
      <bpmn:extensionElements>
        <zeebe:AssignmentDefinition candidateGroups="CQ_KHCN,TP_CLKHCN" />
        <zeebe:FormDefinition formKey="phieu-dat-chua-dat" />
      </bpmn:extensionElements>
      <bpmn:incoming>Flow_45</bpmn:incoming><bpmn:outgoing>Flow_5g</bpmn:outgoing>
    </bpmn:userTask>
    <bpmn:exclusiveGateway id="Gateway_5" name="Thẩm định BM5–7" default="Flow_5_Fail">
      <bpmn:incoming>Flow_5g</bpmn:incoming><bpmn:outgoing>Flow_5_OK</bpmn:outgoing><bpmn:outgoing>Flow_5_Fail</bpmn:outgoing>
    </bpmn:exclusiveGateway>
    <bpmn:userTask id="rd0602_t6" name="6. Lập BM2">
      <bpmn:extensionElements><zeebe:AssignmentDefinition candidateGroups="CQ_MS,GD_TTMS" /></bpmn:extensionElements>
      <bpmn:incoming>Flow_5_OK</bpmn:incoming><bpmn:outgoing>Flow_67</bpmn:outgoing>
    </bpmn:userTask>
    <bpmn:userTask id="rd0602_t7" name="7. Lập BM Chi phí nhân công">
      <bpmn:extensionElements><zeebe:AssignmentDefinition candidateGroups="CQ_NS,TP_NS" /></bpmn:extensionElements>
      <bpmn:incoming>Flow_67</bpmn:incoming><bpmn:outgoing>Flow_78</bpmn:outgoing>
    </bpmn:userTask>
    <bpmn:userTask id="rd0602_t8" name="8. Tổng hợp, thẩm định chung">
      <bpmn:extensionElements>
        <zeebe:AssignmentDefinition candidateGroups="CQ_TCKT" />
        <zeebe:FormDefinition formKey="phieu-dat-chua-dat" />
      </bpmn:extensionElements>
      <bpmn:incoming>Flow_78</bpmn:incoming><bpmn:outgoing>Flow_8g</bpmn:outgoing>
    </bpmn:userTask>
    <bpmn:exclusiveGateway id="Gateway_8" name="Thẩm định chung" default="Flow_8_Fail">
      <bpmn:incoming>Flow_8g</bpmn:incoming><bpmn:outgoing>Flow_8_OK</bpmn:outgoing><bpmn:outgoing>Flow_8_Fail</bpmn:outgoing>
    </bpmn:exclusiveGateway>
    <bpmn:userTask id="rd0602_t9" name="9. Lập BC tổng hợp quyết toán, Tờ trình đề nghị QT">
      <bpmn:extensionElements><zeebe:AssignmentDefinition candidateGroups="CQ_TCKT" /></bpmn:extensionElements>
      <bpmn:incoming>Flow_8_OK</bpmn:incoming><bpmn:incoming>Flow_16_Rework</bpmn:incoming><bpmn:outgoing>Flow_910</bpmn:outgoing>
    </bpmn:userTask>
    <bpmn:userTask id="rd0602_t10" name="10. Ký thẩm định HS">
      <bpmn:extensionElements><zeebe:AssignmentDefinition candidateGroups="CQ_KHCN,TP_CLKHCN" /></bpmn:extensionElements>
      <bpmn:incoming>Flow_910</bpmn:incoming><bpmn:outgoing>Flow_1011</bpmn:outgoing>
    </bpmn:userTask>
    <bpmn:userTask id="rd0602_t11" name="11. Ký thẩm định HS">
      <bpmn:extensionElements><zeebe:AssignmentDefinition candidateGroups="PM" /></bpmn:extensionElements>
      <bpmn:incoming>Flow_1011</bpmn:incoming><bpmn:outgoing>Flow_1112</bpmn:outgoing>
    </bpmn:userTask>
    <bpmn:userTask id="rd0602_t12" name="12. Ký thẩm định HS">
      <bpmn:extensionElements><zeebe:AssignmentDefinition candidateGroups="CQ_MS,GD_TTMS" /></bpmn:extensionElements>
      <bpmn:incoming>Flow_1112</bpmn:incoming><bpmn:outgoing>Flow_1213</bpmn:outgoing>
    </bpmn:userTask>
    <bpmn:userTask id="rd0602_t13" name="13. Ký thẩm định HS">
      <bpmn:extensionElements><zeebe:AssignmentDefinition candidateGroups="CQ_NS,TP_NS" /></bpmn:extensionElements>
      <bpmn:incoming>Flow_1213</bpmn:incoming><bpmn:outgoing>Flow_1314</bpmn:outgoing>
    </bpmn:userTask>
    <bpmn:userTask id="rd0602_t14" name="14. Ký duyệt HS">
      <bpmn:extensionElements><zeebe:AssignmentDefinition candidateGroups="BGD_TT,BGD_KHOI" /></bpmn:extensionElements>
      <bpmn:incoming>Flow_1314</bpmn:incoming><bpmn:outgoing>Flow_1415</bpmn:outgoing>
    </bpmn:userTask>
    <bpmn:userTask id="rd0602_t15" name="15. Ký duyệt HS">
      <bpmn:extensionElements><zeebe:AssignmentDefinition candidateGroups="TP_CLKHCN,TP_TCKT" /></bpmn:extensionElements>
      <bpmn:incoming>Flow_1415</bpmn:incoming><bpmn:outgoing>Flow_1516</bpmn:outgoing>
    </bpmn:userTask>
    <bpmn:userTask id="rd0602_t16" name="16. Phê duyệt Tờ trình đề nghị QT">
      <bpmn:extensionElements>
        <zeebe:AssignmentDefinition candidateGroups="PTGD_CT,TGD_VHT" />
        <zeebe:FormDefinition formKey="phieu-phe-duyet" />
      </bpmn:extensionElements>
      <bpmn:incoming>Flow_1516</bpmn:incoming><bpmn:outgoing>Flow_16g</bpmn:outgoing>
    </bpmn:userTask>
    <bpmn:exclusiveGateway id="Gateway_16" name="Tờ trình đề nghị QT" default="Flow_16_Rework">
      <bpmn:incoming>Flow_16g</bpmn:incoming><bpmn:outgoing>Flow_16_OK</bpmn:outgoing><bpmn:outgoing>Flow_16_Rework</bpmn:outgoing>
    </bpmn:exclusiveGateway>
    <bpmn:userTask id="rd0602_t17" name="17. Lập CV đề nghị thẩm định">
      <bpmn:extensionElements><zeebe:AssignmentDefinition candidateGroups="QLDA_TD" /></bpmn:extensionElements>
      <bpmn:incoming>Flow_16_OK</bpmn:incoming><bpmn:outgoing>Flow_1718</bpmn:outgoing>
    </bpmn:userTask>
    <bpmn:userTask id="rd0602_t18" name="18. Thẩm định lần 1, trả PNX">
      <bpmn:extensionElements>
        <zeebe:AssignmentDefinition candidateGroups="CHUYEN_HUONG_TD,CQ_KHCN_TD" />
        <zeebe:FormDefinition formKey="phieu-dat-chua-dat" />
      </bpmn:extensionElements>
      <bpmn:incoming>Flow_1718</bpmn:incoming><bpmn:outgoing>Flow_1819</bpmn:outgoing>
    </bpmn:userTask>
    <bpmn:userTask id="rd0602_t19" name="19. Hoàn thiện HS (TCKT/CLKHCN/PM/TTMS/P.NS)">
      <bpmn:extensionElements><zeebe:AssignmentDefinition candidateGroups="CQ_TCKT,CQ_KHCN,PM,CQ_MS,CQ_NS" /></bpmn:extensionElements>
      <bpmn:incoming>Flow_1819</bpmn:incoming><bpmn:incoming>Flow_20_Fail</bpmn:incoming><bpmn:outgoing>Flow_1920</bpmn:outgoing>
    </bpmn:userTask>
    <bpmn:userTask id="rd0602_t20" name="20. Thẩm định lần 2">
      <bpmn:extensionElements>
        <zeebe:AssignmentDefinition candidateGroups="CHUYEN_HUONG_TD,CQ_KHCN_TD" />
        <zeebe:FormDefinition formKey="phieu-dat-chua-dat" />
      </bpmn:extensionElements>
      <bpmn:incoming>Flow_1920</bpmn:incoming><bpmn:outgoing>Flow_20g</bpmn:outgoing>
    </bpmn:userTask>
    <bpmn:exclusiveGateway id="Gateway_20" name="Thẩm định lần 2" default="Flow_20_Fail">
      <bpmn:incoming>Flow_20g</bpmn:incoming><bpmn:outgoing>Flow_20_OK</bpmn:outgoing><bpmn:outgoing>Flow_20_Fail</bpmn:outgoing>
    </bpmn:exclusiveGateway>
    <bpmn:userTask id="rd0602_t21" name="21. Trả KQ thẩm định">
      <bpmn:extensionElements><zeebe:AssignmentDefinition candidateGroups="CHUYEN_HUONG_TD,CQ_KHCN_TD" /></bpmn:extensionElements>
      <bpmn:incoming>Flow_20_OK</bpmn:incoming><bpmn:outgoing>Flow_2122</bpmn:outgoing>
    </bpmn:userTask>
    <bpmn:userTask id="rd0602_t22" name="22. Tổng hợp BC thẩm tra, Trình ký QĐ phê duyệt QT">
      <bpmn:extensionElements><zeebe:AssignmentDefinition candidateGroups="QLDA_TD" /></bpmn:extensionElements>
      <bpmn:incoming>Flow_2122</bpmn:incoming><bpmn:incoming>Flow_26_Rework</bpmn:incoming><bpmn:outgoing>Flow_2223</bpmn:outgoing>
    </bpmn:userTask>
    <bpmn:userTask id="rd0602_t23" name="23. Ký thẩm định HS">
      <bpmn:extensionElements><zeebe:AssignmentDefinition candidateGroups="CHUYEN_HUONG_TD,CQ_KHCN_TD" /></bpmn:extensionElements>
      <bpmn:incoming>Flow_2223</bpmn:incoming><bpmn:outgoing>Flow_2324</bpmn:outgoing>
    </bpmn:userTask>
    <bpmn:userTask id="rd0602_t24" name="24. Ký duyệt HS">
      <bpmn:extensionElements><zeebe:AssignmentDefinition candidateGroups="CQNV_TD" /></bpmn:extensionElements>
      <bpmn:incoming>Flow_2324</bpmn:incoming><bpmn:outgoing>Flow_2426</bpmn:outgoing>
    </bpmn:userTask>
    <bpmn:userTask id="rd0602_t26" name="26. Phê duyệt QĐ QT">
      <bpmn:extensionElements>
        <zeebe:AssignmentDefinition candidateGroups="BTGD_TD" />
        <zeebe:FormDefinition formKey="phieu-phe-duyet" />
      </bpmn:extensionElements>
      <bpmn:incoming>Flow_2426</bpmn:incoming><bpmn:outgoing>Flow_26g</bpmn:outgoing>
    </bpmn:userTask>
    <bpmn:exclusiveGateway id="Gateway_26" name="Kết quả phê duyệt TĐ" default="Flow_26_Rework">
      <bpmn:incoming>Flow_26g</bpmn:incoming><bpmn:outgoing>Flow_26_OK</bpmn:outgoing><bpmn:outgoing>Flow_26_Rework</bpmn:outgoing>
    </bpmn:exclusiveGateway>
    <bpmn:endEvent id="End_RD06_02" name="Hoàn tất quyết toán TĐ">
      <bpmn:incoming>Flow_26_OK</bpmn:incoming>
    </bpmn:endEvent>

    <bpmn:sequenceFlow id="Flow_s1" sourceRef="Start_RD06_02" targetRef="rd0602_t1" />
    <bpmn:sequenceFlow id="Flow_12" sourceRef="rd0602_t1" targetRef="rd0602_t2" />
    <bpmn:sequenceFlow id="Flow_23" sourceRef="rd0602_t2" targetRef="rd0602_t3" />
    <bpmn:sequenceFlow id="Flow_34" sourceRef="rd0602_t3" targetRef="rd0602_t4" />
    <bpmn:sequenceFlow id="Flow_45" sourceRef="rd0602_t4" targetRef="rd0602_t5" />
    <bpmn:sequenceFlow id="Flow_5g" sourceRef="rd0602_t5" targetRef="Gateway_5" />
    <bpmn:sequenceFlow id="Flow_5_OK" name="Đạt" sourceRef="Gateway_5" targetRef="rd0602_t6">
      <bpmn:conditionExpression xsi:type="bpmn:tFormalExpression">=ketQua = "DAT"</bpmn:conditionExpression>
    </bpmn:sequenceFlow>
    <bpmn:sequenceFlow id="Flow_5_Fail" name="Yêu cầu hiệu chỉnh" sourceRef="Gateway_5" targetRef="rd0602_t4" />
    <bpmn:sequenceFlow id="Flow_67" sourceRef="rd0602_t6" targetRef="rd0602_t7" />
    <bpmn:sequenceFlow id="Flow_78" sourceRef="rd0602_t7" targetRef="rd0602_t8" />
    <bpmn:sequenceFlow id="Flow_8g" sourceRef="rd0602_t8" targetRef="Gateway_8" />
    <bpmn:sequenceFlow id="Flow_8_OK" name="Đạt" sourceRef="Gateway_8" targetRef="rd0602_t9">
      <bpmn:conditionExpression xsi:type="bpmn:tFormalExpression">=ketQua = "DAT"</bpmn:conditionExpression>
    </bpmn:sequenceFlow>
    <bpmn:sequenceFlow id="Flow_8_Fail" name="Chưa đạt" sourceRef="Gateway_8" targetRef="rd0602_t2" />
    <bpmn:sequenceFlow id="Flow_910" sourceRef="rd0602_t9" targetRef="rd0602_t10" />
    <bpmn:sequenceFlow id="Flow_1011" sourceRef="rd0602_t10" targetRef="rd0602_t11" />
    <bpmn:sequenceFlow id="Flow_1112" sourceRef="rd0602_t11" targetRef="rd0602_t12" />
    <bpmn:sequenceFlow id="Flow_1213" sourceRef="rd0602_t12" targetRef="rd0602_t13" />
    <bpmn:sequenceFlow id="Flow_1314" sourceRef="rd0602_t13" targetRef="rd0602_t14" />
    <bpmn:sequenceFlow id="Flow_1415" sourceRef="rd0602_t14" targetRef="rd0602_t15" />
    <bpmn:sequenceFlow id="Flow_1516" sourceRef="rd0602_t15" targetRef="rd0602_t16" />
    <bpmn:sequenceFlow id="Flow_16g" sourceRef="rd0602_t16" targetRef="Gateway_16" />
    <bpmn:sequenceFlow id="Flow_16_OK" name="Phê duyệt" sourceRef="Gateway_16" targetRef="rd0602_t17">
      <bpmn:conditionExpression xsi:type="bpmn:tFormalExpression">=ketQua = "PHE_DUYET"</bpmn:conditionExpression>
    </bpmn:sequenceFlow>
    <bpmn:sequenceFlow id="Flow_16_Rework" name="Yêu cầu chỉnh sửa" sourceRef="Gateway_16" targetRef="rd0602_t9" />
    <bpmn:sequenceFlow id="Flow_1718" sourceRef="rd0602_t17" targetRef="rd0602_t18" />
    <bpmn:sequenceFlow id="Flow_1819" sourceRef="rd0602_t18" targetRef="rd0602_t19" />
    <bpmn:sequenceFlow id="Flow_1920" sourceRef="rd0602_t19" targetRef="rd0602_t20" />
    <bpmn:sequenceFlow id="Flow_20g" sourceRef="rd0602_t20" targetRef="Gateway_20" />
    <bpmn:sequenceFlow id="Flow_20_OK" name="Đạt" sourceRef="Gateway_20" targetRef="rd0602_t21">
      <bpmn:conditionExpression xsi:type="bpmn:tFormalExpression">=ketQua = "DAT"</bpmn:conditionExpression>
    </bpmn:sequenceFlow>
    <bpmn:sequenceFlow id="Flow_20_Fail" name="Chưa đạt" sourceRef="Gateway_20" targetRef="rd0602_t19" />
    <bpmn:sequenceFlow id="Flow_2122" sourceRef="rd0602_t21" targetRef="rd0602_t22" />
    <bpmn:sequenceFlow id="Flow_2223" sourceRef="rd0602_t22" targetRef="rd0602_t23" />
    <bpmn:sequenceFlow id="Flow_2324" sourceRef="rd0602_t23" targetRef="rd0602_t24" />
    <bpmn:sequenceFlow id="Flow_2426" sourceRef="rd0602_t24" targetRef="rd0602_t26" />
    <bpmn:sequenceFlow id="Flow_26g" sourceRef="rd0602_t26" targetRef="Gateway_26" />
    <bpmn:sequenceFlow id="Flow_26_OK" name="Phê duyệt" sourceRef="Gateway_26" targetRef="End_RD06_02">
      <bpmn:conditionExpression xsi:type="bpmn:tFormalExpression">=ketQua = "PHE_DUYET"</bpmn:conditionExpression>
    </bpmn:sequenceFlow>
    <bpmn:sequenceFlow id="Flow_26_Rework" name="Yêu cầu chỉnh sửa" sourceRef="Gateway_26" targetRef="rd0602_t22" />
  </bpmn:process>

  <bpmndi:BPMNDiagram id="Diagram_RD06_02">
    <bpmndi:BPMNPlane id="Plane_RD06_02" bpmnElement="Collaboration_RD06_02">
      <bpmndi:BPMNShape id="Participant_RD06_02_di" bpmnElement="Participant_RD06_02" isHorizontal="true">
        <dc:Bounds x="120" y="40" width="1980" height="1320" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Lane_TCKT_di" bpmnElement="Lane_TCKT" isHorizontal="true"><dc:Bounds x="150" y="40" width="1950" height="100" /></bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Lane_CLKHCN_di" bpmnElement="Lane_CLKHCN" isHorizontal="true"><dc:Bounds x="150" y="140" width="1950" height="100" /></bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Lane_PM_di" bpmnElement="Lane_PM" isHorizontal="true"><dc:Bounds x="150" y="240" width="1950" height="90" /></bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Lane_TTMS_di" bpmnElement="Lane_TTMS" isHorizontal="true"><dc:Bounds x="150" y="330" width="1950" height="90" /></bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Lane_NS_di" bpmnElement="Lane_NS" isHorizontal="true"><dc:Bounds x="150" y="420" width="1950" height="90" /></bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Lane_BGD_di" bpmnElement="Lane_BGD" isHorizontal="true"><dc:Bounds x="150" y="510" width="1950" height="80" /></bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Lane_CQNV_di" bpmnElement="Lane_CQNV" isHorizontal="true"><dc:Bounds x="150" y="590" width="1950" height="80" /></bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Lane_BTGD_VHT_di" bpmnElement="Lane_BTGD_VHT" isHorizontal="true"><dc:Bounds x="150" y="670" width="1950" height="100" /></bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Lane_QLDA_TD_di" bpmnElement="Lane_QLDA_TD" isHorizontal="true"><dc:Bounds x="150" y="770" width="1950" height="100" /></bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Lane_CH_TD_di" bpmnElement="Lane_CH_TD" isHorizontal="true"><dc:Bounds x="150" y="870" width="1950" height="160" /></bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Lane_CQNV_TD_di" bpmnElement="Lane_CQNV_TD" isHorizontal="true"><dc:Bounds x="150" y="1030" width="1950" height="90" /></bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Lane_BTGD_TD_di" bpmnElement="Lane_BTGD_TD" isHorizontal="true"><dc:Bounds x="150" y="1120" width="1950" height="240" /></bpmndi:BPMNShape>

      <bpmndi:BPMNShape id="Start_RD06_02_di" bpmnElement="Start_RD06_02"><dc:Bounds x="190" y="72" width="36" height="36" /></bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="rd0602_t1_di" bpmnElement="rd0602_t1"><dc:Bounds x="250" y="50" width="140" height="80" /></bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="rd0602_t2_di" bpmnElement="rd0602_t2"><dc:Bounds x="420" y="50" width="140" height="80" /></bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="rd0602_t3_di" bpmnElement="rd0602_t3"><dc:Bounds x="590" y="50" width="110" height="80" /></bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="rd0602_t8_di" bpmnElement="rd0602_t8"><dc:Bounds x="920" y="50" width="130" height="80" /></bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Gateway_8_di" bpmnElement="Gateway_8" isMarkerVisible="true"><dc:Bounds x="1090" y="65" width="50" height="50" /></bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="rd0602_t9_di" bpmnElement="rd0602_t9"><dc:Bounds x="1180" y="50" width="170" height="80" /></bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="rd0602_t19_di" bpmnElement="rd0602_t19"><dc:Bounds x="1680" y="50" width="160" height="80" /></bpmndi:BPMNShape>

      <bpmndi:BPMNShape id="rd0602_t5_di" bpmnElement="rd0602_t5"><dc:Bounds x="740" y="150" width="140" height="80" /></bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Gateway_5_di" bpmnElement="Gateway_5" isMarkerVisible="true"><dc:Bounds x="910" y="165" width="50" height="50" /></bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="rd0602_t10_di" bpmnElement="rd0602_t10"><dc:Bounds x="1400" y="150" width="110" height="80" /></bpmndi:BPMNShape>

      <bpmndi:BPMNShape id="rd0602_t4_di" bpmnElement="rd0602_t4"><dc:Bounds x="590" y="245" width="140" height="80" /></bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="rd0602_t11_di" bpmnElement="rd0602_t11"><dc:Bounds x="1400" y="245" width="110" height="80" /></bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="rd0602_t6_di" bpmnElement="rd0602_t6"><dc:Bounds x="590" y="335" width="110" height="80" /></bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="rd0602_t12_di" bpmnElement="rd0602_t12"><dc:Bounds x="1400" y="335" width="110" height="80" /></bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="rd0602_t7_di" bpmnElement="rd0602_t7"><dc:Bounds x="590" y="425" width="140" height="80" /></bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="rd0602_t13_di" bpmnElement="rd0602_t13"><dc:Bounds x="1400" y="425" width="110" height="80" /></bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="rd0602_t14_di" bpmnElement="rd0602_t14"><dc:Bounds x="1400" y="510" width="110" height="70" /></bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="rd0602_t15_di" bpmnElement="rd0602_t15"><dc:Bounds x="1400" y="590" width="110" height="70" /></bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="rd0602_t16_di" bpmnElement="rd0602_t16"><dc:Bounds x="1400" y="680" width="160" height="80" /></bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Gateway_16_di" bpmnElement="Gateway_16" isMarkerVisible="true"><dc:Bounds x="1600" y="695" width="50" height="50" /></bpmndi:BPMNShape>

      <bpmndi:BPMNShape id="rd0602_t17_di" bpmnElement="rd0602_t17"><dc:Bounds x="1400" y="780" width="160" height="80" /></bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="rd0602_t22_di" bpmnElement="rd0602_t22"><dc:Bounds x="1680" y="780" width="170" height="80" /></bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="rd0602_t18_di" bpmnElement="rd0602_t18"><dc:Bounds x="1400" y="880" width="150" height="70" /></bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="rd0602_t20_di" bpmnElement="rd0602_t20"><dc:Bounds x="1600" y="880" width="140" height="70" /></bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Gateway_20_di" bpmnElement="Gateway_20" isMarkerVisible="true"><dc:Bounds x="1770" y="890" width="50" height="50" /></bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="rd0602_t21_di" bpmnElement="rd0602_t21"><dc:Bounds x="1400" y="960" width="140" height="60" /></bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="rd0602_t23_di" bpmnElement="rd0602_t23"><dc:Bounds x="1680" y="955" width="120" height="70" /></bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="rd0602_t24_di" bpmnElement="rd0602_t24"><dc:Bounds x="1680" y="1040" width="120" height="70" /></bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="rd0602_t26_di" bpmnElement="rd0602_t26"><dc:Bounds x="1680" y="1160" width="150" height="80" /></bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Gateway_26_di" bpmnElement="Gateway_26" isMarkerVisible="true"><dc:Bounds x="1880" y="1175" width="50" height="50" /></bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="End_RD06_02_di" bpmnElement="End_RD06_02"><dc:Bounds x="1980" y="1182" width="36" height="36" /></bpmndi:BPMNShape>
    </bpmndi:BPMNPlane>
  </bpmndi:BPMNDiagram>
</bpmn:definitions>
`
