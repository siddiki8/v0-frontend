import { ScrollArea } from '@/components/ui/scroll-area'
import { DocumentCard } from '@/components/documents/document-card'
import { useDocuments } from '@/hooks/use-documents'
import { Skeleton } from '@/components/ui/skeleton'

export function DocumentsSidebar() {
  const { documents, isLoading } = useDocuments()

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b">
        <h2 className="font-semibold">Relevant Documents</h2>
      </div>
      <ScrollArea className="flex-1 px-2">
        <div className="space-y-1 pr-2 py-2">
          {isLoading ? (
            <div className="space-y-2">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
          ) : documents.length === 0 ? (
            <p className="text-center text-muted-foreground py-4">No relevant documents</p>
          ) : (
            documents.map((document) => (
              <DocumentCard 
                key={`${document.document_id}-${document.chunk_index}`} 
                document={document} 
              />
            ))
          )}
        </div>
      </ScrollArea>
    </div>
  )
}

