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
    const beds = Number(raw.beds ?? raw.bedrooms ?? 0);
    const baths = Number(raw.baths_full ?? raw.bathrooms ?? raw.baths ?? 0);
    const sqft = Number(
      raw.building_size?.size ?? raw.lot_size?.size ?? raw.sqft ?? raw.square_feet ?? 0
    );
    const lotSqft = Number(raw.lot_size?.size ?? raw.lot_size ?? 0) || 0;
    const yearBuilt = Number(raw.year_built ?? raw.yearBuilt ?? 0) || 0;
    const propType: Property['propertyType'] = (
      raw.prop_type || raw.property_type || 'Single Family'
    );
    const photos: string[] =
      (raw.photos || raw.photo || [])
        .map((p: any) => p?.href || p?.url)
        .filter(Boolean)
        .slice(0, 5);

    const description = raw.description || raw.publicRemarks || 'No description available';
    const features: string[] = [];

    if (!id || !price || photos.length === 0) return null;

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
      images: photos,
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
  const city = searchParams.get('city') || 'Provo';
  const state_code = searchParams.get('state') || 'UT';

  const rapidApiKey = process.env.RAPIDAPI_KEY;
  const rapidHost = process.env.RAPIDAPI_HOST || 'realtor.p.rapidapi.com';

  if (!rapidApiKey) {
    return NextResponse.json(
      { error: 'Server missing RAPIDAPI_KEY' },
      { status: 500 }
    );
  }

  try {
    // Realtor (RapidAPI) v2 list-for-sale-style endpoint
    const url = `https://${rapidHost}/properties/v2/list-for-sale?city=${encodeURIComponent(
      city
    )}&state_code=${encodeURIComponent(state_code)}&limit=${limit}&offset=0&sort=relevance`;

    const res = await fetch(url, {
      headers: {
        'X-RapidAPI-Key': rapidApiKey,
        'X-RapidAPI-Host': rapidHost,
      },
      // 10s timeout using AbortController
      next: { revalidate: 60 },
    });

    if (!res.ok) {
      const text = await res.text();
      return NextResponse.json(
        { error: 'Upstream error', details: text },
        { status: 502 }
      );
    }

    const data = await res.json();
    const results: any[] = data?.properties || data?.data || data?.results || [];
    const normalized = results
      .map(normalizeToProperty)
      .filter(Boolean) as Property[];

    return NextResponse.json({ properties: normalized.slice(0, limit) });
  } catch (err: any) {
    return NextResponse.json(
      { error: 'Failed to fetch properties', details: err?.message },
      { status: 500 }
    );
  }
}

