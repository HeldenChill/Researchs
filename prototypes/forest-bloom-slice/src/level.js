// Level text: header lines "key=value", a "---" line, then grid rows.
// '#' is rock, a digit 0..5 is initial soil. Cell index is y * width + x.
export function parseLevel(text) {
  const lines = text.split(/\r?\n/);
  const sep = lines.indexOf('---');
  const header = {}, lineOf = {};
  lines.slice(0, Math.max(sep, 0)).forEach((line, i) => {
    const [k, v] = line.split('=');
    header[k.trim()] = v?.trim();
    lineOf[k.trim()] = i + 1;
  });
  if (sep < 0 || !header.ticksPerTurn) throw new Error('level: missing header ticksPerTurn');
  if (!header.inventory) throw new Error('level: missing header inventory');
  const ticksPerTurn = Number(header.ticksPerTurn);
  if (!Number.isInteger(ticksPerTurn) || ticksPerTurn < 1) throw new Error(`level: line ${lineOf.ticksPerTurn} ticksPerTurn must be a positive integer`);
  const inv = header.inventory.split(',').map(Number);
  if (inv.length !== 3 || !inv.every(n => Number.isInteger(n) && n >= 0)) throw new Error(`level: line ${lineOf.inventory} inventory must be 3 non-negative integers`);
  const [a, b, c] = inv;

  const rows = [];
  for (let i = sep + 1; i < lines.length; i++) {
    if (lines[i] === '' && i >= lines.length - 1) continue; // trailing newline
    rows.push({ text: lines[i], lineNo: i + 1 });
  }
  if (rows.length === 0) throw new Error(`level: no grid rows after line ${sep + 1}`);
  const width = rows[0].text.length, height = rows.length;
  const rock = new Uint8Array(width * height), initialSoil = new Int8Array(width * height);
  rows.forEach(({ text: row, lineNo }, y) => {
    if (row.length !== width) throw new Error(`level: line ${lineNo} has ${row.length} cells, expected ${width}`);
    for (let x = 0; x < width; x++) {
      const ch = row[x], i = y * width + x;
      if (ch === '#') rock[i] = 1;
      else if (ch >= '0' && ch <= '5') initialSoil[i] = Number(ch);
      else throw new Error(`level: line ${lineNo} has unknown character '${ch}'`);
    }
  });
  return { width, height, rock, initialSoil, inventory: { 1: a, 2: b, 3: c }, ticksPerTurn };
}
