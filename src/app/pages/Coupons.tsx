import { useState } from 'react';
import { Plus, Percent, Tag, CheckCircle, XCircle, Search, CalendarDays } from 'lucide-react';
import { toast } from 'sonner';
import { Card } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';
import { Label } from '../components/ui/label';
import { EmptyState, ErrorState, LoadingState } from '../components/AsyncState';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '../components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '../components/ui/alert-dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select';
import { couponApi, formatCurrency } from '../../lib/dashboard';
import type { CouponDto, CreateCouponPayload, DiscountType } from '../../types/coupon';
import { useApiData } from '../../lib/use-api';

type ActiveFilter = 'all' | 'active' | 'inactive';

function formatDiscountValue(coupon: CouponDto): string {
  if (coupon.discountType === 'PERCENTAGE') {
    return `${coupon.discountValue}%`;
  }
  return formatCurrency(coupon.discountValue);
}

function formatUsageLimit(coupon: CouponDto): string {
  if (coupon.usageLimit === null) return `${coupon.usageCount} / ∞`;
  return `${coupon.usageCount} / ${coupon.usageLimit}`;
}

export function Coupons() {
  const [activeFilter, setActiveFilter] = useState<ActiveFilter>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [deactivateTarget, setDeactivateTarget] = useState<CouponDto | null>(null);

  // Create form state
  const [code, setCode] = useState('');
  const [discountType, setDiscountType] = useState<DiscountType>('PERCENTAGE');
  const [discountValue, setDiscountValue] = useState('');
  const [minimumOrderAmount, setMinimumOrderAmount] = useState('');
  const [maximumDiscountAmount, setMaximumDiscountAmount] = useState('');
  const [usageLimit, setUsageLimit] = useState('');
  const [usageLimitPerCustomer, setUsageLimitPerCustomer] = useState('');
  const [expiresAt, setExpiresAt] = useState('');
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const [deactivating, setDeactivating] = useState(false);

  const params: Record<string, string | number | boolean | undefined> = {};
  if (activeFilter === 'active') params.isActive = true;
  if (activeFilter === 'inactive') params.isActive = false;

  const coupons = useApiData(
    () => couponApi.getCoupons(activeFilter === 'all' ? undefined : { isActive: activeFilter === 'active' }),
    [activeFilter],
  );

  const allCoupons = coupons.data?.data ?? [];
  const filtered = searchQuery.trim()
    ? allCoupons.filter((c) =>
        c.code.toLowerCase().includes(searchQuery.toLowerCase()),
      )
    : allCoupons;

  function resetCreateForm() {
    setCode('');
    setDiscountType('PERCENTAGE');
    setDiscountValue('');
    setMinimumOrderAmount('');
    setMaximumDiscountAmount('');
    setUsageLimit('');
    setUsageLimitPerCustomer('');
    setExpiresAt('');
    setCreateError(null);
  }

  async function handleCreate() {
    if (!code.trim() || !discountValue) {
      setCreateError('Code and discount value are required.');
      return;
    }

    const parsedValue = parseFloat(discountValue);
    if (isNaN(parsedValue) || parsedValue <= 0) {
      setCreateError('Discount value must be a positive number.');
      return;
    }
    if (discountType === 'PERCENTAGE' && parsedValue > 100) {
      setCreateError('Percentage discount cannot exceed 100.');
      return;
    }

    const payload: CreateCouponPayload = {
      code: code.trim().toUpperCase(),
      discountType,
      discountValue: parsedValue,
    };

    if (minimumOrderAmount) payload.minimumOrderAmount = parseFloat(minimumOrderAmount);
    if (maximumDiscountAmount) payload.maximumDiscountAmount = parseFloat(maximumDiscountAmount);
    if (usageLimit) payload.usageLimit = parseInt(usageLimit, 10);
    if (usageLimitPerCustomer) payload.usageLimitPerCustomer = parseInt(usageLimitPerCustomer, 10);
    if (expiresAt) payload.expiresAt = new Date(expiresAt).toISOString();

    setCreating(true);
    setCreateError(null);
    try {
      await couponApi.createCoupon(payload);
      toast.success(`Coupon "${payload.code}" created successfully!`);
      setCreateDialogOpen(false);
      resetCreateForm();
      coupons.reload();
    } catch (err) {
      setCreateError(err instanceof Error ? err.message : 'Failed to create coupon.');
    } finally {
      setCreating(false);
    }
  }

  async function handleDeactivate() {
    if (!deactivateTarget) return;
    setDeactivating(true);
    try {
      await couponApi.deactivateCoupon(deactivateTarget.id);
      toast.success(`Coupon "${deactivateTarget.code}" has been deactivated.`);
      setDeactivateTarget(null);
      coupons.reload();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to deactivate coupon.');
    } finally {
      setDeactivating(false);
    }
  }

  const activeCoupons = allCoupons.filter((c) => c.isActive).length;
  const totalUsage = allCoupons.reduce((sum, c) => sum + c.usageCount, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Coupons</h1>
          <p className="mt-1 text-gray-400">Create and manage promotional discount codes</p>
        </div>
        <Button
          className="bg-gradient-to-r from-purple-500 to-blue-500"
          onClick={() => {
            resetCreateForm();
            setCreateDialogOpen(true);
          }}
        >
          <Plus className="mr-2 h-4 w-4" />
          New Coupon
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-6 md:grid-cols-3">
        <Card className="border-white/10 bg-gradient-to-br from-purple-500/10 to-blue-500/10 p-6">
          <p className="text-sm text-gray-400">Total Coupons</p>
          <p className="mt-2 text-3xl font-bold text-white">{allCoupons.length}</p>
        </Card>
        <Card className="border-white/10 bg-gradient-to-br from-green-500/10 to-emerald-500/10 p-6">
          <p className="text-sm text-gray-400">Active</p>
          <p className="mt-2 text-3xl font-bold text-white">{activeCoupons}</p>
        </Card>
        <Card className="border-white/10 bg-gradient-to-br from-blue-500/10 to-cyan-500/10 p-6">
          <p className="text-sm text-gray-400">Total Uses</p>
          <p className="mt-2 text-3xl font-bold text-white">{totalUsage}</p>
        </Card>
      </div>

      {/* Filters */}
      <Card className="border-white/10 bg-slate-900/50 p-4 backdrop-blur-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
          <div className="relative flex-1 lg:max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <Input
              placeholder="Search by code..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value.toUpperCase())}
              className="border-white/10 bg-white/5 pl-10 font-mono uppercase text-white placeholder:normal-case placeholder:text-gray-500"
            />
          </div>
          <div className="flex gap-2">
            {(['all', 'active', 'inactive'] as ActiveFilter[]).map((f) => (
              <Button
                key={f}
                variant={activeFilter === f ? 'default' : 'outline'}
                size="sm"
                className={
                  activeFilter === f
                    ? 'bg-gradient-to-r from-purple-500 to-blue-500'
                    : 'border-white/10 bg-white/5 capitalize text-gray-400'
                }
                onClick={() => setActiveFilter(f)}
              >
                {f.charAt(0).toUpperCase() + f.slice(1)}
              </Button>
            ))}
          </div>
        </div>
      </Card>

      {coupons.loading && <LoadingState label="Loading coupons..." />}
      {coupons.error && <ErrorState message={coupons.error} onRetry={coupons.reload} />}
      {!coupons.loading && !coupons.error && filtered.length === 0 && (
        <EmptyState
          title="No coupons found"
          description={
            searchQuery
              ? `No coupons match "${searchQuery}".`
              : 'Create your first coupon code to get started.'
          }
        />
      )}

      {!coupons.loading && !coupons.error && filtered.length > 0 && (
        <Card className="border-white/10 bg-slate-900/50 backdrop-blur-sm">
          <Table>
            <TableHeader>
              <TableRow className="border-white/10 hover:bg-transparent">
                <TableHead className="text-gray-400">Code</TableHead>
                <TableHead className="text-gray-400">Type</TableHead>
                <TableHead className="text-gray-400">Value</TableHead>
                <TableHead className="text-gray-400">Min Order</TableHead>
                <TableHead className="text-gray-400">Used / Limit</TableHead>
                <TableHead className="text-gray-400">Expires</TableHead>
                <TableHead className="text-gray-400">Status</TableHead>
                <TableHead className="text-right text-gray-400">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((coupon) => (
                <TableRow key={coupon.id} className="border-white/10 hover:bg-white/5">
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Tag className="h-3.5 w-3.5 text-purple-400 shrink-0" />
                      <span className="font-mono text-sm font-medium text-purple-300">
                        {coupon.code}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="flex items-center gap-1 text-sm text-gray-300">
                      {coupon.discountType === 'PERCENTAGE' ? (
                        <Percent className="h-3.5 w-3.5 text-blue-400" />
                      ) : (
                        <span className="text-xs font-bold text-blue-400">$</span>
                      )}
                      {coupon.discountType === 'PERCENTAGE' ? 'Percentage' : 'Fixed Amount'}
                    </span>
                  </TableCell>
                  <TableCell className="font-semibold text-white">
                    {formatDiscountValue(coupon)}
                    {coupon.maximumDiscountAmount !== null && coupon.discountType === 'PERCENTAGE' && (
                      <span className="ml-1 text-xs text-gray-500">
                        (max {formatCurrency(coupon.maximumDiscountAmount)})
                      </span>
                    )}
                  </TableCell>
                  <TableCell className="text-gray-300">
                    {coupon.minimumOrderAmount !== null
                      ? formatCurrency(coupon.minimumOrderAmount)
                      : <span className="text-gray-600">—</span>}
                  </TableCell>
                  <TableCell className="text-gray-300">
                    {formatUsageLimit(coupon)}
                  </TableCell>
                  <TableCell className="text-gray-300">
                    {coupon.expiresAt ? (
                      <span className="flex items-center gap-1 text-sm">
                        <CalendarDays className="h-3.5 w-3.5 text-gray-500" />
                        {new Date(coupon.expiresAt).toLocaleDateString()}
                      </span>
                    ) : (
                      <span className="text-gray-600">Never</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {coupon.isActive ? (
                      <span className="inline-flex items-center gap-1.5 rounded-full border border-green-500/30 bg-green-500/10 px-2.5 py-0.5 text-xs font-medium text-green-400">
                        <CheckCircle className="h-3 w-3" />
                        Active
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 rounded-full border border-gray-500/30 bg-gray-500/10 px-2.5 py-0.5 text-xs font-medium text-gray-400">
                        <XCircle className="h-3 w-3" />
                        Inactive
                      </span>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    {coupon.isActive && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="border-red-500/30 text-red-400 hover:bg-red-500/10"
                        onClick={() => setDeactivateTarget(coupon)}
                      >
                        Deactivate
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}

      {/* Create Coupon Dialog */}
      <Dialog
        open={createDialogOpen}
        onOpenChange={(open) => {
          if (!open) {
            setCreateDialogOpen(false);
            resetCreateForm();
          }
        }}
      >
        <DialogContent className="border-white/10 bg-slate-950 max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-white">Create New Coupon</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            {/* Code */}
            <div className="space-y-2">
              <Label className="text-gray-300">
                Code <span className="text-red-400">*</span>
              </Label>
              <Input
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                placeholder="e.g. SAVE20"
                className="border-white/10 bg-white/5 font-mono uppercase text-white placeholder:normal-case placeholder:text-gray-500"
              />
            </div>

            {/* Discount type + value */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-gray-300">
                  Discount Type <span className="text-red-400">*</span>
                </Label>
                <Select
                  value={discountType}
                  onValueChange={(v) => setDiscountType(v as DiscountType)}
                >
                  <SelectTrigger className="border-white/10 bg-white/5 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="border-white/10 bg-slate-900">
                    <SelectItem value="PERCENTAGE">Percentage (%)</SelectItem>
                    <SelectItem value="FIXED_AMOUNT">Fixed Amount ($)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-gray-300">
                  Value <span className="text-red-400">*</span>
                </Label>
                <Input
                  type="number"
                  min="0.01"
                  step="0.01"
                  value={discountValue}
                  onChange={(e) => setDiscountValue(e.target.value)}
                  placeholder={discountType === 'PERCENTAGE' ? '20' : '10.00'}
                  className="border-white/10 bg-white/5 text-white placeholder:text-gray-500"
                />
              </div>
            </div>

            {/* Optional fields */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-gray-300">Min Order Amount</Label>
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  value={minimumOrderAmount}
                  onChange={(e) => setMinimumOrderAmount(e.target.value)}
                  placeholder="e.g. 50.00"
                  className="border-white/10 bg-white/5 text-white placeholder:text-gray-500"
                />
              </div>
              {discountType === 'PERCENTAGE' && (
                <div className="space-y-2">
                  <Label className="text-gray-300">Max Discount Cap</Label>
                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    value={maximumDiscountAmount}
                    onChange={(e) => setMaximumDiscountAmount(e.target.value)}
                    placeholder="e.g. 30.00"
                    className="border-white/10 bg-white/5 text-white placeholder:text-gray-500"
                  />
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-gray-300">Total Usage Limit</Label>
                <Input
                  type="number"
                  min="1"
                  step="1"
                  value={usageLimit}
                  onChange={(e) => setUsageLimit(e.target.value)}
                  placeholder="Unlimited"
                  className="border-white/10 bg-white/5 text-white placeholder:text-gray-500"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-gray-300">Per-Customer Limit</Label>
                <Input
                  type="number"
                  min="1"
                  step="1"
                  value={usageLimitPerCustomer}
                  onChange={(e) => setUsageLimitPerCustomer(e.target.value)}
                  placeholder="Unlimited"
                  className="border-white/10 bg-white/5 text-white placeholder:text-gray-500"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-gray-300">Expiry Date</Label>
              <Input
                type="date"
                value={expiresAt}
                onChange={(e) => setExpiresAt(e.target.value)}
                className="border-white/10 bg-white/5 text-white"
              />
            </div>

            {createError && (
              <p className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-2 text-sm text-red-400">
                {createError}
              </p>
            )}

            <div className="flex gap-3 pt-2">
              <Button
                variant="outline"
                className="flex-1 border-white/10"
                disabled={creating}
                onClick={() => {
                  setCreateDialogOpen(false);
                  resetCreateForm();
                }}
              >
                Cancel
              </Button>
              <Button
                className="flex-1 bg-gradient-to-r from-purple-500 to-blue-500"
                disabled={creating}
                onClick={() => void handleCreate()}
              >
                {creating ? 'Creating...' : 'Create Coupon'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Deactivate Confirmation */}
      <AlertDialog
        open={!!deactivateTarget}
        onOpenChange={(open) => { if (!open) setDeactivateTarget(null); }}
      >
        <AlertDialogContent className="border-white/10 bg-slate-950">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-white">Deactivate Coupon?</AlertDialogTitle>
            <AlertDialogDescription className="text-gray-400">
              Coupon{' '}
              <span className="font-mono font-semibold text-purple-300">
                {deactivateTarget?.code}
              </span>{' '}
              will be deactivated immediately and cannot be used by customers. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              className="border-white/10 text-gray-300 hover:bg-white/5"
              disabled={deactivating}
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-500 text-white hover:bg-red-600"
              disabled={deactivating}
              onClick={() => void handleDeactivate()}
            >
              {deactivating ? 'Deactivating...' : 'Deactivate'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
