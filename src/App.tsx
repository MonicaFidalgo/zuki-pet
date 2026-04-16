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
    <div className="min-h-screen bg-orange-50 flex flex-col items-center justify-center p-4">
      {isNaming && <NamingModal submitName={submitName} />}
      <h1 className="text-3xl font-bold mb-4 text-orange-700">
        {state.name ? `${state.name}'s Stats` : "Zuki's Stats"}
      </h1>
      {!isNaming && (
        <>
          <PetDisplay status={state.status} name={state.name} onPetClick={triggerSpamClick} />
          <MessageBubble message={currentMessage} />
          <VitalsPanel
            hunger={state.hunger}
            happiness={state.happiness}
            energy={state.energy}
          />
          <ActionPanel onAction={performAction} />
        </>
      )}
    </div>
  );
}

export default App;
