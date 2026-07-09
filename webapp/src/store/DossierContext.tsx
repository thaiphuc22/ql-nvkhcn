import {
  createContext,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  seedHoSo,
  joinDossiers,
  stepsFromTaskSteps,
  type Dossier,
  type HoSo,
} from "../data/dossiers";
import type { TaskStep } from "../data/processes";
import { useNhiemVu } from "./NhiemVuContext";

const NOW = "03/07/2026 10:00";
/** Hạn xử lý mặc định cho bước đầu tiên sau Gửi duyệt: NOW + 7 ngày. */
const HAN_XU_LY = "10/07/2026";

interface DossierCtxValue {
  /** Danh sách hồ sơ dạng view (đã join Nhiệm vụ KHCN). */
  list: Dossier[];
  getById: (id: string) => Dossier | undefined;
  /** Thêm hồ sơ mới (vd hồ sơ Chủ trương sinh cùng NV). Mới nhất lên đầu. */
  createHoSo: (h: HoSo) => void;
  /**
   * Gửi duyệt hồ sơ Khởi tạo (draft): gắn quy trình đã chọn, dựng các bước phê
   * duyệt từ taskSteps của quy trình → hồ sơ chuyển sang Đang xử lý.
   */
  submitHoSo: (
    id: string,
    quyTrinh: { ma: string; ten: string; taskSteps?: TaskStep[] },
  ) => void;
  approveStep: (id: string, actor: string, yKien?: string) => void;
  rejectStep: (id: string, reason: string, actor: string) => void;
  /**
   * Trả hồ sơ về một bước TRƯỚC để chỉnh sửa (rework loop — nhánh "Yêu cầu hiệu
   * chỉnh" của các gateway RD01.01). KHÁC rejectStep: hồ sơ vẫn "Đang xử lý",
   * không kết thúc. Ghi lý do trả lại lên bước người duyệt; mở lại các bước từ
   * `toIdx` trở đi (toIdx thành current, phần còn lại về pending).
   */
  returnStep: (id: string, toIdx: number, note: string, actor: string) => void;
  /**
   * Áp dụng một Chi tiết đã được duyệt: đánh dấu bước hiện tại "done" kèm ghi chú
   * Chi tiết (không xoá lịch sử), rồi nhảy thẳng tới bước đích. Chỉ gọi sau khi
   * Exception Approval Workflow (ExceptionContext) đã duyệt — không gọi trực tiếp.
   */
  applyExceptionSkip: (
    id: string,
    fromIdx: number,
    toIdx: number,
    note: string,
    actor: string,
  ) => void;
}

const DossierCtx = createContext<DossierCtxValue | null>(null);

export function useDossiers(): DossierCtxValue {
  const ctx = useContext(DossierCtx);
  if (!ctx) throw new Error("useDossiers must be used within DossierProvider");
  return ctx;
}

export function DossierProvider({ children }: { children: ReactNode }) {
  // Lưu trữ chuẩn hoá: chỉ giữ HoSo. NhiemVu (master) lấy từ NhiemVuContext để
  // hồ sơ của NV vừa tạo cũng join được (không kẹt ở seed tĩnh).
  const [hoso, setHoSo] = useState<HoSo[]>(seedHoSo);
  const { getByMa } = useNhiemVu();

  // View join dùng cho UI.
  const list = useMemo(() => joinDossiers(hoso, getByMa), [hoso, getByMa]);
  const getById = (id: string) => list.find((d) => d.id === id);

  const createHoSo = (h: HoSo) => setHoSo((prev) => [h, ...prev]);

  const submitHoSo = (
    id: string,
    quyTrinh: { ma: string; ten: string; taskSteps?: TaskStep[] },
  ) => {
    setHoSo((prev) =>
      prev.map((h) => {
        if (h.id !== id || h.trangThai !== "draft") return h;
        const buocMoi = stepsFromTaskSteps(quyTrinh.taskSteps ?? [], {
          hanXuLy: HAN_XU_LY,
        });
        // Quy trình chưa cấu hình bước → giữ nguyên draft (UI đã lọc, đây là chốt chặn).
        if (!buocMoi.length) return h;
        return {
          ...h,
          quyTrinh: quyTrinh.ma,
          quyTrinhTen: quyTrinh.ten,
          trangThai: "processing" as const,
          buocHienTai: h.steps.length,
          steps: [...h.steps, ...buocMoi],
        };
      }),
    );
  };

  const approveStep = (id: string, actor: string, yKien?: string) => {
    setHoSo((prev) =>
      prev.map((h) => {
        if (h.id !== id || h.trangThai !== "processing") return h;
        const idx = h.buocHienTai;
        const steps = h.steps.map((s, i) =>
          i === idx
            ? {
                ...s,
                trangThai: "done" as const,
                thoiDiem: NOW,
                nguoi: s.nguoi || actor,
                yKien: yKien ?? s.yKien,
              }
            : s,
        );
        const nextIdx = idx + 1;
        if (nextIdx < steps.length) {
          steps[nextIdx] = { ...steps[nextIdx], trangThai: "current" };
          return { ...h, steps, buocHienTai: nextIdx };
        }
        return { ...h, steps, trangThai: "approved" as const };
      }),
    );
  };

  const rejectStep = (id: string, reason: string, actor: string) => {
    setHoSo((prev) =>
      prev.map((h) => {
        if (h.id !== id || h.trangThai !== "processing") return h;
        const idx = h.buocHienTai;
        const steps = h.steps.map((s, i) =>
          i === idx
            ? {
                ...s,
                trangThai: "rejected" as const,
                thoiDiem: NOW,
                nguoi: s.nguoi || actor,
                yKien: reason,
              }
            : s,
        );
        return { ...h, steps, trangThai: "rejected" as const };
      }),
    );
  };

  const returnStep = (
    id: string,
    toIdx: number,
    note: string,
    actor: string,
  ) => {
    setHoSo((prev) =>
      prev.map((h) => {
        if (h.id !== id || h.trangThai !== "processing") return h;
        const idx = h.buocHienTai;
        // Chỉ trả về bước phía trước bước hiện tại.
        if (toIdx < 0 || toIdx >= idx) return h;
        const steps = h.steps.map((s, i) => {
          // Bước người duyệt hiện tại: ghi quyết định "trả lại" + về pending (sẽ duyệt lại sau).
          if (i === idx)
            return {
              ...s,
              trangThai: "pending" as const,
              thoiDiem: NOW,
              nguoi: s.nguoi || actor,
              yKien: `↩ Trả lại để chỉnh sửa: ${note}`,
            };
          // Bước đích: thành current để vai trò phụ trách chỉnh sửa lại.
          if (i === toIdx) return { ...s, trangThai: "current" as const };
          // Các bước xen giữa (đã done): mở lại về pending để đi lại tuần tự.
          if (i > toIdx && i < idx)
            return { ...s, trangThai: "pending" as const };
          return s;
        });
        return { ...h, steps, buocHienTai: toIdx };
      }),
    );
  };

  const applyExceptionSkip = (
    id: string,
    fromIdx: number,
    toIdx: number,
    note: string,
    actor: string,
  ) => {
    setHoSo((prev) =>
      prev.map((h) => {
        if (
          h.id !== id ||
          h.trangThai !== "processing" ||
          h.buocHienTai !== fromIdx
        )
          return h;
        if (toIdx <= fromIdx || toIdx >= h.steps.length) return h;
        const steps = h.steps.map((s, i) => {
          if (i === fromIdx)
            return {
              ...s,
              trangThai: "done" as const,
              thoiDiem: NOW,
              nguoi: s.nguoi || actor,
              yKien: note,
            };
          if (i === toIdx) return { ...s, trangThai: "current" as const };
          return s;
        });
        return { ...h, steps, buocHienTai: toIdx };
      }),
    );
  };

  return (
    <DossierCtx.Provider
      value={{
        list,
        getById,
        createHoSo,
        submitHoSo,
        approveStep,
        rejectStep,
        returnStep,
        applyExceptionSkip,
      }}
    >
      {children}
    </DossierCtx.Provider>
  );
}
