package vn.vht.qtkhcn.hoso.service;

import java.util.UUID;

public class WorkflowEventConflictException extends RuntimeException {
    public WorkflowEventConflictException(UUID eventId) {
        super("Event " + eventId + " da ton tai voi payload khac");
    }
}
