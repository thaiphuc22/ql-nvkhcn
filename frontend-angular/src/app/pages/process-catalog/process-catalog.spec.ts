import { nativeUploadFile } from './process-catalog';
import { NzUploadFile } from 'ng-zorro-antd/upload';

describe('nativeUploadFile', () => {
  it('extracts the browser File from an NzUploadFile wrapper', () => {
    const original = new File(['<xml/>'], 'demo.bpmn', { type: 'application/xml' });
    const wrapper = { uid: '1', name: original.name, originFileObj: original } as NzUploadFile;

    expect(nativeUploadFile(wrapper)).toBe(original);
  });

  it('accepts the raw File passed by nzBeforeUpload', () => {
    const original = new File(['<xml/>'], 'demo.bpmn', { type: 'application/xml' });

    expect(nativeUploadFile(original as unknown as NzUploadFile)).toBe(original);
  });

  it('rejects metadata-only upload objects', () => {
    const wrapper = { uid: '1', name: 'demo.bpmn' } as NzUploadFile;

    expect(nativeUploadFile(wrapper)).toBeNull();
  });
});
