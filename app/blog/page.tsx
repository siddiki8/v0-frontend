import Link from 'next/link'
import { Button } from "@/components/ui/button"
import { ArrowRight } from 'lucide-react'

// Blog posts from the markdown files
const blogPosts = [
  {
    slug: 'why-rag',
    title: 'Ignite Your Insights: How RAG is Revolutionizing Research',
    excerpt: 'For organizations operating at the cutting edge – investment firms, law firms, and science labs – discover how RAG is transforming research from a bottleneck into a strategic advantage.',
    date: '2023-12-20',
    readTime: '10 min read',
    category: 'Strategy'
  },
  {
    slug: 'rag-techniques',
    title: 'Unlock Smarter Search: Deep Dive into Advanced RAG Techniques',
    excerpt: 'Explore sophisticated RAG implementation techniques, from reprompting and reranking to chunking strategies and HNSW indexing.',
    date: '2023-12-21',
    readTime: '12 min read',
    category: 'Technical'
  },
  {
    slug: 'parsing-libraries',
    title: 'Choosing the Right Document Parsing Library for RAG',
    excerpt: 'A comprehensive comparison of Unstructured, Docling, and Markitdown libraries for document parsing in RAG pipelines, helping you make the best choice for your development needs.',
    date: '2023-12-20',
    readTime: '8 min read',
    category: 'Development'
  },
  {
    slug: 'docling',
    title: 'Understanding Docling: A Deep Dive into Document Processing',
    excerpt: 'Explore the capabilities and architecture of Docling, a powerful document processing library for handling complex multi-modal documents in RAG applications.',
    date: '2023-12-20',
    readTime: '7 min read',
    category: 'Technical'
  }
]

export default function BlogPage() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <main className="flex-1">
        <section className="w-full py-12 md:py-24 lg:py-32 bg-black text-white">
          <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="max-w-2xl">
              <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none mb-4">
                Latest Insights in RAG Technology
              </h1>
              <p className="text-lg text-gray-400 mb-8">
                Explore our latest thoughts on RAG technology, implementation strategies, and industry applications.
              </p>
            </div>
          </div>
        </section>

        <section className="w-full py-12 md:py-24 lg:py-32">
          <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-3">
              {blogPosts.map((post) => (
                <article key={post.slug} className="group relative flex flex-col bg-card rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
                  <div className="p-6">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
                      <span>{post.category}</span>
                      <span>•</span>
                      <span>{post.readTime}</span>
                    </div>
                    <h2 className="text-2xl font-bold mb-2">
                      <Link href={`/blog/${post.slug}`} className="hover:text-primary transition-colors">
                        {post.title}
                      </Link>
                    </h2>
                    <p className="text-muted-foreground mb-6">
                      {post.excerpt}
                    </p>
                    <Button asChild variant="outline" className="w-full">
                      <Link href={`/blog/${post.slug}`}>
                        Read More <ArrowRight className="ml-2 h-4 w-4" />
                      </Link>
                    </Button>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>
      </main>
    </div>
  )
} 