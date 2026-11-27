import { describe, it, expect } from 'vitest';
import { joinQuery, escapeUiText, inviteLink } from '../src/rooms.ts';

describe('rooms helpers', () => {
  it('joinQuery({kind:"quick"}) === ""', () => {
    expect(joinQuery({ kind: 'quick' })).toBe('');
  });

  it('joinQuery({kind:"code",code:"P:AB"}) === "?room=P%3AAB"', () => {
    expect(joinQuery({ kind: 'code', code: 'P:AB' })).toBe('?room=P%3AAB');
  });

  it('joinQuery({kind:"id",id:"c:1",pass:"x"}) === "?id=c%3A1&pass=x"', () => {
    expect(joinQuery({ kind: 'id', id: 'c:1', pass: 'x' })).toBe('?id=c%3A1&pass=x');
  });

  it('joinQuery({kind:"create",name:"R",isPublic:false,pass:"p"}) === "?create=1&name=R&private=1&pass=p"', () => {
    expect(joinQuery({ kind: 'create', name: 'R', isPublic: false, pass: 'p' })).toBe('?create=1&name=R&private=1&pass=p');
  });

  it('escapeUiText("<a&\\"")', () => {
    expect(escapeUiText('<a&"')).toBe('&lt;a&amp;&quot;');
  });

  it('inviteLink("http://h","P:AB") === "http://h/?room=P%3AAB"', () => {
    expect(inviteLink('http://h', 'P:AB')).toBe('http://h/?room=P%3AAB');
  });
});
