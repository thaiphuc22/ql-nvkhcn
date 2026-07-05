// BPMN mặc định cho RD01.01 — Xét duyệt Chủ trương cấp Cơ sở.
// Mô hình hoá từ sơ đồ nghiệp vụ khách hàng cung cấp, với 6 lane và cấu hình
// Zeebe tối thiểu (assignment, form, job type, condition, call activity).

export const RD0101_BPMN = `<?xml version="1.0" encoding="UTF-8"?>
<bpmn:definitions xmlns:bpmn="http://www.omg.org/spec/BPMN/20100524/MODEL"
  xmlns:bpmndi="http://www.omg.org/spec/BPMN/20100524/DI"
  xmlns:dc="http://www.omg.org/spec/DD/20100524/DC"
  xmlns:di="http://www.omg.org/spec/DD/20100524/DI"
  xmlns:zeebe="http://camunda.org/schema/zeebe/1.0"
  xmlns:bioc="http://bpmn.io/schema/bpmn/biocolor/1.0"
  id="Definitions_RD01_01" targetNamespace="http://vht.vn/qtkhcn/bpmn">
  <bpmn:collaboration id="Collaboration_RD01_01">
    <bpmn:participant id="Participant_RD01_01" name="RD01.01 — Xét duyệt Chủ trương cấp Cơ sở" processRef="RD01_01" />
  </bpmn:collaboration>
  <bpmn:process id="RD01_01" name="Xét duyệt Chủ trương cấp Cơ sở" isExecutable="true">
    <bpmn:laneSet id="LaneSet_RD01_01">
      <bpmn:lane id="Lane_PM" name="Chủ nhiệm đề tài (PM)">
        <bpmn:flowNodeRef>Start_RD01_01</bpmn:flowNodeRef><bpmn:flowNodeRef>Task_1</bpmn:flowNodeRef><bpmn:flowNodeRef>Task_2</bpmn:flowNodeRef><bpmn:flowNodeRef>Gateway_SystemCheck</bpmn:flowNodeRef><bpmn:flowNodeRef>Gateway_SystemResult</bpmn:flowNodeRef><bpmn:flowNodeRef>Task_4</bpmn:flowNodeRef><bpmn:flowNodeRef>Task_7</bpmn:flowNodeRef>
      </bpmn:lane>
      <bpmn:lane id="Lane_BGD" name="BGĐ Trung tâm / BGĐ Khối">
        <bpmn:flowNodeRef>Task_5</bpmn:flowNodeRef><bpmn:flowNodeRef>Task_8</bpmn:flowNodeRef>
      </bpmn:lane>
      <bpmn:lane id="Lane_CQNV" name="Cơ quan nghiệp vụ VHT">
        <bpmn:flowNodeRef>Task_3</bpmn:flowNodeRef><bpmn:flowNodeRef>Task_9</bpmn:flowNodeRef><bpmn:flowNodeRef>Gateway_9</bpmn:flowNodeRef>
      </bpmn:lane>
      <bpmn:lane id="Lane_CQQL" name="Cơ quan QL KHCN VHT">
        <bpmn:flowNodeRef>Task_10a</bpmn:flowNodeRef><bpmn:flowNodeRef>Task_10b</bpmn:flowNodeRef>
      </bpmn:lane>
      <bpmn:lane id="Lane_HDKHCN" name="Hội đồng KHCN VHT">
        <bpmn:flowNodeRef>Gateway_Scope</bpmn:flowNodeRef><bpmn:flowNodeRef>Call_TD</bpmn:flowNodeRef><bpmn:flowNodeRef>End_TD</bpmn:flowNodeRef><bpmn:flowNodeRef>Task_6</bpmn:flowNodeRef><bpmn:flowNodeRef>Gateway_6</bpmn:flowNodeRef><bpmn:flowNodeRef>End_Save_1</bpmn:flowNodeRef><bpmn:flowNodeRef>Task_11_HD</bpmn:flowNodeRef><bpmn:flowNodeRef>Gateway_11_HD</bpmn:flowNodeRef>
      </bpmn:lane>
      <bpmn:lane id="Lane_TGD" name="Tổng Giám đốc VHT">
        <bpmn:flowNodeRef>Task_11_TGD</bpmn:flowNodeRef><bpmn:flowNodeRef>Gateway_11_TGD</bpmn:flowNodeRef><bpmn:flowNodeRef>End_Save_2</bpmn:flowNodeRef><bpmn:flowNodeRef>Call_CS</bpmn:flowNodeRef><bpmn:flowNodeRef>End_CS</bpmn:flowNodeRef>
      </bpmn:lane>
    </bpmn:laneSet>

    <bpmn:startEvent id="Start_RD01_01" name="Bắt đầu"><bpmn:outgoing>Flow_01</bpmn:outgoing></bpmn:startEvent>
    <bpmn:userTask id="Task_1" name="1. Khởi tạo luồng xét duyệt cấp CS RD01.01">
      <bpmn:extensionElements><zeebe:AssignmentDefinition candidateGroups="PM" /></bpmn:extensionElements>
      <bpmn:incoming>Flow_01</bpmn:incoming><bpmn:outgoing>Flow_02</bpmn:outgoing>
    </bpmn:userTask>
    <bpmn:userTask id="Task_2" name="2. Dự thảo HS xét duyệt cấp CS">
      <bpmn:extensionElements><zeebe:AssignmentDefinition candidateGroups="PM" /></bpmn:extensionElements>
      <bpmn:incoming>Flow_02</bpmn:incoming><bpmn:incoming>Flow_Scope_CS</bpmn:incoming><bpmn:outgoing>Flow_03</bpmn:outgoing>
    </bpmn:userTask>
    <bpmn:serviceTask id="Gateway_SystemCheck" name="Hệ thống — Check điều kiện mặc định">
      <bpmn:extensionElements><zeebe:TaskDefinition type="khcn.rd0101.check-default-condition" retries="3" /></bpmn:extensionElements>
      <bpmn:incoming>Flow_03</bpmn:incoming><bpmn:outgoing>Flow_Check_Result</bpmn:outgoing>
    </bpmn:serviceTask>
    <bpmn:exclusiveGateway id="Gateway_SystemResult" name="Đủ điều kiện mặc định?" default="Flow_Check_Fail">
      <bpmn:incoming>Flow_Check_Result</bpmn:incoming><bpmn:outgoing>Flow_Check_OK</bpmn:outgoing><bpmn:outgoing>Flow_Check_Fail</bpmn:outgoing>
    </bpmn:exclusiveGateway>
    <bpmn:userTask id="Task_3" name="3. PNX cho HS chủ trương">
      <bpmn:extensionElements><zeebe:AssignmentDefinition candidateGroups="CQ_KHCN" /><zeebe:FormDefinition formKey="phieu-nhan-xet" /></bpmn:extensionElements>
      <bpmn:incoming>Flow_Check_OK</bpmn:incoming><bpmn:outgoing>Flow_04</bpmn:outgoing>
    </bpmn:userTask>
    <bpmn:userTask id="Task_4" name="4. Hoàn chỉnh Dự thảo HS chủ trương">
      <bpmn:extensionElements><zeebe:AssignmentDefinition candidateGroups="PM" /></bpmn:extensionElements>
      <bpmn:incoming>Flow_04</bpmn:incoming><bpmn:outgoing>Flow_05</bpmn:outgoing>
    </bpmn:userTask>
    <bpmn:userTask id="Task_5" name="5. Ký HS đề xuất xét duyệt Chủ trương">
      <bpmn:extensionElements><zeebe:AssignmentDefinition candidateGroups="BGD_TT,BGD_KHOI" /><zeebe:FormDefinition formKey="phieu-phe-duyet" /></bpmn:extensionElements>
      <bpmn:incoming>Flow_05</bpmn:incoming><bpmn:outgoing>Flow_06</bpmn:outgoing>
    </bpmn:userTask>
    <bpmn:userTask id="Task_6" name="6. Thẩm định Chủ trương">
      <bpmn:extensionElements><zeebe:AssignmentDefinition candidateGroups="HDKHCN" /><zeebe:FormDefinition formKey="phieu-nhan-xet" /></bpmn:extensionElements>
      <bpmn:incoming>Flow_06</bpmn:incoming><bpmn:outgoing>Flow_07</bpmn:outgoing>
    </bpmn:userTask>
    <bpmn:exclusiveGateway id="Gateway_6" name="Kết quả thẩm định?" default="Flow_6_Reject">
      <bpmn:incoming>Flow_07</bpmn:incoming><bpmn:outgoing>Flow_6_Supplement</bpmn:outgoing><bpmn:outgoing>Flow_6_Rework</bpmn:outgoing><bpmn:outgoing>Flow_6_Reject</bpmn:outgoing>
    </bpmn:exclusiveGateway>
    <bpmn:userTask id="Task_7" name="7. Hoàn chỉnh HS chủ trương">
      <bpmn:extensionElements><zeebe:AssignmentDefinition candidateGroups="PM" /></bpmn:extensionElements>
      <bpmn:incoming>Flow_6_Supplement</bpmn:incoming><bpmn:outgoing>Flow_08</bpmn:outgoing>
    </bpmn:userTask>
    <bpmn:userTask id="Task_8" name="8. Ký duyệt HS">
      <bpmn:extensionElements><zeebe:AssignmentDefinition candidateGroups="BGD_TT,BGD_KHOI" /><zeebe:FormDefinition formKey="phieu-phe-duyet" /></bpmn:extensionElements>
      <bpmn:incoming>Flow_08</bpmn:incoming><bpmn:outgoing>Flow_09</bpmn:outgoing>
    </bpmn:userTask>
    <bpmn:userTask id="Task_9" name="9. Ký duyệt HS">
      <bpmn:extensionElements><zeebe:AssignmentDefinition candidateGroups="TP_CLKHCN" /><zeebe:FormDefinition formKey="phieu-phe-duyet" /></bpmn:extensionElements>
      <bpmn:incoming>Flow_09</bpmn:incoming><bpmn:outgoing>Flow_10</bpmn:outgoing>
    </bpmn:userTask>
    <bpmn:exclusiveGateway id="Gateway_9" name="Kết quả ký duyệt?" default="Flow_9_Rework">
      <bpmn:incoming>Flow_10</bpmn:incoming><bpmn:outgoing>Flow_9_Approve</bpmn:outgoing><bpmn:outgoing>Flow_9_Rework</bpmn:outgoing>
    </bpmn:exclusiveGateway>
    <bpmn:userTask id="Task_10a" name="10a. Lập Báo cáo thẩm định HS Chủ trương">
      <bpmn:extensionElements><zeebe:AssignmentDefinition candidateGroups="CQ_QLKHCN" /><zeebe:FormDefinition formKey="bao-cao-tham-dinh" /></bpmn:extensionElements>
      <bpmn:incoming>Flow_9_Approve</bpmn:incoming><bpmn:outgoing>Flow_11a</bpmn:outgoing>
    </bpmn:userTask>
    <bpmn:userTask id="Task_10b" name="10b. Lập, trình ký QĐ phê duyệt Chủ trương">
      <bpmn:extensionElements><zeebe:AssignmentDefinition candidateGroups="CQ_QLKHCN" /></bpmn:extensionElements>
      <bpmn:incoming>Flow_11HD_Approve</bpmn:incoming><bpmn:outgoing>Flow_11b</bpmn:outgoing>
    </bpmn:userTask>
    <bpmn:userTask id="Task_11_HD" name="11. Ký thông qua Báo cáo Chủ trương">
      <bpmn:extensionElements><zeebe:AssignmentDefinition candidateGroups="HDKHCN" /><zeebe:FormDefinition formKey="phieu-phe-duyet" /></bpmn:extensionElements>
      <bpmn:incoming>Flow_11a</bpmn:incoming><bpmn:outgoing>Flow_12</bpmn:outgoing>
    </bpmn:userTask>
    <bpmn:exclusiveGateway id="Gateway_11_HD" name="HĐ KHCN thông qua?" default="Flow_11HD_Rework">
      <bpmn:incoming>Flow_12</bpmn:incoming><bpmn:outgoing>Flow_11HD_Approve</bpmn:outgoing><bpmn:outgoing>Flow_11HD_Rework</bpmn:outgoing>
    </bpmn:exclusiveGateway>
    <bpmn:userTask id="Task_11_TGD" name="11. Phê duyệt Quyết định mở mới">
      <bpmn:extensionElements><zeebe:AssignmentDefinition candidateGroups="TGD_VHT" /><zeebe:FormDefinition formKey="phieu-phe-duyet" /></bpmn:extensionElements>
      <bpmn:incoming>Flow_11b</bpmn:incoming><bpmn:outgoing>Flow_14</bpmn:outgoing>
    </bpmn:userTask>
    <bpmn:exclusiveGateway id="Gateway_11_TGD" name="TGĐ phê duyệt?" default="Flow_TGD_Reject">
      <bpmn:incoming>Flow_14</bpmn:incoming><bpmn:outgoing>Flow_TGD_Approve</bpmn:outgoing><bpmn:outgoing>Flow_TGD_Rework</bpmn:outgoing><bpmn:outgoing>Flow_TGD_Reject</bpmn:outgoing>
    </bpmn:exclusiveGateway>
    <bpmn:exclusiveGateway id="Gateway_Scope" name="Phạm vi Chủ trương?" default="Flow_Scope_TD">
      <bpmn:incoming>Flow_Check_Fail</bpmn:incoming><bpmn:incoming>Flow_6_Rework</bpmn:incoming><bpmn:incoming>Flow_9_Rework</bpmn:incoming><bpmn:incoming>Flow_11HD_Rework</bpmn:incoming><bpmn:incoming>Flow_TGD_Rework</bpmn:incoming><bpmn:outgoing>Flow_Scope_CS</bpmn:outgoing><bpmn:outgoing>Flow_Scope_TD</bpmn:outgoing>
    </bpmn:exclusiveGateway>
    <bpmn:callActivity id="Call_TD" name="Quy trình xét duyệt Chủ trương cấp TĐ">
      <bpmn:extensionElements><zeebe:CalledElement processId="RD01_02" propagateAllChildVariables="true" /></bpmn:extensionElements>
      <bpmn:incoming>Flow_Scope_TD</bpmn:incoming><bpmn:outgoing>Flow_End_TD</bpmn:outgoing>
    </bpmn:callActivity>
    <bpmn:callActivity id="Call_CS" name="Quy trình xét duyệt cấp CS">
      <bpmn:extensionElements><zeebe:CalledElement processId="RD02_01" propagateAllChildVariables="true" /></bpmn:extensionElements>
      <bpmn:incoming>Flow_TGD_Approve</bpmn:incoming><bpmn:outgoing>Flow_End_CS</bpmn:outgoing>
    </bpmn:callActivity>
    <bpmn:endEvent id="End_TD" name="Chuyển quy trình cấp TĐ"><bpmn:incoming>Flow_End_TD</bpmn:incoming></bpmn:endEvent>
    <bpmn:endEvent id="End_CS" name="Hoàn tất — chuyển xét duyệt cấp CS"><bpmn:incoming>Flow_End_CS</bpmn:incoming></bpmn:endEvent>
    <bpmn:endEvent id="End_Save_1" name="Không đồng ý — Lưu HS"><bpmn:incoming>Flow_6_Reject</bpmn:incoming></bpmn:endEvent>
    <bpmn:endEvent id="End_Save_2" name="Không phê duyệt — Lưu HS"><bpmn:incoming>Flow_TGD_Reject</bpmn:incoming></bpmn:endEvent>

    <bpmn:sequenceFlow id="Flow_01" sourceRef="Start_RD01_01" targetRef="Task_1" />
    <bpmn:sequenceFlow id="Flow_02" sourceRef="Task_1" targetRef="Task_2" />
    <bpmn:sequenceFlow id="Flow_03" sourceRef="Task_2" targetRef="Gateway_SystemCheck" />
    <bpmn:sequenceFlow id="Flow_Check_Result" sourceRef="Gateway_SystemCheck" targetRef="Gateway_SystemResult" />
    <bpmn:sequenceFlow id="Flow_Check_OK" name="Đạt yêu cầu" sourceRef="Gateway_SystemResult" targetRef="Task_3"><bpmn:conditionExpression xsi:type="bpmn:tFormalExpression" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">=dieuKienMacDinhDat = true</bpmn:conditionExpression></bpmn:sequenceFlow>
    <bpmn:sequenceFlow id="Flow_Check_Fail" name="Không đạt yêu cầu" sourceRef="Gateway_SystemResult" targetRef="Gateway_Scope" />
    <bpmn:sequenceFlow id="Flow_04" sourceRef="Task_3" targetRef="Task_4" />
    <bpmn:sequenceFlow id="Flow_05" sourceRef="Task_4" targetRef="Task_5" />
    <bpmn:sequenceFlow id="Flow_06" sourceRef="Task_5" targetRef="Task_6" />
    <bpmn:sequenceFlow id="Flow_07" sourceRef="Task_6" targetRef="Gateway_6" />
    <bpmn:sequenceFlow id="Flow_6_Supplement" name="Đồng ý, yêu cầu bổ sung" sourceRef="Gateway_6" targetRef="Task_7"><bpmn:conditionExpression xsi:type="bpmn:tFormalExpression" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">=ketQuaThamDinh = "dong_y_bo_sung"</bpmn:conditionExpression></bpmn:sequenceFlow>
    <bpmn:sequenceFlow id="Flow_6_Rework" name="Yêu cầu hiệu chỉnh" sourceRef="Gateway_6" targetRef="Gateway_Scope"><bpmn:conditionExpression xsi:type="bpmn:tFormalExpression" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">=ketQuaThamDinh = "hieu_chinh"</bpmn:conditionExpression></bpmn:sequenceFlow>
    <bpmn:sequenceFlow id="Flow_6_Reject" name="Không đồng ý" sourceRef="Gateway_6" targetRef="End_Save_1" />
    <bpmn:sequenceFlow id="Flow_08" sourceRef="Task_7" targetRef="Task_8" />
    <bpmn:sequenceFlow id="Flow_09" sourceRef="Task_8" targetRef="Task_9" />
    <bpmn:sequenceFlow id="Flow_10" sourceRef="Task_9" targetRef="Gateway_9" />
    <bpmn:sequenceFlow id="Flow_9_Approve" name="Đồng ý" sourceRef="Gateway_9" targetRef="Task_10a"><bpmn:conditionExpression xsi:type="bpmn:tFormalExpression" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">=ketQuaKyDuyet = "dong_y"</bpmn:conditionExpression></bpmn:sequenceFlow>
    <bpmn:sequenceFlow id="Flow_9_Rework" name="Yêu cầu hiệu chỉnh" sourceRef="Gateway_9" targetRef="Gateway_Scope" />
    <bpmn:sequenceFlow id="Flow_11a" sourceRef="Task_10a" targetRef="Task_11_HD" />
    <bpmn:sequenceFlow id="Flow_12" sourceRef="Task_11_HD" targetRef="Gateway_11_HD" />
    <bpmn:sequenceFlow id="Flow_11HD_Approve" name="Đồng ý" sourceRef="Gateway_11_HD" targetRef="Task_10b"><bpmn:conditionExpression xsi:type="bpmn:tFormalExpression" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">=ketQuaHDKHCN = "dong_y"</bpmn:conditionExpression></bpmn:sequenceFlow>
    <bpmn:sequenceFlow id="Flow_11HD_Rework" name="Yêu cầu hiệu chỉnh" sourceRef="Gateway_11_HD" targetRef="Gateway_Scope" />
    <bpmn:sequenceFlow id="Flow_11b" sourceRef="Task_10b" targetRef="Task_11_TGD" />
    <bpmn:sequenceFlow id="Flow_14" sourceRef="Task_11_TGD" targetRef="Gateway_11_TGD" />
    <bpmn:sequenceFlow id="Flow_TGD_Approve" name="Đồng ý" sourceRef="Gateway_11_TGD" targetRef="Call_CS"><bpmn:conditionExpression xsi:type="bpmn:tFormalExpression" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">=ketQuaPheDuyet = "dong_y"</bpmn:conditionExpression></bpmn:sequenceFlow>
    <bpmn:sequenceFlow id="Flow_TGD_Rework" name="Yêu cầu hiệu chỉnh" sourceRef="Gateway_11_TGD" targetRef="Gateway_Scope"><bpmn:conditionExpression xsi:type="bpmn:tFormalExpression" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">=ketQuaPheDuyet = "hieu_chinh"</bpmn:conditionExpression></bpmn:sequenceFlow>
    <bpmn:sequenceFlow id="Flow_TGD_Reject" name="Không đồng ý" sourceRef="Gateway_11_TGD" targetRef="End_Save_2" />
    <bpmn:sequenceFlow id="Flow_Scope_CS" name="Phạm vi Chủ trương thuộc cấp CS" sourceRef="Gateway_Scope" targetRef="Task_2"><bpmn:conditionExpression xsi:type="bpmn:tFormalExpression" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">=cap = "CS"</bpmn:conditionExpression></bpmn:sequenceFlow>
    <bpmn:sequenceFlow id="Flow_Scope_TD" name="Phạm vi Chủ trương thuộc cấp TĐ" sourceRef="Gateway_Scope" targetRef="Call_TD" />
    <bpmn:sequenceFlow id="Flow_End_TD" sourceRef="Call_TD" targetRef="End_TD" />
    <bpmn:sequenceFlow id="Flow_End_CS" sourceRef="Call_CS" targetRef="End_CS" />
  </bpmn:process>

  <bpmndi:BPMNDiagram id="Diagram_RD01_01"><bpmndi:BPMNPlane id="Plane_RD01_01" bpmnElement="Collaboration_RD01_01">
    <bpmndi:BPMNShape id="Participant_RD01_01_di" bpmnElement="Participant_RD01_01" isHorizontal="true"><dc:Bounds x="80" y="60" width="2920" height="900" /></bpmndi:BPMNShape>
    <bpmndi:BPMNShape id="Lane_PM_di" bpmnElement="Lane_PM" isHorizontal="true"><dc:Bounds x="110" y="60" width="2890" height="150" /></bpmndi:BPMNShape>
    <bpmndi:BPMNShape id="Lane_BGD_di" bpmnElement="Lane_BGD" isHorizontal="true"><dc:Bounds x="110" y="210" width="2890" height="140" /></bpmndi:BPMNShape>
    <bpmndi:BPMNShape id="Lane_CQNV_di" bpmnElement="Lane_CQNV" isHorizontal="true"><dc:Bounds x="110" y="350" width="2890" height="140" /></bpmndi:BPMNShape>
    <bpmndi:BPMNShape id="Lane_CQQL_di" bpmnElement="Lane_CQQL" isHorizontal="true"><dc:Bounds x="110" y="490" width="2890" height="140" /></bpmndi:BPMNShape>
    <bpmndi:BPMNShape id="Lane_HDKHCN_di" bpmnElement="Lane_HDKHCN" isHorizontal="true"><dc:Bounds x="110" y="630" width="2890" height="170" /></bpmndi:BPMNShape>
    <bpmndi:BPMNShape id="Lane_TGD_di" bpmnElement="Lane_TGD" isHorizontal="true"><dc:Bounds x="110" y="800" width="2890" height="160" /></bpmndi:BPMNShape>
    <bpmndi:BPMNShape id="Start_RD01_01_di" bpmnElement="Start_RD01_01" bioc:fill="#a9dfbf" bioc:stroke="#229954"><dc:Bounds x="150" y="112" width="36" height="36" /></bpmndi:BPMNShape>
    <bpmndi:BPMNShape id="Task_1_di" bpmnElement="Task_1" bioc:fill="#c5d9c3" bioc:stroke="#7dcea0"><dc:Bounds x="220" y="90" width="150" height="80" /></bpmndi:BPMNShape>
    <bpmndi:BPMNShape id="Task_2_di" bpmnElement="Task_2" bioc:fill="#c5d9c3" bioc:stroke="#7dcea0"><dc:Bounds x="420" y="90" width="140" height="80" /></bpmndi:BPMNShape>
    <bpmndi:BPMNShape id="Gateway_SystemCheck_di" bpmnElement="Gateway_SystemCheck" bioc:fill="#fae5d3" bioc:stroke="#e67e22"><dc:Bounds x="610" y="90" width="150" height="80" /></bpmndi:BPMNShape>
    <bpmndi:BPMNShape id="Gateway_SystemResult_di" bpmnElement="Gateway_SystemResult" bioc:fill="#ffffff" bioc:stroke="#333333" isMarkerVisible="true"><dc:Bounds x="775" y="105" width="50" height="50" /></bpmndi:BPMNShape>
    <bpmndi:BPMNShape id="Task_3_di" bpmnElement="Task_3" bioc:fill="#c5d9c3" bioc:stroke="#7dcea0"><dc:Bounds x="810" y="380" width="140" height="80" /></bpmndi:BPMNShape>
    <bpmndi:BPMNShape id="Task_4_di" bpmnElement="Task_4" bioc:fill="#c5d9c3" bioc:stroke="#7dcea0"><dc:Bounds x="1000" y="90" width="140" height="80" /></bpmndi:BPMNShape>
    <bpmndi:BPMNShape id="Task_5_di" bpmnElement="Task_5" bioc:fill="#c5d9c3" bioc:stroke="#7dcea0"><dc:Bounds x="1190" y="240" width="150" height="80" /></bpmndi:BPMNShape>
    <bpmndi:BPMNShape id="Task_6_di" bpmnElement="Task_6" bioc:fill="#c5d9c3" bioc:stroke="#7dcea0"><dc:Bounds x="1390" y="675" width="140" height="80" /></bpmndi:BPMNShape>
    <bpmndi:BPMNShape id="Gateway_6_di" bpmnElement="Gateway_6" bioc:fill="#ffffff" bioc:stroke="#333333" isMarkerVisible="true"><dc:Bounds x="1580" y="690" width="50" height="50" /></bpmndi:BPMNShape>
    <bpmndi:BPMNShape id="Task_7_di" bpmnElement="Task_7" bioc:fill="#c5d9c3" bioc:stroke="#7dcea0"><dc:Bounds x="1680" y="90" width="140" height="80" /></bpmndi:BPMNShape>
    <bpmndi:BPMNShape id="Task_8_di" bpmnElement="Task_8" bioc:fill="#c5d9c3" bioc:stroke="#7dcea0"><dc:Bounds x="1870" y="240" width="140" height="80" /></bpmndi:BPMNShape>
    <bpmndi:BPMNShape id="Task_9_di" bpmnElement="Task_9" bioc:fill="#c5d9c3" bioc:stroke="#7dcea0"><dc:Bounds x="2060" y="380" width="140" height="80" /></bpmndi:BPMNShape>
    <bpmndi:BPMNShape id="Gateway_9_di" bpmnElement="Gateway_9" bioc:fill="#ffffff" bioc:stroke="#333333" isMarkerVisible="true"><dc:Bounds x="2250" y="395" width="50" height="50" /></bpmndi:BPMNShape>
    <bpmndi:BPMNShape id="Task_10a_di" bpmnElement="Task_10a" bioc:fill="#c5d9c3" bioc:stroke="#7dcea0"><dc:Bounds x="2030" y="515" width="170" height="80" /></bpmndi:BPMNShape>
    <bpmndi:BPMNShape id="Task_10b_di" bpmnElement="Task_10b" bioc:fill="#c5d9c3" bioc:stroke="#7dcea0"><dc:Bounds x="1810" y="515" width="170" height="80" /></bpmndi:BPMNShape>
    <bpmndi:BPMNShape id="Task_11_HD_di" bpmnElement="Task_11_HD" bioc:fill="#c5d9c3" bioc:stroke="#7dcea0"><dc:Bounds x="2030" y="660" width="170" height="80" /></bpmndi:BPMNShape>
    <bpmndi:BPMNShape id="Gateway_11_HD_di" bpmnElement="Gateway_11_HD" bioc:fill="#ffffff" bioc:stroke="#333333" isMarkerVisible="true"><dc:Bounds x="2250" y="675" width="50" height="50" /></bpmndi:BPMNShape>
    <bpmndi:BPMNShape id="Task_11_TGD_di" bpmnElement="Task_11_TGD" bioc:fill="#c5d9c3" bioc:stroke="#7dcea0"><dc:Bounds x="2470" y="815" width="170" height="80" /></bpmndi:BPMNShape>
    <bpmndi:BPMNShape id="Gateway_11_TGD_di" bpmnElement="Gateway_11_TGD" bioc:fill="#ffffff" bioc:stroke="#333333" isMarkerVisible="true"><dc:Bounds x="2680" y="830" width="50" height="50" /></bpmndi:BPMNShape>
    <bpmndi:BPMNShape id="Gateway_Scope_di" bpmnElement="Gateway_Scope" bioc:fill="#ffffff" bioc:stroke="#333333" isMarkerVisible="true"><dc:Bounds x="610" y="690" width="50" height="50" /></bpmndi:BPMNShape>
    <bpmndi:BPMNShape id="Call_TD_di" bpmnElement="Call_TD" bioc:fill="#c5d9c3" bioc:stroke="#333333"><dc:Bounds x="280" y="660" width="180" height="80" /></bpmndi:BPMNShape>
    <bpmndi:BPMNShape id="End_TD_di" bpmnElement="End_TD" bioc:fill="#a9dfbf" bioc:stroke="#229954"><dc:Bounds x="180" y="682" width="36" height="36" /></bpmndi:BPMNShape>
    <bpmndi:BPMNShape id="End_Save_1_di" bpmnElement="End_Save_1" bioc:fill="#a9dfbf" bioc:stroke="#229954"><dc:Bounds x="1680" y="682" width="36" height="36" /></bpmndi:BPMNShape>
    <bpmndi:BPMNShape id="Call_CS_di" bpmnElement="Call_CS" bioc:fill="#c5d9c3" bioc:stroke="#333333"><dc:Bounds x="2780" y="805" width="170" height="70" /></bpmndi:BPMNShape>
    <bpmndi:BPMNShape id="End_CS_di" bpmnElement="End_CS" bioc:fill="#a9dfbf" bioc:stroke="#229954"><dc:Bounds x="2960" y="822" width="36" height="36" /></bpmndi:BPMNShape>
    <bpmndi:BPMNShape id="End_Save_2_di" bpmnElement="End_Save_2" bioc:fill="#a9dfbf" bioc:stroke="#229954"><dc:Bounds x="2780" y="912" width="36" height="36" /></bpmndi:BPMNShape>

    <bpmndi:BPMNEdge id="Flow_01_di" bpmnElement="Flow_01"><di:waypoint x="186" y="130"/><di:waypoint x="220" y="130"/></bpmndi:BPMNEdge>
    <bpmndi:BPMNEdge id="Flow_02_di" bpmnElement="Flow_02"><di:waypoint x="370" y="130"/><di:waypoint x="420" y="130"/></bpmndi:BPMNEdge>
    <bpmndi:BPMNEdge id="Flow_03_di" bpmnElement="Flow_03"><di:waypoint x="560" y="130"/><di:waypoint x="610" y="130"/></bpmndi:BPMNEdge>
    <bpmndi:BPMNEdge id="Flow_Check_Result_di" bpmnElement="Flow_Check_Result"><di:waypoint x="760" y="130"/><di:waypoint x="775" y="130"/></bpmndi:BPMNEdge>
    <bpmndi:BPMNEdge id="Flow_Check_OK_di" bpmnElement="Flow_Check_OK"><di:waypoint x="800" y="155"/><di:waypoint x="800" y="420"/><di:waypoint x="810" y="420"/></bpmndi:BPMNEdge>
    <bpmndi:BPMNEdge id="Flow_Check_Fail_di" bpmnElement="Flow_Check_Fail"><di:waypoint x="825" y="130"/><di:waypoint x="845" y="130"/><di:waypoint x="845" y="715"/><di:waypoint x="660" y="715"/></bpmndi:BPMNEdge>
    <bpmndi:BPMNEdge id="Flow_04_di" bpmnElement="Flow_04"><di:waypoint x="950" y="420"/><di:waypoint x="975" y="420"/><di:waypoint x="975" y="130"/><di:waypoint x="1000" y="130"/></bpmndi:BPMNEdge>
    <bpmndi:BPMNEdge id="Flow_05_di" bpmnElement="Flow_05"><di:waypoint x="1140" y="130"/><di:waypoint x="1165" y="130"/><di:waypoint x="1165" y="280"/><di:waypoint x="1190" y="280"/></bpmndi:BPMNEdge>
    <bpmndi:BPMNEdge id="Flow_06_di" bpmnElement="Flow_06"><di:waypoint x="1340" y="280"/><di:waypoint x="1365" y="280"/><di:waypoint x="1365" y="715"/><di:waypoint x="1390" y="715"/></bpmndi:BPMNEdge>
    <bpmndi:BPMNEdge id="Flow_07_di" bpmnElement="Flow_07"><di:waypoint x="1530" y="715"/><di:waypoint x="1580" y="715"/></bpmndi:BPMNEdge>
    <bpmndi:BPMNEdge id="Flow_6_Supplement_di" bpmnElement="Flow_6_Supplement"><di:waypoint x="1605" y="690"/><di:waypoint x="1605" y="130"/><di:waypoint x="1680" y="130"/></bpmndi:BPMNEdge>
    <bpmndi:BPMNEdge id="Flow_6_Rework_di" bpmnElement="Flow_6_Rework"><di:waypoint x="1580" y="715"/><di:waypoint x="660" y="715"/></bpmndi:BPMNEdge>
    <bpmndi:BPMNEdge id="Flow_6_Reject_di" bpmnElement="Flow_6_Reject"><di:waypoint x="1630" y="715"/><di:waypoint x="1680" y="700"/></bpmndi:BPMNEdge>
    <bpmndi:BPMNEdge id="Flow_08_di" bpmnElement="Flow_08"><di:waypoint x="1820" y="130"/><di:waypoint x="1845" y="130"/><di:waypoint x="1845" y="280"/><di:waypoint x="1870" y="280"/></bpmndi:BPMNEdge>
    <bpmndi:BPMNEdge id="Flow_09_di" bpmnElement="Flow_09"><di:waypoint x="2010" y="280"/><di:waypoint x="2035" y="280"/><di:waypoint x="2035" y="420"/><di:waypoint x="2060" y="420"/></bpmndi:BPMNEdge>
    <bpmndi:BPMNEdge id="Flow_10_di" bpmnElement="Flow_10"><di:waypoint x="2200" y="420"/><di:waypoint x="2250" y="420"/></bpmndi:BPMNEdge>
    <bpmndi:BPMNEdge id="Flow_9_Approve_di" bpmnElement="Flow_9_Approve"><di:waypoint x="2275" y="445"/><di:waypoint x="2275" y="475"/><di:waypoint x="2115" y="475"/><di:waypoint x="2115" y="515"/></bpmndi:BPMNEdge>
    <bpmndi:BPMNEdge id="Flow_9_Rework_di" bpmnElement="Flow_9_Rework"><di:waypoint x="2250" y="420"/><di:waypoint x="650" y="420"/><di:waypoint x="650" y="690"/></bpmndi:BPMNEdge>
    <bpmndi:BPMNEdge id="Flow_11a_di" bpmnElement="Flow_11a"><di:waypoint x="2115" y="595"/><di:waypoint x="2115" y="660"/></bpmndi:BPMNEdge>
    <bpmndi:BPMNEdge id="Flow_12_di" bpmnElement="Flow_12"><di:waypoint x="2200" y="700"/><di:waypoint x="2250" y="700"/></bpmndi:BPMNEdge>
    <bpmndi:BPMNEdge id="Flow_11HD_Approve_di" bpmnElement="Flow_11HD_Approve"><di:waypoint x="2300" y="700"/><di:waypoint x="2325" y="700"/><di:waypoint x="2325" y="610"/><di:waypoint x="1895" y="610"/><di:waypoint x="1895" y="595"/></bpmndi:BPMNEdge>
    <bpmndi:BPMNEdge id="Flow_11HD_Rework_di" bpmnElement="Flow_11HD_Rework"><di:waypoint x="2250" y="700"/><di:waypoint x="660" y="700"/></bpmndi:BPMNEdge>
    <bpmndi:BPMNEdge id="Flow_11b_di" bpmnElement="Flow_11b"><di:waypoint x="1810" y="555"/><di:waypoint x="1760" y="555"/><di:waypoint x="1760" y="785"/><di:waypoint x="2555" y="785"/><di:waypoint x="2555" y="815"/></bpmndi:BPMNEdge>
    <bpmndi:BPMNEdge id="Flow_14_di" bpmnElement="Flow_14"><di:waypoint x="2640" y="855"/><di:waypoint x="2680" y="855"/></bpmndi:BPMNEdge>
    <bpmndi:BPMNEdge id="Flow_TGD_Approve_di" bpmnElement="Flow_TGD_Approve"><di:waypoint x="2730" y="855"/><di:waypoint x="2755" y="855"/><di:waypoint x="2755" y="840"/><di:waypoint x="2780" y="840"/></bpmndi:BPMNEdge>
    <bpmndi:BPMNEdge id="Flow_TGD_Rework_di" bpmnElement="Flow_TGD_Rework"><di:waypoint x="2705" y="830"/><di:waypoint x="2705" y="780"/><di:waypoint x="635" y="780"/><di:waypoint x="635" y="740"/></bpmndi:BPMNEdge>
    <bpmndi:BPMNEdge id="Flow_TGD_Reject_di" bpmnElement="Flow_TGD_Reject"><di:waypoint x="2705" y="880"/><di:waypoint x="2705" y="930"/><di:waypoint x="2780" y="930"/></bpmndi:BPMNEdge>
    <bpmndi:BPMNEdge id="Flow_Scope_CS_di" bpmnElement="Flow_Scope_CS"><di:waypoint x="635" y="690"/><di:waypoint x="635" y="190"/><di:waypoint x="490" y="190"/><di:waypoint x="490" y="170"/></bpmndi:BPMNEdge>
    <bpmndi:BPMNEdge id="Flow_Scope_TD_di" bpmnElement="Flow_Scope_TD"><di:waypoint x="610" y="715"/><di:waypoint x="460" y="700"/></bpmndi:BPMNEdge>
    <bpmndi:BPMNEdge id="Flow_End_TD_di" bpmnElement="Flow_End_TD"><di:waypoint x="280" y="700"/><di:waypoint x="216" y="700"/></bpmndi:BPMNEdge>
    <bpmndi:BPMNEdge id="Flow_End_CS_di" bpmnElement="Flow_End_CS"><di:waypoint x="2950" y="840"/><di:waypoint x="2960" y="840"/></bpmndi:BPMNEdge>
  </bpmndi:BPMNPlane></bpmndi:BPMNDiagram>
</bpmn:definitions>`
