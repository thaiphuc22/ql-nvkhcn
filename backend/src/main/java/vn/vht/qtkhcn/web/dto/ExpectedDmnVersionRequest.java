package vn.vht.qtkhcn.web.dto;

import jakarta.validation.constraints.PositiveOrZero;

public record ExpectedDmnVersionRequest(@PositiveOrZero int expectedVersion) {
}

