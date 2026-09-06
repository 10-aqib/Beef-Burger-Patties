import React, { useState, useRef } from 'react'
import { motion, useInView, AnimatePresence } from 'framer-motion'

const LAYERS = [
  {
    id: 'crown',
    name: 'Butter-Griddled Potato Brioche Crown',
    detail: 'Baked fresh daily. Brushed in clarified butter then toasted on the same slab. Golden, pillowy, never soggy.',
    color: '#D4845A',
    offset: 0,
    height: 40,
  },
  {
    id: 'sauce-top',
    name: 'Signature Smash Sauce',
    detail: 'House-churned emulsion of smoked paprika, house dill pickled jalapeños, roasted garlic cream and black pepper brine.',
    color: '#F59E0B',
    offset: 36,
    height: 14,
  },
  {
    id: 'pickles',
    name: 'Thick-Cut Dill Pickles',
    detail: 'Crinkle-cut from our house brine recipe. A sharp, acidic counterpoint to the fat from the double patties.',
    color: '#4D7C0F',
    offset: 47,
    height: 10,
  },
  {
    id: 'cheese',
    name: 'Molten Aged Wisconsin Cheddar',
    detail: 'Two slices of aged Wisconsin cheddar are placed on the hot patty seconds after smash. Full melt, zero cold spots.',
    color: '#FCD34D',
    offset: 54,
    height: 14,
  },
  {
    id: 'patty-2',
    name: '2nd Smash Patty (Halal Angus)',
    detail: 'A second 80g ball of 100% Halal Prime Angus beef smashed directly onto the first patty to create the double lace crust.',
    color: '#6B2C00',
    offset: 65,
    height: 24,
  },
  {
    id: 'patty-1',
    name: '1st Smash Patty + Lace Crust',
    detail: 'The first 80g patty pressed hard with the smash weight. The fat escapes the edges forming the iconic crispy Maillard lace crust.',
    color: '#4A1900',
    offset: 85,
    height: 24,
  },
  {
    id: 'onion',
    name: 'Caramelized Onion Jam',
    detail: 'Sweet white onions slow-cooked in butter for 40 minutes then deglazed with balsamic. Applied beneath the patty so it caramelizes into the steel.',
    color: '#78350F',
    offset: 105,
    height: 14,
  },
  {
    id: 'heel',
    name: 'Butter-Griddled Potato Brioche Heel',
    detail: 'The base bun is buttered and griddled after the crown. The bottom half is slightly thicker to absorb sauce without collapsing.',
    color: '#D4845A',
    offset: 116,
    height: 36,
  },
]

export default function AnatomySection() {
  const [activeLayer, setActiveLayer] = useState<string | null>(null)
  const sectionRef = useRef<HTMLElement>(null)
  const inView = useInView(sectionRef, { once: true, margin: '-80px' })

  const active = LAYERS.find((l) => l.id === activeLayer)

  return (
    <section
      ref={sectionRef}
      id="about"
      className="w-full section-padding"
      style={{ background: '#0D0D0D' }}
      aria-labelledby="anatomy-heading"
    >
      <div className="container-max">
        {/* ─── Desktop 3-Column / Laptop 2-Column / Mobile Stacked Layout ─── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 xl:gap-12 items-center">
          {/* ─── Left Column: Title, Narrative & Key Specs (cols: 4 on lg/xl) ─── */}
          <div className="lg:col-span-5 xl:col-span-4 flex flex-col justify-center">
            <motion.div
              className="flex items-center gap-2 mb-3"
              initial={{ opacity: 0, x: -20 }}
              animate={inView ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.5 }}
            >
              <span className="w-2 h-2 rounded-full bg-[#FF3B1F] animate-pulse" />
              <span
                className="font-display font-bold uppercase tracking-widest text-[#FF3B1F]"
                style={{ fontSize: '11px', letterSpacing: '0.12em' }}
              >
                DISSECTED EXCELLENCE
              </span>
            </motion.div>

            <motion.h2
              id="anatomy-heading"
              className="text-headline-lg text-white uppercase leading-tight mb-4"
              initial={{ opacity: 0, y: 20 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              THE ANATOMY OF
              <br />
              <span className="text-[#FF3B1F]">A CRAFT SMASH.</span>
            </motion.h2>

            <motion.p
              className="text-body-md text-[#A3A3A3] mb-6 leading-relaxed text-sm sm:text-base"
              initial={{ opacity: 0, y: 20 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              Every element in our signature burger is calibrated for maximum thermal conductivity,
              fat caramelization, and textural contrast. Deconstruct each layer to uncover the forge science.
            </motion.p>

            {/* High-Temp Specs Grid */}
            <motion.div
              className="grid grid-cols-2 gap-3 sm:gap-4"
              initial={{ opacity: 0, y: 20 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              {[
                { label: 'PATTY SIZE', value: '2×80g', desc: 'Prime Angus' },
                { label: 'IRON TEMP', value: '450°F', desc: 'Seasoned Steel' },
                { label: 'SEAR TIME', value: '90 SEC', desc: 'High Heat' },
                { label: 'LACE CRUST', value: 'MAILLARD', desc: 'Caramelized' },
              ].map((stat) => (
                <div
                  key={stat.label}
                  className="card p-3 sm:p-4 text-left border border-[#222] bg-[#141414]/90 hover:border-[#FF3B1F]/40 transition-colors"
                >
                  <div
                    className="font-display font-black text-[#FF3B1F] mb-0.5 text-lg sm:text-xl tracking-tight"
                  >
                    {stat.value}
                  </div>
                  <div className="text-[10px] sm:text-[11px] font-display font-bold text-white uppercase tracking-wider">
                    {stat.label}
                  </div>
                  <div className="text-[10px] text-[#737373] mt-0.5">
                    {stat.desc}
                  </div>
                </div>
              ))}
            </motion.div>
          </div>

          {/* ─── Center Column: Expanded Burger Visualizer (cols: 4 on xl, 7 on lg) ─── */}
          <div className="lg:col-span-7 xl:col-span-4 flex flex-col items-center justify-center my-4 lg:my-0">
            <motion.div
              className="relative w-full max-w-[420px] sm:max-w-[460px] flex flex-col items-center p-6 sm:p-8 rounded-xl bg-gradient-to-b from-[#141414] to-[#0A0A0A] border border-[#222] shadow-[0_12px_48px_rgba(0,0,0,0.6)]"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={inView ? { opacity: 1, scale: 1 } : {}}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              <div className="text-[11px] font-display font-bold uppercase tracking-widest text-[#737373] mb-6 flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#F59E0B]" />
                INTERACTIVE LAYER EXPLORER
              </div>

              {/* Slices container */}
              <div
                className="relative w-full"
                style={{ height: '240px' }}
                role="group"
                aria-label="Interactive burger layer diagram"
              >
                {LAYERS.map((layer, idx) => {
                  const isSelected = activeLayer === layer.id
                  const isDimmed = activeLayer !== null && !isSelected

                  return (
                    <motion.button
                      key={layer.id}
                      className="absolute left-0 w-full rounded cursor-pointer transition-all duration-200 group"
                      style={{
                        top: `${(layer.offset / 155) * 100}%`,
                        height: `${Math.max(14, (layer.height / 155) * 100)}%`,
                        background: layer.color,
                        opacity: isDimmed ? 0.3 : 1,
                        transform: isSelected ? 'scaleX(1.05) scaleY(1.08)' : 'scaleX(1)',
                        boxShadow: isSelected
                          ? `0 0 24px ${layer.color}90, inset 0 0 12px rgba(255,255,255,0.4)`
                          : '0 2px 8px rgba(0,0,0,0.4)',
                        zIndex: isSelected ? 30 : idx + 1,
                      }}
                      onClick={() => setActiveLayer(isSelected ? null : layer.id)}
                      onMouseEnter={() => setActiveLayer(layer.id)}
                      onMouseLeave={() => setActiveLayer(null)}
                      initial={{ scaleX: 0, originX: 0.5 }}
                      animate={inView ? { scaleX: 1 } : {}}
                      transition={{ duration: 0.4, delay: 0.2 + idx * 0.05 }}
                      aria-label={layer.name}
                      aria-pressed={isSelected}
                    >
                      <span className="sr-only">{layer.name}</span>
                    </motion.button>
                  )
                })}
              </div>

              <div className="mt-6 text-center">
                <span className="text-xs text-[#737373] font-medium">
                  Hover or tap any slice to inspect ingredient profiles
                </span>
              </div>
            </motion.div>
          </div>

          {/* ─── Right Column: Active Layer Detail & Selector Pills (cols: 4 on xl, 12 on lg) ─── */}
          <div className="lg:col-span-12 xl:col-span-4 flex flex-col justify-center">
            <motion.div
              className="card p-6 sm:p-7 border border-[#262626] bg-[#141414]/90 flex flex-col min-h-[340px] justify-between"
              initial={{ opacity: 0, x: 30 }}
              animate={inView ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.8, delay: 0.3 }}
            >
              <div>
                <AnimatePresence mode="wait">
                  {active ? (
                    <motion.div
                      key={active.id}
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -12 }}
                      transition={{ duration: 0.2 }}
                    >
                      <div className="flex items-center gap-2 mb-3">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ background: active.color, boxShadow: `0 0 12px ${active.color}` }}
                        />
                        <span className="text-label-sm font-display font-bold uppercase tracking-wider text-[#F59E0B]">
                          ACTIVE LAYER
                        </span>
                      </div>
                      <h3
                        className="font-display font-bold text-white uppercase mb-3 text-lg sm:text-xl tracking-tight leading-snug"
                      >
                        {active.name}
                      </h3>
                      <p className="text-body-md text-[#D1D1D1] leading-relaxed text-sm sm:text-base">
                        {active.detail}
                      </p>
                    </motion.div>
                  ) : (
                    <motion.div
                      key="idle"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <div className="flex items-center gap-2 mb-3 text-[#737373]">
                        <span className="w-2.5 h-2.5 rounded-full bg-[#FF3B1F]" />
                        <span className="text-label-sm font-display font-bold uppercase tracking-wider">
                          SELECT A LAYER
                        </span>
                      </div>
                      <h3 className="font-display font-bold text-white uppercase mb-3 text-lg sm:text-xl tracking-tight">
                        CRAFT ARCHITECTURE
                      </h3>
                      <p className="text-body-md text-[#A3A3A3] leading-relaxed text-sm sm:text-base">
                        Select any layer from the diagram or chips below to inspect how every component contributes to our legendary double lace crust and molten center.
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Layer Selector Chips */}
              <div className="mt-6 pt-5 border-t border-[#242424]">
                <div className="text-[11px] font-display font-bold uppercase tracking-wider text-[#737373] mb-3">
                  QUICK LAYER SELECTOR:
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {LAYERS.map((layer) => {
                    const isSelected = activeLayer === layer.id
                    return (
                      <button
                        key={layer.id}
                        onClick={() => setActiveLayer(isSelected ? null : layer.id)}
                        onMouseEnter={() => setActiveLayer(layer.id)}
                        className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-[11px] font-display uppercase tracking-wider transition-all ${
                          isSelected
                            ? 'bg-white text-black font-bold shadow-md'
                            : 'bg-[#1C1C1C] text-[#A3A3A3] hover:text-white hover:bg-[#252525] border border-[#2A2A2A]'
                        }`}
                      >
                        <span
                          className="w-2 h-2 rounded-full shrink-0"
                          style={{ background: layer.color }}
                        />
                        <span className="truncate max-w-[120px] sm:max-w-none">
                          {layer.name.split(' ')[0]}
                        </span>
                      </button>
                    )
                  })}
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  )
}
