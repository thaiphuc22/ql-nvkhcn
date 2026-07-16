package vn.vht.qtkhcn.domain;

public enum BpmnTestStatus {
    STARTING, RUNNING, BLOCKED, COMPLETED, CANCELLED, TIMED_OUT, FAILED;

    public boolean terminal() {
        return this == COMPLETED || this == CANCELLED || this == TIMED_OUT || this == FAILED;
    }
}
