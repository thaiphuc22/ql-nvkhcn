import { describe, expect, it } from 'vitest';

import { parseImportedFormJson } from './eform-import';

describe('parseImportedFormJson', () => {
  const schema = { type: 'default', id: 'form-1', components: [] };

  it('accepts a raw form-js schema', () => {
    expect(parseImportedFormJson(JSON.stringify(schema))).toEqual(schema);
  });

  it('accepts an eForm envelope containing schema', () => {
    expect(parseImportedFormJson(JSON.stringify({ key: 'form-1', schema }))).toEqual(schema);
  });

  it('accepts a Camunda Web Modeler export without a root type', () => {
    const exported = { schemaVersion: 19, executionPlatform: 'Camunda Cloud', components: [] };
    expect(parseImportedFormJson(JSON.stringify(exported))).toEqual(exported);
  });

  it('rejects malformed JSON and invalid schemas', () => {
    expect(() => parseImportedFormJson('{')).toThrow('không phải JSON hợp lệ');
    expect(() => parseImportedFormJson(JSON.stringify({ type: 'default' }))).toThrow('components');
  });

  it('rejects files larger than 5 MB', () => {
    expect(() => parseImportedFormJson('{}', 5 * 1024 * 1024 + 1)).toThrow('5 MB');
  });
});
