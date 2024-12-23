import { notFound } from 'next/navigation'
import { remark } from 'remark'
import html from 'remark-html'
import gfm from 'remark-gfm'
import { BlogPostContent } from '../components/blog-post-content'

// Metadata for the blog posts
const posts = {
  'why-rag': {
    title: 'Ignite Your Insights: How RAG is Revolutionizing Research',
    date: '2023-12-20',
    author: 'RAG Consulting Team',
    filename: 'why_rag.md'
  },
  'rag-techniques': {
    title: 'Unlock Smarter Search: Deep Dive into Advanced RAG Techniques',
    date: '2023-12-21',
    author: 'RAG Consulting Team',
    filename: 'rag_techniques.md'
  },
  'parsing-libraries': {
    title: 'Choosing the Right Document Parsing Library for RAG',
    date: '2023-12-20',
    author: 'RAG Consulting Team',
    filename: 'parsing_libraries.md'
  },
  'docling': {
    title: 'Understanding Docling: A Deep Dive into Document Processing',
    date: '2023-12-20',
    author: 'RAG Consulting Team',
    filename: 'docling.md'
  }
}

async function getPostContent(slug: string) {
  const post = posts[slug as keyof typeof posts]
  if (!post) return null

  try {
    const response = await fetch(`http://localhost:3000/blog_posts/${post.filename}`)
    if (!response.ok) throw new Error('Failed to fetch post content')
    const markdown = await response.text()
    const processedContent = await remark()
      .use(gfm)
      .use(html)
      .process(markdown)
    return processedContent.toString()
  } catch (error) {
    console.error('Error reading blog post:', error)
    return null
  }
}

export default async function BlogPost({ params }: { params: { slug: string } }) {
  const post = posts[params.slug as keyof typeof posts]
  
  if (!post) {
    notFound()
  }

  const content = await getPostContent(params.slug)
  
  if (!content) {
    notFound()
  }

  return <BlogPostContent post={post} content={content} />
}
