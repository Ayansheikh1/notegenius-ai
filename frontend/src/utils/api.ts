import axios from 'axios'
import type { GenerateRequest, GenerateResponse, UploadResponse, Note } from '@/types'

const BASE = import.meta.env.VITE_API_URL || '/api'

const client = axios.create({
  baseURL: BASE,
  headers: { 'Content-Type': 'application/json' },
  timeout: 60_000,
})

// ── Add auth token from localStorage if present ──────────────────────────────
client.interceptors.request.use((config) => {
  const token = localStorage.getItem('ng_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// ── Response error normalization ─────────────────────────────────────────────
client.interceptors.response.use(
  (res) => res,
  (err) => {
    const msg = err.response?.data?.message || err.message || 'Unknown error'
    return Promise.reject(new Error(msg))
  },
)

// ── API Methods ───────────────────────────────────────────────────────────────

/** Generate notes from text content */
export async function generateNotes(payload: GenerateRequest): Promise<GenerateResponse> {
  const { data } = await client.post<GenerateResponse>('/generate', payload)
  return data
}

/** Get a presigned S3 upload URL + trigger Textract extraction */
export async function uploadFile(file: File): Promise<UploadResponse> {
  const { data } = await client.post<UploadResponse>('/upload', {
    fileName: file.name,
    contentType: file.type,
    fileSize: file.size,
  })

  // Upload directly to S3 using presigned URL
  await axios.put(data.uploadUrl, file, {
    headers: { 'Content-Type': file.type },
  })

  return data
}

/** Poll for Textract job completion */
export async function pollExtraction(fileKey: string): Promise<{ text: string }> {
  for (let i = 0; i < 20; i++) {
    const { data } = await client.get<{ status: string; text?: string }>(
      `/extract-status?key=${fileKey}`
    )
    if (data.status === 'SUCCEEDED' && data.text) return { text: data.text }
    if (data.status === 'FAILED') throw new Error('Text extraction failed')
    await new Promise((r) => setTimeout(r, 2000))
  }
  throw new Error('Extraction timed out')
}

/** Fetch all saved notes for current user */
export async function fetchNotes(): Promise<Note[]> {
  const { data } = await client.get<{ notes: Note[] }>('/notes')
  return data.notes
}

/** Fetch single note by ID */
export async function fetchNote(id: string): Promise<Note> {
  const { data } = await client.get<Note>(`/notes/${id}`)
  return data
}

/** Delete a note */
export async function deleteNote(id: string): Promise<void> {
  await client.delete(`/notes/${id}`)
}

/** Search notes via Kendra */
export async function searchNotes(query: string): Promise<Note[]> {
  const { data } = await client.get<{ results: Note[] }>(`/search?q=${encodeURIComponent(query)}`)
  return data.results
}
