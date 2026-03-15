import type { OutputMode } from '@/types'

const MODES: { id:OutputMode; emoji:string; name:string; desc:string; color:string }[] = [
  { id:'summary',    emoji:'📝', name:'Summary',    desc:'Overview, themes & takeaway',      color:'var(--amber)' },
  { id:'keypoints',  emoji:'🎯', name:'Key Points', desc:'7 actionable insights',            color:'var(--teal)' },
  { id:'flashcards', emoji:'🃏', name:'Flashcards', desc:'Flippable Q&A study cards',        color:'var(--purple)' },
  { id:'quiz',       emoji:'🧠', name:'Quiz',       desc:'MCQ test with scoring',            color:'var(--rose)' },
]

export default function ModeSelector({ value, onChange }: { value:OutputMode; onChange:(m:OutputMode)=>void }) {
  return (
    <div>
      <div style={{ fontSize:10, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.1em', color:'var(--muted)', marginBottom:10 }}>
        Output Format
      </div>
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8 }}>
        {MODES.map(m => {
          const active = value===m.id
          return (
            <button key={m.id} onClick={() => onChange(m.id)} style={{
              display:'flex', alignItems:'flex-start', gap:10,
              padding:'12px 13px', borderRadius:11, cursor:'pointer',
              border:`1px solid ${active ? m.color+'60' : 'var(--border)'}`,
              background: active ? `${m.color}0f` : 'transparent',
              textAlign:'left', transition:'all 0.2s',
              fontFamily:'"Syne",sans-serif',
              boxShadow: active ? `0 0 0 1px ${m.color}30` : 'none',
            }}>
              <span style={{ fontSize:18, marginTop:1, flexShrink:0 }}>{m.emoji}</span>
              <div>
                <div style={{ fontSize:12, fontWeight:700, color: active ? m.color : '#e2ddd4' }}>{m.name}</div>
                <div style={{ fontSize:10, color:'var(--muted-l)', marginTop:2, lineHeight:1.4 }}>{m.desc}</div>
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}
