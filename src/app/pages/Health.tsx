import { Activity, AlertCircle, CheckCircle2, Database, XCircle, Zap } from 'lucide-react';
import { Card } from '../components/ui/card';
import { StatusBadge } from '../components/StatusBadge';
import { ErrorState, LoadingState } from '../components/AsyncState';
import { dashboardApi, formatDateTime } from '../../lib/dashboard';
import { ServiceHealthStatus } from '../../lib/constants';
import { useApiData } from '../../lib/use-api';

export function Health() {
  const { data, loading, error, reload } = useApiData(() => dashboardApi.getHealth(), []);

  if (loading) {
    return <LoadingState label="Loading infrastructure health..." />;
  }

  if (error || !data) {
    return <ErrorState message={error || 'Health view failed to load'} onRetry={reload} />;
  }

  const getStatusIcon = (status: string) => {
    if (status === ServiceHealthStatus.HEALTHY) return <CheckCircle2 className="h-6 w-6 text-green-400" />;
    if (status === ServiceHealthStatus.DEGRADED) return <AlertCircle className="h-6 w-6 text-orange-400" />;
    return <XCircle className="h-6 w-6 text-red-400" />;
  };

  const getServiceIcon = (name: string) => {
    if (name.includes('Database')) return Database;
    if (name.includes('Kafka')) return Zap;
    return Activity;
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-bold text-white">Infrastructure Health</h1>
        <p className="mt-2 text-gray-400">Normalized service checks for the Flowmerce dashboard module</p>
      </div>

      <Card className="border-white/10 bg-gradient-to-br from-slate-900/80 to-slate-800/50 p-8 backdrop-blur-sm">
        <div className="flex flex-col items-center justify-between gap-6 lg:flex-row">
          <div className="flex items-center gap-5">
            <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-white/5">
              {getStatusIcon(data.overallStatus)}
            </div>
            <div>
              <h2 className="text-3xl font-bold text-white">
                {data.overallStatus === ServiceHealthStatus.HEALTHY ? 'All Systems Operational' : data.overallStatus === ServiceHealthStatus.DEGRADED ? 'Partial Degradation' : 'Service Disruption'}
              </h2>
              <p className="mt-1 text-gray-400">Checked {formatDateTime(data.generatedAt)}</p>
            </div>
          </div>
          <div className="flex gap-8">
            <div className="text-center">
              <p className="text-sm text-gray-400">Healthy</p>
              <p className="mt-1 text-2xl font-bold text-green-400">
                {data.services.filter((service) => service.status === ServiceHealthStatus.HEALTHY).length}
              </p>
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-400">Issues</p>
              <p className="mt-1 text-2xl font-bold text-orange-400">
                {data.services.filter((service) => service.status !== ServiceHealthStatus.HEALTHY).length}
              </p>
            </div>
          </div>
        </div>
      </Card>

      <div className="grid gap-6 lg:grid-cols-3">
        {data.services.map((service) => {
          const Icon = getServiceIcon(service.name);
          return (
            <Card key={service.name} className="border-white/10 bg-slate-900/50 p-6 backdrop-blur-sm">
              <div className="mb-6 flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="rounded-xl bg-white/5 p-3">
                    <Icon className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-white">{service.name}</h3>
                    <p className="text-xs text-gray-500">{formatDateTime(service.checkedAt)}</p>
                  </div>
                </div>
                {getStatusIcon(service.status)}
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between rounded-lg bg-white/5 p-3">
                  <span className="text-sm text-gray-400">Status</span>
                  <StatusBadge status={service.status} />
                </div>
                <div className="flex items-center justify-between rounded-lg bg-white/5 p-3">
                  <span className="text-sm text-gray-400">Response</span>
                  <span className="font-mono text-white">
                    {service.responseTimeMs ? `${service.responseTimeMs}ms` : 'n/a'}
                  </span>
                </div>
                <div className="rounded-lg bg-white/5 p-3">
                  <p className="text-xs text-gray-500">Details</p>
                  <p className="mt-1 text-sm text-gray-200">{service.details}</p>
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
