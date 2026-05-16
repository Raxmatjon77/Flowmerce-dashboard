import { useNavigate } from 'react-router';
import { MessageCircle, Clock, User } from 'lucide-react';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { LoadingState, ErrorState, EmptyState } from '../components/AsyncState';
import { useApiData } from '../../lib/use-api';
import { supportApi } from '../../lib/dashboard';
import type { ConversationDto } from '../../types/support';
import { useState } from 'react';

const STATUS_STYLES: Record<string, string> = {
  open: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
  in_progress: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30',
  resolved: 'bg-green-500/20 text-green-300 border-green-500/30',
  closed: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
};

const STATUS_FILTERS = [
  { label: 'All', value: '' },
  { label: 'Open', value: 'open' },
  { label: 'In Progress', value: 'in_progress' },
  { label: 'Resolved', value: 'resolved' },
  { label: 'Closed', value: 'closed' },
];

export function Support() {
  const navigate = useNavigate();
  const [statusFilter, setStatusFilter] = useState('');

  const { data, loading, error } = useApiData<ConversationDto[]>(() =>
    supportApi.getConversations(statusFilter || undefined),
    [statusFilter],
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Support Conversations</h1>
          <p className="text-sm text-gray-400 mt-1">
            Manage customer support requests in real time
          </p>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-400">
          <MessageCircle className="h-4 w-4 text-purple-400" />
          <span>{data?.length ?? 0} conversations</span>
        </div>
      </div>

      {/* Status filters */}
      <div className="flex gap-2 flex-wrap">
        {STATUS_FILTERS.map((f) => (
          <Button
            key={f.value}
            size="sm"
            variant={statusFilter === f.value ? 'default' : 'outline'}
            className={
              statusFilter === f.value
                ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white border-0'
                : 'border-white/10 text-gray-400 hover:text-white'
            }
            onClick={() => setStatusFilter(f.value)}
          >
            {f.label}
          </Button>
        ))}
      </div>

      {/* Content */}
      {loading && <LoadingState />}
      {error && <ErrorState message={error} />}
      {!loading && !error && (!data || data.length === 0) && (
        <EmptyState message="No support conversations found" />
      )}

      {data && data.length > 0 && (
        <div className="space-y-3">
          {data.map((conv) => (
            <Card
              key={conv.id}
              className="cursor-pointer border-white/10 bg-slate-900/60 p-4 hover:border-purple-500/50 hover:bg-slate-800/60 transition-all"
              onClick={() => void navigate(`/support/${conv.id}`)}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3 flex-1 min-w-0">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-800 border border-white/10">
                    <User className="h-4 w-4 text-gray-400" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-medium text-white truncate">{conv.subject}</p>
                    <p className="text-xs text-gray-500 mt-0.5">Customer: {conv.customerId}</p>
                  </div>
                </div>

                <div className="flex flex-col items-end gap-2 shrink-0">
                  <span
                    className={`rounded-full border px-2.5 py-0.5 text-xs font-medium ${STATUS_STYLES[conv.status] ?? STATUS_STYLES.closed}`}
                  >
                    {conv.status.replace('_', ' ')}
                  </span>
                  <span className="flex items-center gap-1 text-xs text-gray-500">
                    <Clock className="h-3 w-3" />
                    {new Date(conv.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
