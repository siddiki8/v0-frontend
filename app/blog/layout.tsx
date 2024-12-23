import Link from 'next/link'
import { Button } from "@/components/ui/button"

export default function BlogLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex h-14 items-center">
          <div className="mr-4 hidden md:flex">
            <Link className="mr-6 flex items-center space-x-2" href="/">
              <span className="hidden font-bold sm:inline-block">RAG Consulting</span>
            </Link>
            <nav className="flex items-center space-x-6 text-sm font-medium">
              <Link href="/#solutions">Solutions</Link>
              <Link href="/#industries">Industries</Link>
              <Link href="/#technology">Technology</Link>
              <Link href="/blog" className="text-primary">Blog</Link>
              <Link href="/#about">About</Link>
              <Link href="/#contact">Contact</Link>
            </nav>
          </div>
          <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
            <Button variant="outline">Schedule Demo</Button>
          </div>
        </div>
      </header>
      {children}
      <footer className="w-full py-6 bg-gray-100 dark:bg-gray-800">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-8 sm:grid-cols-2 md:grid-cols-4">
            <div>
              <h3 className="text-lg font-semibold mb-2">RAG Consulting</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Transforming enterprise knowledge into actionable intelligence.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-2">Quick Links</h3>
              <ul className="space-y-2 text-sm">
                <li><Link href="/#solutions">Solutions</Link></li>
                <li><Link href="/#industries">Industries</Link></li>
                <li><Link href="/#technology">Technology</Link></li>
                <li><Link href="/#about">About</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-2">Contact</h3>
              <ul className="space-y-2 text-sm">
                <li>Email: info@ragconsulting.com</li>
                <li>Phone: (555) 123-4567</li>
                <li>Address: 123 AI Street, Tech City, TC 12345</li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-2">Follow Us</h3>
              <ul className="space-y-2 text-sm">
                <li><Link href="#">LinkedIn</Link></li>
                <li><Link href="#">Twitter</Link></li>
                <li><Link href="#">GitHub</Link></li>
              </ul>
            </div>
          </div>
          <div className="mt-8 border-t pt-8">
            <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
              © 2023 RAG Consulting. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
} 