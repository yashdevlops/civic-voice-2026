export interface GeoCoords {
  lat: number;
  lng: number;
  state?: string;
}

/**
 * Bundled lookup table of Indian major cities, capitals, and district headquarters
 * with resolved coordinates (latitude/longitude) and state names.
 */
export const INDIA_CITY_COORDINATES: Record<string, GeoCoords> = {
  // Major Metros & Tech Hubs
  bengaluru: { lat: 12.9716, lng: 77.5946, state: "Karnataka" },
  bangalore: { lat: 12.9716, lng: 77.5946, state: "Karnataka" },
  bhubaneswar: { lat: 20.2961, lng: 85.8245, state: "Odisha" },
  cuttack: { lat: 20.4625, lng: 85.8828, state: "Odisha" },
  puri: { lat: 19.8135, lng: 85.8312, state: "Odisha" },
  delhi: { lat: 28.7041, lng: 77.1025, state: "Delhi" },
  "new delhi": { lat: 28.6139, lng: 77.2090, state: "Delhi" },
  mumbai: { lat: 19.0760, lng: 72.8777, state: "Maharashtra" },
  pune: { lat: 18.5204, lng: 73.8567, state: "Maharashtra" },
  nagpur: { lat: 21.1458, lng: 79.0882, state: "Maharashtra" },
  chennai: { lat: 13.0827, lng: 80.2707, state: "Tamil Nadu" },
  coimbatore: { lat: 11.0168, lng: 76.9558, state: "Tamil Nadu" },
  kolkata: { lat: 22.5726, lng: 88.3639, state: "West Bengal" },
  hyderabad: { lat: 17.3850, lng: 78.4867, state: "Telangana" },
  ahmedabad: { lat: 23.0225, lng: 72.5714, state: "Gujarat" },
  surat: { lat: 21.1702, lng: 72.8311, state: "Gujarat" },
  jaipur: { lat: 26.9124, lng: 75.7873, state: "Rajasthan" },
  udaipur: { lat: 24.5854, lng: 73.7125, state: "Rajasthan" },
  lucknow: { lat: 26.8467, lng: 80.9462, state: "Uttar Pradesh" },
  kanpur: { lat: 26.4499, lng: 80.3319, state: "Uttar Pradesh" },
  noida: { lat: 28.5355, lng: 77.3910, state: "Uttar Pradesh" },
  gurugram: { lat: 28.4595, lng: 77.0266, state: "Haryana" },
  gurgaon: { lat: 28.4595, lng: 77.0266, state: "Haryana" },
  chandigarh: { lat: 30.7333, lng: 76.7794, state: "Punjab" },
  patna: { lat: 25.5941, lng: 85.1376, state: "Bihar" },
  kochi: { lat: 9.9312, lng: 76.2673, state: "Kerala" },
  thiruvananthapuram: { lat: 8.5241, lng: 76.9366, state: "Kerala" },
  trivandrum: { lat: 8.5241, lng: 76.9366, state: "Kerala" },
  indore: { lat: 22.7196, lng: 75.8577, state: "Madhya Pradesh" },
  bhopal: { lat: 23.2599, lng: 77.4126, state: "Madhya Pradesh" },
  guwahati: { lat: 26.1445, lng: 91.7362, state: "Assam" },
  ranchi: { lat: 23.3441, lng: 85.3096, state: "Jharkhand" },
  jamshedpur: { lat: 22.8046, lng: 86.2029, state: "Jharkhand" },
  raipur: { lat: 21.2514, lng: 81.6296, state: "Chhattisgarh" },
  dehradun: { lat: 30.3165, lng: 78.0322, state: "Uttarakhand" },
  shimla: { lat: 31.1048, lng: 77.1734, state: "Himachal Pradesh" },
  srinagar: { lat: 34.0837, lng: 74.7973, state: "Jammu and Kashmir" },
  visakhapatnam: { lat: 17.6868, lng: 83.2185, state: "Andhra Pradesh" },
  vijayawada: { lat: 16.5062, lng: 80.6480, state: "Andhra Pradesh" },
  mysuru: { lat: 12.2958, lng: 76.6394, state: "Karnataka" },
  mysore: { lat: 12.2958, lng: 76.6394, state: "Karnataka" },
};

/**
 * State centroid fallback map.
 */
export const INDIA_STATE_CENTROIDS: Record<string, GeoCoords> = {
  karnataka: { lat: 15.3173, lng: 75.7139 },
  odisha: { lat: 20.9517, lng: 85.0985 },
  orissa: { lat: 20.9517, lng: 85.0985 },
  delhi: { lat: 28.7041, lng: 77.1025 },
  maharashtra: { lat: 19.7515, lng: 75.7139 },
  "tamil nadu": { lat: 11.1271, lng: 78.6569 },
  "west bengal": { lat: 22.9868, lng: 87.8550 },
  telangana: { lat: 18.1124, lng: 79.0193 },
  gujarat: { lat: 22.2587, lng: 71.1924 },
  rajasthan: { lat: 27.0238, lng: 74.2179 },
  "uttar pradesh": { lat: 26.8467, lng: 80.9462 },
  haryana: { lat: 29.0588, lng: 76.0856 },
  punjab: { lat: 31.1471, lng: 75.3412 },
  bihar: { lat: 25.0961, lng: 85.3131 },
  kerala: { lat: 10.8505, lng: 76.2711 },
  "madhya pradesh": { lat: 22.9734, lng: 78.6569 },
  assam: { lat: 26.2006, lng: 92.9376 },
  jharkhand: { lat: 23.6102, lng: 85.2799 },
  chhattisgarh: { lat: 21.2787, lng: 81.8661 },
  uttarakhand: { lat: 30.0668, lng: 79.0193 },
  "himachal pradesh": { lat: 31.1048, lng: 77.1734 },
  "andhra pradesh": { lat: 15.9129, lng: 79.7400 },
};

/**
 * Fallback coordinate for India's geographic center.
 */
export const DEFAULT_INDIA_CENTROID: GeoCoords = {
  lat: 20.5937,
  lng: 78.9629,
};

/**
 * Resolves latitude & longitude for a given city and state name.
 */
export function resolveLocationCoords(city: string, state: string): { lat: number; lng: number } {
  const normCity = city.trim().toLowerCase();
  const normState = state.trim().toLowerCase();

  // 1. Direct city lookup
  if (normCity && INDIA_CITY_COORDINATES[normCity]) {
    const matched = INDIA_CITY_COORDINATES[normCity];
    return { lat: matched.lat, lng: matched.lng };
  }

  // 2. Search partial city matches
  for (const [key, coords] of Object.entries(INDIA_CITY_COORDINATES)) {
    if (normCity && (key.includes(normCity) || normCity.includes(key))) {
      return { lat: coords.lat, lng: coords.lng };
    }
  }

  // 3. State centroid fallback
  if (normState && INDIA_STATE_CENTROIDS[normState]) {
    const stateCoords = INDIA_STATE_CENTROIDS[normState];
    return { lat: stateCoords.lat, lng: stateCoords.lng };
  }

  // 4. Default India center centroid
  return { lat: DEFAULT_INDIA_CENTROID.lat, lng: DEFAULT_INDIA_CENTROID.lng };
}
