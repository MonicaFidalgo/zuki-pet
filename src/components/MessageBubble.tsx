interface MessageBubbleProps {
  message: string | null;
}

export function MessageBubble({ message }: MessageBubbleProps) {
  if (message === null) return null;
  return (
    <div className="bg-white border border-orange-200 rounded-xl px-4 py-2 text-sm text-orange-800 shadow mb-3 w-full max-w-sm text-center">
      {message}
    </div>
  );
}
