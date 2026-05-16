import { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router';
import { ArrowLeft, CheckCircle, RefreshCw } from 'lucide-react';
import { Button } from '../components/ui/button';
import { LoadingState, ErrorState } from '../components/AsyncState';
import { ChatMessage } from '../components/chat/ChatMessage';
import { ChatInput } from '../components/chat/ChatInput';
import { TypingIndicator } from '../components/chat/TypingIndicator';
import { useApiData } from '../../lib/use-api';
import { useChatSocket } from '../../lib/useChatSocket';
import { supportApi } from '../../lib/dashboard';
import { getAdminUserId } from '../../lib/auth';
import type { ConversationDto, MessageDto } from '../../types/support';

const STATUS_STYLES: Record<string, string> = {
  open: 'bg-blue-500/20 text-blue-300',
  in_progress: 'bg-yellow-500/20 text-yellow-300',
  resolved: 'bg-green-500/20 text-green-300',
  closed: 'bg-gray-500/20 text-gray-400',
};

export function SupportThread() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const adminId = getAdminUserId();
  const bottomRef = useRef<HTMLDivElement>(null);
  const [closing, setClosing] = useState(false);

  const {
    data: conversation,
    loading: convLoading,
    error: convError,
    reload: reloadConv,
  } = useApiData<ConversationDto>(() => supportApi.getConversation(id!), [id]);

  const {
    data: restMessages,
    loading: msgsLoading,
    reload: reloadMessages,
  } = useApiData<MessageDto[]>(() => supportApi.getMessages(id!), [id]);

  const { messages, sendMessage, sendTyping, isConnected, typingUsers } = useChatSocket(
    id ?? '',
    restMessages ?? [],
  );

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleClose = async () => {
    if (!id) return;
    setClosing(true);
    try {
      await supportApi.closeConversation(id);
      reloadConv();
    } catch (err) {
      console.error('Failed to close conversation:', err);
    } finally {
      setClosing(false);
    }
  };

  if (convLoading || msgsLoading) return <LoadingState />;
  if (convError) return <ErrorState message={convError} />;
  if (!conversation) return <ErrorState message="Conversation not found" />;

  const isClosed = conversation.status === 'closed';

  return (
    <div className="flex h-[calc(100vh-8rem)] flex-col">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-0">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-gray-400"
            onClick={() => void navigate('/support')}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-lg font-semibold text-white leading-tight">{conversation.subject}</h1>
            <p className="text-xs text-gray-500">Customer: {conversation.customerId}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Connection indicator */}
          <div className="flex items-center gap-1.5">
            <div
              className={`h-2 w-2 rounded-full ${isConnected ? 'bg-green-400 animate-pulse' : 'bg-gray-600'}`}
            />
            <span className="text-xs text-gray-500">{isConnected ? 'Live' : 'Offline'}</span>
          </div>

          {/* Status badge */}
          <span
            className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${STATUS_STYLES[conversation.status] ?? STATUS_STYLES.closed}`}
          >
            {conversation.status.replace('_', ' ')}
          </span>

          {/* Refresh */}
          <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-400" onClick={() => { reloadConv(); reloadMessages(); }}>
            <RefreshCw className="h-4 w-4" />
          </Button>

          {/* Close conversation */}
          {!isClosed && (
            <Button
              size="sm"
              disabled={closing}
              onClick={() => void handleClose()}
              className="gap-1.5 bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:opacity-90"
            >
              <CheckCircle className="h-3.5 w-3.5" />
              {closing ? 'Closing…' : 'Close Ticket'}
            </Button>
          )}
        </div>
      </div>

      {/* Messages area */}
      <div className="flex-1 overflow-y-auto py-4 px-1">
        {messages.length === 0 && (
          <p className="text-center text-sm text-gray-500 mt-8">No messages yet. Be the first to reply.</p>
        )}
        {messages.map((msg) => (
          <ChatMessage
            key={msg.id}
            message={msg}
            isOwn={msg.senderId === adminId}
          />
        ))}
        <TypingIndicator users={typingUsers} />
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      {!isClosed ? (
        <ChatInput
          onSend={sendMessage}
          onTyping={sendTyping}
          disabled={!isConnected}
        />
      ) : (
        <div className="border-t border-white/10 bg-slate-950/60 px-4 py-3 text-center text-sm text-gray-500">
          This conversation is closed. No further replies can be sent.
        </div>
      )}
    </div>
  );
}
