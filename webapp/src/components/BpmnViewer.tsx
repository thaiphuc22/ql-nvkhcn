import { useEffect, useRef, useState } from 'react'
import NavigatedViewer from 'bpmn-js/lib/NavigatedViewer'
import minimapModule from 'diagram-js-minimap'
import 'bpmn-js/dist/assets/diagram-js.css'
import 'bpmn-js/dist/assets/bpmn-js.css'
import 'bpmn-js/dist/assets/bpmn-font/css/bpmn.css'
import 'diagram-js-minimap/assets/diagram-js-minimap.css'
import '../branding/bpmnio-skin.css'
import { VHT_TEXT_RENDERER } from '../branding/font'
import { STARTER_BPMN } from '../data/bpmn'
import DiagramToolbar from './DiagramToolbar'

interface Props {
  xml?: string
  /** Chiều cao vùng xem (mặc định 64vh). */
  height?: string
  /** Node BPMN của bước HIỆN TẠI — tô sáng đỏ VHT (marker `vht-step-active`). */
  activeIds?: string[]
  /** Node ĐÍCH của ngoại lệ đang chờ/áp dụng — viền volcano nét đứt (`vht-step-exception`). */
  exceptionIds?: string[]
}

/** Cast tối thiểu cho canvas bpmn-js (add/remove marker + zoom). */
type BpmnCanvas = {
  zoom: (m?: string | number) => number
  addMarker: (id: string, cls: string) => void
  removeMarker: (id: string, cls: string) => void
}

/**
 * Xem sơ đồ BPMN CHỈ-ĐỌC (`NavigatedViewer`): kéo/thu-phóng, không palette,
 * không sửa. Dùng cho màn Chi tiết quy trình. Tái dùng skin + toolbar + minimap.
 *
 * `activeIds`/`exceptionIds`: tô sáng node của bước hiện tại / đích ngoại lệ —
 * dùng ở Chi tiết hồ sơ (bản đồ bước↔BPMN: data/bpmnStepMap.ts).
 */
export default function BpmnViewer({ xml, height = '64vh', activeIds = [], exceptionIds = [] }: Props) {
  const wrapperRef = useRef<HTMLDivElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const viewerRef = useRef<NavigatedViewer | null>(null)
  const [isFs, setIsFs] = useState(false)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    const viewer = new NavigatedViewer({
      container: el,
      additionalModules: [minimapModule],
      minimap: { open: false },
      textRenderer: VHT_TEXT_RENDERER,
    } as never)
    viewerRef.current = viewer
    setReady(false)
    viewer
      .importXML(xml || STARTER_BPMN)
      .then(() => {
        const canvas = viewer.get('canvas') as { zoom: (m?: string | number) => number }
        const fittedZoom = canvas.zoom('fit-viewport')
        if (fittedZoom < 0.42) canvas.zoom(0.42)
        setReady(true)
      })
      .catch(() => {
        /* XML lỗi — bỏ qua */
      })
    return () => {
      viewer.destroy()
      viewerRef.current = null
      setReady(false)
    }
  }, [xml])

  // Tô sáng node theo bản đồ bước↔BPMN. Chỉ áp marker cho id có thật trong sơ đồ.
  useEffect(() => {
    if (!ready) return
    const canvas = viewerRef.current?.get('canvas') as BpmnCanvas | undefined
    const registry = viewerRef.current?.get('elementRegistry') as
      | { get: (id: string) => unknown }
      | undefined
    if (!canvas || !registry) return
    const applied: { id: string; cls: string }[] = []
    const mark = (ids: string[], cls: string) =>
      ids.forEach((id) => {
        if (registry.get(id)) {
          canvas.addMarker(id, cls)
          applied.push({ id, cls })
        }
      })
    mark(activeIds, 'vht-step-active')
    mark(exceptionIds, 'vht-step-exception')
    return () => applied.forEach(({ id, cls }) => canvas.removeMarker(id, cls))
  }, [ready, activeIds, exceptionIds])

  useEffect(() => {
    const onFs = () => {
      setIsFs(document.fullscreenElement === wrapperRef.current)
      window.setTimeout(() => {
        const canvas = viewerRef.current?.get('canvas') as { resized?: () => void; zoom?: (m: string) => void } | undefined
        canvas?.resized?.()
        canvas?.zoom?.('fit-viewport')
      }, 120)
    }
    document.addEventListener('fullscreenchange', onFs)
    return () => document.removeEventListener('fullscreenchange', onFs)
  }, [])

  const getCanvas = () => viewerRef.current?.get('canvas') as { zoom: (s?: number | string) => number } | undefined
  const zoomBy = (factor: number) => {
    const c = getCanvas()
    if (c) c.zoom((c.zoom() as number) * factor)
  }
  const fit = () => getCanvas()?.zoom('fit-viewport')
  const toggleMinimap = () => (viewerRef.current?.get('minimap') as { toggle: () => void } | undefined)?.toggle()
  const toggleFullscreen = () => {
    const el = wrapperRef.current
    if (!el) return
    if (document.fullscreenElement) void document.exitFullscreen()
    else void el.requestFullscreen()
  }

  return (
    <div
      ref={wrapperRef}
      style={{ position: 'relative', height: isFs ? '100vh' : height, background: '#fff', overflow: 'hidden' }}
    >
      <div ref={containerRef} className="vht-diagram" style={{ height: '100%' }} />
      <DiagramToolbar
        isFs={isFs}
        onZoomIn={() => zoomBy(1.2)}
        onZoomOut={() => zoomBy(1 / 1.2)}
        onFit={fit}
        onToggleMinimap={toggleMinimap}
        onToggleFullscreen={toggleFullscreen}
      />
    </div>
  )
}
