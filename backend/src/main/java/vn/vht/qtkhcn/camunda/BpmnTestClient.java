package vn.vht.qtkhcn.camunda;

import io.camunda.client.CamundaClient;

/** Wrapper prevents the dedicated client from competing with the production CamundaClient bean. */
public record BpmnTestClient(CamundaClient client) implements AutoCloseable {
    @Override public void close() { client.close(); }
}
