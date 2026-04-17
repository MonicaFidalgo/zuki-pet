interface VitalsPanelProps {
  hunger: number;
  happiness: number;
  energy: number;
}

function getBarColor(value: number): string {
  if (value > 50) return 'var(--tama-ok)';
  if (value >= 25) return 'var(--tama-warn)';
  return 'var(--tama-danger)';
}

interface StatRowProps {
  label: string;
  value: number;
}

const TOTAL_BLOCKS = 10;

function StatRow({ label, value }: StatRowProps) {
  const barColor = getBarColor(value);
  const filledBlocks = Math.round(value / 10);

  return (
    <div style={{ marginBottom: '10px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
        <span style={{
          fontFamily: 'var(--pixel-font)',
          fontSize: '7px',
          color: 'var(--tama-lcd-on)',
          textShadow: '1px 1px 0 #000',
          textTransform: 'uppercase',
          letterSpacing: '1px',
        }}>
          {label}
        </span>
        <span style={{
          fontFamily: 'var(--pixel-font)',
          fontSize: '7px',
          color: barColor,
          textShadow: '1px 1px 0 #000',
          minWidth: '28px',
          textAlign: 'right',
        }}>
          {String(Math.round(value)).padStart(3, '0')}
        </span>
      </div>
      <div
        role="progressbar"
        aria-valuenow={value}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={label}
        style={{ display: 'flex', gap: '2px', alignItems: 'center' }}
      >
        {Array.from({ length: TOTAL_BLOCKS }, (_, i) => (
          <span
            key={i}
            className="stat-block"
            style={{
              flex: 1,
              background: i < filledBlocks ? barColor : 'var(--tama-lcd-pixel)',
              boxShadow: i < filledBlocks
                ? 'inset 1px 1px 0 rgba(255,255,255,0.25), inset -1px -1px 0 rgba(0,0,0,0.4)'
                : 'inset 1px 1px 0 rgba(0,0,0,0.3)',
            }}
          />
        ))}
      </div>
    </div>
  );
}

export function VitalsPanel({ hunger, happiness, energy }: VitalsPanelProps) {
  return (
    <div style={{ width: '100%', padding: '4px 0' }}>
      <StatRow label="Hunger" value={hunger} />
      <StatRow label="Happy" value={happiness} />
      <StatRow label="Energy" value={energy} />
    </div>
  );
}
