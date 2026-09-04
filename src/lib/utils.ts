export function shuffle<T>(arr: T[], seed?: number): T[] {
  const shuffled = [...arr];
  let remaining = shuffled.length;
  let randomState = seed ?? Math.floor(Math.random() * 1e9);
  const random = () => {
    randomState = (randomState * 48271) % 0x7fffffff;
    return randomState / 0x7fffffff;
  };

  while (remaining > 0) {
    const index = Math.floor(random() * remaining);
    remaining -= 1;
    [shuffled[remaining], shuffled[index]] = [shuffled[index], shuffled[remaining]];
  }

  return shuffled;
}
