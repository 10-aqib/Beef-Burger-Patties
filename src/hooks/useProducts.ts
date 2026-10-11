import { useState, useEffect } from 'react'
import { supabase, isSupabaseConfigured } from '@/lib/supabase'
import { SEED_PRODUCTS, SEED_CATEGORIES } from '@/lib/seedData'
import type { Product, Category } from '@/types'

// ─── Use Products Hook ────────────────────────────────────────
export function useProducts(categoryId?: string | null) {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function load() {
      setLoading(true)
      setError(null)

      const getFallback = () =>
        categoryId
          ? SEED_PRODUCTS.filter((p) => p.category_id === categoryId)
          : SEED_PRODUCTS

      if (!isSupabaseConfigured) {
        setProducts(getFallback())
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

        if (err || !data || data.length === 0) {
          // Graceful fallback to seed data
          setProducts(getFallback())
        } else {
          setProducts(data)
        }
      } catch {
        // Safe resilience fallback
        setProducts(getFallback())
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

      const getFeaturedFallback = () => SEED_PRODUCTS.filter((p) => p.is_featured)

      if (!isSupabaseConfigured) {
        setProducts(getFeaturedFallback())
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

        if (err || !data || data.length === 0) {
          setProducts(getFeaturedFallback())
        } else {
          setProducts(data)
        }
      } catch {
        setProducts(getFeaturedFallback())
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

      const getFallback = () => SEED_PRODUCTS.find((p) => p.slug === slug) || null

      if (!isSupabaseConfigured) {
        setProduct(getFallback())
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
          .maybeSingle()

        if (err || !data) {
          setProduct(getFallback())
        } else {
          setProduct(data)
        }
      } catch {
        setProduct(getFallback())
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
      setError(null)

      if (!isSupabaseConfigured) {
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

        if (err || !data || data.length === 0) {
          setCategories(SEED_CATEGORIES)
        } else {
          setCategories(data)
        }
      } catch {
        setCategories(SEED_CATEGORIES)
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [])

  return { categories, loading, error }
}
