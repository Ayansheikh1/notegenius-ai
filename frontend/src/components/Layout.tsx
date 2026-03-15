import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'

const NAV = [
  { path: '/',       label: 'Home',      emoji: '🏠' },
  { path: '/upload', label: 'Generate',  emoji: '✨' },
  { path: '/notes',  label: 'My Notes',  emoji: '📚' },
]

const AWS_SERVICES = [
  { emoji: '🪣', name: 'S3',          role: 'File Storage' },
  { emoji: '📝', name: 'Textract',    role: 'PDF OCR' },
  { emoji: '🎙️', name: 'Transcribe',  role: 'Audio→Text' },
  { emoji: '🤖', name: 'Bedrock',     role: 'Prod AI' },
  { emoji: '⚡', name: 'Lambda',      role: 'Serverless' },
  { emoji: '🌐', name: 'API Gateway', role: 'REST API' },
  { emoji: '💾', name: 'DynamoDB',    role: 'Database' },
  { emoji: '☁️', name: 'CDK',         role: 'Infra as Code' },
]

export default function Layout({ children }: { children: React.ReactNode }) {
  const { pathname } = useLocation()
  const [collapsed, setCollapsed] = useState(false)

  return (
    <div style={{ display:'flex', minHeight:'100vh' }}>

      {/* ── Sidebar ── */}
      <motion.aside
        animate={{ width: collapsed ? 64 : 248 }}
        transition={{ type:'spring', stiffness:320, damping:32 }}
        style={{
          background:'var(--ink-2)',
          borderRight:'1px solid var(--border)',
          display:'flex', flexDirection:'column',
          position:'fixed', top:0, left:0, bottom:0, zIndex:100,
          overflow:'hidden',
        }}
      >
        {/* Logo */}
        <div style={{ padding:'22px 16px 18px', borderBottom:'1px solid var(--border)', flexShrink:0 }}>
          <div style={{ display:'flex', alignItems:'center', gap:12 }}>
            <div style={{
              width:36, height:36, borderRadius:10, flexShrink:0,
              background:'linear-gradient(135deg,var(--amber),var(--amber-l))',
              display:'flex', alignItems:'center', justifyContent:'center',
              fontSize:17, boxShadow:'0 4px 18px rgba(240,165,0,0.4)',
            }}>📚</div>
            <AnimatePresence>
              {!collapsed && (
                <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}>
                  <div style={{
                    fontFamily:'"Syne",sans-serif', fontSize:17, fontWeight:800,
                    background:'linear-gradient(135deg,#e8e4d8,var(--amber))',
                    WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent',
                    whiteSpace:'nowrap', letterSpacing:'-0.02em',
                  }}>NoteGenius AI</div>
                  <div style={{ fontSize:9, color:'var(--muted-l)', fontWeight:500, marginTop:1, letterSpacing:'0.08em', textTransform:'uppercase' }}>
                    Smart Lecture Summarizer
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        

        {/* Nav */}
        <nav style={{ padding:'14px 10px', flex:1 }}>
          <AnimatePresence>
            {!collapsed && (
              <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}
                style={{ fontSize:9, color:'var(--muted)', fontWeight:700, letterSpacing:'0.12em',
                  textTransform:'uppercase', padding:'0 8px', marginBottom:8 }}>
                Navigation
              </motion.div>
            )}
          </AnimatePresence>
          {NAV.map(item => {
            const active = pathname === item.path
            return (
              <Link key={item.path} to={item.path} style={{ textDecoration:'none' }}>
                <div style={{
                  display:'flex', alignItems:'center', gap:12,
                  padding: collapsed ? '11px' : '10px 12px',
                  borderRadius:10, marginBottom:3, justifyContent: collapsed ? 'center' : 'flex-start',
                  background: active ? 'rgba(240,165,0,0.1)' : 'transparent',
                  border:`1px solid ${active ? 'rgba(240,165,0,0.25)' : 'transparent'}`,
                  color: active ? 'var(--amber)' : 'var(--muted-l)',
                  transition:'all 0.2s', cursor:'pointer',
                }}>
                  <span style={{ fontSize:17, flexShrink:0 }}>{item.emoji}</span>
                  <AnimatePresence>
                    {!collapsed && (
                      <motion.span initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}
                        style={{ fontSize:13, fontWeight:600, whiteSpace:'nowrap', fontFamily:'"Syne",sans-serif' }}>
                        {item.label}
                      </motion.span>
                    )}
                  </AnimatePresence>
                </div>
              </Link>
            )
          })}
        </nav>

        {/* AWS Stack */}
        <AnimatePresence>
          {!collapsed && (
            <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}
              style={{ padding:'14px', borderTop:'1px solid var(--border)', flexShrink:0 }}>
              <div style={{
                fontSize:9, textTransform:'uppercase', letterSpacing:'0.12em',
                color:'var(--muted)', marginBottom:10, fontWeight:700,
              }}>☁️ AWS Production Stack</div>
              <div style={{ display:'flex', flexDirection:'column', gap:5 }}>
                {AWS_SERVICES.map(s => (
                  <div key={s.name} style={{ display:'flex', alignItems:'center', gap:7 }}>
                    <span style={{ fontSize:11 }}>{s.emoji}</span>
                    <span style={{ fontSize:10, color:'#b8b4aa', whiteSpace:'nowrap' }}>
                      <strong style={{ color:'#d4d0c8' }}>{s.name}</strong>
                      <span style={{ color:'var(--muted)', marginLeft:4 }}>· {s.role}</span>
                    </span>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Collapse */}
        <button onClick={() => setCollapsed(c=>!c)} style={{
          margin:'10px', padding:'9px', borderRadius:8,
          background:'var(--ink-3)', border:'1px solid var(--border)',
          color:'var(--muted-l)', cursor:'pointer', fontSize:13,
          transition:'all 0.2s', flexShrink:0,
        }}>
          {collapsed ? '→' : '←'}
        </button>
      </motion.aside>

      {/* ── Main ── */}
      <motion.main
        animate={{ marginLeft: collapsed ? 64 : 248 }}
        transition={{ type:'spring', stiffness:320, damping:32 }}
        style={{ flex:1, minHeight:'100vh', position:'relative' }}
      >
        {/* BG orbs */}
        <div style={{ position:'fixed', inset:0, pointerEvents:'none', zIndex:0 }}>
          <div style={{ position:'absolute', width:600, height:600, borderRadius:'50%', background:'rgba(240,165,0,0.04)', filter:'blur(100px)', top:-150, right:-100 }} />
          <div style={{ position:'absolute', width:400, height:400, borderRadius:'50%', background:'rgba(245,80,54,0.03)', filter:'blur(80px)', bottom:-100, left:'20%' }} />
          <div style={{ position:'absolute', width:300, height:300, borderRadius:'50%', background:'rgba(0,212,170,0.03)', filter:'blur(80px)', top:'40%', left:'50%' }} />
        </div>
        <div style={{ position:'relative', zIndex:1 }}>{children}</div>
      </motion.main>
    </div>
  )
}
