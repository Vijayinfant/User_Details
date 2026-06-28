export interface User {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  department: string;
}

export interface BackendCompany {
  name: string;
  catchPhrase?: string;
  bs?: string;
}

export interface BackendAddress {
  street?: string;
  suite?: string;
  city?: string;
  zipcode?: string;
  geo?: {
    lat: string;
    lng: string;
  };
}

export interface BackendUser {
  id: number;
  name: string;
  username?: string;
  email: string;
  phone?: string;
  website?: string;
  company?: BackendCompany;
  address?: BackendAddress;
}

export interface FilterOptions {
  firstName: string;
  lastName: string;
  email: string;
  department: string;
}

export type SortKey = 'id' | 'firstName' | 'lastName' | 'email' | 'department';

export interface SortOptions {
  key: SortKey;
  direction: 'asc' | 'desc';
}
