import { Button } from '@/components/ui/button'
import { DocumentReference } from '@/types/api'
import { FileText } from 'lucide-react'

interface DocumentCardProps {
  document: DocumentReference
}

export function DocumentCard({ document }: DocumentCardProps) {
  return (
    <Button
      variant="ghost"
      className="w-full h-auto py-3 px-3 justify-start font-normal hover:bg-accent"
    >
      <div className="flex items-center gap-3 w-full">
        <FileText className="h-4 w-4 flex-shrink-0 text-muted-foreground" />
        <div className="flex flex-col items-start truncate">
          <div className="truncate text-sm w-full">
            {document.filename}
          </div>
          <div className="text-xs text-muted-foreground">
            ID: {document.document_id.slice(0, 8)}...
          </div>
        </div>
      </div>
    </Button>
  )
}

