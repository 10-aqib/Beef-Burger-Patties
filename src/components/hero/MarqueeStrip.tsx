import React from 'react'

const MARQUEE_ITEMS = [
  'FRESHLY SMASHED BEEF',
  '✦',
  'CRISPY LACE CRUST',
  '✦',
  'POTATO BRIOCHE',
  '✦',
  'SECRET SMASH SAUCE',
  '✦',
  '100% HALAL',
  '✦',
  '450°F CAST IRON',
  '✦',
  'HOT DELIVERY',
  '✦',
  'ZERO FROZEN PATTIES',
  '✦',
  'SMASHED TO ORDER',
  '✦',
]

export default function MarqueeStrip() {
  return (
    <section
      id="marquee"
      className="relative w-full overflow-hidden py-3.5"
      style={{
        background: '#FF3B1F',
        boxShadow: 'inset 0 -2px 0 rgba(0,0,0,0.2)',
      }}
      aria-label="Paput Burgers brand highlights"
    >
      <div
        className="flex whitespace-nowrap gap-8"
        style={{ animation: 'marquee 28s linear infinite' }}
        aria-hidden="true"
      >
        {/* Duplicate for seamless loop */}
        {[...MARQUEE_ITEMS, ...MARQUEE_ITEMS].map((item, idx) => (
          <span
            key={idx}
            className={`font-display font-bold uppercase tracking-widest ${
              item === '✦'
                ? 'text-[rgba(255,255,255,0.5)] text-xs'
                : 'text-white text-headline-sm'
            }`}
            style={{ fontSize: item === '✦' ? '12px' : '14px', letterSpacing: '0.1em' }}
          >
            {item}
          </span>
        ))}
      </div>

      {/* Screen reader accessible version */}
      <div className="sr-only">
        {MARQUEE_ITEMS.filter((i) => i !== '✦').join(', ')}
      </div>
    </section>
  )
}
