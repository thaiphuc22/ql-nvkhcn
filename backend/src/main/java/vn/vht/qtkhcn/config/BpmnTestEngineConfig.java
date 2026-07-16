package vn.vht.qtkhcn.config;

import io.camunda.client.CamundaClient;
import vn.vht.qtkhcn.camunda.BpmnTestClient;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.net.URI;
import java.time.Duration;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class BpmnTestEngineConfig {
    @Bean(name = "bpmnTestObjectMapper")
    ObjectMapper bpmnTestObjectMapper() {
        return new ObjectMapper();
    }
    @Bean(destroyMethod = "close")
    @ConditionalOnProperty(name = "qtkhcn.bpmn-test.enabled", havingValue = "true")
    BpmnTestClient bpmnTestCamundaClient(
            @Value("${qtkhcn.bpmn-test.grpc-address}") URI grpc,
            @Value("${qtkhcn.bpmn-test.rest-address}") URI rest,
            @Value("${camunda.client.grpc-address}") URI productionGrpc,
            @Value("${camunda.client.rest-address}") URI productionRest) {
        if (grpc.equals(productionGrpc) || rest.equals(productionRest)) {
            throw new IllegalStateException("BPMN test engine phải tách khỏi production Camunda; địa chỉ đang bị trùng.");
        }
        return new BpmnTestClient(CamundaClient.newClientBuilder()
                .grpcAddress(grpc).restAddress(rest)
                .preferRestOverGrpc(false)
                .defaultRequestTimeout(Duration.ofSeconds(10))
                .build());
    }
}
