import { describe, expect, it, vi } from 'vitest';
import { relayRoom } from '../src/relay.ts';
import type { Conn } from '../src/types.ts';
import type { RelayServerMsg } from '../src/relay-protocol.ts';

class FakeConn implements Conn {
  messages: RelayServerMsg[] = [];
  rawMessages: string[] = [];
  closed = false;

  send(data: Uint8Array | string) {
    if (typeof data === 'string') {
      this.rawMessages.push(data);
      try {
        this.messages.push(JSON.parse(data));
      } catch {}
    }
  }

  close() {
    this.closed = true;
  }
}

describe('RelayRoom', () => {
  it('connect sends welcome with self in peers and empty owners', () => {
    const room = relayRoom();
    const c1 = new FakeConn();
    room.connect(c1);

    expect(c1.messages.length).toBe(1);
    const welcome = c1.messages[0];
    expect(welcome?.t).toBe('welcome');
    if (welcome && welcome.t === 'welcome') {
      expect(welcome.peers).toHaveLength(1);
      const firstPeer = welcome.peers[0];
      expect(firstPeer?.id).toBe(welcome.id);
      expect(firstPeer?.name).toBe('Player');
      expect(welcome.owners).toEqual({});
      expect(welcome.states).toEqual({});
    }
  });

  it('second connect gets first peer and first gets peer msg', () => {
    const room = relayRoom();
    const c1 = new FakeConn();
    const c2 = new FakeConn();
    room.connect(c1);
    room.connect(c2);

    const w2 = c2.messages[0];
    expect(w2?.t).toBe('welcome');
    if (w2 && w2.t === 'welcome') {
      expect(w2.peers).toHaveLength(2);
    }

    const peerMsg = c1.messages.find((m) => m.t === 'peer');
    expect(peerMsg).toBeDefined();
    if (peerMsg && peerMsg.t === 'peer') {
      expect(peerMsg.peer.name).toBe('Player');
    }
  });

  it('hello renames and broadcasts peer', () => {
    const room = relayRoom();
    const c1 = new FakeConn();
    const c2 = new FakeConn();
    room.connect(c1);
    room.connect(c2);

    room.receive(c1, JSON.stringify({ t: 'hello', name: 'Alice' }));

    const peer1 = c1.messages.filter((m) => m.t === 'peer').pop();
    const peer2 = c2.messages.filter((m) => m.t === 'peer').pop();
    expect(peer1?.t === 'peer' && peer1.peer.name).toBe('Alice');
    expect(peer2?.t === 'peer' && peer2.peer.name).toBe('Alice');
  });

  it('claim free obj broadcasts owners', () => {
    const room = relayRoom();
    const c1 = new FakeConn();
    const c2 = new FakeConn();
    room.connect(c1);
    room.connect(c2);

    const id1 = (c1.messages[0] as any).id;
    room.receive(c1, JSON.stringify({ t: 'claim', obj: 'car' }));

    const o1 = c1.messages.filter((m) => m.t === 'owners').pop();
    const o2 = c2.messages.filter((m) => m.t === 'owners').pop();
    expect(o1?.t === 'owners' && o1.owners).toEqual({ car: id1 });
    expect(o2?.t === 'owners' && o2.owners).toEqual({ car: id1 });
  });

  it('claim taken obj replies error taken only to claimer', () => {
    const room = relayRoom();
    const c1 = new FakeConn();
    const c2 = new FakeConn();
    room.connect(c1);
    room.connect(c2);

    room.receive(c1, JSON.stringify({ t: 'claim', obj: 'seat:0' }));
    const c1CountBefore = c1.messages.length;

    room.receive(c2, JSON.stringify({ t: 'claim', obj: 'seat:0' }));
    expect(c1.messages.length).toBe(c1CountBefore); // c1 gets nothing new

    const o2 = c2.messages.filter((m) => m.t === 'owners').pop();
    expect(o2?.t === 'owners' && o2.error).toEqual({ obj: 'seat:0', reason: 'taken' });
  });

  it('canClaim reason refuses with that reason', () => {
    const room = relayRoom({
      canClaim: (_ctx, _peerId, obj) => (obj === 'forbidden' ? 'not_allowed' : null),
    });
    const c1 = new FakeConn();
    room.connect(c1);

    room.receive(c1, JSON.stringify({ t: 'claim', obj: 'forbidden' }));
    const o = c1.messages.filter((m) => m.t === 'owners').pop();
    expect(o?.t === 'owners' && o.error).toEqual({ obj: 'forbidden', reason: 'not_allowed' });
  });

  it('group claim releases previous obj in group and calls onRelease', () => {
    const onReleaseSpy = vi.fn();
    const room = relayRoom({
      group: (obj) => (obj.startsWith('seat:') ? 'seat' : null),
      onRelease: onReleaseSpy,
    });
    const c1 = new FakeConn();
    room.connect(c1);
    const id1 = (c1.messages[0] as any).id;

    room.receive(c1, JSON.stringify({ t: 'claim', obj: 'seat:1' }));
    expect(onReleaseSpy).not.toHaveBeenCalled();

    room.receive(c1, JSON.stringify({ t: 'claim', obj: 'seat:2' }));
    expect(onReleaseSpy).toHaveBeenCalledWith(expect.anything(), id1, 'seat:1');

    const o = c1.messages.filter((m) => m.t === 'owners').pop();
    expect(o?.t === 'owners' && o.owners).toEqual({ 'seat:2': id1 });
  });

  it('state from owner relays to others, stores, welcome of late joiner has it', () => {
    const room = relayRoom();
    const c1 = new FakeConn();
    const c2 = new FakeConn();
    room.connect(c1);
    room.connect(c2);

    const id1 = (c1.messages[0] as any).id;
    room.receive(c1, JSON.stringify({ t: 'claim', obj: 'car' }));
    room.receive(c1, JSON.stringify({ t: 'state', obj: 'car', data: { speed: 42 } }));

    // c1 sender does NOT get state relayed back
    const s1 = c1.messages.filter((m) => m.t === 'state');
    expect(s1.length).toBe(0);

    // c2 gets state
    const s2 = c2.messages.filter((m) => m.t === 'state').pop();
    expect(s2).toEqual({ t: 'state', from: id1, obj: 'car', data: { speed: 42 } });

    // Late joiner c3 gets welcome with car state
    const c3 = new FakeConn();
    room.connect(c3);
    const w3 = c3.messages[0];
    expect(w3?.t === 'welcome' && (w3 as any).states.car).toEqual({ speed: 42 });
  });

  it('state from non-owner dropped; canState override allows; validateState false drops', () => {
    let allowState = false;
    let validState = true;

    const room = relayRoom({
      canState: (_ctx, _peer, _obj) => allowState,
      validateState: (_obj, _data) => validState,
    });

    const c1 = new FakeConn();
    const c2 = new FakeConn();
    room.connect(c1);
    room.connect(c2);

    // Default canState false -> dropped
    room.receive(c1, JSON.stringify({ t: 'state', obj: 'obj1', data: { x: 1 } }));
    expect(c2.messages.filter((m) => m.t === 'state').length).toBe(0);

    // canState true -> allowed
    allowState = true;
    room.receive(c1, JSON.stringify({ t: 'state', obj: 'obj1', data: { x: 2 } }));
    expect(c2.messages.filter((m) => m.t === 'state').length).toBe(1);

    // validateState false -> dropped
    validState = false;
    room.receive(c1, JSON.stringify({ t: 'state', obj: 'obj1', data: { x: 3 } }));
    expect(c2.messages.filter((m) => m.t === 'state').length).toBe(1);
  });

  it('event relays to others with from', () => {
    const room = relayRoom();
    const c1 = new FakeConn();
    const c2 = new FakeConn();
    room.connect(c1);
    room.connect(c2);

    const id1 = (c1.messages[0] as any).id;
    room.receive(c1, JSON.stringify({ t: 'event', data: { honk: true } }));

    expect(c1.messages.filter((m) => m.t === 'event').length).toBe(0);
    const ev2 = c2.messages.filter((m) => m.t === 'event').pop();
    expect(ev2).toEqual({ t: 'event', from: id1, data: { honk: true } });
  });

  it('disconnect releases all owned objects, calls onRelease, broadcasts leave and owners', () => {
    const onReleaseSpy = vi.fn();
    const room = relayRoom({ onRelease: onReleaseSpy });
    const c1 = new FakeConn();
    const c2 = new FakeConn();
    room.connect(c1);
    room.connect(c2);

    const id1 = (c1.messages[0] as any).id;
    room.receive(c1, JSON.stringify({ t: 'claim', obj: 'item1' }));
    room.receive(c1, JSON.stringify({ t: 'claim', obj: 'item2' }));

    c2.messages = [];
    room.disconnect(c1);

    expect(onReleaseSpy).toHaveBeenCalledWith(expect.anything(), id1, 'item1');
    expect(onReleaseSpy).toHaveBeenCalledWith(expect.anything(), id1, 'item2');

    expect(c2.messages).toHaveLength(2);
    expect(c2.messages[0]).toEqual({ t: 'leave', id: id1 });
    expect(c2.messages[1]).toEqual({ t: 'owners', owners: {} });
  });

  it('garbage is ignored', () => {
    const room = relayRoom({ maxPayload: 100 });
    const c1 = new FakeConn();
    room.connect(c1);
    c1.messages = [];

    // Binary
    room.receive(c1, new Uint8Array([1, 2, 3]));
    // Not json
    room.receive(c1, 'not json');
    // Unknown t
    room.receive(c1, '{"t":"nope"}');
    // Bad claim obj empty
    room.receive(c1, JSON.stringify({ t: 'claim', obj: '' }));
    // Bad claim obj > 64 chars
    room.receive(c1, JSON.stringify({ t: 'claim', obj: 'a'.repeat(65) }));
    // Bad hello whitespace
    room.receive(c1, JSON.stringify({ t: 'hello', name: '   ' }));
    // Exceeds maxPayload
    room.receive(c1, 'x'.repeat(150));

    expect(c1.messages.length).toBe(0);
  });

  it('full when size reaches maxPlayers', () => {
    const room = relayRoom({ maxPlayers: 2 });
    expect(room.full).toBe(false);
    const c1 = new FakeConn();
    const c2 = new FakeConn();
    room.connect(c1);
    expect(room.full).toBe(false);
    room.connect(c2);
    expect(room.full).toBe(true);
  });
});
