import React, { useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import { ShoppingBag } from 'lucide-react'
import { formatPrice } from '@/utils'
import { SEED_DEALS } from '@/lib/seedData'
import toast from 'react-hot-toast'

export default function DealsSection() {
  const headingRef = useRef<HTMLDivElement>(null)
  const inView = useInView(headingRef, { once: true, margin: '-60px' })

  return (
    <section
      id="deals"
      className="w-full section-padding"
      style={{ background: '#0D0D0D' }}
      aria-labelledby="deals-heading"
    >
      <div className="container-max">
        {/* Section header */}
        <div ref={headingRef} className="mb-12 lg:mb-16">
          <motion.div
            className="flex items-center gap-2 mb-3"
            initial={{ opacity: 0, x: -20 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.5 }}
          >
            <span className="w-2 h-2 rounded-full bg-[#FF3B1F]" />
            <span
              className="font-display font-bold uppercase tracking-widest text-[#FF3B1F]"
              style={{ fontSize: '11px', letterSpacing: '0.1em' }}
            >
              DAILY VALUE DROPS
            </span>
          </motion.div>
          <motion.h2
            id="deals-heading"
            className="text-headline-lg text-white uppercase leading-tight"
            initial={{ opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            DEALS THAT HIT
            <br />
            DIFFERENT
          </motion.h2>
        </div>

        {/* Deals grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {SEED_DEALS.map((deal, idx) => (
            <DealCard key={deal.id} deal={deal} index={idx} />
          ))}
        </div>
      </div>
    </section>
  )
}

function DealCard({ deal, index }: { deal: typeof SEED_DEALS[0]; index: number }) {
  const cardRef = useRef<HTMLDivElement>(null)
  const inView = useInView(cardRef, { once: true, margin: '-40px' })

  return (
    <motion.div
      ref={cardRef}
      className="card flex flex-col h-full overflow-hidden group cursor-pointer"
      initial={{ opacity: 0, y: 30 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, delay: index * 0.1, ease: [0.16, 1, 0.3, 1] }}
      whileHover={{ borderColor: '#FF3B1F', transition: { duration: 0.2 } }}
    >
      {/* Deal image with responsive aspect ratio */}
      <div className="relative overflow-hidden aspect-[16/10] w-full">
        {deal.image_url && (
          <img
            src={deal.image_url}
            alt={deal.name}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
            onError={(e) => {
              e.currentTarget.onerror = null
              e.currentTarget.src = '/images/family-feast.jpg'
            }}
          />
        )}
        <div
          className="absolute inset-0"
          style={{ background: 'linear-gradient(to top, rgba(23,23,23,1) 0%, rgba(23,23,23,0.5) 50%, transparent 100%)' }}
        />
        {deal.badge && (
          <div className="absolute top-3 left-3 badge badge-red">
            {deal.badge}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-5 flex flex-col flex-1 gap-4">
        <div>
          <h3
            className="font-display font-bold text-white uppercase mb-1.5"
            style={{ fontSize: '15px', letterSpacing: '-0.01em' }}
          >
            {deal.name}
          </h3>
          <p className="text-body-sm text-[#A3A3A3] mb-3">{deal.description}</p>

          {/* Items list */}
          <div className="space-y-1">
            {deal.items_description.split('\n').map((line, i) => (
              <div key={i} className="flex items-start gap-1.5 text-body-sm text-[#737373]">
                <span className="text-[#F59E0B] mt-0.5 shrink-0">·</span>
                <span>{line.replace('• ', '')}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Pricing */}
        <div className="mt-auto">
          <div className="flex items-end gap-2 mb-3">
            <span
              className="font-display font-bold text-[#F59E0B]"
              style={{ fontSize: '24px', letterSpacing: '-0.02em' }}
            >
              {formatPrice(deal.price)}
            </span>
            <span className="text-body-sm text-[#737373] line-through pb-1">
              {formatPrice(deal.original_price)}
            </span>
            <span className="badge badge-amber ml-auto">
              SAVE {deal.discount_percentage}%
            </span>
          </div>

          <button
            className="btn-primary w-full py-3 text-label-md justify-center gap-2"
            onClick={() => {
              toast('Deals are added to cart as a set — visit menu to customize!', {
                icon: '🎁',
                style: {
                  background: '#1F1F1F',
                  color: '#fff',
                  border: '1px solid #2A2A2A',
                  fontFamily: 'Space Grotesk',
                  fontWeight: 600,
                  fontSize: '12px',
                },
                duration: 3000,
              })
            }}
          >
            <ShoppingBag className="w-4 h-4" />
            ORDER THIS DEAL
          </button>
        </div>
      </div>
    </motion.div>
  )
}
