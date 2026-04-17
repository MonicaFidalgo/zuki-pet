interface MessageBubbleProps {
  message: string | null;
}

export function MessageBubble({ message }: MessageBubbleProps) {
  if (message === null) return null;
  return (
    <div
      className="pixel-border-lcd"
      style={{
        background: 'var(--tama-lcd-bg)',
        padding: '8px 10px',
        fontFamily: 'var(--pixel-font)',
        fontSize: '7px',
        color: 'var(--tama-lcd-on)',
        textShadow: '1px 1px 0 #000',
        lineHeight: '1.8',
        letterSpacing: '0.5px',
        textAlign: 'center',
        marginBottom: '10px',
        width: '100%',
        boxSizing: 'border-box',
        wordBreak: 'break-word',
        overflowWrap: 'break-word',
      }}
    >
      {message}
    </div>
  );
}
