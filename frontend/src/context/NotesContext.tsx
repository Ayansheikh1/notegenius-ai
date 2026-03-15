import { createContext, useContext, useReducer, useCallback, type ReactNode } from 'react'
import type { Note, OutputMode } from '@/types'

// ── State ────────────────────────────────────────────────────────────────────
interface NotesState {
  notes: Note[]
  loading: boolean
  error: string | null
  activeMode: OutputMode
}

const initialState: NotesState = {
  notes: [],
  loading: false,
  error: null,
  activeMode: 'summary',
}

// ── Actions ──────────────────────────────────────────────────────────────────
type Action =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_NOTES'; payload: Note[] }
  | { type: 'ADD_NOTE'; payload: Note }
  | { type: 'REMOVE_NOTE'; payload: string }
  | { type: 'SET_MODE'; payload: OutputMode }

function reducer(state: NotesState, action: Action): NotesState {
  switch (action.type) {
    case 'SET_LOADING': return { ...state, loading: action.payload }
    case 'SET_ERROR':   return { ...state, error: action.payload }
    case 'SET_NOTES':   return { ...state, notes: action.payload }
    case 'ADD_NOTE':    return { ...state, notes: [action.payload, ...state.notes] }
    case 'REMOVE_NOTE': return { ...state, notes: state.notes.filter(n => n.id !== action.payload) }
    case 'SET_MODE':    return { ...state, activeMode: action.payload }
    default:            return state
  }
}

// ── Context ──────────────────────────────────────────────────────────────────
interface NotesContextValue extends NotesState {
  setLoading: (v: boolean) => void
  setError: (v: string | null) => void
  setNotes: (v: Note[]) => void
  addNote: (note: Note) => void
  removeNote: (id: string) => void
  setActiveMode: (mode: OutputMode) => void
}

const NotesContext = createContext<NotesContextValue | null>(null)

export function NotesProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState)

  const setLoading     = useCallback((v: boolean)          => dispatch({ type: 'SET_LOADING', payload: v }), [])
  const setError       = useCallback((v: string | null)    => dispatch({ type: 'SET_ERROR',   payload: v }), [])
  const setNotes       = useCallback((v: Note[])           => dispatch({ type: 'SET_NOTES',   payload: v }), [])
  const addNote        = useCallback((note: Note)          => dispatch({ type: 'ADD_NOTE',    payload: note }), [])
  const removeNote     = useCallback((id: string)          => dispatch({ type: 'REMOVE_NOTE', payload: id }), [])
  const setActiveMode  = useCallback((mode: OutputMode)    => dispatch({ type: 'SET_MODE',    payload: mode }), [])

  return (
    <NotesContext.Provider value={{ ...state, setLoading, setError, setNotes, addNote, removeNote, setActiveMode }}>
      {children}
    </NotesContext.Provider>
  )
}

export function useNotes() {
  const ctx = useContext(NotesContext)
  if (!ctx) throw new Error('useNotes must be used inside <NotesProvider>')
  return ctx
}
