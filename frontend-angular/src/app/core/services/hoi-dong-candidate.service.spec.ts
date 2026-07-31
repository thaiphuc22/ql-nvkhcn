import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { API_BASE_URL } from '../api-config';
import type { AssignmentResponse, OrganizationResponse, UserResponse } from '../models/identity';
import { HoiDongCandidateService, type CandidateProfile, type FormOption } from './hoi-dong-candidate.service';

function user(id: string, email: string, fullName: string, extra: Partial<UserResponse> = {}): UserResponse {
  return {
    id,
    email,
    employeeCode: null,
    fullName,
    jobTitle: null,
    organizationId: null,
    status: 'ACTIVE',
    administrator: false,
    ...extra,
  };
}

function assignment(userId: string, roleCode: string): AssignmentResponse {
  return {
    id: `as-${userId}-${roleCode}`,
    userId,
    roleCode,
    dataScope: 'ALL',
    organizationId: null,
    effectiveFrom: null,
    effectiveTo: null,
  };
}

describe('HoiDongCandidateService', () => {
  let service: HoiDongCandidateService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(HoiDongCandidateService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  function flush(users: UserResponse[], assignments: AssignmentResponse[]): void {
    http.expectOne(`${API_BASE_URL}/api/users`).flush(users);
    http.expectOne(`${API_BASE_URL}/api/users/role-assignments`).flush(assignments);
  }

  it('offers only users holding a council role, keyed by the identifier used for task matching', () => {
    let options: FormOption[] = [];
    service.candidates().subscribe((value) => (options = value));

    flush(
      [
        user('u1', 'HoiDong1@Example.com', 'Nguyễn Văn A', { jobTitle: 'Trưởng phòng' }),
        user('u2', 'hoidongtd@example.com', 'Trần Thị B'),
        user('u3', 'pm@example.com', 'Lê Văn C'),
      ],
      [assignment('u1', 'HDXD'), assignment('u2', 'HDXD_TD'), assignment('u3', 'PM')],
    );

    // Chỉ giữ vai trò hội đồng — PM có thể tạo hồ sơ nhưng không đủ tư cách ngồi hội đồng.
    expect(options.map((o) => o.value)).toEqual(['hoidong1@example.com', 'hoidongtd@example.com']);
    // `value` phải là email viết thường: đây chính là chuỗi sẽ nằm trong candidate_users và được so
    // khớp với X-QTKHCN-User-Id (vốn đã lowercase) khi quyết định ai xử lý được User Task.
    expect(options[0]).toEqual({ value: 'hoidong1@example.com', label: 'Nguyễn Văn A — Trưởng phòng' });
    expect(options[1].label).toBe('Trần Thị B');
  });

  it('excludes deactivated accounts so a leaver cannot be appointed to a new council', () => {
    let options: FormOption[] = [];
    service.candidates().subscribe((value) => (options = value));

    flush(
      [
        user('u1', 'con-lam@example.com', 'Nguyễn Văn A'),
        user('u2', 'da-nghi@example.com', 'Trần Thị B', { status: 'INACTIVE' }),
      ],
      [assignment('u1', 'HDXD'), assignment('u2', 'HDXD')],
    );

    expect(options.map((o) => o.value)).toEqual(['con-lam@example.com']);
  });

  it('returns an empty list when identity-service fails instead of breaking the whole decision form', () => {
    let options: FormOption[] | undefined;
    let errored = false;
    service.candidates().subscribe({
      next: (value) => (options = value),
      error: () => (errored = true),
    });

    http.expectOne(`${API_BASE_URL}/api/users`).flush('boom', { status: 503, statusText: 'Unavailable' });
    // combineLatest huỷ nhánh còn lại ngay khi một nhánh lỗi — chỉ nhận diện request, không flush.
    expect(http.expectOne(`${API_BASE_URL}/api/users/role-assignments`).cancelled).toBe(true);

    expect(errored).toBe(false);
    expect(options).toEqual([]);
  });

  it('serves later subscribers from cache so opening the decision form repeatedly costs no extra calls', () => {
    service.candidates().subscribe();
    flush([user('u1', 'a@example.com', 'Nguyễn Văn A')], [assignment('u1', 'HDXD')]);

    let options: FormOption[] = [];
    service.candidates().subscribe((value) => (options = value));

    expect(options.map((o) => o.value)).toEqual(['a@example.com']);
  });

  it('enriches candidate profiles with job title, employee code and resolved department name', () => {
    let profiles: CandidateProfile[] = [];
    service.candidateProfiles().subscribe((value) => (profiles = value));

    http
      .expectOne(`${API_BASE_URL}/api/users`)
      .flush([
        user('u1', 'HoiDong1@Example.com', 'Nguyễn Văn A', {
          jobTitle: 'TS.',
          employeeCode: 'VHT0182',
          organizationId: 'org-1',
        }),
      ]);
    http.expectOne(`${API_BASE_URL}/api/users/role-assignments`).flush([assignment('u1', 'HDXD')]);
    const organization: OrganizationResponse = { id: 'org-1', code: 'TT01', name: 'TT Nghiên cứu Vô tuyến', parentId: null, active: true };
    http.expectOne(`${API_BASE_URL}/api/organizations`).flush([organization]);

    expect(profiles).toEqual([
      {
        userId: 'hoidong1@example.com',
        hoTen: 'Nguyễn Văn A',
        chucDanhKhoaHoc: 'TS.',
        maNhanVien: 'VHT0182',
        phongBan: 'TT Nghiên cứu Vô tuyến',
        email: 'HoiDong1@Example.com',
      },
    ]);
  });
});
