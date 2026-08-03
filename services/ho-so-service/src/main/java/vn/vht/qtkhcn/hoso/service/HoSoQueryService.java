package vn.vht.qtkhcn.hoso.service;

import jakarta.persistence.EntityNotFoundException;
import java.util.List;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import vn.vht.qtkhcn.hoso.domain.HoSo;
import vn.vht.qtkhcn.hoso.domain.HoiDongXetDuyet;
import vn.vht.qtkhcn.hoso.domain.NhiemVu;
import vn.vht.qtkhcn.hoso.repository.HoSoRepository;
import vn.vht.qtkhcn.hoso.repository.HoiDongXetDuyetRepository;
import vn.vht.qtkhcn.hoso.repository.NhiemVuRepository;
import vn.vht.qtkhcn.hoso.web.dto.HoSoResponse;

@Service
@Transactional(readOnly = true)
public class HoSoQueryService {

    private final HoSoRepository hoSoRepository;
    private final NhiemVuRepository nhiemVuRepository;
    private final HoiDongXetDuyetRepository hoiDongXetDuyetRepository;

    public HoSoQueryService(HoSoRepository hoSoRepository, NhiemVuRepository nhiemVuRepository,
            HoiDongXetDuyetRepository hoiDongXetDuyetRepository) {
        this.hoSoRepository = hoSoRepository;
        this.nhiemVuRepository = nhiemVuRepository;
        this.hoiDongXetDuyetRepository = hoiDongXetDuyetRepository;
    }

    public List<HoSoResponse> findAll() {
        List<HoSo> hoSoList = hoSoRepository.findAll();
        List<String> nhiemVuIds = hoSoList.stream().map(HoSo::getMaNV).distinct().toList();
        Map<String, NhiemVu> nhiemVuById = nhiemVuRepository.findAllById(nhiemVuIds).stream()
                .collect(Collectors.toMap(NhiemVu::getMa, Function.identity()));
        List<String> hoSoIds = hoSoList.stream().map(HoSo::getId).toList();
        Map<String, List<HoiDongXetDuyet>> hoiDongByHoSoId = hoiDongXetDuyetRepository
                .findByHoSoIdInOrderByCreatedAtAsc(hoSoIds).stream()
                .collect(Collectors.groupingBy(HoiDongXetDuyet::getHoSoId));
        return hoSoList.stream()
                .map(hoSo -> HoSoResponse.from(hoSo, requiredNhiemVu(hoSo, nhiemVuById),
                        hoiDongByHoSoId.getOrDefault(hoSo.getId(), List.of())))
                .toList();
    }

    public VersionedResponse<HoSoResponse> findById(String id) {
        HoSo hoSo = hoSoRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Không tìm thấy HoSo " + id));
        NhiemVu nhiemVu = nhiemVuRepository.findById(hoSo.getMaNV())
                .orElseThrow(() -> new IllegalStateException(
                        "Hồ sơ " + id + " tham chiếu NhiemVu không tồn tại " + hoSo.getMaNV()));
        List<HoiDongXetDuyet> hoiDongXetDuyet = hoiDongXetDuyetRepository.findByHoSoIdOrderByCreatedAtAsc(id);
        return new VersionedResponse<>(HoSoResponse.from(hoSo, nhiemVu, hoiDongXetDuyet), hoSo.getVersion());
    }

    private static NhiemVu requiredNhiemVu(HoSo hoSo, Map<String, NhiemVu> nhiemVuById) {
        NhiemVu nhiemVu = nhiemVuById.get(hoSo.getMaNV());
        if (nhiemVu == null) {
            throw new IllegalStateException(
                    "Hồ sơ " + hoSo.getId() + " tham chiếu NhiemVu không tồn tại " + hoSo.getMaNV());
        }
        return nhiemVu;
    }
}
