import { useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { motion, AnimatePresence } from 'framer-motion'

interface Props {
  onFile: (file: File) => void
  fileName: string
  isUploading: boolean
  uploadProgress: number
}

export default function DropZone({ onFile, fileName, isUploading, uploadProgress }: Props) {
  const onDrop = useCallback((accepted: File[]) => {
    if (accepted[0]) onFile(accepted[0])
  }, [onFile])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf':  ['.pdf'],
      'text/plain':       ['.txt'],
      'text/markdown':    ['.md'],
    },
    maxFiles: 1,
    maxSize: 10 * 1024 * 1024,
  })

  const statusLabel = () => {
    if (isUploading) {
      if (uploadProgress < 40) return 'Reading file…'
      if (uploadProgress < 65) return 'Extracting PDF text…'
      return 'Almost done…'
    }
    return null
  }

  return (
    <div>
      {/* Drop zone */}
      <div
        {...getRootProps()}
        style={{
          border: `2px dashed ${isDragActive ? 'var(--amber)' : 'var(--border-l)'}`,
          borderRadius: 14, padding: '36px 20px', textAlign: 'center', cursor: 'pointer',
          background: isDragActive ? 'rgba(240,165,0,0.04)' : 'var(--ink-3)',
          transition: 'all 0.25s',
        }}
      >
        <input {...getInputProps()} />

        <div style={{ fontSize: 36, marginBottom: 10 }}>
          {isUploading ? '⏳' : isDragActive ? '📂' : '📎'}
        </div>
        <div style={{ fontSize: 13, fontWeight: 600, color: '#e2ddd4', marginBottom: 5, fontFamily: '"Syne",sans-serif' }}>
          {isDragActive ? 'Drop it here!' : 'Drag & drop your file'}
        </div>
        <div style={{ fontSize: 11, color: 'var(--muted-l)' }}>
          PDF, TXT, MD · max 10 MB
        </div>
        <div style={{ fontSize: 10, color: 'var(--muted)', marginTop: 6 }}>
          or click to browse
        </div>

        {/* Success state */}
        <AnimatePresence>
          {fileName && !isUploading && (
            <motion.div
              initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              style={{
                marginTop: 12, fontSize: 12, color: 'var(--teal)', fontWeight: 600,
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
              }}
            >
              ✅ {fileName}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Progress bar */}
      <AnimatePresence>
        {isUploading && (
          <motion.div
            initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            style={{ marginTop: 12 }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
              <span style={{ fontSize: 11, color: 'var(--muted-l)' }}>{statusLabel()}</span>
              <span style={{ fontSize: 11, color: 'var(--amber)', fontFamily: '"DM Mono",monospace' }}>
                {uploadProgress}%
              </span>
            </div>
            <div style={{ background: 'var(--ink-3)', borderRadius: 4, height: 4, overflow: 'hidden' }}>
              <motion.div
                animate={{ width: `${uploadProgress}%` }}
                style={{
                  height: '100%',
                  background: 'linear-gradient(90deg, var(--amber), var(--teal))',
                  borderRadius: 4,
                }}
                transition={{ duration: 0.3 }}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Info note */}
      <div style={{ marginTop: 10, fontSize: 10, color: 'var(--muted)', lineHeight: 1.6 }}>
        💡 <strong>PDF text is extracted in your browser</strong> — no upload needed.
        In production, files go to <strong>AWS S3</strong> + <strong>Textract</strong> for OCR.
      </div>
    </div>
  )
}
