package vn.vht.qtkhcn.hoso.service;

import jakarta.persistence.EntityNotFoundException;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Set;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import vn.vht.qtkhcn.hoso.domain.DossierStatus;
import vn.vht.qtkhcn.hoso.domain.DossierStep;
import vn.vht.qtkhcn.hoso.domain.HoSo;
import vn.vht.qtkhcn.hoso.domain.HoSoLoai;
import vn.vht.qtkhcn.hoso.domain.StepStatus;
import vn.vht.qtkhcn.hoso.domain.TaiLieu;
import vn.vht.qtkhcn.hoso.repository.HoSoRepository;
import vn.vht.qtkhcn.hoso.repository.NhiemVuRepository;
import vn.vht.qtkhcn.hoso.repository.TaiLieuRepository;
import vn.vht.qtkhcn.hoso.web.dto.CreateHoSoRequest;
import vn.vht.qtkhcn.hoso.web.dto.CreateTaiLieuRequest;
import vn.vht.qtkhcn.hoso.web.dto.UpdateHoSoRequest;

@Service
public class HoSoMutationService {

    private static final DateTimeFormatter STEP_TIME = DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm");

    private final HoSoRepository hoSoRepository;
    private final NhiemVuRepository nhiemVuRepository;
    private final TaiLieuRepository taiLieuRepository;
    private final BusinessIdGenerator idGenerator;
    private final MutationSupport mutations;

    public HoSoMutationService(HoSoRepository hoSoRepository, NhiemVuRepository nhiemVuRepository,
                               TaiLieuRepository taiLieuRepository, BusinessIdGenerator idGenerator,
                               MutationSupport mutations) {
        this.hoSoRepository = hoSoRepository;
        this.nhiemVuRepository = nhiemVuRepository;
        this.taiLieuRepository = taiLieuRepository;
        this.idGenerator = idGenerator;
        this.mutations = mutations;
    }

    @Transactional
    public HoSo create(CreateHoSoRequest request, String actorHeader) {
        String actor = mutations.requireActor(actorHeader);
        if (!nhiemVuRepository.existsById(request.maNV())) {
            throw new EntityNotFoundException("Khong tim thay NhiemVu " + request.maNV());
        }
        HoSo entity = new HoSo();
        entity.setId(idGenerator.nextHoSoId());
        entity.setMaNV(request.maNV());
        entity.setLoai(request.loai() == null ? HoSoLoai.CHU_TRUONG : request.loai());
        entity.setQuyTrinh("");
        entity.setQuyTrinhTen("Chua vao quy trinh");
        entity.setNguoiKhoiTao(request.nguoiKhoiTao().trim());
        entity.setNgayTao(request.ngayTao() == null ? LocalDate.now() : request.ngayTao());
        entity.setTrangThai(DossierStatus.DRAFT);
        entity.setBuocHienTai(0);

        DossierStep initial = new DossierStep();
        initial.setHoSo(entity);
        initial.setBuocIndex(0);
        initial.setTen("Khoi tao ho so");
        initial.setVaiTro("Chu nhiem de tai (PM)");
        initial.setVaiTroCodes(Set.of("PM"));
        initial.setNguoi(entity.getNguoiKhoiTao());
        initial.setTrangThai(StepStatus.DONE);
        initial.setThoiDiem(LocalDateTime.now().format(STEP_TIME));
        entity.getSteps().add(initial);

        List<CreateTaiLieuRequest> documents = request.taiLieu() == null
                ? defaultDocuments(entity.getLoai()) : request.taiLieu();
        for (CreateTaiLieuRequest requested : documents) {
            entity.getTaiLieu().add(newDocument(entity, requested));
        }
        entity = hoSoRepository.saveAndFlush(entity);
        mutations.audit("HO_SO", entity.getId(), entity.getVersion(), "CREATE", actor,
                "documents=" + entity.getTaiLieu().size());
        return entity;
    }

    @Transactional
    public HoSo update(String id, long expectedVersion, UpdateHoSoRequest request, String actorHeader) {
        String actor = mutations.requireActor(actorHeader);
        HoSo entity = requiredDraft(id);
        mutations.verifyVersion("HoSo", id, expectedVersion, entity.getVersion());
        entity.setLoai(request.loai());
        entity.setNguoiKhoiTao(request.nguoiKhoiTao().trim());
        entity.setNgayTao(request.ngayTao());
        entity = hoSoRepository.saveAndFlush(entity);
        mutations.audit("HO_SO", id, entity.getVersion(), "UPDATE", actor, null);
        return entity;
    }

    @Transactional
    public TaiLieu addDocument(String hoSoId, CreateTaiLieuRequest request, String actorHeader) {
        String actor = mutations.requireActor(actorHeader);
        HoSo hoSo = requiredDraft(hoSoId);
        TaiLieu document = taiLieuRepository.saveAndFlush(newDocument(hoSo, request));
        mutations.audit("TAI_LIEU", String.valueOf(document.getId()), document.getVersion(),
                "CREATE", actor, "hoSoId=" + hoSoId);
        return document;
    }

    @Transactional
    public TaiLieu updateDocument(String hoSoId, long documentId, long expectedVersion,
                                  CreateTaiLieuRequest request, String actorHeader) {
        String actor = mutations.requireActor(actorHeader);
        requiredDraft(hoSoId);
        TaiLieu document = requiredDocument(hoSoId, documentId);
        mutations.verifyVersion("TaiLieu", String.valueOf(documentId), expectedVersion, document.getVersion());
        document.setTen(request.ten().trim());
        document.setLoai(request.loai().trim());
        document = taiLieuRepository.saveAndFlush(document);
        mutations.audit("TAI_LIEU", String.valueOf(documentId), document.getVersion(),
                "UPDATE", actor, "hoSoId=" + hoSoId);
        return document;
    }

    @Transactional
    public void deleteDocument(String hoSoId, long documentId, long expectedVersion, String actorHeader) {
        String actor = mutations.requireActor(actorHeader);
        requiredDraft(hoSoId);
        TaiLieu document = requiredDocument(hoSoId, documentId);
        mutations.verifyVersion("TaiLieu", String.valueOf(documentId), expectedVersion, document.getVersion());
        taiLieuRepository.delete(document);
        taiLieuRepository.flush();
        mutations.audit("TAI_LIEU", String.valueOf(documentId), expectedVersion, "DELETE", actor,
                "hoSoId=" + hoSoId);
    }

    private HoSo requiredDraft(String id) {
        HoSo entity = hoSoRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Khong tim thay HoSo " + id));
        if (entity.getTrangThai() != DossierStatus.DRAFT) {
            throw new IllegalStateException("Ho so " + id + " is not DRAFT and cannot be edited.");
        }
        return entity;
    }

    private TaiLieu requiredDocument(String hoSoId, long documentId) {
        return taiLieuRepository.findByIdAndHoSoId(documentId, hoSoId)
                .orElseThrow(() -> new EntityNotFoundException(
                        "Khong tim thay TaiLieu " + documentId + " trong HoSo " + hoSoId));
    }

    private static TaiLieu newDocument(HoSo hoSo, CreateTaiLieuRequest request) {
        TaiLieu document = new TaiLieu();
        document.setHoSo(hoSo);
        document.setTen(request.ten().trim());
        document.setLoai(request.loai().trim());
        return document;
    }

    private static List<CreateTaiLieuRequest> defaultDocuments(HoSoLoai type) {
        return switch (type) {
            case CHU_TRUONG -> List.of(
                    new CreateTaiLieuRequest("Thuyet minh de tai.pdf", "PDF"),
                    new CreateTaiLieuRequest("Du toan PL1-PL6.xlsx", "Excel"));
            case XET_DUYET -> List.of(new CreateTaiLieuRequest("Ho so xet duyet.pdf", "PDF"));
            case BAO_CAO -> List.of(new CreateTaiLieuRequest("Bao cao dinh ky.pdf", "PDF"));
            case DIEU_CHINH -> List.of(new CreateTaiLieuRequest("To trinh dieu chinh.pdf", "PDF"));
            case NGHIEM_THU -> List.of(new CreateTaiLieuRequest("Bao cao tong ket.pdf", "PDF"));
            case QUYET_TOAN -> List.of(new CreateTaiLieuRequest("Bao cao quyet toan.pdf", "PDF"));
        };
    }
}
