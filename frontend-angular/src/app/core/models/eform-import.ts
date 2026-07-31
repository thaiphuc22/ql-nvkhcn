import type { FormSchema } from './eform';

const MAX_IMPORT_BYTES = 5 * 1024 * 1024;

/** Parse a form-js JSON file. Also accepts an eForm API/export envelope containing `schema`. */
export function parseImportedFormJson(content: string, fileSize = content.length): FormSchema {
  if (fileSize > MAX_IMPORT_BYTES) {
    throw new Error('Tệp JSON vượt quá dung lượng tối đa 5 MB.');
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(content);
  } catch {
    throw new Error('Nội dung tệp không phải JSON hợp lệ.');
  }

  const candidate = isRecord(parsed) && 'schema' in parsed ? parsed['schema'] : parsed;
  if (!isRecord(candidate)) {
    throw new Error('Schema phải là một đối tượng JSON.');
  }
  if (!Array.isArray(candidate['components'])) {
    throw new Error('Schema không đúng định dạng form-js (thiếu mảng components).');
  }

  return candidate as FormSchema;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}
