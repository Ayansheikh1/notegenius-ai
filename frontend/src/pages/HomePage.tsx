import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'

const FEATURES = [
  { emoji:'📝', title:'Smart Summary',       desc:'Structured overview with themes, critical details and a key takeaway.',     color:'var(--amber)' },
  { emoji:'🎯', title:'Key Points',           desc:'7 numbered, actionable insights extracted from any content.',               color:'var(--teal)' },
  { emoji:'🃏', title:'Flashcard Deck',       desc:'Flippable Q&A study cards — perfect for spaced repetition.',               color:'var(--purple)' },
  { emoji:'🧠', title:'Auto Quiz',            desc:'MCQ test generated from your content with instant scoring.',               color:'var(--rose)' },
  { emoji:'📎', title:'PDF Upload',           desc:'Drag & drop PDFs — text is extracted automatically via AWS Textract.',     color:'var(--amber)' },
  { emoji:'💾', title:'Save & Organize',      desc:'All notes saved locally, searchable and ready to revisit anytime.',       color:'var(--teal)' },
]

const STACK = [
  { label:'Groq API',         sub:'LLaMA 3.3 70B',      color:'var(--groq)',   dot:true },
  { label:'React 18',         sub:'TypeScript + Vite',  color:'#61DAFB' },
  { label:'Framer Motion',    sub:'Animations',          color:'#e8a838' },
  { label:'AWS S3',           sub:'File Storage',        color:'#FF9900' },
  { label:'AWS Textract',     sub:'PDF OCR',             color:'#FF9900' },
  { label:'AWS Bedrock',      sub:'Prod AI',             color:'#FF9900' },
  { label:'AWS Lambda',       sub:'Serverless',          color:'#FF9900' },
  { label:'AWS DynamoDB',     sub:'Database',            color:'#FF9900' },
  { label:'AWS CDK',          sub:'Infra as Code',       color:'#FF9900' },
]

const stagger = (i: number) => ({ initial:{opacity:0,y:18}, animate:{opacity:1,y:0}, transition:{delay:i*0.07} })

export default function HomePage() {
  return (
    <div style={{ padding:'56px 52px 100px', maxWidth:1040, margin:'0 auto' }}>

      {/* ── Hero ── */}
      <motion.div initial={{opacity:0,y:24}} animate={{opacity:1,y:0}} style={{ textAlign:'center', marginBottom:90 }}>

        

        <h1 style={{
          fontFamily:'"Syne",sans-serif', fontSize:'clamp(38px,5.5vw,68px)',
          fontWeight:800, lineHeight:1.08, marginBottom:26, letterSpacing:'-0.03em',
          background:'linear-gradient(135deg, #f0ece4 20%, var(--amber) 60%, var(--amber-l) 100%)',
          WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent',
        }}>
          Turn Any Lecture Into<br/>Instant Study Notes
        </h1>

        <p style={{ fontSize:17, color:'var(--muted-l)', lineHeight:1.75, maxWidth:540, margin:'0 auto 44px', fontWeight:400 }}>
          Paste a lecture, upload a PDF, or enter a topic — get back a summary, key points, flashcards, or a quiz in seconds.
        </p>

        <div style={{ display:'flex', gap:14, justifyContent:'center', flexWrap:'wrap' }}>
          <Link to="/upload" style={{ textDecoration:'none' }}>
            <motion.button whileHover={{scale:1.04,y:-2}} whileTap={{scale:0.97}}
              style={{
                padding:'14px 36px', borderRadius:12, border:'none', cursor:'pointer',
                background:'linear-gradient(135deg,var(--amber),var(--amber-d))',
                color:'#0a0d14', fontSize:15, fontWeight:700,
                fontFamily:'"Syne",sans-serif', letterSpacing:'-0.01em',
                boxShadow:'0 6px 28px rgba(240,165,0,0.4)',
              }}>
              ✨ Start Generating
            </motion.button>
          </Link>
          <Link to="/notes" style={{ textDecoration:'none' }}>
            <motion.button whileHover={{scale:1.04,y:-2}} whileTap={{scale:0.97}}
              style={{
                padding:'14px 36px', borderRadius:12, cursor:'pointer',
                background:'transparent', border:'1px solid var(--border-l)',
                color:'#e2ddd4', fontSize:15, fontWeight:500,
                fontFamily:'"Syne",sans-serif',
              }}>
              📚 My Notes
            </motion.button>
          </Link>
        </div>
      </motion.div>

      

      {/* ── Features ── */}
      <motion.div {...stagger(3)} style={{ marginBottom:72 }}>
        <div style={{ textAlign:'center', marginBottom:36 }}>
          <div style={{ fontFamily:'"Syne",sans-serif', fontSize:30, fontWeight:800, marginBottom:8, letterSpacing:'-0.02em' }}>
            Four Ways to Study Smarter
          </div>
          <div style={{ fontSize:14, color:'var(--muted-l)' }}>Choose any output format — all powered by the same AI pipeline</div>
        </div>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(290px,1fr))', gap:16 }}>
          {FEATURES.map((f,i) => (
            <motion.div key={i} {...stagger(3+i*0.5)}
              style={{
                background:'var(--ink-2)', border:'1px solid var(--border)',
                borderRadius:16, padding:'24px 22px',
                borderTop:`2px solid ${f.color}30`,
              }}>
              <div style={{ fontSize:28, marginBottom:12 }}>{f.emoji}</div>
              <div style={{ fontFamily:'"Syne",sans-serif', fontSize:15, fontWeight:700, marginBottom:7, color:'#e8e4da' }}>{f.title}</div>
              <div style={{ fontSize:13, color:'var(--muted-l)', lineHeight:1.65 }}>{f.desc}</div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* ── Tech Stack ── */}
      <motion.div {...stagger(6)}>
        <div style={{ textAlign:'center', marginBottom:24 }}>
          <div style={{ fontSize:10, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.14em', color:'var(--muted)', marginBottom:10 }}>
            Built With
          </div>
          <div style={{ fontFamily:'"Syne",sans-serif', fontSize:24, fontWeight:800, letterSpacing:'-0.02em' }}>
            Full-Stack Architecture
          </div>
        </div>
        <div style={{ display:'flex', flexWrap:'wrap', gap:9, justifyContent:'center' }}>
          {STACK.map((s,i) => (
            <motion.div key={i} whileHover={{y:-2}}
              style={{
                background:'var(--ink-2)', border:'1px solid var(--border)',
                borderRadius:22, padding:'6px 14px',
                display:'flex', alignItems:'center', gap:8,
              }}>
              <div style={{ width:6, height:6, borderRadius:'50%', background:s.color, flexShrink:0,
                boxShadow: s.dot ? `0 0 6px ${s.color}` : 'none',
              }} />
              <span style={{ fontSize:12, fontWeight:700, color:'#e2ddd4', fontFamily:'"Syne",sans-serif' }}>{s.label}</span>
              <span style={{ fontSize:10, color:'var(--muted-l)' }}>{s.sub}</span>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  )
}
