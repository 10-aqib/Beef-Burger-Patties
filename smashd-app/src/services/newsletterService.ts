import { supabase } from '@/lib/supabase'

export async function subscribeNewsletter(email: string): Promise<{ success: boolean; message: string }> {
  const cleanEmail = email.trim().toLowerCase()
  if (!cleanEmail || !cleanEmail.includes('@') || !cleanEmail.includes('.')) {
    return { success: false, message: 'Please provide a valid email address.' }
  }

  try {
    const { error } = await supabase.from('newsletter_subscribers').insert({ email: cleanEmail })

    if (error) {
      if (error.code === '23505') {
        // Unique violation
        return { success: true, message: "You're already subscribed to the VIP Flavor Dispatch!" }
      }
      throw error
    }

    return { success: true, message: 'Welcome to the VIP Flavor Dispatch! Check your inbox soon.' }
  } catch (err: any) {
    console.error('Newsletter error:', err)
    return { success: false, message: 'Unable to subscribe right now. Please try again later.' }
  }
}
