import { useRef } from "react";
import type { PetState } from "../types/game";
import { PixelFox } from "./PixelFox";

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
  const foxVariant = isEvolved ? 'evolved' : isSick ? 'sick' : 'normal';

  return (
    <button
      onClick={handleClick}
      aria-label={`Pet ${name}`}
      style={{
        background: 'transparent',
        border: 'none',
        padding: '8px 0 4px',
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        cursor: 'pointer',
        userSelect: 'none',
        filter: isEvolved ? 'drop-shadow(0 0 6px #f5a623)' : 'none',
      }}
    >
      <PixelFox variant={foxVariant} />
      <span style={{
        fontFamily: 'var(--pixel-font)',
        fontSize: '10px',
        color: 'var(--tama-lcd-on)',
        textShadow: '1px 1px 0 #000',
        letterSpacing: '1px',
        marginTop: '8px',
      }}>
        {name || "Zuki"}
      </span>
      {isSick && (
        <span className="pixel-blink" style={{
          marginTop: '6px',
          fontFamily: 'var(--pixel-font)',
          fontSize: '8px',
          color: 'var(--tama-danger)',
          textShadow: '1px 1px 0 #000',
          letterSpacing: '1px',
        }}>
          [SICK]
        </span>
      )}
      {isEvolved && (
        <span style={{
          marginTop: '6px',
          fontFamily: 'var(--pixel-font)',
          fontSize: '8px',
          color: 'var(--tama-amber-bright)',
          textShadow: '0 0 4px var(--tama-amber-bright), 1px 1px 0 #000',
          letterSpacing: '1px',
        }}>
          ** EVOLVED **
        </span>
      )}
    </button>
  );
}
