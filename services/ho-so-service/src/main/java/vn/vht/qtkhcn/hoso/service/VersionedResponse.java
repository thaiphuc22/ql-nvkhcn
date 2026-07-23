package vn.vht.qtkhcn.hoso.service;

public record VersionedResponse<T>(T body, long version) {
}
