import { useParams, Link } from 'react-router-dom'
import { motion } from 'framer-motion'

export default function NoteDetailPage() {
  const { id } = useParams()
  return (
    <div style={{ padding: '40px 48px', maxWidth: 900, margin: '0 auto' }}>
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
        <Link to="/notes" style={{ color: 'var(--muted)', textDecoration: 'none', fontSize: 13, display: 'flex', alignItems: 'center', gap: 6, marginBottom: 24 }}>
          ← Back to Notes
        </Link>
        <div style={{ background: 'var(--ink-2)', border: '1px solid var(--border)', borderRadius: 20, padding: 40, textAlign: 'center' }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>📄</div>
          <h2 style={{ fontFamily: '"Playfair Display", serif', fontSize: 22, fontWeight: 700, marginBottom: 10 }}>
            Note Detail — {id}
          </h2>
          <p style={{ color: 'var(--muted)', fontSize: 14, lineHeight: 1.6, maxWidth: 420, margin: '0 auto 24px' }}>
            In production, this page fetches the note from <strong>DynamoDB</strong> via API Gateway → Lambda and renders the full output.
          </p>
          <Link to="/upload" style={{ textDecoration: 'none' }}>
            <button style={{
              background: 'linear-gradient(135deg, var(--amber), #d4912a)',
              color: '#0d0f14', border: 'none', borderRadius: 10,
              padding: '10px 24px', fontSize: 13, fontWeight: 700,
              cursor: 'pointer', fontFamily: '"DM Sans", sans-serif',
            }}>
              Generate New Note
            </button>
          </Link>
        </div>
      </motion.div>
    </div>
  )
}
