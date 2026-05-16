import { useRef, useState, KeyboardEvent } from 'react';
import { Send } from 'lucide-react';
import { Button } from '../ui/button';

interface Props {
  onSend: (content: string) => void;
  onTyping: () => void;
  disabled?: boolean;
}

export function ChatInput({ onSend, onTyping, disabled }: Props) {
  const [value, setValue] = useState('');

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      submit();
    }
  };

  const submit = () => {
    const trimmed = value.trim();
    if (!trimmed) return;
    onSend(trimmed);
    setValue('');
  };

  return (
    <div className="flex items-end gap-2 border-t border-white/10 bg-slate-950/60 px-4 py-3">
      <textarea
        value={value}
        onChange={(e) => {
          setValue(e.target.value);
          onTyping();
        }}
        onKeyDown={handleKeyDown}
        placeholder="Type a reply… (Enter to send, Shift+Enter for newline)"
        disabled={disabled}
        rows={2}
        className="flex-1 resize-none rounded-xl border border-white/10 bg-slate-800 px-4 py-2.5 text-sm text-white placeholder-gray-500 outline-none focus:border-purple-500 disabled:opacity-50"
      />
      <Button
        onClick={submit}
        disabled={disabled || !value.trim()}
        className="h-10 w-10 shrink-0 rounded-xl bg-gradient-to-br from-purple-600 to-blue-600 p-0 hover:opacity-90 disabled:opacity-40"
      >
        <Send className="h-4 w-4" />
      </Button>
    </div>
  );
}
