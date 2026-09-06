import { supabase } from '@/lib/supabase'
import type { CartItem, CartSummary, CheckoutFormData, Order, OrderItem, OrderStatus, OrderStatusHistory } from '@/types'

export interface CreateOrderParams {
  items: CartItem[]
  summary: CartSummary
  formData: CheckoutFormData
  userId: string | null
  estimatedDeliveryMinutes?: number
}

export async function createOrder({
  items,
  summary,
  formData,
  userId,
  estimatedDeliveryMinutes = 30,
}: CreateOrderParams): Promise<Order> {
  const now = new Date()
  const yearMonth = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}`
  const rand = Math.floor(1000 + Math.random() * 9000)
  const orderNumber = `BBP-${yearMonth}-${rand}`

  const deliveryAddress = {
    full_name: formData.full_name,
    phone: formData.phone,
    email: formData.email,
    street: formData.street,
    area: formData.area,
    city: formData.city,
    instructions: formData.delivery_instructions,
  }

  // 1. Insert order
  const { data: orderData, error: orderError } = await supabase
    .from('orders')
    .insert({
      order_number: orderNumber,
      user_id: userId,
      status: 'placed',
      delivery_address: deliveryAddress,
      payment_method: formData.payment_method,
      payment_status: formData.payment_method === 'cod' ? 'pending' : 'pending',
      subtotal: summary.subtotal,
      delivery_fee: summary.delivery_fee,
      discount: summary.discount,
      total: summary.total,
      coupon_code: formData.coupon_code || null,
      special_instructions: formData.special_instructions || null,
      estimated_delivery_minutes: estimatedDeliveryMinutes,
    })
    .select()
    .single()

  if (orderError || !orderData) {
    console.error('Failed to create order in Supabase:', orderError)
    throw new Error(orderError?.message || 'Failed to create order record')
  }

  const orderId = orderData.id

  // 2. Insert order items
  const orderItemsPayload = items.map((item) => ({
    order_id: orderId,
    product_id: item.product.id,
    product_name: item.product.name,
    product_image_url: item.product.image_url,
    quantity: item.quantity,
    unit_price: item.unit_price,
    total_price: item.total_price,
    modifiers: item.selected_modifiers,
    special_instructions: item.special_instructions || null,
  }))

  const { data: itemsData, error: itemsError } = await supabase
    .from('order_items')
    .insert(orderItemsPayload)
    .select()

  if (itemsError) {
    console.warn('Failed to insert order items:', itemsError)
  }

  // 3. Insert initial status history
  await supabase.from('order_status_history').insert({
    order_id: orderId,
    status: 'placed',
    note: 'Order successfully placed by customer',
  })

  return {
    ...orderData,
    items: (itemsData as OrderItem[]) || [],
  } as Order
}

export async function getOrderByIdOrNumber(idOrNumber: string): Promise<{
  order: Order | null
  items: OrderItem[]
  history: OrderStatusHistory[]
}> {
  try {
    // Check by order_number first, else by UUID
    let query = supabase.from('orders').select('*')

    if (idOrNumber.startsWith('SMD-')) {
      query = query.eq('order_number', idOrNumber)
    } else {
      query = query.eq('id', idOrNumber)
    }

    const { data: order, error } = await query.maybeSingle()

    if (error || !order) {
      return { order: null, items: [], history: [] }
    }

    // Fetch items
    const { data: items } = await supabase
      .from('order_items')
      .select('*')
      .eq('order_id', order.id)

    // Fetch history
    const { data: history } = await supabase
      .from('order_status_history')
      .select('*')
      .eq('order_id', order.id)
      .order('created_at', { ascending: true })

    return {
      order: order as Order,
      items: (items as OrderItem[]) || [],
      history: (history as OrderStatusHistory[]) || [],
    }
  } catch (err) {
    console.error('Error in getOrderByIdOrNumber:', err)
    return { order: null, items: [], history: [] }
  }
}

export async function getUserOrders(userId: string): Promise<Order[]> {
  try {
    const { data, error } = await supabase
      .from('orders')
      .select(`
        *,
        items:order_items(*)
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (error || !data) return []
    return data as Order[]
  } catch (err) {
    console.error('Error fetching user orders:', err)
    return []
  }
}

export async function getAllOrders(): Promise<Order[]> {
  try {
    const { data, error } = await supabase
      .from('orders')
      .select(`
        *,
        items:order_items(*)
      `)
      .order('created_at', { ascending: false })
      .limit(100)

    if (error || !data) return []
    return data as Order[]
  } catch (err) {
    console.error('Error fetching all orders for admin:', err)
    return []
  }
}

export async function updateOrderStatus(
  orderId: string,
  newStatus: OrderStatus,
  note?: string
): Promise<boolean> {
  try {
    const { error: updateError } = await supabase
      .from('orders')
      .update({ status: newStatus, updated_at: new Date().toISOString() })
      .eq('id', orderId)

    if (updateError) throw updateError

    await supabase.from('order_status_history').insert({
      order_id: orderId,
      status: newStatus,
      note: note || `Status updated to ${newStatus}`,
    })

    return true
  } catch (err) {
    console.error('Failed to update order status:', err)
    return false
  }
}

export function subscribeToOrderUpdates(
  orderId: string,
  onUpdate: (payload: { status: OrderStatus; updated_at: string }) => void
) {
  const channel = supabase
    .channel(`order-${orderId}`)
    .on(
      'postgres_changes',
      {
        event: 'UPDATE',
        schema: 'public',
        table: 'orders',
        filter: `id=eq.${orderId}`,
      },
      (payload) => {
        if (payload.new) {
          onUpdate({
            status: payload.new.status as OrderStatus,
            updated_at: payload.new.updated_at,
          })
        }
      }
    )
    .subscribe()

  return () => {
    supabase.removeChannel(channel)
  }
}
