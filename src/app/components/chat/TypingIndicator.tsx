interface Props {
  users: { userId: string; role: string }[];
}

export function TypingIndicator({ users }: Props) {
  if (users.length === 0) return null;

  const label =
    users.length === 1
      ? users[0].role === 'admin'
        ? 'Admin is typing'
        : 'Customer is typing'
      : 'Multiple people are typing';

  return (
    <div className="flex items-center gap-2 px-4 py-1">
      <div className="flex gap-1">
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="h-1.5 w-1.5 rounded-full bg-purple-400 animate-bounce"
            style={{ animationDelay: `${i * 0.15}s` }}
          />
        ))}
      </div>
      <span className="text-xs text-gray-500">{label}…</span>
    </div>
  );
}
