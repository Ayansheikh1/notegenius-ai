import { useState, useCallback } from 'react'
import toast from 'react-hot-toast'

// ─────────────────────────────────────────────────────────────────────────────
// useFileUpload — fully client-side, no AWS needed for local dev
//
// TXT / MD  → read directly in browser (instant)
// PDF       → extract text using PDF.js (loaded from CDN, no install needed)
//
// In production: swap the PDF path to use AWS S3 + Textract instead
// ─────────────────────────────────────────────────────────────────────────────

interface UseFileUploadReturn {
  extractedText: string
  fileName: string
  isUploading: boolean
  uploadProgress: number
  error: string | null
  handleFile: (file: File) => Promise<string>
  reset: () => void
}

const MAX_SIZE_MB = 10

// Load PDF.js from CDN (only once)
let pdfJsPromise: Promise<typeof import('pdfjs-dist')> | null = null

async function loadPdfJs() {
  if (pdfJsPromise) return pdfJsPromise
  pdfJsPromise = new Promise(async (resolve, reject) => {
    try {
      // Dynamically inject PDF.js script from CDN
      if (!(window as any).pdfjsLib) {
        await new Promise<void>((res, rej) => {
          const script = document.createElement('script')
          script.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.0.379/pdf.min.mjs'
          script.type = 'module'
          script.onload = () => res()
          script.onerror = () => rej(new Error('Failed to load PDF.js'))
          document.head.appendChild(script)
        })
      }
      resolve((window as any).pdfjsLib)
    } catch (e) {
      reject(e)
    }
  })
  return pdfJsPromise
}

async function extractTextFromPdf(file: File, onProgress: (p: number) => void): Promise<string> {
  onProgress(20)

  const arrayBuffer = await file.arrayBuffer()
  onProgress(35)

  // Use PDF.js via CDN
  const pdfjsLib = await new Promise<any>((resolve, reject) => {
    // Try loading pdfjs via script tag
    if ((window as any).pdfjsLib) {
      resolve((window as any).pdfjsLib)
      return
    }
    const script = document.createElement('script')
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js'
    script.onload = () => {
      const lib = (window as any).pdfjsLib
      if (lib) {
        lib.GlobalWorkerOptions.workerSrc =
          'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js'
        resolve(lib)
      } else {
        reject(new Error('PDF.js failed to initialize'))
      }
    }
    script.onerror = () => reject(new Error('Failed to load PDF.js from CDN'))
    document.head.appendChild(script)
  })

  onProgress(50)

  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise
  onProgress(65)

  const totalPages = pdf.numPages
  const textParts: string[] = []

  for (let i = 1; i <= totalPages; i++) {
    const page = await pdf.getPage(i)
    const content = await page.getTextContent()
    const pageText = content.items
      .map((item: any) => item.str)
      .join(' ')
    textParts.push(pageText)
    onProgress(65 + Math.round((i / totalPages) * 30))
  }

  return textParts.join('\n\n').replace(/\s+/g, ' ').trim()
}

export function useFileUpload(): UseFileUploadReturn {
  const [extractedText, setExtractedText] = useState('')
  const [fileName, setFileName]           = useState('')
  const [isUploading, setIsUploading]     = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [error, setError]                 = useState<string | null>(null)

  const handleFile = useCallback(async (file: File): Promise<string> => {
    setError(null)

    // Validate size
    if (file.size > MAX_SIZE_MB * 1024 * 1024) {
      const msg = `File too large. Max ${MAX_SIZE_MB}MB.`
      setError(msg); toast.error(msg); return ''
    }

    // Check accepted types
    const isPdf = file.type === 'application/pdf' || file.name.endsWith('.pdf')
    const isText = file.type === 'text/plain' || file.name.endsWith('.txt')
    const isMd   = file.name.endsWith('.md')

    if (!isPdf && !isText && !isMd) {
      const msg = 'Unsupported file. Please upload PDF, TXT, or MD.'
      setError(msg); toast.error(msg); return ''
    }

    setIsUploading(true)
    setFileName(file.name)
    setUploadProgress(10)

    const toastId = toast.loading(`Reading ${file.name}…`)

    try {
      let text = ''

      if (isText || isMd) {
        // ── Plain text — read directly ───────────────────────────────────
        text = await file.text()
        setUploadProgress(100)
        toast.success(`Loaded ${file.name} ✓`, { id: toastId })

      } else if (isPdf) {
        // ── PDF — extract via PDF.js in browser ──────────────────────────
        toast.loading('Extracting PDF text…', { id: toastId })

        text = await extractTextFromPdf(file, (p) => setUploadProgress(p))

        if (!text || text.length < 20) {
          throw new Error('Could not extract text from this PDF. Try copying the text manually and using "Paste Text" instead.')
        }

        setUploadProgress(100)
        toast.success(`PDF extracted — ${text.split(' ').length.toLocaleString()} words ✓`, { id: toastId })
      }

      setExtractedText(text)
      return text

    } catch (e) {
      const msg = e instanceof Error ? e.message : 'File reading failed'
      setError(msg)
      toast.error(msg, { id: toastId })
      return ''
    } finally {
      setIsUploading(false)
    }
  }, [])

  const reset = useCallback(() => {
    setExtractedText(''); setFileName('')
    setIsUploading(false); setUploadProgress(0); setError(null)
  }, [])

  return { extractedText, fileName, isUploading, uploadProgress, error, handleFile, reset }
}
