import { Badge } from './ui/badge';

interface StatusBadgeProps {
  status: string;
  variant?: 'default' | 'secondary' | 'destructive' | 'outline';
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const getStatusColor = (status: string) => {
    const statusLower = status.toLowerCase();
    
    // Order statuses
    if (statusLower === 'pending') return 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30';
    if (statusLower === 'inventory_reserved') return 'bg-orange-500/20 text-orange-300 border-orange-500/30';
    if (statusLower === 'payment_processed') return 'bg-blue-500/20 text-blue-300 border-blue-500/30';
    if (statusLower === 'confirmed') return 'bg-purple-500/20 text-purple-300 border-purple-500/30';
    if (statusLower === 'shipped') return 'bg-green-500/20 text-green-300 border-green-500/30';
    if (statusLower === 'cancelled') return 'bg-red-500/20 text-red-300 border-red-500/30';
    
    // User statuses
    if (statusLower === 'active') return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30';
    if (statusLower === 'inactive') return 'bg-gray-500/20 text-gray-300 border-gray-500/30';
    
    // Payment statuses
    if (statusLower === 'completed') return 'bg-green-500/20 text-green-300 border-green-500/30';
    if (statusLower === 'processing') return 'bg-blue-500/20 text-blue-300 border-blue-500/30';
    if (statusLower === 'failed') return 'bg-red-500/20 text-red-300 border-red-500/30';
    if (statusLower === 'refunded') return 'bg-purple-500/20 text-purple-300 border-purple-500/30';
    
    // Shipment statuses
    if (statusLower === 'preparing' || statusLower === 'picked_up') return 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30';
    if (statusLower === 'pending') return 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30';
    if (statusLower === 'in_transit') return 'bg-blue-500/20 text-blue-300 border-blue-500/30';
    if (statusLower === 'out_for_delivery') return 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30';
    if (statusLower === 'delivered') return 'bg-green-500/20 text-green-300 border-green-500/30';
    if (statusLower === 'returned') return 'bg-red-500/20 text-red-300 border-red-500/30';
    
    // Notification statuses
    if (statusLower === 'sent') return 'bg-green-500/20 text-green-300 border-green-500/30';
    
    // Health statuses
    if (statusLower === 'healthy') return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30';
    if (statusLower === 'degraded') return 'bg-orange-500/20 text-orange-300 border-orange-500/30';
    if (statusLower === 'down') return 'bg-red-500/20 text-red-300 border-red-500/30';
    if (statusLower === 'low') return 'bg-orange-500/20 text-orange-300 border-orange-500/30';
    if (statusLower === 'critical') return 'bg-red-500/20 text-red-300 border-red-500/30';
    
    // Roles
    if (statusLower === 'admin') return 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30';
    if (statusLower === 'customer') return 'bg-blue-500/20 text-blue-300 border-blue-500/30';
    if (statusLower === 'service') return 'bg-teal-500/20 text-teal-300 border-teal-500/30';
    
    return 'bg-gray-500/20 text-gray-300 border-gray-500/30';
  };

  const formatStatus = (status: string) => {
    return status.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  return (
    <Badge variant="outline" className={`${getStatusColor(status)} border font-medium`}>
      {formatStatus(status)}
    </Badge>
  );
}
