// State holds only what changes over time. Derived values are never stored here.
export function createState(level) {
  const n = level.width * level.height;
  return {
    soil: Int8Array.from(level.initialSoil),
    species: new Uint8Array(n),
    age: new Int16Array(n),
    inventory: { ...level.inventory },
    tick: 0,
  };
}

export function cloneState(s) {
  return {
    soil: Int8Array.from(s.soil),
    species: Uint8Array.from(s.species),
    age: Int16Array.from(s.age),
    inventory: { ...s.inventory },
    tick: s.tick,
  };
}
