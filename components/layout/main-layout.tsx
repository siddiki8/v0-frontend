import { SessionsSidebar } from '@/components/chat/sessions-sidebar'
import { DocumentsSidebar } from '@/components/documents/documents-sidebar'
import { SidebarOptions } from '@/components/layout/sidebar-options'
import { Header } from '@/components/layout/header'

export function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen overflow-hidden">
      <div className="w-64 border-r bg-background flex flex-col">
        <Header />
        <SessionsSidebar />
      </div>
      <main className="flex-1 overflow-hidden">
        {children}
      </main>
      <div className="w-64 border-l bg-background flex flex-col">
        <SidebarOptions />
        <DocumentsSidebar />
      </div>
    </div>
  )
}

