import { useState } from 'react';
import { MapPin, Package, Plus, Search, Truck } from 'lucide-react';
import { Card } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';
import { Label } from '../components/ui/label';
import { StatusBadge } from '../components/StatusBadge';
import { EmptyState, ErrorState, LoadingState } from '../components/AsyncState';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '../components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../components/ui/table';
import { dashboardApi, formatDate, operationsApi } from '../../lib/dashboard';
import { useApiData } from '../../lib/use-api';

export function Shipments() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedShipmentId, setSelectedShipmentId] = useState<string | null>(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [newShipment, setNewShipment] = useState({
    orderId: '',
    street: '',
    city: '',
    state: '',
    zipCode: '',
    country: '',
  });
  const [nextStatus, setNextStatus] = useState('PICKED_UP');
  const [feedback, setFeedback] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const shipments = useApiData(
    () => dashboardApi.getShipments({ q: searchQuery, limit: 100 }),
    [searchQuery],
  );

  const data = shipments.data?.data || [];
  const selectedShipment = data.find((shipment) => shipment.id === selectedShipmentId) || null;

  async function updateShipmentStatus() {
    if (!selectedShipment) {
      return;
    }

    setSubmitting(true);
    setErrorMessage(null);

    try {
      const response = await operationsApi.updateShipmentStatus(selectedShipment.id, nextStatus);
      setFeedback(response.message);
      shipments.reload();
      setSelectedShipmentId(null);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Shipment update failed');
    } finally {
      setSubmitting(false);
    }
  }

  async function createShipment() {
    setSubmitting(true);
    setErrorMessage(null);

    try {
      await operationsApi.createShipment({
        orderId: newShipment.orderId,
        address: {
          street: newShipment.street,
          city: newShipment.city,
          state: newShipment.state,
          zipCode: newShipment.zipCode,
          country: newShipment.country,
        },
      });
      setFeedback('Shipment created successfully');
      shipments.reload();
      setShowCreateDialog(false);
      setNewShipment({
        orderId: '',
        street: '',
        city: '',
        state: '',
        zipCode: '',
        country: '',
      });
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Shipment creation failed');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Shipments</h1>
          <p className="mt-1 text-gray-400">Real carrier records and status transitions</p>
        </div>
        <Button className="bg-gradient-to-r from-purple-500 to-blue-500" onClick={() => setShowCreateDialog(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Create Shipment
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="border-white/10 bg-gradient-to-br from-yellow-500/10 to-orange-500/10 p-6">
          <p className="text-sm text-gray-400">Pending</p>
          <p className="mt-2 text-3xl font-bold text-white">{data.filter((shipment) => shipment.status === 'PENDING').length}</p>
        </Card>
        <Card className="border-white/10 bg-gradient-to-br from-blue-500/10 to-cyan-500/10 p-6">
          <p className="text-sm text-gray-400">In Transit</p>
          <p className="mt-2 text-3xl font-bold text-white">{data.filter((shipment) => shipment.status === 'IN_TRANSIT').length}</p>
        </Card>
        <Card className="border-white/10 bg-gradient-to-br from-green-500/10 to-emerald-500/10 p-6">
          <p className="text-sm text-gray-400">Delivered</p>
          <p className="mt-2 text-3xl font-bold text-white">{data.filter((shipment) => shipment.status === 'DELIVERED').length}</p>
        </Card>
      </div>

      <Card className="border-white/10 bg-slate-900/50 p-6 backdrop-blur-sm">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <Input
            placeholder="Search shipment, order, or tracking..."
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            className="border-white/10 bg-white/5 pl-10"
          />
        </div>
      </Card>

      {feedback ? <p className="text-sm text-green-400">{feedback}</p> : null}
      {shipments.loading ? <LoadingState label="Loading shipments..." /> : null}
      {shipments.error ? <ErrorState message={shipments.error} onRetry={shipments.reload} /> : null}
      {!shipments.loading && !shipments.error && data.length === 0 ? (
        <EmptyState title="No shipments found" description="Create the first shipment or broaden the search." />
      ) : null}

      {!shipments.loading && !shipments.error && data.length > 0 ? (
        <Card className="border-white/10 bg-slate-900/50 backdrop-blur-sm">
          <Table>
            <TableHeader>
              <TableRow className="border-white/10 hover:bg-transparent">
                <TableHead className="text-gray-400">Shipment</TableHead>
                <TableHead className="text-gray-400">Order</TableHead>
                <TableHead className="text-gray-400">Tracking</TableHead>
                <TableHead className="text-gray-400">Carrier</TableHead>
                <TableHead className="text-gray-400">Status</TableHead>
                <TableHead className="text-gray-400">Delivery</TableHead>
                <TableHead className="text-right text-gray-400">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((shipment) => (
                <TableRow key={shipment.id} className="border-white/10 hover:bg-white/5">
                  <TableCell className="font-mono text-purple-400">{shipment.id}</TableCell>
                  <TableCell className="font-mono text-blue-300">{shipment.orderId}</TableCell>
                  <TableCell className="text-white">{shipment.trackingNumber || 'Pending'}</TableCell>
                  <TableCell className="text-white">{shipment.carrierName || 'Unassigned'}</TableCell>
                  <TableCell><StatusBadge status={shipment.status} /></TableCell>
                  <TableCell className="text-gray-400">{formatDate(shipment.estimatedDelivery)}</TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="outline"
                      size="sm"
                      className="border-blue-500/30 text-blue-300 hover:bg-blue-500/10"
                      onClick={() => {
                        setSelectedShipmentId(shipment.id);
                        setNextStatus('PICKED_UP');
                      }}
                    >
                      Update Status
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      ) : null}

      <Dialog open={!!selectedShipment} onOpenChange={(open) => !open && setSelectedShipmentId(null)}>
        <DialogContent className="border-white/10 bg-slate-950">
          <DialogHeader>
            <DialogTitle className="text-white">Update Shipment Status</DialogTitle>
          </DialogHeader>
          {selectedShipment ? (
            <div className="space-y-4">
              <Card className="border-white/10 bg-white/5 p-4">
                <p className="font-mono text-white">{selectedShipment.id}</p>
                <p className="mt-1 text-sm text-gray-400">Order {selectedShipment.orderId}</p>
                <p className="mt-2 text-sm text-gray-400">{selectedShipment.shippingAddress}</p>
              </Card>
              <div className="space-y-2">
                <Label className="text-white">Next status</Label>
                <Select value={nextStatus} onValueChange={setNextStatus}>
                  <SelectTrigger className="border-white/10 bg-white/5">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="border-white/10 bg-slate-900">
                    <SelectItem value="PICKED_UP">Picked Up</SelectItem>
                    <SelectItem value="IN_TRANSIT">In Transit</SelectItem>
                    <SelectItem value="DELIVERED">Delivered</SelectItem>
                    <SelectItem value="RETURNED">Returned</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {errorMessage ? <p className="text-sm text-red-400">{errorMessage}</p> : null}
              <Button className="w-full bg-gradient-to-r from-blue-500 to-cyan-500" disabled={submitting} onClick={() => void updateShipmentStatus()}>
                <Truck className="mr-2 h-4 w-4" />
                Save Status
              </Button>
            </div>
          ) : null}
        </DialogContent>
      </Dialog>

      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="border-white/10 bg-slate-950">
          <DialogHeader>
            <DialogTitle className="text-white">Create Shipment</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="text-white">Order ID</Label>
              <Input className="border-white/10 bg-white/5" value={newShipment.orderId} onChange={(event) => setNewShipment((current) => ({ ...current, orderId: event.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label className="text-white">Street</Label>
              <Input className="border-white/10 bg-white/5" value={newShipment.street} onChange={(event) => setNewShipment((current) => ({ ...current, street: event.target.value }))} />
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label className="text-white">City</Label>
                <Input className="border-white/10 bg-white/5" value={newShipment.city} onChange={(event) => setNewShipment((current) => ({ ...current, city: event.target.value }))} />
              </div>
              <div className="space-y-2">
                <Label className="text-white">State</Label>
                <Input className="border-white/10 bg-white/5" value={newShipment.state} onChange={(event) => setNewShipment((current) => ({ ...current, state: event.target.value }))} />
              </div>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label className="text-white">Zip Code</Label>
                <Input className="border-white/10 bg-white/5" value={newShipment.zipCode} onChange={(event) => setNewShipment((current) => ({ ...current, zipCode: event.target.value }))} />
              </div>
              <div className="space-y-2">
                <Label className="text-white">Country</Label>
                <Input className="border-white/10 bg-white/5" value={newShipment.country} onChange={(event) => setNewShipment((current) => ({ ...current, country: event.target.value }))} />
              </div>
            </div>
            {errorMessage ? <p className="text-sm text-red-400">{errorMessage}</p> : null}
            <Button className="w-full bg-gradient-to-r from-purple-500 to-blue-500" disabled={submitting} onClick={() => void createShipment()}>
              <Package className="mr-2 h-4 w-4" />
              Create Shipment
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
