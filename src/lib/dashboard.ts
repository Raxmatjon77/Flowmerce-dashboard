import { apiGet, apiPatch, apiPost } from './api';

export interface DashboardStatusCount {
  status: string;
  count: number;
}

export interface DashboardTrendPoint {
  date: string;
  orders: number;
  revenue: number;
}

export interface DashboardInventoryAlert {
  id: string;
  sku: string;
  productName: string;
  availableQuantity: number;
  totalQuantity: number;
  reservedQuantity: number;
  lowStockThreshold: number;
}

export interface DashboardRecentOrder {
  id: string;
  customerId: string;
  status: string;
  totalAmount: number;
  currency: string;
  itemCount: number;
  createdAt: string;
}

export interface DashboardActivity {
  type: string;
  entityId: string;
  title: string;
  description: string;
  status: string;
  timestamp: string;
}

export interface DashboardHealthService {
  name: string;
  status: 'healthy' | 'degraded' | 'down';
  responseTimeMs: number | null;
  details: string;
  checkedAt: string;
}

export interface DashboardHealth {
  overallStatus: 'healthy' | 'degraded' | 'down';
  services: DashboardHealthService[];
  generatedAt: string;
}

export interface DashboardOverview {
  summary: {
    totalOrders: number;
    ordersToday: number;
    activeOrders: number;
    totalRevenue: number;
    totalInventoryUnits: number;
    lowStockItems: number;
    pendingNotifications: number;
    unhealthyServices: number;
  };
  orderStatusDistribution: DashboardStatusCount[];
  paymentStatusDistribution: DashboardStatusCount[];
  shipmentStatusDistribution: DashboardStatusCount[];
  notificationStatusDistribution: DashboardStatusCount[];
  orderTrend: DashboardTrendPoint[];
  lowStockItems: DashboardInventoryAlert[];
  recentOrders: DashboardRecentOrder[];
  recentActivity: DashboardActivity[];
  health: DashboardHealth;
  generatedAt: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    total: number;
    limit: number;
  };
}

export interface DashboardOrderListItem {
  id: string;
  customerId: string;
  status: string;
  totalAmount: number;
  currency: string;
  itemCount: number;
  shippingAddress: string;
  createdAt: string;
}

export interface DashboardOrderDetailItem {
  id: string;
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  currency: string;
  totalPrice: number;
}

export interface DashboardPaymentReference {
  id: string;
  orderId: string;
  amount: number;
  currency: string;
  status: string;
  method: string;
  transactionId: string | null;
  failureReason: string | null;
  createdAt: string;
}

export interface DashboardShipmentReference {
  id: string;
  orderId: string;
  status: string;
  trackingNumber: string | null;
  carrierName: string | null;
  estimatedDelivery: string | null;
  createdAt: string;
}

export interface DashboardOrderDetail {
  id: string;
  customerId: string;
  status: string;
  totalAmount: number;
  currency: string;
  shippingAddress: string;
  createdAt: string;
  updatedAt: string;
  items: DashboardOrderDetailItem[];
  payment: DashboardPaymentReference | null;
  shipment: DashboardShipmentReference | null;
}

export interface DashboardInventoryListItem {
  id: string;
  sku: string;
  productName: string;
  totalQuantity: number;
  reservedQuantity: number;
  availableQuantity: number;
  lowStockThreshold: number;
  stockState: 'healthy' | 'low' | 'critical';
}

export interface DashboardPaymentListItem {
  id: string;
  orderId: string;
  amount: number;
  currency: string;
  status: string;
  method: string;
  transactionId: string | null;
  failureReason: string | null;
  createdAt: string;
}

export interface DashboardShipmentListItem {
  id: string;
  orderId: string;
  status: string;
  trackingNumber: string | null;
  carrierName: string | null;
  estimatedDelivery: string | null;
  shippingAddress: string;
  createdAt: string;
}

export interface DashboardNotificationListItem {
  id: string;
  recipientId: string;
  channel: string;
  type: string;
  status: string;
  subject: string;
  body: string;
  failureReason: string | null;
  createdAt: string;
}

export const dashboardApi = {
  getOverview: () => apiGet<DashboardOverview>('/api/v1/dashboard/overview'),
  getOrders: (params?: Record<string, string | number | boolean | undefined>) =>
    apiGet<PaginatedResponse<DashboardOrderListItem>>('/api/v1/dashboard/orders', params),
  getOrderDetail: (id: string) =>
    apiGet<DashboardOrderDetail>(`/api/v1/dashboard/orders/${id}`),
  getInventory: (params?: Record<string, string | number | boolean | undefined>) =>
    apiGet<PaginatedResponse<DashboardInventoryListItem>>('/api/v1/dashboard/inventory', params),
  getPayments: (params?: Record<string, string | number | boolean | undefined>) =>
    apiGet<PaginatedResponse<DashboardPaymentListItem>>('/api/v1/dashboard/payments', params),
  getShipments: (params?: Record<string, string | number | boolean | undefined>) =>
    apiGet<PaginatedResponse<DashboardShipmentListItem>>('/api/v1/dashboard/shipments', params),
  getNotifications: (params?: Record<string, string | number | boolean | undefined>) =>
    apiGet<PaginatedResponse<DashboardNotificationListItem>>('/api/v1/dashboard/notifications', params),
  getHealth: () => apiGet<DashboardHealth>('/api/v1/dashboard/health'),
  getActivity: (limit = 20) =>
    apiGet<PaginatedResponse<DashboardActivity>>('/api/v1/dashboard/activity', { limit }),
};

export const operationsApi = {
  confirmOrder: (orderId: string) => apiPost<{ message: string }>(`/api/v1/orders/${orderId}/confirm`),
  cancelOrder: (orderId: string) => apiPost<{ message: string }>(`/api/v1/orders/${orderId}/cancel`),
  reserveInventory: (payload: { orderId: string; items: Array<{ sku: string; quantity: number }> }) =>
    apiPost<{ message: string }>('/api/v1/inventory/reserve', payload),
  releaseInventory: (payload: { orderId: string; items: Array<{ sku: string; quantity: number }> }) =>
    apiPost<{ message: string }>('/api/v1/inventory/release', payload),
  refundPayment: (paymentId: string) => apiPost<{ message: string }>(`/api/v1/payments/${paymentId}/refund`),
  createShipment: (payload: {
    orderId: string;
    address: {
      street: string;
      city: string;
      state: string;
      zipCode: string;
      country: string;
    };
  }) => apiPost('/api/v1/shipments', payload),
  updateShipmentStatus: (shipmentId: string, status: string) =>
    apiPatch<{ message: string }>(`/api/v1/shipments/${shipmentId}/status`, { status }),
  sendNotification: (payload: {
    recipientId: string;
    channel: string;
    type: string;
    subject: string;
    body: string;
    metadata?: Record<string, unknown>;
  }) => apiPost('/api/v1/notifications', payload),
};

export function formatCurrency(amount: number, currency = 'USD') {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function formatDate(value: string | null) {
  if (!value) {
    return 'N/A';
  }

  return new Date(value).toLocaleDateString();
}

export function formatDateTime(value: string | null) {
  if (!value) {
    return 'N/A';
  }

  return new Date(value).toLocaleString();
}

export function formatStatusLabel(status: string) {
  return status.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, (char) => char.toUpperCase());
}
