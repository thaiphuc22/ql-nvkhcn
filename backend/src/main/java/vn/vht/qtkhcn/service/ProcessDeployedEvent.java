package vn.vht.qtkhcn.service;

/**
 * Một version quy trình vừa được ghi vào catalog — qua app ({@code ProcessDefinitionService}) hoặc
 * hút về từ Camunda ({@code DeployedProcessImportWriter}).
 *
 * @param bpmnProcessId id của {@code bpmn:process} vừa deploy
 * @param actor         người thao tác, để ghi audit của luật được sinh ra
 */
public record ProcessDeployedEvent(String bpmnProcessId, String actor) {
}
