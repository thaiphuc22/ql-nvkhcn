package vn.vht.qtkhcn.camunda;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

import io.camunda.client.api.response.ActivatedJob;
import java.util.List;
import java.util.Map;
import org.junit.jupiter.api.Test;
import vn.vht.qtkhcn.repository.WorkflowProcessMappingRepository;

/**
 * {@code computeDiemTrungBinh} là logic thuần (không gọi HTTP) nên unit test trực tiếp được;
 * {@code loadHoiDongTapDoan} gọi RestClient thật, theo đúng ranh giới test đã có trong repo (xem
 * GenerateHdxdDocumentJobWorker/Rd0202ConditionValidator — không có unit test riêng cho lớp gọi
 * HTTP, chỉ verify qua E2E).
 */
class Rd0202DanhGiaT24JobWorkerTest {

    private final Rd0202DanhGiaT24JobWorker worker =
            new Rd0202DanhGiaT24JobWorker(mock(WorkflowProcessMappingRepository.class), "http://127.0.0.1:8093", "token");

    @Test
    void averagesScoresFromMultiInstanceOutputCollection() {
        ActivatedJob job = job(List.of(80, 70, 60));

        Map<String, Object> variables = worker.computeDiemTrungBinh(job);

        assertEquals(70.0d, variables.get("diemTrungBinhT24"));
    }

    @Test
    void emptyCollectionFailsClosedToZero() {
        ActivatedJob job = job(List.of());

        Map<String, Object> variables = worker.computeDiemTrungBinh(job);

        assertEquals(0.0d, variables.get("diemTrungBinhT24"));
    }

    @Test
    void missingCollectionFailsClosedToZero() {
        ActivatedJob job = mock(ActivatedJob.class);
        when(job.getVariablesAsMap()).thenReturn(Map.of());
        when(job.getProcessInstanceKey()).thenReturn(1L);

        Map<String, Object> variables = worker.computeDiemTrungBinh(job);

        assertEquals(0.0d, variables.get("diemTrungBinhT24"));
    }

    @Test
    void exactlyAtThresholdIsIncludedInAverage() {
        ActivatedJob job = job(List.of(70, 70, 70));

        Map<String, Object> variables = worker.computeDiemTrungBinh(job);

        assertEquals(70.0d, variables.get("diemTrungBinhT24"));
    }

    private static ActivatedJob job(List<Integer> scores) {
        ActivatedJob job = mock(ActivatedJob.class);
        when(job.getVariablesAsMap()).thenReturn(Map.of("danhSachDiemDanhGiaT24", scores));
        when(job.getProcessInstanceKey()).thenReturn(1L);
        return job;
    }
}
