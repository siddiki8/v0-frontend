import { notFound } from 'next/navigation'
import { remark } from 'remark'
import html from 'remark-html'
import gfm from 'remark-gfm'
import { BlogPostContent } from '../components/blog-post-content'
import { Metadata } from 'next'
import fs from 'fs/promises'
import path from 'path'

// Metadata for the blog posts
const posts = {
  'why-rag': {
    title: 'Ignite Your Insights: How RAG is Revolutionizing Research',
    date: '2023-12-20',
    author: 'RAG Consulting Team',
    filename: 'why_rag.md',
    excerpt: 'For organizations operating at the cutting edge – investment firms, law firms, and science labs – discover how RAG is transforming research from a bottleneck into a strategic advantage.'
  },
  'rag-techniques': {
    title: 'Unlock Smarter Search: Deep Dive into Advanced RAG Techniques',
    date: '2023-12-21',
    author: 'RAG Consulting Team',
    filename: 'rag_techniques.md',
    excerpt: 'Explore sophisticated RAG implementation techniques, from reprompting and reranking to chunking strategies and HNSW indexing.'
  },
  'parsing-libraries': {
    title: 'Choosing the Right Document Parsing Library for RAG',
    date: '2023-12-20',
    author: 'RAG Consulting Team',
    filename: 'parsing_libraries.md',
    excerpt: 'A comprehensive comparison of Unstructured, Docling, and Markitdown libraries for document parsing in RAG pipelines, helping you make the best choice for your development needs.'
  },
  'docling': {
    title: 'Understanding Docling: A Deep Dive into Document Processing',
    date: '2023-12-20',
    author: 'RAG Consulting Team',
    filename: 'docling.md',
    excerpt: 'Explore the capabilities and architecture of Docling, a powerful document processing library for handling complex multi-modal documents in RAG applications.'
  }
} as const

type PostSlug = keyof typeof posts

// Generate static params for all blog posts
export async function generateStaticParams() {
  return Object.keys(posts).map((slug) => ({
    slug,
  }))
}

// Type guard to validate slug
function isValidSlug(slug: string): slug is PostSlug {
  return slug in posts
}

// Get post data with validation
function getPostData(slug: string) {
  if (!isValidSlug(slug)) {
    return null
  }
  return posts[slug]
}

// Generate metadata for each blog post
export async function generateMetadata(
  { params }: { params: { slug: string } }
): Promise<Metadata> {
  const post = getPostData(params.slug)
  
  if (!post) {
    return {
      title: 'Post Not Found - RAG Consulting Blog',
      description: 'The requested blog post could not be found.'
    }
  }

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://ragconsulting.com'
  const postUrl = `${baseUrl}/blog/${params.slug}`

  return {
    title: `${post.title} - RAG Consulting Blog`,
    description: post.excerpt,
    authors: [{ name: post.author }],
    openGraph: {
      title: post.title,
      description: post.excerpt,
      type: 'article',
      url: postUrl,
      siteName: 'RAG Consulting',
      publishedTime: post.date,
      authors: [post.author],
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description: post.excerpt,
    }
  }
}

// Cache for markdown content
const markdownCache: Record<string, string> = {}

async function getPostContent(filename: string) {
  // Check cache first
  if (markdownCache[filename]) {
    return markdownCache[filename]
  }

  try {
    const filePath = path.join(process.cwd(), 'content', 'blog', filename)
    const markdown = await fs.readFile(filePath, 'utf8')
    const processedContent = await remark()
      .use(gfm)
      .use(html)
      .process(markdown)
    
    const content = processedContent.toString()
    // Cache the processed content
    markdownCache[filename] = content
    return content
  } catch (error) {
    console.error('Error reading blog post:', error)
    return null
  }
}

export default async function BlogPost({ params }: { params: { slug: string } }) {
  const post = getPostData(params.slug)
  
  if (!post) {
    notFound()
  }

  const content = await getPostContent(post.filename)
  if (!content) {
    notFound()
  }

  return <BlogPostContent post={post} content={content} />
}
