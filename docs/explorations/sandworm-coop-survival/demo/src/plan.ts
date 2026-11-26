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
