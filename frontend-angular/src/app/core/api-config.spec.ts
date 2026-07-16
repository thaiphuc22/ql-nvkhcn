import { encodeAuditActor } from './api-config';

describe('encodeAuditActor', () => {
  it('encodes a Vietnamese name using ASCII-only header characters', () => {
    const encoded = encodeAuditActor(' Nguyễn Văn An ');

    expect(encoded).toBe("UTF-8''Nguy%E1%BB%85n%20V%C4%83n%20An");
    expect([...encoded].every((character) => character.charCodeAt(0) <= 0xff)).toBe(true);
  });
});
