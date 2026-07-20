import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { API_BASE_URL } from '../api-config';
import { CreateNhiemVuRequest, NhiemVuResponse } from '../models/nhiem-vu';
import { NhiemVuService } from './nhiem-vu.service';

describe('NhiemVuService', () => {
  let service: NhiemVuService;
  let http: HttpTestingController;

  const item: NhiemVuResponse = {
    ma: 'RD.2026.001', ten: 'Nhiệm vụ thử nghiệm', cap: 'CS', chuNhiem: 'TS. Nguyễn Văn A',
    donViChuTri: 'Trung tâm A', thoiGianThucHien: '01/2026 – 12/2026', duToan: '1.000.000.000 đ', giaiDoan: 'CHU_TRUONG',
  };

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideHttpClient(), provideHttpClientTesting()] });
    service = TestBed.inject(NhiemVuService);
    http = TestBed.inject(HttpTestingController);
  });

  it('deletes a mission with audit actor', () => {
    service.delete('RD/2026', 'Nguyen Van A').subscribe();
    const request = http.expectOne('/api/nhiem-vu/RD%2F2026');
    expect(request.request.method).toBe('DELETE');
    expect(request.request.headers.get('X-QTKHCN-Actor')).toBe("UTF-8''Nguyen%20Van%20A");
    request.flush(null);
  });

  afterEach(() => http.verify());

  it('loads the mission list', () => {
    service.list().subscribe((result) => expect(result).toEqual([item]));
    const request = http.expectOne(`${API_BASE_URL}/api/nhiem-vu`);
    expect(request.request.method).toBe('GET');
    request.flush([item]);
  });

  it('encodes the mission code when loading detail', () => {
    service.get('RD 2026/001').subscribe();
    const request = http.expectOne(`${API_BASE_URL}/api/nhiem-vu/RD%202026%2F001`);
    expect(request.request.method).toBe('GET');
    request.flush(item);
  });

  it('posts the backend create contract', () => {
    const payload: CreateNhiemVuRequest = { ten: item.ten, cap: item.cap, chuNhiemHoTen: 'Nguyễn Văn A', donViChuTri: item.donViChuTri };
    service.create(payload, 'Nguyen Van A').subscribe((result) => expect(result).toEqual(item));
    const request = http.expectOne(`${API_BASE_URL}/api/nhiem-vu`);
    expect(request.request.method).toBe('POST');
    expect(request.request.body).toEqual(payload);
    expect(request.request.headers.get('X-QTKHCN-Actor')).toBe("UTF-8''Nguyen%20Van%20A");
    request.flush(item);
  });
});
