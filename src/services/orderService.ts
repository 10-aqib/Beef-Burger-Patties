import { supabase } from '@/lib/supabase'
import type { CartItem, CartSummary, CheckoutFormData, Order, OrderItem, OrderStatus, OrderStatusHistory } from '@/types'

export interface CreateOrderParams {
  items: CartItem[]
  summary: CartSummary
  formData: CheckoutFormData
  userId: string | null
  estimatedDeliveryMinutes?: number
}

const LOCAL_ORDERS_KEY = 'paput-burger-orders'

function getLocalOrders(): Order[] {
  try {
    const raw = localStorage.getItem(LOCAL_ORDERS_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

function saveLocalOrder(order: Order) {
  try {
    const existing = getLocalOrders()
    const filtered = existing.filter((o) => o.id !== order.id && o.order_number !== order.order_number)
    localStorage.setItem(LOCAL_ORDERS_KEY, JSON.stringify([order, ...filtered]))
  } catch {
    // ignore
  }
}

export function generateCanonicalOrderNumber(): string {
  const now = new Date()
  const yearMonth = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}`
  const rand = Math.floor(1000 + Math.random() * 9000)
  return `PAPUT-${yearMonth}-${rand}`
}

export async function createOrder({
  items,
  summary,
  formData,
  userId,
  estimatedDeliveryMinutes = 30,
}: CreateOrderParams): Promise<Order> {
  const orderNumber = generateCanonicalOrderNumber()
  const nowIso = new Date().toISOString()

  const deliveryAddress = {
    full_name: formData.full_name,
    phone: formData.phone,
    email: formData.email,
    street: formData.street,
    area: formData.area,
    city: formData.city,
    instructions: formData.delivery_instructions,
  }

  // Prepared order items
  const preparedOrderItems: OrderItem[] = items.map((item, idx) => ({
    id: `item-${Date.now()}-${idx}`,
    order_id: '',
    product_id: item.product.id,
    product_name: item.product.name,
    product_image_url: item.product.image_url,
    quantity: item.quantity,
    unit_price: item.unit_price,
    total_price: item.total_price,
    modifiers: item.selected_modifiers,
    special_instructions: item.special_instructions || null,
    created_at: nowIso,
  }))

  // 1. First attempt: Server-Authoritative RPC `create_order_transaction`
  try {
    const rpcPayload = {
      p_user_id: userId,
      p_delivery_address: deliveryAddress,
      p_payment_method: formData.payment_method,
      p_coupon_code: formData.coupon_code || null,
      p_special_instructions: formData.special_instructions || null,
      p_items: items.map((item) => ({
        product_id: item.product.id,
        product_name: item.product.name,
        product_image_url: item.product.image_url,
        quantity: item.quantity,
        unit_price: item.unit_price,
        modifiers: item.selected_modifiers,
        special_instructions: item.special_instructions || null,
      })),
      p_estimated_delivery_minutes: estimatedDeliveryMinutes,
    }

    const { data: rpcData, error: rpcError } = await supabase.rpc(
      'create_order_transaction',
      rpcPayload
    )

    if (!rpcError && rpcData?.id) {
      const confirmedOrder: Order = {
        id: rpcData.id,
        order_number: rpcData.order_number,
        user_id: userId,
        status: (rpcData.status as OrderStatus) || 'placed',
        delivery_address: deliveryAddress,
        payment_method: formData.payment_method,
        payment_status: formData.payment_reference ? 'paid' : 'pending',
        payment_reference: formData.payment_reference || null,
        payment_proof_url: formData.payment_proof_url || null,
        subtotal: rpcData.subtotal ?? summary.subtotal,
        delivery_fee: rpcData.delivery_fee ?? summary.delivery_fee,
        discount: rpcData.discount ?? summary.discount,
        total: rpcData.total ?? summary.total,
        coupon_code: formData.coupon_code || null,
        special_instructions: formData.special_instructions || null,
        estimated_delivery_minutes: estimatedDeliveryMinutes,
        created_at: rpcData.created_at || nowIso,
        updated_at: rpcData.created_at || nowIso,
        items: preparedOrderItems.map((pi) => ({ ...pi, order_id: rpcData.id })),
      }

      saveLocalOrder(confirmedOrder)
      return confirmedOrder
    }
  } catch (rpcEx) {
    console.warn('RPC create_order_transaction not available, using client transaction:', rpcEx)
  }

  // 2. Second attempt: Client-authoritative multi-step Supabase insert
  try {
    const { data: orderData, error: orderError } = await supabase
      .from('orders')
      .insert({
        order_number: orderNumber,
        user_id: userId,
        status: 'placed',
        delivery_address: deliveryAddress,
        payment_method: formData.payment_method,
        payment_status: 'pending',
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

    if (!orderError && orderData?.id) {
      const orderId = orderData.id

      // Insert order items
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

      const { data: itemsData } = await supabase
        .from('order_items')
        .insert(orderItemsPayload)
        .select()

      // Insert status history
      await supabase.from('order_status_history').insert({
        order_id: orderId,
        status: 'placed',
        note: 'Order successfully placed by customer',
      })

      const confirmedOrder: Order = {
        ...orderData,
        items: (itemsData as OrderItem[]) || preparedOrderItems.map((pi) => ({ ...pi, order_id: orderId })),
      }

      saveLocalOrder(confirmedOrder)
      return confirmedOrder
    }
  } catch (clientEx) {
    console.warn('Remote Supabase order insert failed, using persistent local fallback:', clientEx)
  }

  // 3. Third attempt: Resilient local fallback for offline/demo operation
  const localOrderId = `ord-local-${Date.now()}`
  const fallbackOrder: Order = {
    id: localOrderId,
    order_number: orderNumber,
    user_id: userId,
    status: 'placed',
    delivery_address: deliveryAddress,
    payment_method: formData.payment_method,
    payment_status: formData.payment_reference ? 'paid' : 'pending',
    payment_reference: formData.payment_reference || null,
    payment_proof_url: formData.payment_proof_url || null,
    subtotal: summary.subtotal,
    delivery_fee: summary.delivery_fee,
    discount: summary.discount,
    total: summary.total,
    coupon_code: formData.coupon_code || null,
    special_instructions: formData.special_instructions || null,
    estimated_delivery_minutes: estimatedDeliveryMinutes,
    created_at: nowIso,
    updated_at: nowIso,
    items: preparedOrderItems.map((pi) => ({ ...pi, order_id: localOrderId })),
  }

  saveLocalOrder(fallbackOrder)
  return fallbackOrder
}

export async function getOrderByIdOrNumber(idOrNumber: string): Promise<{
  order: Order | null
  items: OrderItem[]
  history: OrderStatusHistory[]
}> {
  const cleanId = idOrNumber.trim()
  const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(cleanId)

  try {
    let order: Order | null = null

    if (isUUID) {
      const { data } = await supabase.from('orders').select('*').eq('id', cleanId).maybeSingle()
      order = data
    }

    if (!order) {
      const { data } = await supabase.from('orders').select('*').eq('order_number', cleanId).maybeSingle()
      order = data
    }

    if (order) {
      const { data: items } = await supabase
        .from('order_items')
        .select('*')
        .eq('order_id', order.id)

      const { data: history } = await supabase
        .from('order_status_history')
        .select('*')
        .eq('order_id', order.id)
        .order('created_at', { ascending: true })

      return {
        order,
        items: (items as OrderItem[]) || [],
        history: (history as OrderStatusHistory[]) || [
          {
            id: `hist-${order.id}`,
            order_id: order.id,
            status: order.status,
            note: 'Order placed',
            created_at: order.created_at,
          },
        ],
      }
    }
  } catch (err) {
    console.warn('Remote getOrderByIdOrNumber error, checking local store:', err)
  }

  // Fallback to local orders
  const localOrders = getLocalOrders()
  const found = localOrders.find(
    (o) => o.id === cleanId || o.order_number.toUpperCase() === cleanId.toUpperCase()
  )

  if (found) {
    return {
      order: found,
      items: found.items || [],
      history: [
        {
          id: `hist-${found.id}`,
          order_id: found.id,
          status: found.status,
          note: 'Order successfully placed',
          created_at: found.created_at,
        },
      ],
    }
  }

  return { order: null, items: [], history: [] }
}

export async function getUserOrders(userId: string): Promise<Order[]> {
  const local = getLocalOrders().filter((o) => !userId || o.user_id === userId)
  try {
    const { data, error } = await supabase
      .from('orders')
      .select(`
        *,
        items:order_items(*)
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (error || !data) return local

    const remoteOrders = data as Order[]
    const ids = new Set(remoteOrders.map((o) => o.id))
    const merged = [...remoteOrders]
    for (const loc of local) {
      if (!ids.has(loc.id)) {
        merged.push(loc)
      }
    }
    return merged
  } catch (err) {
    console.warn('Error fetching user orders remotely:', err)
    return local
  }
}

export async function getAllOrders(): Promise<Order[]> {
  const local = getLocalOrders()
  try {
    const { data, error } = await supabase
      .from('orders')
      .select(`
        *,
        items:order_items(*)
      `)
      .order('created_at', { ascending: false })
      .limit(100)

    if (error || !data) return local

    const remoteOrders = data as Order[]
    const ids = new Set(remoteOrders.map((o) => o.id))
    const merged = [...remoteOrders]
    for (const loc of local) {
      if (!ids.has(loc.id)) {
        merged.push(loc)
      }
    }
    return merged
  } catch (err) {
    console.warn('Error fetching all orders for admin:', err)
    return local
  }
}

export async function updateOrderStatus(
  orderId: string,
  newStatus: OrderStatus,
  note?: string
): Promise<boolean> {
  // Update local store as well
  try {
    const local = getLocalOrders()
    const updated = local.map((o) =>
      o.id === orderId
        ? { ...o, status: newStatus, updated_at: new Date().toISOString() }
        : o
    )
    localStorage.setItem(LOCAL_ORDERS_KEY, JSON.stringify(updated))
  } catch {
    // ignore
  }

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
    console.warn('Remote status update failed, local status updated:', err)
    return true
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
