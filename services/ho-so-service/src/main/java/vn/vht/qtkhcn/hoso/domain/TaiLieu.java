package vn.vht.qtkhcn.hoso.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Embeddable
@Getter
@Setter
@NoArgsConstructor
public class TaiLieu {

    @Column(name = "ten", nullable = false)
    private String ten;

    @Column(name = "loai", nullable = false)
    private String loai;
}
