export type OrderStatus = 'processing' | 'shipped' | 'delivered' | 'cancelled';

export interface OrderItem {
  id: string;
  orderId: string;
  productId: string;
  name: string;
  price: number;
  quantity: number;
  color?: string | null;
  size?: string | null;
  image?: string | null;
  product?: {
    id: string;
    name: string;
  };
}

export interface Order {
  id: string;
  orderNumber: string;
  userId: string;
  status: OrderStatus;
  total: number;
  address: string;
  createdAt: string;
  updatedAt: string;
  orderItems: OrderItem[];
  user?: {
    id: string;
    name: string | null;
    email: string;
  };
}

export interface CreateOrderRequest {
  items: {
    productId: string;
    quantity: number;
    color?: string;
    size?: string;
  }[];
  addressId: string;
}