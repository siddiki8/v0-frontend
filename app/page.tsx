'use client'

import { useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { useAuthStore } from '@/lib/stores/auth-store'
import Link from 'next/link'
import Image from 'next/image'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ArrowRight, BarChart, Lock, Zap, FileText, Brain, Cog, ChevronRight } from 'lucide-react'

export default function HomePage() {
  const router = useRouter()
  const pathname = usePathname()
  const session = useAuthStore(state => state.session)

  // Only allow explicit redirects, and never redirect if we're on the home page
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    if (session && params.get('redirect') === 'chat' && pathname !== '/') {
      router.push('/chat')
    }
  }, [session, router, pathname])

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex h-14 items-center">
          <div className="mr-4 hidden md:flex">
            <Link className="mr-6 flex items-center space-x-2" href="/">
              <span className="hidden font-bold sm:inline-block">RAG Consulting</span>
            </Link>
            <nav className="flex items-center space-x-6 text-sm font-medium">
              <Link href="#solutions">Solutions</Link>
              <Link href="#industries">Industries</Link>
              <Link href="#technology">Technology</Link>
              <Link href="/blog">Blog</Link>
              <Link href="#about">About</Link>
              <Link href="#contact">Contact</Link>
            </nav>
          </div>
          <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
            <Button variant="outline">Schedule Demo</Button>
          </div>
        </div>
      </header>
      <main className="flex-1">
        <section id="hero" className="w-full py-12 md:py-24 lg:py-32 xl:py-48 bg-black text-white">
          <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid gap-6 lg:grid-cols-[1fr_800px] lg:gap-12 xl:grid-cols-[1fr_800px]">
              <div className="flex flex-col justify-center space-y-4">
                <div className="space-y-2">
                  <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none">
                    Transform Enterprise Knowledge into Actionable Intelligence
                  </h1>
                  <p className="max-w-[600px] text-gray-400 md:text-xl">
                    Turn your document chaos into clarity with custom-built RAG solutions. 
                    From real-time market data to historical archives, unlock the full potential 
                    of your enterprise knowledge.
                  </p>
                </div>
                <div className="flex flex-col gap-2 min-[400px]:flex-row">
                  <Button asChild size="lg">
                    <Link href="/chat">
                      GO TO DEMO <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                  <Button variant="outline" size="lg">Learn More</Button>
                </div>
              </div>
              <div className="flex items-center justify-center">
                <Image
                  src="/rag-demo-screenshot.png"
                  alt="RAG Demo Screenshot"
                  width={800}
                  height={800}
                  className="rounded-lg object-cover shadow-xl"
                />
              </div>
            </div>
          </div>
        </section>

        <section id="technology" className="w-full py-12 md:py-24 lg:py-32">
          <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl text-center mb-12">
              RAG Architecture
            </h2>
            <div className="flex justify-center mb-12">
              <Image
                src="/rag-architecture.png"
                alt="RAG Architecture Diagram"
                width={800}
                height={400}
                className="rounded-lg object-cover"
              />
            </div>
            <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-3">
              <div className="flex flex-col items-center text-center">
                <Zap className="h-12 w-12 mb-4 text-primary" />
                <h3 className="text-xl font-bold mb-2">Real-Time Processing</h3>
                <ul className="text-sm text-gray-500 dark:text-gray-400">
                  <li>Custom data crawlers</li>
                  <li>Parallel processing pipelines</li>
                  <li>Live integration capabilities</li>
                  <li>Real-time index updates</li>
                </ul>
              </div>
              <div className="flex flex-col items-center text-center">
                <Cog className="h-12 w-12 mb-4 text-primary" />
                <h3 className="text-xl font-bold mb-2">Custom Development</h3>
                <ul className="text-sm text-gray-500 dark:text-gray-400">
                  <li>Tailored architecture</li>
                  <li>Industry-specific models</li>
                  <li>Custom UI development</li>
                  <li>Specialized preprocessing</li>
                </ul>
              </div>
              <div className="flex flex-col items-center text-center">
                <Lock className="h-12 w-12 mb-4 text-primary" />
                <h3 className="text-xl font-bold mb-2">Enterprise Integration</h3>
                <ul className="text-sm text-gray-500 dark:text-gray-400">
                  <li>Secure deployment options</li>
                  <li>API-first architecture</li>
                  <li>Existing system integration</li>
                  <li>Custom security models</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        <section id="industries" className="w-full py-12 md:py-24 lg:py-32 bg-gray-100 dark:bg-gray-800">
          <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl text-center mb-12">
              Industry Solutions
            </h2>
            <div className="grid gap-10 md:grid-cols-2">
              <div className="bg-white dark:bg-gray-900 p-6 rounded-lg shadow-lg">
                <h3 className="text-2xl font-bold mb-4">Financial Services</h3>
                <p className="text-gray-500 dark:text-gray-400 mb-4">
                  In today's fast-moving markets, missing critical information isn't just 
                  costly—it's competitive suicide. Traditional document processing can't 
                  keep pace with the flood of earnings calls, financial reports, and 
                  market data.
                </p>
                <ul className="list-disc list-inside mb-4 text-gray-500 dark:text-gray-400">
                  <li>Real-time earnings analysis</li>
                  <li>Automated report processing</li>
                  <li>Market sentiment tracking</li>
                  <li>Competitive intelligence</li>
                  <li>Custom financial models</li>
                </ul>
                <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded">
                  <h4 className="font-bold mb-2">Case Study Preview</h4>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    How a $7B AUM investment firm automated their earnings analysis,
                    saving 20+ analyst hours per week while capturing 40% more 
                    actionable insights.
                  </p>
                </div>
              </div>
              <div className="bg-white dark:bg-gray-900 p-6 rounded-lg shadow-lg">
                <h3 className="text-2xl font-bold mb-4">Legal Services</h3>
                <p className="text-gray-500 dark:text-gray-400 mb-4">
                  When every precedent matters and every contract detail counts,
                  manual document review isn't just slow—it's risky. Modern legal
                  practices need intelligent document processing that scales with
                  their needs.
                </p>
                <ul className="list-disc list-inside mb-4 text-gray-500 dark:text-gray-400">
                  <li>Automated document review</li>
                  <li>Precedent analysis</li>
                  <li>Multi-jurisdiction research</li>
                  <li>Compliance monitoring</li>
                  <li>Contract analysis</li>
                </ul>
                <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded">
                  <h4 className="font-bold mb-2">Case Study Preview</h4>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    How a top-tier law firm reduced contract review time by 70%
                    while improving accuracy and compliance adherence.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="features" className="w-full py-12 md:py-24 lg:py-32">
          <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl text-center mb-12">
              Features & Benefits
            </h2>
            <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-3">
              <div className="flex flex-col items-center text-center">
                <Zap className="h-12 w-12 mb-4 text-primary" />
                <h3 className="text-xl font-bold mb-2">Real-Time Intelligence</h3>
                <ul className="text-sm text-gray-500 dark:text-gray-400">
                  <li>Live data integration</li>
                  <li>Parallel processing</li>
                  <li>Instant updates</li>
                  <li>Custom alerts</li>
                </ul>
              </div>
              <div className="flex flex-col items-center text-center">
                <Brain className="h-12 w-12 mb-4 text-primary" />
                <h3 className="text-xl font-bold mb-2">Custom Solutions</h3>
                <ul className="text-sm text-gray-500 dark:text-gray-400">
                  <li>Tailored architecture</li>
                  <li>Industry-specific models</li>
                  <li>Specialized preprocessing</li>
                  <li>Custom UI development</li>
                </ul>
              </div>
              <div className="flex flex-col items-center text-center">
                <Lock className="h-12 w-12 mb-4 text-primary" />
                <h3 className="text-xl font-bold mb-2">Enterprise Security</h3>
                <ul className="text-sm text-gray-500 dark:text-gray-400">
                  <li>Private deployment</li>
                  <li>Data sovereignty</li>
                  <li>Audit trails</li>
                  <li>Access controls</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        <section id="process" className="w-full py-12 md:py-24 lg:py-32 bg-gray-100 dark:bg-gray-800">
          <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl text-center mb-12">
              Our Consultation Process
            </h2>
            <div className="grid gap-10 md:grid-cols-3">
              <div className="bg-white dark:bg-gray-900 p-6 rounded-lg shadow-lg">
                <h3 className="text-xl font-bold mb-4">1. Discovery Phase</h3>
                <ul className="list-disc list-inside text-gray-500 dark:text-gray-400">
                  <li>Understanding current processes</li>
                  <li>Identifying pain points</li>
                  <li>Defining success metrics</li>
                </ul>
              </div>
              <div className="bg-white dark:bg-gray-900 p-6 rounded-lg shadow-lg">
                <h3 className="text-xl font-bold mb-4">2. Solution Design</h3>
                <ul className="list-disc list-inside text-gray-500 dark:text-gray-400">
                  <li>Architecture planning</li>
                  <li>Integration mapping</li>
                  <li>Timeline development</li>
                </ul>
              </div>
              <div className="bg-white dark:bg-gray-900 p-6 rounded-lg shadow-lg">
                <h3 className="text-xl font-bold mb-4">3. Implementation</h3>
                <ul className="list-disc list-inside text-gray-500 dark:text-gray-400">
                  <li>Agile development</li>
                  <li>Regular updates</li>
                  <li>Training & support</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        <section id="cta" className="w-full py-12 md:py-24 lg:py-32 bg-primary text-primary-foreground">
          <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col items-center space-y-4 text-center">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                Ready to Transform Your Enterprise Knowledge?
              </h2>
              <p className="mx-auto max-w-[700px] text-primary-foreground/80 md:text-xl">
                Schedule a demo today and see how our custom RAG solutions can drive your business forward.
              </p>
              <div className="space-x-4">
                <Button asChild size="lg" variant="secondary">
                  <Link href="/demo">Schedule Custom Demo</Link>
                </Button>
                <Button asChild size="lg" variant="outline">
                  <Link href="/contact">Discuss Your Project</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>

        <section id="contact" className="w-full py-12 md:py-24 lg:py-32">
          <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col items-center space-y-4 text-center">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                Stay Updated
              </h2>
              <p className="mx-auto max-w-[700px] text-gray-500 md:text-xl dark:text-gray-400">
                Get the latest insights on RAG technology and industry applications.
              </p>
              <div className="w-full max-w-sm space-y-2">
                <form className="flex space-x-2">
                  <Input type="email" placeholder="Enter your email" className="flex-1" />
                  <Button type="submit">Subscribe</Button>
                </form>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  We respect your privacy. Unsubscribe at any time.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>
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
                <li><Link href="#solutions">Solutions</Link></li>
                <li><Link href="#industries">Industries</Link></li>
                <li><Link href="#technology">Technology</Link></li>
                <li><Link href="#about">About</Link></li>
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

