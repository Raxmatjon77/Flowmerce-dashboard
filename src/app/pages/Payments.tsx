import { useState } from 'react';
import { CreditCard, RefreshCw, Search } from 'lucide-react';
import { Card } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';
import { StatusBadge } from '../components/StatusBadge';
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
import { dashboardApi, formatCurrency, formatDateTime, operationsApi } from '../../lib/dashboard';
import { PaymentStatus } from '../../lib/constants';
import { useApiData } from '../../lib/use-api';

export function Payments() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPaymentId, setSelectedPaymentId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const payments = useApiData(
    () => dashboardApi.getPayments({ q: searchQuery, limit: 100 }),
    [searchQuery],
  );

  const selectedPayment = payments.data?.data.find((payment) => payment.id === selectedPaymentId) || null;
  const data = payments.data?.data || [];

  async function refundPayment(paymentId: string) {
    setSubmitting(true);
    setErrorMessage(null);
    setFeedback(null);

    try {
      const response = await operationsApi.refundPayment(paymentId);
      setFeedback(response.message);
      payments.reload();
      setSelectedPaymentId(null);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Refund failed');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white">Payments & Refunds</h1>
        <p className="mt-1 text-gray-400">Real transaction state from Flowmerce payment records</p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="border-white/10 bg-gradient-to-br from-green-500/10 to-emerald-500/10 p-6">
          <p className="text-sm text-gray-400">Completed Value</p>
          <p className="mt-2 text-3xl font-bold text-white">
            {formatCurrency(data.filter((payment) => payment.status === PaymentStatus.COMPLETED).reduce((sum, payment) => sum + payment.amount, 0))}
          </p>
        </Card>
        <Card className="border-white/10 bg-gradient-to-br from-purple-500/10 to-pink-500/10 p-6">
          <p className="text-sm text-gray-400">Refunded Value</p>
          <p className="mt-2 text-3xl font-bold text-white">
            {formatCurrency(data.filter((payment) => payment.status === PaymentStatus.REFUNDED).reduce((sum, payment) => sum + payment.amount, 0))}
          </p>
        </Card>
        <Card className="border-white/10 bg-gradient-to-br from-red-500/10 to-orange-500/10 p-6">
          <p className="text-sm text-gray-400">Failed Payments</p>
          <p className="mt-2 text-3xl font-bold text-white">
            {data.filter((payment) => payment.status === PaymentStatus.FAILED).length}
          </p>
        </Card>
      </div>

      <Card className="border-white/10 bg-slate-900/50 p-6 backdrop-blur-sm">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <Input
            placeholder="Search payment ID or order ID..."
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            className="border-white/10 bg-white/5 pl-10"
          />
        </div>
      </Card>

      {feedback ? <p className="text-sm text-green-400">{feedback}</p> : null}
      {payments.loading ? <LoadingState label="Loading payments..." /> : null}
      {payments.error ? <ErrorState message={payments.error} onRetry={payments.reload} /> : null}
      {!payments.loading && !payments.error && data.length === 0 ? (
        <EmptyState title="No payments found" description="Try a different payment or order search." />
      ) : null}

      {!payments.loading && !payments.error && data.length > 0 ? (
        <Card className="border-white/10 bg-slate-900/50 backdrop-blur-sm">
          <Table>
            <TableHeader>
              <TableRow className="border-white/10 hover:bg-transparent">
                <TableHead className="text-gray-400">Payment</TableHead>
                <TableHead className="text-gray-400">Order</TableHead>
                <TableHead className="text-gray-400">Amount</TableHead>
                <TableHead className="text-gray-400">Method</TableHead>
                <TableHead className="text-gray-400">Status</TableHead>
                <TableHead className="text-gray-400">Created</TableHead>
                <TableHead className="text-right text-gray-400">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((payment) => (
                <TableRow key={payment.id} className="border-white/10 hover:bg-white/5">
                  <TableCell className="font-mono text-purple-400">{payment.id}</TableCell>
                  <TableCell className="font-mono text-blue-300">{payment.orderId}</TableCell>
                  <TableCell className="text-white">{formatCurrency(payment.amount, payment.currency)}</TableCell>
                  <TableCell className="text-gray-300">{payment.method}</TableCell>
                  <TableCell><StatusBadge status={payment.status} /></TableCell>
                  <TableCell className="text-gray-400">{formatDateTime(payment.createdAt)}</TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="outline"
                      size="sm"
                      className="border-purple-500/30 text-purple-300 hover:bg-purple-500/10"
                      disabled={payment.status !== PaymentStatus.COMPLETED}
                      onClick={() => setSelectedPaymentId(payment.id)}
                    >
                      <RefreshCw className="mr-1 h-3 w-3" />
                      Refund
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      ) : null}

      <Dialog open={!!selectedPayment} onOpenChange={(open) => !open && setSelectedPaymentId(null)}>
        <DialogContent className="border-white/10 bg-slate-950">
          <DialogHeader>
            <DialogTitle className="text-white">Refund Payment</DialogTitle>
          </DialogHeader>
          {selectedPayment ? (
            <div className="space-y-4">
              <Card className="border-white/10 bg-white/5 p-4">
                <p className="font-mono text-white">{selectedPayment.id}</p>
                <p className="mt-1 text-sm text-gray-400">Order {selectedPayment.orderId}</p>
                <p className="mt-2 text-lg font-bold text-white">
                  {formatCurrency(selectedPayment.amount, selectedPayment.currency)}
                </p>
                <div className="mt-3"><StatusBadge status={selectedPayment.status} /></div>
              </Card>
              {errorMessage ? <p className="text-sm text-red-400">{errorMessage}</p> : null}
              <Button className="w-full bg-gradient-to-r from-purple-500 to-pink-500" disabled={submitting} onClick={() => void refundPayment(selectedPayment.id)}>
                <CreditCard className="mr-2 h-4 w-4" />
                Confirm Refund
              </Button>
            </div>
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  );
}
