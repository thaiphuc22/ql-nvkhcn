import { useEffect, useState } from "react";

/*
 * Ngưỡng breakpoint hiệu chỉnh theo độ phân giải logic (CSS px) thực tế của
 * dải máy MacBook — thay cho bộ mặc định của Ant Design (md 768/lg 992/xl 1200/
 * xxl 1600), vốn không khớp với các mốc máy thật:
 *
 *   MacBook Air 13" (M2/M3)   1280 x 832
 *   MacBook Pro 13" / Air cũ  1440 x 900
 *   MacBook Pro 14"           1512 x 982
 *   MacBook Air 15"           1440 x 932
 *   MacBook Pro 16"           1728 x 1117
 */
export const BREAKPOINTS = {
  md: 1024, // ngưỡng tối thiểu để hiện sidebar + content song song
  lg: 1280, // MacBook Air 13" — layout 2 cột chuẩn
  xl: 1440, // MacBook Pro 13/14", Air 15" — đủ chỗ mở panel/drawer phụ
  xxl: 1728, // MacBook Pro 16" — layout 3 cột / bảng rộng
} as const;

export type BreakpointKey = keyof typeof BREAKPOINTS;

/** True khi viewport hẹp hơn `px`. Theo dõi resize qua matchMedia. */
export function useViewportBelow(px: number): boolean {
  const [below, setBelow] = useState(
    () => typeof window !== "undefined" && window.innerWidth < px,
  );

  useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${px - 1}px)`);
    const onChange = () => setBelow(mql.matches);
    onChange();
    mql.addEventListener("change", onChange);
    return () => mql.removeEventListener("change", onChange);
  }, [px]);

  return below;
}
