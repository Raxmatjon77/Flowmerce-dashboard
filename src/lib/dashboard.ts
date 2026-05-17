import { apiGet, apiPatch, apiPost } from './api';
import type { components } from '../types/api.generated';
import type { ConversationDto, MessageDto } from '../types/support';
import type { CouponDto, CreateCouponPayload } from '../types/coupon';

export type { ConversationDto, MessageDto };

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:3000';

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

export type { CouponDto, CreateCouponPayload };

export const couponApi = {
  getCoupons: (params?: { isActive?: boolean; page?: number; limit?: number }) =>
    apiGet<{ data: CouponDto[]; total: number }>('/api/v1/coupons', params as Record<string, string | number | boolean | undefined>),
  getCoupon: (id: string) =>
    apiGet<CouponDto>(`/api/v1/coupons/${id}`),
  createCoupon: (payload: CreateCouponPayload) =>
    apiPost<CouponDto>('/api/v1/coupons', payload),
  deactivateCoupon: (id: string) =>
    apiPost<{ message: string }>(`/api/v1/coupons/${id}/deactivate`),
};

export const supportApi = {
  getConversations: (status?: string) =>
    apiGet<ConversationDto[]>('/api/v1/support/conversations', status ? { status } : undefined),
  getConversation: (id: string) =>
    apiGet<ConversationDto>(`/api/v1/support/conversations/${id}`),
  getMessages: (conversationId: string) =>
    apiGet<MessageDto[]>(`/api/v1/support/conversations/${conversationId}/messages`),
  sendMessage: (conversationId: string, content: string) =>
    apiPost<MessageDto>(`/api/v1/support/conversations/${conversationId}/messages`, { content }),
  closeConversation: (id: string) =>
    apiPost<ConversationDto>(`/api/v1/support/conversations/${id}/close`),
};

export { API_BASE };

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
