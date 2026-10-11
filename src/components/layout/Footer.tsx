import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { Flame, MapPin, Phone, Mail, Send, CheckCircle } from 'lucide-react'
import { subscribeNewsletter } from '@/services/newsletterService'
import toast from 'react-hot-toast'

const InstagramIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect width="20" height="20" x="2" y="2" rx="5" ry="5"/>
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/>
  </svg>
)

const FacebookIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>
  </svg>
)

const TwitterIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 4l11.733 16h4.267l-11.733 -16z"/>
    <path d="M4 20l6.768 -6.768m2.46 -2.46l6.772 -6.772"/>
  </svg>
)

export default function Footer() {
  const year = new Date().getFullYear()
  const [email, setEmail] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [subscribed, setSubscribed] = useState(false)

  async function handleSubscribe(e: React.FormEvent) {
    e.preventDefault()
    if (!email || !email.includes('@')) {
      toast.error('Please enter a valid email address')
      return
    }

    setSubmitting(true)
    const res = await subscribeNewsletter(email)
    setSubmitting(false)

    if (res.success) {
      setSubscribed(true)
      toast.success(res.message)
    } else {
      toast.error(res.message)
    }
  }

  return (
    <footer
      className="w-full"
      style={{ background: '#090909', borderTop: '1px solid #1F1F1F' }}
      aria-label="Site footer"
    >
      {/* ─── VIP Newsletter Strip ───────────────────────── */}
      <div className="border-b border-[#1F1F1F] bg-[#111111] py-10">
        <div className="container-max flex flex-col lg:flex-row items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="w-2 h-2 rounded-full bg-[#FF3B1F] animate-pulse" />
              <span className="text-[11px] font-display font-bold uppercase tracking-widest text-[#FF3B1F]">
                SECRET FORGE DROPS
              </span>
            </div>
            <h3 className="text-headline-sm font-display font-bold text-white uppercase">
              VIP FLAVOR DISPATCH
            </h3>
            <p className="text-body-sm text-[#737373]">
              Be the first to unlock secret off-menu burger drops, midnight deals, and forge launches.
            </p>
          </div>

          {subscribed ? (
            <div className="flex items-center gap-2 text-[#34D399] font-display font-bold text-sm bg-[#171717] px-5 py-3 rounded-lg border border-[#34D399]/40">
              <CheckCircle className="w-4 h-4" />
              <span>YOU'RE ON THE VIP FORGE LIST!</span>
            </div>
          ) : (
            <form onSubmit={handleSubscribe} className="flex w-full lg:w-auto max-w-md gap-2">
              <input
                type="email"
                required
                placeholder="Enter your email..."
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input py-2.5 px-4 text-xs font-medium flex-1"
              />
              <button
                type="submit"
                disabled={submitting}
                className="btn-primary text-label-sm px-5 py-2.5 shrink-0 flex items-center gap-1.5"
              >
                <Send className="w-3.5 h-3.5" />
                <span>JOIN</span>
              </button>
            </form>
          )}
        </div>
      </div>

      {/* ─── Main Footer Columns ────────────────────────── */}
      <div className="container-max py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12 xl:gap-16 mb-14">
          {/* Brand column */}
          <div className="md:col-span-1">
            <Link to="/" className="flex items-center gap-2.5 mb-5" aria-label="Paput Burgers Home">
              <Flame className="w-6 h-6 text-[#FF3B1F]" />
              <div>
                <span
                  className="font-display font-black text-white uppercase block leading-tight text-lg"
                  style={{ letterSpacing: '-0.02em' }}
                >
                  PAPUT BURGERS
                </span>
                <span className="font-display text-[9px] font-bold text-[#FF3B1F] uppercase tracking-widest">
                  CRAFT BURGERS · PAKISTAN
                </span>
              </div>
            </Link>
            <p className="text-body-sm text-[#737373] mb-5 leading-relaxed">
              Paput Burgers — handcrafted smash burgers made with premium beef. Dual-pressed 100% Halal Angus
              beef on a 450°F cast iron slab.
            </p>
            <div className="flex items-center gap-3">
              {[
                { icon: InstagramIcon, href: 'https://instagram.com/paputburgerspk', label: 'Instagram' },
                { icon: FacebookIcon, href: 'https://facebook.com/paputburgerspk', label: 'Facebook' },
                { icon: TwitterIcon, href: 'https://twitter.com/paputburgerspk', label: 'Twitter/X' },
              ].map(({ icon: Icon, href, label }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-8 h-8 rounded flex items-center justify-center bg-[#171717] text-[#737373] hover:text-[#FF3B1F] hover:bg-[#1F1F1F] transition-colors"
                  aria-label={label}
                >
                  <Icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Menu links */}
          <div>
            <h4 className="text-label-sm text-white uppercase mb-4 tracking-widest font-display font-bold">
              Menu & Combos
            </h4>
            <ul className="space-y-2.5">
              {[
                { label: 'All Smash Burgers', path: '/menu' },
                { label: 'Nashville Chicken', path: '/menu' },
                { label: 'Animal Loaded Fries', path: '/menu' },
                { label: 'Limited Time Deals', path: '/deals' },
                { label: 'Live Order Radar', path: '/order-tracking' },
              ].map((item) => (
                <li key={item.label}>
                  <Link
                    to={item.path}
                    className="text-body-sm text-[#737373] hover:text-white transition-colors"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company links */}
          <div>
            <h4 className="text-label-sm text-white uppercase mb-4 tracking-widest font-display font-bold">
              Brand & Forges
            </h4>
            <ul className="space-y-2.5">
              {[
                { label: 'About Paput Burgers', path: '/about' },
                { label: 'All Locations & Maps', path: '/locations' },
                { label: 'Contact & Catering', path: '/contact' },
                { label: 'Kitchen Admin', path: '/admin' },
              ].map(({ label, path }) => (
                <li key={label}>
                  <Link
                    to={path}
                    className="text-body-sm text-[#737373] hover:text-white transition-colors"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-label-sm text-white uppercase mb-4 tracking-widest font-display font-bold">
              Flagship Contact
            </h4>
            <ul className="space-y-3">
              <li className="flex items-start gap-2.5 text-body-sm text-[#737373]">
                <MapPin className="w-4 h-4 text-[#FF3B1F] mt-0.5 shrink-0" />
                <span>Shop 4, Block B, F-7 Markaz, Islamabad</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-[#A3A3A3] shrink-0" />
                <a
                  href="tel:+925188447624"
                  className="text-body-sm text-[#737373] hover:text-white transition-colors"
                >
                  +92 (51) 884-7624
                </a>
              </li>
              <li className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-[#A3A3A3] shrink-0" />
                <a
                  href="mailto:hello@paputburgers.pk"
                  className="text-body-sm text-[#737373] hover:text-white transition-colors"
                >
                  hello@paputburgers.pk
                </a>
              </li>
            </ul>

            {/* Halal certification */}
            <div
              className="mt-5 inline-flex items-center gap-2 px-3 py-2 rounded text-body-sm"
              style={{ background: '#171717', border: '1px solid #2A2A2A' }}
            >
              <span className="text-[#34D399] font-bold" style={{ fontSize: '10px' }}>✓</span>
              <span className="font-display font-bold text-white uppercase" style={{ fontSize: '10px', letterSpacing: '0.08em' }}>
                100% Halal Angus Certified
              </span>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div
          className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-6"
          style={{ borderTop: '1px solid #1F1F1F' }}
        >
          <p className="text-body-sm text-[#525252] text-center sm:text-left">
            © {year} Paput Burgers Pakistan. All rights reserved. Sizzling raw-to-order.
          </p>
          <div className="flex items-center gap-4">
            <Link to="/about" className="text-body-sm text-[#525252] hover:text-[#737373] transition-colors">
              Story
            </Link>
            <Link to="/locations" className="text-body-sm text-[#525252] hover:text-[#737373] transition-colors">
              Locations
            </Link>
            <Link to="/contact" className="text-body-sm text-[#525252] hover:text-[#737373] transition-colors">
              Contact
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
