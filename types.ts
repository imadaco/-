
export interface Product {
  id: string;
  name: string;
  description: string;
  price: number; // هذا هو السعر الأدنى (سعر المدير)
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
  referralId?: string; // معرف المسوق الذي تمت البيعة عن طريقه
  commission?: number; // العمولة المحتسبة لهذا الطلب
}

export interface LandingPage {
  id: string;
  productId: string;
  creatorId: string;
  customPrice: number;
  slug: string; // الرابط الفريد
}

export interface AdminUser {
  id: string;
  username: string;
  password?: string;
  role: 'admin' | 'manager';
  name: string;
  balance: number; // رصيد الأرباح
}

export type View = 'home' | 'cart' | 'checkout' | 'admin' | 'login' | 'landing-page';
