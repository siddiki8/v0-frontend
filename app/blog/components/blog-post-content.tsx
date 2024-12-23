'use client'

import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { useEffect, useState } from 'react'

type Post = {
  title: string;
  date: string;
  author: string;
  filename: string;
}

interface BlogPostContentProps {
  post: Post;
  content: string;
}

export function BlogPostContent({ post, content }: BlogPostContentProps) {
  // Use state to handle client-side rendering of HTML content
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <main className="flex-1">
        <article className="container mx-auto max-w-3xl px-4 py-12">
          <div className="mb-8">
            <Button variant="ghost" asChild className="mb-8">
              <Link href="/blog">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Blog
              </Link>
            </Button>
            <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl mb-4">
              {post.title}
            </h1>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span>{post.author}</span>
              <span>•</span>
              <span>{post.date}</span>
            </div>
          </div>
          {mounted ? (
            <div 
              className="prose dark:prose-invert max-w-none"
              dangerouslySetInnerHTML={{ __html: content }}
            />
          ) : (
            <div className="prose dark:prose-invert max-w-none">
              <p>Loading content...</p>
            </div>
          )}
        </article>
      </main>
    </div>
  )
} 