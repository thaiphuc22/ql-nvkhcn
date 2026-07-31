package vn.vht.qtkhcn.camunda;

import java.util.Collection;
import java.util.List;
import java.util.Set;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.HttpHeaders;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientException;

/**
 * Dịch {@code candidateGroups} của một user task thành danh sách người thật của đúng hồ sơ đó, hỏi
 * ho-so-service — nơi giữ bảng Hội đồng xét duyệt (D3: business data sống ở đó).
 *
 * <p>Lý do tồn tại: mã vai trò trong {@code candidateGroups} chỉ nói được vế TĨNH ("ai đủ tư cách ngồi
 * hội đồng xét duyệt"), trong khi thành phần hội đồng là dữ liệu ĐỘNG theo từng hồ sơ và một người có
 * thể ngồi nhiều hội đồng khác nhau. Không có bước dịch này thì mọi người giữ vai trò {@code HDXD}
 * đều thao tác được bước họp hội đồng của MỌI hồ sơ.</p>
 *
 * <p>Backend cố ý KHÔNG biết nhóm nào ứng với hội đồng cấp nào — nó chuyển tiếp nguyên si danh sách
 * nhóm đọc từ Camunda; toàn bộ tri thức RD02.02 nằm ở {@code HoiDongCap} phía ho-so-service.</p>
 */
@Component
public class HoiDongMembershipGateway {
    private static final Logger log = LoggerFactory.getLogger(HoiDongMembershipGateway.class);
    private static final ParameterizedTypeReference<List<String>> USER_IDS =
            new ParameterizedTypeReference<>() {};

    private final RestClient hoSo;

    public HoiDongMembershipGateway(@Value("${qtkhcn.ho-so.base-url:http://127.0.0.1:8093}") String baseUrl,
            @Value("${qtkhcn.ho-so.service-token:}") String token) {
        this.hoSo = RestClient.builder().baseUrl(baseUrl)
                .defaultHeader(HttpHeaders.AUTHORIZATION, "Bearer " + token).build();
    }

    /**
     * Rỗng nghĩa là "không thu hẹp được" — bước không thuộc hội đồng nào, hoặc hội đồng chưa gắn tài
     * khoản cho thành viên. Người gọi phải hiểu đó là GIỮ NGUYÊN phạm vi theo vai trò, không phải cấm
     * tất cả; hồ sơ tạo trước khi có cột {@code user_id} phụ thuộc vào đúng điểm này để không kẹt.
     *
     * <p>Ho-so-service không sẵn sàng cũng trả rỗng thay vì ném: một sự cố hạ tầng ở service khác
     * không được biến thành "cấm toàn bộ thao tác", vì lớp kiểm tra theo vai trò vẫn còn nguyên phía
     * sau. Ghi WARN để không im lặng.</p>
     */
    public Set<String> candidateUsers(String hoSoId, Collection<String> candidateGroups) {
        if (hoSoId == null || hoSoId.isBlank() || candidateGroups == null || candidateGroups.isEmpty()) {
            return Set.of();
        }
        try {
            List<String> users = hoSo.get()
                    .uri(builder -> builder.path("/internal/v1/ho-so/{id}/hoi-dong-xet-duyet/candidate-users")
                            .queryParam("groups", candidateGroups.toArray())
                            .build(hoSoId))
                    .retrieve().body(USER_IDS);
            return users == null ? Set.of() : Set.copyOf(users);
        } catch (RestClientException unavailable) {
            log.warn("Khong doc duoc thanh vien Hoi dong cho HoSo {} (nhom {}): {} — giu nguyen pham vi "
                    + "theo vai tro.", hoSoId, candidateGroups, unavailable.toString());
            return Set.of();
        }
    }
}
