import { useState } from 'react';
import { Mail, MessageSquare, Search, Send, Smartphone } from 'lucide-react';
import { Card } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
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
import { dashboardApi, formatDateTime, operationsApi } from '../../lib/dashboard';
import { NotificationChannel, NotificationStatus } from '../../lib/constants';
import { useApiData } from '../../lib/use-api';

export function Notifications() {
  const [searchQuery, setSearchQuery] = useState('');
  const [showSendDialog, setShowSendDialog] = useState(false);
  const [form, setForm] = useState({
    recipientId: '',
    channel: NotificationChannel.EMAIL,
    type: 'ORDER_UPDATE',
    subject: '',
    body: '',
  });
  const [feedback, setFeedback] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const notifications = useApiData(
    () => dashboardApi.getNotifications({ q: searchQuery, limit: 100 }),
    [searchQuery],
  );

  const data = notifications.data?.data || [];

  const getChannelIcon = (channel: string) => {
    const normalized = channel.toUpperCase();
    if (normalized === NotificationChannel.EMAIL) return <Mail className="h-4 w-4 text-blue-400" />;
    if (normalized === NotificationChannel.SMS) return <MessageSquare className="h-4 w-4 text-green-400" />;
    return <Smartphone className="h-4 w-4 text-purple-400" />;
  };

  async function sendNotification() {
    setSubmitting(true);
    setErrorMessage(null);

    try {
      await operationsApi.sendNotification(form);
      setFeedback('Notification submitted successfully');
      notifications.reload();
      setShowSendDialog(false);
      setForm({
        recipientId: '',
        channel: NotificationChannel.EMAIL,
        type: 'ORDER_UPDATE',
        subject: '',
        body: '',
      });
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Notification send failed');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Notifications</h1>
          <p className="mt-1 text-gray-400">History and manual dispatch backed by the notification service</p>
        </div>
        <Button className="bg-gradient-to-r from-purple-500 to-blue-500" onClick={() => setShowSendDialog(true)}>
          <Send className="mr-2 h-4 w-4" />
          Send Notification
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="border-white/10 bg-gradient-to-br from-green-500/10 to-emerald-500/10 p-6">
          <p className="text-sm text-gray-400">Sent</p>
          <p className="mt-2 text-3xl font-bold text-white">{data.filter((item) => item.status === NotificationStatus.SENT).length}</p>
        </Card>
        <Card className="border-white/10 bg-gradient-to-br from-yellow-500/10 to-orange-500/10 p-6">
          <p className="text-sm text-gray-400">Pending</p>
          <p className="mt-2 text-3xl font-bold text-white">{data.filter((item) => item.status === NotificationStatus.PENDING).length}</p>
        </Card>
        <Card className="border-white/10 bg-gradient-to-br from-red-500/10 to-pink-500/10 p-6">
          <p className="text-sm text-gray-400">Failed</p>
          <p className="mt-2 text-3xl font-bold text-white">{data.filter((item) => item.status === NotificationStatus.FAILED).length}</p>
        </Card>
      </div>

      <Card className="border-white/10 bg-slate-900/50 p-6 backdrop-blur-sm">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <Input
            placeholder="Search recipient, type, or message..."
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            className="border-white/10 bg-white/5 pl-10"
          />
        </div>
      </Card>

      {feedback ? <p className="text-sm text-green-400">{feedback}</p> : null}
      {notifications.loading ? <LoadingState label="Loading notifications..." /> : null}
      {notifications.error ? <ErrorState message={notifications.error} onRetry={notifications.reload} /> : null}
      {!notifications.loading && !notifications.error && data.length === 0 ? (
        <EmptyState title="No notifications found" description="Send one manually or broaden the search." />
      ) : null}

      {!notifications.loading && !notifications.error && data.length > 0 ? (
        <Card className="border-white/10 bg-slate-900/50 backdrop-blur-sm">
          <Table>
            <TableHeader>
              <TableRow className="border-white/10 hover:bg-transparent">
                <TableHead className="text-gray-400">ID</TableHead>
                <TableHead className="text-gray-400">Recipient</TableHead>
                <TableHead className="text-gray-400">Channel</TableHead>
                <TableHead className="text-gray-400">Type</TableHead>
                <TableHead className="text-gray-400">Body</TableHead>
                <TableHead className="text-gray-400">Status</TableHead>
                <TableHead className="text-gray-400">Created</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((notification) => (
                <TableRow key={notification.id} className="border-white/10 hover:bg-white/5">
                  <TableCell className="font-mono text-purple-400">{notification.id}</TableCell>
                  <TableCell className="text-white">{notification.recipientId}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2 text-white">
                      {getChannelIcon(notification.channel)}
                      <span>{notification.channel}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-gray-300">{notification.type}</TableCell>
                  <TableCell className="max-w-xs truncate text-gray-400">{notification.body}</TableCell>
                  <TableCell><StatusBadge status={notification.status} /></TableCell>
                  <TableCell className="text-gray-400">{formatDateTime(notification.createdAt)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      ) : null}

      <Dialog open={showSendDialog} onOpenChange={setShowSendDialog}>
        <DialogContent className="border-white/10 bg-slate-950">
          <DialogHeader>
            <DialogTitle className="text-white">Send Notification</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="text-white">Recipient ID</Label>
              <Input className="border-white/10 bg-white/5" value={form.recipientId} onChange={(event) => setForm((current) => ({ ...current, recipientId: event.target.value }))} />
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label className="text-white">Channel</Label>
                <Select value={form.channel} onValueChange={(value) => setForm((current) => ({ ...current, channel: value }))}>
                  <SelectTrigger className="border-white/10 bg-white/5">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="border-white/10 bg-slate-900">
                    <SelectItem value={NotificationChannel.EMAIL}>Email</SelectItem>
                    <SelectItem value={NotificationChannel.SMS}>SMS</SelectItem>
                    <SelectItem value={NotificationChannel.PUSH}>Push</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-white">Type</Label>
                <Input className="border-white/10 bg-white/5" value={form.type} onChange={(event) => setForm((current) => ({ ...current, type: event.target.value }))} />
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-white">Subject</Label>
              <Input className="border-white/10 bg-white/5" value={form.subject} onChange={(event) => setForm((current) => ({ ...current, subject: event.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label className="text-white">Body</Label>
              <Textarea className="min-h-[120px] border-white/10 bg-white/5" value={form.body} onChange={(event) => setForm((current) => ({ ...current, body: event.target.value }))} />
            </div>
            {errorMessage ? <p className="text-sm text-red-400">{errorMessage}</p> : null}
            <Button className="w-full bg-gradient-to-r from-purple-500 to-blue-500" disabled={submitting} onClick={() => void sendNotification()}>
              <Send className="mr-2 h-4 w-4" />
              Dispatch Notification
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
