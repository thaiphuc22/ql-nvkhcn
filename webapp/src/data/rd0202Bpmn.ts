// BPMN cho RD02.02 — Xét duyệt NV KHCN cấp Tập đoàn.
// Nguồn: File gốc RD02_02_Xet_duyet_NV_KHCN_cap_Tap_doan_Camunda8.bpmn (2026-07-21).
// Đây là bản đầy đủ từ Camunda Web Modeler, bao gồm BPMN DI (tọa độ vị trí).

export const RD0202_BPMN = `<?xml version="1.0" encoding="UTF-8"?>
<bpmn:definitions xmlns:bpmn="http://www.omg.org/spec/BPMN/20100524/MODEL" xmlns:bpmndi="http://www.omg.org/spec/BPMN/20100524/DI" xmlns:dc="http://www.omg.org/spec/DD/20100524/DC" xmlns:di="http://www.omg.org/spec/DD/20100524/DI" xmlns:zeebe="http://camunda.org/schema/zeebe/1.0" xmlns:modeler="http://camunda.org/schema/modeler/1.0" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" id="Definitions_RD0202" targetNamespace="http://viettel.vn/khcn/rd0202" exporter="Camunda Web Modeler" exporterVersion="0a0ba04" modeler:executionPlatform="Camunda Cloud" modeler:executionPlatformVersion="8.10.0">
  <bpmn:process id="Process_RD0202" name="RD02.02 - Xét duyệt nhiệm vụ KHCN cấp Tập đoàn" isExecutable="true">
    <bpmn:documentation>Biến điều kiện dự kiến: draft1Valid, draft2Signed, councilVhtApproved, draft3Valid, vhtCouncilResult, hsxdVhtSigned, cvApproved, dossierComplete, councilTdApproved, draft4Valid, tdCouncilResult, hsxd5LeadershipSigned, hsxd5Approved, appraisalReportApproved, finalDecisionApproved. Các biến Boolean dùng true/false; kết quả Hội đồng dùng APPROVED, REJECTED hoặc giá trị khác để đi nhánh mặc định yêu cầu hoàn thiện.</bpmn:documentation>
    <bpmn:extensionElements>
      <zeebe:userTaskForm id="UserTaskForm_273inci">{
  "executionPlatform": "Camunda Cloud",
  "executionPlatformVersion": "8.9.0",
  "exporter": {
    "name": "Camunda Web Modeler",
    "version": "0ac4534"
  },
  "schemaVersion": 19,
  "id": "Form_10xosxg",
  "components": [
    { "text": "### Phiếu Yêu Cầu", "type": "text", "id": "Heading_Main", "layout": { "row": "Row_1", "col": 16 } },
    { "text": "##### Thông tin người yêu cầu", "type": "text", "id": "Subheading_Requester", "layout": { "row": "Row_2", "col": 16 } },
    { "label": "Họ và tên", "type": "textfield", "id": "Field_RequesterName", "key": "requesterName", "layout": { "row": "Row_3", "col": 8 }, "validate": { "required": true } },
    { "label": "Phòng ban/Bộ phận", "type": "textfield", "id": "Field_Department", "key": "department", "layout": { "row": "Row_3", "col": 8 }, "validate": { "required": true } },
    { "label": "Chức vụ", "type": "textfield", "id": "Field_Position", "key": "position", "layout": { "row": "Row_4", "col": 8 } },
    { "subtype": "date", "type": "datetime", "id": "Field_CreationDate", "key": "creationDate", "dateLabel": "Ngày tạo yêu cầu", "layout": { "row": "Row_4", "col": 8 }, "defaultValue": "=today()", "validate": { "required": true } },
    { "text": "##### Nội dung yêu cầu", "type": "text", "id": "Subheading_RequestContent", "layout": { "row": "Row_5", "col": 16 } },
    { "label": "Tiêu đề yêu cầu", "type": "textfield", "id": "Field_RequestTitle", "key": "requestTitle", "layout": { "row": "Row_6", "col": 8 }, "validate": { "required": true } },
    { "label": "Loại yêu cầu", "values": [ { "label": "Nghỉ phép", "value": "leave" }, { "label": "Mua sắm", "value": "procurement" }, { "label": "Tạm ứng", "value": "advance" } ], "type": "select", "id": "Field_RequestType", "key": "requestType", "layout": { "row": "Row_6", "col": 8 }, "validate": { "required": true } },
    { "label": "Mô tả chi tiết nội dung yêu cầu", "type": "textarea", "id": "Field_RequestDescription", "key": "requestDescription", "layout": { "row": "Row_7", "col": 16 }, "validate": { "required": true } },
    { "subtype": "date", "type": "datetime", "id": "Field_StartDate", "key": "startDate", "dateLabel": "Ngày bắt đầu", "layout": { "row": "Row_8", "col": 8 } },
    { "subtype": "date", "type": "datetime", "id": "Field_EndDate", "key": "endDate", "dateLabel": "Ngày kết thúc", "layout": { "row": "Row_8", "col": 8 } },
    { "text": "Tài liệu đính kèm (nếu có) sẽ được tải lên ở bước tiếp theo.", "type": "text", "id": "Paragraph_Attachment", "layout": { "row": "Row_9", "col": 16 } },
    { "text": "##### Phần xét duyệt", "type": "text", "id": "Subheading_Approval", "layout": { "row": "Row_10", "col": 16 } },
    { "label": "Người xét duyệt", "type": "textfield", "id": "Field_Approver", "key": "approver", "layout": { "row": "Row_11", "col": 16 } },
    { "label": "Quyết định", "values": [ { "label": "Phê duyệt", "value": "approved" }, { "label": "Từ chối", "value": "rejected" }, { "label": "Yêu cầu bổ sung", "value": "clarification" } ], "type": "radio", "id": "Field_Decision", "key": "decision", "layout": { "row": "Row_12", "col": 16 } },
    { "label": "Lý do / Ghi chú của người duyệt", "type": "textarea", "id": "Field_ApprovalNotes", "key": "approvalNotes", "layout": { "row": "Row_13", "col": 16 } },
    { "subtype": "date", "type": "datetime", "id": "Field_ApprovalDate", "key": "approvalDate", "dateLabel": "Ngày xét duyệt", "layout": { "row": "Row_14", "col": 8 } },
    { "label": "Chữ ký người duyệt (nhập họ tên)", "type": "textfield", "id": "Field_ApproverSignature", "key": "approverSignature", "layout": { "row": "Row_14", "col": 8 } }
  ],
  "generated": true,
  "type": "default"
}</zeebe:userTaskForm>
    </bpmn:extensionElements>
    <bpmn:laneSet id="LaneSet_RD0202">
      <bpmn:lane id="Lane_CQ_VHT" name="CQ KHCN / TCKT / MS / NS - VHT">
        <bpmn:flowNodeRef>Task_3_KHCN</bpmn:flowNodeRef>
        <bpmn:flowNodeRef>Task_3_TCKT</bpmn:flowNodeRef>
        <bpmn:flowNodeRef>Task_3_MS</bpmn:flowNodeRef>
        <bpmn:flowNodeRef>Task_3_NS</bpmn:flowNodeRef>
        <bpmn:flowNodeRef>Task_5</bpmn:flowNodeRef>
        <bpmn:flowNodeRef>Task_7</bpmn:flowNodeRef>
        <bpmn:flowNodeRef>Task_9_KHCN</bpmn:flowNodeRef>
        <bpmn:flowNodeRef>Task_9_TCKT</bpmn:flowNodeRef>
        <bpmn:flowNodeRef>Task_9_MS</bpmn:flowNodeRef>
        <bpmn:flowNodeRef>Task_9_NS</bpmn:flowNodeRef>
        <bpmn:flowNodeRef>Task_10</bpmn:flowNodeRef>
        <bpmn:flowNodeRef>Activity_1q37p00</bpmn:flowNodeRef>
        <bpmn:flowNodeRef>Activity_03fbbgn</bpmn:flowNodeRef>
        <bpmn:flowNodeRef>Task_4</bpmn:flowNodeRef>
        <bpmn:flowNodeRef>Gateway_ReviewSplit1</bpmn:flowNodeRef>
        <bpmn:flowNodeRef>Gateway_ReviewJoin1</bpmn:flowNodeRef>
        <bpmn:flowNodeRef>Gateway_Draft3Valid</bpmn:flowNodeRef>
        <bpmn:flowNodeRef>Gateway_ResultVHT</bpmn:flowNodeRef>
        <bpmn:flowNodeRef>EndEvent_VHTReject</bpmn:flowNodeRef>
        <bpmn:flowNodeRef>Gateway_ReviewSplit2</bpmn:flowNodeRef>
        <bpmn:flowNodeRef>Gateway_SignDraft2</bpmn:flowNodeRef>
        <bpmn:flowNodeRef>Gateway_ReviewJoin2</bpmn:flowNodeRef>
      </bpmn:lane>
      <bpmn:lane id="Lane_CQQL_VHT" name="CQ QLKHCN VHT">
        <bpmn:flowNodeRef>Task_6</bpmn:flowNodeRef>
        <bpmn:flowNodeRef>Gateway_ApproveCouncilVHT</bpmn:flowNodeRef>
      </bpmn:lane>
      <bpmn:lane id="Lane_System" name="Hệ thống">
        <bpmn:flowNodeRef>Task_CheckDraft1</bpmn:flowNodeRef>
        <bpmn:flowNodeRef>Gateway_Draft1Valid</bpmn:flowNodeRef>
      </bpmn:lane>
      <bpmn:lane id="Lane_PM" name="PM / PA / NNC">
        <bpmn:flowNodeRef>Task_1</bpmn:flowNodeRef>
        <bpmn:flowNodeRef>Task_2</bpmn:flowNodeRef>
        <bpmn:flowNodeRef>Task_3_5</bpmn:flowNodeRef>
        <bpmn:flowNodeRef>Task_8</bpmn:flowNodeRef>
        <bpmn:flowNodeRef>Task_11</bpmn:flowNodeRef>
        <bpmn:flowNodeRef>Activity_18j9frf</bpmn:flowNodeRef>
        <bpmn:flowNodeRef>StartEvent_1</bpmn:flowNodeRef>
      </bpmn:lane>
    </bpmn:laneSet>
    <bpmn:startEvent id="StartEvent_1" name="Có QĐ phê duyệt chủ trương cấp Tập đoàn">
      <bpmn:outgoing>Flow_001</bpmn:outgoing>
    </bpmn:startEvent>
    <bpmn:userTask id="Task_1" name="1. Khởi tạo luồng RD02.02">
      <bpmn:extensionElements>
        <zeebe:formDefinition formKey="camunda-forms:bpmn:UserTaskForm_273inci" />
      </bpmn:extensionElements>
      <bpmn:incoming>Flow_001</bpmn:incoming>
      <bpmn:outgoing>Flow_002</bpmn:outgoing>
    </bpmn:userTask>
    <bpmn:userTask id="Task_2" name="2. Xây dựng HSXD dự thảo 1">
      <bpmn:incoming>Flow_002</bpmn:incoming>
      <bpmn:incoming>Flow_Draft1_Invalid</bpmn:incoming>
      <bpmn:outgoing>Flow_003</bpmn:outgoing>
    </bpmn:userTask>
    <bpmn:serviceTask id="Task_CheckDraft1" name="Hệ thống kiểm tra HSXD dự thảo 1">
      <bpmn:extensionElements>
        <zeebe:taskDefinition type="rd0202-check-draft1" retries="3" />
      </bpmn:extensionElements>
      <bpmn:incoming>Flow_003</bpmn:incoming>
      <bpmn:outgoing>Flow_Check_to_GW</bpmn:outgoing>
    </bpmn:serviceTask>
    <bpmn:exclusiveGateway id="Gateway_Draft1Valid" name="HSXD dự thảo 1 hợp lệ?" default="Flow_Draft1_Invalid">
      <bpmn:incoming>Flow_Check_to_GW</bpmn:incoming>
      <bpmn:outgoing>Flow_Draft1_Valid</bpmn:outgoing>
      <bpmn:outgoing>Flow_Draft1_Invalid</bpmn:outgoing>
    </bpmn:exclusiveGateway>
    <bpmn:parallelGateway id="Gateway_ReviewSplit1" name="Tách thẩm định VHT">
      <bpmn:incoming>Flow_Draft1_Valid</bpmn:incoming>
      <bpmn:outgoing>Flow_Review1_KHCN</bpmn:outgoing>
      <bpmn:outgoing>Flow_Review1_TCKT</bpmn:outgoing>
      <bpmn:outgoing>Flow_Review1_MS</bpmn:outgoing>
      <bpmn:outgoing>Flow_Review1_NS</bpmn:outgoing>
    </bpmn:parallelGateway>
    <bpmn:userTask id="Task_3_KHCN" name="3.1. Thẩm định KHCN">
      <bpmn:documentation>PNX_KHCN</bpmn:documentation>
      <bpmn:incoming>Flow_Review1_KHCN</bpmn:incoming>
      <bpmn:outgoing>Flow_Review1Join_KHCN</bpmn:outgoing>
    </bpmn:userTask>
    <bpmn:userTask id="Task_3_TCKT" name="3.2. Thẩm định TCKT">
      <bpmn:incoming>Flow_Review1_TCKT</bpmn:incoming>
      <bpmn:outgoing>Flow_Review1Join_TCKT</bpmn:outgoing>
    </bpmn:userTask>
    <bpmn:userTask id="Task_3_MS" name="3.3. Thẩm định Mua sắm">
      <bpmn:incoming>Flow_Review1_MS</bpmn:incoming>
      <bpmn:outgoing>Flow_Review1Join_MS</bpmn:outgoing>
    </bpmn:userTask>
    <bpmn:userTask id="Task_3_NS" name="3.4. Thẩm định Nhân sự">
      <bpmn:incoming>Flow_Review1_NS</bpmn:incoming>
      <bpmn:outgoing>Flow_Review1Join_NS</bpmn:outgoing>
    </bpmn:userTask>
    <bpmn:parallelGateway id="Gateway_ReviewJoin1" name="Gộp kết quả thẩm định VHT">
      <bpmn:incoming>Flow_Review1Join_KHCN</bpmn:incoming>
      <bpmn:incoming>Flow_Review1Join_TCKT</bpmn:incoming>
      <bpmn:incoming>Flow_Review1Join_MS</bpmn:incoming>
      <bpmn:incoming>Flow_Review1Join_NS</bpmn:incoming>
      <bpmn:outgoing>Flow_0h1epkq</bpmn:outgoing>
    </bpmn:parallelGateway>
    <bpmn:userTask id="Task_3_5" name="3.5. Nhận PNX và hoàn chỉnh HSXD dự thảo 2">
      <bpmn:incoming>Flow_SignDraft2_Revise</bpmn:incoming>
      <bpmn:incoming>Flow_125ekuj</bpmn:incoming>
      <bpmn:outgoing>Flow_004</bpmn:outgoing>
    </bpmn:userTask>
    <bpmn:userTask id="Task_4" name="4. Ký HSXD dự thảo 2">
      <bpmn:incoming>Flow_004</bpmn:incoming>
      <bpmn:outgoing>Flow_004A</bpmn:outgoing>
    </bpmn:userTask>
    <bpmn:exclusiveGateway id="Gateway_SignDraft2" name="Kết quả ký HSXD dự thảo 2?" default="Flow_SignDraft2_Revise">
      <bpmn:incoming>Flow_004A</bpmn:incoming>
      <bpmn:outgoing>Flow_SignDraft2_OK</bpmn:outgoing>
      <bpmn:outgoing>Flow_SignDraft2_Revise</bpmn:outgoing>
    </bpmn:exclusiveGateway>
    <bpmn:userTask id="Task_5" name="5. Lập và trình QĐ thành lập HĐXD VHT">
      <bpmn:incoming>Flow_SignDraft2_OK</bpmn:incoming>
      <bpmn:incoming>Flow_CouncilVHT_Rework</bpmn:incoming>
      <bpmn:outgoing>Flow_005</bpmn:outgoing>
    </bpmn:userTask>
    <bpmn:userTask id="Task_6" name="6. Phê duyệt QĐ thành lập HĐXD VHT">
      <bpmn:incoming>Flow_005</bpmn:incoming>
      <bpmn:outgoing>Flow_006A</bpmn:outgoing>
    </bpmn:userTask>
    <bpmn:exclusiveGateway id="Gateway_ApproveCouncilVHT" name="QĐ HĐXD VHT được phê duyệt?" default="Flow_CouncilVHT_Rework">
      <bpmn:incoming>Flow_006A</bpmn:incoming>
      <bpmn:outgoing>Flow_CouncilVHT_OK</bpmn:outgoing>
      <bpmn:outgoing>Flow_CouncilVHT_Rework</bpmn:outgoing>
    </bpmn:exclusiveGateway>
    <bpmn:userTask id="Task_7" name="7. Họp HĐXD VHT phiên 1">
      <bpmn:incoming>Flow_CouncilVHT_OK</bpmn:incoming>
      <bpmn:outgoing>Flow_0licdxa</bpmn:outgoing>
    </bpmn:userTask>
    <bpmn:userTask id="Task_8" name="8. Hoàn thiện HSXD dự thảo 3">
      <bpmn:incoming>Flow_Draft3_Rework</bpmn:incoming>
      <bpmn:incoming>Flow_1u346ib</bpmn:incoming>
      <bpmn:outgoing>Flow_008</bpmn:outgoing>
    </bpmn:userTask>
    <bpmn:parallelGateway id="Gateway_ReviewSplit2" name="Tách rà soát HSXD 3">
      <bpmn:incoming>Flow_008</bpmn:incoming>
      <bpmn:outgoing>Flow_Review2_KHCN</bpmn:outgoing>
      <bpmn:outgoing>Flow_Review2_NS</bpmn:outgoing>
      <bpmn:outgoing>Flow_0tuszyn</bpmn:outgoing>
      <bpmn:outgoing>Flow_1c653vr</bpmn:outgoing>
    </bpmn:parallelGateway>
    <bpmn:userTask id="Task_9_KHCN" name="9.1. Rà soát KHCN">
      <bpmn:incoming>Flow_Review2_KHCN</bpmn:incoming>
      <bpmn:outgoing>Flow_0s03ysv</bpmn:outgoing>
    </bpmn:userTask>
    <bpmn:userTask id="Task_9_TCKT" name="9.2. Rà soát TCKT">
      <bpmn:incoming>Flow_Review2_NS</bpmn:incoming>
      <bpmn:outgoing>Flow_1fa8vpt</bpmn:outgoing>
    </bpmn:userTask>
    <bpmn:userTask id="Task_9_MS" name="9.3. Rà soát Mua sắm">
      <bpmn:incoming>Flow_0tuszyn</bpmn:incoming>
      <bpmn:outgoing>Flow_0ryugaq</bpmn:outgoing>
    </bpmn:userTask>
    <bpmn:userTask id="Task_9_NS" name="9.4. Rà soát Nhân sự">
      <bpmn:incoming>Flow_1c653vr</bpmn:incoming>
      <bpmn:outgoing>Flow_Review2Join_NS</bpmn:outgoing>
    </bpmn:userTask>
    <bpmn:parallelGateway id="Gateway_ReviewJoin2" name="Gộp rà soát HSXD 3">
      <bpmn:incoming>Flow_1fa8vpt</bpmn:incoming>
      <bpmn:incoming>Flow_Review2Join_NS</bpmn:incoming>
      <bpmn:incoming>Flow_0s03ysv</bpmn:incoming>
      <bpmn:incoming>Flow_0ryugaq</bpmn:incoming>
      <bpmn:outgoing>Flow_Review2_Done</bpmn:outgoing>
    </bpmn:parallelGateway>
    <bpmn:exclusiveGateway id="Gateway_Draft3Valid" name="HSXD dự thảo 3 đạt yêu cầu?" default="Flow_Draft3_Rework">
      <bpmn:incoming>Flow_Review2_Done</bpmn:incoming>
      <bpmn:outgoing>Flow_Draft3_OK</bpmn:outgoing>
      <bpmn:outgoing>Flow_Draft3_Rework</bpmn:outgoing>
    </bpmn:exclusiveGateway>
    <bpmn:userTask id="Task_10" name="10. Họp HĐXD VHT phiên 2">
      <bpmn:incoming>Flow_Draft3_OK</bpmn:incoming>
      <bpmn:outgoing>Flow_14w4wvo</bpmn:outgoing>
    </bpmn:userTask>
    <bpmn:exclusiveGateway id="Gateway_ResultVHT" name="Kết quả HĐXD VHT phiên 2?">
      <bpmn:incoming>Flow_1o5t1cc</bpmn:incoming>
      <bpmn:outgoing>Flow_ResultVHT_OK</bpmn:outgoing>
      <bpmn:outgoing>Flow_08pyqdp</bpmn:outgoing>
    </bpmn:exclusiveGateway>
    <bpmn:endEvent id="EndEvent_VHTReject" name="Hồ sơ không được thông qua tại VHT">
      <bpmn:incoming>Flow_08pyqdp</bpmn:incoming>
    </bpmn:endEvent>
    <bpmn:userTask id="Task_11" name="11. Lập CV đề nghị xét duyệt cấp Tập đoàn">
      <bpmn:incoming>Flow_ResultVHT_OK</bpmn:incoming>
    </bpmn:userTask>
    <bpmn:sequenceFlow id="Flow_001" sourceRef="StartEvent_1" targetRef="Task_1" />
    <bpmn:sequenceFlow id="Flow_002" sourceRef="Task_1" targetRef="Task_2" />
    <bpmn:sequenceFlow id="Flow_003" sourceRef="Task_2" targetRef="Task_CheckDraft1" />
    <bpmn:sequenceFlow id="Flow_Draft1_Valid" name="Đạt" sourceRef="Gateway_Draft1Valid" targetRef="Gateway_ReviewSplit1">
      <bpmn:conditionExpression xsi:type="bpmn:tFormalExpression">= draft1Valid = true</bpmn:conditionExpression>
    </bpmn:sequenceFlow>
    <bpmn:sequenceFlow id="Flow_Draft1_Invalid" name="Chưa đạt" sourceRef="Gateway_Draft1Valid" targetRef="Task_2" />
    <bpmn:sequenceFlow id="Flow_Check_to_GW" sourceRef="Task_CheckDraft1" targetRef="Gateway_Draft1Valid" />
    <bpmn:sequenceFlow id="Flow_Review1_KHCN" sourceRef="Gateway_ReviewSplit1" targetRef="Task_3_KHCN" />
    <bpmn:sequenceFlow id="Flow_Review1_TCKT" sourceRef="Gateway_ReviewSplit1" targetRef="Task_3_TCKT" />
    <bpmn:sequenceFlow id="Flow_Review1_MS" sourceRef="Gateway_ReviewSplit1" targetRef="Task_3_MS" />
    <bpmn:sequenceFlow id="Flow_Review1_NS" sourceRef="Gateway_ReviewSplit1" targetRef="Task_3_NS" />
    <bpmn:sequenceFlow id="Flow_Review1Join_KHCN" sourceRef="Task_3_KHCN" targetRef="Gateway_ReviewJoin1" />
    <bpmn:sequenceFlow id="Flow_Review1Join_TCKT" sourceRef="Task_3_TCKT" targetRef="Gateway_ReviewJoin1" />
    <bpmn:sequenceFlow id="Flow_Review1Join_MS" sourceRef="Task_3_MS" targetRef="Gateway_ReviewJoin1" />
    <bpmn:sequenceFlow id="Flow_Review1Join_NS" sourceRef="Task_3_NS" targetRef="Gateway_ReviewJoin1" />
    <bpmn:sequenceFlow id="Flow_004" sourceRef="Task_3_5" targetRef="Task_4" />
    <bpmn:sequenceFlow id="Flow_004A" sourceRef="Task_4" targetRef="Gateway_SignDraft2" />
    <bpmn:sequenceFlow id="Flow_SignDraft2_OK" name="Đồng ý" sourceRef="Gateway_SignDraft2" targetRef="Task_5">
      <bpmn:conditionExpression xsi:type="bpmn:tFormalExpression">= draft2Signed = true</bpmn:conditionExpression>
    </bpmn:sequenceFlow>
    <bpmn:sequenceFlow id="Flow_SignDraft2_Revise" name="Yêu cầu chỉnh sửa" sourceRef="Gateway_SignDraft2" targetRef="Task_3_5" />
    <bpmn:sequenceFlow id="Flow_005" sourceRef="Task_5" targetRef="Task_6" />
    <bpmn:sequenceFlow id="Flow_006A" sourceRef="Task_6" targetRef="Gateway_ApproveCouncilVHT" />
    <bpmn:sequenceFlow id="Flow_CouncilVHT_OK" name="Phê duyệt" sourceRef="Gateway_ApproveCouncilVHT" targetRef="Task_7">
      <bpmn:conditionExpression xsi:type="bpmn:tFormalExpression">= councilVhtApproved = true</bpmn:conditionExpression>
    </bpmn:sequenceFlow>
    <bpmn:sequenceFlow id="Flow_CouncilVHT_Rework" name="Yêu cầu chỉnh sửa" sourceRef="Gateway_ApproveCouncilVHT" targetRef="Task_5" />
    <bpmn:sequenceFlow id="Flow_008" sourceRef="Task_8" targetRef="Gateway_ReviewSplit2" />
    <bpmn:sequenceFlow id="Flow_Review2_KHCN" sourceRef="Gateway_ReviewSplit2" targetRef="Task_9_KHCN" />
    <bpmn:sequenceFlow id="Flow_Review2_NS" sourceRef="Gateway_ReviewSplit2" targetRef="Task_9_TCKT" />
    <bpmn:sequenceFlow id="Flow_Review2Join_NS" sourceRef="Task_9_NS" targetRef="Gateway_ReviewJoin2" />
    <bpmn:sequenceFlow id="Flow_Review2_Done" sourceRef="Gateway_ReviewJoin2" targetRef="Gateway_Draft3Valid" />
    <bpmn:sequenceFlow id="Flow_Draft3_OK" name="Đạt" sourceRef="Gateway_Draft3Valid" targetRef="Task_10">
      <bpmn:conditionExpression xsi:type="bpmn:tFormalExpression">= draft3Valid = true</bpmn:conditionExpression>
    </bpmn:sequenceFlow>
    <bpmn:sequenceFlow id="Flow_Draft3_Rework" name="Chưa đạt" sourceRef="Gateway_Draft3Valid" targetRef="Task_8" />
    <bpmn:sequenceFlow id="Flow_ResultVHT_OK" name="Thông qua" sourceRef="Gateway_ResultVHT" targetRef="Task_11">
      <bpmn:conditionExpression xsi:type="bpmn:tFormalExpression">= vhtCouncilResult = "APPROVED"</bpmn:conditionExpression>
    </bpmn:sequenceFlow>
    <bpmn:serviceTask id="Activity_18j9frf" name="AI Agent: Tổng hợp nhận xét và gửi tiếp">
      <bpmn:extensionElements>
        <zeebe:taskDefinition type="io.camunda.agenticai:aiagent:1" retries="3" />
        <zeebe:ioMapping>
          <zeebe:input source="Task_3_KHCN" target="taskInput.cqKhcnNhanXet" />
          <zeebe:input source="Task_3_TCKT" target="taskInput.cqTcktNhanXet" />
          <zeebe:input source="Task_3_MS" target="taskInput.cqMsNhanXet" />
          <zeebe:input source="Task_3_NS" target="taskInput.cqNsNhanXet" />
          <zeebe:input source="openai" target="provider.type" />
          <zeebe:input source="gpt-4o" target="provider.openai.model.model" />
          <zeebe:input source="Bạn là trợ lý AI tổng hợp nhận xét từ 4 Cơ quan VHT (KHCN, TCKT, MS, NS). Phân tích và tổng hợp các nhận xét thành báo cáo ngắn gọn gồm: điểm mạnh chung, điểm yếu chung, khuyến nghị cải thiện. Chuẩn bị email gửi PM với tiêu đề và nội dung phù hợp. Trả về JSON: {tomTatNhanXet, diemManh, diemYeu, khuyenNghi, emailContent}" target="taskInstruction" />
          <zeebe:output source="taskResult.tomTatNhanXet" target="tomTatNhanXet" />
          <zeebe:output source="taskResult.diemManh" target="diemManhChung" />
          <zeebe:output source="taskResult.diemYeu" target="diemYeuChung" />
          <zeebe:output source="taskResult.khuyenNghi" target="khuyenNghi" />
          <zeebe:output source="taskResult.emailContent" target="emailContent" />
        </zeebe:ioMapping>
      </bpmn:extensionElements>
      <bpmn:incoming>Flow_0h1epkq</bpmn:incoming>
      <bpmn:outgoing>Flow_125ekuj</bpmn:outgoing>
    </bpmn:serviceTask>
    <bpmn:sequenceFlow id="Flow_0h1epkq" sourceRef="Gateway_ReviewJoin1" targetRef="Activity_18j9frf" />
    <bpmn:sequenceFlow id="Flow_125ekuj" sourceRef="Activity_18j9frf" targetRef="Task_3_5" />
    <bpmn:serviceTask id="Activity_1q37p00" name="AI Agent: Tổng hợp biên bản họp và gửi tiếp">
      <bpmn:extensionElements>
        <zeebe:taskDefinition type="io.camunda.agenticai:aiagent:1" retries="3" />
        <zeebe:ioMapping>
          <zeebe:input source="Task_7" target="taskInput.bienBanHdxdVht" />
          <zeebe:input source="Task_9_KHCN" target="taskInput.raSoatKhcn" />
          <zeebe:input source="Task_9_TCKT" target="taskInput.raSoatTckt" />
          <zeebe:input source="Task_9_MS" target="taskInput.raSoatMs" />
          <zeebe:input source="Task_9_NS" target="taskInput.raSoatNs" />
          <zeebe:input source="openai" target="provider.type" />
          <zeebe:input source="gpt-4o" target="provider.openai.model.model" />
          <zeebe:input source="Bạn là trợ lý AI tổng hợp biên bản họp HĐXD VHT phiên 2 và kết quả rà soát từ 4 Cơ quan. Tạo báo cáo tổng hợp gồm: (1) Tóm tắt kết quả phiên họp, (2) Điểm mạnh/yếu của HSXD, (3) Kết luận HĐXD, (4) Hướng xử lý đề xuất. Gửi email thông báo cho PM với file đính kèm. Trả về JSON: {tomTat, diemManh, diemYeu, ketLuan, huongXuLy, emailContent}" target="taskInstruction" />
          <zeebe:output source="taskResult.tomTat" target="tomTatPhien2" />
          <zeebe:output source="taskResult.diemManh" target="diemManhPhien2" />
          <zeebe:output source="taskResult.diemYeu" target="diemYeuPhien2" />
          <zeebe:output source="taskResult.ketLuan" target="ketLuanHdxd" />
          <zeebe:output source="taskResult.huongXuLy" target="huongXuLyDeXuat" />
          <zeebe:output source="taskResult.emailContent" target="emailContentPhien2" />
        </zeebe:ioMapping>
      </bpmn:extensionElements>
      <bpmn:incoming>Flow_0licdxa</bpmn:incoming>
      <bpmn:outgoing>Flow_1u346ib</bpmn:outgoing>
    </bpmn:serviceTask>
    <bpmn:sequenceFlow id="Flow_0licdxa" sourceRef="Task_7" targetRef="Activity_1q37p00" />
    <bpmn:sequenceFlow id="Flow_1u346ib" sourceRef="Activity_1q37p00" targetRef="Task_8" />
    <bpmn:sequenceFlow id="Flow_1fa8vpt" sourceRef="Task_9_TCKT" targetRef="Gateway_ReviewJoin2" />
    <bpmn:sequenceFlow id="Flow_08pyqdp" name="Không thông qua" sourceRef="Gateway_ResultVHT" targetRef="EndEvent_VHTReject">
      <bpmn:conditionExpression xsi:type="bpmn:tFormalExpression">= vhtCouncilResult = "REJECTED"</bpmn:conditionExpression>
    </bpmn:sequenceFlow>
    <bpmn:sequenceFlow id="Flow_0tuszyn" sourceRef="Gateway_ReviewSplit2" targetRef="Task_9_MS" />
    <bpmn:sequenceFlow id="Flow_1c653vr" sourceRef="Gateway_ReviewSplit2" targetRef="Task_9_NS" />
    <bpmn:sequenceFlow id="Flow_0s03ysv" sourceRef="Task_9_KHCN" targetRef="Gateway_ReviewJoin2" />
    <bpmn:sequenceFlow id="Flow_0ryugaq" sourceRef="Task_9_MS" targetRef="Gateway_ReviewJoin2" />
    <bpmn:businessRuleTask id="Activity_03fbbgn" name="Xác định hướng xử lý sau HĐXD Tập đoàn phiên 2">
      <bpmn:extensionElements>
        <zeebe:calledDecision decisionId="decision-1l9z3ao" resultVariable="vhtCouncilResult" />
      </bpmn:extensionElements>
      <bpmn:incoming>Flow_14w4wvo</bpmn:incoming>
      <bpmn:outgoing>Flow_1o5t1cc</bpmn:outgoing>
    </bpmn:businessRuleTask>
    <bpmn:sequenceFlow id="Flow_14w4wvo" sourceRef="Task_10" targetRef="Activity_03fbbgn" />
    <bpmn:sequenceFlow id="Flow_1o5t1cc" sourceRef="Activity_03fbbgn" targetRef="Gateway_ResultVHT" />
  </bpmn:process>
  <bpmndi:BPMNDiagram id="BPMNDiagram_RD0202">
    <bpmndi:BPMNPlane id="BPMNPlane_RD0202" bpmnElement="Process_RD0202">
      <bpmndi:BPMNShape id="Lane_CQ_VHT_di" bpmnElement="Lane_CQ_VHT" isHorizontal="true">
        <dc:Bounds x="160" y="560" width="3640" height="480" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Lane_CQQL_VHT_di" bpmnElement="Lane_CQQL_VHT" isHorizontal="true">
        <dc:Bounds x="160" y="1040" width="3640" height="190" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Lane_System_di" bpmnElement="Lane_System" isHorizontal="true">
        <dc:Bounds x="160" y="240" width="3640" height="160" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Lane_PM_di" bpmnElement="Lane_PM" isHorizontal="true">
        <dc:Bounds x="160" y="80" width="3640" height="160" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="StartEvent_1_di" bpmnElement="StartEvent_1">
        <dc:Bounds x="212" y="137" width="36" height="36" />
        <bpmndi:BPMNLabel><dc:Bounds x="187" y="180" width="85" height="40" /></bpmndi:BPMNLabel>
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Task_1_di" bpmnElement="Task_1">
        <dc:Bounds x="300" y="115" width="120" height="80" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Task_2_di" bpmnElement="Task_2">
        <dc:Bounds x="450" y="115" width="120" height="80" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Gateway_Draft1Valid_di" bpmnElement="Gateway_Draft1Valid" isMarkerVisible="true">
        <dc:Bounds x="750" y="275" width="50" height="50" />
        <bpmndi:BPMNLabel><dc:Bounds x="734" y="247" width="81" height="27" /></bpmndi:BPMNLabel>
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Gateway_ReviewSplit1_di" bpmnElement="Gateway_ReviewSplit1">
        <dc:Bounds x="775" y="595" width="50" height="50" />
        <bpmndi:BPMNLabel><dc:Bounds x="762" y="645" width="76" height="27" /></bpmndi:BPMNLabel>
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Task_3_KHCN_di" bpmnElement="Task_3_KHCN">
        <dc:Bounds x="910" y="595" width="120" height="80" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Task_3_TCKT_di" bpmnElement="Task_3_TCKT">
        <dc:Bounds x="910" y="700" width="120" height="80" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Task_3_MS_di" bpmnElement="Task_3_MS">
        <dc:Bounds x="910" y="810" width="120" height="80" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Task_3_NS_di" bpmnElement="Task_3_NS">
        <dc:Bounds x="910" y="915" width="120" height="80" />
        <bpmndi:BPMNLabel />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Gateway_ReviewJoin1_di" bpmnElement="Gateway_ReviewJoin1">
        <dc:Bounds x="1125" y="595" width="50" height="50" />
        <bpmndi:BPMNLabel><dc:Bounds x="1046" y="577" width="88" height="27" /></bpmndi:BPMNLabel>
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Task_3_5_di" bpmnElement="Task_3_5">
        <dc:Bounds x="1430" y="115" width="120" height="80" />
        <bpmndi:BPMNLabel />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Task_5_di" bpmnElement="Task_5">
        <dc:Bounds x="1810" y="755" width="120" height="80" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Gateway_ApproveCouncilVHT_di" bpmnElement="Gateway_ApproveCouncilVHT" isMarkerVisible="true">
        <dc:Bounds x="2005" y="1075" width="50" height="50" />
        <bpmndi:BPMNLabel><dc:Bounds x="1988" y="1125" width="84" height="27" /></bpmndi:BPMNLabel>
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Task_7_di" bpmnElement="Task_7">
        <dc:Bounds x="1970" y="915" width="120" height="80" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Task_8_di" bpmnElement="Task_8">
        <dc:Bounds x="2250" y="115" width="120" height="80" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Task_9_KHCN_di" bpmnElement="Task_9_KHCN">
        <dc:Bounds x="2560" y="590" width="120" height="80" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Task_9_TCKT_di" bpmnElement="Task_9_TCKT">
        <dc:Bounds x="2560" y="700" width="120" height="80" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Task_9_MS_di" bpmnElement="Task_9_MS">
        <dc:Bounds x="2560" y="800" width="120" height="80" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Task_9_NS_di" bpmnElement="Task_9_NS">
        <dc:Bounds x="2560" y="910" width="120" height="80" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Gateway_Draft3Valid_di" bpmnElement="Gateway_Draft3Valid" isMarkerVisible="true">
        <dc:Bounds x="2935" y="585" width="50" height="50" />
        <bpmndi:BPMNLabel><dc:Bounds x="2920" y="635" width="81" height="27" /></bpmndi:BPMNLabel>
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Task_10_di" bpmnElement="Task_10">
        <dc:Bounds x="3030" y="930" width="120" height="80" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Gateway_ResultVHT_di" bpmnElement="Gateway_ResultVHT" isMarkerVisible="true">
        <dc:Bounds x="3365" y="945" width="50" height="50" />
        <bpmndi:BPMNLabel><dc:Bounds x="3354" y="995" width="73" height="27" /></bpmndi:BPMNLabel>
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="EndEvent_VHTReject_di" bpmnElement="EndEvent_VHTReject">
        <dc:Bounds x="3372" y="752" width="36" height="36" />
        <bpmndi:BPMNLabel><dc:Bounds x="3350" y="702" width="79" height="40" /></bpmndi:BPMNLabel>
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Task_11_di" bpmnElement="Task_11">
        <dc:Bounds x="3640" y="130" width="120" height="80" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Activity_18j9frf_di" bpmnElement="Activity_18j9frf">
        <dc:Bounds x="1210" y="115" width="100" height="80" />
        <bpmndi:BPMNLabel />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="BPMNShape_1948wy4" bpmnElement="Activity_1q37p00">
        <dc:Bounds x="2160" y="915" width="100" height="80" />
        <bpmndi:BPMNLabel />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Activity_03fbbgn_di" bpmnElement="Activity_03fbbgn">
        <dc:Bounds x="3200" y="930" width="100" height="80" />
        <bpmndi:BPMNLabel />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Gateway_ReviewSplit2_di" bpmnElement="Gateway_ReviewSplit2">
        <dc:Bounds x="2395" y="635" width="50" height="50" />
        <bpmndi:BPMNLabel><dc:Bounds x="2323" y="647" width="62" height="27" /></bpmndi:BPMNLabel>
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Task_4_di" bpmnElement="Task_4">
        <dc:Bounds x="1570" y="580" width="120" height="80" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Gateway_SignDraft2_di" bpmnElement="Gateway_SignDraft2" isMarkerVisible="true">
        <dc:Bounds x="1805" y="585" width="50" height="50" />
        <bpmndi:BPMNLabel><dc:Bounds x="1827" y="566" width="86" height="27" /></bpmndi:BPMNLabel>
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Task_6_di" bpmnElement="Task_6">
        <dc:Bounds x="1800" y="1080" width="120" height="80" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Gateway_ReviewJoin2_di" bpmnElement="Gateway_ReviewJoin2">
        <dc:Bounds x="2775" y="635" width="50" height="50" />
        <bpmndi:BPMNLabel><dc:Bounds x="2771" y="695" width="58" height="27" /></bpmndi:BPMNLabel>
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Task_CheckDraft1_di" bpmnElement="Task_CheckDraft1">
        <dc:Bounds x="580" y="270" width="120" height="80" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNEdge id="Flow_001_di" bpmnElement="Flow_001">
        <di:waypoint x="248" y="155" /><di:waypoint x="300" y="155" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Flow_002_di" bpmnElement="Flow_002">
        <di:waypoint x="420" y="155" /><di:waypoint x="435" y="155" /><di:waypoint x="435" y="155" /><di:waypoint x="450" y="155" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Flow_Draft1_Invalid_di" bpmnElement="Flow_Draft1_Invalid">
        <di:waypoint x="775" y="325" /><di:waypoint x="775" y="375" /><di:waypoint x="510" y="375" /><di:waypoint x="510" y="200" />
        <bpmndi:BPMNLabel><dc:Bounds x="723" y="350" width="46" height="14" /></bpmndi:BPMNLabel>
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Flow_003_di" bpmnElement="Flow_003">
        <di:waypoint x="570" y="155" /><di:waypoint x="640" y="155" /><di:waypoint x="640" y="270" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Flow_Check_to_GW_di" bpmnElement="Flow_Check_to_GW">
        <di:waypoint x="700" y="310" /><di:waypoint x="725" y="310" /><di:waypoint x="725" y="300" /><di:waypoint x="750" y="300" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Flow_Draft1_Valid_di" bpmnElement="Flow_Draft1_Valid">
        <di:waypoint x="800" y="300" /><di:waypoint x="840" y="300" /><di:waypoint x="840" y="460" /><di:waypoint x="800" y="460" /><di:waypoint x="800" y="595" />
        <bpmndi:BPMNLabel><dc:Bounds x="806" y="573" width="18" height="14" /></bpmndi:BPMNLabel>
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Flow_Review1_KHCN_di" bpmnElement="Flow_Review1_KHCN">
        <di:waypoint x="825" y="620" /><di:waypoint x="890" y="620" /><di:waypoint x="890" y="635" /><di:waypoint x="910" y="635" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Flow_Review1_TCKT_di" bpmnElement="Flow_Review1_TCKT">
        <di:waypoint x="825" y="620" /><di:waypoint x="890" y="620" /><di:waypoint x="890" y="740" /><di:waypoint x="910" y="740" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Flow_Review1_MS_di" bpmnElement="Flow_Review1_MS">
        <di:waypoint x="825" y="620" /><di:waypoint x="890" y="620" /><di:waypoint x="890" y="850" /><di:waypoint x="910" y="850" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Flow_Review1_NS_di" bpmnElement="Flow_Review1_NS">
        <di:waypoint x="825" y="620" /><di:waypoint x="890" y="620" /><di:waypoint x="890" y="955" /><di:waypoint x="910" y="955" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Flow_Review1Join_KHCN_di" bpmnElement="Flow_Review1Join_KHCN">
        <di:waypoint x="1030" y="635" /><di:waypoint x="1060" y="635" /><di:waypoint x="1060" y="710" /><di:waypoint x="1150" y="710" /><di:waypoint x="1150" y="645" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Flow_Review1Join_TCKT_di" bpmnElement="Flow_Review1Join_TCKT">
        <di:waypoint x="1030" y="740" /><di:waypoint x="1060" y="740" /><di:waypoint x="1060" y="710" /><di:waypoint x="1150" y="710" /><di:waypoint x="1150" y="645" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Flow_Review1Join_MS_di" bpmnElement="Flow_Review1Join_MS">
        <di:waypoint x="1030" y="850" /><di:waypoint x="1060" y="850" /><di:waypoint x="1060" y="710" /><di:waypoint x="1150" y="710" /><di:waypoint x="1150" y="645" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Flow_Review1Join_NS_di" bpmnElement="Flow_Review1Join_NS">
        <di:waypoint x="1030" y="955" /><di:waypoint x="1060" y="955" /><di:waypoint x="1060" y="710" /><di:waypoint x="1150" y="710" /><di:waypoint x="1150" y="645" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Flow_0h1epkq_di" bpmnElement="Flow_0h1epkq">
        <di:waypoint x="1150" y="595" /><di:waypoint x="1150" y="155" /><di:waypoint x="1210" y="155" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Flow_SignDraft2_Revise_di" bpmnElement="Flow_SignDraft2_Revise">
        <di:waypoint x="1830" y="635" /><di:waypoint x="1830" y="720" /><di:waypoint x="1490" y="720" /><di:waypoint x="1490" y="195" />
        <bpmndi:BPMNLabel><dc:Bounds x="1708" y="680" width="70" height="27" /></bpmndi:BPMNLabel>
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Flow_125ekuj_di" bpmnElement="Flow_125ekuj">
        <di:waypoint x="1310" y="155" /><di:waypoint x="1430" y="155" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Flow_004_di" bpmnElement="Flow_004">
        <di:waypoint x="1550" y="155" /><di:waypoint x="1630" y="155" /><di:waypoint x="1630" y="580" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Flow_SignDraft2_OK_di" bpmnElement="Flow_SignDraft2_OK">
        <di:waypoint x="1855" y="610" /><di:waypoint x="1870" y="610" /><di:waypoint x="1870" y="755" />
        <bpmndi:BPMNLabel><dc:Bounds x="1882" y="628" width="35" height="14" /></bpmndi:BPMNLabel>
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Flow_CouncilVHT_Rework_di" bpmnElement="Flow_CouncilVHT_Rework">
        <di:waypoint x="2055" y="1100" /><di:waypoint x="2140" y="1100" /><di:waypoint x="2140" y="1175" /><di:waypoint x="1440" y="1175" /><di:waypoint x="1440" y="795" /><di:waypoint x="1810" y="795" />
        <bpmndi:BPMNLabel><dc:Bounds x="2150" y="1125" width="70" height="27" /></bpmndi:BPMNLabel>
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Flow_005_di" bpmnElement="Flow_005">
        <di:waypoint x="1860" y="835" /><di:waypoint x="1860" y="1080" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Flow_006A_di" bpmnElement="Flow_006A">
        <di:waypoint x="1920" y="1120" /><di:waypoint x="1963" y="1120" /><di:waypoint x="1963" y="1100" /><di:waypoint x="2005" y="1100" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Flow_CouncilVHT_OK_di" bpmnElement="Flow_CouncilVHT_OK">
        <di:waypoint x="2030" y="1075" /><di:waypoint x="2030" y="995" />
        <bpmndi:BPMNLabel><dc:Bounds x="2055" y="1013" width="50" height="14" /></bpmndi:BPMNLabel>
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Flow_0licdxa_di" bpmnElement="Flow_0licdxa">
        <di:waypoint x="2090" y="955" /><di:waypoint x="2160" y="955" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Flow_Draft3_Rework_di" bpmnElement="Flow_Draft3_Rework">
        <di:waypoint x="2960" y="585" /><di:waypoint x="2960" y="470" /><di:waypoint x="3000" y="470" /><di:waypoint x="3000" y="90" /><di:waypoint x="2310" y="90" /><di:waypoint x="2310" y="115" />
        <bpmndi:BPMNLabel><dc:Bounds x="2887" y="563" width="46" height="14" /></bpmndi:BPMNLabel>
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Flow_1u346ib_di" bpmnElement="Flow_1u346ib">
        <di:waypoint x="2210" y="915" /><di:waypoint x="2210" y="155" /><di:waypoint x="2250" y="155" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Flow_008_di" bpmnElement="Flow_008">
        <di:waypoint x="2370" y="155" /><di:waypoint x="2420" y="155" /><di:waypoint x="2420" y="635" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Flow_Review2_KHCN_di" bpmnElement="Flow_Review2_KHCN">
        <di:waypoint x="2445" y="660" /><di:waypoint x="2503" y="660" /><di:waypoint x="2503" y="630" /><di:waypoint x="2560" y="630" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Flow_0s03ysv_di" bpmnElement="Flow_0s03ysv">
        <di:waypoint x="2680" y="630" /><di:waypoint x="2730" y="630" /><di:waypoint x="2730" y="660" /><di:waypoint x="2775" y="660" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Flow_Review2_NS_di" bpmnElement="Flow_Review2_NS">
        <di:waypoint x="2420" y="685" /><di:waypoint x="2420" y="740" /><di:waypoint x="2560" y="740" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Flow_1fa8vpt_di" bpmnElement="Flow_1fa8vpt">
        <di:waypoint x="2680" y="740" /><di:waypoint x="2728" y="740" /><di:waypoint x="2728" y="660" /><di:waypoint x="2775" y="660" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Flow_0tuszyn_di" bpmnElement="Flow_0tuszyn">
        <di:waypoint x="2420" y="685" /><di:waypoint x="2420" y="840" /><di:waypoint x="2560" y="840" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Flow_0ryugaq_di" bpmnElement="Flow_0ryugaq">
        <di:waypoint x="2680" y="840" /><di:waypoint x="2730" y="840" /><di:waypoint x="2730" y="660" /><di:waypoint x="2775" y="660" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Flow_1c653vr_di" bpmnElement="Flow_1c653vr">
        <di:waypoint x="2420" y="685" /><di:waypoint x="2420" y="950" /><di:waypoint x="2560" y="950" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Flow_Review2Join_NS_di" bpmnElement="Flow_Review2Join_NS">
        <di:waypoint x="2680" y="950" /><di:waypoint x="2730" y="950" /><di:waypoint x="2730" y="660" /><di:waypoint x="2775" y="660" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Flow_Review2_Done_di" bpmnElement="Flow_Review2_Done">
        <di:waypoint x="2800" y="635" /><di:waypoint x="2800" y="610" /><di:waypoint x="2935" y="610" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Flow_Draft3_OK_di" bpmnElement="Flow_Draft3_OK">
        <di:waypoint x="2985" y="610" /><di:waypoint x="3090" y="610" /><di:waypoint x="3090" y="930" />
        <bpmndi:BPMNLabel><dc:Bounds x="3027" y="588" width="18" height="14" /></bpmndi:BPMNLabel>
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Flow_14w4wvo_di" bpmnElement="Flow_14w4wvo">
        <di:waypoint x="3150" y="970" /><di:waypoint x="3200" y="970" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Flow_1o5t1cc_di" bpmnElement="Flow_1o5t1cc">
        <di:waypoint x="3300" y="970" /><di:waypoint x="3365" y="970" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Flow_ResultVHT_OK_di" bpmnElement="Flow_ResultVHT_OK">
        <di:waypoint x="3415" y="970" /><di:waypoint x="3700" y="970" /><di:waypoint x="3700" y="210" />
        <bpmndi:BPMNLabel><dc:Bounds x="3516" y="943" width="53" height="14" /></bpmndi:BPMNLabel>
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Flow_08pyqdp_di" bpmnElement="Flow_08pyqdp">
        <di:waypoint x="3390" y="945" /><di:waypoint x="3390" y="788" />
        <bpmndi:BPMNLabel><dc:Bounds x="3398" y="865" width="84" height="14" /></bpmndi:BPMNLabel>
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Flow_004A_di" bpmnElement="Flow_004A">
        <di:waypoint x="1690" y="620" /><di:waypoint x="1748" y="620" /><di:waypoint x="1748" y="610" /><di:waypoint x="1805" y="610" />
      </bpmndi:BPMNEdge>
    </bpmndi:BPMNPlane>
  </bpmndi:BPMNDiagram>
</bpmn:definitions>
`