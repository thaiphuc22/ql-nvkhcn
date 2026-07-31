package vn.vht.qtkhcn.domain;

/**
 * Quy trình vào catalog bằng đường nào.
 *
 * <ul>
 *   <li>{@link #APP} — deploy từ chính app (import BPMN, deploy draft, hoặc startup bundled deploy).
 *       Đã đi qua {@code ProcessDefinitionImportValidator} nên có checksum thật và danh sách warning.</li>
 *   <li>{@link #EXTERNAL} — deploy thẳng lên Camunda (Modeler, zbctl, CI), app hút về sau bằng
 *       {@code DeployedProcessImportService}. KHÔNG qua validator: không có warning lint, và
 *       {@code camundaDeploymentKey} không lấy được từ search API nên lưu 0.</li>
 * </ul>
 */
public enum ProcessDefinitionSource {
    APP,
    EXTERNAL
}
