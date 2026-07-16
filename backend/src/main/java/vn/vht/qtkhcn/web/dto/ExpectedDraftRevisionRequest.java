package vn.vht.qtkhcn.web.dto;

import jakarta.validation.constraints.PositiveOrZero;

public record ExpectedDraftRevisionRequest(@PositiveOrZero long expectedRevision) {
}
