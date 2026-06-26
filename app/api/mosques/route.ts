import { type NextRequest } from 'next/server'

// ── Types ──

interface PrayerTimes {
  fajr: string
  sunrise: string
  dhuhr: string
  asr: string
  maghrib: string
  isha: string
}

interface Mosque {
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

// ── Curated dataset ──
// Static, no-API-key dataset of well-known masjids across major US metros.
// Prayer times are representative samples for display; swap in a live provider later.

const MOSQUES: Mosque[] = [
  {
    id: 'icnyu-manhattan',
    name: 'Islamic Center at NYU',
    address: '238 Thompson St',
    city: 'New York',
    state: 'NY',
    zip: '10012',
    phone: '+1 212-998-4712',
    website: 'https://www.icnyu.org',
    lat: 40.7295,
    lng: -73.9965,
    prayerTimes: { fajr: '5:12 AM', sunrise: '6:38 AM', dhuhr: '1:02 PM', asr: '4:48 PM', maghrib: '7:24 PM', isha: '8:50 PM' },
  },
  {
    id: 'icc-bridgeview-chicago',
    name: 'Mosque Foundation',
    address: '7360 W 93rd St',
    city: 'Bridgeview',
    state: 'IL',
    zip: '60455',
    phone: '+1 708-430-5666',
    website: 'https://mosquefoundation.org',
    lat: 41.7164,
    lng: -87.8043,
    prayerTimes: { fajr: '5:20 AM', sunrise: '6:44 AM', dhuhr: '12:56 PM', asr: '4:40 PM', maghrib: '7:08 PM', isha: '8:34 PM' },
  },
  {
    id: 'icsc-los-angeles',
    name: 'Islamic Center of Southern California',
    address: '434 S Vermont Ave',
    city: 'Los Angeles',
    state: 'CA',
    zip: '90020',
    phone: '+1 213-382-9200',
    website: 'https://www.icsconline.org',
    lat: 34.0648,
    lng: -118.2917,
    prayerTimes: { fajr: '5:34 AM', sunrise: '6:52 AM', dhuhr: '12:48 PM', asr: '4:30 PM', maghrib: '7:02 PM', isha: '8:20 PM' },
  },
  {
    id: 'adams-center-sterling',
    name: 'ADAMS Center',
    address: '46903 Sugarland Rd',
    city: 'Sterling',
    state: 'VA',
    zip: '20164',
    phone: '+1 703-433-1325',
    website: 'https://www.adamscenter.org',
    lat: 39.0299,
    lng: -77.4108,
    prayerTimes: { fajr: '5:08 AM', sunrise: '6:32 AM', dhuhr: '1:04 PM', asr: '4:52 PM', maghrib: '7:28 PM', isha: '8:54 PM' },
  },
  {
    id: 'icd-detroit',
    name: 'Islamic Center of Detroit',
    address: '14350 Tireman Ave',
    city: 'Detroit',
    state: 'MI',
    zip: '48228',
    phone: '+1 313-996-1010',
    website: 'https://www.icdmasjid.org',
    lat: 42.3445,
    lng: -83.2024,
    prayerTimes: { fajr: '5:24 AM', sunrise: '6:48 AM', dhuhr: '1:30 PM', asr: '5:14 PM', maghrib: '7:42 PM', isha: '9:08 PM' },
  },
  {
    id: 'maix-houston',
    name: 'Maryam Islamic Center',
    address: '535 Greenhill Dr',
    city: 'Sugar Land',
    state: 'TX',
    zip: '77479',
    phone: '+1 281-265-1635',
    website: 'https://www.maryamic.org',
    lat: 29.5694,
    lng: -95.6072,
    prayerTimes: { fajr: '5:40 AM', sunrise: '7:00 AM', dhuhr: '1:12 PM', asr: '4:58 PM', maghrib: '7:18 PM', isha: '8:38 PM' },
  },
  {
    id: 'roswell-atlanta',
    name: 'Masjid Al-Farooq',
    address: '442 14th St NW',
    city: 'Atlanta',
    state: 'GA',
    zip: '30318',
    phone: '+1 404-874-7521',
    website: 'https://alfarooqmasjid.org',
    lat: 33.7838,
    lng: -84.4047,
    prayerTimes: { fajr: '5:36 AM', sunrise: '6:58 AM', dhuhr: '1:18 PM', asr: '5:04 PM', maghrib: '7:30 PM', isha: '8:48 PM' },
  },
  {
    id: 'mcc-east-bay',
    name: 'Muslim Community Center - East Bay',
    address: '5724 W Las Positas Blvd',
    city: 'Pleasanton',
    state: 'CA',
    zip: '94588',
    phone: '+1 925-485-1786',
    website: 'https://mccebay.org',
    lat: 37.6936,
    lng: -121.9009,
    prayerTimes: { fajr: '5:30 AM', sunrise: '6:50 AM', dhuhr: '12:52 PM', asr: '4:34 PM', maghrib: '7:06 PM', isha: '8:24 PM' },
  },
]

// ── Helpers ──

const toRad = (deg: number) => (deg * Math.PI) / 180

function haversineMiles(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 3958.8 // Earth radius in miles
  const dLat = toRad(lat2 - lat1)
  const dLng = toRad(lng2 - lng1)
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

// ── Route ──

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const latParam = searchParams.get('lat')
    const lngParam = searchParams.get('lng')
    const query = searchParams.get('q')?.trim().toLowerCase() ?? ''
    const limit = Math.min(Number(searchParams.get('limit')) || 5, MOSQUES.length)

    let results: Mosque[] = MOSQUES.map(m => ({ ...m }))

    // Text/city filter when provided
    if (query) {
      results = results.filter(m =>
        [m.name, m.city, m.state, m.zip].some(field => field?.toLowerCase().includes(query))
      )
    }

    // Distance ranking when coordinates are provided
    const lat = latParam !== null ? Number(latParam) : NaN
    const lng = lngParam !== null ? Number(lngParam) : NaN
    const hasCoords = Number.isFinite(lat) && Number.isFinite(lng)

    if (hasCoords) {
      results = results
        .map(m => ({ ...m, distance: Number(haversineMiles(lat, lng, m.lat, m.lng).toFixed(1)) }))
        .sort((a, b) => (a.distance ?? Infinity) - (b.distance ?? Infinity))
    }

    return Response.json({ mosques: results.slice(0, limit), source: 'curated' })
  } catch (err) {
    console.error('[mosques] route error:', err)
    return new Response(JSON.stringify({ error: 'Failed to load mosques' }), { status: 500 })
  }
}
