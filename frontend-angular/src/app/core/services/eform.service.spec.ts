import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import type { FormMeta } from '../models/eform';
import { EformService } from './eform.service';

function response(overrides: Partial<FormMeta> = {}) {
  return {
    key: 'phieu-nhan-xet', ten: 'Phiếu nhận xét', moTa: '', loai: 'Nhận xét',
    schema: { type: 'default', id: 'phieu-nhan-xet', components: [] },
    version: 1, updatedBy: 'tester', updatedAt: '2026-07-16T00:00:00Z', createdAt: '2026-07-16T00:00:00Z',
    ...overrides,
  };
}

describe('EformService HTTP integration', () => {
  let service: EformService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideHttpClient(), provideHttpClientTesting()] });
    service = TestBed.inject(EformService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('loads forms from backend into the signal cache', () => {
    service.load().subscribe();
    http.expectOne('http://localhost:8091/api/eform').flush([response()]);
    expect(service.list().map((f) => f.key)).toEqual(['phieu-nhan-xet']);
    expect(service.getForm('phieu-nhan-xet')?.ten).toBe('Phiếu nhận xét');
  });

  it('loads a single form and upserts it into the cache without wiping other entries', () => {
    service.load().subscribe();
    http.expectOne('http://localhost:8091/api/eform').flush([response()]);

    service.loadOne('phieu-y-kien').subscribe();
    http.expectOne('http://localhost:8091/api/eform/phieu-y-kien')
      .flush(response({ key: 'phieu-y-kien', ten: 'Phiếu góp ý' }));

    expect(service.list().map((f) => f.key).sort()).toEqual(['phieu-nhan-xet', 'phieu-y-kien']);
  });

  it('creates a form with an empty schema and actor header', () => {
    service.addForm({ key: 'phieu-moi', ten: 'Phiếu mới', loai: 'Góp ý' }, 'Người kiểm thử').subscribe();
    const request = http.expectOne('http://localhost:8091/api/eform');
    expect(request.request.method).toBe('POST');
    expect(request.request.body.key).toBe('phieu-moi');
    expect(request.request.body.schema.id).toBe('phieu-moi');
    expect(request.request.headers.get('X-QTKHCN-Actor')).toContain('Ng%C6%B0%E1%BB%9Di');
    request.flush(response({ key: 'phieu-moi', ten: 'Phiếu mới', loai: 'Góp ý' }));

    expect(service.getForm('phieu-moi')).toBeTruthy();
  });

  it('updates schema with optimistic If-Match and refreshes the cached version', () => {
    service.load().subscribe();
    http.expectOne('http://localhost:8091/api/eform').flush([response()]);

    const meta = service.getForm('phieu-nhan-xet')!;
    const schema = { type: 'default', id: 'phieu-nhan-xet', components: [{ type: 'textfield', id: 'a', key: 'a' }] };
    service.updateSchema(meta, schema, 'tester').subscribe();

    const request = http.expectOne('http://localhost:8091/api/eform/phieu-nhan-xet/schema');
    expect(request.request.method).toBe('PUT');
    expect(request.request.headers.get('If-Match')).toBe('1');
    request.flush(response({ schema, version: 2 }));

    expect(service.getForm('phieu-nhan-xet')?.version).toBe(2);
  });

  it('updates meta with optimistic If-Match', () => {
    service.load().subscribe();
    http.expectOne('http://localhost:8091/api/eform').flush([response()]);

    const meta = service.getForm('phieu-nhan-xet')!;
    service.updateMeta(meta, { moTa: 'Cập nhật mô tả' }, 'tester').subscribe();

    const request = http.expectOne('http://localhost:8091/api/eform/phieu-nhan-xet/meta');
    expect(request.request.body.moTa).toBe('Cập nhật mô tả');
    request.flush(response({ moTa: 'Cập nhật mô tả', version: 2 }));

    expect(service.getForm('phieu-nhan-xet')?.moTa).toBe('Cập nhật mô tả');
  });

  it('deletes with If-Match and removes the cached row', () => {
    service.load().subscribe();
    http.expectOne('http://localhost:8091/api/eform').flush([response()]);

    const meta = service.getForm('phieu-nhan-xet')!;
    service.removeForm(meta).subscribe();

    const request = http.expectOne('http://localhost:8091/api/eform/phieu-nhan-xet');
    expect(request.request.method).toBe('DELETE');
    expect(request.request.headers.get('If-Match')).toBe('1');
    request.flush(null);

    expect(service.getForm('phieu-nhan-xet')).toBeUndefined();
  });
});
