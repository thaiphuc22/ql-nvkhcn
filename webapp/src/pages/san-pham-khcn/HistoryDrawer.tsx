import { Drawer, Timeline, Typography } from 'antd'
import type { HistoryEntry } from '../../data/sanPhamKhcn'

const { Text } = Typography

export default function HistoryDrawer({
  open,
  title,
  entries,
  onClose,
}: {
  open: boolean
  title: string
  entries: HistoryEntry[]
  onClose: () => void
}) {
  return (
    <Drawer title={`Lịch sử — ${title}`} open={open} onClose={onClose} width={420}>
      {entries.length === 0 ? (
        <Text type="secondary">Chưa có lịch sử.</Text>
      ) : (
        <Timeline
          items={entries.map((e) => ({
            children: (
              <div>
                <div><Text strong>{e.action}</Text></div>
                <Text type="secondary">{e.at} — {e.actor}</Text>
                {e.note && <div><Text>{e.note}</Text></div>}
              </div>
            ),
          }))}
        />
      )}
    </Drawer>
  )
}
