import { motion } from 'framer-motion'
import type { KeyPoints } from '@/types'

export default function KeyPointsView({ data }: { data: KeyPoints }) {
  return (
    <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 10 }}>
      {data.points.map((point, i) => (
        <motion.li
          key={i}
          initial={{ opacity: 0, x: -12 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: i * 0.07 }}
          style={{
            display: 'flex', alignItems: 'flex-start', gap: 14,
            background: 'var(--ink-3)', border: '1px solid var(--border)',
            borderRadius: 12, padding: '14px 16px',
          }}
        >
          <div style={{
            minWidth: 28, height: 28, borderRadius: 7, flexShrink: 0,
            background: 'linear-gradient(135deg, var(--amber), #d4912a)',
            color: '#0d0f14', fontSize: 12, fontWeight: 700,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            {i + 1}
          </div>
          <p style={{ fontSize: 14, lineHeight: 1.65, color: '#d8d4c8', paddingTop: 3 }}>{point}</p>
        </motion.li>
      ))}
    </ul>
  )
}
