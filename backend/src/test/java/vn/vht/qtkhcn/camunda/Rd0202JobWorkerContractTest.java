package vn.vht.qtkhcn.camunda;

import static org.junit.jupiter.api.Assertions.assertTrue;

import io.camunda.client.annotation.JobWorker;
import java.lang.reflect.Method;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.Arrays;
import java.util.LinkedHashSet;
import java.util.Set;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import org.junit.jupiter.api.Test;

class Rd0202JobWorkerContractTest {

    private static final Pattern JOB_TYPE = Pattern.compile("<zeebe:taskDefinition\\s+type=\"([^\"]+)\"");

    @Test
    void everyBundledRd0202JobTypeHasAnApplicationWorker() throws Exception {
        String bpmn = Files.readString(Path.of("src/main/resources/processes/rd0202.bpmn"));
        Set<String> bpmnJobTypes = new LinkedHashSet<>();
        Matcher matcher = JOB_TYPE.matcher(bpmn);
        while (matcher.find()) {
            bpmnJobTypes.add(matcher.group(1));
        }

        Set<String> registeredJobTypes = new LinkedHashSet<>();
        collectJobTypes(SystemCheckJobWorker.class, registeredJobTypes);
        collectJobTypes(GenerateHdxdDocumentJobWorker.class, registeredJobTypes);
        collectJobTypes(GenerateHdxdTapDoanJobWorker.class, registeredJobTypes);
        collectJobTypes(Rd0202DanhGiaT24JobWorker.class, registeredJobTypes);

        assertTrue(registeredJobTypes.containsAll(bpmnJobTypes),
                () -> "RD02.02 thiếu @JobWorker cho: " + difference(bpmnJobTypes, registeredJobTypes));
    }

    private static void collectJobTypes(Class<?> workerClass, Set<String> target) {
        Arrays.stream(workerClass.getDeclaredMethods())
                .map(Method::getDeclaredAnnotations)
                .flatMap(Arrays::stream)
                .filter(JobWorker.class::isInstance)
                .map(JobWorker.class::cast)
                .map(JobWorker::type)
                .forEach(target::add);
    }

    private static Set<String> difference(Set<String> expected, Set<String> actual) {
        Set<String> missing = new LinkedHashSet<>(expected);
        missing.removeAll(actual);
        return missing;
    }
}
