import type { CSSProperties } from "react";

/**
 * A dense, drifting starfield.
 *
 * The values come from a seeded generator so the server and the browser render
 * identical markup. The layer is rendered twice and the wrapper slides up by
 * exactly half its height, so the loop repeats without a visible jump.
 *
 * Only some stars twinkle. The rest are plain positioned dots, which keeps the
 * number of running animations well below the number of stars on screen.
 */
function seeded(seed: number) {
  let value = seed;
  return () => {
    value = (value * 1664525 + 1013904223) % 4294967296;
    return value / 4294967296;
  };
}

const STAR_COUNT = 260;
const TWINKLE_SHARE = 0.4;

interface Star {
  left: string;
  top: string;
  size: number;
  dim: number;
  bright: number;
  duration: string;
  delay: string;
  twinkles: boolean;
}

const STARS: Star[] = (() => {
  const next = seeded(20260902);

  return Array.from({ length: STAR_COUNT }, () => {
    const roll = next();
    const dim = 0.12 + next() * 0.3;

    return {
      left: `${(next() * 100).toFixed(1)}%`,
      top: `${(next() * 100).toFixed(1)}%`,
      size: roll < 0.72 ? 1 : roll < 0.95 ? 1.5 : 2,
      dim: Number(dim.toFixed(2)),
      bright: Number((dim + 0.4 + next() * 0.4).toFixed(2)),
      duration: `${(2.6 + next() * 5).toFixed(1)}s`,
      // A negative delay starts each star part-way through its cycle.
      delay: `-${(next() * 8).toFixed(1)}s`,
      twinkles: next() < TWINKLE_SHARE,
    };
  });
})();

function StarLayer() {
  return (
    <div className="star-layer">
      {STARS.map((star, index) =>
        star.twinkles ? (
          <span
            key={index}
            className="is-twinkling"
            style={
              {
                left: star.left,
                top: star.top,
                width: `${star.size}px`,
                height: `${star.size}px`,
                "--star-dim": star.dim,
                "--star-bright": star.bright,
                "--star-duration": star.duration,
                "--star-delay": star.delay,
              } as CSSProperties
            }
          />
        ) : (
          <span
            key={index}
            style={{
              left: star.left,
              top: star.top,
              width: `${star.size}px`,
              height: `${star.size}px`,
              opacity: star.dim,
            }}
          />
        ),
      )}
    </div>
  );
}

export function StarField() {
  return (
    <div className="star-field" aria-hidden="true">
      <div className="star-drift">
        <StarLayer />
        <StarLayer />
      </div>
    </div>
  );
}