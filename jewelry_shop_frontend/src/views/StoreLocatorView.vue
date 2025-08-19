<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { http } from '@/api/http'
import type { StoreLocation } from '@/api/types'
import { loadScriptOnce } from '@/utils/loadScript'

const stores = ref<StoreLocation[]>([])
const loading = ref(false)
const error = ref<string | null>(null)
const address = ref<string>('')

const mapEl = ref<HTMLDivElement | null>(null)
const mapsAvailable = ref<boolean>(!!import.meta.env.VITE_GOOGLE_MAPS_API_KEY)

type GLatLngLiteral = { lat: number; lng: number }
type GLatLngBounds = { extend: (pos: GLatLngLiteral) => void; isEmpty: () => boolean }
type GMapInstance = { fitBounds: (b: GLatLngBounds) => void }
type GMarker = { setMap: (map: GMapInstance | null) => void }
type GMapsApi = {
  maps: {
    Map: new (el: HTMLElement, opts: { center: GLatLngLiteral; zoom: number }) => GMapInstance
    Marker: new (opts: { position: GLatLngLiteral; map: GMapInstance; title?: string }) => GMarker
    LatLngBounds: new () => GLatLngBounds
  }
}

const getGoogle = (): GMapsApi | undefined => (window as unknown as { google?: GMapsApi }).google

let map: GMapInstance | null = null
let markers: GMarker[] = []

function setMarkers(list: StoreLocation[]) {
  const google = getGoogle()
  if (!map || !google) return
  const currentMap = map as GMapInstance
  // Clear markers
  markers.forEach((m) => m.setMap(null))
  markers = []
  const bounds = new google.maps.LatLngBounds()
  list.forEach((s) => {
    if (s.lat != null && s.lng != null) {
      const pos = { lat: Number(s.lat), lng: Number(s.lng) }
      const marker = new google.maps.Marker({ position: pos, map: currentMap, title: s.name })
      markers.push(marker)
      bounds.extend(pos)
    }
  })
  if (!bounds.isEmpty()) {
    currentMap.fitBounds(bounds)
  }
}

async function initMapIfNeeded() {
  if (!mapsAvailable.value) return
  const key = import.meta.env.VITE_GOOGLE_MAPS_API_KEY as string | undefined
  if (!key) return
  const src = `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(key)}`
  try {
    await loadScriptOnce(src)
    const google = getGoogle()
    if (mapEl.value && !map && google) {
      map = new google.maps.Map(mapEl.value, {
        center: { lat: 37.7749, lng: -122.4194 },
        zoom: 4,
      })
    }
  } catch (e: unknown) {
    console.warn('Google Maps failed to load; falling back to list.', e)
    mapsAvailable.value = false
  }
}

async function loadAll() {
  loading.value = true
  error.value = null
  try {
    const { data } = await http.get<StoreLocation[] | { stores: StoreLocation[] }>('/stores')
    if (Array.isArray(data)) {
      stores.value = data
    } else if (data && typeof data === 'object' && 'stores' in data) {
      const d = data as { stores?: StoreLocation[] }
      stores.value = d.stores ?? []
    } else {
      stores.value = []
    }
    setMarkers(stores.value)
  } catch (e: unknown) {
    if (typeof e === 'object' && e !== null && 'response' in e) {
      const resp = (e as { response?: { data?: { message?: string } } }).response
      error.value = resp?.data?.message || 'Failed to load stores'
    } else if (e instanceof Error) {
      error.value = e.message
    } else {
      error.value = 'Failed to load stores'
    }
  } finally {
    loading.value = false
  }
}

async function searchNearby() {
  loading.value = true
  error.value = null
  try {
    const { data } = await http.get<StoreLocation[] | { stores?: StoreLocation[] }>('/stores/nearby', { params: { address: address.value || undefined } })
    let list: StoreLocation[] = []
    if (Array.isArray(data)) {
      list = data
    } else if (data && typeof data === 'object') {
      list = data.stores ?? []
    }
    stores.value = list
    setMarkers(stores.value)
  } catch (e: unknown) {
    if (typeof e === 'object' && e !== null && 'response' in e) {
      const resp = (e as { response?: { data?: { message?: string } } }).response
      error.value = resp?.data?.message || 'Nearby search failed'
    } else if (e instanceof Error) {
      error.value = e.message
    } else {
      error.value = 'Nearby search failed'
    }
  } finally {
    loading.value = false
  }
}

onMounted(async () => {
  await initMapIfNeeded()
  await loadAll()
})
</script>

<template>
  <div>
    <h2>Store Locator</h2>

    <form class="search" @submit.prevent="searchNearby">
      <input v-model="address" type="text" placeholder="Enter address or city" />
      <button class="primary" type="submit">Search</button>
    </form>

    <div v-if="mapsAvailable" ref="mapEl" class="map"></div>
    <div v-else class="map-fallback">Map unavailable. Showing list of stores.</div>

    <div v-if="loading">Loading stores...</div>
    <div v-else-if="error" class="error">{{ error }}</div>

    <ul class="store-list">
      <li class="store" v-for="s in stores" :key="s.id">
        <div class="name">{{ s.name }}</div>
        <div class="addr" v-if="s.address">{{ s.address }}</div>
        <div v-if="s.phone">Phone: {{ s.phone }}</div>
      </li>
    </ul>
  </div>
</template>

<style scoped>
h2 { margin-bottom: 12px; }
.search {
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 8px;
  margin-bottom: 12px;
}
.search input {
  padding: 8px;
  border: 1px solid var(--color-border);
  border-radius: 6px;
}
.primary {
  background: #B19CD9;
  color: #fff;
  border: none;
  padding: 8px 12px;
  border-radius: 6px;
  cursor: pointer;
}
.map {
  height: 240px;
  border: 1px solid var(--color-border);
  border-radius: 8px;
  margin-bottom: 12px;
  background: #f5f5f5;
}
.map-fallback {
  border: 1px dashed var(--color-border);
  padding: 10px;
  border-radius: 8px;
  margin-bottom: 12px;
}
.error { color: #d33; }
.store-list {
  list-style: none;
  padding: 0;
  display: grid;
  gap: 8px;
}
.store {
  border: 1px solid var(--color-border);
  border-radius: 8px;
  padding: 10px;
  background: #fff;
}
@media (prefers-color-scheme: dark) {
  .store { background: var(--color-background-soft); }
}
</style>
