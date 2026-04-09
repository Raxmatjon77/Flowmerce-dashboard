import { Link } from 'react-router';
import { Home, AlertCircle } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';

export function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-4">
      <Card className="max-w-md border-white/10 bg-slate-900/50 p-8 text-center backdrop-blur-sm">
        <div className="mb-6 flex justify-center">
          <div className="rounded-2xl bg-gradient-to-br from-red-500/20 to-orange-500/20 p-6">
            <AlertCircle className="h-16 w-16 text-red-400" />
          </div>
        </div>
        <h1 className="mb-2 text-4xl font-bold text-white">404</h1>
        <h2 className="mb-4 text-xl font-semibold text-gray-300">Page Not Found</h2>
        <p className="mb-8 text-gray-400">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <Link to="/">
          <Button className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600">
            <Home className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Button>
        </Link>
      </Card>
    </div>
  );
}
