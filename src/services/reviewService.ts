import { supabase } from '@/lib/supabase'
import { SEED_REVIEWS } from '@/lib/seedData'
import type { Review } from '@/types'

const LOCAL_REVIEWS_KEY = 'paput-burger-customer-reviews'

function getLocalReviews(): Review[] {
  try {
    const raw = localStorage.getItem(LOCAL_REVIEWS_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

function saveLocalReview(review: Review) {
  try {
    const existing = getLocalReviews()
    localStorage.setItem(LOCAL_REVIEWS_KEY, JSON.stringify([review, ...existing]))
  } catch {
    // ignore
  }
}

export async function getApprovedReviews(): Promise<Review[]> {
  const localReviews = getLocalReviews()

  try {
    const { data, error } = await supabase
      .from('reviews')
      .select('*')
      .eq('is_approved', true)
      .order('created_at', { ascending: false })

    if (error || !data) {
      return localReviews
    }

    const remoteReviews: Review[] = data.map((r) => ({
      ...r,
      profile: {
        id: r.user_id,
        full_name: r.author_name || 'Customer Review',
        avatar_url: null,
      },
    }))

    // Combine remote and local, deduping by id
    const ids = new Set(remoteReviews.map((r) => r.id))
    const merged = [...remoteReviews]
    for (const lr of localReviews) {
      if (!ids.has(lr.id)) {
        merged.push(lr)
      }
    }
    return merged.length > 0 ? merged : SEED_REVIEWS
  } catch {
    return localReviews.length > 0 ? localReviews : SEED_REVIEWS
  }
}

export async function submitCustomerReview({
  authorName,
  rating,
  title,
  body,
  productId,
}: {
  authorName: string
  rating: number
  title: string
  body: string
  productId?: string
}): Promise<{ success: boolean; error?: string }> {
  const newReview: Review = {
    id: `rev-${Date.now()}`,
    user_id: 'anonymous',
    product_id: productId || null,
    order_id: null,
    rating,
    title: title || 'Customer Review',
    body,
    is_approved: false,
    created_at: new Date().toISOString(),
    profile: {
      id: 'anonymous',
      full_name: authorName,
      avatar_url: null,
    },
  }

  try {
    const { error } = await supabase.from('reviews').insert({
      id: newReview.id,
      author_name: authorName,
      rating,
      title: title || 'Customer Review',
      body,
      product_id: productId || null,
      is_approved: false,
    })

    if (error) {
      console.warn('Remote review sync failed:', error.message)
    }
    return { success: true }
  } catch {
    return { success: true }
  }
}
