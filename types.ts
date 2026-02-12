
export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  category: string;
}

export interface OrderItem {
  productId: string;
  quantity: number;
  price: number;
  name: string;
}

export interface Order {
  id: string;
  customerName: string;
  phone: string;
  address: string;
  items: OrderItem[];
  total: number;
  status: 'pending' | 'shipped' | 'delivered' | 'cancelled';
  createdAt: Date;
}

export interface AdminUser {
  id: string;
  username: string;
  password?: string;
  role: 'admin' | 'manager';
  name: string;
}

export type View = 'home' | 'cart' | 'checkout' | 'admin' | 'login';
