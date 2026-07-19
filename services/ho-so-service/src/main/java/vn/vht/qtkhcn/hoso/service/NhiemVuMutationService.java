package vn.vht.qtkhcn.hoso.service;

import jakarta.persistence.EntityNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import vn.vht.qtkhcn.hoso.domain.ChuNhiem;
import vn.vht.qtkhcn.hoso.domain.GiaiDoan;
import vn.vht.qtkhcn.hoso.domain.NhiemVu;
import vn.vht.qtkhcn.hoso.repository.NhiemVuRepository;
import vn.vht.qtkhcn.hoso.web.dto.CreateNhiemVuRequest;
import vn.vht.qtkhcn.hoso.web.dto.UpdateNhiemVuRequest;

@Service
public class NhiemVuMutationService {

    private final NhiemVuRepository repository;
    private final BusinessIdGenerator idGenerator;
    private final MutationSupport mutations;

    public NhiemVuMutationService(NhiemVuRepository repository, BusinessIdGenerator idGenerator,
                                  MutationSupport mutations) {
        this.repository = repository;
        this.idGenerator = idGenerator;
        this.mutations = mutations;
    }

    @Transactional
    public NhiemVu create(CreateNhiemVuRequest request, String actorHeader) {
        String actor = mutations.requireActor(actorHeader);
        NhiemVu entity = new NhiemVu();
        entity.setMa(idGenerator.nextNhiemVuId());
        apply(entity, request.ten(), request.cap(), request.chuNhiemHoTen(),
                request.chuNhiemHocHamHocVi(), request.chuNhiemMaNhanVien(), request.chuNhiemEmail(),
                request.donViChuTri(), request.thoiGianThucHien(), request.duToan());
        entity.setGiaiDoan(GiaiDoan.CHU_TRUONG);
        entity = repository.saveAndFlush(entity);
        mutations.audit("NHIEM_VU", entity.getMa(), entity.getVersion(), "CREATE", actor, null);
        return entity;
    }

    @Transactional
    public NhiemVu update(String id, long expectedVersion, UpdateNhiemVuRequest request, String actorHeader) {
        String actor = mutations.requireActor(actorHeader);
        NhiemVu entity = repository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Khong tim thay NhiemVu " + id));
        mutations.verifyVersion("NhiemVu", id, expectedVersion, entity.getVersion());
        apply(entity, request.ten(), request.cap(), request.chuNhiemHoTen(),
                request.chuNhiemHocHamHocVi(), request.chuNhiemMaNhanVien(), request.chuNhiemEmail(),
                request.donViChuTri(), request.thoiGianThucHien(), request.duToan());
        entity.setGiaiDoan(request.giaiDoan());
        entity = repository.saveAndFlush(entity);
        mutations.audit("NHIEM_VU", id, entity.getVersion(), "UPDATE", actor, null);
        return entity;
    }

    private static void apply(NhiemVu entity, String ten, vn.vht.qtkhcn.hoso.domain.Cap cap,
                              String hoTen, String hocHamHocVi, String maNhanVien, String email,
                              String donViChuTri, String thoiGianThucHien, String duToan) {
        ChuNhiem chuNhiem = new ChuNhiem();
        chuNhiem.setHoTen(hoTen.trim());
        chuNhiem.setHocHamHocVi(trimToNull(hocHamHocVi));
        chuNhiem.setMaNhanVien(trimToNull(maNhanVien));
        chuNhiem.setEmail(trimToNull(email));
        entity.setTen(ten.trim());
        entity.setCap(cap);
        entity.setChuNhiem(chuNhiem);
        entity.setDonViChuTri(donViChuTri.trim());
        entity.setThoiGianThucHien(trimToNull(thoiGianThucHien));
        entity.setDuToan(trimToNull(duToan));
    }

    private static String trimToNull(String value) {
        return value == null || value.isBlank() ? null : value.trim();
    }
}
