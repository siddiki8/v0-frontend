import chatAPI from '@/lib/api-client'
import { DocumentId } from '@/types/api'

export async function downloadDocument(documentId: DocumentId) {
  try {
    const doc = await chatAPI.getDocument(documentId)
    
    // Use anchor tag to open in new tab
    const link = document.createElement('a')
    link.href = doc.download_url
    link.target = '_blank'
    link.rel = 'noopener noreferrer'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    
    return true
  } catch (error) {
    console.error('Error downloading document:', error)
    throw error
  }
} 