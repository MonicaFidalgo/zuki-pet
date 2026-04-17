type FoxVariant = 'normal' | 'sick' | 'evolved';

interface PixelFoxProps {
  variant: FoxVariant;
}

// 0=transparent, 1=orange fur, 2=dark brown, 3=cream, 4=black (eyes/nose)
const FOX_PIXELS = [
  [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
  [0,0,1,0,0,0,0,0,0,0,0,0,1,0,0,0],
  [0,1,2,1,0,0,0,0,0,0,0,1,2,1,0,0],
  [1,2,2,1,1,0,0,0,0,0,1,1,2,2,1,0],
  [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0],
  [0,1,1,1,1,1,1,1,1,1,1,1,1,1,0,0],
  [0,1,3,3,1,1,1,1,1,1,1,3,3,1,0,0],
  [0,1,3,4,3,1,1,1,1,1,3,4,3,1,0,0],
  [0,1,3,3,3,1,1,1,1,1,3,3,3,1,0,0],
  [0,0,1,3,3,3,4,3,3,3,1,0,0,0,0,0],
  [0,0,1,1,1,1,1,1,1,1,1,1,0,0,0,0],
  [0,0,1,1,1,1,1,1,1,1,1,1,0,0,0,0],
  [0,0,1,1,1,1,1,1,1,1,1,1,0,0,0,0],
  [0,0,0,1,1,0,0,0,0,1,1,0,0,0,0,0],
  [0,0,0,1,1,0,0,0,0,1,1,0,0,0,0,0],
  [0,0,0,2,2,0,0,0,0,2,2,0,0,0,0,0],
];

type ColorIndex = 1 | 2 | 3 | 4;
type Palette = Record<ColorIndex, string>;

const PALETTES: Record<FoxVariant, Palette> = {
  normal:  { 1: '#E87820', 2: '#9A3A08', 3: '#FAEAC8', 4: '#201008' },
  sick:    { 1: '#7A8B60', 2: '#4A5A38', 3: '#B8C0A0', 4: '#7A8B60' },
  evolved: { 1: '#FFB030', 2: '#C06010', 3: '#FFF0C0', 4: '#201008' },
};

const PX = 6; // pixels per grid cell
const SIZE = 16 * PX; // 96px

export function PixelFox({ variant }: PixelFoxProps) {
  const palette = PALETTES[variant];

  return (
    <div className={variant === 'sick' ? 'pixel-blink' : 'pixel-float'} style={{ display: 'inline-block' }}>
      <svg
        width={SIZE}
        height={SIZE}
        viewBox={`0 0 ${SIZE} ${SIZE}`}
        style={{ imageRendering: 'pixelated', display: 'block' }}
        aria-hidden="true"
      >
        {FOX_PIXELS.map((row, rowIdx) =>
          row.map((pixel, colIdx) => {
            if (pixel === 0) return null;
            return (
              <rect
                key={`${rowIdx}-${colIdx}`}
                x={colIdx * PX}
                y={rowIdx * PX}
                width={PX}
                height={PX}
                fill={palette[pixel as ColorIndex]}
              />
            );
          })
        )}

        {/* Sick: X marks over eyes */}
        {variant === 'sick' && (
          <>
            <line x1={3*PX} y1={7*PX} x2={4*PX} y2={8*PX} stroke="#B8C0A0" strokeWidth={1.5} />
            <line x1={4*PX} y1={7*PX} x2={3*PX} y2={8*PX} stroke="#B8C0A0" strokeWidth={1.5} />
            <line x1={11*PX} y1={7*PX} x2={12*PX} y2={8*PX} stroke="#B8C0A0" strokeWidth={1.5} />
            <line x1={12*PX} y1={7*PX} x2={11*PX} y2={8*PX} stroke="#B8C0A0" strokeWidth={1.5} />
          </>
        )}

        {/* Evolved: gold sparkle pixels along the top */}
        {variant === 'evolved' &&
          [0, 4, 8, 12].map(col => (
            <rect key={`sparkle-${col}`} x={col * PX} y={0} width={PX} height={PX} fill="#FFD700" />
          ))
        }
      </svg>
    </div>
  );
}
