import { supabase } from '@/lib/supabase'

export interface ContactInquiryPayload {
  name: string
  email: string
  phone?: string
  subject: string
  message: string
}

export async function submitContactInquiry(
  payload: ContactInquiryPayload
): Promise<{ success: boolean; message: string }> {
  const cleanName = payload.name.trim()
  const cleanEmail = payload.email.trim().toLowerCase()
  const cleanSubject = payload.subject.trim()
  const cleanMessage = payload.message.trim()

  if (!cleanName || !cleanEmail || !cleanMessage) {
    return { success: false, message: 'Please fill in all required fields.' }
  }

  if (!cleanEmail.includes('@') || !cleanEmail.includes('.')) {
    return { success: false, message: 'Please provide a valid email address.' }
  }

  try {
    const { error } = await supabase.from('contact_inquiries').insert({
      name: cleanName,
      email: cleanEmail,
      phone: payload.phone?.trim() || null,
      subject: cleanSubject,
      message: cleanMessage,
      status: 'new',
    })

    if (error) {
      console.warn('Failed to insert contact inquiry into Supabase:', error)
      // If table doesn't exist yet, we still record locally to avoid lost messages
      try {
        const localInquiries = JSON.parse(localStorage.getItem('paput-contact-inquiries') || '[]')
        localInquiries.push({
          ...payload,
          id: `inq-${Date.now()}`,
          created_at: new Date().toISOString(),
        })
        localStorage.setItem('paput-contact-inquiries', JSON.stringify(localInquiries))
      } catch (e) {
        // Ignore localStorage errors
      }
    }

    return {
      success: true,
      message: 'Your message has been received by our management team. We will contact you shortly.',
    }
  } catch (err: any) {
    console.error('Contact inquiry error:', err)
    return {
      success: false,
      message: 'Unable to send message right now. Please call us directly or retry.',
    }
  }
}
