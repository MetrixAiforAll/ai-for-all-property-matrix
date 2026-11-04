const LA_COORDINATES = [
  [34.0038, -118.3306], [33.9995, -118.2694], [34.1111, -118.1928],
  [34.0252, -118.3082], [33.9608, -118.2911], [34.0722, -118.2643],
];

export const DEMO_PROPERTIES = [
  { id: 'LA-2048', address: '1842 W 74th Street', neighborhood: 'Hyde Park, Los Angeles', price: 489000, estimate: 645000, beds: 3, baths: 2, sqft: 1480, status: 'Pre-foreclosure', score: 94, days: 12, image: 'home-a' },
  { id: 'LA-1973', address: '912 E 53rd Street', neighborhood: 'South Park, Los Angeles', price: 365000, estimate: 498000, beds: 2, baths: 1, sqft: 1020, status: 'Tax lien', score: 88, days: 8, image: 'home-b' },
  { id: 'LA-2181', address: '406 N Avenue 59', neighborhood: 'Highland Park, Los Angeles', price: 725000, estimate: 890000, beds: 4, baths: 2, sqft: 1860, status: 'Probate', score: 82, days: 21, image: 'home-c' },
  { id: 'LA-1836', address: '2715 S Hobart Boulevard', neighborhood: 'Jefferson Park, Los Angeles', price: 559000, estimate: 720000, beds: 3, baths: 2, sqft: 1535, status: 'Pre-foreclosure', score: 79, days: 16, image: 'home-d' },
  { id: 'LA-2210', address: '623 W 88th Place', neighborhood: 'Westmont, Los Angeles', price: 429000, estimate: 585000, beds: 3, baths: 1, sqft: 1260, status: 'Auction', score: 75, days: 5, image: 'home-e' },
  { id: 'LA-1752', address: '1336 N Bonnie Brae Street', neighborhood: 'Westlake, Los Angeles', price: 615000, estimate: 780000, beds: 4, baths: 3, sqft: 2010, status: 'Vacant', score: 71, days: 29, image: 'home-f' },
].map((property, index) => ({ ...property, ...{ lat: LA_COORDINATES[index][0], lng: LA_COORDINATES[index][1] } }));

const requiredFields = ['id', 'address', 'neighborhood', 'price', 'beds', 'baths', 'sqft', 'status', 'score'];

function normalizeProperty(item, index) {
  if (!item || typeof item !== 'object') throw new Error('The property API returned an invalid listing.');
  for (const field of requiredFields) {
    if (item[field] === undefined || item[field] === null || item[field] === '') throw new Error(`Property API listing is missing required field: ${field}`);
  }
  const numberFields = ['price', 'beds', 'baths', 'sqft', 'score'];
  for (const field of numberFields) if (!Number.isFinite(Number(item[field]))) throw new Error(`Property API listing has an invalid ${field} value.`);
  const fallback = LA_COORDINATES[index % LA_COORDINATES.length];
  const lat = Number(item.lat ?? item.latitude ?? fallback[0]);
  const lng = Number(item.lng ?? item.longitude ?? fallback[1]);
  if (!Number.isFinite(lat) || !Number.isFinite(lng) || Math.abs(lat) > 90 || Math.abs(lng) > 180) throw new Error('Property API listing has invalid map coordinates.');
  return {
    ...item, id: String(item.id), price: Number(item.price), estimate: Number(item.estimate ?? item.estimatedValue ?? item.price),
    beds: Number(item.beds), baths: Number(item.baths), sqft: Number(item.sqft), score: Math.max(0, Math.min(100, Number(item.score))),
    days: Number(item.days ?? item.daysAgo ?? 0), lat, lng, image: item.image || 'home-a', status: String(item.status),
    address: String(item.address), neighborhood: String(item.neighborhood),
  };
}

export async function getProperties() {
  const endpoint = import.meta.env.VITE_PROPERTIES_API_URL;
  if (!endpoint) return { properties: DEMO_PROPERTIES, source: 'demo' };
  const response = await fetch(endpoint, { headers: { Accept: 'application/json' } });
  if (!response.ok) throw new Error(`Property API request failed (${response.status}). Showing demo listings.`);
  const payload = await response.json();
  const items = Array.isArray(payload) ? payload : payload?.properties;
  if (!Array.isArray(items)) throw new Error('Property API response must be an array or an object with a properties array.');
  return { properties: items.map(normalizeProperty), source: 'api' };
}
