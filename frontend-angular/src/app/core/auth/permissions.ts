import { DemoUser } from './demo-users';

/**
 * Port tối thiểu của `webapp/src/data/permissions.ts` cho Angular, chỉ phần dùng ở
 * `/viec-cua-toi` (Worklist). `DemoUser.roleCodes` đã port sẵn candidateGroups —
 * hàm ở đây chỉ so khớp, không tự suy diễn từ nhãn vai trò như bản React (Angular không
 * có bảng nhãn trung gian). Đây là lọc phía CLIENT cho UI — không thay thế RBAC backend
 * thật (Bước 4 trong active-task.md, chưa làm).
 */

export function hasAnyRole(user: DemoUser | null | undefined, codes: string[]): boolean {
  if (!user) return false;
  if (user.isAdmin) return true;
  return codes.some((c) => user.roleCodes.includes(c));
}

/**
 * Quyền xử lý bước hiện tại: user thuộc candidateGroups của bước.
 * Bước không có `vaiTroCodes` → chỉ admin (fail-closed, tránh lệch nhãn).
 */
export function canProcessStep(
  user: DemoUser | null | undefined,
  step: { vaiTroCodes: string[] } | undefined,
): boolean {
  if (!user || !step) return false;
  if (user.isAdmin) return true;
  return hasAnyRole(user, step.vaiTroCodes ?? []);
}
