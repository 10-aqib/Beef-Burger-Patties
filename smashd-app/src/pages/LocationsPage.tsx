import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { MapPin, Clock, Phone, ExternalLink, Navigation } from 'lucide-react'
import { getLocations } from '@/services/locationService'
import type { Location } from '@/types'

const CITIES = ['All', 'Islamabad', 'Rawalpindi', 'Lahore', 'Karachi']

export default function LocationsPage() {
  const [locations, setLocations] = useState<Location[]>([])
  const [selectedCity, setSelectedCity] = useState('All')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    window.scrollTo(0, 0)
    document.title = 'Locations | Beef Burger Patties'
    setLoading(true)
    getLocations(selectedCity).then((data) => {
      setLocations(data)
      setLoading(false)
    })
  }, [selectedCity])

  return (
    <main className="min-h-screen pt-28 pb-20" style={{ background: '#080808' }}>
      <div className="container-max">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-12">
          <motion.div
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full mb-4"
            style={{ background: 'rgba(245, 158, 11, 0.1)', border: '1px solid rgba(245, 158, 11, 0.3)' }}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <MapPin className="w-3.5 h-3.5 text-[#F59E0B]" />
            <span className="text-[11px] font-display font-bold uppercase tracking-widest text-[#F59E0B]">
              FORGE NETWORK
            </span>
          </motion.div>

          <motion.h1
            className="text-display-hero-mobile sm:text-headline-lg font-display font-bold text-white uppercase tracking-tight mb-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            FIND YOUR <span className="text-[#FF3B1F]">SLAB.</span>
          </motion.h1>

          <motion.p
            className="text-body-md text-[#A3A3A3]"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            Visit our craft burger forges or order delivery directly to your doorstep.
          </motion.p>
        </div>

        {/* City Filter Tabs */}
        <div className="flex flex-wrap items-center justify-center gap-2 mb-12">
          {CITIES.map((city) => (
            <button
              key={city}
              onClick={() => setSelectedCity(city)}
              className={`px-5 py-2.5 rounded text-label-md font-display uppercase tracking-wider transition-all duration-200 ${
                selectedCity === city
                  ? 'bg-[#FF3B1F] text-white font-bold shadow-[0_0_20px_rgba(255,59,31,0.4)]'
                  : 'bg-[#171717] text-[#A3A3A3] hover:text-white hover:bg-[#202020] border border-[#2A2A2A]'
              }`}
            >
              {city}
            </button>
          ))}
        </div>

        {/* Locations Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="card p-6 h-64 animate-pulse bg-[#171717]" />
            ))}
          </div>
        ) : locations.length === 0 ? (
          <div className="card p-12 text-center max-w-md mx-auto">
            <MapPin className="w-8 h-8 text-[#525252] mx-auto mb-3" />
            <p className="text-body-md text-white font-semibold mb-1">No forges found in {selectedCity}</p>
            <p className="text-body-sm text-[#737373]">We are expanding rapidly across Pakistan! Coming soon to this city.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {locations.map((loc, idx) => {
              const gmapsUrl = loc.latitude && loc.longitude
                ? `https://www.google.com/maps?q=${loc.latitude},${loc.longitude}`
                : `https://www.google.com/maps/search/${encodeURIComponent(loc.name + ' ' + loc.address)}`

              return (
                <motion.div
                  key={loc.id}
                  className="card p-6 flex flex-col justify-between group hover:border-[#FF3B1F] transition-all duration-300"
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.08, duration: 0.4 }}
                >
                  <div>
                    <div className="flex items-start justify-between gap-4 mb-3">
                      <div>
                        <div className="flex items-center gap-2 mb-1.5">
                          {loc.badge && (
                            <span className="badge badge-red text-[10px]">{loc.badge}</span>
                          )}
                          <span
                            className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider"
                            style={{ color: loc.is_open ? '#34D399' : '#EF4444' }}
                          >
                            <span
                              className={`w-2 h-2 rounded-full ${loc.is_open ? 'bg-[#34D399] animate-pulse' : 'bg-[#EF4444]'}`}
                            />
                            {loc.is_open ? 'OPEN FOR ORDERS' : 'COMING SOON'}
                          </span>
                        </div>

                        <h2 className="text-headline-sm text-white uppercase font-display font-bold">
                          {loc.name}
                        </h2>
                      </div>

                      <a
                        href={gmapsUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-10 h-10 rounded bg-[#1C1B1B] hover:bg-[#FF3B1F] text-[#A3A3A3] hover:text-white flex items-center justify-center transition-colors shrink-0"
                        aria-label={`Directions to ${loc.name}`}
                      >
                        <Navigation className="w-5 h-5" />
                      </a>
                    </div>

                    <div className="space-y-2.5 my-4">
                      <div className="flex items-start gap-2.5 text-body-sm text-[#A3A3A3]">
                        <MapPin className="w-4 h-4 text-[#FF3B1F] mt-0.5 shrink-0" />
                        <span>{loc.address}</span>
                      </div>
                      <div className="flex items-center gap-2.5 text-body-sm text-[#A3A3A3]">
                        <Clock className="w-4 h-4 text-[#F59E0B] shrink-0" />
                        <span>{loc.opening_hours}</span>
                      </div>
                      <div className="flex items-center gap-2.5 text-body-sm text-[#A3A3A3]">
                        <Phone className="w-4 h-4 text-[#A3A3A3] shrink-0" />
                        <a href={`tel:${loc.phone}`} className="hover:text-white transition-colors">
                          {loc.phone}
                        </a>
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-[#2A2A2A]">
                    <a
                      href={gmapsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-secondary w-full py-2.5 text-label-md justify-center gap-2"
                    >
                      <MapPin className="w-4 h-4" />
                      GET DIRECTIONS
                    </a>
                  </div>
                </motion.div>
              )
            })}
          </div>
        )}
      </div>
    </main>
  )
}
