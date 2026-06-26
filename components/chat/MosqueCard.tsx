'use client'

import { useState } from 'react'

// ── Types ──

export interface PrayerTimes {
  fajr: string
  sunrise: string
  dhuhr: string
  asr: string
  maghrib: string
  isha: string
}

export interface Mosque {
  id: string
  name: string
  address: string
  city: string
  state: string
  zip?: string
  phone?: string
  website?: string
  lat: number
  lng: number
  distance?: number
  prayerTimes?: PrayerTimes
}

// ── Helpers ──

function formatDistance(miles?: number): string {
  if (miles === undefined || miles === null) return ''
  return miles < 1
    ? `${Math.round(miles * 5280)} ft`
    : `${miles.toFixed(1)} mi`
}

function buildGoogleMapsUrl(lat: number, lng: number): string {
  return `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`
}

// ── Sub-components ──

function PrayerTimesGrid({ times }: { times: PrayerTimes }) {
  const rows: [string, string][] = [
    ['Fajr', times.fajr],
    ['Sunrise', times.sunrise],
    ['Dhuhr', times.dhuhr],
    ['Asr', times.asr],
    ['Maghrib', times.maghrib],
    ['Isha', times.isha],
  ]

  return (
    <div className="grid grid-cols-3 gap-1.5 mt-2 pt-2 border-t border-charcoal/10">
      {rows.map(([label, time]) => (
        <div key={label} className="text-center">
          <p className="text-xs text-charcoal/40">{label}</p>
          <p className="text-xs font-medium text-charcoal/70">{time}</p>
        </div>
      ))}
    </div>
  )
}

// ── Primary Component ──

interface MosqueCardProps {
  mosque: Mosque
  onSelect?: (id: string) => void
  onDirections?: (lat: number, lng: number) => void
}

export function MosqueCard({ mosque, onSelect, onDirections }: MosqueCardProps) {
  const [expanded, setExpanded] = useState(false)

  return (
    <div className="bg-ivory rounded-2xl border border-charcoal/10 overflow-hidden">
      {/* Main content — always visible */}
      <div className="px-4 py-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-lg">🕌</span>
              <h4 className="font-semibold text-charcoal text-sm truncate">{mosque.name}</h4>
            </div>
            <p className="text-xs text-charcoal/50 mt-1 truncate">
              {mosque.address}, {mosque.city}, {mosque.state}
            </p>
            {mosque.distance !== undefined && (
              <span className="inline-block mt-1.5 text-xs font-medium text-rose-amina bg-rose-amina/10 px-2 py-0.5 rounded-full">
                {formatDistance(mosque.distance)}
              </span>
            )}
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-2 mt-3">
          {onSelect && (
            <button
              onClick={() => onSelect(mosque.id)}
              className="flex-1 text-center text-xs font-medium text-rose-amina bg-rose-amina/10 hover:bg-rose-amina/20 rounded-full py-1.5 transition-colors"
            >
              {mosque.phone ? 'Call' : 'Select'}
            </button>
          )}
          {onDirections && (
            <button
              onClick={() => onDirections(mosque.lat, mosque.lng)}
              className="flex-1 text-center text-xs font-medium text-charcoal/60 hover:text-charcoal/80 bg-charcoal/5 hover:bg-charcoal/10 rounded-full py-1.5 transition-colors"
            >
              Directions
            </button>
          )}
          {mosque.prayerTimes && (
            <button
              onClick={() => setExpanded(!expanded)}
              className="text-xs text-charcoal/40 hover:text-charcoal/60 px-2 py-1.5 transition-colors"
            >
              {expanded ? '▲' : '▼'} Times
            </button>
          )}
        </div>

        {/* Expanded prayer times */}
        {expanded && mosque.prayerTimes && (
          <PrayerTimesGrid times={mosque.prayerTimes} />
        )}
      </div>

      {/* Footer — phone/website links */}
      {(mosque.phone || mosque.website) && (
        <div className="bg-charcoal/5 px-4 py-2 flex items-center gap-3">
          {mosque.phone && (
            <a
              href={`tel:${mosque.phone}`}
              className="text-xs text-rose-amina hover:underline"
            >
              📞 {mosque.phone}
            </a>
          )}
          {mosque.website && (
            <a
              href={mosque.website}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-rose-amina hover:underline ml-auto"
            >
              🌐 Website
            </a>
          )}
        </div>
      )}
    </div>
  )
}

// ── Loading ──

export function MosqueCardSkeleton() {
  return (
    <div className="bg-ivory rounded-2xl border border-charcoal/10 px-4 py-3 animate-pulse">
      <div className="flex items-center gap-2">
        <span className="text-lg">🕌</span>
        <div className="h-4 bg-charcoal/10 rounded w-32" />
      </div>
      <div className="h-3 bg-charcoal/10 rounded w-48 mt-2" />
      <div className="h-3 bg-charcoal/10 rounded w-16 mt-2" />
      <div className="flex gap-2 mt-3">
        <div className="h-7 bg-charcoal/10 rounded-full flex-1" />
        <div className="h-7 bg-charcoal/10 rounded-full flex-1" />
      </div>
    </div>
  )
}

// ── Error ──

interface MosqueCardErrorProps {
  message?: string
  onRetry?: () => void
}

export function MosqueCardError({ message, onRetry }: MosqueCardErrorProps) {
  return (
    <div className="bg-rose-amina/10 border border-rose-amina/20 rounded-2xl px-4 py-4 text-center">
      <p className="text-sm text-rose-amina">⚠️ {message || 'Could not load nearby mosques.'}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="mt-2 text-xs font-medium text-rose-amina bg-white/60 rounded-full px-4 py-1.5 hover:bg-white transition-colors"
        >
          Try again
        </button>
      )}
    </div>
  )
}

// ── Location Permission Prompt ──

interface MosqueSearchPromptProps {
  onShareLocation: () => void
  onSkip: () => void
}

export function MosqueSearchPrompt({ onShareLocation, onSkip }: MosqueSearchPromptProps) {
  return (
    <div className="bg-ivory rounded-2xl border border-charcoal/10 px-4 py-4">
      <div className="flex items-start gap-3">
        <span className="text-xl">📍</span>
        <div className="flex-1">
          <p className="text-sm font-semibold text-charcoal">Find mosques near you</p>
          <p className="text-xs text-charcoal/50 mt-1">
            Share your location to find nearby mosques. Your location is used only for this search.
          </p>
        </div>
      </div>
      <div className="flex gap-2 mt-3">
        <button
          onClick={onShareLocation}
          className="flex-1 text-center text-xs font-medium text-white bg-rose-amina hover:bg-rose-amina/90 rounded-full py-2 transition-colors"
        >
          Share location
        </button>
        <button
          onClick={onSkip}
          className="flex-1 text-center text-xs font-medium text-charcoal/50 hover:text-charcoal/70 bg-charcoal/5 hover:bg-charcoal/10 rounded-full py-2 transition-colors"
        >
          Skip
        </button>
      </div>
    </div>
  )
}

// ── Empty State ──

export function MosqueEmptyState() {
  return (
    <div className="bg-ivory rounded-2xl border border-charcoal/10 px-4 py-6 text-center">
      <span className="text-3xl">🕌</span>
      <p className="text-sm font-semibold text-charcoal mt-2">No mosques found</p>
      <p className="text-xs text-charcoal/50 mt-1">
        Try expanding your search area or checking a different location.
      </p>
    </div>
  )
}
