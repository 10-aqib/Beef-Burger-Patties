import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Eye, EyeOff, Flame, Loader2 } from 'lucide-react'
import { useUIStore } from '@/store/uiStore'
import { useAuth } from '@/hooks/useAuth'
import { useOverlayA11y } from '@/hooks/useOverlayA11y'
import toast from 'react-hot-toast'

export default function AuthModal() {
  const { authModalOpen, authModalTab, closeAuthModal } = useUIStore()
  const { signIn, signUp, resetPassword } = useAuth()
  const modalRef = useRef<HTMLDivElement>(null)

  const [mode, setMode] = useState<'login' | 'signup' | 'reset'>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (authModalOpen) {
      setMode(authModalTab)
      setError(null)
      setEmail('')
      setPassword('')
      setFullName('')
    }
  }, [authModalOpen, authModalTab])

  useOverlayA11y({
    isOpen: authModalOpen,
    onClose: closeAuthModal,
    containerRef: modalRef,
  })

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      if (mode === 'login') {
        const { error: err } = await signIn(email, password)
        if (err) throw err
        toast.success('Welcome back to Paput Burgers!', {
          icon: '🔥',
          style: { background: '#1F1F1F', color: '#fff', border: '1px solid #2A2A2A', fontFamily: 'Space Grotesk', fontWeight: 600 },
        })
        closeAuthModal()

      } else if (mode === 'signup') {
        const { error: err } = await signUp(email, password, fullName)
        if (err) throw err
        toast.success('Account created! Check your email to confirm.', {
          icon: '🍔',
          style: { background: '#1F1F1F', color: '#fff', border: '1px solid #2A2A2A', fontFamily: 'Space Grotesk', fontWeight: 600 },
        })
        closeAuthModal()

      } else if (mode === 'reset') {
        const { error: err } = await resetPassword(email)
        if (err) throw err
        toast.success('Password reset email sent!', {
          style: { background: '#1F1F1F', color: '#fff', border: '1px solid #2A2A2A', fontFamily: 'Space Grotesk', fontWeight: 600 },
        })
        setMode('login')
      }
    } catch (err: unknown) {
      const msg = (err as Error)?.message || 'Something went wrong. Please try again.'
      // Clean up Supabase error messages for users
      if (msg.includes('Invalid login credentials')) {
        setError('Incorrect email or password.')
      } else if (msg.includes('already registered')) {
        setError('This email is already registered. Try signing in.')
      } else if (msg.includes('Password should be at least')) {
        setError('Password must be at least 6 characters.')
      } else {
        setError(msg)
      }
    } finally {
      setLoading(false)
    }
  }

  const titles = {
    login: 'SIGN IN',
    signup: 'CREATE ACCOUNT',
    reset: 'RESET PASSWORD',
  }

  const subtitles = {
    login: 'Access your Paput Burgers account',
    signup: 'Join the Paput Burgers community',
    reset: "We'll send you a reset link",
  }

  return (
    <AnimatePresence>
      {authModalOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 bg-black/75 backdrop-blur-sm z-[90]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeAuthModal}
            aria-hidden="true"
          />

          {/* Modal */}
          <motion.div
            ref={modalRef}
            tabIndex={-1}
            className="fixed left-1/2 top-1/2 -translate-x-1/2 z-[100] w-[calc(100%-2rem)] max-w-md"
            style={{
              background: '#121212',
              border: '1px solid #2A2A2A',
              borderRadius: '8px',
              boxShadow: '0 24px 80px rgba(0,0,0,0.8)',
            }}
            initial={{ opacity: 0, scale: 0.95, y: '-48%' }}
            animate={{ opacity: 1, scale: 1, y: '-50%' }}
            exit={{ opacity: 0, scale: 0.95, y: '-48%' }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            role="dialog"
            aria-modal="true"
            aria-labelledby="auth-title"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-[#2A2A2A]">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded bg-[#FF3B1F]/10 flex items-center justify-center">
                  <Flame className="w-4 h-4 text-[#FF3B1F]" />
                </div>
                <div>
                  <h2
                    id="auth-title"
                    className="font-display font-bold text-white uppercase"
                    style={{ fontSize: '14px', letterSpacing: '0.08em' }}
                  >
                    {titles[mode]}
                  </h2>
                  <p className="text-body-sm text-[#737373] mt-0.5">
                    {subtitles[mode]}
                  </p>
                </div>
              </div>
              <button
                onClick={closeAuthModal}
                className="w-8 h-8 flex items-center justify-center rounded text-[#A3A3A3] hover:text-white hover:bg-[#1F1F1F] transition-colors"
                aria-label="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="p-6 space-y-4" noValidate>
              {/* Full name (signup only) */}
              {mode === 'signup' && (
                <div>
                  <label htmlFor="fullName" className="block text-label-sm text-[#A3A3A3] uppercase mb-1.5">
                    Full Name
                  </label>
                  <input
                    id="fullName"
                    type="text"
                    className="input"
                    placeholder="Muhammad Ali Khan"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                    autoComplete="name"
                  />
                </div>
              )}

              {/* Email */}
              <div>
                <label htmlFor="email" className="block text-label-sm text-[#A3A3A3] uppercase mb-1.5">
                  Email Address
                </label>
                <input
                  id="email"
                  type="email"
                  className="input"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete={mode === 'login' ? 'email' : 'new-password'}
                />
              </div>

              {/* Password */}
              {mode !== 'reset' && (
                <div>
                  <label htmlFor="password" className="block text-label-sm text-[#A3A3A3] uppercase mb-1.5">
                    Password
                  </label>
                  <div className="relative">
                    <input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      className="input pr-10"
                      placeholder={mode === 'signup' ? 'Min. 6 characters' : '••••••••'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                      minLength={6}
                    />
                    <button
                      type="button"
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[#737373] hover:text-white transition-colors"
                      onClick={() => setShowPassword(!showPassword)}
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              )}

              {/* Error message */}
              {error && (
                <motion.div
                  className="p-3 rounded text-body-sm text-[#FF543B]"
                  style={{ background: 'rgba(255,59,31,0.08)', border: '1px solid rgba(255,59,31,0.2)' }}
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  role="alert"
                >
                  {error}
                </motion.div>
              )}

              {/* Forgot password (login mode) */}
              {mode === 'login' && (
                <div className="text-right">
                  <button
                    type="button"
                    className="text-body-sm text-[#A3A3A3] hover:text-[#FF3B1F] transition-colors"
                    onClick={() => { setMode('reset'); setError(null) }}
                  >
                    Forgot password?
                  </button>
                </div>
              )}

              {/* Submit */}
              <motion.button
                type="submit"
                className="btn-primary w-full py-3.5 text-label-lg justify-center"
                disabled={loading}
                whileTap={{ scale: 0.98 }}
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  titles[mode]
                )}
              </motion.button>

              {/* Mode switchers */}
              <div className="text-center pt-2">
                {mode === 'login' && (
                  <p className="text-body-sm text-[#A3A3A3]">
                    Don't have an account?{' '}
                    <button
                      type="button"
                      className="text-[#FF3B1F] hover:text-[#FF543B] font-semibold transition-colors"
                      onClick={() => { setMode('signup'); setError(null) }}
                    >
                      Create one
                    </button>
                  </p>
                )}
                {(mode === 'signup' || mode === 'reset') && (
                  <p className="text-body-sm text-[#A3A3A3]">
                    Already have an account?{' '}
                    <button
                      type="button"
                      className="text-[#FF3B1F] hover:text-[#FF543B] font-semibold transition-colors"
                      onClick={() => { setMode('login'); setError(null) }}
                    >
                      Sign in
                    </button>
                  </p>
                )}
              </div>
            </form>

            {/* Footer */}
            <div
              className="px-6 pb-5 pt-0 text-center text-[#737373]"
              style={{ fontSize: '10px', lineHeight: '14px' }}
            >
              By continuing, you agree to Paput Burgers's Terms of Service and Privacy Policy.
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
