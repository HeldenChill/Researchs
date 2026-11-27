// Hand copy of .cursor/plans/implement/2026-11-26-sandworm-rung01.md. If they differ, the plan wins.
// The last leaf of each path: which part of the logical space theory the task builds or checks.
export type Part = 'V' | 'S' | 'A' | 'O' | 'W' | 'check';
export type Leaf = {part: Part; text: string; why: string};

export const PARTS: {part: Part | 'Y'; symbol: string; name: string}[] = [
  {part: 'V', symbol: '𝒱', name: 'Vocabulary'},
  {part: 'S', symbol: '𝒮', name: 'State'},
  {part: 'A', symbol: '𝒜', name: 'Actions'},
  {part: 'O', symbol: 'Ô', name: 'Operators'},
  {part: 'W', symbol: 'Ω', name: 'Boundary'},
  {part: 'check', symbol: '✓', name: 'Gates and principles'},
  {part: 'Y', symbol: 'Y', name: 'Observation'},
];

// Progress recorded in the plan on 2026-11-26. G1 and G2 come from the owner's replies.
export const RECORDED = ['G1', 'G2', 'T0', 'T1', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'T8', 'T9', 'T10', 'T11', 'T12', 'T13', 'T14'];

export const LEAVES: Record<string, Leaf> = {
  G1: {part: 'check', text: 'P1 basis and resolution', why: 'Fixes what is in the space and how coarse it is (L4).'},
  G2: {part: 'check', text: 'L10 regime estimate', why: 'Reads where arithmetic says the queue starves, works or overloads.'},
  G3: {part: 'check', text: 'L14 pre-registration', why: 'Thresholds are fixed before any result is seen.'},
  G4: {part: 'check', text: 'L12 climb or stop', why: 'Decides whether the basis grows by one rung. No emergence detector exists yet.'},
  T0: {part: 'check', text: 'L11 baseline evidence', why: 'Records the starting point so later changes can be traced.'},
  T1: {part: 'V', text: '𝒱 properties and rows', why: 'Food and settings as data. Rules read properties, never names.'},
  T2: {part: 'check', text: 'L10 rate arithmetic', why: 'A cheap first map of which settings could work.'},
  T3: {part: 'S', text: '𝒮 state and invariants', why: 'What a save file holds. Calculated values are not stored (L5).'},
  T4: {part: 'O', text: 'Ô S0 intake', why: 'Writes new items. The only randomness.'},
  T5: {part: 'O', text: 'Ô O5 crew motion', why: 'Writes crew position. Reads mass of the carried item.'},
  T6: {part: 'O', text: 'Ô O6 handle', why: 'Writes item place. Reads size and pit capacity (SW-2).'},
  T7: {part: 'O', text: 'Ô O18 seal', why: 'Writes breach progress and removes breaches.'},
  T8: {part: 'O', text: 'Ô O14 digest', why: 'Writes progress and hunger, removes paid food.'},
  T9: {part: 'O', text: 'Ô O16 neglect', why: 'Writes age and turns food into a breach.'},
  T10: {part: 'O', text: 'Ô O19 drain, O17 damage', why: 'Writes hunger and health.'},
  T11: {part: 'W', text: 'Ω boundary, P4 order', why: 'One step in a fixed order, with end checks and order tests.'},
  T12: {part: 'A', text: '𝒜 commands, bots outside', why: 'Five commands. The bots that choose them are not part of the space.'},
  T13: {part: 'check', text: 'L16 viability measures', why: 'Queue health checks. They are not a detector of interesting play.'},
  T14: {part: 'check', text: 'P3 completeness witness', why: 'Exact command lists reach the rung 1 mechanics.'},
  T15: {part: 'check', text: 'P6 quality across seeds', why: 'Tests the pre-registered predictions over many settings.'},
  T16: {part: 'check', text: 'Gate record', why: 'States what each gate showed. P5 emergence and P7 player are not run.'},
};

export type PlanTask = {
  id: string;
  title: string;
  goal: string;
  after: string[];
  covers?: string;
  relies?: string;
  proof: string;
  checks?: string[];
};
export type PlanBranch = {name: string; note: string; mine?: boolean; tasks?: PlanTask[]; branches?: PlanBranch[]};

export type WorkGraphSpec = {
  id: string;
  label: string;
  rootTitle: string;
  rootSub: string;
  first: string;
  storageKey: string;
  recorded: string[];
  leaves: Record<string, Leaf>;
  plan: PlanBranch[];
};

export const CREW1_LEAVES: Record<string, Leaf> = {
  CG1: {part: 'check', text: 'P1 scope & rules', why: 'Decide which 1-crew abilities are in this build before coding.'},
  CG2: {part: 'check', text: 'L12 review & next step', why: 'Check the finished 1-crew demo run before adding a 2nd crew member.'},
  CT1: {part: 'V', text: '𝒱 crew & item numbers', why: 'Store speeds, weights, and damage as data tables so rules never hardcode item names.'},
  CT2: {part: 'S', text: '𝒮 crew save data', why: 'Only save raw fields (position, health, 2 hand slots, stun timer). Never save calculated speed (L5).'},
  CT3: {part: 'A', text: '𝒜 player commands', why: 'List the exact buttons/inputs a crew member can send; bad inputs do nothing.'},
  CT4: {part: 'O', text: 'Ô O5 walk & sprint', why: 'Updates crew position each tick. Heavy carried items slow you down.'},
  CT5: {part: 'O', text: 'Ô O6 pick, drop, swap', why: 'Moves items between the floor/pit and your 2 hand slots (max 1 item per slot, IV4).'},
  CT6: {part: 'O', text: 'Ô O7 throw item', why: 'Throws a held item through the air until it lands back on the floor.'},
  CT7: {part: 'O', text: 'Ô O8 trip & stun', why: 'Sprinting over clutter trips the crew, stuns them, and drops held items.'},
  CT8: {part: 'O', text: 'Ô O18 seal breach', why: 'Using a breach repairs it over time (faster with a sealing tool) until it closes.'},
  CT9: {part: 'O', text: 'Ô O17 hazard damage', why: 'Standing near an open breach drains crew health; at 0 health the crew is downed.'},
  CT10: {part: 'W', text: 'Ω game loop & test run', why: 'Runs all rules in a fixed order each tick and proves 1 crew can play start to finish.'},
};

export const CREW1_PLAN: PlanBranch[] = [
  {
    name: 'My branch',
    note: 'Decisions and reviews only you can do',
    mine: true,
    tasks: [
      {
        id: 'CG1', title: '1. Confirm what 1 crew can do', after: [],
        goal: 'Before writing code, confirm this list of abilities for a single crew member.',
        covers: 'P1 scope & basis',
        proof: 'You agree to the 4 rules below (or tell us what to change).',
        checks: [
          'Crew has 2 hand slots (left & right); each slot holds at most 1 item or tool',
          'Carrying heavier items slows walking & sprinting',
          'Sprinting over loose floor items can trip you and make you drop what you hold',
          'Crew can pick, drop, swap, throw, seal breaches, and take hazard damage (no 2nd crew or Driver yet)',
        ],
      },
      {
        id: 'CG2', title: '12. Review the 1-crew test run', after: ['CT10'],
        goal: 'Watch/read the finished 1-crew test run and decide if 1 crew feels complete.',
        covers: 'L12 climb or stop',
        proof: 'You approve the 1-crew behavior and choose whether to build 2-crew co-op next.',
      },
    ],
  },
  {
    name: 'Data & Save State',
    note: 'Numbers and what gets saved each tick',
    tasks: [
      {
        id: 'CT1', title: '2. Crew & tool numbers', after: ['CG1'],
        goal: 'Create the config file with all tuning numbers for 1 crew (no logic yet).',
        covers: 'Content rule: rules read numbers, never item names',
        relies: 'CG1 scope',
        proof: 'node --test passes; negative or zero config numbers are rejected.',
        checks: [
          'Walk speed, sprint speed, and how much each kg of carried mass slows you down',
          'Max health, hazard damage per tick, and stun duration when tripping',
          'Bare-hand seal speed vs sealing-tool speed, plus throw impulse',
        ],
      },
      {
        id: 'CT2', title: '3. Crew save state & checks', after: ['CT1'],
        goal: 'Define the Crew data object and a checker that catches impossible states.',
        covers: 'S2 Crew state, IV4 max 1 item per slot, L5 no derived state',
        relies: 'CT1 config',
        proof: 'node --test passes; checker fails if a slot has >1 item or timers are negative.',
        checks: [
          'Store: position, velocity, health, 2 hand slots, stunTimer, aim direction',
          'Do NOT store carryWeight or currentSpeed (calculate those when needed)',
          'Write checkInvariants(state) to verify 2 slots, valid health, and whole numbers',
        ],
      },
    ],
  },
  {
    name: 'Crew Actions & Rules',
    note: 'One small function per crew ability',
    branches: [
      {
        name: 'Move & Trip',
        note: 'Walking, sprinting, and tripping on clutter',
        tasks: [
          {
            id: 'CT3', title: '4. Crew input commands', after: ['CT2'],
            goal: 'Define the 7 commands a player/bot can send to 1 crew and reject invalid ones.',
            covers: 'A2 crew action set',
            relies: 'CT2 state',
            proof: 'node --test passes; bad commands (like dropping from an empty hand) leave state unchanged.',
            checks: [
              'Commands: move(dir), sprint(on/off), pick(itemId), drop(slot), throw(slot), swap(), use(target)',
              'If crew is stunned or downed (health = 0), reject action commands cleanly',
            ],
          },
          {
            id: 'CT4', title: '5. Walk & sprint with weight', after: ['CT2', 'CT3'],
            goal: 'Write moveCrew(state, cmd): move the crew using walk/sprint speed minus carry weight.',
            covers: 'O5 Crew motion',
            relies: 'CT1 speeds, CT2 slots',
            proof: 'node --test passes; heavier items move slower, stunned crew moves 0.',
            checks: [
              'Sum mass of items in both hand slots to get carry penalty',
              'If sprint is on, use sprint speed; otherwise use walk speed',
              'If stunTimer > 0 or health <= 0, decrement stunTimer and keep velocity = 0',
            ],
          },
          {
            id: 'CT7', title: '8. Trip & stun on clutter', after: ['CT4', 'CT5'],
            goal: 'Write checkTrip(state): if sprinting over an obstructing floor item, stun crew and drop held items.',
            covers: 'O8 Trip',
            relies: 'CT4 sprint, CT5 slots',
            proof: 'node --test passes; walking never trips, sprinting over clutter stuns and drops items.',
            checks: [
              'Only triggers when sprinting and touching an obstructing item on the floor',
              'Sets stunTimer and moves held items from hand slots onto the floor',
            ],
          },
        ],
      },
      {
        name: 'Hands, Seal & Health',
        note: 'Using items, repairing breaches, taking damage',
        tasks: [
          {
            id: 'CT5', title: '6. Pick, drop & swap items', after: ['CT2', 'CT3'],
            goal: 'Write handleItem(state, cmd): move items between floor/pit and the 2 hand slots.',
            covers: 'O6 Handle, IV4 two-slot rule',
            relies: 'CT2 slots',
            proof: 'node --test passes; picking when both hands are full is rejected.',
            checks: [
              'pick: puts nearby floor item into first empty hand slot',
              'drop: puts item from chosen slot onto floor (or into pit if standing at pit)',
              'swap: swaps left and right hand slots',
            ],
          },
          {
            id: 'CT6', title: '7. Throw item across room', after: ['CT5'],
            goal: 'Write throwItem(state, cmd): launch a held item in aim direction and move it until it lands.',
            covers: 'O7 Interior physics',
            relies: 'CT5 hand slot',
            proof: 'node --test passes; thrown item leaves hand, flies in air, and lands on floor.',
            checks: [
              'Clear the hand slot and set item state to air with velocity from aim',
              'Each tick, update air/rolling item position and stop it when it lands',
            ],
          },
          {
            id: 'CT8', title: '9. Seal a breach', after: ['CT3', 'CT5'],
            goal: 'Write sealBreach(state, cmd): using a nearby breach adds repair progress until it closes.',
            covers: 'O18 Seal',
            relies: 'CT3 use command, CT5 tool check',
            proof: 'node --test passes; progress stays if you stop halfway, breach disappears at 100%.',
            checks: [
              'Bare hands add base seal_rate; holding a sealing tool adds faster tool rate',
              'When breach progress reaches threshold, remove the breach from state',
            ],
          },
          {
            id: 'CT9', title: '10. Take hazard damage', after: ['CT2'],
            goal: 'Write tickHazards(state): nearby open breaches hurt the crew each tick.',
            covers: 'O17 Hazard tick',
            relies: 'CT2 health',
            proof: 'node --test passes; safe distance = 0 damage, near breach = health drops to 0.',
            checks: [
              'Check distance from crew to each open breach',
              'Subtract breachDamagePerTick from crew health (clamp at 0 = downed)',
            ],
          },
        ],
      },
    ],
  },
  {
    name: 'Game Loop & Proof',
    note: 'Put all 1-crew rules together and test',
    tasks: [
      {
        id: 'CT10', title: '11. Wire tick order & test run', after: ['CT4', 'CT6', 'CT7', 'CT8', 'CT9'],
        goal: 'Write step(state, cmds): run all 1-crew rules in fixed order and run a full scripted test.',
        covers: 'Omega boundary, P4 tick order, P3 witness',
        relies: 'All crew functions above',
        proof: 'node --test passes; same seed + commands always gives exact same final state.',
        checks: [
          'Fixed order: validate inputs -> move -> handle/throw -> trip -> seal -> hazards -> check invariants',
          'Save & reload mid-run produces identical output',
          'Scripted witness: pick item -> sprint & trip -> recover -> pick & throw -> seal breach',
        ],
      },
    ],
  },
];

export const PLAN: PlanBranch[] = [
  {
    name: 'My branch',
    note: 'Decisions and reviews only you can do',
    mine: true,
    tasks: [
      {
        id: 'G1', title: 'Confirm the assumptions', after: [],
        goal: 'The plan used recommendations for questions you did not answer. Confirm them or ask for a change.',
        proof: 'You say they are accepted, or name what to change.',
        checks: [
          'A-1 Claude builds it later; Gemini can also follow the plan',
          'A-2 TypeScript, Node 24, no packages, folder prototypes/sandworm-coop',
          'A-3 “Branch for me” means this branch',
          'A-4 A full pit refuses food; it lands on the floor. Replaces the waiting queue',
          'A-5 A neglected item turns into the breach and is gone',
          'A-6 Bare-hand sealing, one hand slot, progress stays on the breach',
          'A-7 The inside is two spots, mouth and acid, with a walking time',
        ],
      },
      {
        id: 'G2', title: 'Review the numbers sheet', after: ['T2'],
        goal: 'Check that a workable setting and a failing one both exist, and that the workable window is believable.',
        proof: 'results/rung0.md read. Any changed placeholder is written down with old and new value.',
      },
      {
        id: 'G3', title: 'Approve the thresholds', after: ['G1'],
        goal: 'Fix what counts as success before anything is measured. You fill approvedBy and approvedOn in thresholds.json. Ticking this box here approves nothing.',
        proof: 'Both approval fields are filled by you. The sweep refuses to run without them.',
        checks: [
          'Proposed run: 6000 ticks, first 600 ignored, 20 seeds, 16 must agree',
          'Bounded: survives, load at most 2 per crew at the 95th percentile, growth at most 1, idle 15% to 60%',
          'Runaway: health lost, or growth above 2, or load above 4 per crew',
          'P1: at least 3 connected bounded settings',
          'P2: at least 70% of the other settings are idle or runaway',
          'P3: border within a 25% change of arrival gap, on 2 of 3 walk lengths',
          'Recovery: from hunger 20%, 16 of 20 seeds reach 50% and do not lose',
          'Load means floor food plus open breaches',
          'Idle means standing at the mouth with no job. The walk back is work (your choice a)',
        ],
      },
      {
        id: 'G4', title: 'Review the results', after: ['T16'],
        goal: 'Read pass and fail results. Choose: build rung 2, change a rule, or stop. A failed prediction is a result.',
        proof: 'Your decision is recorded.',
      },
    ],
  },
  {
    name: 'Rung 0: numbers',
    note: 'Arithmetic first: can any crew keep the worm fed?',
    tasks: [
      {id: 'T0', title: 'Check the starting state', after: ['G1'], goal: 'Record git status and Node version. Change nothing.', proof: 'node --version starts with v24; target folder does not exist.'},
      {id: 'T1', title: 'Settings as checked data', after: ['T0'], goal: 'Types, placeholder settings and a validator. A food that can never fit the pit is refused.', covers: 'Content rule', relies: 'Q-24 capacity counts size', proof: 'node --test passes.'},
      {id: 'T2', title: 'Numbers sheet', after: ['T1'], goal: 'Compare food demand, arrivals, pit speed and hauling speed. Label each setting incapable, starve, overload or ok.', covers: 'Rung 0 pass condition', relies: 'All values are placeholders', proof: 'node --test, then node src/numbers.ts writes results/rung0.md. At least one ok and one not ok.'},
    ],
  },
  {
    name: 'Rung 1: simulation',
    note: 'No graphics, same result for the same seed',
    branches: [
      {
        name: 'State',
        note: 'What a save file holds',
        tasks: [
          {id: 'T3', title: 'State, random numbers, invariants', after: ['G2'], goal: 'Plain saved data, calculated values never stored, and a checker for impossible states.', covers: 'IV2, IV3, IV4, IV10, IV12, whole numbers only', relies: 'A-4, A-6, A-7', proof: 'node --test passes.'},
        ],
      },
      {
        name: 'Operators',
        note: 'One function per rule',
        tasks: [
          {id: 'T4', title: 'S0 scripted intake', after: ['T3'], goal: 'Food arrives at the mouth with seeded random gaps.', covers: 'S0', relies: 'A-7', proof: 'node --test passes.'},
          {id: 'T5', title: 'O5 crew motion', after: ['T3'], goal: 'Walk between two spots; heavier carried food is slower.', covers: 'O5', relies: 'A-7', proof: 'node --test passes.'},
          {id: 'T6', title: 'O6 pick up and drop', after: ['T3'], goal: 'One item in hand. Dropping at the pit enters it only if there is room.', covers: 'O6', relies: 'SW-2 decided; A-4, A-6, Q-24, Q-25, Q-27', proof: 'node --test passes.'},
          {id: 'T7', title: 'O18 seal', after: ['T3'], goal: 'Empty hands seal a breach; progress is kept and two crew add up.', covers: 'O18', relies: 'A-6', proof: 'node --test passes.'},
          {id: 'T8', title: 'O14 digest', after: ['T3'], goal: 'Everything in the pit digests together, then feeds the worm.', covers: 'O14', relies: 'SW-2 decided', proof: 'node --test passes.'},
          {id: 'T9', title: 'O16 neglect', after: ['T3'], goal: 'Floor food ages and becomes a breach. Picking it up pauses the age.', covers: 'O16', relies: 'A-5, Q-16', proof: 'node --test passes.'},
          {id: 'T10', title: 'O19 hunger and O17 damage', after: ['T3'], goal: 'Hunger drains; every breach costs health.', covers: 'O19, O17', relies: 'Constant drain, no regen', proof: 'node --test passes.'},
        ],
      },
      {
        name: 'Tick and bots',
        note: 'Rules in a fixed order, then someone to play them',
        tasks: [
          {id: 'T11', title: 'Tick order, end check, repeatability', after: ['T4', 'T5', 'T6', 'T7', 'T8', 'T9', 'T10'], goal: 'One step function. Save, load and replay give the same result. Random commands never break an invariant.', covers: 'End check, tick order, all invariants', relies: 'Section 6.5 tick order, Q-2', proof: 'node --test passes.'},
          {id: 'T12', title: 'Bot crews', after: ['T11'], goal: 'A seal-first bot that is judged and a food-first bot as a control. They live outside the logical space.', relies: 'Bots see everything, unlike players', proof: 'node --test passes.'},
        ],
      },
      {
        name: 'Evidence',
        note: 'Measure only what was written down first',
        tasks: [
          {id: 'T13', title: 'Measures and approval lock', after: ['T12'], goal: 'Load, growth, idle share, run classes, and a lock that needs your approval.', covers: 'Spec section 7', relies: 'Proposed thresholds', proof: 'node --test passes.'},
          {id: 'T14', title: 'Two witness runs', after: ['T13'], goal: 'Show by exact command lists that feeding works and that neglect then repair works.', covers: 'P3 witnesses', proof: 'Hunger 1410 after 9 steps; second run ends at health 986, hunger 430.'},
          {id: 'T15', title: 'Parameter sweep', after: ['T14', 'G3'], goal: 'Run 162 settings with 20 seeds and report pass, fail or not evaluable for each prediction.', covers: 'R1-P1, R1-P2, R1-P3, R1-V1', relies: 'Your approved thresholds', proof: 'node src/sweep.ts with today’s date writes the report.'},
          {id: 'T16', title: 'Final checklist', after: ['T15'], goal: 'Real test counts, repeatability, no item names inside rules, and the limits stated in the README.', proof: 'Every line observed, or marked PENDING with the reason.'},
        ],
      },
    ],
  },
];

export const WORM_LEAVES: Record<string, Leaf> = {
  WG1: {part: 'check', text: 'P1 scope & rules', why: 'Decide which Worm systems are in this build before coding.'},
  WG2: {part: 'check', text: 'L12 review & next step', why: 'Check the finished Worm test run before coupling with Crew & World.'},
  WT1: {part: 'V', text: '𝒱 worm & organ numbers', why: 'Store speeds, heart budget, acid capacity C, and drain rates as data.'},
  WT2: {part: 'S', text: '𝒮 worm save data', why: 'Save raw Worm fields (pos, m, h, H, heart, shock, currency, evolution) with IV1/IV2/IV12 checks.'},
  WT3: {part: 'A', text: '𝒜 driver & heart commands', why: 'List exact Driver inputs (steer, heart, eject, door, evolve); bad inputs do nothing.'},
  WT4: {part: 'O', text: 'Ô O2, O3, O4 move & bite', why: 'Moves Worm, turns ground hits into interior shake J, and bites obstacles into items.'},
  WT5: {part: 'O', text: 'Ô O1 allocate heart', why: 'Splits heart budget between Speed (s), Regen (r), and Bite (b).'},
  WT6: {part: 'O', text: 'Ô O14 digest food', why: 'Digests items in acid to pay hunger and currency at most once (IV6).'},
  WT7: {part: 'O', text: 'Ô O15 allergen react', why: 'Punishes allergens in acid with shock and hunger loss before digestion pays.'},
  WT8: {part: 'O', text: 'Ô O19 metabolism', why: 'Drains hunger (faster when s is high), heals health via r, and ticks shock.'},
  WT9: {part: 'O', text: 'Ô O20, O21, O22 organs', why: 'Ejects rear items, crafts tools from currency, and unlocks evolutions.'},
  WT10: {part: 'W', text: 'Ω worm loop & test run', why: 'Runs all Worm rules in fixed order each tick and proves a full Worm cycle.'},
};

export const WORM_PLAN: PlanBranch[] = [
  {
    name: 'My branch',
    note: 'Decisions and reviews only you can do',
    mine: true,
    tasks: [
      {
        id: 'WG1', title: '1. Confirm what the Worm can do', after: [],
        goal: 'Before coding, confirm all Worm systems in scope for this standalone Worm build.',
        covers: 'P1 scope & basis',
        proof: 'You agree to the 4 rules below (or tell us what to change).',
        checks: [
          'Heart budget splits power between Speed (s), Regen (r), and Bite (b) (IV1)',
          'Acid pit has fixed size capacity C (IV12); allergens react before paying yield',
          'Ground impacts produce shake impulse J for the interior',
          'Worm can move, bite, digest, drain hunger, heal, eject, craft, and evolve',
        ],
      },
      {
        id: 'WG2', title: '12. Review the Worm test run', after: ['WT10'],
        goal: 'Review the finished Worm test run and decide if Worm is ready to connect with Crew & World.',
        covers: 'L12 climb or stop',
        proof: 'You approve the Worm behavior and choose the next integration step.',
      },
    ],
  },
  {
    name: 'Data & Save State',
    note: 'Worm tuning numbers and saved state',
    tasks: [
      {
        id: 'WT1', title: '2. Worm & organ numbers', after: ['WG1'],
        goal: 'Create the config file with all tuning numbers for Worm movement, heart, and acid.',
        covers: 'Content rule: rules read numbers, never item names',
        relies: 'WG1 scope',
        proof: 'node --test passes; negative capacities or invalid budgets are rejected.',
        checks: [
          'Base speed, turn rate, impact threshold, and bite power',
          'Heart budget per evolution level n, and max 0..4 per organ (IV1)',
          'Acid capacity C, base hunger drain, regen rate, and craft recipes',
        ],
      },
      {
        id: 'WT2', title: '3. Worm save state & checks', after: ['WT1'],
        goal: 'Define the Worm state object and invariant checker for impossible values.',
        covers: 'S1 Worm state, IV1, IV2, IV12',
        relies: 'WT1 config',
        proof: 'node --test passes; checker catches over-budget heart, negative currency, or full-acid overflow.',
        checks: [
          'Store: position, velocity, momentum m, hunger h, health H, heart (s,r,b), shock_timer, length, currency, evolution',
          'checkInvariants(state) enforces IV1 (s+r+b <= budget), IV2 (0<=h<=100, 0<=H<=Hmax), IV12 (acid <= C)',
        ],
      },
    ],
  },
  {
    name: 'Worm Actions & Rules',
    note: 'One small function per Worm system',
    branches: [
      {
        name: 'Driver & Movement',
        note: 'Steering, impacts, and biting obstacles',
        tasks: [
          {
            id: 'WT3', title: '4. Driver & heart commands', after: ['WT2'],
            goal: 'Define Driver commands and reject illegal allocations or invalid actions.',
            covers: 'A1 Driver action set',
            relies: 'WT2 state',
            proof: 'node --test passes; over-budget heart commands are rejected without changing state.',
            checks: [
              'Commands: steer(dir), setHeart(s, r, b), eject(itemId), craft(recipeId), evolve()',
              'Reject any command that breaks IV1 or spends more currency than available',
            ],
          },
          {
            id: 'WT4', title: '5. Move, impact & bite', after: ['WT2', 'WT3'],
            goal: 'Write moveWorm, applyImpact, and biteObstacle to steer, shake interior, and eat obstacles.',
            covers: 'O2 Move worm, O3 Impact, O4 Bite',
            relies: 'WT1 thresholds, WT3 steer',
            proof: 'node --test passes; high-speed ground hit outputs shake J, strong bite spawns eaten items.',
            checks: [
              'O2: compute velocity/position from steer, s, h, and shock_timer',
              'O3: ground contact cuts momentum m and outputs shake impulse J',
              'O4: if b and m meet obstacle threshold, break obstacle and spawn items inside',
            ],
          },
        ],
      },
      {
        name: 'Heart, Acid & Organs',
        note: 'Power split, digestion, allergens, metabolism',
        tasks: [
          {
            id: 'WT5', title: '6. Heart power allocation', after: ['WT2', 'WT3'],
            goal: 'Write allocateHeart(state, cmd): update (s, r, b) within current evolution budget.',
            covers: 'O1 Allocate, IV1',
            relies: 'WT2 heart state',
            proof: 'node --test passes; each organ stays in 0..4 and sum <= budget.',
            checks: [
              'Update (s, r, b) from valid setHeart command',
              'Verify s + r + b <= budget(evolution)',
            ],
          },
          {
            id: 'WT6', title: '7. Digest food & pay rewards', after: ['WT2'],
            goal: 'Write digestAcid(state): advance digestion progress and pay hunger + currency once.',
            covers: 'O14 Digest, IV6, IV8',
            relies: 'WT2 acid capacity',
            proof: 'node --test passes; finished item pays once, sets gone, and never pays again.',
            checks: [
              'Advance progress on digestible items currently in acid',
              'On completion: add yieldHunger and currency, mark item gone (IV6, IV8)',
            ],
          },
          {
            id: 'WT7', title: '8. React to allergens', after: ['WT2'],
            goal: 'Write reactAllergens(state): allergens in acid trigger shock and hunger loss.',
            covers: 'O15 React, IV11',
            relies: 'WT2 acid items',
            proof: 'node --test passes; allergen in acid shocks worm and never pays O14 yield.',
            checks: [
              'Check items in acid with matching allergen tag',
              'Apply shock_timer and subtract allergy_hunger * share (IV11)',
            ],
          },
          {
            id: 'WT8', title: '9. Hunger drain & regen', after: ['WT5', 'WT6', 'WT7'],
            goal: 'Write tickMetabolism(state): drain hunger, heal health via r, and tick down shock.',
            covers: 'O19 Metabolism',
            relies: 'WT5 heart, WT6 digest, WT7 react',
            proof: 'node --test passes; high s drains hunger faster, high r heals H when fed.',
            checks: [
              'Drain h based on base rate + speed allocation s',
              'Heal H using regen allocation r (clamped to Hmax); decrement shock_timer',
            ],
          },
          {
            id: 'WT9', title: '10. Eject, craft & evolve', after: ['WT2', 'WT3'],
            goal: 'Write ejectItem, craftTool, and evolveWorm for rear disposal, crafting, and growth.',
            covers: 'O20 Eject, O21 Craft, O22 Evolve',
            relies: 'WT2 currency & evolution',
            proof: 'node --test passes; ejected item is gone, craft deducts currency, evolve raises budget.',
            checks: [
              'O20: items at rear node become gone (IV8)',
              'O21: spend currency on recipe to spawn tool',
              'O22: increment evolution level n and unlock higher heart budget',
            ],
          },
        ],
      },
    ],
  },
  {
    name: 'Game Loop & Proof',
    note: 'Put all Worm rules together and test',
    tasks: [
      {
        id: 'WT10', title: '11. Wire Worm tick & test run', after: ['WT4', 'WT8', 'WT9'],
        goal: 'Write stepWorm(state, cmds): run all Worm rules in fixed order and verify with a test run.',
        covers: 'Omega boundary, P4 tick order, P3 witness',
        relies: 'All Worm functions above',
        proof: 'node --test passes; O15 runs before O14, O14 runs before O19, replay matches 100%.',
        checks: [
          'Fixed order: O1 -> O2 -> O3 -> O4 -> O15 -> O14 -> O19 -> O20/21/22 -> checkInvariants',
          'Save & reload mid-run gives exact same final state',
          'Witness run: steer & bite -> digest meal -> allergen shock -> heal & evolve',
        ],
      },
    ],
  },
];

export const WORLD_LEAVES: Record<string, Leaf> = {
  EG1: {part: 'check', text: 'P1 scope & rules', why: 'Decide which World systems (items, breaches, creatures, director, apocalypse) are in scope.'},
  EG2: {part: 'check', text: 'L12 review & next step', why: 'Check the finished World test run before connecting Worm + Crew + World.'},
  ET1: {part: 'V', text: '𝒱 world & item tables', why: 'Store item weights/pieces, neglect limits, creature stats, and spawner tables as data.'},
  ET2: {part: 'S', text: '𝒮 world save data', why: 'Save items (unique IDs IV10, 1 place IV3), breaches, creatures, doors, and apocalypse_pos (IV7).'},
  ET3: {part: 'O', text: 'Ô O7 interior shake', why: 'Applies shake impulse J to loose items, carts, and crew; rolling items scatter.'},
  ET4: {part: 'O', text: 'Ô O10 break item', why: 'Splits a breakable item into N pieces without creating value (IV5, IV9, IV11).'},
  ET5: {part: 'O', text: 'Ô O16 neglect to breach', why: 'Ages floor items; expired items vanish (IV8) and open a breach.'},
  ET6: {part: 'O', text: 'Ô O9, O11, O12 creatures', why: 'Moves creatures, handles restrain timers, and tracks creature health/alive.'},
  ET7: {part: 'O', text: 'Ô O13, O23 doors & reveal', why: 'Toggles interior doors and reveals hidden allergen tags on items.'},
  ET8: {part: 'O', text: 'Ô O24, O25 director & chase', why: 'Runs seeded spawners by zone/load and advances apocalypse_pos forward (IV7).'},
  ET9: {part: 'W', text: 'Ω world loop & test run', why: 'Runs all World rules in fixed order each tick and proves determinism across seeds.'},
};

export const WORLD_PLAN: PlanBranch[] = [
  {
    name: 'My branch',
    note: 'Decisions and reviews only you can do',
    mine: true,
    tasks: [
      {
        id: 'EG1', title: '1. Confirm what the World does', after: [],
        goal: 'Before coding, confirm all environment, item, creature, and pressure rules for the World build.',
        covers: 'P1 scope & basis',
        proof: 'You agree to the 4 rules below (or tell us what to change).',
        checks: [
          'Every item has 1 exact place (IV3) and a never-reused ID (IV10)',
          'Breaking an item makes N pieces with conserved mass/yield/share (IV5, IV9, IV11)',
          'Forgotten floor items expire into open breaches (O16)',
          'Director spawns by seed & load (O24); Apocalypse only moves forward (IV7)',
        ],
      },
      {
        id: 'EG2', title: '11. Review the World test run', after: ['ET9'],
        goal: 'Review the finished World test run and decide if World is ready to combine with Worm & Crew.',
        covers: 'L12 climb or stop',
        proof: 'You approve the World behavior and choose the next integration step.',
      },
    ],
  },
  {
    name: 'Data & Save State',
    note: 'World tuning numbers and saved state',
    tasks: [
      {
        id: 'ET1', title: '2. World & item tables', after: ['EG1'],
        goal: 'Create config tables for items, breaches, creatures, doors, spawners, and apocalypse speed.',
        covers: 'Content rule: rules read properties, never names',
        relies: 'EG1 scope',
        proof: 'node --test passes; invalid piece counts or negative timers are rejected.',
        checks: [
          'Item rows: mass, size, rolls, obstructs, break_toughness, max_pieces, neglect_limit',
          'Creature rows: health, speed, restrain_time, harm',
          'Director cooldowns by zone and apocalypse_pos advance rate',
        ],
      },
      {
        id: 'ET2', title: '3. World save state & checks', after: ['ET1'],
        goal: 'Define World state (items, breaches, creatures, doors, apocalypse_pos, seed) and invariants.',
        covers: 'S2/S3 World state, IV3, IV7, IV8, IV10',
        relies: 'ET1 tables',
        proof: 'node --test passes; checker catches duplicate IDs, missing places, or backward apocalypse.',
        checks: [
          'Track nextInstanceId (monotonic, IV10) and exact place per item (IV3)',
          'Track apocalypse_pos and critical_timer (never move backward, IV7)',
          'checkInvariants(state) verifies IV3, IV7, IV8, IV10',
        ],
      },
    ],
  },
  {
    name: 'World Rules & Pressure',
    note: 'One small function per world mechanic',
    branches: [
      {
        name: 'Items & Interior',
        note: 'Shake physics, breaking items, neglect',
        tasks: [
          {
            id: 'ET3', title: '4. Interior shake & physics', after: ['ET2'],
            goal: 'Write applyInteriorPhysics(state, J): push loose items and carts using shake impulse J.',
            covers: 'O7 Interior physics',
            relies: 'ET1 rolls/mass, ET2 places',
            proof: 'node --test passes; rolling items scatter on J > 0, zero J leaves them still.',
            checks: [
              'Apply impulse J scaled by item mass and rolls flag',
              'Keep all moved items inside valid interior bounds',
            ],
          },
          {
            id: 'ET4', title: '5. Break items into pieces', after: ['ET2'],
            goal: 'Write breakItem(state, itemId, power): split an item into N pieces without creating value.',
            covers: 'O10 Break, IV5, IV9, IV11',
            relies: 'ET1 break_toughness & max_pieces',
            proof: 'node --test passes; piece masses/yields equal whole, shares sum to 1, pieces cannot break again.',
            checks: [
              'Check break_power >= break_toughness and item is not already a piece (IV5)',
              'Spawn N pieces with unique IDs (IV10), conserved totals (IV9), and share summing to 1 (IV11)',
            ],
          },
          {
            id: 'ET5', title: '6. Forgotten food opens breaches', after: ['ET2'],
            goal: 'Write tickNeglect(state): age floor items and turn expired ones into breaches.',
            covers: 'O16 Neglect, IV8',
            relies: 'ET1 neglect_limit',
            proof: 'node --test passes; expired floor item becomes gone and spawns 1 breach.',
            checks: [
              'Increment age only on loose floor items',
              'When age >= neglect_limit, mark item gone (IV8) and add a breach at its spot',
            ],
          },
        ],
      },
      {
        name: 'Hazards & Exterior',
        note: 'Creatures, doors, tags, director, apocalypse',
        tasks: [
          {
            id: 'ET6', title: '7. Creatures & stun/harm', after: ['ET2'],
            goal: 'Write tickCreatures, restrainCreature, and harmCreature for creature AI and combat.',
            covers: 'O9 Creature, O11 Restrain, O12 Harm',
            relies: 'ET1 creature stats',
            proof: 'node --test passes; restrained creature pauses, 0 health sets alive = false.',
            checks: [
              'O9: move active creatures and apply attacks when unrestrained',
              'O11/O12: restrain sets timer; harm reduces health and sets alive = false at 0',
            ],
          },
          {
            id: 'ET7', title: '8. Doors & reveal tags', after: ['ET2'],
            goal: 'Write toggleDoor and revealTag for interior doors and inspecting hidden item tags.',
            covers: 'O23 Door, O13 Reveal',
            relies: 'ET2 doors & items',
            proof: 'node --test passes; door flag flips cleanly, reveal exposes hidden tag once.',
            checks: [
              'O23: open/close door flags on valid action or contact',
              'O13: set revealed = true on target item when reveal tool is used',
            ],
          },
          {
            id: 'ET8', title: '9. Director & Apocalypse', after: ['ET2'],
            goal: 'Write tickDirector and tickApocalypse for seeded spawns and forward chase pressure.',
            covers: 'O24 Director, O25 Apocalypse, IV7',
            relies: 'ET2 seed & apocalypse_pos',
            proof: 'node --test passes; same seed spawns same obstacles, apocalypse_pos never decreases.',
            checks: [
              'O24: pick spawners from zone, current load, cooldowns, and seeded RNG',
              'O25: advance apocalypse_pos forward (IV7) and update critical_timer',
            ],
          },
        ],
      },
    ],
  },
  {
    name: 'Game Loop & Proof',
    note: 'Put all World rules together and test',
    tasks: [
      {
        id: 'ET9', title: '10. Wire World tick & test run', after: ['ET3', 'ET4', 'ET5', 'ET6', 'ET7', 'ET8'],
        goal: 'Write stepWorld(state, J, actions): run all World rules in fixed order and verify determinism.',
        covers: 'Omega boundary, P4 tick order, P3 witness',
        relies: 'All World functions above',
        proof: 'node --test passes; same seed + inputs gives identical final state after 100 ticks.',
        checks: [
          'Fixed order: O7 -> O10 -> O16 -> O9/11/12 -> O13/23 -> O24 -> O25 -> checkInvariants',
          'Save & reload mid-run produces identical output',
          'Witness run: shake -> break item -> neglect to breach -> spawn & apocalypse advance',
        ],
      },
    ],
  },
];

export const GRAPHS: Record<string, WorkGraphSpec> = {
  crew1: {
    id: 'crew1',
    label: '1 Crew: Full Function',
    rootTitle: '1 Crew runs',
    rootSub: 'full function',
    first: 'CG1',
    storageKey: 'sandworm-crew1-graph',
    recorded: [],
    leaves: CREW1_LEAVES,
    plan: CREW1_PLAN,
  },
  worm: {
    id: 'worm',
    label: 'Worm: Full Function',
    rootTitle: 'Worm runs',
    rootSub: 'full function',
    first: 'WG1',
    storageKey: 'sandworm-worm-graph',
    recorded: [],
    leaves: WORM_LEAVES,
    plan: WORM_PLAN,
  },
  world: {
    id: 'world',
    label: 'World: Full Function',
    rootTitle: 'World runs',
    rootSub: 'full function',
    first: 'EG1',
    storageKey: 'sandworm-world-graph',
    recorded: [],
    leaves: WORLD_LEAVES,
    plan: WORLD_PLAN,
  },
  rung1: {
    id: 'rung1',
    label: 'Rung 1: Intake Queue',
    rootTitle: 'Rung 1 runs',
    rootSub: 'the goal',
    first: 'G3',
    storageKey: 'sandworm-rung01-graph',
    recorded: RECORDED,
    leaves: LEAVES,
    plan: PLAN,
  },
};
