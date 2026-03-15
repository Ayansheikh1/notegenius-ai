import type { Note, OutputMode } from '@/types'

const KEY = 'notegenius_notes'

export function getSavedNotes(): Note[] {
  try {
    return JSON.parse(localStorage.getItem(KEY) || '[]')
  } catch {
    return []
  }
}

export function saveNote(
  title: string,
  mode: OutputMode,
  content: unknown,
  sourceLabel = 'Pasted text'
): Note {
  const note: Note = {
    id: `local-${Date.now()}`,
    title,
    source: 'text',
    sourceLabel,
    mode,
    content: content as Note['content'],
    createdAt: new Date().toISOString(),
    tags: [mode],
  }
  const existing = getSavedNotes()
  localStorage.setItem(KEY, JSON.stringify([note, ...existing]))
  return note
}

export function deleteNoteLocal(id: string): void {
  const updated = getSavedNotes().filter((n) => n.id !== id)
  localStorage.setItem(KEY, JSON.stringify(updated))
}
