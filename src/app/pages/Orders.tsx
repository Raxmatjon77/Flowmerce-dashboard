import { useEffect, useState } from 'react';
import { CreditCard, MapPin, Search, ShoppingCart, User } from 'lucide-react';
import { Card } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';
import { StatusBadge } from '../components/StatusBadge';
import { EmptyState, ErrorState, LoadingState } from '../components/AsyncState';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '../components/ui/sheet';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../components/ui/table';
import { dashboardApi, formatCurrency, formatDate, formatDateTime, operationsApi } from '../../lib/dashboard';
import { useApiData } from '../../lib/use-api';

export function Orders() {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [actionMessage, setActionMessage] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  const orders = useApiData(
    () => dashboardApi.getOrders({ q: searchQuery, status: statusFilter || undefined, limit: 100 }),
    [searchQuery, statusFilter],
  );

  const orderDetail = useApiData(
    () => selectedOrderId ? dashboardApi.getOrderDetail(selectedOrderId) : Promise.resolve(null),
    [selectedOrderId],
  );

  useEffect(() => {
    if (!selectedOrderId) {
      orderDetail.setData(null);
    }
  }, [selectedOrderId]);

  async function handleOrderAction(type: 'confirm' | 'cancel') {
    if (!selectedOrderId) {
      return;
    }

    setActionLoading(true);
    setActionError(null);
    setActionMessage(null);

    try {
      const response =
        type === 'confirm'
          ? await operationsApi.confirmOrder(selectedOrderId)
          : await operationsApi.cancelOrder(selectedOrderId);
      setActionMessage(response.message);
      orders.reload();
      orderDetail.reload();
    } catch (error) {
      setActionError(error instanceof Error ? error.message : 'Order action failed');
    } finally {
      setActionLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white">Orders Management</h1>
        <p className="mt-1 text-gray-400">Admin order visibility with real backend workflow state</p>
      </div>

      <Card className="border-white/10 bg-slate-900/50 p-6 backdrop-blur-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="relative flex-1 lg:max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <Input
              placeholder="Search by order ID or customer ID..."
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              className="border-white/10 bg-white/5 pl-10"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            {['', 'PENDING', 'INVENTORY_RESERVED', 'PAYMENT_PROCESSED', 'CONFIRMED', 'SHIPPED', 'CANCELLED'].map((status) => (
              <Button
                key={status || 'all'}
                variant={statusFilter === status ? 'default' : 'outline'}
                size="sm"
                className={statusFilter === status ? 'bg-gradient-to-r from-purple-500 to-blue-500' : 'border-white/10 bg-white/5'}
                onClick={() => setStatusFilter(status)}
              >
                {status || 'All'}
              </Button>
            ))}
          </div>
        </div>
      </Card>

      {orders.loading ? <LoadingState label="Loading orders..." /> : null}
      {orders.error ? <ErrorState message={orders.error} onRetry={orders.reload} /> : null}
      {!orders.loading && !orders.error && orders.data && orders.data.data.length === 0 ? (
        <EmptyState
          title="No orders found"
          description="Try widening your search or clearing the status filter."
        />
      ) : null}

      {!orders.loading && !orders.error && orders.data && orders.data.data.length > 0 ? (
        <Card className="border-white/10 bg-slate-900/50 backdrop-blur-sm">
          <Table>
            <TableHeader>
              <TableRow className="border-white/10 hover:bg-transparent">
                <TableHead className="text-gray-400">Order</TableHead>
                <TableHead className="text-gray-400">Customer</TableHead>
                <TableHead className="text-gray-400">Status</TableHead>
                <TableHead className="text-gray-400">Items</TableHead>
                <TableHead className="text-gray-400">Total</TableHead>
                <TableHead className="text-gray-400">Created</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders.data.data.map((order) => (
                <TableRow
                  key={order.id}
                  className="cursor-pointer border-white/10 hover:bg-white/5"
                  onClick={() => setSelectedOrderId(order.id)}
                >
                  <TableCell className="font-mono text-purple-400">{order.id}</TableCell>
                  <TableCell className="text-white">{order.customerId}</TableCell>
                  <TableCell><StatusBadge status={order.status} /></TableCell>
                  <TableCell className="text-white">{order.itemCount}</TableCell>
                  <TableCell className="text-white">{formatCurrency(order.totalAmount, order.currency)}</TableCell>
                  <TableCell className="text-gray-400">{formatDate(order.createdAt)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      ) : null}

      <Sheet open={!!selectedOrderId} onOpenChange={(open) => !open && setSelectedOrderId(null)}>
        <SheetContent className="w-full overflow-y-auto border-white/10 bg-slate-950 sm:max-w-2xl">
          <SheetHeader>
            <SheetTitle className="text-white">Order Detail</SheetTitle>
          </SheetHeader>

          {orderDetail.loading ? <LoadingState label="Loading order detail..." /> : null}
          {orderDetail.error ? <ErrorState message={orderDetail.error} onRetry={orderDetail.reload} /> : null}
          {orderDetail.data ? (
            <div className="mt-6 space-y-6">
              <Card className="border-white/10 bg-gradient-to-br from-purple-500/10 to-blue-500/10 p-6">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                  <div>
                    <p className="text-sm text-gray-400">Order ID</p>
                    <p className="mt-1 font-mono text-xl text-white">{orderDetail.data.id}</p>
                    <div className="mt-3"><StatusBadge status={orderDetail.data.status} /></div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-400">Total</p>
                    <p className="mt-1 text-2xl font-bold text-white">
                      {formatCurrency(orderDetail.data.totalAmount, orderDetail.data.currency)}
                    </p>
                    <p className="text-xs text-gray-500">Updated {formatDateTime(orderDetail.data.updatedAt)}</p>
                  </div>
                </div>
              </Card>

              <div className="grid gap-4 md:grid-cols-2">
                <Card className="border-white/10 bg-white/5 p-4">
                  <h3 className="mb-3 flex items-center gap-2 font-semibold text-white">
                    <User className="h-4 w-4" />
                    Customer
                  </h3>
                  <p className="text-sm text-white">{orderDetail.data.customerId}</p>
                  <p className="mt-2 text-xs text-gray-500">Created {formatDateTime(orderDetail.data.createdAt)}</p>
                </Card>
                <Card className="border-white/10 bg-white/5 p-4">
                  <h3 className="mb-3 flex items-center gap-2 font-semibold text-white">
                    <MapPin className="h-4 w-4" />
                    Shipping
                  </h3>
                  <p className="text-sm text-white">{orderDetail.data.shippingAddress}</p>
                </Card>
              </div>

              <Card className="border-white/10 bg-white/5 p-4">
                <h3 className="mb-4 flex items-center gap-2 font-semibold text-white">
                  <ShoppingCart className="h-4 w-4" />
                  Items
                </h3>
                <div className="space-y-3">
                  {orderDetail.data.items.map((item) => (
                    <div key={item.id} className="flex items-center justify-between rounded-lg bg-slate-900/60 p-3">
                      <div>
                        <p className="font-medium text-white">{item.productName}</p>
                        <p className="text-xs text-gray-500">{item.productId}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-white">Qty {item.quantity}</p>
                        <p className="text-xs text-gray-400">{formatCurrency(item.totalPrice, item.currency)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>

              {orderDetail.data.payment ? (
                <Card className="border-white/10 bg-white/5 p-4">
                  <h3 className="mb-4 flex items-center gap-2 font-semibold text-white">
                    <CreditCard className="h-4 w-4" />
                    Payment
                  </h3>
                  <div className="grid gap-3 md:grid-cols-2">
                    <p className="text-sm text-gray-300">Payment ID: <span className="text-white">{orderDetail.data.payment.id}</span></p>
                    <p className="text-sm text-gray-300">Method: <span className="text-white">{orderDetail.data.payment.method}</span></p>
                    <p className="text-sm text-gray-300">Amount: <span className="text-white">{formatCurrency(orderDetail.data.payment.amount, orderDetail.data.payment.currency)}</span></p>
                    <div className="text-sm text-gray-300">Status: <StatusBadge status={orderDetail.data.payment.status} /></div>
                  </div>
                </Card>
              ) : null}

              {orderDetail.data.shipment ? (
                <Card className="border-white/10 bg-white/5 p-4">
                  <h3 className="mb-4 font-semibold text-white">Shipment</h3>
                  <div className="grid gap-3 md:grid-cols-2">
                    <p className="text-sm text-gray-300">Shipment ID: <span className="text-white">{orderDetail.data.shipment.id}</span></p>
                    <p className="text-sm text-gray-300">Carrier: <span className="text-white">{orderDetail.data.shipment.carrierName || 'Pending assignment'}</span></p>
                    <p className="text-sm text-gray-300">Tracking: <span className="text-white">{orderDetail.data.shipment.trackingNumber || 'Not available'}</span></p>
                    <div className="text-sm text-gray-300">Status: <StatusBadge status={orderDetail.data.shipment.status} /></div>
                  </div>
                </Card>
              ) : null}

              {actionMessage ? <p className="text-sm text-green-400">{actionMessage}</p> : null}
              {actionError ? <p className="text-sm text-red-400">{actionError}</p> : null}

              <div className="flex flex-wrap gap-3">
                <Button
                  className="bg-gradient-to-r from-purple-500 to-blue-500"
                  disabled={actionLoading}
                  onClick={() => void handleOrderAction('confirm')}
                >
                  Confirm Order
                </Button>
                <Button
                  variant="outline"
                  className="border-red-500/30 text-red-300 hover:bg-red-500/10"
                  disabled={actionLoading}
                  onClick={() => void handleOrderAction('cancel')}
                >
                  Cancel Order
                </Button>
              </div>
            </div>
          ) : null}
        </SheetContent>
      </Sheet>
    </div>
  );
}
