function hash(seed: string) {
  let h = 0;
  for (let i = 0; i < seed.length; i++) {
    h = (h * 31 + seed.charCodeAt(i)) >>> 0;
  }
  return h;
}

/** Deterministic soft gradient for items without a real product photo. */
export function placeholderGradient(seed: string) {
  const h = hash(seed) % 360;
  return {
    backgroundImage: `linear-gradient(155deg, hsl(${h} 70% 92%) 0%, hsl(${(h + 40) % 360} 65% 82%) 100%)`,
  };
}
