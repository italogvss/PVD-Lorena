export type UserRole = 'Admin' | 'Employee';
export type SaleStatus = 'Active' | 'Cancelled';
export type PaymentMethod = 'Cash' | 'PIX' | 'Credit Card' | 'Debit Card';
export type ReportPeriod = 'daily' | 'weekly' | 'monthly';

export interface AuthUser {
  id: string;
  name: string;
  username: string;
  role: UserRole;
}

export interface User {
  id: string;
  name: string;
  username: string;
  role: UserRole;
  createdAt: string;
}

export interface Product {
  id: string;
  name: string;
  barcode?: string;
  ncm?: string;
  price: number;
  stock: number;
  isActive: boolean;
  createdAt: string;
}

export interface SaleItem {
  id: string;
  saleId: string;
  productId?: string;
  productName: string;
  unitPrice: number;
  quantity: number;
  subtotal: number;
}

export interface Sale {
  id: string;
  operatorId: string;
  operatorName: string;
  customerName?: string;
  paymentMethod: PaymentMethod;
  isInstallment: boolean;
  installmentCount?: number;
  installmentValue?: number;
  total: number;
  status: SaleStatus;
  cancelledById?: string;
  cancelledAt?: string;
  createdAt: string;
}

export interface SaleDetail extends Sale {
  items: SaleItem[];
  amountPaid: number;
  change: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  page: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
}

export interface CreateProductRequest {
  name: string;
  barcode?: string;
  ncm?: string;
  price: number;
  stock: number;
}

export interface UpdateProductRequest {
  name: string;
  barcode?: string;
  ncm?: string;
  price: number;
}

export interface CreateSaleItemRequest {
  productId: string;
  quantity: number;
}

export interface CreateSaleRequest {
  customerName?: string;
  paymentMethod: PaymentMethod;
  isInstallment: boolean;
  installmentCount?: number;
  amountPaid: number;
  items: CreateSaleItemRequest[];
}

export interface CreateUserRequest {
  name: string;
  email: string;
  password: string;
  role: UserRole;
}

export interface UpdateUserRequest {
  name: string;
  email: string;
}

export interface SalesMetrics {
  totalSales: number;
  totalRevenue: number;
  averageTicket: number;
  cancelledCount: number;
  period: string;
}

export interface SalesByOperator {
  operatorId: string;
  operatorName: string;
  totalSales: number;
  totalRevenue: number;
}

export interface StockSnapshot {
  productId: string;
  productName: string;
  barcode?: string;
  stock: number;
  price: number;
  isActive: boolean;
}
