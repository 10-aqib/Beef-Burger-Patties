import { supabase } from '@/lib/supabase'

export interface KitchenStatusSetting {
  isOpen: boolean
  avgDispatchMinutes: number
  statusText: string
}

export interface DeliveryConfigSetting {
  baseFee: number
  freeThreshold: number
  minOrderAmount: number
}

export async function getKitchenStatus(): Promise<KitchenStatusSetting> {
  try {
    const { data, error } = await supabase
      .from('restaurant_settings')
      .select('value')
      .eq('key', 'kitchen_status')
      .single()

    if (error || !data) {
      return { isOpen: true, avgDispatchMinutes: 28, statusText: 'OPEN FOR ORDERS' }
    }

    return data.value as KitchenStatusSetting
  } catch {
    return { isOpen: true, avgDispatchMinutes: 28, statusText: 'OPEN FOR ORDERS' }
  }
}

export async function getDeliveryConfig(): Promise<DeliveryConfigSetting> {
  try {
    const { data, error } = await supabase
      .from('restaurant_settings')
      .select('value')
      .eq('key', 'delivery_config')
      .single()

    if (error || !data) {
      return { baseFee: 150, freeThreshold: 2000, minOrderAmount: 500 }
    }

    return data.value as DeliveryConfigSetting
  } catch {
    return { baseFee: 150, freeThreshold: 2000, minOrderAmount: 500 }
  }
}
