import { useGameState } from "./hooks/useGameState";
import { VitalsPanel } from "./components/VitalsPanel";
import { NamingModal } from "./components/NamingModal";
import { ActionPanel } from "./components/ActionPanel";

function App() {
  const { state, isNaming, submitName, performAction } = useGameState();

  return (
    <div className="min-h-screen bg-orange-50 flex flex-col items-center justify-center p-4">
      {isNaming && <NamingModal submitName={submitName} />}
      <h1 className="text-3xl font-bold mb-2 text-orange-700">
        {state.name ? `${state.name}'s Stats` : "Zuki's Stats"}
      </h1>
      <VitalsPanel
        hunger={state.hunger}
        happiness={state.happiness}
        energy={state.energy}
      />
      {!isNaming && <ActionPanel onAction={performAction} />}
    </div>
  );
}

export default App;
