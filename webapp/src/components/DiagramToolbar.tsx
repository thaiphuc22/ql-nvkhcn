import { Button, Space, Tooltip } from 'antd'
import {
  BorderInnerOutlined,
  BorderOuterOutlined,
  CompressOutlined,
  FullscreenExitOutlined,
  FullscreenOutlined,
  RedoOutlined,
  UndoOutlined,
  ZoomInOutlined,
  ZoomOutOutlined,
} from '@ant-design/icons'

interface Props {
  isFs: boolean
  /** Đẩy toolbar sang trái để né panel dock (px) — chỉ áp dụng khi không `inline`. */
  offsetRight?: number
  /** true = render tại chỗ (hàng toolbar trên đầu editor), không float góc dưới-phải. */
  inline?: boolean
  onZoomIn: () => void
  onZoomOut: () => void
  onFit: () => void
  onToggleMinimap: () => void
  onToggleFullscreen: () => void
  /** Mức zoom hiện tại (%) — hiện nút "100%" khi truyền; click = về 100%. */
  zoomPct?: number
  onZoomReset?: () => void
  /** Undo/Redo — chỉ editor truyền. */
  onUndo?: () => void
  onRedo?: () => void
  canUndo?: boolean
  canRedo?: boolean
  /** Lưới canvas — chỉ editor truyền. */
  gridOn?: boolean
  onToggleGrid?: () => void
}

/**
 * Thanh công cụ zoom/lưới/undo dùng chung cho BpmnEditor & BpmnViewer.
 * Mặc định (`inline=false`) nổi ở góc dưới-phải canvas (BpmnViewer, và trước
 * đây cả BpmnEditor). `inline=true` (BpmnEditor — Đợt "toolbar ngang hàng
 * title") render tại chỗ, không position/zIndex riêng, để đặt vào hàng
 * toolbar cố định ngay dưới title Card.
 */
export default function DiagramToolbar({
  isFs,
  offsetRight = 0,
  inline = false,
  onZoomIn,
  onZoomOut,
  onFit,
  onToggleMinimap,
  onToggleFullscreen,
  zoomPct,
  onZoomReset,
  onUndo,
  onRedo,
  canUndo,
  canRedo,
  gridOn,
  onToggleGrid,
}: Props) {
  const buttons = (
    <Space.Compact>
      {onUndo && (
        <Tooltip title="Hoàn tác (Ctrl+Z)"><Button icon={<UndoOutlined />} onClick={onUndo} disabled={!canUndo} /></Tooltip>
      )}
      {onRedo && (
        <Tooltip title="Làm lại (Ctrl+Y)"><Button icon={<RedoOutlined />} onClick={onRedo} disabled={!canRedo} /></Tooltip>
      )}
      <Tooltip title="Thu nhỏ"><Button icon={<ZoomOutOutlined />} onClick={onZoomOut} /></Tooltip>
      {zoomPct !== undefined && (
        <Tooltip title="Về 100%">
          <Button onClick={onZoomReset} style={{ minWidth: 56, fontVariantNumeric: 'tabular-nums' }}>
            {zoomPct}%
          </Button>
        </Tooltip>
      )}
      <Tooltip title="Phóng to"><Button icon={<ZoomInOutlined />} onClick={onZoomIn} /></Tooltip>
      <Tooltip title="Vừa màn hình"><Button icon={<CompressOutlined />} onClick={onFit} /></Tooltip>
      {onToggleGrid && (
        <Tooltip title={gridOn ? 'Ẩn lưới' : 'Hiện lưới'}>
          <Button icon={<BorderInnerOutlined />} type={gridOn ? 'primary' : 'default'} ghost={gridOn} onClick={onToggleGrid} />
        </Tooltip>
      )}
      <Tooltip title="Bản đồ (minimap)"><Button icon={<BorderOuterOutlined />} onClick={onToggleMinimap} /></Tooltip>
      <Tooltip title={isFs ? 'Thoát toàn màn hình' : 'Toàn màn hình'}>
        <Button icon={isFs ? <FullscreenExitOutlined /> : <FullscreenOutlined />} onClick={onToggleFullscreen} />
      </Tooltip>
    </Space.Compact>
  )

  if (inline) return buttons

  return (
    <div style={{ position: 'absolute', bottom: 14, right: offsetRight + 14, zIndex: 30, transition: 'right 0.18s ease' }}>
      {buttons}
    </div>
  )
}
