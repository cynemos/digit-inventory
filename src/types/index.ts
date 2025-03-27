export interface Category {
  id: string;
  name: string;
  attributes: string[];
  imageUrl?: string;
}

export interface Product {
  id: string;
  reference: string;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  categoryIds: string[];
}

export interface Option {
  id: string;
  reference: string;
  name: string;
  description: string;
  price: number;
  productIds: string[];
  dependencies?: string[]; // IDs of options that must be selected first
}

export interface OrderForm {
  id: string;
  productId: string;
  selectedOptions: string[];
  createdAt: Date;
  updatedAt: Date;
}
