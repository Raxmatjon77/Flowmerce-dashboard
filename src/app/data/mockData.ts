// Mock data for the dashboard
import {
  NotificationChannel,
  NotificationStatus,
  OrderStatus,
  PaymentStatus,
  ServiceHealthStatus,
  ShipmentStatus,
  UserRole,
  UserStatus,
} from '../../lib/constants';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  createdAt: string;
  lastActive: string;
  totalOrders: number;
}

export interface Order {
  id: string;
  customerId: string;
  customerName: string;
  status: OrderStatus;
  total: number;
  items: number;
  createdAt: string;
  shippingAddress: string;
  paymentMethod: string;
}

export interface InventoryItem {
  id: string;
  sku: string;
  productName: string;
  quantity: number;
  reserved: number;
  available: number;
  lowStockThreshold: number;
  price: number;
}

export interface Payment {
  id: string;
  orderId: string;
  amount: number;
  currency: string;
  method: string;
  status: PaymentStatus;
  createdAt: string;
}

export interface Shipment {
  id: string;
  orderId: string;
  trackingNumber: string;
  carrier: string;
  status: ShipmentStatus;
  createdAt: string;
  estimatedDelivery: string;
}

export interface Notification {
  id: string;
  recipient: string;
  channel: NotificationChannel;
  type: string;
  status: NotificationStatus;
  createdAt: string;
  message: string;
}

export interface HealthStatus {
  service: string;
  status: ServiceHealthStatus;
  responseTime: number;
  uptime: number;
  lastCheck: string;
  details?: string;
}

// Users
export const mockUsers: User[] = [
  { id: '1', name: 'Admin User', email: 'admin@platform.com', role: UserRole.ADMIN, status: UserStatus.ACTIVE, createdAt: '2024-01-15', lastActive: '2026-04-09T10:30:00', totalOrders: 0 },
  { id: '2', name: 'Sarah Johnson', email: 'sarah.j@email.com', role: UserRole.CUSTOMER, status: UserStatus.ACTIVE, createdAt: '2024-03-20', lastActive: '2026-04-09T09:15:00', totalOrders: 24 },
  { id: '3', name: 'Michael Chen', email: 'michael.chen@email.com', role: UserRole.CUSTOMER, status: UserStatus.ACTIVE, createdAt: '2024-02-10', lastActive: '2026-04-08T18:45:00', totalOrders: 18 },
  { id: '4', name: 'Service Bot', email: 'service@platform.com', role: UserRole.SERVICE, status: UserStatus.ACTIVE, createdAt: '2024-01-15', lastActive: '2026-04-09T10:35:00', totalOrders: 0 },
  { id: '5', name: 'Emma Davis', email: 'emma.d@email.com', role: UserRole.CUSTOMER, status: UserStatus.ACTIVE, createdAt: '2024-04-05', lastActive: '2026-04-07T14:20:00', totalOrders: 12 },
  { id: '6', name: 'James Wilson', email: 'james.w@email.com', role: UserRole.CUSTOMER, status: UserStatus.INACTIVE, createdAt: '2023-11-12', lastActive: '2026-03-15T11:00:00', totalOrders: 8 },
];

// Orders
export const mockOrders: Order[] = [
  { id: 'ORD-2401', customerId: '2', customerName: 'Sarah Johnson', status: OrderStatus.SHIPPED, total: 459.99, items: 3, createdAt: '2026-04-08T14:30:00', shippingAddress: '123 Main St, New York, NY 10001', paymentMethod: 'Credit Card' },
  { id: 'ORD-2402', customerId: '3', customerName: 'Michael Chen', status: OrderStatus.PAYMENT_PROCESSED, total: 299.50, items: 2, createdAt: '2026-04-09T08:15:00', shippingAddress: '456 Oak Ave, San Francisco, CA 94102', paymentMethod: 'PayPal' },
  { id: 'ORD-2403', customerId: '5', customerName: 'Emma Davis', status: OrderStatus.CONFIRMED, total: 125.00, items: 1, createdAt: '2026-04-09T09:00:00', shippingAddress: '789 Pine Rd, Austin, TX 78701', paymentMethod: 'Credit Card' },
  { id: 'ORD-2404', customerId: '2', customerName: 'Sarah Johnson', status: OrderStatus.INVENTORY_RESERVED, total: 789.99, items: 4, createdAt: '2026-04-09T10:00:00', shippingAddress: '123 Main St, New York, NY 10001', paymentMethod: 'Credit Card' },
  { id: 'ORD-2405', customerId: '6', customerName: 'James Wilson', status: OrderStatus.CANCELLED, total: 199.00, items: 2, createdAt: '2026-04-07T16:45:00', shippingAddress: '321 Elm St, Seattle, WA 98101', paymentMethod: 'Debit Card' },
  { id: 'ORD-2406', customerId: '3', customerName: 'Michael Chen', status: OrderStatus.PENDING, total: 549.99, items: 5, createdAt: '2026-04-09T10:20:00', shippingAddress: '456 Oak Ave, San Francisco, CA 94102', paymentMethod: 'PayPal' },
];

// Inventory
export const mockInventory: InventoryItem[] = [
  { id: '1', sku: 'TECH-001', productName: 'Wireless Headphones Pro', quantity: 145, reserved: 12, available: 133, lowStockThreshold: 50, price: 149.99 },
  { id: '2', sku: 'TECH-002', productName: 'Smart Watch Series 5', quantity: 32, reserved: 8, available: 24, lowStockThreshold: 30, price: 299.99 },
  { id: '3', sku: 'HOME-001', productName: 'Air Purifier Deluxe', quantity: 78, reserved: 5, available: 73, lowStockThreshold: 40, price: 199.50 },
  { id: '4', sku: 'FASH-001', productName: 'Premium Leather Wallet', quantity: 210, reserved: 18, available: 192, lowStockThreshold: 100, price: 79.99 },
  { id: '5', sku: 'TECH-003', productName: 'Portable Charger 20000mAh', quantity: 18, reserved: 3, available: 15, lowStockThreshold: 50, price: 49.99 },
  { id: '6', sku: 'HOME-002', productName: 'Smart LED Bulb 4-Pack', quantity: 8, reserved: 2, available: 6, lowStockThreshold: 25, price: 34.99 },
];

// Payments
export const mockPayments: Payment[] = [
  { id: 'PAY-8901', orderId: 'ORD-2401', amount: 459.99, currency: 'USD', method: 'Credit Card', status: PaymentStatus.COMPLETED, createdAt: '2026-04-08T14:32:00' },
  { id: 'PAY-8902', orderId: 'ORD-2402', amount: 299.50, currency: 'USD', method: 'PayPal', status: PaymentStatus.COMPLETED, createdAt: '2026-04-09T08:17:00' },
  { id: 'PAY-8903', orderId: 'ORD-2403', amount: 125.00, currency: 'USD', method: 'Credit Card', status: PaymentStatus.COMPLETED, createdAt: '2026-04-09T09:02:00' },
  { id: 'PAY-8904', orderId: 'ORD-2404', amount: 789.99, currency: 'USD', method: 'Credit Card', status: PaymentStatus.PENDING, createdAt: '2026-04-09T10:02:00' },
  { id: 'PAY-8905', orderId: 'ORD-2405', amount: 199.00, currency: 'USD', method: 'Debit Card', status: PaymentStatus.REFUNDED, createdAt: '2026-04-07T16:47:00' },
];

// Shipments
export const mockShipments: Shipment[] = [
  { id: 'SHIP-5601', orderId: 'ORD-2401', trackingNumber: '1Z999AA10123456784', carrier: 'UPS', status: ShipmentStatus.IN_TRANSIT, createdAt: '2026-04-08T16:00:00', estimatedDelivery: '2026-04-11' },
  { id: 'SHIP-5602', orderId: 'ORD-2403', trackingNumber: '9400111699000987654321', carrier: 'USPS', status: ShipmentStatus.PENDING, createdAt: '2026-04-09T09:30:00', estimatedDelivery: '2026-04-13' },
];

// Notifications
export const mockNotifications: Notification[] = [
  { id: 'NOT-1001', recipient: 'sarah.j@email.com', channel: NotificationChannel.EMAIL, type: 'Order Shipped', status: NotificationStatus.SENT, createdAt: '2026-04-08T16:05:00', message: 'Your order ORD-2401 has been shipped' },
  { id: 'NOT-1002', recipient: 'michael.chen@email.com', channel: NotificationChannel.EMAIL, type: 'Payment Processed', status: NotificationStatus.SENT, createdAt: '2026-04-09T08:18:00', message: 'Payment received for order ORD-2402' },
  { id: 'NOT-1003', recipient: 'emma.d@email.com', channel: NotificationChannel.SMS, type: 'Order Confirmed', status: NotificationStatus.SENT, createdAt: '2026-04-09T09:03:00', message: 'Order ORD-2403 confirmed' },
  { id: 'NOT-1004', recipient: 'sarah.j@email.com', channel: NotificationChannel.PUSH, type: 'Inventory Reserved', status: NotificationStatus.PENDING, createdAt: '2026-04-09T10:03:00', message: 'Inventory reserved for order ORD-2404' },
  { id: 'NOT-1005', recipient: 'james.w@email.com', channel: NotificationChannel.EMAIL, type: 'Order Cancelled', status: NotificationStatus.FAILED, createdAt: '2026-04-07T16:50:00', message: 'Order ORD-2405 has been cancelled' },
];

// Health Status
export const mockHealthStatus: HealthStatus[] = [
  { service: 'PostgreSQL Database', status: ServiceHealthStatus.HEALTHY, responseTime: 12, uptime: 99.98, lastCheck: '2026-04-09T10:35:00', details: 'All connections stable' },
  { service: 'Kafka', status: ServiceHealthStatus.HEALTHY, responseTime: 8, uptime: 99.95, lastCheck: '2026-04-09T10:35:00', details: 'All brokers online' },
  { service: 'Temporal', status: ServiceHealthStatus.DEGRADED, responseTime: 245, uptime: 99.12, lastCheck: '2026-04-09T10:35:00', details: 'High workflow queue depth' },
];

// Dashboard stats
export const getDashboardStats = () => {
  const totalUsers = mockUsers.length;
  const activeCustomers = mockUsers.filter(u => u.role === UserRole.CUSTOMER && u.status === UserStatus.ACTIVE).length;
  const ordersToday = mockOrders.filter(o => o.createdAt.startsWith('2026-04-09')).length;
  const ordersByStatus = {
    pending: mockOrders.filter(o => o.status === OrderStatus.PENDING).length,
    confirmed: mockOrders.filter(o => o.status === OrderStatus.CONFIRMED).length,
    shipped: mockOrders.filter(o => o.status === OrderStatus.SHIPPED).length,
    cancelled: mockOrders.filter(o => o.status === OrderStatus.CANCELLED).length,
  };
  const inventoryAlerts = mockInventory.filter(i => i.available <= i.lowStockThreshold).length;
  const paymentsProcessed = mockPayments.filter(p => p.status === PaymentStatus.COMPLETED).length;
  const totalRevenue = mockPayments.filter(p => p.status === PaymentStatus.COMPLETED).reduce((sum, p) => sum + p.amount, 0);

  return {
    totalUsers,
    activeCustomers,
    ordersToday,
    ordersByStatus,
    inventoryAlerts,
    paymentsProcessed,
    totalRevenue,
  };
};

// Chart data for order trends
export const orderTrendData = [
  { date: 'Apr 3', orders: 12, revenue: 2450 },
  { date: 'Apr 4', orders: 18, revenue: 3680 },
  { date: 'Apr 5', orders: 15, revenue: 3120 },
  { date: 'Apr 6', orders: 22, revenue: 4890 },
  { date: 'Apr 7', orders: 19, revenue: 4230 },
  { date: 'Apr 8', orders: 25, revenue: 5670 },
  { date: 'Apr 9', orders: 21, revenue: 4820 },
];
