import { ShieldAlert, Users as UsersIcon } from 'lucide-react';
import { Card } from '../components/ui/card';
import { EmptyState } from '../components/AsyncState';

export function Users() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white">Users</h1>
        <p className="mt-1 text-gray-400">This screen is intentionally staged for a later user-domain iteration.</p>
      </div>

      <Card className="border-white/10 bg-gradient-to-br from-purple-500/10 to-blue-500/10 p-6">
        <div className="flex items-start gap-4">
          <div className="rounded-xl bg-white/10 p-3">
            <ShieldAlert className="h-6 w-6 text-white" />
          </div>
          <div>
            <h2 className="font-semibold text-white">Why this page is limited</h2>
            <p className="mt-2 text-sm text-gray-300">
              Flowmerce currently has authentication and role guards, but it does not yet have a true user management bounded context.
              The dashboard implementation keeps this route visible, while avoiding fake user administration APIs.
            </p>
          </div>
        </div>
      </Card>

      <EmptyState
        title="User administration is not implemented yet"
        description="When a real user domain or admin identity read model is added, this page can be connected without reworking the surrounding dashboard shell."
        action={<UsersIcon className="mx-auto h-10 w-10 text-gray-500" />}
      />
    </div>
  );
}
