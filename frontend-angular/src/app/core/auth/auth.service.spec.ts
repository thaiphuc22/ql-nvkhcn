import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { AuthService } from './auth.service';

describe('AuthService app entitlement', () => {
  let httpMock: HttpTestingController;

  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
    TestBed.configureTestingModule({ providers: [provideHttpClient(), provideHttpClientTesting()] });
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

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

  it('login() does not call identity-service on its own (refresh is opt-in via refreshCurrentUser)', () => {
    const auth = TestBed.inject(AuthService);
    auth.login('pm@example.com', '123456');
    httpMock.expectNone((req) => req.url.startsWith('/api/effective-permissions/'));
  });

  it('demo accounts carry no static roleCodes — identity-service is the only source', () => {
    const auth = TestBed.inject(AuthService);
    auth.login('pm@example.com', '123456');
    expect(auth.user()?.roleCodes).toEqual([]);
    expect(auth.rolesLoaded()).toBe(false);
    expect(auth.identityUnavailable()).toBe(false);
  });

  it('refreshCurrentUser() loads real roleCodes/administrator from identity-service, keeps static apps', () => {
    const auth = TestBed.inject(AuthService);
    auth.login('pm@example.com', '123456');

    auth.refreshCurrentUser();
    const req = httpMock.expectOne('/api/effective-permissions/pm%40example.com');
    req.flush({
      id: 'u1',
      userId: 'u1',
      email: 'pm@example.com',
      fullName: 'Trần Văn Nam',
      organizationId: null,
      roleCodes: ['PM', 'PA'],
      permissions: ['SUBMIT_DOSSIER'],
      administrator: false,
    });

    expect(auth.user()?.roleCodes).toEqual(['PM', 'PA']);
    expect(auth.user()?.isAdmin).toBe(false);
    expect(auth.user()?.apps).toEqual(['qlnvkhcn']);
    expect(auth.rolesLoaded()).toBe(true);
    expect(auth.identityUnavailable()).toBe(false);
  });

  it('administrator from identity-service wins over the static isAdmin flag (can be lowered)', () => {
    const auth = TestBed.inject(AuthService);
    auth.login('admin@example.com', '123456');
    expect(auth.user()?.isAdmin).toBe(true);

    auth.refreshCurrentUser();
    httpMock.expectOne('/api/effective-permissions/admin%40example.com').flush({
      id: 'u9', userId: 'u9', email: 'admin@example.com', fullName: 'Lê Văn Cường',
      organizationId: null, roleCodes: [], permissions: [], administrator: false,
    });

    expect(auth.user()?.isAdmin).toBe(false);
  });

  it('refreshCurrentUser() failure flags identityUnavailable instead of failing silently', () => {
    const auth = TestBed.inject(AuthService);
    auth.login('pm@example.com', '123456');

    auth.refreshCurrentUser();
    const req = httpMock.expectOne('/api/effective-permissions/pm%40example.com');
    req.flush({ message: 'unreachable' }, { status: 0, statusText: 'Unknown Error' });

    // Login không bị phá; nhưng UI phải biết là "chưa nạp được" chứ không phải "không có vai trò".
    expect(auth.user()?.email).toBe('pm@example.com');
    expect(auth.user()?.roleCodes).toEqual([]);
    expect(auth.identityUnavailable()).toBe(true);
    expect(auth.rolesLoaded()).toBe(true);
  });

  it('logout() clears the role-loading flags so the next login starts from unknown', () => {
    const auth = TestBed.inject(AuthService);
    auth.login('pm@example.com', '123456');
    auth.refreshCurrentUser();
    httpMock.expectOne('/api/effective-permissions/pm%40example.com')
      .flush({ message: 'unreachable' }, { status: 0, statusText: 'Unknown Error' });
    expect(auth.identityUnavailable()).toBe(true);

    auth.logout();
    expect(auth.rolesLoaded()).toBe(false);
    expect(auth.identityUnavailable()).toBe(false);
  });
});
