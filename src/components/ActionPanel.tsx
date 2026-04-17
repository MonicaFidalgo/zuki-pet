import type { CareAction } from "../types/game";

interface ActionPanelProps {
  onAction: (action: CareAction) => void;
}

const btnStyle: React.CSSProperties = {
  flex: 1,
  padding: '10px 4px',
  background: 'var(--tama-btn-face)',
  color: 'var(--tama-lcd-on)',
  fontFamily: 'var(--pixel-font)',
  fontSize: '7px',
  letterSpacing: '0.5px',
  border: 'none',
  cursor: 'pointer',
  textShadow: '1px 1px 0 #000',
};

export function ActionPanel({ onAction }: ActionPanelProps) {
  return (
    <div style={{ display: 'flex', gap: '8px', width: '100%', padding: '0 4px' }}>
      <button
        onClick={() => onAction("feed")}
        aria-label="Feed Zuki"
        className="pixel-border-btn"
        style={btnStyle}
      >
        FEED
      </button>
      <button
        onClick={() => onAction("play")}
        aria-label="Play with Zuki"
        className="pixel-border-btn"
        style={btnStyle}
      >
        PLAY
      </button>
      <button
        onClick={() => onAction("rest")}
        aria-label="Rest Zuki"
        className="pixel-border-btn"
        style={btnStyle}
      >
        REST
      </button>
    </div>
  );
}
