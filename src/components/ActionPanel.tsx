import type { CareAction } from "../types/game";

interface ActionPanelProps {
  onAction: (action: CareAction) => void;
}

export function ActionPanel({ onAction }: ActionPanelProps) {
  return (
    <div className="flex gap-3 mt-4 w-full max-w-sm">
      <button
        onClick={() => onAction("feed")}
        aria-label="Feed Zuki"
        className="flex-1 py-3 rounded-lg bg-amber-400 hover:bg-amber-500 font-semibold text-white transition-colors"
      >
        Feed 🍙
      </button>
      <button
        onClick={() => onAction("play")}
        aria-label="Play with Zuki"
        className="flex-1 py-3 rounded-lg bg-sky-400 hover:bg-sky-500 font-semibold text-white transition-colors"
      >
        Play 🎾
      </button>
      <button
        onClick={() => onAction("rest")}
        aria-label="Rest Zuki"
        className="flex-1 py-3 rounded-lg bg-violet-400 hover:bg-violet-500 font-semibold text-white transition-colors"
      >
        Rest 💤
      </button>
    </div>
  );
}
