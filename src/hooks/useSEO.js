import { useEffect } from 'react'

export function useSEO({ title, description, image, url } = {}) {
  useEffect(() => {
    const siteName = 'Fashion Store'
    const fullTitle = title ? `${title} — ${siteName}` : siteName

    document.title = fullTitle

    const setMeta = (selector, content) => {
      let el = document.querySelector(selector)
      if (!el) {
        el = document.createElement('meta')
        const attr = selector.includes('[name') ? 'name' : 'property'
        const val = selector.match(/["']([^"']+)["']/)?.[1]
        el.setAttribute(attr, val)
        document.head.appendChild(el)
      }
      el.setAttribute('content', content)
    }

    if (description) {
      setMeta('meta[name="description"]', description)
      setMeta('meta[property="og:description"]', description)
      setMeta('meta[name="twitter:description"]', description)
    }
    if (fullTitle) {
      setMeta('meta[property="og:title"]', fullTitle)
      setMeta('meta[name="twitter:title"]', fullTitle)
    }
    if (image) {
      setMeta('meta[property="og:image"]', image)
      setMeta('meta[name="twitter:image"]', image)
      setMeta('meta[name="twitter:card"]', 'summary_large_image')
    }
    if (url) {
      setMeta('meta[property="og:url"]', url)
    }
    setMeta('meta[property="og:site_name"]', siteName)
    setMeta('meta[property="og:type"]', 'website')
  }, [title, description, image, url])
}
