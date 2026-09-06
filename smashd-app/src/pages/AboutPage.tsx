import React, { useEffect } from 'react'
import { motion } from 'framer-motion'
import { Flame, ShieldCheck, Award, Zap, ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import AnatomySection from '@/components/anatomy/AnatomySection'

export default function AboutPage() {
  useEffect(() => {
    window.scrollTo(0, 0)
    document.title = 'About Us | Beef Burger Patties'
  }, [])

  return (
    <main className="min-h-screen pt-28 pb-20" style={{ background: '#080808' }}>
      <div className="container-max">
        {/* Hero Banner */}
        <div className="text-center max-w-4xl mx-auto mb-20">
          <motion.div
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full mb-4"
            style={{ background: 'rgba(255, 59, 31, 0.1)', border: '1px solid rgba(255, 59, 31, 0.3)' }}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Flame className="w-3.5 h-3.5 text-[#FF3B1F]" />
            <span className="text-[11px] font-display font-bold uppercase tracking-widest text-[#FF3B1F]">
              OUR MANIFESTO
            </span>
          </motion.div>

          <motion.h1
            className="text-display-hero-mobile sm:text-headline-lg font-display font-bold text-white uppercase tracking-tight mb-6 leading-tight"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            THE CRAFT SMASH <span className="text-[#FF3B1F]">REVOLUTION.</span>
          </motion.h1>

          <motion.p
            className="text-body-lg text-[#A3A3A3] leading-relaxed text-base sm:text-lg"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            Beef Burger Patties was born out of frustration with thick, grey, steamed burger patties. We brought Pakistan its first authentic cast-iron smash operation: raw ground Angus smashed at 450°F to unlock the ultimate Maillard reaction.
          </motion.p>
        </div>

        {/* 3 Pillars */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 mb-24">
          {[
            {
              icon: Flame,
              title: '450°F STEEL SLAB SEAR',
              desc: 'We do not gently grill. We dual-press raw Angus spheres with heavy custom iron weights directly onto a screaming 450°F seasoned steel flattop. The fat crisps into an ultra-thin caramelized lace crust.',
            },
            {
              icon: ShieldCheck,
              title: '100% HALAL PRIME ANGUS',
              desc: 'Zero fillers. Zero soy. Zero frozen pre-formed pucks. Sourced daily from certified Halal farms and freshly coarsely ground in-house every morning.',
            },
            {
              icon: Award,
              title: 'POTATO BRIOCHE & SECRET SAUCE',
              desc: 'Custom-baked soft golden potato brioche buns butter-griddled right on the iron, slathered in our secret house-churned smash sauce with roasted garlic cream and smoked paprika.',
            },
          ].map((pillar, idx) => {
            const Icon = pillar.icon
            return (
              <motion.div
                key={pillar.title}
                className="card p-8 flex flex-col justify-between"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * idx, duration: 0.5 }}
              >
                <div>
                  <div className="w-12 h-12 rounded bg-[#1F1F1F] border border-[#2A2A2A] flex items-center justify-center mb-6 text-[#FF3B1F]">
                    <Icon className="w-6 h-6" />
                  </div>
                  <h3 className="text-headline-sm font-display font-bold text-white uppercase mb-3">
                    {pillar.title}
                  </h3>
                  <p className="text-body-sm text-[#A3A3A3] leading-relaxed">
                    {pillar.desc}
                  </p>
                </div>
              </motion.div>
            )
          })}
        </div>

        {/* Anatomy Section Embedded */}
        <div className="rounded-xl border border-[#2A2A2A] overflow-hidden mb-20">
          <AnatomySection />
        </div>

        {/* CTA Banner */}
        <div
          className="rounded-2xl p-10 md:p-16 text-center relative overflow-hidden"
          style={{ background: 'linear-gradient(135deg, #171717 0%, #0D0D0D 100%)', border: '1px solid #2A2A2A' }}
        >
          <div className="max-w-2xl mx-auto relative z-10">
            <h2 className="text-headline-lg font-display font-bold text-white uppercase mb-4">
              READY TO TASTE THE LACE CRUST?
            </h2>
            <p className="text-body-md text-[#A3A3A3] mb-8">
              Order now and have it smashed fresh to your door in Islamabad, Rawalpindi, Lahore, or Karachi.
            </p>
            <Link to="/menu" className="btn-primary text-label-md px-8 py-3.5 inline-flex items-center gap-2">
              ORDER NOW <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    </main>
  )
}
