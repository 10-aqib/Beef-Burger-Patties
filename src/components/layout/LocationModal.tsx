import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { MapPin, X, Check, Clock, Bike } from 'lucide-react'
import { useUIStore } from '@/store/uiStore'
import toast from 'react-hot-toast'

const CITY_OPTIONS = [
  {
    city: 'Islamabad',
    branch: 'F-7 Markaz & Blue Area Forge',
    eta: '25-30 mins',
    badge: 'FLAGSHIP',
    isOpen: true,
  },
  {
    city: 'Rawalpindi',
    branch: 'Saddar Cantt & Bahria Town',
    eta: '30-35 mins',
    badge: 'HOT DISPATCH',
    isOpen: true,
  },
  {
    city: 'Lahore',
    branch: 'Gulberg (MM Alam) & DHA Phase 5',
    eta: '28-35 mins',
    badge: 'EXPANDED',
    isOpen: true,
  },
  {
    city: 'Karachi',
    branch: 'Clifton Block 4 & DHA Phase 6',
    eta: '30-40 mins',
    badge: 'COASTAL FORGE',
    isOpen: true,
  },
]

export default function LocationModal() {
  const { locationModalOpen, closeLocationModal, selectedCity, setSelectedCity } = useUIStore()

  function handleSelect(city: string) {
    setSelectedCity(city)
    toast.success(`Active city updated to ${city}`, { icon: '📍' })
    closeLocationModal()
  }

  return (
    <AnimatePresence>
      {locationModalOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[70]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeLocationModal}
          />

          {/* Modal Container */}
          <motion.div
            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-lg px-4 z-[80]"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2 }}
          >
            <div
              className="card overflow-hidden shadow-2xl p-6"
              style={{ background: '#121212', border: '1px solid #2A2A2A' }}
            >
              <div className="flex items-center justify-between pb-4 border-b border-[#2A2A2A] mb-4">
                <div className="flex items-center gap-2.5">
                  <MapPin className="w-5 h-5 text-[#FF3B1F]" />
                  <h2 className="text-headline-sm font-display font-bold text-white uppercase tracking-tight">
                    SELECT YOUR CITY
                  </h2>
                </div>
                <button
                  onClick={closeLocationModal}
                  className="text-[#737373] hover:text-white p-1"
                  aria-label="Close"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <p className="text-body-sm text-[#A3A3A3] mb-6">
                Choose your nearest delivery hub to view local forge availability, accurate dispatch times, and delivery fees.
              </p>

              <div className="space-y-3">
                {CITY_OPTIONS.map((opt) => {
                  const isSelected = selectedCity.toLowerCase() === opt.city.toLowerCase()
                  return (
                    <button
                      key={opt.city}
                      onClick={() => handleSelect(opt.city)}
                      className={`w-full text-left p-4 rounded-lg border transition-all duration-200 flex items-center justify-between gap-4 ${
                        isSelected
                          ? 'bg-[#1C1B1B] border-[#FF3B1F] shadow-[0_0_16px_rgba(255,59,31,0.25)]'
                          : 'bg-[#171717] border-[#262626] hover:border-[#383838]'
                      }`}
                    >
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-display font-bold text-white text-base uppercase">
                            {opt.city}
                          </span>
                          <span className="badge badge-red text-[9px]">{opt.badge}</span>
                        </div>
                        <p className="text-xs text-[#A3A3A3] mb-1.5">{opt.branch}</p>
                        <div className="flex items-center gap-3 text-[11px] text-[#737373]">
                          <span className="flex items-center gap-1 text-[#F59E0B]">
                            <Clock className="w-3 h-3" /> ETA {opt.eta}
                          </span>
                          <span className="flex items-center gap-1 text-[#34D399]">
                            <Bike className="w-3 h-3" /> Kitchen Open
                          </span>
                        </div>
                      </div>

                      <div
                        className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 border ${
                          isSelected
                            ? 'bg-[#FF3B1F] border-[#FF3B1F] text-white'
                            : 'border-[#383838] bg-[#222]'
                        }`}
                      >
                        {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                      </div>
                    </button>
                  )
                })}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
