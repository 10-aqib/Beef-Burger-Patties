import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { SEED_PRODUCTS, SEED_CATEGORIES } from '@/lib/seedData'
import type { Product, Category } from '@/types'

const SUPABASE_CONFIGURED = Boolean(
  import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_ANON_KEY
)

// ─── Use Products Hook ────────────────────────────────────────
export function useProducts(categoryId?: string | null) {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function load() {
      setLoading(true)
      setError(null)

      if (!SUPABASE_CONFIGURED) {
        // Use seed data
        const filtered = categoryId
          ? SEED_PRODUCTS.filter((p) => p.category_id === categoryId)
          : SEED_PRODUCTS
        setProducts(filtered)
        setLoading(false)
        return
      }

      try {
        let query = supabase
          .from('products')
          .select(`
            *,
            category:categories(*),
            modifiers:modifier_groups(
              *,
              options:modifier_options(*)
            )
          `)
          .eq('is_available', true)
          .order('sort_order')

        if (categoryId) {
          query = query.eq('category_id', categoryId)
        }

        const { data, error: err } = await query
        if (err) throw err
        setProducts(data || [])
      } catch (err) {
        setError('Unable to load menu. Please try again.')
        console.error('[Products] Load error:', err)
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [categoryId])

  return { products, loading, error }
}

// ─── Use Featured Products Hook ───────────────────────────────
export function useFeaturedProducts() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function load() {
      setLoading(true)
      setError(null)

      if (!SUPABASE_CONFIGURED) {
        setProducts(SEED_PRODUCTS.filter((p) => p.is_featured))
        setLoading(false)
        return
      }

      try {
        const { data, error: err } = await supabase
          .from('products')
          .select(`
            *,
            category:categories(*),
            modifiers:modifier_groups(
              *,
              options:modifier_options(*)
            )
          `)
          .eq('is_featured', true)
          .eq('is_available', true)
          .order('sort_order')
          .limit(8)

        if (err) throw err
        setProducts(data || [])
      } catch {
        setError('Unable to load featured products.')
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [])

  return { products, loading, error }
}

// ─── Use Product By Slug ──────────────────────────────────────
export function useProduct(slug: string | null) {
  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!slug) {
      setLoading(false)
      return
    }

    async function load() {
      setLoading(true)
      setError(null)

      if (!SUPABASE_CONFIGURED) {
        const found = SEED_PRODUCTS.find((p) => p.slug === slug) || null
        setProduct(found)
        setLoading(false)
        return
      }

      try {
        const { data, error: err } = await supabase
          .from('products')
          .select(`
            *,
            category:categories(*),
            modifiers:modifier_groups(
              *,
              options:modifier_options(*)
            )
          `)
          .eq('slug', slug)
          .single()

        if (err) throw err
        setProduct(data)
      } catch {
        setError('Product not found.')
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [slug])

  return { product, loading, error }
}

// ─── Use Categories Hook ──────────────────────────────────────
export function useCategories() {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function load() {
      setLoading(true)

      if (!SUPABASE_CONFIGURED) {
        setCategories(SEED_CATEGORIES)
        setLoading(false)
        return
      }

      try {
        const { data, error: err } = await supabase
          .from('categories')
          .select('*')
          .eq('is_active', true)
          .order('sort_order')

        if (err) throw err
        setCategories(data || [])
      } catch {
        setError('Unable to load categories.')
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [])

  return { categories, loading, error }
}
