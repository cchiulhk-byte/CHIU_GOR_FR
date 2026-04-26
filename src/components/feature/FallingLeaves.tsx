const LEAF_URL = 'https://public.readdy.ai/ai/img_res/788dfe8e-2bd1-478f-ade8-175d13c52bb9.png';

// Autumn colour filters — sepia base removes green, then hue-rotate for variety
const AUTUMN_FILTERS = [
  'sepia(0.3) saturate(1.2) brightness(1.05)',
  'sepia(0.3) hue-rotate(10deg) saturate(1.3) brightness(1.1)',
  'sepia(0.3) hue-rotate(20deg) saturate(1.4) brightness(1.15)',
  'sepia(0.3) hue-rotate(30deg) saturate(1.5) brightness(1.2)',
  'sepia(0.3) hue-rotate(15deg) saturate(1.35) brightness(1.05)',
  'sepia(0.3) hue-rotate(25deg) saturate(1.45) brightness(1.15)',
  'sepia(0.3) hue-rotate(35deg) saturate(1.5) brightness(1.1)',
];

// [left%, duration(s), size(px), filterIndex, opacity]
// 14 leaves evenly spread across the width
const LEAF_CONFIG: [number, number, number, number, number][] = [
  [4,  20, 14, 0, 0.80],
  [12, 18, 32, 1, 0.85],
  [21, 24, 18, 2, 0.75],
  [30, 17, 40, 3, 0.85],
  [40, 22, 12, 4, 0.80],
  [50, 19, 28, 5, 0.85],
  [59, 25, 22, 6, 0.75],
  [68, 16, 36, 0, 0.85],
  [77, 21, 16, 1, 0.80],
  [86, 23, 44, 2, 0.75],
  [94, 18, 20, 3, 0.85],
  [8,  26, 34, 4, 0.80],
  [45, 20, 24, 5, 0.75],
  [82, 17, 14, 6, 0.85],
];

// Spread 34 leaves evenly across the cycle using equal progress steps
// so at t=0 they are uniformly distributed top-to-bottom in the viewport
const PROGRESS_STEPS = LEAF_CONFIG.map((_, i) => i / LEAF_CONFIG.length);

const ANIM_NAMES = ['leaf-fall', 'leaf-fall-slow', 'leaf-fall-drift'];

export default function FallingLeaves() {
  return (
    <div
      className="fixed inset-0 pointer-events-none select-none overflow-hidden"
      style={{ zIndex: 5 }}
      aria-hidden="true"
    >
      {LEAF_CONFIG.map(([left, duration, size, filterIdx, opacity], i) => {
        // Negative delay places the leaf at `progress` fraction through its cycle
        const negDelay = -(PROGRESS_STEPS[i] * duration);
        const animName = ANIM_NAMES[i % ANIM_NAMES.length];

        return (
          <div
            key={i}
            className="absolute top-0 pointer-events-none"
            style={{
              left: `${left}%`,
              opacity,
              animation: `${animName} ${duration}s linear ${negDelay}s infinite`,
            }}
          >
            <img
              src={LEAF_URL}
              alt=""
              style={{
                width: `${size}px`,
                height: `${size}px`,
                filter: AUTUMN_FILTERS[filterIdx],
              }}
            />
          </div>
        );
      })}
    </div>
  );
}
