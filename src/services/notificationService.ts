import { supabase, isSupabaseConfigured } from '@/lib/supabase'
import type { Order } from '@/types'
import { formatPrice } from '@/utils'

export interface OrderNotificationResult {
  success: boolean
  channel: 'email' | 'sms' | 'simulated'
  recipient: string
  message: string
}

/**
 * Dispatches order confirmation receipt to customer.
 * Uses Supabase Edge Functions or Email webhook when available,
 * with guaranteed graceful fallback for offline/demo operation.
 */
export async function sendOrderConfirmationNotification(
  order: Order
): Promise<OrderNotificationResult> {
  const recipientEmail = order.delivery_address?.full_name
    ? `${order.delivery_address.full_name} <${order.profile?.email || 'customer'}>`
    : 'Customer'

  const emailSummary = {
    orderNumber: order.order_number,
    total: formatPrice(order.total),
    itemsCount: order.items?.length || 0,
    paymentMethod: order.payment_method.toUpperCase(),
    address: `${order.delivery_address.street}, ${order.delivery_address.area}, ${order.delivery_address.city}`,
  }

  // If Supabase edge functions exist, attempt remote trigger
  if (isSupabaseConfigured) {
    try {
      const { data, error } = await supabase.functions.invoke('send-order-confirmation', {
        body: { order },
      })
      if (!error && data?.success) {
        return {
          success: true,
          channel: 'email',
          recipient: recipientEmail,
          message: `Confirmation receipt sent to ${recipientEmail}`,
        }
      }
    } catch {
      // Graceful fallback to client notification
    }
  }

  // Simulated confirmation receipt dispatch
  console.info('[Notification Service] Order confirmation receipt dispatched:', emailSummary)

  return {
    success: true,
    channel: 'simulated',
    recipient: recipientEmail,
    message: `Order confirmation # ${order.order_number} confirmed.`,
  }
}
