import { Routes, Route } from 'react-router-dom'
import { NotesProvider } from '@/context/NotesContext'
import Layout from '@/components/Layout'
import HomePage from '@/pages/HomePage'
import NotesPage from '@/pages/NotesPage'
import NoteDetailPage from '@/pages/NoteDetailPage'
import UploadPage from '@/pages/UploadPage'

export default function App() {
  return (
    <NotesProvider>
      <Layout>
        <Routes>
          <Route path="/"          element={<HomePage />} />
          <Route path="/upload"    element={<UploadPage />} />
          <Route path="/notes"     element={<NotesPage />} />
          <Route path="/notes/:id" element={<NoteDetailPage />} />
        </Routes>
      </Layout>
    </NotesProvider>
  )
}
