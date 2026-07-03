export interface Address {
  id: string;
  label?: string | null;
  fullName: string;
  phone: string;
  street: string;
  apartment?: string | null;
  city: string;
  postalCode?: string | null;
  isDefault: boolean;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateAddressRequest {
  label?: string;
  fullName: string;
  phone: string;
  street: string;
  apartment?: string;
  city: string;
  postalCode?: string;
  isDefault?: boolean;
}

export interface UpdateAddressRequest {
  id: string;
  label?: string;
  fullName?: string;
  phone?: string;
  street?: string;
  apartment?: string;
  city?: string;
  postalCode?: string;
  isDefault?: boolean;
}