package vn.vht.qtkhcn.hoso.web;

final class HttpVersion {
    private HttpVersion() {
    }

    static long parse(String value) {
        try {
            String normalized = value == null ? "" : value.trim();
            if (normalized.startsWith("W/")) {
                normalized = normalized.substring(2);
            }
            return Long.parseLong(normalized.replace("\"", ""));
        } catch (RuntimeException exception) {
            throw new IllegalArgumentException("If-Match must contain a numeric version.");
        }
    }

    static String etag(long version) {
        return "\"" + version + "\"";
    }
}
