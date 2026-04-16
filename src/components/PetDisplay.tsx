import { useRef } from "react";
import type { PetState } from "../types/game";

interface PetDisplayProps {
  status: PetState;
  name: string;
  onPetClick: () => void;
}

const SPAM_THRESHOLD = 5;
const SPAM_WINDOW_MS = 2_000;

export function PetDisplay({ status, name, onPetClick }: PetDisplayProps) {
  const clickCountRef = useRef(0);
  const windowStartRef = useRef<number | null>(null);
  const windowTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  function handleClick() {
    const now = Date.now();
    if (windowStartRef.current === null) {
      windowStartRef.current = now;
      windowTimerRef.current = setTimeout(() => {
        clickCountRef.current = 0;
        windowStartRef.current = null;
        windowTimerRef.current = null;
      }, SPAM_WINDOW_MS);
    }
    clickCountRef.current += 1;
    if (clickCountRef.current >= SPAM_THRESHOLD && now - windowStartRef.current <= SPAM_WINDOW_MS) {
      onPetClick();
    }
  }

  const isEvolved = status === "evolved";
  const isSick = status === "sick";

  const containerClass = isEvolved
    ? "bg-yellow-100 border-2 border-yellow-400"
    : isSick
      ? "bg-gray-200 border-2 border-gray-400"
      : "bg-orange-100 border-2 border-orange-200";

  return (
    <button
      onClick={handleClick}
      aria-label={`Pet ${name}`}
      className={`w-full max-w-sm rounded-xl p-6 mb-4 flex flex-col items-center cursor-pointer select-none transition-colors ${containerClass}`}
    >
      <span className="text-6xl mb-2" aria-hidden="true">
        {isEvolved ? "🦊✨" : isSick ? "🦊😷" : "🦊"}
      </span>
      <span className="font-bold text-lg">{name || "Zuki"}</span>
      {isSick && (
        <span className="mt-2 text-sm font-semibold text-gray-600">😷 Sick</span>
      )}
      {isEvolved && (
        <span className="mt-2 text-sm font-semibold text-yellow-700">✨ Evolved</span>
      )}
    </button>
  );
}
