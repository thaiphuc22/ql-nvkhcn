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
}

/**
 * Xem sơ đồ BPMN CHỈ-ĐỌC (`NavigatedViewer`): kéo/thu-phóng, không palette,
 * không sửa. Dùng cho màn Chi tiết quy trình. Tái dùng skin + toolbar + minimap.
 */
export default function BpmnViewer({ xml, height = '64vh' }: Props) {
  const wrapperRef = useRef<HTMLDivElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const viewerRef = useRef<NavigatedViewer | null>(null)
  const [isFs, setIsFs] = useState(false)

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
    viewer
      .importXML(xml || STARTER_BPMN)
      .then(() => {
        const canvas = viewer.get('canvas') as { zoom: (m?: string | number) => number }
        const fittedZoom = canvas.zoom('fit-viewport')
        if (fittedZoom < 0.42) canvas.zoom(0.42)
      })
      .catch(() => {
        /* XML lỗi — bỏ qua */
      })
    return () => {
      viewer.destroy()
      viewerRef.current = null
    }
  }, [xml])

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
