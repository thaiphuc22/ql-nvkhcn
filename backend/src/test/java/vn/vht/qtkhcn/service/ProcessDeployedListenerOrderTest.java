package vn.vht.qtkhcn.service;

import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.inOrder;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

import java.util.List;
import org.junit.jupiter.api.Test;
import org.springframework.context.annotation.AnnotationConfigApplicationContext;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.transaction.PlatformTransactionManager;
import org.springframework.transaction.annotation.EnableTransactionManagement;
import org.springframework.transaction.support.AbstractPlatformTransactionManager;
import org.springframework.transaction.support.DefaultTransactionStatus;
import org.springframework.transaction.support.TransactionTemplate;
import vn.vht.qtkhcn.web.dto.ActionStudioDtos.ScaffoldResponse;

/**
 * Khoá lại ràng buộc mà cả thiết kế hút biểu mẫu nhúng dựa vào: {@link EmbeddedFormImportService}
 * phải chạy XONG TRƯỚC {@link DeployedProcessPolicyScaffolder}.
 *
 * <p>Ngược thứ tự thì scaffold ghim {@code formKey} lúc bảng {@code eform} chưa có dòng nào, và
 * {@code ActionStudioService.validateBundle} ném "Bieu mau khong ton tai" làm hỏng CẢ LƯỢT — quy
 * trình hút về xong không bấm được nút nào, đúng triệu chứng ban đầu. Ràng buộc này chỉ nằm ở hai
 * annotation {@code @Order} nên rất dễ bị gỡ mất khi refactor; test này để việc đó gãy ngay.
 *
 * <p>Chạy listener THẬT trong một transaction thật (tx manager rỗng, không cần DB) chứ không gọi tay
 * hai hàm theo thứ tự mong muốn — gọi tay thì có kiểm chứng gì đâu, chính Spring mới là bên quyết
 * định thứ tự.
 */
class ProcessDeployedListenerOrderTest {

    @Test
    void hutBieuMauNhungChayTruocScaffold() {
        try (var context = new AnnotationConfigApplicationContext(TestConfig.class)) {
            EmbeddedFormImportService importer = context.getBean(EmbeddedFormImportService.class);
            ActionStudioService actionStudio = context.getBean(ActionStudioService.class);
            EformService eforms = context.getBean(EformService.class);

            new TransactionTemplate(context.getBean(PlatformTransactionManager.class)).executeWithoutResult(
                    status -> context.publishEvent(new ProcessDeployedEvent("RD07", "alice")));

            var order = inOrder(eforms, actionStudio);
            order.verify(eforms).importFromCamunda(anyString(), anyString(), anyString(), anyString(),
                    anyString(), anyString());
            order.verify(actionStudio).scaffold("RD07", "alice");
            org.assertj.core.api.Assertions.assertThat(importer).isNotNull();
        }
    }

    @Configuration
    @EnableTransactionManagement
    static class TestConfig {

        @Bean
        PlatformTransactionManager transactionManager() {
            return new NoOpTransactionManager();
        }

        @Bean
        EformService eformService() {
            EformService eforms = mock(EformService.class);
            when(eforms.importFromCamunda(anyString(), anyString(), anyString(), anyString(), anyString(),
                    anyString())).thenReturn(EformService.ImportOutcome.CREATED);
            return eforms;
        }

        @Bean
        ActionStudioService actionStudioService() {
            ActionStudioService actionStudio = mock(ActionStudioService.class);
            when(actionStudio.scaffold(anyString(), anyString()))
                    .thenReturn(new ScaffoldResponse(1, List.of(), List.of()));
            return actionStudio;
        }

        @Bean
        EmbeddedFormImportService embeddedFormImportService(EformService eforms) {
            var catalogs = mock(vn.vht.qtkhcn.repository.ProcessDefinitionCatalogRepository.class);
            var versions = mock(vn.vht.qtkhcn.repository.ProcessDefinitionVersionRepository.class);
            var catalog = new vn.vht.qtkhcn.domain.ProcessDefinitionCatalog();
            catalog.setId(java.util.UUID.randomUUID());
            catalog.setBpmnProcessId("RD07");
            var version = new vn.vht.qtkhcn.domain.ProcessDefinitionVersion();
            version.setBpmnXml("""
                    <?xml version="1.0" encoding="UTF-8"?>
                    <bpmn:definitions xmlns:bpmn="http://www.omg.org/spec/BPMN/20100524/MODEL"
                        xmlns:zeebe="http://camunda.org/schema/zeebe/1.0">
                      <bpmn:process id="RD07">
                        <bpmn:extensionElements>
                          <zeebe:userTaskForm id="UserTaskForm_1">{"components":[]}</zeebe:userTaskForm>
                        </bpmn:extensionElements>
                      </bpmn:process>
                    </bpmn:definitions>
                    """);
            when(catalogs.findByBpmnProcessId("RD07")).thenReturn(java.util.Optional.of(catalog));
            when(versions.findFirstByCatalogIdOrderByCamundaVersionDesc(catalog.getId()))
                    .thenReturn(java.util.Optional.of(version));
            return new EmbeddedFormImportService(catalogs, versions, eforms,
                    new com.fasterxml.jackson.databind.ObjectMapper());
        }

        @Bean
        DeployedProcessPolicyScaffolder deployedProcessPolicyScaffolder(ActionStudioService actionStudio) {
            return new DeployedProcessPolicyScaffolder(actionStudio);
        }
    }

    /** Transaction thật về mặt vòng đời (có commit ⇒ AFTER_COMMIT bắn) nhưng không chạm DB. */
    static class NoOpTransactionManager extends AbstractPlatformTransactionManager {
        @Override
        protected Object doGetTransaction() {
            return new Object();
        }

        @Override
        protected void doBegin(Object transaction, org.springframework.transaction.TransactionDefinition definition) {
            // không có tài nguyên nào để mở
        }

        @Override
        protected void doCommit(DefaultTransactionStatus status) {
            // không có tài nguyên nào để commit
        }

        @Override
        protected void doRollback(DefaultTransactionStatus status) {
            // không có tài nguyên nào để rollback
        }

        /** REQUIRES_NEW của hai listener cần treo transaction ngoài — mặc định của lớp cha là ném. */
        @Override
        protected Object doSuspend(Object transaction) {
            return new Object();
        }

        @Override
        protected void doResume(Object transaction, Object suspendedResources) {
            // không có gì để khôi phục
        }
    }
}
