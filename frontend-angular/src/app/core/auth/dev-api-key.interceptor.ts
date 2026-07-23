import { HttpInterceptorFn } from '@angular/common/http';
import { API_BASE_URL, DEV_API_KEY_HEADER, DEV_API_KEY_VALUE } from '../api-config';

/**
 * Đính kèm dev API key stub (backend DevApiKeyFilter.java) cho mọi request gọi tới
 * backend Spring Boot. Chỉ áp dụng cho request trỏ tới API_BASE_URL — không đụng request
 * khác (nếu sau này có gọi ra ngoài). Sẽ thay bằng access token thật khi OQ-021 chốt.
 */
export const devApiKeyInterceptor: HttpInterceptorFn = (req, next) => {
  // Demo build deliberately has no browser-side key; Caddy injects it upstream. Checking the
  // value first also prevents an empty API_BASE_URL from matching every HTTP request.
  if (!DEV_API_KEY_VALUE || !isBackendApiUrl(req.url)) return next(req);
  return next(req.clone({ setHeaders: { [DEV_API_KEY_HEADER]: DEV_API_KEY_VALUE } }));
};

function isBackendApiUrl(url: string): boolean {
  const apiPath = `${API_BASE_URL}/api`;
  return url === apiPath || url.startsWith(`${apiPath}/`) || url.startsWith(`${apiPath}?`);
}
