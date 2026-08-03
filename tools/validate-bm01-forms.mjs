import fs from 'node:fs';
import path from 'node:path';

const dir = path.resolve('outputs');
const files = fs.readdirSync(dir).filter((name) => /^BM\.01\.(?!00).*\.form\.json$/i.test(name)).sort();
let fields = 0;
const failures = [];

for (const file of files) {
  const form = JSON.parse(fs.readFileSync(path.join(dir, file), 'utf8'));
  if (form.schemaVersion !== 19 || form.components?.length !== 4) failures.push(`${file}: invalid form envelope`);
  const ids = new Set();
  const paths = new Set();
  const keys = new Set();
  const htmlParts = [];
  const visit = (components, prefix = '') => {
    for (const component of components || []) {
      if (component.id) {
        if (ids.has(component.id)) failures.push(`${file}: duplicate id ${component.id}`);
        ids.add(component.id);
      }
      if (component.type === 'html') htmlParts.push(component.content || '');
      let nextPrefix = prefix;
      if (component.key) {
        const current = prefix ? `${prefix}.${component.key}` : component.key;
        if (paths.has(current)) failures.push(`${file}: duplicate data path ${current}`);
        paths.add(current);
        keys.add(component.key);
        fields += 1;
        if (component.type === 'dynamiclist') nextPrefix = `${current}[]`;
      }
      visit(component.components, nextPrefix);
    }
  };
  visit(form.components);
  for (const html of htmlParts) {
    for (const match of html.matchAll(/{{\s*([\w.]+)\s*}}/g)) {
      if (!keys.has(match[1].split('.').at(-1))) failures.push(`${file}: unbound preview variable ${match[1]}`);
    }
  }
}

console.log(JSON.stringify({ files: files.length, fields, failures }, null, 2));
if (failures.length) process.exitCode = 1;
