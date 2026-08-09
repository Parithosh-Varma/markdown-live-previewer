import { useState, useEffect, useMemo } from 'react'
import { marked } from 'marked'
import DOMPurify from 'dompurify'

marked.setOptions({
  gfm: true,
  breaks: true,
})

const SAMPLE = `# Markdown Live Preview

Write **markdown** on the left, see *rendered* output on the right.

## Features

- Live rendering as you type
- GitHub-flavored Markdown (GFM)
- Copy the generated HTML
- Download your markdown file

### Code

\`\`\`ts
const greet = (name: string) => \`Hello, \${name}!\`
console.log(greet('world'))
\`\`\`

### List

1. First item
2. Second item

> Blockquotes, \`inline code\`, [links](https://github.com) and ~~strikethrough~~ all work.

| Feature | Status |
| ------- | ------ |
| Tables | ✔ |
| Task lists | [x] done |
`

function App() {
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    const saved = localStorage.getItem('theme')
    if (saved === 'dark') return 'dark'
    if (saved === 'light') return 'light'
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
  })
  const [input, setInput] = useState(SAMPLE)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark')
    localStorage.setItem('theme', theme)
  }, [theme])

  const html = useMemo(() => {
    const raw = marked.parse(input, { async: false }) as string
    return DOMPurify.sanitize(raw)
  }, [input])

  const wordCount = useMemo(() => {
    const text = input.replace(/\s+/g, ' ').trim()
    return text.length === 0 ? 0 : text.split(' ').length
  }, [input])

  const copyHtml = async () => {
    await navigator.clipboard.writeText(html)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  const downloadMd = () => {
    const blob = new Blob([input], { type: 'text/markdown' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'document.md'
    a.click()
    URL.revokeObjectURL(url)
  }

  const downloadHtml = () => {
    const doc = `<!doctype html><html><head><meta charset="utf-8"><title>Markdown Export</title><style>body{font-family:system-ui,sans-serif;max-width:720px;margin:2rem auto;padding:0 1rem;line-height:1.6}</style></head><body>${html}</body></html>`
    const blob = new Blob([doc], { type: 'text/html' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'document.html'
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col items-center transition-colors duration-300">
      <header className="sticky top-0 z-50 flex items-center justify-between px-6 sm:px-8 py-4 border-b border-border bg-card/60 backdrop-blur-md w-full">
        <div className="flex items-center gap-3">
          <img src="/logo.png" alt="Logo" className="w-8 h-8 rounded-full object-cover border border-border shadow-sm" />
          <h1 className="text-xl font-bold tracking-tight bg-gradient-to-r from-foreground via-foreground to-primary bg-clip-text text-transparent">Markdown Live Previewer</h1>
        </div>
        <div className="flex items-center gap-3">
          <a
            href="https://github.com/parithosh-varma/markdown-live-previewer"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-3.5 py-2 text-sm font-semibold transition-all border border-border bg-background hover:bg-muted text-foreground rounded-lg shadow-sm hover:border-muted-foreground/30"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4"/><path d="M9 18c-4.51 2-5-2-7-2"/></svg>
            <span className="hidden sm:inline">Repo</span>
          </a>
          <button
            onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
            className="inline-flex items-center justify-center w-9 h-9 border border-border bg-background hover:bg-muted text-foreground rounded-lg transition-all hover:border-muted-foreground/30 shadow-sm"
            aria-label="Toggle theme"
          >
            {theme === 'light' ? (
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-4.5 h-4.5"><circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="m17.66 17.66 1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="m6.34 17.66-1.41 1.41"/><path d="m19.07 4.93-1.41 1.41"/></svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-4.5 h-4.5"><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/></svg>
            )}
          </button>
        </div>
      </header>

      <main className="flex-1 w-full px-4 sm:px-6 py-6 sm:py-10 max-w-6xl">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">Write markdown, preview instantly</h2>
            <p className="text-muted-foreground mt-1">GFM renderer with sanitized HTML output — safe and fully client-side.</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setInput(SAMPLE)}
              className="px-3.5 py-2 text-sm font-semibold rounded-xl border border-border bg-background hover:bg-muted text-foreground transition-all shadow-sm"
            >
              Sample
            </button>
            <button
              onClick={downloadMd}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-sm font-semibold rounded-xl border border-border bg-background hover:bg-muted text-foreground transition-all shadow-sm"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-4 h-4"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" x2="12" y1="3" y2="15"/></svg>
              .md
            </button>
            <button
              onClick={downloadHtml}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-sm font-semibold rounded-xl border border-border bg-background hover:bg-muted text-foreground transition-all shadow-sm"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-4 h-4"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/></svg>
              .html
            </button>
            <button
              onClick={copyHtml}
              disabled={!input}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-sm font-semibold rounded-xl bg-primary text-primary-foreground hover:opacity-90 transition-opacity shadow-lg shadow-primary/25 disabled:opacity-50"
            >
              {copied ? (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-4 h-4"><path d="M20 6 9 17l-5-5"/></svg>
                  Copied!
                </>
              ) : (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-4 h-4"><rect width="14" height="14" x="8" y="8" rx="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>
                  Copy HTML
                </>
              )}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 h-auto lg:h-[70vh]">
          <div className="border border-border rounded-2xl bg-card shadow-sm overflow-hidden flex flex-col">
            <div className="flex items-center justify-between px-4 py-2.5 border-b border-border bg-muted/40 shrink-0">
              <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Editor</span>
              <span className="text-xs font-mono text-muted-foreground">{input.length} chars · {wordCount} words</span>
            </div>
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type or paste markdown here…"
              className="flex-1 min-h-[40vh] lg:min-h-0 w-full resize-none bg-transparent p-4 font-mono text-sm leading-relaxed outline-none focus-visible:ring-2 focus-visible:ring-ring placeholder:text-muted-foreground/50"
              spellCheck={false}
            />
          </div>
          <div className="border border-border rounded-2xl bg-card shadow-sm overflow-hidden flex flex-col">
            <div className="flex items-center justify-between px-4 py-2.5 border-b border-border bg-muted shrink-0">
              <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Preview</span>
              <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <span className="w-2 h-2 rounded-full bg-green-500 inline-block animate-pulse"></span>
                Live
              </span>
            </div>
            <div
              className="flex-1 overflow-y-auto p-5 md-preview" style={{ minHeight: '40vh' }}
              dangerouslySetInnerHTML={{ __html: html }}
            />
          </div>
        </div>

        <div className="mt-6 border border-border rounded-2xl bg-muted/40 p-4 text-sm text-muted-foreground flex items-start gap-3">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-5 h-5 text-primary shrink-0 mt-0.5"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>
          <span>
            Renders GitHub-flavored Markdown: headings, lists, tables, code blocks with syntax highlighting, blockquotes, task lists and more. Output is sanitized with DOMPurify before display.
          </span>
        </div>
      </main>

      <footer className="w-full text-center py-8 border-t border-border text-sm text-muted-foreground">
        <p>Built with ❤️ by <a href="https://github.com/parithosh-varma" target="_blank" rel="noopener noreferrer" className="text-primary font-semibold hover:underline">Parithosh Varma</a></p>
      </footer>
    </div>
  )
}

export default App