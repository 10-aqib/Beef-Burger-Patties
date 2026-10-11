import React, { useRef, useState, useEffect } from 'react'
import { motion, useInView, AnimatePresence } from 'framer-motion'
import { Star, Quote, Plus, X } from 'lucide-react'
import { getApprovedReviews, submitCustomerReview } from '@/services/reviewService'
import { formatDate, getInitials } from '@/utils'
import { useOverlayA11y } from '@/hooks/useOverlayA11y'
import type { Review } from '@/types'
import toast from 'react-hot-toast'

export default function ReviewsSection() {
  const headingRef = useRef<HTMLDivElement>(null)
  const inView = useInView(headingRef, { once: true, margin: '-60px' })

  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const modalRef = useRef<HTMLDivElement>(null)

  useOverlayA11y({
    isOpen: modalOpen,
    onClose: () => setModalOpen(false),
    containerRef: modalRef,
  })

  // Review form
  const [authorName, setAuthorName] = useState('')
  const [rating, setRating] = useState(5)
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    getApprovedReviews().then((data) => {
      setReviews(data)
      setLoading(false)
    })
  }, [])

  async function handleSubmitReview(e: React.FormEvent) {
    e.preventDefault()
    if (!authorName.trim() || !body.trim()) {
      toast.error('Please provide your name and review.')
      return
    }

    setSubmitting(true)
    const res = await submitCustomerReview({
      authorName,
      rating,
      title,
      body,
    })
    setSubmitting(false)

    if (res.success) {
      toast.success('Thank you! Your review has been submitted for moderation.')
      setModalOpen(false)
      setAuthorName('')
      setTitle('')
      setBody('')
      // Refresh reviews
      getApprovedReviews().then(setReviews)
    } else {
      toast.error(res.error || 'Failed to submit review.')
    }
  }

  return (
    <section
      id="reviews"
      className="w-full section-padding"
      style={{ background: '#0D0D0D' }}
      aria-labelledby="reviews-heading"
    >
      <div className="container-max">
        {/* Header */}
        <div ref={headingRef} className="flex flex-col md:flex-row md:items-end justify-between mb-12 lg:mb-16 gap-6">
          <div>
            <motion.div
              className="flex items-center gap-2 mb-3"
              initial={{ opacity: 0, x: -20 }}
              animate={inView ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.5 }}
            >
              <span className="w-2 h-2 rounded-full bg-[#F59E0B]" />
              <span
                className="font-display font-bold uppercase tracking-widest text-[#F59E0B]"
                style={{ fontSize: '11px', letterSpacing: '0.1em' }}
              >
                CUSTOMER FEEDBACK
              </span>
            </motion.div>
            <motion.h2
              id="reviews-heading"
              className="text-headline-lg text-white uppercase font-display font-bold leading-tight"
              initial={{ opacity: 0, y: 20 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              WHAT CUSTOMERS
              <br />
              ARE SAYING
            </motion.h2>
          </div>

          <button
            onClick={() => setModalOpen(true)}
            className="btn-secondary self-start md:self-auto text-label-md px-5 py-2.5 flex items-center gap-2"
          >
            <Plus className="w-4 h-4 text-[#FF3B1F]" />
            <span>WRITE A REVIEW</span>
          </button>
        </div>

        {/* Review cards */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {[1, 2, 3].map((i) => (
              <div key={i} className="card p-6 h-56 animate-pulse bg-[#171717]" />
            ))}
          </div>
        ) : reviews.length === 0 ? (
          <div className="card p-10 text-center max-w-xl mx-auto border border-dashed border-[#2A2A2A]">
            <div className="w-12 h-12 rounded-full bg-[#1C1B1B] border border-[#2A2A2A] flex items-center justify-center mx-auto mb-4 text-[#F59E0B]">
              <Star className="w-6 h-6" />
            </div>
            <h3 className="text-headline-sm font-display font-bold text-white uppercase mb-2">
              SHARE YOUR EXPERIENCE
            </h3>
            <p className="text-body-sm text-[#A3A3A3] mb-6">
              Have you ordered from Paput Burgers? Leave an honest review and let our community know about your experience.
            </p>
            <button
              onClick={() => setModalOpen(true)}
              className="btn-primary text-label-md px-6 py-2.5 inline-flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              LEAVE A REVIEW
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {reviews.map((review, idx) => (
              <ReviewCard key={review.id} review={review} index={idx} />
            ))}
          </div>
        )}
      </div>

      {/* Review Modal */}
      <AnimatePresence>
        {modalOpen && (
          <>
            <motion.div
              className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[70]"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setModalOpen(false)}
              aria-hidden="true"
            />

            <motion.div
              ref={modalRef}
              tabIndex={-1}
              role="dialog"
              aria-modal="true"
              aria-labelledby="review-modal-title"
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md px-4 z-[80]"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
            >
              <div className="card p-6 shadow-2xl bg-[#121212] border border-[#2A2A2A]">
                <div className="flex items-center justify-between pb-3 border-b border-[#2A2A2A] mb-4">
                  <h3
                    id="review-modal-title"
                    className="text-headline-sm font-display font-bold text-white uppercase"
                  >
                    LEAVE A REVIEW
                  </h3>
                  <button onClick={() => setModalOpen(false)} className="text-[#737373] hover:text-white">
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <form onSubmit={handleSubmitReview} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-[#A3A3A3] uppercase mb-1">
                      Your Name *
                    </label>
                    <input
                      type="text"
                      required
                      className="input text-xs"
                      placeholder="e.g. Daniyal Tariq"
                      value={authorName}
                      onChange={(e) => setAuthorName(e.target.value)}
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#A3A3A3] uppercase mb-1">
                      Rating *
                    </label>
                    <div className="flex items-center gap-2">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <button
                          key={s}
                          type="button"
                          onClick={() => setRating(s)}
                          className="p-1 text-[#F59E0B]"
                        >
                          <Star
                            className="w-6 h-6"
                            fill={s <= rating ? '#F59E0B' : 'transparent'}
                            stroke="#F59E0B"
                          />
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#A3A3A3] uppercase mb-1">
                      Headline (Optional)
                    </label>
                    <input
                      type="text"
                      className="input text-xs"
                      placeholder="e.g. The crust on the OG Double is unmatched!"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#A3A3A3] uppercase mb-1">
                      Your Review *
                    </label>
                    <textarea
                      required
                      rows={3}
                      className="input text-xs resize-none"
                      placeholder="Tell Pakistan about your experience with our smash burgers..."
                      value={body}
                      onChange={(e) => setBody(e.target.value)}
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={submitting}
                    className="btn-primary w-full py-3 text-label-md"
                  >
                    {submitting ? 'SUBMITTING...' : 'SUBMIT REVIEW'}
                  </button>
                </form>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </section>
  )
}

function ReviewCard({ review, index }: { review: Review; index: number }) {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: '-40px' })

  const author = review.profile?.full_name || review.author_name || 'Anonymous'
  const initials = getInitials(author)
  const colors = ['#FF3B1F', '#F59E0B', '#A3A3A3']
  const avatarColor = colors[index % colors.length]

  return (
    <motion.div
      ref={ref}
      className="card p-5 flex flex-col gap-4"
      initial={{ opacity: 0, y: 30 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, delay: index * 0.1, ease: [0.16, 1, 0.3, 1] }}
    >
      <Quote className="w-6 h-6 text-[#2A2A2A]" />

      <div className="flex items-center gap-0.5" aria-label={`${review.rating} out of 5 stars`}>
        {Array.from({ length: 5 }).map((_, i) => (
          <Star
            key={i}
            className="w-3.5 h-3.5"
            style={{
              fill: i < review.rating ? '#F59E0B' : 'transparent',
              color: i < review.rating ? '#F59E0B' : '#383838',
            }}
          />
        ))}
      </div>

      <div>
        {review.title && (
          <h4
            className="font-display font-bold text-white mb-1.5"
            style={{ fontSize: '14px', letterSpacing: '-0.01em' }}
          >
            {review.title}
          </h4>
        )}
        <p className="text-body-sm text-[#A3A3A3] leading-relaxed">"{review.body}"</p>
      </div>

      <div className="flex items-center gap-3 pt-2 mt-auto" style={{ borderTop: '1px solid #2A2A2A' }}>
        <div
          className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 font-display font-bold text-white"
          style={{ background: avatarColor, fontSize: '12px' }}
        >
          {initials}
        </div>
        <div>
          <div
            className="font-display font-bold text-white uppercase"
            style={{ fontSize: '11px', letterSpacing: '0.04em' }}
          >
            {author}
          </div>
          <div className="text-body-sm text-[#737373]" style={{ fontSize: '11px' }}>
            {formatDate(review.created_at)}
          </div>
        </div>
        <div className="ml-auto">
          <span className="badge badge-dark text-[9px]">CUSTOMER REVIEW</span>
        </div>
      </div>
    </motion.div>
  )
}
