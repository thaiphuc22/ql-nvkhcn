import { TestBed } from '@angular/core/testing';

import { AuthService } from './auth.service';

describe('AuthService app entitlement', () => {
  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
    TestBed.configureTestingModule({});
  });

  it('returns the assigned apps for a normal demo user', () => {
    const auth = TestBed.inject(AuthService);
    expect(auth.login('cqnv@example.com', '123456').ok).toBe(true);
    expect(auth.entitledApps()).toEqual(['qlnvkhcn', 'quytrinh']);
  });

  it('gives an admin all registered apps', () => {
    const auth = TestBed.inject(AuthService);
    auth.login('admin@example.com', '123456');
    expect(auth.entitledApps()).toEqual(['qlnvkhcn', 'quytrinh', 'he-thong']);
  });

  it('only selects an entitled app and clears the selection on logout', () => {
    const auth = TestBed.inject(AuthService);
    auth.login('pm@example.com', '123456');

    expect(auth.selectApp('quytrinh')).toBe(false);
    expect(auth.activeApp()).toBeNull();
    expect(auth.selectApp('qlnvkhcn')).toBe(true);
    expect(auth.activeApp()).toBe('qlnvkhcn');

    auth.logout();
    expect(auth.activeApp()).toBeNull();
  });
});
