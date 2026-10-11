import React, { useRef, useState, useEffect } from 'react'
import { motion, useInView } from 'framer-motion'
import { MapPin, Clock, Phone, ExternalLink, ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import { getLocations } from '@/services/locationService'
import { isLocationCurrentlyOpen } from '@/utils'
import type { Location } from '@/types'

const CITIES = ['All', 'Islamabad', 'Rawalpindi', 'Lahore', 'Karachi']

export default function LocationsSection() {
  const headingRef = useRef<HTMLDivElement>(null)
  const inView = useInView(headingRef, { once: true, margin: '-60px' })

  const [selectedCity, setSelectedCity] = useState('All')
  const [locations, setLocations] = useState<Location[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    getLocations(selectedCity).then((data) => {
      setLocations(data)
      setLoading(false)
    })
  }, [selectedCity])

  return (
    <section
      id="locations"
      className="w-full section-padding"
      style={{ background: '#080808' }}
      aria-labelledby="locations-heading"
    >
      <div className="container-max">
        {/* Header */}
        <div ref={headingRef} className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-6">
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
                PAPUT BURGERS LOCATIONS
              </span>
            </motion.div>
            <motion.h2
              id="locations-heading"
              className="text-headline-lg text-white uppercase font-display font-bold leading-tight"
              initial={{ opacity: 0, y: 20 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              FIND YOUR
              <br />
              NEAREST SLAB
            </motion.h2>
          </div>

          <Link
            to="/locations"
            className="inline-flex items-center gap-2 text-label-md text-[#FF3B1F] hover:text-[#FF543B] font-display font-bold uppercase tracking-wider transition-colors self-start md:self-auto"
          >
            VIEW ALL FORGES <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Filter Tabs */}
        <div className="flex flex-wrap gap-2 mb-8">
          {CITIES.map((c) => (
            <button
              key={c}
              onClick={() => setSelectedCity(c)}
              className={`px-4 py-2 rounded text-xs font-display uppercase tracking-wider transition-colors ${
                selectedCity === c
                  ? 'bg-[#FF3B1F] text-white font-bold'
                  : 'bg-[#171717] text-[#A3A3A3] hover:text-white border border-[#2A2A2A]'
              }`}
            >
              {c}
            </button>
          ))}
        </div>

        {/* Locations grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {[1, 2, 3].map((i) => (
              <div key={i} className="card p-6 h-48 animate-pulse bg-[#171717]" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {locations.map((loc, idx) => (
              <LocationCard key={loc.id} location={loc} index={idx} />
            ))}
          </div>
        )}
      </div>
    </section>
  )
}

function LocationCard({ location, index }: { location: Location; index: number }) {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: '-40px' })

  const gmapsUrl = location.latitude && location.longitude
    ? `https://www.google.com/maps?q=${location.latitude},${location.longitude}`
    : `https://www.google.com/maps/search/${encodeURIComponent(location.name + ' ' + location.address)}`

  const hoursStatus = isLocationCurrentlyOpen(location.opening_hours, location.is_open)

  return (
    <motion.div
      ref={ref}
      className="card loc-card p-5 flex flex-col gap-4"
      initial={{ opacity: 0, y: 30 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, delay: index * 0.1, ease: [0.16, 1, 0.3, 1] }}
    >
      {/* Header row */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-1.5">
            {location.badge && (
              <span
                className="badge text-[9px]"
                style={{
                  background: hoursStatus.isOpen ? '#FF3B1F' : '#2A2A2A',
                  color: hoursStatus.isOpen ? '#FFFFFF' : '#A3A3A3',
                }}
              >
                {location.badge}
              </span>
            )}
            <span
              className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider"
              style={{ color: hoursStatus.isOpen ? '#34D399' : '#EF4444' }}
            >
              <span
                className={`w-1.5 h-1.5 rounded-full ${hoursStatus.isOpen ? 'bg-[#34D399] animate-pulse' : 'bg-[#EF4444]'}`}
              />
              {hoursStatus.statusText}
            </span>
          </div>
          <h3
            className="font-display font-bold text-white uppercase"
            style={{ fontSize: '14px', letterSpacing: '-0.01em' }}
          >
            {location.name}
          </h3>
        </div>
        <a
          href={gmapsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="shrink-0 w-9 h-9 rounded flex items-center justify-center text-[#A3A3A3] hover:text-white hover:bg-[#1F1F1F] transition-colors"
          aria-label={`Open ${location.name} in Google Maps`}
        >
          <ExternalLink className="w-4 h-4" />
        </a>
      </div>

      {/* Details */}
      <div className="space-y-2">
        <div className="flex items-start gap-2.5 text-body-sm text-[#A3A3A3]">
          <MapPin className="w-4 h-4 text-[#FF3B1F] mt-0.5 flex-shrink-0" />
          <span>{location.address}</span>
        </div>
        <div className="flex items-center gap-2.5 text-body-sm text-[#A3A3A3]">
          <Clock className="w-4 h-4 text-[#F59E0B] flex-shrink-0" />
          <span>
            {location.opening_hours}
            {hoursStatus.detailText && (
              <span className="ml-2 text-xs text-[#737373]">({hoursStatus.detailText})</span>
            )}
          </span>
        </div>
        <div className="flex items-center gap-2.5 text-body-sm text-[#A3A3A3]">
          <Phone className="w-4 h-4 text-[#A3A3A3] flex-shrink-0" />
          <a href={`tel:${location.phone}`} className="hover:text-white transition-colors">
            {location.phone}
          </a>
        </div>
      </div>

      {/* CTA */}
      {location.is_open && (
        <a
          href={gmapsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="btn-secondary py-2.5 text-label-md justify-center gap-2"
        >
          <MapPin className="w-4 h-4" />
          GET DIRECTIONS
        </a>
      )}
    </motion.div>
  )
}
