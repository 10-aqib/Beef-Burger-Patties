import { supabase } from '@/lib/supabase'
import { SEED_PRODUCTS, SEED_CATEGORIES, SEED_DEALS } from '@/lib/seedData'
import type { Product, Category, Deal } from '@/types'

export async function getProducts(categoryId?: string): Promise<Product[]> {
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
      .order('sort_order', { ascending: true })

    if (categoryId && categoryId !== 'all') {
      query = query.eq('category_id', categoryId)
    }

    const { data, error } = await query

    if (error || !data || data.length === 0) {
      if (categoryId && categoryId !== 'all') {
        return SEED_PRODUCTS.filter((p) => p.category_id === categoryId)
      }
      return SEED_PRODUCTS
    }

    return data as Product[]
  } catch (err) {
    console.warn('Fallback to seed products:', err)
    if (categoryId && categoryId !== 'all') {
      return SEED_PRODUCTS.filter((p) => p.category_id === categoryId)
    }
    return SEED_PRODUCTS
  }
}

export async function getFeaturedProducts(): Promise<Product[]> {
  try {
    const { data, error } = await supabase
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
      .order('sort_order', { ascending: true })

    if (error || !data || data.length === 0) {
      return SEED_PRODUCTS.filter((p) => p.is_featured)
    }

    return data as Product[]
  } catch (err) {
    console.warn('Fallback to featured seed products:', err)
    return SEED_PRODUCTS.filter((p) => p.is_featured)
  }
}

export async function getProductById(productId: string): Promise<Product | null> {
  try {
    const { data, error } = await supabase
      .from('products')
      .select(`
        *,
        category:categories(*),
        modifiers:modifier_groups(
          *,
          options:modifier_options(*)
        )
      `)
      .eq('id', productId)
      .single()

    if (error || !data) {
      return SEED_PRODUCTS.find((p) => p.id === productId) || null
    }

    return data as Product
  } catch (err) {
    return SEED_PRODUCTS.find((p) => p.id === productId) || null
  }
}

export async function getCategories(): Promise<Category[]> {
  try {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .eq('is_active', true)
      .order('sort_order', { ascending: true })

    if (error || !data || data.length === 0) {
      return SEED_CATEGORIES
    }

    return data as Category[]
  } catch (err) {
    return SEED_CATEGORIES
  }
}

export async function getDeals(): Promise<Deal[]> {
  try {
    const { data, error } = await supabase
      .from('deals')
      .select('*')
      .eq('is_active', true)
      .order('sort_order', { ascending: true })

    if (error || !data || data.length === 0) {
      return SEED_DEALS
    }

    return data as Deal[]
  } catch (err) {
    return SEED_DEALS
  }
}
