// All text below comes from ../../logical-space.md. If that document changes, change this too.
type Rows = [string, string][];

export const LEDGER: {op: string; reads: string; writes: string; after: Rows}[] = [
  {
    op: 'O4 Bite',
    reads: 'contact, bite points, momentum, the truck',
    writes: 'a new item at the mouth',
    after: [['id', '17'], ['row', 'engine'], ['share', '1'], ['place', 'floor, mouth'], ['age', 'starts at 0'], ['break progress', '0']],
  },
  {
    op: 'O6 Handle',
    reads: "the crew member's action",
    writes: 'item place, crew slot',
    after: [['id', '17'], ['row', 'engine'], ['share', '1'], ['place', 'floor, chamber 1'], ['age', 'growing'], ['break progress', '0']],
  },
  {
    op: 'O10 Break',
    reads: 'break power, break toughness, max pieces, share',
    writes: 'break progress, then removes 1 item and creates 3',
    after: [['id', '18, 19, 20 (17 is gone)'], ['row', 'engine'], ['share', '⅓ each'], ['place', 'floor, chamber 1'], ['age', 'each keeps the old age'], ['break progress', '0']],
  },
  {
    op: 'O6 Handle, then O14 Digest',
    reads: 'items in acid, size, capacity, digest time',
    writes: 'digest progress, then hunger, currency, place',
    after: [['pieces left', '18 only'], ['place of 18', 'floor, chamber 1'], ['place of 19 and 20', 'gone'], ['hunger', 'paid twice'], ['currency', 'paid twice']],
  },
  {
    op: 'O16 Neglect',
    reads: "the item's place and age, the neglect limit",
    writes: 'age, then a new breach',
    after: [['id', '18'], ['place of 18', 'floor, chamber 1'], ['age of 18', 'past the limit'], ['breach', 'new, near item 18']],
  },
];

export const SORT = [
  {name: 'Stomach room', kind: 'config', kindText: 'Fixed setup', why: 'A room is a place. It says which rules are allowed there. It never changes during a match.'},
  {name: 'Acid pit', kind: 'config', kindText: 'Fixed setup, plus a rule', why: 'The pit is a place with a capacity. Digesting is a separate rule that runs there.'},
  {name: 'Heart points', kind: 'state', kindText: 'Saved state', why: 'Players change speed, regen and bite during play, so a save file must keep them. The heart station is only where they are allowed to change them.'},
  {name: 'A breach', kind: 'state', kindText: 'Saved state', why: 'It has a place, a size and an age. All three must survive a reload.'},
  {name: 'This match’s allergen', kind: 'state', kindText: 'Saved state, hidden', why: 'The same item is safe in one match and dangerous in another.'},
  {name: 'Warning colour', kind: 'derived', kindText: 'Calculated, never saved', why: 'It can be worked out from the item’s age, so saving it would only let two values disagree.'},
  {name: 'Organic', kind: 'derived', kindText: 'Calculated, never saved (proposal)', why: 'No rule needs this label. An item that pays no currency can simply be called organic.'},
  {name: 'Tyre', kind: 'config', kindText: 'A row of data', why: 'It rolls, splits in two and pays currency. Those are values of shared properties, so no tyre rule is needed.'},
  {name: 'Hammer', kind: 'config', kindText: 'A row of data (proposal)', why: 'It grants the ability to break. A better hammer is the same row with a bigger number.'},
  {name: 'Throw', kind: 'action', kindText: 'A player’s choice', why: 'It is a request. Rules decide where the object really ends up.'},
  {name: 'Auto-Bite', kind: 'operator', kindText: 'A rule', why: 'Nobody chooses it. Contact triggers it, so it is a rule and not an action.'},
  {name: 'Shake', kind: 'operator', kindText: 'A rule', why: 'A landing produces an impulse and a rule moves everything loose.'},
] as const;

export const VALUES = [
  {id: 'hunger', name: 'Hunger'},
  {id: 'place', name: 'Where an item is'},
  {id: 'health', name: 'Worm health'},
  {id: 'alloc', name: 'Heart points'},
  {id: 'share', name: 'Item share'},
  {id: 'breach', name: 'Breaches'},
  {id: 'impulse', name: 'Shake impulse'},
  {id: 'currency', name: 'Currency'},
];

export const OPERATORS: {id: string; name: string; plain: string; reads: string[]; writes: string[]}[] = [
  {id: 'O1', name: 'Allocate', plain: 'Moves heart points.', reads: ['alloc'], writes: ['alloc']},
  {id: 'O2', name: 'Move worm', plain: 'Steers using speed and hunger.', reads: ['hunger', 'alloc'], writes: []},
  {id: 'O3', name: 'Impact', plain: 'Turns a landing into a shake.', reads: [], writes: ['impulse']},
  {id: 'O4', name: 'Bite', plain: 'Creates items on contact.', reads: ['alloc'], writes: ['place']},
  {id: 'O6', name: 'Handle', plain: 'Pick up, drop, throw, cart.', reads: ['place'], writes: ['place']},
  {id: 'O7', name: 'Interior physics', plain: 'Slides and rolls loose things.', reads: ['impulse', 'place', 'share'], writes: ['place']},
  {id: 'O8', name: 'Trip', plain: 'Sprinting into clutter drops items.', reads: ['place'], writes: ['place']},
  {id: 'O10', name: 'Break', plain: 'One item becomes several.', reads: ['share', 'place'], writes: ['share', 'place']},
  {id: 'O14', name: 'Digest', plain: 'Pays out when digestion finishes.', reads: ['place', 'share'], writes: ['hunger', 'currency', 'place']},
  {id: 'O15', name: 'React', plain: 'Punishes an allergen in acid.', reads: ['place', 'share'], writes: ['hunger']},
  {id: 'O16', name: 'Neglect', plain: 'Old loose items open a breach.', reads: ['place'], writes: ['breach']},
  {id: 'O17', name: 'Hazard tick', plain: 'Breaches hurt over time.', reads: ['breach'], writes: ['health']},
  {id: 'O18', name: 'Seal', plain: 'Repairs a breach.', reads: ['breach'], writes: ['breach']},
  {id: 'O19', name: 'Metabolism', plain: 'Drains hunger, heals health.', reads: ['alloc', 'hunger', 'health'], writes: ['hunger', 'health']},
  {id: 'O20', name: 'Eject', plain: 'Removes items at the rear.', reads: ['place'], writes: ['place']},
  {id: 'O21', name: 'Craft', plain: 'Spends currency on tools.', reads: ['currency'], writes: ['currency']},
];
