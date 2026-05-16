import type { MessageDto } from '../../../types/support';

interface Props {
  message: MessageDto;
  isOwn: boolean;
}

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function ChatMessage({ message, isOwn }: Props) {
  return (
    <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'} mb-3`}>
      <div className={`max-w-[70%] ${isOwn ? 'items-end' : 'items-start'} flex flex-col gap-1`}>
        {/* Role badge */}
        <span className="text-xs text-gray-500">
          {message.senderRole === 'admin' ? '🛡 Admin' : '👤 Customer'} · {formatTime(message.createdAt)}
        </span>

        {/* Bubble */}
        <div
          className={`rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
            isOwn
              ? 'bg-gradient-to-br from-purple-600 to-blue-600 text-white'
              : 'bg-slate-800 text-gray-100 border border-white/10'
          }`}
        >
          {message.content}
        </div>

        {/* Attachments */}
        {message.attachments.map((att) => (
          <a
            key={att.id}
            href={att.url}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-2 rounded-xl border border-white/10 bg-slate-800/60 px-3 py-2 text-xs text-gray-300 hover:bg-slate-700 transition-colors"
          >
            <span>📎</span>
            <span className="truncate max-w-[200px]">{att.originalName}</span>
            <span className="text-gray-500">({formatBytes(att.sizeBytes)})</span>
          </a>
        ))}
      </div>
    </div>
  );
}
