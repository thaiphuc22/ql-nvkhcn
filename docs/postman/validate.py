"""Bắn THẬT mọi request read-only trong collection vào stack dev, báo cái nào không 2xx.

Bỏ qua request có ⚠️ (ghi dữ liệu). Mục đích: bắt hết lỗi kiểu `"limit": "500"` (chuỗi ở vị
trí số) chứ không sửa từng cái một khi người dùng gặp phải.
"""
import json
import urllib.request
import urllib.error

COL = json.load(open(r'c:/Users/phuctd7/ql-nvkhcn/docs/postman/Camunda.postman_collection.json',
                     encoding='utf-8'))
CAMUNDA = 'http://localhost:8080'
APP = 'http://127.0.0.1:8090'


def call(method, url, body=None, headers=None):
    data = body.encode('utf-8') if body else None
    r = urllib.request.Request(url, data=data, method=method)
    for k, v in (headers or {}).items():
        r.add_header(k, v)
    try:
        with urllib.request.urlopen(r, timeout=15) as resp:
            return resp.status, resp.read().decode('utf-8', 'replace')
    except urllib.error.HTTPError as e:
        return e.code, e.read().decode('utf-8', 'replace')
    except Exception as e:
        return 0, str(e)


def search(path, body='{}'):
    s, t = call('POST', CAMUNDA + path, body, {'Content-Type': 'application/json'})
    if s != 200:
        return []
    return json.loads(t).get('items', [])


# --- lấy giá trị runtime thật để thay biến -------------------------------------
import datetime, uuid
_now = datetime.datetime.now(datetime.timezone.utc)
V = {'{{camundaBase}}': CAMUNDA, '{{appBase}}': APP, '{{maxScan}}': '500',
     '{{actor}}': "UTF-8''test", '{{bearer}}': '',
     '{{userId}}': 'admin@example.com',
     '{{$guid}}': str(uuid.uuid4()),
     '{{nowIso}}': _now.isoformat().replace('+00:00', 'Z'),
     '{{from7d}}': (_now - datetime.timedelta(days=7)).isoformat().replace('+00:00', 'Z')}
# slotCode + catalogBpmnProcessId lay tu chinh app

pds = search('/v2/process-definitions/search', '{"filter":{"isLatestVersion":true}}')
if pds:
    V['{{processDefinitionKey}}'] = str(pds[0]['processDefinitionKey'])
    V['{{bpmnProcessId}}'] = pds[0]['processDefinitionId']
pis = search('/v2/process-instances/search')
if pis:
    V['{{processInstanceKey}}'] = str(pis[0]['processInstanceKey'])
uts = search('/v2/user-tasks/search', '{"filter":{"state":"CREATED"}}')
if uts:
    V['{{userTaskKey}}'] = str(uts[0]['userTaskKey'])
dds = search('/v2/decision-definitions/search')
if dds:
    V['{{decisionDefinitionKey}}'] = str(dds[0]['decisionDefinitionKey'])
    V['{{decisionDefinitionId}}'] = dds[0]['decisionDefinitionId']
els = search('/v2/element-instances/search')
if els:
    V['{{elementInstanceKey}}'] = str(els[0]['elementInstanceKey'])
inc = search('/v2/incidents/search', '{"filter":{"state":"ACTIVE"}}')
if inc:
    V['{{incidentKey}}'] = str(inc[0]['incidentKey'])
s, t = call('GET', APP + '/api/process-definition-drafts', None, {'X-QTKHCN-Dev-Key': 'dev-local-only'})
if s == 200:
    dr = json.loads(t)
    if dr:
        V['{{draftId}}'] = dr[0]['id']
s, t = call('GET', APP + '/api/process-definitions', None, {'X-QTKHCN-Dev-Key': 'dev-local-only'})
if s == 200:
    cat = json.loads(t)
    if cat:
        V['{{catalogId}}'] = cat[0]['id']
        V['{{catalogBpmnProcessId}}'] = cat[0]['bpmnProcessId']
s, t = call('GET', APP + '/api/approval-matrix/slots', None, {'X-QTKHCN-Dev-Key': 'dev-local-only'})
if s == 200:
    sl = json.loads(t)
    act = [x for x in sl if x.get('trangThai') == 'active'] or sl
    if act:
        V['{{slotCode}}'] = act[0]['code']

print('Bien runtime lay duoc:')
for k, v in sorted(V.items()):
    print('   %-26s = %s' % (k, v))
print()


def sub(text):
    for k, v in V.items():
        text = text.replace(k, v)
    return text


rows = []


def walk(items, path=''):
    for it in items:
        if 'item' in it:
            walk(it['item'], path + it['name'] + ' / ')
            continue
        name = it['name']
        r = it['request']
        if '⚠️' in name:
            rows.append(('SKIP', '-', path + name, 'ghi du lieu, khong ban'))
            continue
        url = sub(r['url']['raw'])
        if '{{' in url:
            rows.append(('SKIP', '-', path + name, 'thieu bien runtime: ' + url))
            continue
        body = None
        if r.get('body', {}).get('mode') == 'raw':
            body = sub(r['body']['raw'])
        elif r.get('body', {}).get('mode') == 'formdata':
            rows.append(('SKIP', '-', path + name, 'multipart, khong ban'))
            continue
        headers = {h['key']: sub(h['value']) for h in r.get('header', [])}
        if url.startswith(APP):
            headers['X-QTKHCN-Dev-Key'] = 'dev-local-only'
        st, txt = call(r['method'], url, body, headers)
        # 404 hop le co chu dich: /me chua bat OIDC; correlate khong co subscription cho san
        expected404 = 'authentication/me' in url or 'messages/correlation' in url
        ok = 200 <= st < 300 or (st in (401, 403, 404) and expected404)
        rows.append(('OK' if ok else 'FAIL', st, path + name,
                     '' if ok else txt.replace('\n', ' ')[:170]))


walk(COL['item'])

bad = [r for r in rows if r[0] == 'FAIL']
print('%d ban | %d OK | %d FAIL | %d skip' % (
    len(rows), sum(1 for r in rows if r[0] == 'OK'), len(bad),
    sum(1 for r in rows if r[0] == 'SKIP')))
if bad:
    print('\n=== FAIL ===')
    for _, st, name, msg in bad:
        print('  [%s] %s\n        %s' % (st, name, msg))
else:
    print('\nKhong con request nao hong.')
