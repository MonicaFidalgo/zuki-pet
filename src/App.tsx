import { useGameState } from "./hooks/useGameState";
import { VitalsPanel } from "./components/VitalsPanel";
import { NamingModal } from "./components/NamingModal";
import { ActionPanel } from "./components/ActionPanel";
import { PetDisplay } from "./components/PetDisplay";
import { MessageBubble } from "./components/MessageBubble";

function App() {
  const { state, isNaming, submitName, performAction, currentMessage, triggerSpamClick } =
    useGameState();

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ overflow: 'hidden' }}>
      {isNaming && <NamingModal submitName={submitName} />}
      <div
        className="pixel-border-shell"
        style={{
          background: 'linear-gradient(160deg, var(--tama-shell-light) 0%, var(--tama-shell) 45%, var(--tama-shell-dark) 100%)',
          padding: '20px 16px 28px',
          width: '260px',
          flexShrink: 0,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '8px',
          borderRadius: '45% 45% 35% 35% / 18% 18% 14% 14%',
          overflow: 'hidden',
        }}
      >
        <h1>
          {state.name ? `${state.name}'s Stats` : "Zuki's Stats"}
        </h1>
        {!isNaming && (
          <>
            <div
              className="lcd-screen"
              style={{
                background: 'var(--tama-lcd-bg)',
                padding: '10px',
                width: '100%',
                boxSizing: 'border-box',
                borderRadius: '2px',
                boxShadow: 'inset 3px 3px 0px #000, inset -2px -2px 0px #3a2a10, 0 0 0 2px var(--tama-shell-dark)',
              }}
            >
              <PetDisplay status={state.status} name={state.name} onPetClick={triggerSpamClick} />
              <MessageBubble message={currentMessage} />
              <VitalsPanel
                hunger={state.hunger}
                happiness={state.happiness}
                energy={state.energy}
              />
            </div>
            <ActionPanel onAction={performAction} />
          </>
        )}
      </div>
    </div>
  );
}

export default App;
