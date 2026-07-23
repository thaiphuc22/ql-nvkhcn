import { APPROVAL_MATRIX, resolveApprovers } from './approval-matrix';

describe('resolveApprovers', () => {
  it('picks the first-match rule by ascending priority within the same slot', () => {
    const result = resolveApprovers(APPROVAL_MATRIX, {
      slot: 'PHE_DUYET',
      cap: 'TD',
      tongDuToan: 12_000_000_000,
    });

    expect(result.matchedRule?.id).toBe('AM-05');
    expect(result.mode).toBe('ANY_ONE');
    expect(result.approvers.map((a) => a.user.id)).toContain('U-013');
  });

  it('falls back to the lower-priority rule when the higher-priority condition fails', () => {
    const result = resolveApprovers(APPROVAL_MATRIX, {
      slot: 'PHE_DUYET',
      cap: 'TD',
      tongDuToan: 1_000_000_000,
    });

    expect(result.matchedRule?.id).toBe('AM-07');
    expect(result.approvers.map((a) => a.user.id)).toContain('U-011');
  });

  it('returns no match when no rule in the slot satisfies the context (fail-closed)', () => {
    const result = resolveApprovers(APPROVAL_MATRIX, { slot: 'HOI_DONG', loaiHoiDong: 'KHONG' });

    expect(result.matchedRule).toBeNull();
    expect(result.approvers).toEqual([]);
    expect(result.warnings.length).toBeGreaterThan(0);
  });

  it('redirects an approver to the delegate when a delegation is active on the resolve date', () => {
    const result = resolveApprovers(APPROVAL_MATRIX, {
      slot: 'PHE_DUYET',
      cap: 'CS',
      ngay: '2026-07-10',
    });

    expect(result.matchedRule?.id).toBe('AM-06');
    // AM-06 assigns TGD_VHT (U-007), delegated to U-005 for 2026-07-01..15.
    const approver = result.approvers.find((a) => a.delegatedFrom);
    expect(approver?.user.id).toBe('U-005');
    expect(approver?.delegatedFrom?.id).toBe('U-007');
  });

  it('does not apply the delegation outside its effective date range', () => {
    const result = resolveApprovers(APPROVAL_MATRIX, {
      slot: 'PHE_DUYET',
      cap: 'CS',
      ngay: '2026-08-01',
    });

    expect(result.approvers.some((a) => a.delegatedFrom)).toBe(false);
    expect(result.approvers.map((a) => a.user.id)).toContain('U-007');
  });
});
