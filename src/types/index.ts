export * from './database';

export type Language = 'en' | 'ar';

export interface NavLink {
  href: string;
  labelEn: string;
  labelAr: string;
}

export interface BusinessCoordinates {
  lat: number;
  lng: number;
}
