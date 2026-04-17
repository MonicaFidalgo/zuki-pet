import { useState } from "react";

interface NamingModalProps {
  submitName: (name: string) => void;
}

export function NamingModal({ submitName }: NamingModalProps) {
  const [inputValue, setInputValue] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    submitName(inputValue.trim());
  }

  const isDisabled = inputValue.trim() === "";

  return (
    <div
      className="fixed inset-0 flex items-center justify-center z-10"
      style={{
        background: 'rgba(10, 6, 2, 0.92)',
        backgroundImage: `repeating-linear-gradient(
          0deg,
          transparent,
          transparent 3px,
          rgba(0, 0, 0, 0.2) 3px,
          rgba(0, 0, 0, 0.2) 4px
        )`,
      }}
    >
      <div
        style={{
          background: 'linear-gradient(160deg, var(--tama-shell-light) 0%, var(--tama-shell) 50%, var(--tama-shell-dark) 100%)',
          padding: '24px 20px',
          width: '100%',
          maxWidth: '300px',
          boxSizing: 'border-box',
          borderRadius: '16px 16px 12px 12px',
          boxShadow: '6px 6px 0 #000, inset 3px 3px 0 var(--tama-shell-light), inset -3px -3px 0 var(--tama-shell-dark)',
        }}
      >
        <h2 style={{
          fontFamily: 'var(--pixel-font)',
          fontSize: '9px',
          color: 'var(--tama-amber-bright)',
          textShadow: '1px 1px 0 #000',
          margin: '0 0 16px 0',
          textAlign: 'center',
          fontWeight: 'normal',
          lineHeight: '2',
        }}>
          Name your pet
        </h2>
        <form onSubmit={handleSubmit}>
          <label
            htmlFor="pet-name"
            style={{
              display: 'block',
              marginBottom: '8px',
              fontFamily: 'var(--pixel-font)',
              fontSize: '7px',
              color: 'var(--tama-lcd-on)',
              textShadow: '1px 1px 0 #000',
              letterSpacing: '0.5px',
            }}
          >
            Name your fox:
          </label>
          <input
            id="pet-name"
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            autoFocus
            style={{
              width: '100%',
              background: 'var(--tama-lcd-bg)',
              color: 'var(--tama-lcd-on)',
              fontFamily: 'var(--pixel-font)',
              fontSize: '8px',
              letterSpacing: '1px',
              padding: '8px',
              marginBottom: '16px',
              border: 'none',
              outline: 'none',
              boxSizing: 'border-box',
              boxShadow: 'inset 2px 2px 0 #000, inset -1px -1px 0 var(--tama-lcd-glow), 0 0 0 2px var(--tama-shell-dark)',
            }}
          />
          <button
            type="submit"
            disabled={isDisabled}
            className="pixel-border-btn"
            style={{
              width: '100%',
              background: isDisabled ? 'var(--tama-text-dim)' : 'var(--tama-btn-face)',
              color: isDisabled ? '#4a3010' : 'var(--tama-lcd-on)',
              fontFamily: 'var(--pixel-font)',
              fontSize: '8px',
              letterSpacing: '1px',
              padding: '10px',
              border: 'none',
              cursor: isDisabled ? 'not-allowed' : 'pointer',
              textShadow: '1px 1px 0 #000',
              opacity: isDisabled ? 0.5 : 1,
            }}
          >
            START !
          </button>
        </form>
      </div>
    </div>
  );
}
