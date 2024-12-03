import { Button } from '@/components/ui/button'
import { DocumentReference } from '@/types/api'
import { FileText, Download } from 'lucide-react'
import { downloadDocument } from '@/lib/document-utils'
import { useState } from 'react'
import { useToast } from '@/hooks/use-toast'

interface DocumentCardProps {
  document: DocumentReference
}

export function DocumentCard({ document }: DocumentCardProps) {
  const [isDownloading, setIsDownloading] = useState(false)
  const { toast } = useToast()

  const handleDownload = async (e: React.MouseEvent) => {
    e.preventDefault()
    if (isDownloading) return

    setIsDownloading(true)
    try {
      await downloadDocument(document.document_id)
      toast({
        title: "Success",
        description: `Downloaded ${document.filename}`,
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to download document",
        variant: "destructive",
      })
    } finally {
      setIsDownloading(false)
    }
  }

  return (
    <Button
      variant="ghost"
      className="w-full h-auto py-3 px-3 justify-start font-normal hover:bg-accent"
      onClick={handleDownload}
      disabled={isDownloading}
    >
      <div className="flex items-center gap-3 w-full">
        <FileText className="h-4 w-4 flex-shrink-0 text-muted-foreground" />
        <div className="flex flex-col items-start truncate flex-grow">
          <div className="truncate text-sm w-full text-left">
            {document.filename}
          </div>
          <div className="text-xs text-muted-foreground text-left">
            ID: {document.document_id.slice(0, 8)}...
          </div>
        </div>
        {isDownloading ? (
          <Download className="h-4 w-4 animate-pulse" />
        ) : (
          <Download className="h-4 w-4 opacity-0 group-hover:opacity-100" />
        )}
      </div>
    </Button>
  )
}

