package vn.vht.qtkhcn.hoso.service;

import jakarta.persistence.EntityNotFoundException;
import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.util.List;
import java.util.Locale;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import vn.vht.qtkhcn.hoso.domain.HoiDongXetDuyet;
import vn.vht.qtkhcn.hoso.domain.ThanhVienHoiDong;
import vn.vht.qtkhcn.hoso.repository.HoSoRepository;
import vn.vht.qtkhcn.hoso.repository.HoiDongXetDuyetRepository;
import vn.vht.qtkhcn.hoso.web.dto.CreateHoiDongRequest;
import vn.vht.qtkhcn.hoso.web.dto.ThanhVienHoiDongRequest;
import vn.vht.qtkhcn.hoso.web.dto.UpdateHoiDongRequest;

/**
 * Tạo/sửa/xóa Hội đồng xét duyệt thủ công qua UI quản trị (`/api/hoi-dong`) — bổ sung cho
 * {@link HoiDongXetDuyetService}, vốn chỉ sinh hội đồng tự động từ service task workflow.
 *
 * <p>Hội đồng tạo ở đây luôn có {@code sourceTaskDefinitionKey = null}, đúng bất biến "chỉ 2 luồng
 * tự sinh (T05/T18B) mới đặt giá trị task key" — dùng để phân biệt nguồn gốc trên UI (ví dụ hiển thị
 * nhãn "tạo thủ công"). hoSoId/cap là định danh nghiệp vụ, không cho sửa sau khi tạo; chỉ căn cứ
 * pháp lý và danh sách thành viên có thể cập nhật.</p>
 */
@Service
public class HoiDongMutationService {

    private static final String AUDIT_TYPE = "HOI_DONG_XET_DUYET";

    private final HoiDongXetDuyetRepository repository;
    private final HoSoRepository hoSoRepository;
    private final MutationSupport mutations;

    public HoiDongMutationService(HoiDongXetDuyetRepository repository, HoSoRepository hoSoRepository,
            MutationSupport mutations) {
        this.repository = repository;
        this.hoSoRepository = hoSoRepository;
        this.mutations = mutations;
    }

    @Transactional
    public HoiDongXetDuyet create(CreateHoiDongRequest request, String actorHeader) {
        String actor = mutations.requireActor(actorHeader);
        if (!hoSoRepository.existsById(request.hoSoId())) {
            throw new EntityNotFoundException("Khong tim thay HoSo " + request.hoSoId());
        }
        String maHoiDong = request.maHoiDong().trim();
        if (repository.existsByMaHoiDong(maHoiDong)) {
            throw new IllegalArgumentException("Ma hoi dong da ton tai: " + maHoiDong);
        }

        HoiDongXetDuyet entity = new HoiDongXetDuyet();
        entity.setMaHoiDong(maHoiDong);
        entity.setHoSoId(request.hoSoId());
        entity.setCap(request.cap());
        entity.setSourceTaskDefinitionKey(null);
        entity.setCanCuPhapLy(blankToNull(request.canCuPhapLy()));
        entity.setCreatedAt(OffsetDateTime.now(ZoneOffset.UTC));
        replaceMembers(entity, request.thanhVien());

        entity = repository.saveAndFlush(entity);
        mutations.audit(AUDIT_TYPE, String.valueOf(entity.getId()), entity.getVersion(), "CREATE", actor, null);
        return entity;
    }

    @Transactional
    public HoiDongXetDuyet update(long id, long expectedVersion, UpdateHoiDongRequest request, String actorHeader) {
        String actor = mutations.requireActor(actorHeader);
        HoiDongXetDuyet entity = repository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Khong tim thay HoiDongXetDuyet " + id));
        mutations.verifyVersion(AUDIT_TYPE, String.valueOf(id), expectedVersion, entity.getVersion());

        String maHoiDong = request.maHoiDong().trim();
        if (repository.existsByMaHoiDongAndIdNot(maHoiDong, id)) {
            throw new IllegalArgumentException("Ma hoi dong da ton tai: " + maHoiDong);
        }
        entity.setMaHoiDong(maHoiDong);
        entity.setCanCuPhapLy(blankToNull(request.canCuPhapLy()));
        replaceMembers(entity, request.thanhVien());

        entity = repository.saveAndFlush(entity);
        mutations.audit(AUDIT_TYPE, String.valueOf(id), entity.getVersion(), "UPDATE", actor, null);
        return entity;
    }

    @Transactional
    public void delete(long id, String actorHeader) {
        String actor = mutations.requireActor(actorHeader);
        HoiDongXetDuyet entity = repository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Khong tim thay HoiDongXetDuyet " + id));
        repository.delete(entity);
        repository.flush();
        mutations.audit(AUDIT_TYPE, String.valueOf(id), entity.getVersion(), "DELETE", actor,
                "hoSoId=" + entity.getHoSoId() + ",cap=" + entity.getCap());
    }

    private static void replaceMembers(HoiDongXetDuyet entity, List<ThanhVienHoiDongRequest> members) {
        entity.getThanhVien().clear();
        for (ThanhVienHoiDongRequest request : members) {
            ThanhVienHoiDong member = new ThanhVienHoiDong();
            member.setHoiDong(entity);
            member.setHoTen(request.hoTen().trim());
            // Cùng chuẩn hoá với HoiDongXetDuyetService.build(): mọi so khớp downstream (authorize(),
            // truy vấn worklist) đều so chuỗi thô với X-QTKHCN-User-Id vốn đã được lowercase.
            member.setUserId(blankToNull(request.userId()) == null ? null
                    : request.userId().trim().toLowerCase(Locale.ROOT));
            member.setVaiTroTrongHoiDong(blankToNull(request.vaiTroTrongHoiDong()));
            entity.getThanhVien().add(member);
        }
    }

    private static String blankToNull(String value) {
        return value == null || value.isBlank() ? null : value.trim();
    }
}
