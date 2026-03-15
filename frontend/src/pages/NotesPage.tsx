import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import toast from 'react-hot-toast'
import { getSavedNotes, deleteNoteLocal } from '@/utils/storage'
import type { Note, OutputMode } from '@/types'

const MODE_CONFIG: Record<OutputMode,{emoji:string; color:string}> = {
  summary:    { emoji:'📝', color:'var(--amber)' },
  keypoints:  { emoji:'🎯', color:'var(--teal)' },
  flashcards: { emoji:'🃏', color:'var(--purple)' },
  quiz:       { emoji:'🧠', color:'var(--rose)' },
}

export default function NotesPage() {
  const [notes, setNotes]   = useState<Note[]>([])
  const [search, setSearch] = useState('')

  useEffect(() => { setNotes(getSavedNotes()) }, [])

  const handleDelete = (id:string) => {
    deleteNoteLocal(id); setNotes(getSavedNotes()); toast.success('Note deleted.')
  }

  const filtered = notes.filter(n =>
    n.title.toLowerCase().includes(search.toLowerCase()) ||
    n.tags?.some(t => t.toLowerCase().includes(search.toLowerCase()))
  )

  return (
    <div style={{ padding:'40px 48px 80px', maxWidth:1000, margin:'0 auto' }}>
      <motion.div initial={{opacity:0,y:12}} animate={{opacity:1,y:0}} style={{ marginBottom:30 }}>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:14, marginBottom:6 }}>
          <h1 style={{ fontFamily:'"Syne",sans-serif', fontSize:30, fontWeight:800, letterSpacing:'-0.02em' }}>My Notes</h1>
          <Link to="/upload" style={{ textDecoration:'none' }}>
            <motion.button whileHover={{scale:1.04}} whileTap={{scale:0.96}} style={{
              background:'linear-gradient(135deg,var(--amber),var(--amber-d))',
              color:'#0a0d14', border:'none', borderRadius:10,
              padding:'9px 20px', fontSize:12, fontWeight:800,
              cursor:'pointer', fontFamily:'"Syne",sans-serif', letterSpacing:'-0.01em',
            }}>
              + Generate New
            </motion.button>
          </Link>
        </div>
        <p style={{ fontSize:13, color:'var(--muted-l)', marginBottom:18 }}>
          {notes.length} saved {notes.length===1?'note':'notes'} · stored in browser localStorage
        </p>
        <input value={search} onChange={e=>setSearch(e.target.value)}
          placeholder="🔍 Search notes or tags…"
          style={{
            width:'100%', background:'var(--ink-2)', border:'1px solid var(--border)',
            borderRadius:12, padding:'11px 16px', color:'#e2ddd4',
            fontFamily:'"DM Sans",sans-serif', fontSize:13, outline:'none',
          }}
        />
      </motion.div>

      {filtered.length===0 && (
        <div style={{ textAlign:'center', padding:'80px 0', color:'var(--muted)' }}>
          <div style={{ fontSize:48, opacity:0.25, marginBottom:16 }}>📚</div>
          <div style={{ fontFamily:'"Syne",sans-serif', fontSize:15, fontWeight:700 }}>
            {search ? 'No notes matched.' : 'No notes yet.'}
          </div>
          <div style={{ fontSize:13, marginTop:8 }}>
            <Link to="/upload" style={{ color:'var(--amber)', textDecoration:'none', fontWeight:600 }}>
              Generate your first note →
            </Link>
          </div>
        </div>
      )}

      <AnimatePresence>
        <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
          {filtered.map((note,i) => {
            const mc = MODE_CONFIG[note.mode]
            return (
              <motion.div key={note.id}
                initial={{opacity:0,y:8}} animate={{opacity:1,y:0}} exit={{opacity:0,x:-20}}
                transition={{delay:i*0.04}}
                style={{
                  background:'var(--ink-2)', border:'1px solid var(--border)',
                  borderRadius:14, padding:'16px 18px',
                  display:'flex', alignItems:'center', gap:14,
                }}>
                <div style={{
                  width:42, height:42, borderRadius:11, flexShrink:0,
                  background:`${mc.color}12`, border:`1px solid ${mc.color}30`,
                  display:'flex', alignItems:'center', justifyContent:'center', fontSize:19,
                }}>{mc.emoji}</div>

                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{
                    fontFamily:'"Syne",sans-serif', fontSize:14, fontWeight:700,
                    color:'#e2ddd4', marginBottom:4,
                    whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis',
                  }}>{note.title}</div>
                  <div style={{ display:'flex', alignItems:'center', gap:10, flexWrap:'wrap' }}>
                    <span style={{ fontSize:10, color:mc.color, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.06em' }}>
                      {note.mode}
                    </span>
                    <span style={{ fontSize:10, color:'var(--muted-l)' }}>{note.sourceLabel}</span>
                    <span style={{ fontSize:10, color:'var(--muted)' }}>
                      {new Date(note.createdAt).toLocaleDateString()}
                    </span>
                    {note.tags?.map(tag=>(
                      <span key={tag} style={{
                        fontSize:9, background:'var(--ink-3)', border:'1px solid var(--border)',
                        borderRadius:10, padding:'2px 7px', color:'var(--muted-l)',
                      }}>{tag}</span>
                    ))}
                  </div>
                </div>

                <button onClick={()=>handleDelete(note.id)} style={{
                  background:'transparent', border:'1px solid var(--border)',
                  borderRadius:8, padding:'7px 10px', color:'var(--muted)',
                  fontSize:13, cursor:'pointer', flexShrink:0, transition:'all 0.2s',
                }}>🗑</button>
              </motion.div>
            )
          })}
        </div>
      </AnimatePresence>
    </div>
  )
}
