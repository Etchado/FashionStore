import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Send } from 'lucide-react'

export function Footer() {
  const { t } = useTranslation()
  const [email, setEmail] = useState('')
  const [subscribed, setSubscribed] = useState(false)

  const handleSubscribe = (e) => {
    e.preventDefault()
    if (email) { setSubscribed(true); setEmail('') }
  }

  return (
    <footer className="bg-stone-950 text-stone-300 mt-24">
      <div className="max-w-7xl mx-auto px-4 py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Brand */}
          <div>
            <span className="font-serif text-2xl font-semibold text-white">FASHION<span className="text-brand-400">.</span></span>
            <p className="mt-4 text-sm font-body text-stone-400 leading-relaxed">{t('footer.brand.desc')}</p>
            <div className="flex items-center gap-4 mt-6">
              <a href="#" aria-label="Instagram" className="text-stone-400 hover:text-brand-400 transition-colors">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-[18px] h-[18px]"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>
              </a>
              <a href="#" aria-label="X" className="text-stone-400 hover:text-brand-400 transition-colors">
                <svg viewBox="0 0 24 24" fill="currentColor" className="w-[18px] h-[18px]"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
              </a>
              <a href="#" aria-label="YouTube" className="text-stone-400 hover:text-brand-400 transition-colors">
                <svg viewBox="0 0 24 24" fill="currentColor" className="w-[18px] h-[18px]"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
              </a>
            </div>
          </div>

          {/* Shop */}
          <div>
            <h3 className="font-body font-semibold text-white mb-4">{t('footer.shop.title')}</h3>
            <ul className="space-y-2">
              {['perfumes', 'watches', 'accessories', 'newArrivals', 'sale'].map(key => (
                <li key={key}>
                  <Link
                    to={`/shop?category=${key === 'newArrivals' ? '' : key === 'sale' ? '' : key}${key === 'newArrivals' ? '&sort=newest' : key === 'sale' ? '&sort=deals' : ''}`}
                    className="text-sm font-body text-stone-400 hover:text-brand-400 transition-colors"
                  >
                    {t(`footer.shop.${key}`)}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="font-body font-semibold text-white mb-4">{t('footer.support.title')}</h3>
            <ul className="space-y-2">
              {['faq', 'shipping', 'returns', 'contact', 'track'].map(key => (
                <li key={key}>
                  <a href="#" className="text-sm font-body text-stone-400 hover:text-brand-400 transition-colors">
                    {t(`footer.support.${key}`)}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h3 className="font-body font-semibold text-white mb-2">{t('footer.newsletter.title')}</h3>
            <p className="text-sm font-body text-stone-400 mb-4">{t('footer.newsletter.subtitle')}</p>
            {subscribed
              ? <p className="text-sm font-body text-brand-400">{t('footer.newsletter.success')}</p>
              : (
                <form onSubmit={handleSubscribe} className="flex gap-2">
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder={t('footer.newsletter.placeholder')}
                    required
                    className="flex-1 bg-stone-800 text-stone-100 placeholder-stone-500 text-sm font-body rounded-lg px-3 py-2 outline-none focus:ring-1 focus:ring-brand-500"
                  />
                  <button type="submit" className="p-2 bg-brand-500 hover:bg-brand-600 text-white rounded-lg transition-colors">
                    <Send size={16} />
                  </button>
                </form>
              )
            }
          </div>
        </div>

        <hr className="border-stone-800 my-10" />

        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs font-body text-stone-500">
            © {new Date().getFullYear()} Fashion Store. {t('footer.rights')}
          </p>
          <div className="flex items-center gap-4">
            <a href="#" className="text-xs font-body text-stone-500 hover:text-stone-300 transition-colors">{t('footer.privacy')}</a>
            <a href="#" className="text-xs font-body text-stone-500 hover:text-stone-300 transition-colors">{t('footer.terms')}</a>
          </div>
        </div>
      </div>
    </footer>
  )
}
