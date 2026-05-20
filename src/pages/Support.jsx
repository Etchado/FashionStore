import { useState, useEffect } from 'react'
import { useLocation, Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'motion/react'
import { ChevronDown, Mail, MessageCircle, Package, RotateCcw, Truck, HelpCircle } from 'lucide-react'
import { useSEO } from '@/hooks/useSEO'

const SECTIONS = [
  {
    id: 'faq',
    icon: HelpCircle,
    title: 'Frequently Asked Questions',
    items: [
      {
        q: 'Are all products authentic?',
        a: 'Yes. Every item in our collection is 100% authentic and sourced directly from authorised brand distributors. We provide certificates of authenticity with every purchase.',
      },
      {
        q: 'Do you ship internationally?',
        a: 'We ship to over 50 countries worldwide. Shipping rates and delivery times vary by destination. All international orders are shipped via DHL Express or FedEx Priority.',
      },
      {
        q: 'How do I create an account?',
        a: 'Click the person icon in the navigation bar and select "Sign Up". You can register with email and password or continue with Google.',
      },
      {
        q: 'Can I change or cancel my order?',
        a: 'Orders can be modified or cancelled within 2 hours of placement. After that, the order enters processing and cannot be changed. Please contact us immediately if you need to make changes.',
      },
      {
        q: 'How do loyalty points work?',
        a: 'You earn 1 point for every $10 spent. Points accumulate across four tiers — Bronze, Silver, Gold, and Platinum — unlocking exclusive perks and early access to new drops.',
      },
    ],
  },
  {
    id: 'shipping',
    icon: Truck,
    title: 'Shipping Information',
    items: [
      {
        q: 'Standard Shipping (5–7 business days)',
        a: 'Free on all orders over $200. A flat rate of $12 applies to orders below that threshold. Available within Saudi Arabia, UAE, Kuwait, Bahrain, Qatar, and Oman.',
      },
      {
        q: 'Express Shipping (1–2 business days)',
        a: '$25 flat rate. Orders placed before 2 PM (AST) are dispatched the same day. A tracking number is emailed once your order ships.',
      },
      {
        q: 'International Shipping (7–14 business days)',
        a: 'Rates calculated at checkout based on weight and destination. Import duties and taxes are the responsibility of the recipient and are not included in the order total.',
      },
      {
        q: 'Order cut-off times',
        a: 'Orders placed Monday – Friday before 2 PM AST are processed the same day. Orders placed on weekends or public holidays are processed the next business day.',
      },
    ],
  },
  {
    id: 'returns',
    icon: RotateCcw,
    title: 'Returns & Exchanges',
    items: [
      {
        q: 'Return policy',
        a: 'We accept returns within 30 days of delivery. Items must be unused, in original packaging, with all tags attached. Fragrances must be sealed and unopened to be eligible for return.',
      },
      {
        q: 'How to initiate a return',
        a: 'Contact our support team with your order number and reason for return. We will issue a prepaid return label within 24 hours. Refunds are processed within 5–7 business days of receiving the item.',
      },
      {
        q: 'Exchanges',
        a: 'To exchange an item for a different size or variant, return the original item and place a new order. This ensures the fastest turnaround and guarantees stock availability.',
      },
      {
        q: 'Non-returnable items',
        a: 'Opened fragrances, personalised items, and items marked as Final Sale are not eligible for return or exchange.',
      },
    ],
  },
  {
    id: 'contact',
    icon: Mail,
    title: 'Contact Us',
    items: [
      {
        q: 'Email Support',
        a: 'support@fashionstore.com — We respond to all enquiries within 24 hours, Monday to Friday.',
      },
      {
        q: 'WhatsApp',
        a: 'Chat with us directly via the WhatsApp button on the bottom right of every page. Available Saturday – Thursday, 9 AM – 9 PM (AST).',
      },
      {
        q: 'Business Enquiries',
        a: 'For wholesale, press, or partnership enquiries, please email business@fashionstore.com with your company details and we will be in touch within 48 hours.',
      },
    ],
  },
  {
    id: 'track',
    icon: Package,
    title: 'Track Your Order',
    items: [
      {
        q: 'How to track your order',
        a: 'Once your order ships, you will receive an email with a tracking number. You can also view your full order history and live status in your Account page under the "Orders" tab.',
      },
      {
        q: 'My tracking shows no updates',
        a: 'Tracking information can take up to 12 hours to appear after your order is dispatched. If you still see no updates after 24 hours, please contact our support team with your order number.',
      },
      {
        q: 'My order shows "Delivered" but I have not received it',
        a: 'Please check with neighbours or your building reception first. If the package is still missing, contact us within 48 hours of the delivery date and we will open an investigation with the courier.',
      },
    ],
  },
]

function Accordion({ items }) {
  const [open, setOpen] = useState(null)
  return (
    <div className="divide-y divide-stone-800">
      {items.map((item, i) => (
        <div key={i}>
          <button
            onClick={() => setOpen(open === i ? null : i)}
            className="w-full flex items-center justify-between py-5 text-left gap-4"
          >
            <span className="text-sm font-body text-stone-200 font-medium leading-snug">{item.q}</span>
            <ChevronDown
              size={16}
              className={`flex-shrink-0 text-brand-400 transition-transform duration-300 ${open === i ? 'rotate-180' : ''}`}
            />
          </button>
          <AnimatePresence initial={false}>
            {open === i && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.25, ease: 'easeInOut' }}
                className="overflow-hidden"
              >
                <p className="text-sm font-body text-stone-400 leading-relaxed pb-5 pr-8">{item.a}</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      ))}
    </div>
  )
}

export default function Support() {
  const { hash } = useLocation()

  useSEO({
    title: 'Support',
    description: 'FAQs, shipping information, returns policy, and contact details for Fashion Store.',
  })

  useEffect(() => {
    if (hash) {
      const el = document.getElementById(hash.replace('#', ''))
      if (el) setTimeout(() => el.scrollIntoView({ behavior: 'smooth', block: 'start' }), 300)
    }
  }, [hash])

  return (
    <div className="bg-stone-950 dark:bg-black min-h-screen">
      {/* Hero */}
      <div dir="ltr" className="relative h-44 md:h-56 bg-stone-950 dark:bg-black overflow-hidden flex items-center">
        <div className="absolute inset-0 opacity-10"
          style={{ backgroundImage: 'radial-gradient(circle, #c8861e 1px, transparent 1px)', backgroundSize: '20px 20px' }}
        />
        <div className="relative px-6 md:px-16 max-w-4xl mx-auto w-full">
          <div className="flex items-center gap-2 mb-3 text-[10px] font-body uppercase tracking-[0.25em]">
            <Link to="/" className="text-white/40 hover:text-brand-400 transition-colors">Home</Link>
            <span className="text-white/20">/</span>
            <span className="text-brand-400/70">Support</span>
          </div>
          <h1 className="font-serif font-light text-3xl md:text-4xl text-white">How can we help?</h1>
        </div>
      </div>

      {/* Sections */}
      <div className="max-w-4xl mx-auto px-6 md:px-16 py-16 space-y-16">
        {SECTIONS.map(({ id, icon: Icon, title, items }) => (
          <section key={id} id={id} className="scroll-mt-24">
            <div className="flex items-center gap-3 mb-6">
              <Icon size={18} className="text-brand-400 flex-shrink-0" />
              <h2 className="font-serif font-light text-xl text-white">{title}</h2>
            </div>
            <div className="h-px bg-stone-800 mb-2" />
            <Accordion items={items} />
          </section>
        ))}

        {/* CTA */}
        <div className="border border-stone-800 p-8 text-center">
          <MessageCircle size={24} className="text-brand-400 mx-auto mb-4" />
          <h3 className="font-serif font-light text-lg text-white mb-2">Still need help?</h3>
          <p className="text-sm font-body text-stone-400 mb-6">Our team is available Saturday – Thursday, 9 AM – 9 PM (AST).</p>
          <a
            href={`https://wa.me/${import.meta.env.VITE_WHATSAPP_NUMBER || '966500000000'}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-brand-500 hover:bg-brand-400 text-white text-xs font-body font-semibold uppercase tracking-[0.15em] px-6 py-3 transition-colors"
          >
            <MessageCircle size={14} />
            Chat on WhatsApp
          </a>
        </div>
      </div>
    </div>
  )
}
