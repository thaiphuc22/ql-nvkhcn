package vn.vht.qtkhcn.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/** Tài liệu đính kèm hồ sơ. Port từ webapp/src/data/dossiers.ts::HoSo.taiLieu. */
@Embeddable
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class TaiLieu {

    @Column(name = "ten", nullable = false)
    private String ten;

    @Column(name = "loai", nullable = false)
    private String loai;
}
