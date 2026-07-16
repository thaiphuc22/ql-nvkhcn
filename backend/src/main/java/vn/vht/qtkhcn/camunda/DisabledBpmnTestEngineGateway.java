package vn.vht.qtkhcn.camunda;

import java.util.Map;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Component;

@Component
@ConditionalOnProperty(name = "qtkhcn.bpmn-test.enabled", havingValue = "false", matchIfMissing = true)
public class DisabledBpmnTestEngineGateway implements BpmnTestEngineGateway {
    private IllegalStateException disabled() {
        return new IllegalStateException("Test BPMN đang tắt: phải cấu hình một Camunda test engine riêng; không được fallback sang production engine.");
    }
    @Override public StartedInstance deployAndStart(byte[] b, String n, Map<String,Object> v) { throw disabled(); }
    @Override public EngineSnapshot snapshot(long k) { throw disabled(); }
    @Override public void completeTask(long i, long t, Map<String,Object> v) { throw disabled(); }
    @Override public void cancel(long k) { throw disabled(); }
    @Override public void setVariables(long k, Map<String,Object> v) { throw disabled(); }
    @Override public void resolveIncident(long k) { throw disabled(); }
    @Override public void bypassServiceTask(long i, long j, Map<String,Object> v) { throw disabled(); }
}
