import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { ArrowRight } from 'lucide-react'

export function Footer() {
  const { t } = useTranslation()
  const [email, setEmail] = useState('')
  const [subscribed, setSubscribed] = useState(false)

  const handleSubscribe = (e) => {
    e.preventDefault()
    if (email) { setSubscribed(true); setEmail('') }
  }

  return (
    <footer className="bg-stone-950 dark:bg-black text-stone-400 mt-24">
      {/* Gold divider */}
      <div className="h-px bg-gradient-to-r from-transparent via-brand-400/30 to-transparent" />

      <div className="max-w-7xl mx-auto px-4 md:px-6">
        {/* Main grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 py-16">
          {/* Brand */}
          <div>
            <div className="mb-5">
              <span className="font-serif text-xl font-semibold text-white tracking-tight">
                FASHION<span className="text-brand-400">.</span>
              </span>
            </div>
            <p className="text-sm font-body text-stone-500 leading-relaxed mb-6">{t('footer.brand.desc')}</p>
            <div className="flex items-center gap-4">
              <a href="#" aria-label="Instagram" className="text-stone-600 hover:text-brand-400 transition-colors">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-[17px] h-[17px]"><rect x="2" y="2" width="20" height="20" rx="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>
              </a>
              <a href="#" aria-label="X" className="text-stone-600 hover:text-brand-400 transition-colors">
                <svg viewBox="0 0 24 24" fill="currentColor" className="w-[15px] h-[15px]"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
              </a>
              <a href="#" aria-label="YouTube" className="text-stone-600 hover:text-brand-400 transition-colors">
                <svg viewBox="0 0 24 24" fill="currentColor" className="w-[17px] h-[17px]"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
              </a>
            </div>
          </div>

          {/* Shop */}
          <div>
            <p className="text-[10px] font-body font-semibold uppercase tracking-[0.25em] text-white mb-5">
              {t('footer.shop.title')}
            </p>
            <ul className="space-y-3">
              {['perfumes', 'watches', 'accessories', 'newArrivals', 'sale'].map(key => (
                <li key={key}>
                  <Link
                    to={`/shop${key === 'newArrivals' ? '?sort=newest' : key === 'sale' ? '?sort=deals' : `?category=${key}`}`}
                    className="text-sm font-body text-stone-500 hover:text-brand-400 transition-colors"
                  >
                    {t(`footer.shop.${key}`)}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support */}
          <div>
            <p className="text-[10px] font-body font-semibold uppercase tracking-[0.25em] text-white mb-5">
              {t('footer.support.title')}
            </p>
            <ul className="space-y-3">
              {['faq', 'shipping', 'returns', 'contact', 'track'].map(key => (
                <li key={key}>
                  <Link to={`/support#${key}`} className="text-sm font-body text-stone-500 hover:text-brand-400 transition-colors">
                    {t(`footer.support.${key}`)}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <p className="text-[10px] font-body font-semibold uppercase tracking-[0.25em] text-white mb-3">
              {t('footer.newsletter.title')}
            </p>
            <p className="text-sm font-body text-stone-500 mb-5 leading-relaxed">{t('footer.newsletter.subtitle')}</p>
            {subscribed ? (
              <p className="text-sm font-body text-brand-400">{t('footer.newsletter.success')}</p>
            ) : (
              <form onSubmit={handleSubscribe} className="flex">
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder={t('footer.newsletter.placeholder')}
                  required
                  className="flex-1 bg-stone-900 dark:bg-stone-800 text-stone-100 placeholder-stone-600 text-sm font-body px-4 py-3 outline-none border border-stone-800 focus:border-brand-400/50 transition-colors min-w-0"
                />
                <button
                  type="submit"
                  className="flex-shrink-0 px-4 py-3 bg-brand-500 hover:bg-brand-400 text-white transition-colors"
                  aria-label="Subscribe"
                >
                  <ArrowRight size={15} />
                </button>
              </form>
            )}
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-stone-900 py-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-[11px] font-body text-stone-600 uppercase tracking-wider">
            © {new Date().getFullYear()} Fashion Store. {t('footer.rights')}
          </p>
          <div className="flex items-center gap-6">
            <a href="#" className="text-[11px] font-body text-stone-600 hover:text-stone-400 uppercase tracking-wider transition-colors">
              {t('footer.privacy')}
            </a>
            <a href="#" className="text-[11px] font-body text-stone-600 hover:text-stone-400 uppercase tracking-wider transition-colors">
              {t('footer.terms')}
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}
