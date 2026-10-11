import React, { useEffect, useRef, useState } from 'react'
import { motion, useReducedMotion, type Variants } from 'framer-motion'
import { Link } from 'react-router-dom'
import { ChevronDown, Flame, Sparkles } from 'lucide-react'
import { useUIStore } from '@/store/uiStore'

// ─── Particle System ──────────────────────────────────────────
interface Particle {
  id: number
  x: number
  y: number
  size: number
  opacity: number
  speed: number
  drift: number
  delay: number
  repeatDelay: number
  type: 'steam' | 'ember'
  color: string
}

function generateParticles(count: number): Particle[] {
  return Array.from({ length: count }, (_, i) => {
    const isEmber = Math.random() > 0.7
    return {
      id: i,
      x: 20 + Math.random() * 60, // % from left
      y: 100 + Math.random() * 20, // % from top (start below viewport)
      size: 4 + Math.random() * 8,
      opacity: 0.3 + Math.random() * 0.4,
      speed: 2 + Math.random() * 3,
      drift: (Math.random() - 0.5) * 30,
      delay: Math.random() * 4,
      repeatDelay: Math.random() * 3,
      type: isEmber ? 'ember' : 'steam',
      color: isEmber
        ? `rgba(255, ${Math.floor(100 + Math.random() * 60)}, 0, 0.7)`
        : 'rgba(255,255,255,0.15)',
    }
  })
}

const PARTICLES = generateParticles(12)

// ─── Hero Text Animation Variants ─────────────────────────────
const containerVariants: Variants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.14, delayChildren: 0.2 },
  },
}

const lineVariants: Variants = {
  hidden: { opacity: 0, y: 35, filter: 'blur(8px)' },
  visible: {
    opacity: 1,
    y: 0,
    filter: 'blur(0px)',
    transition: { duration: 0.75, ease: [0.16, 1, 0.3, 1] },
  },
}

const eyebrowVariants: Variants = {
  hidden: { opacity: 0, y: -15 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] },
  },
}

const ctaVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1], delay: 0.6 },
  },
}

// ─── Main Hero Component ──────────────────────────────────────
export default function CinematicHero() {
  const heroRef = useRef<HTMLDivElement>(null)
  const [videoError, setVideoError] = useState(false)
  const [scrollProgress, setScrollProgress] = useState(0)

  const reducedMotion = useReducedMotion()
  const { openCustomizer } = useUIStore()

  // ─── Scroll Parallax Content Fade ─────────────────────────
  useEffect(() => {
    function handleScroll() {
      const progress = Math.min(window.scrollY / (window.innerHeight * 0.6), 1)
      setScrollProgress(progress)
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <section
      ref={heroRef}
      className="relative w-full overflow-hidden flex items-center justify-center bg-[#080808]"
      style={{
        height: '100dvh',
        minHeight: '600px',
      }}
      aria-label="Paput Burgers cinematic hero"
    >
      {/* ─── Background Media (Video with Poster Fallback & Reduced Motion) ─── */}
      <div className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none">
        {videoError || reducedMotion ? (
          <img
            src="/images/hero-poster.jpg"
            alt="Fresh Smashed Beef Patties Sizzling on Griddle"
            className="w-full h-full object-cover object-center"
            style={{
              filter: 'contrast(1.08) brightness(0.92) saturate(1.15)',
            }}
          />
        ) : (
          <video
            src="/videos/veo-3.mp4"
            poster="/images/hero-poster.jpg"
            autoPlay
            loop
            muted
            playsInline
            onError={() => setVideoError(true)}
            className="w-full h-full object-cover object-center"
            style={{
              filter: 'contrast(1.08) brightness(0.92) saturate(1.15)',
            }}
          />
        )}
      </div>

      {/* ─── Gradient Overlays ──────────────────────────── */}
      {/* Top gradient — darkens top for header legibility */}
      <div
        className="absolute inset-x-0 top-0 h-44 pointer-events-none z-10"
        style={{
          background:
            'linear-gradient(to bottom, rgba(8,8,8,0.85) 0%, rgba(8,8,8,0.4) 60%, transparent 100%)',
        }}
        aria-hidden="true"
      />

      {/* Atmospheric radial vignette for optimal text legibility */}
      <div
        className="absolute inset-0 pointer-events-none z-10"
        style={{
          background:
            'radial-gradient(circle at center, rgba(8,8,8,0.5) 0%, rgba(8,8,8,0.72) 55%, rgba(8,8,8,0.92) 100%)',
        }}
        aria-hidden="true"
      />

      {/* Bottom gradient — strong dark for text & marquee transition */}
      <div
        className="absolute inset-x-0 bottom-0 pointer-events-none z-10"
        style={{
          height: '40%',
          background:
            'linear-gradient(to top, rgba(8,8,8,1) 0%, rgba(8,8,8,0.85) 30%, transparent 100%)',
        }}
        aria-hidden="true"
      />

      {/* ─── Atmospheric Particles ──────────────────────── */}
      {!reducedMotion && (
        <div className="absolute inset-0 z-10 pointer-events-none overflow-hidden" aria-hidden="true">
          {PARTICLES.map((particle) => (
            <motion.div
              key={particle.id}
              className="absolute rounded-full"
              style={{
                left: `${particle.x}%`,
                width: particle.size,
                height: particle.size * (particle.type === 'steam' ? 1.5 : 1),
                background: particle.color,
                filter: particle.type === 'steam' ? 'blur(4px)' : 'blur(1px)',
              }}
              initial={{ y: '100vh', opacity: 0, x: 0 }}
              animate={{
                y: '-20vh',
                opacity: [0, particle.opacity, particle.opacity * 0.5, 0],
                x: particle.drift,
                scale: particle.type === 'steam' ? [1, 2, 2.5] : [1, 0.6, 0],
              }}
              transition={{
                duration: particle.speed + 2,
                delay: particle.delay,
                repeat: Infinity,
                repeatDelay: particle.repeatDelay,
                ease: 'easeOut',
              }}
            />
          ))}
        </div>
      )}

      {/* ─── Hero Content: Adjusted & Perfectly Centered on Screen ── */}
      <div
        className="absolute inset-0 z-20 flex items-center justify-center pt-24 pb-16 px-4 sm:px-6"
        style={{
          opacity: 1 - scrollProgress * 1.5,
          transform: `translateY(${scrollProgress * -35}px)`,
        }}
      >
        <div className="container-max w-full flex justify-center">
          <motion.div
            className="max-w-6xl w-full flex flex-col items-center text-center mx-auto"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {/* Eyebrow badge */}
            <motion.div
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-5 max-w-full backdrop-blur-md"
              style={{
                background: 'rgba(20,20,20,0.8)',
                border: '1px solid rgba(255,59,31,0.35)',
                boxShadow: '0 0 20px rgba(255,59,31,0.15)',
              }}
              variants={eyebrowVariants}
            >
              <Flame className="w-4 h-4 text-[#FF3B1F] animate-pulse shrink-0" />
              <span className="text-xs sm:text-sm font-semibold text-[#F59E0B] uppercase tracking-wider truncate sm:whitespace-normal">
                PAKISTAN'S CRAFT SMASH REVOLUTION · 450°F CAST-IRON
              </span>
            </motion.div>

            {/* Main headline - Expansive across screen */}
            <div className="mb-6 overflow-hidden w-full">
              <motion.div variants={lineVariants}>
                <h1
                  className="font-display font-black uppercase text-white tracking-tight leading-[1.03] drop-shadow-[0_4px_24px_rgba(0,0,0,0.95)]"
                  style={{
                    fontSize: 'clamp(36px, 5.8vw, 88px)',
                    letterSpacing: '-0.035em',
                  }}
                >
                  BURGERS MADE TO{' '}
                  <span
                    className="inline-block"
                    style={{
                      background: 'linear-gradient(135deg, #FF3B1F 0%, #FF7A00 45%, #F59E0B 100%)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      backgroundClip: 'text',
                      filter: 'drop-shadow(0 0 32px rgba(255, 59, 31, 0.6))',
                    }}
                  >
                    CRAVE.
                  </span>
                </h1>
              </motion.div>
            </div>

            {/* Subtext */}
            <motion.p
              className="text-[#D8D8D8] mx-auto mb-8 text-base sm:text-lg md:text-xl lg:text-[21px] font-normal leading-relaxed text-center drop-shadow-[0_2px_12px_rgba(0,0,0,0.9)]"
              style={{ maxWidth: '820px', width: '100%' }}
              variants={lineVariants}
            >
              Dual-pressed 100% Halal Prime Angus beef, ultra-crispy caramelized lace crust,
              molten Wisconsin cheddar and our secret house-churned smash sauce
              in a butter-griddled potato brioche.
            </motion.p>

            {/* CTA Cluster */}
            <motion.div
              className="flex flex-col sm:flex-row items-center justify-center gap-3.5 w-full mx-auto"
              style={{ maxWidth: '840px' }}
              variants={ctaVariants}
            >
              <Link
                to="/menu"
                className="btn-primary text-label-lg px-8 py-4 w-full sm:w-auto shadow-[0_0_32px_-4px_rgba(255,59,31,0.65)] hover:shadow-[0_0_45px_rgba(255,59,31,0.85)] transition-all flex items-center justify-center gap-2 group"
              >
                <span>ORDER NOW</span>
                <motion.span
                  className="inline-block"
                  animate={{ x: [0, 5, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
                >
                  →
                </motion.span>
              </Link>

              <button
                type="button"
                onClick={() => openCustomizer('prod-og-double')}
                className="btn-secondary text-label-lg px-7 py-4 w-full sm:w-auto flex items-center justify-center gap-2 border-[#FF3B1F]/30 hover:border-[#FF3B1F] bg-black/60 backdrop-blur-md transition-all group"
              >
                <Sparkles className="w-4 h-4 text-[#F59E0B] group-hover:rotate-12 transition-transform" />
                <span>CUSTOMIZE BURGER</span>
              </button>

              <a
                href="#featured-menu"
                className="text-label-md px-6 py-4 w-full sm:w-auto text-[#A3A3A3] hover:text-white transition-colors text-center font-medium"
                onClick={(e) => {
                  e.preventDefault()
                  document.getElementById('featured-menu')?.scrollIntoView({ behavior: 'smooth' })
                }}
              >
                EXPLORE MENU
              </a>
            </motion.div>

            {/* Live stats */}
            <motion.div
              className="flex flex-wrap items-center justify-center gap-3 sm:gap-6 mt-8 pt-2"
              variants={ctaVariants}
            >
              <div
                className="flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs sm:text-sm font-semibold backdrop-blur-md"
                style={{
                  background: 'rgba(26,26,26,0.7)',
                  border: '1px solid rgba(245, 158, 11, 0.3)',
                }}
              >
                <span className="w-2 h-2 rounded-full bg-[#10B981] animate-ping" />
                <span className="text-label-sm text-[#F59E0B] uppercase font-bold tracking-wider">
                  28 MIN AVG DISPATCH
                </span>
              </div>
              <div
                className="flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs sm:text-sm backdrop-blur-md"
                style={{
                  background: 'rgba(26, 26, 26, 0.7)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                }}
              >
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#34D399] animate-pulse" />
                  <span className="text-body-sm font-semibold text-white">100% FRESH HALAL BEEF</span>
                </div>
                <span className="text-body-sm text-[#A3A3A3]">
                  Smashed Raw-to-Order Daily
                </span>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>

      {/* ─── Scroll Indicator ───────────────────────────── */}
      <motion.a
        href="#marquee"
        className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-2 text-[#A3A3A3] hover:text-white transition-colors cursor-pointer"
        style={{ opacity: 1 - scrollProgress * 3 }}
        onClick={(e) => {
          e.preventDefault()
          document.getElementById('marquee')?.scrollIntoView({ behavior: 'smooth' })
        }}
        aria-label="Scroll down to explore"
      >
        <span className="text-label-sm uppercase tracking-[0.2em] text-[10px]">
          SCROLL TO EXPLORE
        </span>
        <motion.div
          animate={{ y: [0, 6, 0] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
        >
          <ChevronDown className="w-5 h-5" />
        </motion.div>
      </motion.a>
    </section>
  )
}
