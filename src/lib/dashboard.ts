import { apiGet, apiPatch, apiPost } from './api';
import type { components } from '../types/api.generated';

// --- Generated types from backend OpenAPI spec ---
export type DashboardOverview = components['schemas']['DashboardOverviewResponseDto'];
export type DashboardStatusCount = components['schemas']['DashboardStatusCountDto'];
export type DashboardTrendPoint = components['schemas']['DashboardTrendPointDto'];
export type DashboardInventoryAlert = components['schemas']['DashboardInventoryAlertDto'];
export type DashboardRecentOrder = components['schemas']['DashboardRecentOrderDto'];
export type DashboardActivity = components['schemas']['DashboardActivityDto'];
export type DashboardHealth = components['schemas']['DashboardHealthResponseDto'];
export type DashboardHealthService = components['schemas']['DashboardHealthServiceDto'];
export type DashboardOrderListItem = components['schemas']['DashboardOrderListItemDto'];
export type DashboardOrderDetail = components['schemas']['DashboardOrderDetailDto'];
export type DashboardOrderDetailItem = components['schemas']['DashboardOrderDetailItemDto'];
export type DashboardPaymentReference = components['schemas']['DashboardPaymentReferenceDto'];
export type DashboardShipmentReference = components['schemas']['DashboardShipmentReferenceDto'];
export type DashboardInventoryListItem = components['schemas']['DashboardInventoryListItemDto'];
export type DashboardPaymentListItem = components['schemas']['DashboardPaymentListItemDto'];
export type DashboardShipmentListItem = components['schemas']['DashboardShipmentListItemDto'];
export type DashboardNotificationListItem = components['schemas']['DashboardNotificationListItemDto'];

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    total: number;
    limit: number;
  };
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
