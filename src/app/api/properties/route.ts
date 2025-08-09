import { NextResponse } from 'next/server';
import type { Property } from '@/types/game';

// Simple normalization helper to guard against missing values
function normalizeToProperty(raw: any): Property | null {
  try {
    const id = String(raw.property_id || raw.property_id || raw.listing_id || raw.id);
    const addressObj = raw.address || raw.location || {};
    const addressLine = addressObj.line || addressObj.address || addressObj.street || 'Unknown address';
    const city = addressObj.city || addressObj.municipality || 'Unknown city';
    const state = addressObj.state_code || addressObj.state || 'US';
    const postal_code = addressObj.postal_code || addressObj.zip || '';
    const price = Number(raw.list_price ?? raw.price ?? 0);
    const beds = Number(raw.beds ?? raw.bedrooms ?? raw.beds_max ?? 0);
    const baths = Number(raw.baths_full ?? raw.bathrooms ?? raw.baths ?? raw.full_baths ?? 0);
    const sqft = Number(
      raw.building_size?.size ?? raw.lot_size?.size ?? raw.sqft ?? raw.square_feet ?? 0
    );
    const lotSqft = Number(raw.lot_size?.size ?? raw.lot_size ?? 0) || 0;
    const yearBuilt = Number(raw.year_built ?? raw.yearBuilt ?? 0) || 0;
    const propType: Property['propertyType'] = (
      raw.prop_type || raw.property_type || 'Single Family'
    );
    const photoCandidates: string[] = [];
    const photosArr = raw.photos || raw.photo || [];
    if (Array.isArray(photosArr)) {
      for (const p of photosArr) {
        const href = p?.href || p?.url;
        if (href) photoCandidates.push(href);
      }
    } else if (typeof photosArr === 'string') {
      photoCandidates.push(photosArr);
    }
    if (raw.primary_photo?.href) photoCandidates.unshift(raw.primary_photo.href);
    if (raw.thumbnail) photoCandidates.push(raw.thumbnail);
    if (raw.primary_image_url) photoCandidates.push(raw.primary_image_url);
    const photos: string[] = photoCandidates.filter(Boolean).slice(0, 5);

  const description = raw.description || raw.publicRemarks || raw?.prop_summary || 'No description available';
    const features: string[] = [];

    if (!id || !price) return null;
    const finalPhotos = photos.length
      ? photos
      : ['https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800'];

    return {
      id,
      address: addressLine,
      city,
      state,
      zipCode: postal_code,
      price,
      bedrooms: beds,
      bathrooms: baths,
      squareFeet: sqft,
      lotSize: lotSqft,
      yearBuilt,
      propertyType: propType as Property['propertyType'],
      images: finalPhotos,
      description,
      features,
      source: 'api',
    };
  } catch {
    return null;
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const limit = Number(searchParams.get('limit') || '5');
  const defaultCity = process.env.DEFAULT_CITY || 'Provo';
  const defaultState = process.env.DEFAULT_STATE || 'UT';
  const defaultLocation = process.env.DEFAULT_LOCATION || `${defaultCity}, ${defaultState}`;
  const location = searchParams.get('location') || `${searchParams.get('city') || defaultCity}, ${searchParams.get('state') || defaultState}`;
  // Derive city/state from location for APIs that require them
  const [derivedCityRaw = defaultCity, derivedStateRaw = defaultState] = location.split(',').map((s) => s?.trim());
  const city = searchParams.get('city') || derivedCityRaw;
  const state_code = searchParams.get('state') || derivedStateRaw;
  // Additional params per docs
  const pageRaw = Number(searchParams.get('page') || '1');
  const sort = searchParams.get('sort') || '';
  const radiusRaw = Number(searchParams.get('search_radius') || '0');
  const page = Number.isFinite(pageRaw) && pageRaw > 0 ? Math.floor(pageRaw) : 1;
  const search_radius = Math.max(0, Math.min(50, Number.isFinite(radiusRaw) ? radiusRaw : 0));
  const safeLimit = Math.max(1, Math.min(200, limit));

  const rapidApiKey = process.env.RAPIDAPI_KEY;
  const rapidHost = process.env.RAPIDAPI_HOST || 'realtor.p.rapidapi.com';

  if (!rapidApiKey) {
    return NextResponse.json(
      { error: 'Server missing RAPIDAPI_KEY' },
      { status: 500 }
    );
  }

  try {
    // Try multiple known hosts to reduce configuration friction
    const candidateHosts = Array.from(
      new Set([
        rapidHost,
        'realtor16.p.rapidapi.com',
        'realtor.p.rapidapi.com',
        'realtor-com.p.rapidapi.com',
      ].filter(Boolean))
    );

    let lastErrorText = '';
    for (const host of candidateHosts) {
      const useRealtor16 = /realtor16\.p\.rapidapi\.com$/i.test(host || '');
      const realtor16Params = new URLSearchParams({
        location,
        limit: String(safeLimit),
        page: String(page),
        search_radius: String(search_radius),
      });
      if (sort) realtor16Params.set('sort', sort);

      // Fallback API params
      const offset = String((page - 1) * safeLimit);
      const v2Params = new URLSearchParams({
        city,
        state_code,
        limit: String(safeLimit),
        offset,
      });
      v2Params.set('sort', sort || 'relevance');

      const url = useRealtor16
        ? `https://${host}/search/forsale?${realtor16Params.toString()}`
        : `https://${host}/properties/v2/list-for-sale?${v2Params.toString()}`;

      const res = await fetch(url, {
        headers: {
          'X-RapidAPI-Key': rapidApiKey,
          'X-RapidAPI-Host': host,
        },
        next: { revalidate: 60 },
      });

      if (!res.ok) {
        const text = await res.text();
        lastErrorText = text;
        // If not subscribed to this host, try the next
        if (/not subscribed/i.test(text) || res.status === 403) {
          continue;
        }
        // Other errors: return immediately
        return NextResponse.json(
          { error: 'Upstream error', details: text, hostUsed: host, urlUsed: url },
          { status: 502 }
        );
      }

      const data = await res.json();
      // Some realtor16 responses nest address under property.address
      const items: any[] = Array.isArray(data?.properties)
        ? data.properties
        : Array.isArray(data?.data)
        ? data.data
        : Array.isArray(data?.results)
        ? data.results
        : Array.isArray(data?.listings)
        ? data.listings
        : [];
      const normalized = items
        .map(normalizeToProperty)
        .filter(Boolean) as Property[];

      return NextResponse.json({ properties: normalized.slice(0, limit), hostUsed: host });
    }

    return NextResponse.json(
      { error: 'Upstream error', details: lastErrorText || 'No hosts succeeded', hostTried: candidateHosts },
      { status: 502 }
    );
  } catch (err: any) {
    return NextResponse.json(
      { error: 'Failed to fetch properties', details: err?.message },
      { status: 500 }
    );
  }
}

