export interface UserLocation {
  city: string;
  state: string;
  lat: number | null;
  lng: number | null;
  /**
   * Human-readable combined label derived as `${city}, ${state}`.
   */
  label: string;
}
