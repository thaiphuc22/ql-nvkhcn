package vn.vht.qtkhcn.workflow;

import java.util.List;

public interface WorkflowRuntimeEventReader {
    List<WorkflowRuntimeEvent> read(long processInstanceKey);
}
