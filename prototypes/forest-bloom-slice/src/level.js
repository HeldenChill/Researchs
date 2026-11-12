// Level text: header lines "key=value", a "---" line, then grid rows.
// '#' is rock, a digit 0..5 is initial soil. Cell index is y * width + x.
export function parseLevel(text) {
  const lines = text.split(/\r?\n/);
  const sep = lines.indexOf('---');
  const header = {};
  for (const line of lines.slice(0, Math.max(sep, 0))) {
    const [k, v] = line.split('=');
    header[k.trim()] = v?.trim();
  }
  if (sep < 0 || !header.ticksPerTurn) throw new Error('level: missing header ticksPerTurn');
  if (!header.inventory) throw new Error('level: missing header inventory');
  const [a, b, c] = header.inventory.split(',').map(Number);

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
  return { width, height, rock, initialSoil, inventory: { 1: a, 2: b, 3: c }, ticksPerTurn: Number(header.ticksPerTurn) };
}
