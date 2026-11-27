import { describe, expect, it, vi } from 'vitest';
import { Rooms, parseJoin } from '../src/rooms.ts';
import type { KitRoom } from '../src/types.ts';

function fakeRoom(): KitRoom {
  return {
    size: 0,
    full: false,
    maxPlayers: 12,
    connect() {},
    receive() {},
    disconnect() {},
    info: () => ({ phase: 'lobby' }),
  };
}

function fill<R extends KitRoom>(rooms: Rooms<R>, id: string, n: number) {
  const e = rooms.list.get(id)!;
  Object.defineProperty(e.room, 'full', { get: () => true, configurable: true });
  Object.defineProperty(e.room, 'size', { get: () => n, configurable: true });
}

describe('Rooms.resolve', () => {
  it('create public listed unlocked', () => {
    const r = new Rooms(fakeRoom);
    const res = r.resolve({ kind: 'create', name: '  Lake  ', isPublic: true, pass: '' });
    expect(res.ok).toBe(true);
    const s = r.stats();
    expect(s).toHaveLength(1);
    expect(s[0]).toMatchObject({ name: 'Lake', locked: false, players: 0, max: 12, phase: 'lobby' });
  });

  it('create private locked, stats has no password field', () => {
    const r = new Rooms(fakeRoom);
    r.resolve({ kind: 'create', name: 'Secret', isPublic: false, pass: 'abc' });
    const s = r.stats()[0]!;
    expect(s.locked).toBe(true);
    expect(JSON.stringify(s)).not.toContain('abc');
    expect('password' in s).toBe(false);
  });

  it('private without pass becomes unlocked', () => {
    const r = new Rooms(fakeRoom);
    r.resolve({ kind: 'create', name: 'X', isPublic: false, pass: '' });
    expect(r.stats()[0]!.locked).toBe(false);
  });

  it('sanitizes name length and fallback', () => {
    const r = new Rooms(fakeRoom);
    r.resolve({ kind: 'create', name: 'a'.repeat(40), isPublic: true, pass: '' });
    r.resolve({ kind: 'create', name: '   ', isPublic: true, pass: '' });
    const names = r.stats().map((s) => s.name);
    expect(names[0]).toHaveLength(24);
    expect(names[1]).toBe('Room');
  });

  it('rejects bad password', () => {
    const r = new Rooms(fakeRoom);
    const c = r.resolve({ kind: 'create', name: 'S', isPublic: false, pass: 'abc' });
    if (!c.ok) throw new Error('create failed');
    expect(r.resolve({ kind: 'id', id: c.entry.code, pass: 'x' })).toEqual({ ok: false, reason: 'bad_pass' });
    expect(r.resolve({ kind: 'id', id: c.entry.code, pass: '' })).toEqual({ ok: false, reason: 'bad_pass' });
  });

  it('accepts right password', () => {
    const r = new Rooms(fakeRoom);
    const c = r.resolve({ kind: 'create', name: 'S', isPublic: false, pass: 'abc' });
    if (!c.ok) throw new Error('create failed');
    const j = r.resolve({ kind: 'id', id: c.entry.code, pass: 'abc' });
    expect(j.ok && j.entry).toBe(c.entry);
  });

  it('missing id', () => {
    const r = new Rooms(fakeRoom);
    expect(r.resolve({ kind: 'id', id: 'c:99', pass: '' })).toEqual({ ok: false, reason: 'missing' });
  });

  it('full room', () => {
    const r = new Rooms(fakeRoom);
    const c = r.resolve({ kind: 'create', name: 'F', isPublic: true, pass: '' });
    if (!c.ok) throw new Error('create failed');
    fill(r, c.entry.code, 12);
    expect(r.resolve({ kind: 'id', id: c.entry.code, pass: '' })).toEqual({ ok: false, reason: 'full' });
  });

  it('code join unchanged', () => {
    const r = new Rooms(fakeRoom);
    const a = r.resolve({ kind: 'code', code: 'abc' });
    const b = r.resolve({ kind: 'code', code: 'ABC' });
    expect(a.ok && b.ok && a.entry === b.entry).toBe(true);
    expect(a.ok && a.entry.code).toBe('p:ABC');
    expect(r.stats()[0]).toMatchObject({ id: 'p:ABC', name: 'ABC', locked: false });
  });

  it('quick picks largest public non-full', () => {
    const r = new Rooms(fakeRoom);
    const q1 = r.resolve({ kind: 'quick' });
    if (!q1.ok) throw new Error();
    Object.defineProperty(q1.entry.room, 'size', { get: () => 3, configurable: true });
    const q2 = r.resolve({ kind: 'quick' });
    expect(q2.ok && q2.entry).toBe(q1.entry);
    fill(r, q1.entry.code, 12);
    const q3 = r.resolve({ kind: 'quick' });
    expect(q3.ok && q3.entry).not.toBe(q1.entry);
    expect(q3.ok && q3.entry.name).toMatch(/^Quick Play \d+$/);
  });

  it('tickAll deletes room empty longer than ttl', () => {
    const r = new Rooms(fakeRoom, 1000);
    const c = r.create('c:1', 'Room 1', true, null);
    expect(r.list.size).toBe(1);
    r.tickAll(c.emptySince + 1001);
    expect(r.list.size).toBe(0);
  });

  it('tickAll calls tick on non-empty room', () => {
    const tickSpy = vi.fn();
    const roomWithTick = (): KitRoom => ({
      ...fakeRoom(),
      size: 1,
      tick: tickSpy,
    });
    const r = new Rooms(roomWithTick);
    r.create('c:1', 'Room 1', true, null);
    r.tickAll();
    expect(tickSpy).toHaveBeenCalledTimes(1);
  });
});

describe('parseJoin', () => {
  const p = (s: string) => parseJoin(new URLSearchParams(s));
  it('parseJoin create', () => {
    expect(p('create=1&name=A&private=1&pass=p')).toEqual({ kind: 'create', name: 'A', isPublic: false, pass: 'p' });
    expect(p('create=1&name=B')).toEqual({ kind: 'create', name: 'B', isPublic: true, pass: '' });
  });
  it('parseJoin id', () => {
    expect(p('id=c%3A3&pass=x')).toEqual({ kind: 'id', id: 'c:3', pass: 'x' });
  });
  it('parseJoin room code', () => {
    expect(p('room=ABC')).toEqual({ kind: 'code', code: 'ABC' });
  });
  it('parseJoin empty → quick', () => {
    expect(p('')).toEqual({ kind: 'quick' });
  });
  it('parseJoin pass longer than 32 truncated', () => {
    const longPass = 'a'.repeat(40);
    const res = p(`id=c:1&pass=${longPass}`);
    expect(res).toEqual({ kind: 'id', id: 'c:1', pass: 'a'.repeat(32) });
  });
});
