import { useState } from 'react';
import { AlertTriangle, Minus, Package, Plus, Search } from 'lucide-react';
import { Card } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';
import { Label } from '../components/ui/label';
import { Progress } from '../components/ui/progress';
import { EmptyState, ErrorState, LoadingState } from '../components/AsyncState';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '../components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../components/ui/table';
import { dashboardApi, operationsApi } from '../../lib/dashboard';
import { InventoryAction, StockState } from '../../lib/constants';
import { useApiData } from '../../lib/use-api';

export function Inventory() {
  const [searchQuery, setSearchQuery] = useState('');
  const [lowStockOnly, setLowStockOnly] = useState(false);
  const [selectedItem, setSelectedItem] = useState<{
    sku: string;
    productName: string;
    availableQuantity: number;
  } | null>(null);
  const [actionType, setActionType] = useState<InventoryAction | null>(null);
  const [orderId, setOrderId] = useState('');
  const [quantity, setQuantity] = useState('');
  const [feedback, setFeedback] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const inventory = useApiData(
    () => dashboardApi.getInventory({ q: searchQuery, lowStockOnly, limit: 100 }),
    [searchQuery, lowStockOnly],
  );

  async function submitInventoryAction() {
    if (!selectedItem || !actionType) {
      return;
    }

    setSubmitting(true);
    setFeedback(null);
    setErrorMessage(null);

    try {
      const parsedQuantity = Number.parseInt(quantity, 10);
      const payload = {
        orderId,
        items: [{ sku: selectedItem.sku, quantity: parsedQuantity }],
      };

      const response = actionType === InventoryAction.RESERVE
        ? await operationsApi.reserveInventory(payload)
        : await operationsApi.releaseInventory(payload);

      setFeedback(response.message);
      inventory.reload();
      setSelectedItem(null);
      setActionType(null);
      setOrderId('');
      setQuantity('');
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Inventory action failed');
    } finally {
      setSubmitting(false);
    }
  }

  const items = inventory.data?.data || [];
  const lowStockItems = items.filter((item) => item.stockState !== StockState.HEALTHY);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white">Inventory Management</h1>
        <p className="mt-1 text-gray-400">Live stock, reservations, and low-stock pressure</p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="border-white/10 bg-gradient-to-br from-purple-500/10 to-blue-500/10 p-6">
          <p className="text-sm text-gray-400">Tracked SKUs</p>
          <p className="mt-2 text-3xl font-bold text-white">{items.length}</p>
        </Card>
        <Card className="border-white/10 bg-gradient-to-br from-orange-500/10 to-red-500/10 p-6">
          <p className="text-sm text-gray-400">Low Stock Alerts</p>
          <p className="mt-2 text-3xl font-bold text-white">{lowStockItems.length}</p>
        </Card>
        <Card className="border-white/10 bg-gradient-to-br from-blue-500/10 to-cyan-500/10 p-6">
          <p className="text-sm text-gray-400">Reserved Units</p>
          <p className="mt-2 text-3xl font-bold text-white">
            {items.reduce((sum, item) => sum + item.reservedQuantity, 0)}
          </p>
        </Card>
      </div>

      <Card className="border-white/10 bg-slate-900/50 p-6 backdrop-blur-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="relative flex-1 lg:max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <Input
              placeholder="Search SKU or product..."
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              className="border-white/10 bg-white/5 pl-10"
            />
          </div>
          <Button
            variant={lowStockOnly ? 'default' : 'outline'}
            className={lowStockOnly ? 'bg-gradient-to-r from-red-500 to-orange-500' : 'border-white/10 bg-white/5'}
            onClick={() => setLowStockOnly((current) => !current)}
          >
            Low Stock Only
          </Button>
        </div>
      </Card>

      {feedback ? <p className="text-sm text-green-400">{feedback}</p> : null}
      {inventory.loading ? <LoadingState label="Loading inventory..." /> : null}
      {inventory.error ? <ErrorState message={inventory.error} onRetry={inventory.reload} /> : null}
      {!inventory.loading && !inventory.error && items.length === 0 ? (
        <EmptyState title="No inventory matches" description="Try a different SKU or clear the low-stock filter." />
      ) : null}

      {!inventory.loading && !inventory.error && items.length > 0 ? (
        <Card className="border-white/10 bg-slate-900/50 backdrop-blur-sm">
          <Table>
            <TableHeader>
              <TableRow className="border-white/10 hover:bg-transparent">
                <TableHead className="text-gray-400">SKU</TableHead>
                <TableHead className="text-gray-400">Product</TableHead>
                <TableHead className="text-gray-400">Total</TableHead>
                <TableHead className="text-gray-400">Reserved</TableHead>
                <TableHead className="text-gray-400">Available</TableHead>
                <TableHead className="text-gray-400">State</TableHead>
                <TableHead className="text-right text-gray-400">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((item) => (
                <TableRow key={item.id} className="border-white/10 hover:bg-white/5">
                  <TableCell className="font-mono text-purple-400">{item.sku}</TableCell>
                  <TableCell className="text-white">{item.productName}</TableCell>
                  <TableCell className="text-white">{item.totalQuantity}</TableCell>
                  <TableCell className="text-orange-300">{item.reservedQuantity}</TableCell>
                  <TableCell>
                    <div className="space-y-2">
                      <p className="text-white">{item.availableQuantity}</p>
                      <Progress value={(item.availableQuantity / item.totalQuantity) * 100} className="h-1.5 w-20" />
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className={item.stockState === StockState.CRITICAL ? 'text-red-400' : item.stockState === StockState.LOW ? 'text-orange-400' : 'text-green-400'}>
                      {item.stockState}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="border-purple-500/30 text-purple-300 hover:bg-purple-500/10"
                        onClick={() => {
                          setSelectedItem(item);
                          setActionType(InventoryAction.RESERVE);
                        }}
                      >
                        <Plus className="mr-1 h-3 w-3" />
                        Reserve
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="border-blue-500/30 text-blue-300 hover:bg-blue-500/10"
                        onClick={() => {
                          setSelectedItem(item);
                          setActionType(InventoryAction.RELEASE);
                        }}
                      >
                        <Minus className="mr-1 h-3 w-3" />
                        Release
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      ) : null}

      {lowStockItems.length > 0 ? (
        <Card className="border-red-500/30 bg-gradient-to-br from-red-500/10 to-orange-500/10 p-6">
          <div className="flex items-start gap-4">
            <div className="rounded-xl bg-red-500/20 p-3">
              <AlertTriangle className="h-6 w-6 text-red-400" />
            </div>
            <div>
              <h3 className="font-semibold text-white">Attention Needed</h3>
              <div className="mt-3 flex flex-wrap gap-2">
                {lowStockItems.map((item) => (
                  <span key={item.id} className="rounded-full border border-red-500/30 bg-red-500/10 px-3 py-1 text-xs text-red-200">
                    {item.sku}: {item.availableQuantity} available
                  </span>
                ))}
              </div>
            </div>
          </div>
        </Card>
      ) : null}

      <Dialog open={!!selectedItem && !!actionType} onOpenChange={(open) => {
        if (!open) {
          setSelectedItem(null);
          setActionType(null);
          setOrderId('');
          setQuantity('');
          setErrorMessage(null);
        }
      }}>
        <DialogContent className="border-white/10 bg-slate-950">
          <DialogHeader>
            <DialogTitle className="text-white">
              {actionType === InventoryAction.RESERVE ? 'Reserve Inventory' : 'Release Inventory'}
            </DialogTitle>
          </DialogHeader>
          {selectedItem ? (
            <div className="space-y-4">
              <Card className="border-white/10 bg-white/5 p-4">
                <p className="font-medium text-white">{selectedItem.productName}</p>
                <p className="mt-1 text-sm text-gray-400">{selectedItem.sku}</p>
                <p className="mt-2 text-xs text-gray-500">Available: {selectedItem.availableQuantity}</p>
              </Card>
              <div className="space-y-2">
                <Label className="text-white">Order ID</Label>
                <Input value={orderId} onChange={(event) => setOrderId(event.target.value)} className="border-white/10 bg-white/5" />
              </div>
              <div className="space-y-2">
                <Label className="text-white">Quantity</Label>
                <Input value={quantity} onChange={(event) => setQuantity(event.target.value)} className="border-white/10 bg-white/5" />
              </div>
              {errorMessage ? <p className="text-sm text-red-400">{errorMessage}</p> : null}
              <Button className="w-full bg-gradient-to-r from-purple-500 to-blue-500" disabled={submitting} onClick={() => void submitInventoryAction()}>
                {actionType === InventoryAction.RESERVE ? 'Reserve for Order' : 'Release Reservation'}
              </Button>
            </div>
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  );
}
