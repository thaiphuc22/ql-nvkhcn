// BPMN cho RD02.01 — Xét duyệt NV KHCN cấp Cơ sở.
// Minh hoạ NỐI OUTPUT DMN VÀO GATEWAY (EPIC09, bước 3 của
// docs/research/EPIC09-dmn-design.md §6):
//
//   Start → [Service Task] Đánh giá luật định tuyến (DMN) → Chuyên quản thẩm định
//         → <Gateway: Cần Hội đồng?> --canHoiDong=true--> HĐXD đánh giá ┐
//                                     --default (không cần)------------→ Join → HĐ KHCN → TGĐ → End
//
// - Service Task "Task_Rule" chạy worker khcn.rule.evaluate-routing: đọc business
//   data (tongDuToan) từ DB app, gọi EvaluateDecision trên DRD drd_rd02_routing
//   (src/dmn/rd02Routing.dmn.ts), set các BIẾN ĐIỀU KHIỂN cap / canHoiDong /
//   loaiHoiDong vào process. Business data KHÔNG vào Camunda (giữ D3) — chỉ output.
// - Gateway "Gateway_Council" rẽ nhánh trên output DMN `canHoiDong` (đã khai ở
//   variableContract.ts → hợp lệ với lint điều kiện FEEL).
// - `loaiHoiDong` không rẽ nhánh ở đây; nó truyền sang Approval Matrix (EPIC06) để
//   chọn đúng hội đồng (HĐXD CS / HĐ KHCN TĐ) — DMN trả "có cần làm gì", Approval
//   Matrix trả "ai làm". Ngưỡng định tuyến là placeholder (OQ-008).

export const RD0201_BPMN = `<?xml version="1.0" encoding="UTF-8"?>
<bpmn:definitions xmlns:bpmn="http://www.omg.org/spec/BPMN/20100524/MODEL"
  xmlns:bpmndi="http://www.omg.org/spec/BPMN/20100524/DI"
  xmlns:dc="http://www.omg.org/spec/DD/20100524/DC"
  xmlns:di="http://www.omg.org/spec/DD/20100524/DI"
  xmlns:zeebe="http://camunda.org/schema/zeebe/1.0"
  xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
  id="Definitions_RD02_01" targetNamespace="http://vht.vn/qtkhcn/bpmn">
  <bpmn:process id="RD02_01" name="Xét duyệt NV KHCN cấp Cơ sở" isExecutable="true">
    <bpmn:startEvent id="Start_RD02_01" name="Tiếp nhận hồ sơ RD02">
      <bpmn:outgoing>Flow_1</bpmn:outgoing>
    </bpmn:startEvent>
    <bpmn:serviceTask id="Task_Rule" name="Đánh giá luật định tuyến (DMN)">
      <bpmn:extensionElements>
        <zeebe:TaskDefinition type="khcn.rule.evaluate-routing" retries="3" />
      </bpmn:extensionElements>
      <bpmn:incoming>Flow_1</bpmn:incoming>
      <bpmn:outgoing>Flow_2</bpmn:outgoing>
    </bpmn:serviceTask>
    <bpmn:userTask id="Task_CQ" name="Chuyên quản thẩm định (Đạt/Chưa đạt)">
      <bpmn:extensionElements>
        <zeebe:AssignmentDefinition candidateGroups="CQ_KHCN,CQ_MS,CQ_NS,CQ_TCKT" />
        <zeebe:FormDefinition formKey="phieu-dat-chua-dat" />
      </bpmn:extensionElements>
      <bpmn:incoming>Flow_2</bpmn:incoming>
      <bpmn:outgoing>Flow_3</bpmn:outgoing>
    </bpmn:userTask>
    <bpmn:exclusiveGateway id="Gateway_Council" name="Cần Hội đồng Xét duyệt?" default="Flow_NoCouncil">
      <bpmn:incoming>Flow_3</bpmn:incoming>
      <bpmn:outgoing>Flow_Council</bpmn:outgoing>
      <bpmn:outgoing>Flow_NoCouncil</bpmn:outgoing>
    </bpmn:exclusiveGateway>
    <bpmn:userTask id="Task_HDXD" name="Hội đồng Xét duyệt đánh giá (phiên 1 &amp; 2)">
      <bpmn:extensionElements>
        <zeebe:AssignmentDefinition candidateGroups="HDXD" />
        <zeebe:FormDefinition formKey="phieu-nhan-xet" />
      </bpmn:extensionElements>
      <bpmn:incoming>Flow_Council</bpmn:incoming>
      <bpmn:outgoing>Flow_4</bpmn:outgoing>
    </bpmn:userTask>
    <bpmn:exclusiveGateway id="Gateway_Join">
      <bpmn:incoming>Flow_4</bpmn:incoming>
      <bpmn:incoming>Flow_NoCouncil</bpmn:incoming>
      <bpmn:outgoing>Flow_5</bpmn:outgoing>
    </bpmn:exclusiveGateway>
    <bpmn:userTask id="Task_HDKHCN" name="Hội đồng KHCN phê duyệt">
      <bpmn:extensionElements>
        <zeebe:AssignmentDefinition candidateGroups="HDKHCN" />
        <zeebe:FormDefinition formKey="phieu-phe-duyet" />
      </bpmn:extensionElements>
      <bpmn:incoming>Flow_5</bpmn:incoming>
      <bpmn:outgoing>Flow_6</bpmn:outgoing>
    </bpmn:userTask>
    <bpmn:userTask id="Task_TGD" name="TGĐ phê duyệt mở mới đề tài">
      <bpmn:extensionElements>
        <zeebe:AssignmentDefinition candidateGroups="TGD_VHT" />
        <zeebe:FormDefinition formKey="phieu-phe-duyet" />
      </bpmn:extensionElements>
      <bpmn:incoming>Flow_6</bpmn:incoming>
      <bpmn:outgoing>Flow_7</bpmn:outgoing>
    </bpmn:userTask>
    <bpmn:endEvent id="End_Done" name="Hoàn tất — mở mới đề tài">
      <bpmn:incoming>Flow_7</bpmn:incoming>
    </bpmn:endEvent>

    <bpmn:sequenceFlow id="Flow_1" sourceRef="Start_RD02_01" targetRef="Task_Rule" />
    <bpmn:sequenceFlow id="Flow_2" sourceRef="Task_Rule" targetRef="Task_CQ" />
    <bpmn:sequenceFlow id="Flow_3" sourceRef="Task_CQ" targetRef="Gateway_Council" />
    <bpmn:sequenceFlow id="Flow_Council" name="Cần Hội đồng" sourceRef="Gateway_Council" targetRef="Task_HDXD">
      <bpmn:conditionExpression xsi:type="bpmn:tFormalExpression">=canHoiDong = true</bpmn:conditionExpression>
    </bpmn:sequenceFlow>
    <bpmn:sequenceFlow id="Flow_NoCouncil" name="Không cần Hội đồng" sourceRef="Gateway_Council" targetRef="Gateway_Join" />
    <bpmn:sequenceFlow id="Flow_4" sourceRef="Task_HDXD" targetRef="Gateway_Join" />
    <bpmn:sequenceFlow id="Flow_5" sourceRef="Gateway_Join" targetRef="Task_HDKHCN" />
    <bpmn:sequenceFlow id="Flow_6" sourceRef="Task_HDKHCN" targetRef="Task_TGD" />
    <bpmn:sequenceFlow id="Flow_7" sourceRef="Task_TGD" targetRef="End_Done" />
  </bpmn:process>

  <bpmndi:BPMNDiagram id="Diagram_RD02_01">
    <bpmndi:BPMNPlane id="Plane_RD02_01" bpmnElement="RD02_01">
      <bpmndi:BPMNShape id="Start_RD02_01_di" bpmnElement="Start_RD02_01">
        <dc:Bounds x="160" y="152" width="36" height="36" />
        <bpmndi:BPMNLabel><dc:Bounds x="140" y="195" width="80" height="27" /></bpmndi:BPMNLabel>
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Task_Rule_di" bpmnElement="Task_Rule"><dc:Bounds x="250" y="130" width="160" height="80" /></bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Task_CQ_di" bpmnElement="Task_CQ"><dc:Bounds x="460" y="130" width="160" height="80" /></bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Gateway_Council_di" bpmnElement="Gateway_Council" isMarkerVisible="true">
        <dc:Bounds x="670" y="145" width="50" height="50" />
        <bpmndi:BPMNLabel><dc:Bounds x="655" y="120" width="80" height="14" /></bpmndi:BPMNLabel>
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Task_HDXD_di" bpmnElement="Task_HDXD"><dc:Bounds x="770" y="280" width="170" height="80" /></bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Gateway_Join_di" bpmnElement="Gateway_Join" isMarkerVisible="true"><dc:Bounds x="980" y="145" width="50" height="50" /></bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Task_HDKHCN_di" bpmnElement="Task_HDKHCN"><dc:Bounds x="1080" y="130" width="160" height="80" /></bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Task_TGD_di" bpmnElement="Task_TGD"><dc:Bounds x="1290" y="130" width="160" height="80" /></bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="End_Done_di" bpmnElement="End_Done">
        <dc:Bounds x="1500" y="152" width="36" height="36" />
        <bpmndi:BPMNLabel><dc:Bounds x="1480" y="195" width="80" height="27" /></bpmndi:BPMNLabel>
      </bpmndi:BPMNShape>

      <bpmndi:BPMNEdge id="Flow_1_di" bpmnElement="Flow_1"><di:waypoint x="196" y="170" /><di:waypoint x="250" y="170" /></bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Flow_2_di" bpmnElement="Flow_2"><di:waypoint x="410" y="170" /><di:waypoint x="460" y="170" /></bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Flow_3_di" bpmnElement="Flow_3"><di:waypoint x="620" y="170" /><di:waypoint x="670" y="170" /></bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Flow_Council_di" bpmnElement="Flow_Council"><di:waypoint x="695" y="195" /><di:waypoint x="695" y="320" /><di:waypoint x="770" y="320" /></bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Flow_NoCouncil_di" bpmnElement="Flow_NoCouncil"><di:waypoint x="720" y="170" /><di:waypoint x="980" y="170" /></bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Flow_4_di" bpmnElement="Flow_4"><di:waypoint x="940" y="320" /><di:waypoint x="1005" y="320" /><di:waypoint x="1005" y="195" /></bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Flow_5_di" bpmnElement="Flow_5"><di:waypoint x="1030" y="170" /><di:waypoint x="1080" y="170" /></bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Flow_6_di" bpmnElement="Flow_6"><di:waypoint x="1240" y="170" /><di:waypoint x="1290" y="170" /></bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Flow_7_di" bpmnElement="Flow_7"><di:waypoint x="1450" y="170" /><di:waypoint x="1500" y="170" /></bpmndi:BPMNEdge>
    </bpmndi:BPMNPlane>
  </bpmndi:BPMNDiagram>
</bpmn:definitions>`
