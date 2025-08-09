import { Property } from '@/types/game';

const mockProperties: Property[] = [
  {
    id: '1',
    address: '123 Mountain View Dr',
    city: 'Provo',
    state: 'UT',
    zipCode: '84604',
    price: 485000,
    bedrooms: 4,
    bathrooms: 3,
    squareFeet: 2850,
    lotSize: 8500,
    yearBuilt: 2018,
    propertyType: 'Single Family',
    images: [
      'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800',
      'https://images.unsplash.com/photo-1583608205776-bfd35f0d9f83?w=800',
    ],
    description: 'Beautiful modern home with mountain views',
    features: ['Granite Countertops', '2-Car Garage', 'Hardwood Floors', 'Smart Home'],
  },
  {
    id: '2',
    address: '456 University Ave #302',
    city: 'Orem',
    state: 'UT',
    zipCode: '84057',
    price: 285000,
    bedrooms: 2,
    bathrooms: 2,
    squareFeet: 1150,
    lotSize: 0,
    yearBuilt: 2021,
    propertyType: 'Condo',
    images: [
      'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800',
      'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800',
    ],
    description: 'Modern condo near shopping and dining',
    features: ['Balcony', 'In-Unit Laundry', 'Gym Access', 'Pool'],
  },
  {
    id: '3',
    address: '789 Canyon Rd',
    city: 'Spanish Fork',
    state: 'UT',
    zipCode: '84660',
    price: 625000,
    bedrooms: 5,
    bathrooms: 4,
    squareFeet: 3800,
    lotSize: 12000,
    yearBuilt: 2020,
    propertyType: 'Single Family',
    images: [
      'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800',
      'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800',
    ],
    description: 'Luxury home with premium finishes throughout',
    features: ['Theater Room', '3-Car Garage', 'Wine Cellar', 'Chef Kitchen'],
  },
  {
    id: '4',
    address: '321 Maple St',
    city: 'Lehi',
    state: 'UT',
    zipCode: '84043',
    price: 395000,
    bedrooms: 3,
    bathrooms: 2,
    squareFeet: 1950,
    lotSize: 6000,
    yearBuilt: 2015,
    propertyType: 'Townhouse',
    images: [
      'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=800',
      'https://images.unsplash.com/photo-1565953522043-baea26b83b7e?w=800',
    ],
    description: 'Charming townhouse in family-friendly neighborhood',
    features: ['Fenced Yard', 'Updated Kitchen', 'Storage Room', 'HOA Maintained'],
  },
  {
    id: '5',
    address: '654 Oak Ave',
    city: 'Pleasant Grove',
    state: 'UT',
    zipCode: '84062',
    price: 550000,
    bedrooms: 4,
    bathrooms: 3.5,
    squareFeet: 3200,
    lotSize: 9500,
    yearBuilt: 2019,
    propertyType: 'Single Family',
    images: [
      'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=800',
      'https://images.unsplash.com/photo-1613977257363-707ba9348227?w=800',
    ],
    description: 'Stunning two-story home with open floor plan',
    features: ['Vaulted Ceilings', 'Master Suite', 'Landscaped Yard', 'Solar Panels'],
  },
  {
    id: '6',
    address: '987 Pine Circle',
    city: 'American Fork',
    state: 'UT',
    zipCode: '84003',
    price: 425000,
    bedrooms: 3,
    bathrooms: 2.5,
    squareFeet: 2400,
    lotSize: 7200,
    yearBuilt: 2017,
    propertyType: 'Single Family',
    images: [
      'https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=800',
      'https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=800',
    ],
    description: 'Well-maintained home in quiet cul-de-sac',
    features: ['Fireplace', 'Walk-in Closets', 'Covered Patio', 'RV Parking'],
  },
  {
    id: '7',
    address: '246 Aspen Way #105',
    city: 'Saratoga Springs',
    state: 'UT',
    zipCode: '84045',
    price: 315000,
    bedrooms: 2,
    bathrooms: 2,
    squareFeet: 1280,
    lotSize: 0,
    yearBuilt: 2022,
    propertyType: 'Condo',
    images: [
      'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800',
      'https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=800',
    ],
    description: 'Brand new condo with lake access',
    features: ['Lake Views', 'Clubhouse', 'Fitness Center', 'Walking Trails'],
  },
  {
    id: '8',
    address: '135 Summit Dr',
    city: 'Highland',
    state: 'UT',
    zipCode: '84003',
    price: 875000,
    bedrooms: 6,
    bathrooms: 5,
    squareFeet: 5200,
    lotSize: 18000,
    yearBuilt: 2021,
    propertyType: 'Single Family',
    images: [
      'https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?w=800',
      'https://images.unsplash.com/photo-1600566753086-00878bfb9b5c?w=800',
    ],
    description: 'Executive estate with panoramic valley views',
    features: ['Pool', 'Sport Court', 'Guest Suite', 'Smart Home System'],
  },
];

export function getMockProperties(count: number = 5): Property[] {
  // Shuffle and return requested number of properties
  const shuffled = [...mockProperties].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count).map((p) => ({ ...p, source: 'mock' }));
}

// This function would be replaced with actual API call
export async function fetchRealEstateData(params?: { city?: string; state?: string; limit?: number; baseUrl?: string; location?: string; page?: number; sort?: string; search_radius?: number }): Promise<Property[]> {
  const { city = 'Provo', state = 'UT', limit = 5, baseUrl, location, page = 1, sort = '', search_radius = 0 } = params || {};

  try {
    const base = `${baseUrl ? baseUrl.replace(/\/$/, '') : ''}/api/properties`;
    const paramsQ = new URLSearchParams({
      city,
      state,
      limit: String(limit),
      location: location || `${city}, ${state}`,
      page: String(page),
      search_radius: String(search_radius),
    });
    if (sort) paramsQ.set('sort', sort);
    const url = `${base}?${paramsQ.toString()}`;
    const res = await fetch(url, {
      cache: 'no-store',
    });
    if (!res.ok) throw new Error('Failed');
    const data = await res.json();
    const properties = (data?.properties || []) as Property[];
    if (!properties.length) throw new Error('Empty');
    return properties.map((p) => ({
  ...p,
  source: 'api',
  beds_max: p.beds_max || undefined,
  beds_min: p.beds_min || undefined,
  baths_consolidated: p.baths_consolidated || undefined,
  baths_max: p.baths_max || undefined,
  baths_min: p.baths_min || undefined,
  sqft_max: p.sqft_max || undefined,
  sqft_min: p.sqft_min || undefined,
}));
  } catch {
    // Fallback to mocks
    return getMockProperties(limit);
  }
}
