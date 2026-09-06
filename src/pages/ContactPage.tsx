import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { MapPin, Phone, Mail, Clock, Send, CheckCircle, MessageSquare } from 'lucide-react'
import toast from 'react-hot-toast'

export default function ContactPage() {
  useEffect(() => {
    window.scrollTo(0, 0)
    document.title = 'Contact | Beef Burger Patties'
  }, [])

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [subject, setSubject] = useState('General Feedback')
  const [message, setMessage] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim() || !email.trim() || !message.trim()) {
      toast.error('Please fill in all required fields.')
      return
    }

    setSubmitting(true)
    await new Promise((r) => setTimeout(r, 600))
    setSubmitting(false)
    setSubmitted(true)
    toast.success('Your message has been dispatched to our management team!')
  }

  return (
    <main className="min-h-screen pt-28 pb-20" style={{ background: '#080808' }}>
      <div className="container-max max-w-6xl">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <motion.div
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full mb-4"
            style={{ background: 'rgba(255, 59, 31, 0.1)', border: '1px solid rgba(255, 59, 31, 0.3)' }}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <MessageSquare className="w-3.5 h-3.5 text-[#FF3B1F]" />
            <span className="text-[11px] font-display font-bold uppercase tracking-widest text-[#FF3B1F]">
              GET IN TOUCH
            </span>
          </motion.div>

          <motion.h1
            className="text-display-hero-mobile sm:text-headline-lg font-display font-bold text-white uppercase tracking-tight mb-4 leading-tight"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            CONTACT <span className="text-[#FF3B1F]">BEEF BURGER PATTIES.</span>
          </motion.h1>

          <motion.p
            className="text-body-md text-[#A3A3A3]"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            Questions, catering for events, corporate inquiries, or franchise partnerships — reach out to our team.
          </motion.p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
          {/* Info Card */}
          <div className="lg:col-span-5 space-y-6">
            <div className="card p-6 space-y-6">
              <h2 className="text-headline-sm font-display font-bold text-white uppercase">
                DIRECT CHANNELS
              </h2>

              <div className="space-y-4">
                <div className="flex items-start gap-3 text-body-sm text-[#A3A3A3]">
                  <MapPin className="w-5 h-5 text-[#FF3B1F] shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-white block font-display">FLAGSHIP FORGE:</strong>
                    <span>Shop 4, Block B, F-7 Markaz, Islamabad</span>
                  </div>
                </div>

                <div className="flex items-start gap-3 text-body-sm text-[#A3A3A3]">
                  <Phone className="w-5 h-5 text-[#F59E0B] shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-white block font-display">PHONE / WHATSAPP:</strong>
                    <a href="tel:+925188447624" className="hover:text-white transition-colors">
                      +92 (51) 884-7624
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-3 text-body-sm text-[#A3A3A3]">
                  <Mail className="w-5 h-5 text-[#FF3B1F] shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-white block font-display">EMAIL:</strong>
                    <a href="mailto:hello@beefburgerpatties.pk" className="hover:text-white transition-colors">
                      hello@beefburgerpatties.pk
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-3 text-body-sm text-[#A3A3A3]">
                  <Clock className="w-5 h-5 text-[#A3A3A3] shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-white block font-display">OPERATING HOURS:</strong>
                    <span>12:00 PM – 03:00 AM (Mon - Sun)</span>
                  </div>
                </div>
              </div>

              <div className="p-4 rounded bg-[#171717] border border-[#2A2A2A]">
                <span className="text-[10px] font-bold text-[#34D399] uppercase tracking-wider block mb-1">
                  100% CERTIFIED HALAL
                </span>
                <p className="text-body-sm text-[#737373]">
                  All beef is prime Halal Angus procured daily with strict health and safety audits.
                </p>
              </div>
            </div>
          </div>

          {/* Form */}
          <div className="lg:col-span-7">
            <div className="card p-6 sm:p-8">
              {submitted ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 rounded-full bg-[rgba(52,211,153,0.1)] border border-[#34D399] flex items-center justify-center mx-auto mb-4 text-[#34D399]">
                    <CheckCircle className="w-8 h-8" />
                  </div>
                  <h3 className="text-headline-sm text-white font-display font-bold uppercase mb-2">
                    MESSAGE DISPATCHED!
                  </h3>
                  <p className="text-body-md text-[#A3A3A3] mb-6">
                    Thank you {name}. A member of our team will get back to you within 24 hours.
                  </p>
                  <button
                    onClick={() => {
                      setSubmitted(false)
                      setName('')
                      setEmail('')
                      setMessage('')
                    }}
                    className="btn-secondary text-label-md px-6 py-2.5"
                  >
                    SEND ANOTHER MESSAGE
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <h2 className="text-headline-sm font-display font-bold text-white uppercase mb-4">
                    DISPATCH A MESSAGE
                  </h2>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-label-sm text-[#A3A3A3] uppercase mb-1.5">
                        Your Name *
                      </label>
                      <input
                        type="text"
                        required
                        className="input"
                        placeholder="Ahmed Khan"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="block text-label-sm text-[#A3A3A3] uppercase mb-1.5">
                        Email Address *
                      </label>
                      <input
                        type="email"
                        required
                        className="input"
                        placeholder="ahmed@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-label-sm text-[#A3A3A3] uppercase mb-1.5">
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        className="input"
                        placeholder="0300-1234567"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="block text-label-sm text-[#A3A3A3] uppercase mb-1.5">
                        Subject
                      </label>
                      <select
                        className="input"
                        value={subject}
                        onChange={(e) => setSubject(e.target.value)}
                      >
                        <option value="General Feedback">General Feedback</option>
                        <option value="Event Catering">Event Catering / Live Station</option>
                        <option value="Franchise Opportunity">Franchise Opportunity</option>
                        <option value="Careers">Careers / Join Kitchen</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-label-sm text-[#A3A3A3] uppercase mb-1.5">
                      Message *
                    </label>
                    <textarea
                      required
                      rows={5}
                      className="input resize-none"
                      placeholder="Tell us what's on your mind..."
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                    />
                  </div>

                  <button
                    type="submit"
                    className="btn-primary w-full py-3 text-label-md flex items-center justify-center gap-2"
                  >
                    <Send className="w-4 h-4" />
                    SEND DISPATCH
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
