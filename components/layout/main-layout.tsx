import { SessionsSidebar } from '@/components/chat/sessions-sidebar'
import { DocumentsSidebar } from '@/components/documents/documents-sidebar'
import { SidebarOptions } from '@/components/layout/sidebar-options'
import { Header } from '@/components/layout/header'

export function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid h-screen" style={{ 
      gridTemplateColumns: '256px 1fr 256px',
      gridTemplateRows: 'auto 1fr'
    }}>
      <Header />
      <div className="border-b" />
      <SidebarOptions />

      <div className="border-r bg-background overflow-auto">
        <SessionsSidebar />
      </div>
      <main className="overflow-auto">
        {children}
      </main>
      <div className="border-l bg-background overflow-auto">
        <DocumentsSidebar />
      </div>
    </div>
  )
}

