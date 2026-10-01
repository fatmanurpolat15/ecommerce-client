export interface Page<T> {
  content: T[];
  totalPages: number;
  totalElements: number;
  number: number;
  size: number;
  first: boolean;
  last: boolean;
  empty: boolean;
}

export interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  currency: string;
  imageUrl: string | null;
  categoryId: number;
  categoryName: string;
}

export interface Category {
  id: number;
  name: string;
  description: string;
}

export type UserRole = "CUSTOMER" | "ADMIN";

export interface User {
  id: number;
  email: string;
  name: string;
  role: UserRole;
}