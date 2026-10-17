export type ProductCategory = 'All' | 'Electronics' | 'Accessories' | 'Lifestyle';

export interface Product {
  id: string;
  name: string;
  tagline: string;
  description: string;
  category: 'Electronics' | 'Accessories' | 'Lifestyle';
  price: number;
  originalPrice?: number;
  rating: number;
  reviewsCount: number;
  stock: number;
  image: string;
  badge?: string;
  features: string[];
  specs: Record<string, string>;
}

export interface CartItem {
  product: Product;
  quantity: number;
  // Note: BUG-01 affects line subtotal calculation when quantity == 2
}

export interface AppliedCoupon {
  code: string;
  discountPercent: number;
  discountAmount: number;
  message: string;
  isBugTriggered?: boolean;
}

export interface CheckoutFormData {
  fullName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  pinCode: string;
  paymentMethod: 'cod' | 'card_demo' | 'upi_demo';
}

export interface Order {
  orderId: string;
  items: CartItem[];
  subtotal: number;
  discount: number;
  shipping: number;
  total: number;
  appliedCoupon: AppliedCoupon | null;
  customer: CheckoutFormData;
  createdAt: string;
}

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info';
  message: string;
}
