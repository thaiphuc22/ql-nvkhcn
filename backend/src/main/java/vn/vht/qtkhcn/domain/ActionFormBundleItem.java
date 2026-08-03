package vn.vht.qtkhcn.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import jakarta.persistence.OrderColumn;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Embeddable
@Getter
@Setter
@NoArgsConstructor
public class ActionFormBundleItem {
    @Column(name = "form_key", nullable = false, length = 128)
    private String formKey;
    @Column(name = "form_version")
    private Long formVersion;
    @Column(name = "display_order", nullable = false)
    private int displayOrder;
    @Column(name = "display_title", length = 255)
    private String displayTitle;
    @Column(name = "required_item", nullable = false)
    private boolean required;
    @Column(name = "form_mode", nullable = false, length = 8)
    private String mode;
    @Column(name = "skippable", nullable = false)
    private boolean skippable;
    @Column(name = "condition_expression", length = 1000)
    private String conditionExpression;
    @Column(name = "output_namespace", nullable = false, length = 128)
    private String outputNamespace;
}
