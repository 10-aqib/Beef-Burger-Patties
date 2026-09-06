import { supabase } from '@/lib/supabase'
import { SEED_REVIEWS } from '@/lib/seedData'
import type { Review } from '@/types'

export async function getApprovedReviews(): Promise<Review[]> {
  try {
    const { data, error } = await supabase
      .from('reviews')
      .select('*')
      .eq('is_approved', true)
      .order('created_at', { ascending: false })

    if (error || !data || data.length === 0) {
      return SEED_REVIEWS
    }

    return data.map((r) => ({
      ...r,
      profile: {
        id: r.user_id,
        full_name: r.author_name || 'Verified Smash Lover',
        avatar_url: null,
      },
    })) as Review[]
  } catch (err) {
    return SEED_REVIEWS
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
  try {
    const { error } = await supabase.from('reviews').insert({
      author_name: authorName,
      rating,
      title,
      body,
      product_id: productId || null,
      is_approved: true, // Auto-approve for demo / customer feedback
    })

    if (error) throw error
    return { success: true }
  } catch (err: any) {
    console.error('Failed to submit review:', err)
    return { success: false, error: err.message || 'Failed to submit review' }
  }
}
