import { environment } from '../../environments/environment';

/** Base URL của Spring Boot. Demo dùng chuỗi rỗng để gọi `/api/*` cùng origin qua Caddy. */
export const API_BASE_URL = environment.apiBaseUrl;
export const BACKEND_CONNECTION_LABEL = API_BASE_URL || 'proxy cùng origin /api';

/** Header + giá trị dev API key stub (xem backend DevApiKeyFilter.java — KHÔNG phải JWT thật). */
export const DEV_API_KEY_HEADER = 'X-QTKHCN-Dev-Key';
export const DEV_API_KEY_VALUE = environment.devApiKeyValue;

/** Demo identity resolved to roles exclusively by the backend catalog. */
export const DEMO_USER_ID_HEADER = 'X-QTKHCN-User-Id';

/** Encode Unicode audit names as an ASCII-only RFC 5987-style header value. */
export function encodeAuditActor(actor: string): string {
  return `UTF-8''${encodeURIComponent(actor.trim())}`;
}
