import { DemoUser } from './demo-users';
import { canProcessStep, hasAnyRole } from './permissions';

function user(overrides: Partial<DemoUser> = {}): DemoUser {
  return { hoTen: 'Trần Văn Nam', email: 'pm@example.com', chucDanh: 'PM', isAdmin: false, roleCodes: ['PM'], apps: ['qlnvkhcn'], ...overrides };
}

describe('permissions', () => {
  it('hasAnyRole matches when the user owns one of the requested codes', () => {
    expect(hasAnyRole(user({ roleCodes: ['PM', 'PA'] }), ['HDKHCN', 'PA'])).toBe(true);
    expect(hasAnyRole(user({ roleCodes: ['PM'] }), ['HDKHCN'])).toBe(false);
    expect(hasAnyRole(null, ['PM'])).toBe(false);
  });

  it('hasAnyRole always passes for admin regardless of roleCodes', () => {
    expect(hasAnyRole(user({ isAdmin: true, roleCodes: [] }), ['ANY_CODE'])).toBe(true);
  });

  it('canProcessStep is fail-closed for a step with no vaiTroCodes and a non-admin user', () => {
    expect(canProcessStep(user(), { vaiTroCodes: [] })).toBe(false);
    expect(canProcessStep(user({ isAdmin: true }), { vaiTroCodes: [] })).toBe(true);
  });

  it('canProcessStep returns false with no user or no step', () => {
    expect(canProcessStep(null, { vaiTroCodes: ['PM'] })).toBe(false);
    expect(canProcessStep(user(), undefined)).toBe(false);
  });

  it('canProcessStep matches by candidate group code', () => {
    expect(canProcessStep(user({ roleCodes: ['PM'] }), { vaiTroCodes: ['PM', 'PA'] })).toBe(true);
    expect(canProcessStep(user({ roleCodes: ['HDKHCN'] }), { vaiTroCodes: ['PM'] })).toBe(false);
  });
});
