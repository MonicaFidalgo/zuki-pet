interface VitalsPanelProps {
  hunger: number;
  happiness: number;
  energy: number;
}

function getBarColor(value: number): string {
  if (value > 50) return "bg-green-500";
  if (value >= 25) return "bg-yellow-400";
  return "bg-red-500";
}

interface StatRowProps {
  label: string;
  value: number;
}

function StatRow({ label, value }: StatRowProps) {
  const color = getBarColor(value);
  return (
    <div className="mb-4">
      <div className="flex justify-between mb-1">
        <span className="font-medium">{label}</span>
        <span>{Math.round(value)}</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-4">
        <div
          role="progressbar"
          aria-valuenow={value}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={label}
          className={`h-4 rounded-full transition-all ${color}`}
          style={{ width: `${value}%` }}
        />
      </div>
    </div>
  );
}

export function VitalsPanel({ hunger, happiness, energy }: VitalsPanelProps) {
  return (
    <div className="p-4 bg-white rounded-lg shadow w-full max-w-sm">
      <StatRow label="Hunger" value={hunger} />
      <StatRow label="Happiness" value={happiness} />
      <StatRow label="Energy" value={energy} />
    </div>
  );
}
