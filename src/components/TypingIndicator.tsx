'use client';

interface Props {
  names: string[];
}

export default function TypingIndicator({ names }: Props) {
  if (!names.length) return null;

  const label =
    names.length === 1
      ? `${names[0]} is typing`
      : `${names.slice(0, 2).join(', ')} are typing`;

  return (
    <div className="flex items-center gap-2 px-4 py-2 text-xs text-gray-400">
      <div className="flex items-center gap-1">
        <span className="w-1.5 h-1.5 rounded-full bg-accent animate-bounce [animation-delay:-0.3s]" />
        <span className="w-1.5 h-1.5 rounded-full bg-accent animate-bounce [animation-delay:-0.15s]" />
        <span className="w-1.5 h-1.5 rounded-full bg-accent animate-bounce" />
      </div>
      <span className="italic">{label}...</span>
    </div>
  );
}