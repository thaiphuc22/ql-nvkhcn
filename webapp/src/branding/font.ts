/*
 * Font hệ thống VHT ở dạng TS — dùng cho những nơi CSS không với tới:
 * bpmn-js đo & wrap chữ trên canvas SVG bằng config `textRenderer` (JS),
 * nên phải truyền font qua đây thay vì đè CSS (đè CSS → chữ tràn khung vì
 * engine vẫn đo bằng font cũ). Giữ ĐỒNG BỘ với --vht-font trong tokens.css.
 */
export const VHT_FONT_FAMILY = "Inter, system-ui, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif"

/** Config textRenderer chung cho BpmnModeler + NavigatedViewer. */
export const VHT_TEXT_RENDERER = {
  defaultStyle: { fontFamily: VHT_FONT_FAMILY, fontSize: 12, lineHeight: 1.2 },
  externalStyle: { fontFamily: VHT_FONT_FAMILY, fontSize: 12, lineHeight: 1.2 },
}
