export type RelayClientMsg =
  | { t: 'hello'; name: string }
  | { t: 'claim'; obj: string }
  | { t: 'release'; obj: string }
  | { t: 'state'; obj: string; data: unknown }
  | { t: 'event'; data: unknown };

export interface RelayPeer {
  id: string;
  name: string;
}

export type RelayServerMsg =
  | { t: 'welcome'; id: string; peers: RelayPeer[]; owners: Record<string, string>; states: Record<string, unknown> }
  | { t: 'owners'; owners: Record<string, string>; error?: { obj: string; reason: string } }
  | { t: 'peer'; peer: RelayPeer }
  | { t: 'leave'; id: string }
  | { t: 'state'; from: string; obj: string; data: unknown }
  | { t: 'event'; from: string; data: unknown };
