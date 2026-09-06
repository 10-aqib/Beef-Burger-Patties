import { supabase } from '@/lib/supabase'
import { SEED_LOCATIONS } from '@/lib/seedData'
import type { Location, DeliveryZone } from '@/types'

export async function getLocations(city?: string): Promise<Location[]> {
  try {
    let query = supabase
      .from('locations')
      .select('*')
      .order('sort_order', { ascending: true })

    if (city && city.toLowerCase() !== 'all') {
      query = query.ilike('city', `%${city}%`)
    }

    const { data, error } = await query

    if (error || !data || data.length === 0) {
      if (city && city.toLowerCase() !== 'all') {
        return SEED_LOCATIONS.filter((l) => l.city.toLowerCase() === city.toLowerCase())
      }
      return SEED_LOCATIONS
    }

    return data as Location[]
  } catch (err) {
    console.warn('Fallback to seed locations:', err)
    if (city && city.toLowerCase() !== 'all') {
      return SEED_LOCATIONS.filter((l) => l.city.toLowerCase() === city.toLowerCase())
    }
    return SEED_LOCATIONS
  }
}

export async function getDeliveryZones(city?: string): Promise<DeliveryZone[]> {
  try {
    let query = supabase
      .from('delivery_zones')
      .select('*')
      .eq('is_active', true)
      .order('sort_order', { ascending: true })

    if (city && city.toLowerCase() !== 'all') {
      query = query.ilike('city', `%${city}%`)
    }

    const { data, error } = await query
    if (error || !data || data.length === 0) {
      return []
    }
    return data as DeliveryZone[]
  } catch (err) {
    console.warn('Error fetching delivery zones:', err)
    return []
  }
}
