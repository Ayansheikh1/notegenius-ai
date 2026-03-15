import { useState } from 'react'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'
import ModeSelector  from '@/components/ModeSelector'
import DropZone      from '@/components/DropZone'
import OutputPanel   from '@/components/OutputPanel'
import { useGenerate }    from '@/hooks/useGenerate'
import { useFileUpload }  from '@/hooks/useFileUpload'
import { saveNote }       from '@/utils/storage'
import type { OutputMode, InputTab } from '@/types'

const TABS: { id: InputTab; label: string; emoji: string }[] = [
  { id:'text',  label:'Paste Text',  emoji:'📄' },
  { id:'pdf',   label:'Upload File', emoji:'📎' },
  { id:'topic', label:'Enter Topic', emoji:'🔗' },
]

const MODECOLORS: Record<OutputMode, string> = {
  summary:'var(--amber)', keypoints:'var(--teal)', flashcards:'var(--purple)', quiz:'var(--rose)',
}

export default function UploadPage() {
  const [activeTab, setActiveTab] = useState<InputTab>('text')
  const [mode, setMode]           = useState<OutputMode>('summary')
  const [textInput, setTextInput] = useState('')
  const [topic, setTopic]         = useState('')
  const [saved, setSaved]         = useState(false)

  const { result, isLoading, error, generate } = useGenerate()
  const { extractedText, fileName, isUploading, uploadProgress, handleFile } = useFileUpload()

  const getContent = () => {
    if (activeTab==='text')  return textInput
    if (activeTab==='pdf')   return extractedText
    if (activeTab==='topic') return `Generate comprehensive educational content about: "${topic}". Cover key concepts, history, important facts, examples and practical applications in detail.`
    return ''
  }

  const getSourceLabel = () => {
    if (activeTab==='pdf')   return fileName || 'Uploaded file'
    if (activeTab==='topic') return topic || 'Topic'
    return 'Pasted text'
  }

  const handleGenerate = async () => {
    const content = getContent()
    if (!content.trim()) { toast.error(activeTab==='pdf' ? 'Please upload a file first.' : 'Please enter some content.'); return }
    setSaved(false)
    await generate(content, mode)
  }

  const handleSave = () => {
    if (!result) return
    const content = getContent()
    const title = activeTab==='topic' ? topic : content.slice(0,55).trim() + '…'
    saveNote(title, mode, result, getSourceLabel())
    setSaved(true)
    toast.success('Note saved to My Notes! 💾')
  }

  const modeLabel = { summary:'Summary', keypoints:'Key Points', flashcards:'Flashcards', quiz:'Quiz' }[mode]
  const modeColor = MODECOLORS[mode]

  const panel = (children: React.ReactNode, header: React.ReactNode) => (
    <div style={{ background:'var(--ink-2)', border:'1px solid var(--border)', borderRadius:20, overflow:'hidden', height:'100%' }}>
      <div style={{ padding:'18px 22px', borderBottom:'1px solid var(--border)' }}>{header}</div>
      <div style={{ padding:24 }}>{children}</div>
    </div>
  )

  const panelTitle = (emoji: string, title: string, sub: string) => (
    <div style={{ display:'flex', alignItems:'center', gap:10 }}>
      <div style={{ width:32, height:32, borderRadius:8, background:'rgba(240,165,0,0.12)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:15 }}>{emoji}</div>
      <div>
        <div style={{ fontFamily:'"Syne",sans-serif', fontSize:14, fontWeight:700 }}>{title}</div>
        <div style={{ fontSize:11, color:'var(--muted-l)', marginTop:1 }}>{sub}</div>
      </div>
    </div>
  )

  return (
    <div style={{ padding:'40px 48px 80px', maxWidth:1240, margin:'0 auto' }}>

      {/* Header */}
      <motion.div initial={{opacity:0,y:12}} animate={{opacity:1,y:0}} style={{ marginBottom:28 }}>
        <div style={{ display:'flex', alignItems:'center', gap:14, marginBottom:6 }}>
          <h1 style={{ fontFamily:'"Syne",sans-serif', fontSize:30, fontWeight:800, letterSpacing:'-0.02em' }}>
            Generate Smart Notes
          </h1>
          {/* Groq live badge */}
          <div style={{
            display:'flex', alignItems:'center', gap:7,
            background:'rgba(245,80,54,0.08)', border:'1px solid rgba(245,80,54,0.22)',
            borderRadius:20, padding:'4px 12px',
          }}>
            <div style={{ width:6, height:6, borderRadius:'50%', background:'var(--groq)', boxShadow:'0 0 6px var(--groq)' }} className="groq-pulse"/>
            <span style={{ fontSize:10, fontWeight:700, color:'var(--groq-l)', letterSpacing:'0.06em', textTransform:'uppercase' }}>
              Groq · LLaMA 3.3 70B
            </span>
          </div>
        </div>
        <p style={{ fontSize:13, color:'var(--muted-l)' }}>
          Paste content, upload a file, or enter a topic — then choose your study format.
        </p>
      </motion.div>

      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:24 }}>

        {/* ── LEFT: Input ── */}
        <motion.div initial={{opacity:0,x:-16}} animate={{opacity:1,x:0}} transition={{delay:0.08}}>
          {panel(
            <>
              {/* Input Tabs */}
              <div style={{ display:'flex', gap:3, background:'var(--ink-3)', borderRadius:10, padding:3, marginBottom:18 }}>
                {TABS.map(t => (
                  <button key={t.id} onClick={() => setActiveTab(t.id)} style={{
                    flex:1, padding:'8px 8px', borderRadius:8, border:'none', cursor:'pointer',
                    background: activeTab===t.id ? 'var(--ink-2)' : 'transparent',
                    color: activeTab===t.id ? '#e2ddd4' : 'var(--muted-l)',
                    fontSize:12, fontWeight:600, fontFamily:'"Syne",sans-serif',
                    transition:'all 0.2s',
                    boxShadow: activeTab===t.id ? '0 2px 10px rgba(0,0,0,0.35)' : 'none',
                  }}>
                    {t.emoji} {t.label}
                  </button>
                ))}
              </div>

              {activeTab==='text' && (
                <div>
                  <textarea value={textInput} onChange={e=>setTextInput(e.target.value)}
                    placeholder="Paste your lecture notes, article, research paper, or any long-form content here…&#10;&#10;Tip: Longer content = better notes. Try pasting a full Wikipedia article!"
                    style={{
                      width:'100%', minHeight:220, resize:'vertical',
                      background:'var(--ink-3)', border:'1px solid var(--border)',
                      borderRadius:12, padding:'14px 16px', color:'#e2ddd4',
                      fontFamily:'"DM Sans",sans-serif', fontSize:13, lineHeight:1.65, outline:'none',
                      transition:'border-color 0.2s',
                    }}
                    onFocus={e => e.target.style.borderColor='rgba(240,165,0,0.35)'}
                    onBlur={e => e.target.style.borderColor='var(--border)'}
                  />
                  <div style={{ fontSize:10, color:'var(--muted)', textAlign:'right', marginTop:5 }}>
                    {textInput.length.toLocaleString()} chars
                  </div>
                </div>
              )}

              {activeTab==='pdf' && (
                <DropZone onFile={handleFile} fileName={fileName} isUploading={isUploading} uploadProgress={uploadProgress} />
              )}

              {activeTab==='topic' && (
                <div>
                  <input type="text" value={topic} onChange={e=>setTopic(e.target.value)}
                    placeholder="e.g. 'Photosynthesis', 'French Revolution', 'Blockchain Technology'"
                    style={{
                      width:'100%', background:'var(--ink-3)', border:'1px solid var(--border)',
                      borderRadius:12, padding:'14px 16px', color:'#e2ddd4',
                      fontFamily:'"DM Sans",sans-serif', fontSize:13, outline:'none',
                      transition:'border-color 0.2s',
                    }}
                    onFocus={e => e.target.style.borderColor='rgba(240,165,0,0.35)'}
                    onBlur={e => e.target.style.borderColor='var(--border)'}
                    onKeyDown={e => e.key==='Enter' && handleGenerate()}
                  />
                  <div style={{ marginTop:10, fontSize:11, color:'var(--muted)', lineHeight:1.5 }}>
                    💡 Claude generates comprehensive content on any topic you enter
                  </div>
                </div>
              )}

              {/* Mode Selector */}
              <div style={{ marginTop:22, marginBottom:20 }}>
                <ModeSelector value={mode} onChange={m => { setMode(m); setSaved(false) }} />
              </div>

              {/* Generate Button */}
              <motion.button whileHover={{scale:1.02,y:-1}} whileTap={{scale:0.98}}
                onClick={handleGenerate} disabled={isLoading}
                style={{
                  width:'100%', padding:'15px', borderRadius:12, border:'none',
                  background: isLoading ? 'rgba(240,165,0,0.3)' : `linear-gradient(135deg,var(--amber),var(--amber-d))`,
                  color:'#0a0d14', fontFamily:'"Syne",sans-serif',
                  fontSize:14, fontWeight:800, cursor: isLoading ? 'not-allowed' : 'pointer',
                  display:'flex', alignItems:'center', justifyContent:'center', gap:8,
                  boxShadow: isLoading ? 'none' : '0 6px 24px rgba(240,165,0,0.35)',
                  transition:'all 0.2s', letterSpacing:'-0.01em',
                }}>
                {isLoading
                  ? <><span style={{ display:'inline-block', animation:'spin 0.8s linear infinite' }}>⟳</span> Generating with Groq…</>
                  : <><span>✨</span> Generate {modeLabel}</>
                }
              </motion.button>

              {/* Groq note below button */}
              <div style={{ marginTop:10, textAlign:'center', fontSize:10, color:'var(--muted)' }}>
                ⚡ Inference by <span style={{ color:'var(--groq-l)', fontWeight:700 }}>Groq</span> · Model: <span style={{ fontFamily:'"DM Mono",monospace', color:'var(--muted-l)' }}>llama-3.3-70b-versatile</span>
              </div>
            </>,
            panelTitle('✍️','Input Content','Text, PDF, or topic')
          )}
        </motion.div>

        {/* ── RIGHT: Output ── */}
        <motion.div initial={{opacity:0,x:16}} animate={{opacity:1,x:0}} transition={{delay:0.12}}>
          {panel(
            <OutputPanel mode={mode} result={result} isLoading={isLoading} error={error} />,
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
              <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                <div style={{ width:32, height:32, borderRadius:8, background:`${modeColor}18`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:15,
                  border:`1px solid ${modeColor}30`,
                }}>
                  {{ summary:'📝', keypoints:'🎯', flashcards:'🃏', quiz:'🧠' }[mode]}
                </div>
                <div>
                  <div style={{ fontFamily:'"Syne",sans-serif', fontSize:14, fontWeight:700 }}>AI Output</div>
                  <div style={{ fontSize:11, color: result ? modeColor : 'var(--muted-l)', marginTop:1 }}>
                    {result ? `${modeLabel} ready ✓` : 'Waiting for input…'}
                  </div>
                </div>
              </div>

              {/* Save button */}
              {result && (
                <motion.button initial={{opacity:0,scale:0.85}} animate={{opacity:1,scale:1}}
                  whileHover={{scale:1.05}} whileTap={{scale:0.95}}
                  onClick={handleSave} disabled={saved}
                  style={{
                    padding:'8px 16px', borderRadius:9, border:'none', cursor: saved ? 'default' : 'pointer',
                    background: saved ? 'rgba(0,212,170,0.12)' : 'rgba(240,165,0,0.12)',
                    color: saved ? 'var(--teal)' : 'var(--amber)',
                    fontSize:12, fontWeight:700, fontFamily:'"Syne",sans-serif',
                    outline: `1px solid ${saved ? 'rgba(0,212,170,0.25)' : 'rgba(240,165,0,0.25)'}`,
                    transition:'all 0.2s',
                  } as React.CSSProperties}>
                  {saved ? '✅ Saved!' : '💾 Save Note'}
                </motion.button>
              )}
            </div>
          )}
        </motion.div>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}
