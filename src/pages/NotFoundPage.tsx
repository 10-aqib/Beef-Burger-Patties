import React from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'

export default function NotFoundPage() {
  return (
    <main
      id="main-content"
      className="min-h-screen flex items-center justify-center pt-20"
      style={{ background: '#080808' }}
    >
      <motion.div
        className="text-center px-4"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div
          className="font-display font-bold text-[#1F1F1F] mb-4"
          style={{ fontSize: '120px', lineHeight: 1, letterSpacing: '-0.05em' }}
        >
          404
        </div>
        <h1
          className="font-display font-bold text-white uppercase mb-3"
          style={{ fontSize: '24px', letterSpacing: '-0.02em' }}
        >
          Page Not Found
        </h1>
        <p className="text-body-md text-[#A3A3A3] mb-8 max-w-sm mx-auto">
          This page doesn't exist. The burger might have already been eaten.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link to="/" className="btn-primary text-label-md px-6 py-3">
            GO HOME
          </Link>
          <Link to="/menu" className="btn-secondary text-label-md px-6 py-3">
            ORDER NOW
          </Link>
        </div>
      </motion.div>
    </main>
  )
}
