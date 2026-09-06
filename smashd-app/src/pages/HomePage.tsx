import React, { useEffect } from 'react'
import CinematicHero from '@/components/hero/CinematicHero'
import MarqueeStrip from '@/components/hero/MarqueeStrip'
import FeaturedProducts from '@/components/menu/FeaturedProducts'
import DealsSection from '@/components/deals/DealsSection'
import LocationsSection from '@/components/locations/LocationsSection'
import ReviewsSection from '@/components/reviews/ReviewsSection'
import AnatomySection from '@/components/anatomy/AnatomySection'

export default function HomePage() {
  useEffect(() => {
    document.title = 'Beef Burger Patties | Premium Burgers in Pakistan'
  }, [])

  return (
    <main id="main-content">
      {/* Full-screen cinematic hero */}
      <CinematicHero />

      {/* Red marquee strip */}
      <MarqueeStrip />

      {/* Featured products grid */}
      <FeaturedProducts />

      {/* Burger anatomy interactive */}
      <AnatomySection />

      {/* Deals & combo meals */}
      <DealsSection />

      {/* Locations */}
      <LocationsSection />

      {/* Reviews */}
      <ReviewsSection />
    </main>
  )
}
