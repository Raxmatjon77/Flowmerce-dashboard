import {
  Activity,
  AlertTriangle,
  CreditCard,
  Package,
  ShoppingCart,
  Siren,
} from 'lucide-react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { Card } from '../components/ui/card';
import { StatCard } from '../components/StatCard';
import { StatusBadge } from '../components/StatusBadge';
import { ErrorState, LoadingState } from '../components/AsyncState';
import { dashboardApi, formatCurrency, formatDateTime, formatStatusLabel } from '../../lib/dashboard';
import { useApiData } from '../../lib/use-api';

const pieColors = ['#a855f7', '#22c55e', '#eab308', '#ef4444', '#3b82f6', '#14b8a6'];
const pieGlowColors = ['#c084fc', '#4ade80', '#facc15', '#fb7185', '#60a5fa', '#2dd4bf'];

export function Overview() {
  const { data, loading, error, reload } = useApiData(
    () => dashboardApi.getOverview(),
    [],
  );

  if (loading) {
    return <LoadingState label="Loading Flowmerce overview..." />;
  }

  if (error || !data) {
    return <ErrorState message={error || 'Overview failed to load'} onRetry={reload} />;
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-bold text-white">Flowmerce Command Center</h1>
        <p className="mt-2 text-gray-400">
          Live operations snapshot · Updated {formatDateTime(data.generatedAt)}
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Total Orders"
          value={data.summary.totalOrders}
          icon={ShoppingCart}
          description={`${data.summary.ordersToday} created today`}
          gradient="from-blue-500/10 to-cyan-500/10"
        />
        <StatCard
          title="Active Orders"
          value={data.summary.activeOrders}
          icon={Package}
          description="Still moving through the workflow"
          gradient="from-purple-500/10 to-pink-500/10"
        />
        <StatCard
          title="Revenue"
          value={formatCurrency(data.summary.totalRevenue)}
          icon={CreditCard}
          description="Completed payments"
          gradient="from-green-500/10 to-emerald-500/10"
        />
        <StatCard
          title="Infrastructure Issues"
          value={data.summary.unhealthyServices}
          icon={Siren}
          description={`${data.health.services.length} monitored services`}
          gradient="from-orange-500/10 to-red-500/10"
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <Card className="border-white/10 bg-slate-900/50 p-6 backdrop-blur-sm">
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-white">Order Volume Trend</h3>
            <p className="text-sm text-gray-400">Orders and revenue over the last 7 days</p>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={data.orderTrend}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="date" stroke="#94a3b8" style={{ fontSize: '12px' }} />
              <YAxis stroke="#94a3b8" style={{ fontSize: '12px' }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#0f172a',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '12px',
                }}
              />
              <Line
                type="monotone"
                dataKey="orders"
                stroke="#a855f7"
                strokeWidth={3}
                dot={{ fill: '#a855f7', r: 4 }}
              />
              <Line
                type="monotone"
                dataKey="revenue"
                stroke="#22c55e"
                strokeWidth={2}
                dot={{ fill: '#22c55e', r: 3 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </Card>

        <Card className="border-white/10 bg-slate-900/50 p-6 backdrop-blur-sm">
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-white">Order Status Distribution</h3>
            <p className="text-sm text-gray-400">Current workflow mix</p>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={data.orderStatusDistribution}
                dataKey="count"
                nameKey="status"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={4}
                stroke="#f8fafc"
                strokeWidth={2}
                activeOuterRadius={108}
              >
                {data.orderStatusDistribution.map((entry, index) => (
                  <Cell
                    key={entry.status}
                    fill={pieColors[index % pieColors.length]}
                    style={{
                      filter: `drop-shadow(0 0 10px ${pieGlowColors[index % pieGlowColors.length]}55)`,
                      cursor: 'pointer',
                    }}
                  />
                ))}
              </Pie>
              <Tooltip
                formatter={(value: number, name: string) => [value, formatStatusLabel(name)]}
                contentStyle={{
                  backgroundColor: '#0f172a',
                  border: '1px solid rgba(168,85,247,0.35)',
                  borderRadius: '12px',
                  color: '#f8fafc',
                  boxShadow: '0 12px 30px rgba(2, 6, 23, 0.45)',
                }}
                labelStyle={{ color: '#e2e8f0', fontWeight: 600 }}
                itemStyle={{ color: '#f8fafc', fontWeight: 600 }}
                cursor={{ fill: 'rgba(255,255,255,0.04)' }}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="mt-4 flex flex-wrap gap-2">
            {data.orderStatusDistribution.map((entry, index) => (
              <div
                key={entry.status}
                className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-slate-200 transition-colors hover:bg-white/10"
              >
                <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: pieColors[index % pieColors.length] }} />
                {formatStatusLabel(entry.status)} · {entry.count}
              </div>
            ))}
          </div>
        </Card>
      </div>

      <div className="grid gap-6 xl:grid-cols-3">
        <Card className="border-white/10 bg-gradient-to-br from-red-500/10 to-orange-500/10 p-6">
          <div className="mb-4 flex items-center gap-3">
            <div className="rounded-xl bg-red-500/20 p-3">
              <AlertTriangle className="h-6 w-6 text-red-400" />
            </div>
            <div>
              <h3 className="font-semibold text-white">Low Stock</h3>
              <p className="text-sm text-gray-400">Auto-detected risk inventory</p>
            </div>
          </div>
          <div className="space-y-3">
            {data.lowStockItems.map((item) => (
              <div key={item.id} className="rounded-lg bg-white/5 p-3">
                <p className="font-medium text-white">{item.productName}</p>
                <p className="mt-1 text-xs text-gray-400">{item.sku}</p>
                <p className="mt-2 text-sm text-red-300">
                  {item.availableQuantity} available · threshold {item.lowStockThreshold}
                </p>
              </div>
            ))}
          </div>
        </Card>

        <Card className="border-white/10 bg-slate-900/50 p-6 backdrop-blur-sm xl:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-white">Recent Activity</h3>
              <p className="text-sm text-gray-400">Cross-system operational feed</p>
            </div>
            <Activity className="h-5 w-5 text-purple-400" />
          </div>
          <div className="space-y-3">
            {data.recentActivity.map((activity) => (
              <div key={`${activity.type}-${activity.entityId}`} className="rounded-lg bg-white/5 p-4">
                <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                  <div>
                    <p className="font-medium text-white">{activity.title}</p>
                    <p className="mt-1 text-sm text-gray-400">{activity.description}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <StatusBadge status={activity.status} />
                    <span className="text-xs text-gray-500">{formatDateTime(activity.timestamp)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <Card className="border-white/10 bg-slate-900/50 p-6 backdrop-blur-sm">
          <div className="mb-4">
            <h3 className="font-semibold text-white">Recent Orders</h3>
            <p className="text-sm text-gray-400">The latest workflow entries</p>
          </div>
          <div className="space-y-3">
            {data.recentOrders.map((order) => (
              <div key={order.id} className="flex items-center justify-between rounded-lg bg-white/5 p-4">
                <div>
                  <p className="font-medium text-white">{order.id}</p>
                  <p className="text-sm text-gray-400">{order.customerId}</p>
                </div>
                <div className="text-right">
                  <p className="font-medium text-white">{formatCurrency(order.totalAmount, order.currency)}</p>
                  <p className="text-xs text-gray-500">{order.itemCount} items</p>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card className="border-white/10 bg-gradient-to-br from-slate-900/80 to-slate-800/50 p-6 backdrop-blur-sm">
          <div className="mb-4">
            <h3 className="font-semibold text-white">Infrastructure Health</h3>
            <p className="text-sm text-gray-400">Normalized dashboard health contract</p>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            {data.health.services.map((service) => (
              <div key={service.name} className="rounded-xl border border-white/10 bg-white/5 p-4">
                <div className="mb-3 flex items-center justify-between">
                  <p className="font-medium text-white">{service.name}</p>
                  <StatusBadge status={service.status} />
                </div>
                <p className="text-sm text-gray-400">
                  Response time: {service.responseTimeMs ? `${service.responseTimeMs}ms` : 'n/a'}
                </p>
                <p className="mt-2 text-xs text-gray-500">{service.details}</p>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <Card className="border-white/10 bg-slate-900/50 p-6 backdrop-blur-sm">
        <div className="mb-4">
          <h3 className="font-semibold text-white">Operational Distribution Snapshot</h3>
          <p className="text-sm text-gray-400">Payments, shipments, and notifications by status</p>
        </div>
        <ResponsiveContainer width="100%" height={260}>
          <BarChart
            data={data.paymentStatusDistribution.map((entry) => ({
              name: `Payment ${formatStatusLabel(entry.status)}`,
              value: entry.count,
            })).concat(
              data.shipmentStatusDistribution.map((entry) => ({
                name: `Shipment ${formatStatusLabel(entry.status)}`,
                value: entry.count,
              })),
              data.notificationStatusDistribution.map((entry) => ({
                name: `Notification ${formatStatusLabel(entry.status)}`,
                value: entry.count,
              })),
            )}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
            <XAxis dataKey="name" stroke="#94a3b8" style={{ fontSize: '11px' }} />
            <YAxis stroke="#94a3b8" style={{ fontSize: '12px' }} />
            <Tooltip
              contentStyle={{
                backgroundColor: '#0f172a',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '12px',
              }}
            />
            <Bar dataKey="value" radius={[6, 6, 0, 0]} fill="#3b82f6" />
          </BarChart>
        </ResponsiveContainer>
      </Card>
    </div>
  );
}
