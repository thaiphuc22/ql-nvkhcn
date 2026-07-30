"""Sinh Camunda.postman_collection.json từ OpenAPI spec sống của engine.

Mọi method/path đều được đối chiếu với spec tải từ http://localhost:8080/v3/api-docs
=> không có endpoint nào là bịa. Script FAIL NGAY nếu một path không tồn tại trong spec.
"""
import json
import os
import sys

SPEC = json.load(open(
    r'C:/Users/phuctd7/AppData/Local/Temp/claude/c--Users-phuctd7-ql-nvkhcn/cf6f9630-6387-42cc-8c89-5bea6dbc411f/scratchpad/camunda-openapi.json',
    encoding='utf-8'))
OUT = r'c:/Users/phuctd7/ql-nvkhcn/docs/postman/Camunda.postman_collection.json'
REPO = 'c:/Users/phuctd7/ql-nvkhcn'

errors = []


def spec_summary(method, path):
    """Lấy summary từ spec; báo lỗi nếu endpoint không tồn tại."""
    op = SPEC['paths'].get(path, {}).get(method.lower())
    if op is None:
        errors.append('%s %s KHONG CO trong spec' % (method, path))
        return ''
    return op.get('summary') or ''


def url_obj(raw):
    without_query, _, qs = raw.partition('?')
    base, _, rest = without_query.partition('}}/')
    host = base + '}}'
    path = [p for p in rest.split('/') if p != '']
    obj = {'raw': raw, 'host': [host], 'path': path}
    if qs:
        obj['query'] = [{'key': k, 'value': v} for k, _, v in
                        (p.partition('=') for p in qs.split('&'))]
    return obj


def raw(token):
    """Biến Postman ở vị trí SỐ, phải phát ra KHÔNG có dấu nháy.

    `"limit": "{{maxScan}}"` khiến Postman thay biến bên trong chuỗi ⇒ engine nhận `"500"`
    và trả 400 `Request property [page.limit] cannot be parsed`. Phải là `"limit": {{maxScan}}`.
    """
    return '@@RAW@@' + token + '@@RAW@@'


def dump_body(body):
    s = json.dumps(body, ensure_ascii=False, indent=2)
    return s.replace('"@@RAW@@', '').replace('@@RAW@@"', '')


def req(name, method, raw_url, body=None, tests=None, desc='', headers=None,
        formdata=None, verify=None):
    """verify = (method, path) để đối chiếu với spec Camunda; None = API của app."""
    if verify:
        s = spec_summary(*verify)
        desc = (('**Camunda:** %s\n\n' % s) if s else '') + desc
    r = {'method': method, 'header': list(headers or []), 'url': url_obj(raw_url),
         'description': desc}
    if formdata is not None:
        r['body'] = {'mode': 'formdata', 'formdata': formdata}
    elif body is not None:
        r['header'].append({'key': 'Content-Type', 'value': 'application/json'})
        r['body'] = {'mode': 'raw', 'raw': dump_body(body),
                     'options': {'raw': {'language': 'json'}}}
    item = {'name': name, 'request': r, 'response': []}
    if tests:
        item['event'] = [{'listen': 'test',
                          'script': {'type': 'text/javascript', 'exec': tests}}]
    return item


OK = "pm.test('2xx', () => pm.expect(pm.response.code).to.be.within(200, 299));"


def folder(name, desc, items):
    return {'name': name, 'description': desc, 'item': items}


# ---------------------------------------------------------------- 00 sức khoẻ
health = folder(
    '00 · Sức khoẻ engine — chạy đầu tiên',
    'Bốn request này trả lời "engine có sống không, tôi là ai" trước khi debug bất cứ thứ gì khác. '
    'Nếu request đầu tiên đã đỏ thì mọi thứ phía dưới vô nghĩa — kiểm tra `docker ps` trước.',
    [
        req('Topology — engine sống chưa?', 'GET', '{{camundaBase}}/v2/topology',
            verify=('GET', '/v2/topology'),
            desc='Chạy request này TRƯỚC TIÊN. Đỏ = engine chưa lên, đừng debug tiếp.',
            tests=[OK,
                   "const t = pm.response.json();",
                   "console.log('Cluster size:', t.clusterSize, '| Gateway:', t.gatewayVersion);",
                   "pm.test('Có ít nhất 1 broker', () => pm.expect(t.brokers).to.have.length.above(0));"]),
        req('Status', 'GET', '{{camundaBase}}/v2/status', verify=('GET', '/v2/status'),
            tests=[OK]),
        req('Tôi là ai (authentication/me) — 401 là ĐÚNG ở dev', 'GET',
            '{{camundaBase}}/v2/authentication/me',
            verify=('GET', '/v2/authentication/me'),
            desc='## 401 ở đây KHÔNG phải lỗi, đừng "sửa" bằng cách gắn Bearer token.\n\n'
                 'Engine dev chạy chế độ **API không bảo vệ** — mọi endpoint `/v2` khác đều `200` '
                 'mà không cần header nào. Kiểm chứng 2026-07-28:\n\n'
                 '| Thử | Kết quả |\n'
                 '|---|---|\n'
                 '| `/v2/topology`, `/v2/license`, `.../search` không header | `200` |\n'
                 '| endpoint này, không header | `401` |\n'
                 '| endpoint này + `Bearer` rỗng / `Bearer abc123` / basic `demo:demo` | `401` cả ba |\n\n'
                 'Đây là endpoint DUY NHẤT bắt buộc có principal — nó trả lời "tôi là ai". Chưa cắm '
                 'identity provider thì không có "ai" để trả. Gắn token vào không đổi được gì vì '
                 'không có nơi nào cấp token.\n\n'
                 '**Khi nào request này mới `200`:** sau khi bật authentication trên engine '
                 '(`docker-compose-full.yaml` với Keycloak/Identity). Đó là việc hạ tầng, phụ thuộc '
                 'quyết định OQ-021 (SSO/IAM) còn đang mở — không phải việc cấu hình trong Postman.',
            tests=["const c = pm.response.code;",
                   "console.log('Status', c, pm.response.text().slice(0, 300));",
                   "pm.test('401 khi chưa bật OIDC = ĐÚNG; 200 = engine đã bật auth', function () {",
                   "    pm.expect([200, 401, 403], 'mã lạ ⇒ engine đổi cấu hình').to.include(c);",
                   "});",
                   "if (c === 200) console.log('→ Engine ĐÃ bật authentication. Điền biến {{bearer}} cho các request khác.');",
                   "else console.log('→ Engine chưa bật authentication — đúng như mong đợi ở dev. Không cần sửa gì.');"]),
        req('License', 'GET', '{{camundaBase}}/v2/license', verify=('GET', '/v2/license'),
            tests=[OK]),
    ])

# ------------------------------------------------- 01 process definitions
procdef = folder(
    '01 · Process definitions — lõi của use case "Đồng bộ"',
    'Hai request đầu chính là hai API mà `CamundaProcessDefinitionLookup` gọi. '
    'Request 1 tự lưu `processDefinitionKey` + `bpmnProcessId` cho mọi request sau — chạy nó trước.',
    [
        req('① Search — bản mới nhất của mọi quy trình', 'POST',
            '{{camundaBase}}/v2/process-definitions/search',
            verify=('POST', '/v2/process-definitions/search'),
            body={'filter': {'isLatestVersion': True}, 'page': {'limit': raw('{{maxScan}}')}},
            desc='= `lookup.listLatest(MAX_SCAN)`.\n\n`limit` khớp `MAX_SCAN` trong '
                 '`DeployedProcessImportService`. Filter hợp lệ khác: processDefinitionId, '
                 'processDefinitionKey, name, resourceName, version, versionTag, tenantId, hasStartForm.',
            tests=[OK,
                   "const b = pm.response.json(), items = b.items || [], page = b.page || {};",
                   "console.log('Engine có', page.totalItems, 'quy trình | lấy về', items.length);",
                   "items.forEach(i => console.log('  -', i.processDefinitionId, 'v' + i.version, i.processDefinitionKey));",
                   "if (items.length) {",
                   "    pm.collectionVariables.set('processDefinitionKey', items[0].processDefinitionKey);",
                   "    pm.collectionVariables.set('bpmnProcessId', items[0].processDefinitionId);",
                   "    console.log('→ đã lưu processDefinitionKey =', items[0].processDefinitionKey);",
                   "}",
                   "pm.test('Lượt quét không bị cắt theo MAX_SCAN', () =>",
                   "    pm.expect(page.totalItems, 'lớn hơn số lấy về ⇒ app trả warnings[]').to.be.at.most(items.length));",
                   "pm.test('Search KHÔNG trả deploymentKey (lý do writer ghi 0)', () =>",
                   "    items.length && pm.expect(items[0]).to.not.have.property('deploymentKey'));"]),
        req('② Get XML', 'GET',
            '{{camundaBase}}/v2/process-definitions/{{processDefinitionKey}}/xml',
            verify=('GET', '/v2/process-definitions/{processDefinitionKey}/xml'),
            headers=[{'key': 'Accept', 'value': 'text/xml'}],
            desc='= `lookup.fetchXml(key)`. Trả BPMN XML thô, KHÔNG bọc JSON.\n\n'
                 'Tham số là khoá số, không phải bpmnProcessId. Thiếu XML ⇒ quy trình vào catalog '
                 'nhưng `DeployedBpmnRoutingReader` không dựng được bước nào.',
            tests=[OK,
                   "pm.test('Là BPMN XML', () => pm.expect(pm.response.text()).to.include('<bpmn:definitions'));",
                   "const n = (pm.response.text().match(/<bpmn:userTask/g) || []).length;",
                   "console.log('Số userTask trong BPMN:', n);"]),
        req('Get process definition (metadata)', 'GET',
            '{{camundaBase}}/v2/process-definitions/{{processDefinitionKey}}',
            verify=('GET', '/v2/process-definitions/{processDefinitionKey}'), tests=[OK]),
        req('Get start form', 'GET',
            '{{camundaBase}}/v2/process-definitions/{{processDefinitionKey}}/form',
            verify=('GET', '/v2/process-definitions/{processDefinitionKey}/form'),
            desc='404 nếu process không gắn start form — bình thường với quy trình RD.',
            tests=["console.log('Status', pm.response.code);"]),
        req('Search theo bpmnProcessId cụ thể', 'POST',
            '{{camundaBase}}/v2/process-definitions/search',
            verify=('POST', '/v2/process-definitions/search'),
            body={'filter': {'processDefinitionId': '{{bpmnProcessId}}'},
                  'sort': [{'field': 'version', 'order': 'DESC'}]},
            desc='Xem TẤT CẢ version của một quy trình — dùng khi nghi ngờ deploy ra version mới '
                 'mà app vẫn dùng bản cũ.',
            tests=[OK,
                   "const it = pm.response.json().items || [];",
                   "console.log('Các version của', pm.collectionVariables.get('bpmnProcessId') + ':', it.map(i => 'v' + i.version).join(', '));"]),
        req('Thống kê element instances', 'POST',
            '{{camundaBase}}/v2/process-definitions/{{processDefinitionKey}}/statistics/element-instances',
            verify=('POST', '/v2/process-definitions/{processDefinitionKey}/statistics/element-instances'),
            body={'filter': {}},
            desc='Bao nhiêu instance đang đứng ở mỗi element — bản đồ nhiệt của quy trình.',
            tests=[OK]),
    ])

# ---------------------------------------------------------------- 02 deploy
deploy = folder(
    '02 · Deploy BPMN/DMN — tạo dữ liệu để test đồng bộ',
    '**Đây là cách tạo tình huống "quy trình vẽ ngoài app"** — deploy thẳng lên engine, không qua '
    'QTKHCN. Sau khi deploy ở đây, chạy `POST /api/process-definitions/sync-from-camunda` ở folder '
    '09 mới thấy `imported > 0`. Không có bước này thì đồng bộ luôn trả `imported = 0` và bạn '
    'tưởng tính năng hỏng.',
    [
        req('⚠️ Deploy BPMN (multipart)', 'POST', '{{camundaBase}}/v2/deployments',
            verify=('POST', '/v2/deployments'),
            formdata=[{'key': 'resources', 'type': 'file',
                       'src': REPO + '/backend/src/main/resources/processes/rd0101.bpmn',
                       'description': 'Đổi sang file .bpmn bất kỳ. Có thể thêm nhiều dòng resources.'}],
            desc='**GHI DỮ LIỆU LÊN ENGINE.** Field name bắt buộc là `resources` (type = File).\n\n'
                 'Deploy lại cùng file không đổi ⇒ engine giữ nguyên version. Sửa 1 ký tự ⇒ version mới.\n\n'
                 'Mẹo tạo quy trình HOÀN TOÀN mới để test `newCatalog = true`: copy file .bpmn, đổi '
                 '`<bpmn:process id="...">` thành id chưa từng có, rồi deploy.',
            tests=[OK,
                   "const d = pm.response.json();",
                   "console.log('deploymentKey =', d.deploymentKey);",
                   "(d.deployments || []).forEach(x => {",
                   "    const p = x.processDefinition;",
                   "    if (p) { console.log('  deploy:', p.processDefinitionId, 'v' + p.version, p.processDefinitionKey);",
                   "             pm.collectionVariables.set('processDefinitionKey', p.processDefinitionKey);",
                   "             pm.collectionVariables.set('bpmnProcessId', p.processDefinitionId); }",
                   "});"]),
        req('⚠️ Deploy DMN (multipart)', 'POST', '{{camundaBase}}/v2/deployments',
            verify=('POST', '/v2/deployments'),
            formdata=[{'key': 'resources', 'type': 'file',
                       'src': REPO + '/backend/src/main/resources/processes/rd0202-routing.dmn'}],
            desc='Cùng endpoint với BPMN — Camunda phân loại theo đuôi file.',
            tests=[OK, "console.log(pm.response.text().slice(0, 500));"]),
        req('⚠️⚠️ XOÁ resource đã deploy', 'POST',
            '{{camundaBase}}/v2/resources/{{resourceKey}}/deletion',
            verify=('POST', '/v2/resources/{resourceKey}/deletion'),
            desc='## Request PHÁ DỮ LIỆU mạnh nhất trong collection.\n\n'
                 'Xoá hẳn resource khỏi engine **và mọi process instance đang chạy của nó**. Không '
                 'hoàn tác được.\n\nDùng `{{resourceKey}}` — biến RIÊNG, cố ý **không** nối vào '
                 '`{{processDefinitionKey}}` để một cú bấm nhầm không xoá đúng quy trình mà các folder '
                 'khác vừa lấy về. Phải tự điền key muốn xoá.\n\n'
                 '404 `no resource found` = key không tồn tại → **không xoá gì cả**, an toàn.',
            tests=["console.log('Status', pm.response.code, pm.response.text().slice(0, 200));"]),
    ])

# ------------------------------------------------------- 03 process instances
instances = folder(
    '03 · Process instances — chạy thử một hồ sơ',
    'Khởi tạo và theo dõi instance. Biến control của dự án (`maHoSo`, `cap`…) đặt ở `variables` — '
    'nhớ nguyên tắc D3: Camunda chỉ giữ biến điều phối, KHÔNG giữ dữ liệu nghiệp vụ.',
    [
        req('① Start instance', 'POST', '{{camundaBase}}/v2/process-instances',
            verify=('POST', '/v2/process-instances'),
            body={'processDefinitionId': '{{bpmnProcessId}}', 'variables': {
                'maHoSo': 'HS-POSTMAN-001', 'cap': 'CAP_VIEN'}},
            desc='Dùng `processDefinitionId` (= bpmnProcessId) để engine tự lấy bản mới nhất, '
                 'hoặc `processDefinitionKey` để ghim đúng một version.',
            tests=[OK,
                   "const r = pm.response.json();",
                   "pm.collectionVariables.set('processInstanceKey', r.processInstanceKey);",
                   "console.log('→ processInstanceKey =', r.processInstanceKey);"]),
        req('② Search instances đang chạy', 'POST',
            '{{camundaBase}}/v2/process-instances/search',
            verify=('POST', '/v2/process-instances/search'),
            body={'filter': {'state': 'ACTIVE'}, 'page': {'limit': 50}},
            tests=[OK,
                   "const it = pm.response.json().items || [];",
                   "console.log('Instance ACTIVE:', it.length);",
                   "it.slice(0, 10).forEach(i => console.log('  -', i.processDefinitionId, i.processInstanceKey));"]),
        req('Get instance', 'GET', '{{camundaBase}}/v2/process-instances/{{processInstanceKey}}',
            verify=('GET', '/v2/process-instances/{processInstanceKey}'), tests=[OK]),
        req('Sequence flows đã đi qua', 'GET',
            '{{camundaBase}}/v2/process-instances/{{processInstanceKey}}/sequence-flows',
            verify=('GET', '/v2/process-instances/{processInstanceKey}/sequence-flows'),
            desc='Instance đã rẽ nhánh nào — dùng khi routing không như mong đợi.', tests=[OK]),
        req('Element instances của instance', 'GET',
            '{{camundaBase}}/v2/process-instances/{{processInstanceKey}}/statistics/element-instances',
            verify=('GET', '/v2/process-instances/{processInstanceKey}/statistics/element-instances'),
            desc='Instance đang ĐỨNG Ở ĐÂU.', tests=[OK]),
        req('Call hierarchy', 'GET',
            '{{camundaBase}}/v2/process-instances/{{processInstanceKey}}/call-hierarchy',
            verify=('GET', '/v2/process-instances/{processInstanceKey}/call-hierarchy'),
            desc='Cây parent/child khi có call activity.', tests=[OK]),
        req('Incidents của instance', 'POST',
            '{{camundaBase}}/v2/process-instances/{{processInstanceKey}}/incidents/search',
            verify=('POST', '/v2/process-instances/{processInstanceKey}/incidents/search'),
            body={}, tests=[OK]),
        req('⚠️ Cancel instance', 'POST',
            '{{camundaBase}}/v2/process-instances/{{processInstanceKey}}/cancellation',
            verify=('POST', '/v2/process-instances/{processInstanceKey}/cancellation'),
            body={}, desc='**Huỷ vĩnh viễn.** Dọn instance rác sau khi test.',
            tests=["console.log('Status', pm.response.code);"]),
    ])

# ------------------------------------------------------------- 04 user tasks
tasks = folder(
    '04 · User tasks — bước phê duyệt',
    'Bước người dùng bấm nút. QTKHCN không dùng Tasklist mặc định mà render form riêng, nên các API '
    'này là thứ backend gọi qua `CamundaWorkflowTaskRuntime`.',
    [
        req('① Search task đang chờ', 'POST', '{{camundaBase}}/v2/user-tasks/search',
            verify=('POST', '/v2/user-tasks/search'),
            body={'filter': {'state': 'CREATED'}, 'page': {'limit': 50}},
            desc='Lọc thêm: `candidateGroup` (= mã vai trò trong roles.ts), `assignee`, '
                 '`processInstanceKey`, `elementId`.',
            tests=[OK,
                   "const it = pm.response.json().items || [];",
                   "console.log('Task đang chờ:', it.length);",
                   "it.slice(0, 10).forEach(t => console.log('  -', t.elementId, '| key', t.userTaskKey, '| assignee', t.assignee));",
                   "if (it.length) { pm.collectionVariables.set('userTaskKey', it[0].userTaskKey);",
                   "                 console.log('→ userTaskKey =', it[0].userTaskKey); }"]),
        req('Task theo instance vừa tạo', 'POST', '{{camundaBase}}/v2/user-tasks/search',
            verify=('POST', '/v2/user-tasks/search'),
            body={'filter': {'processInstanceKey': '{{processInstanceKey}}', 'state': 'CREATED'}},
            tests=[OK,
                   "const it = pm.response.json().items || [];",
                   "if (it.length) pm.collectionVariables.set('userTaskKey', it[0].userTaskKey);",
                   "console.log('Task của instance:', it.map(t => t.elementId).join(', '));"]),
        req('Get task', 'GET', '{{camundaBase}}/v2/user-tasks/{{userTaskKey}}',
            verify=('GET', '/v2/user-tasks/{userTaskKey}'), tests=[OK]),
        req('Form của task', 'GET', '{{camundaBase}}/v2/user-tasks/{{userTaskKey}}/form',
            verify=('GET', '/v2/user-tasks/{userTaskKey}/form'),
            desc='Trả Camunda Form gắn qua `formKey`. Liên quan trực tiếp tới bug binding eForm — '
                 'so cái này với form mà Action Studio nghĩ là đang gắn.',
            tests=["console.log('Status', pm.response.code, pm.response.text().slice(0, 400));"]),
        req('Biến nhìn thấy ở task', 'POST',
            '{{camundaBase}}/v2/user-tasks/{{userTaskKey}}/variables/search',
            verify=('POST', '/v2/user-tasks/{userTaskKey}/variables/search'), body={},
            tests=[OK, "console.log(JSON.stringify(pm.response.json().items, null, 2));"]),
        req('Nhận việc (assign)', 'POST',
            '{{camundaBase}}/v2/user-tasks/{{userTaskKey}}/assignment',
            verify=('POST', '/v2/user-tasks/{userTaskKey}/assignment'),
            body={'assignee': 'demo', 'allowOverride': True},
            tests=["console.log('Status', pm.response.code);"]),
        req('Trả việc (unassign)', 'DELETE',
            '{{camundaBase}}/v2/user-tasks/{{userTaskKey}}/assignee',
            verify=('DELETE', '/v2/user-tasks/{userTaskKey}/assignee'),
            tests=["console.log('Status', pm.response.code);"]),
        req('⚠️ Hoàn thành task', 'POST',
            '{{camundaBase}}/v2/user-tasks/{{userTaskKey}}/completion',
            verify=('POST', '/v2/user-tasks/{userTaskKey}/completion'),
            body={'variables': {'ketQua': 'DONG_Y'}},
            desc='**Đẩy instance sang bước sau.** Biến trong `variables` là biến điều phối quyết '
                 'định routing — tên phải khớp expression trên sequence flow của BPMN.',
            tests=["console.log('Status', pm.response.code, pm.response.text().slice(0, 300));"]),
        req('Lịch sử thao tác của task', 'POST',
            '{{camundaBase}}/v2/user-tasks/{{userTaskKey}}/audit-logs/search',
            verify=('POST', '/v2/user-tasks/{userTaskKey}/audit-logs/search'), body={},
            tests=[OK]),
    ])

# ------------------------------------------------------------------- 05 DMN
dmn = folder(
    '05 · DMN — bảng quyết định',
    'Dự án nối nhiều bảng DMN thành chuỗi (xem `DmnCamundaGateway`). Evaluate trực tiếp ở đây để '
    'tách bạch "bảng sai" với "app truyền input sai".',
    [
        req('① Search decision definitions', 'POST',
            '{{camundaBase}}/v2/decision-definitions/search',
            verify=('POST', '/v2/decision-definitions/search'),
            body={'filter': {}, 'page': {'limit': 50}},
            tests=[OK,
                   "const it = pm.response.json().items || [];",
                   "it.forEach(d => console.log('  -', d.decisionDefinitionId, 'v' + d.version, d.decisionDefinitionKey));",
                   "if (it.length) { pm.collectionVariables.set('decisionDefinitionKey', it[0].decisionDefinitionKey);",
                   "                 pm.collectionVariables.set('decisionDefinitionId', it[0].decisionDefinitionId); }"]),
        req('② Evaluate decision', 'POST',
            '{{camundaBase}}/v2/decision-definitions/evaluation',
            verify=('POST', '/v2/decision-definitions/evaluation'),
            body={'decisionDefinitionId': '{{decisionDefinitionId}}',
                  'variables': {'cap': 'CAP_VIEN', 'giaTri': 500000000}},
            desc='Sửa `variables` cho khớp input column của bảng. Output rỗng thường là do thiếu '
                 'đúng một input chứ không phải bảng hỏng.',
            tests=[OK,
                   "const r = pm.response.json();",
                   "console.log('output =', JSON.stringify(r.output));",
                   "(r.evaluatedDecisions || []).forEach(d => console.log('  bảng', d.decisionDefinitionId, '→', JSON.stringify(d.output)));"]),
        req('DMN XML', 'GET',
            '{{camundaBase}}/v2/decision-definitions/{{decisionDefinitionKey}}/xml',
            verify=('GET', '/v2/decision-definitions/{decisionDefinitionKey}/xml'), tests=[OK]),
        req('Lịch sử evaluate', 'POST', '{{camundaBase}}/v2/decision-instances/search',
            verify=('POST', '/v2/decision-instances/search'),
            body={'filter': {}, 'page': {'limit': 20}},
            desc='Bảng đã chạy thật ra kết quả gì trong các instance trước.', tests=[OK]),
    ])

# --------------------------------------------------------- 06 incidents/jobs
diag = folder(
    '06 · Chẩn đoán — incidents & jobs',
    'Mở folder này khi hồ sơ "đứng im không rõ lý do". Gần như luôn là incident hoặc job không có worker.',
    [
        req('① Incidents đang mở', 'POST', '{{camundaBase}}/v2/incidents/search',
            verify=('POST', '/v2/incidents/search'),
            body={'filter': {'state': 'ACTIVE'}, 'page': {'limit': 50}},
            desc='**Nơi đầu tiên cần nhìn khi hồ sơ đứng im.**',
            tests=[OK,
                   "const it = pm.response.json().items || [];",
                   "console.log('Incident ACTIVE:', it.length);",
                   "it.forEach(i => console.log('  -', i.errorType, '|', i.errorMessage, '| instance', i.processInstanceKey));",
                   "if (it.length) pm.collectionVariables.set('incidentKey', it[0].incidentKey);",
                   "pm.test('Không có incident nào đang mở', () => pm.expect(it).to.be.empty);"]),
        req('Resolve incident', 'POST',
            '{{camundaBase}}/v2/incidents/{{incidentKey}}/resolution',
            verify=('POST', '/v2/incidents/{incidentKey}/resolution'),
            desc='Chỉ resolve SAU KHI đã sửa nguyên nhân (biến sai, worker chưa chạy) — '
                 'không thì incident quay lại ngay.',
            tests=["console.log('Status', pm.response.code);"]),
        req('② Jobs đang chờ worker', 'POST', '{{camundaBase}}/v2/jobs/search',
            verify=('POST', '/v2/jobs/search'),
            body={'filter': {'state': 'CREATED'}, 'page': {'limit': 50}},
            desc='Job `CREATED` tồn đọng lâu = **không có worker nào đăng ký `type` đó**. '
                 'So `type` ở đây với `@JobWorker(type=...)` trong backend.',
            tests=[OK,
                   "const it = pm.response.json().items || [];",
                   "const byType = {};",
                   "it.forEach(j => byType[j.type] = (byType[j.type] || 0) + 1);",
                   "console.log('Job chờ theo type:', JSON.stringify(byType, null, 2));"]),
        req('Thống kê job theo type', 'POST', '{{camundaBase}}/v2/jobs/statistics/by-types',
            verify=('POST', '/v2/jobs/statistics/by-types'),
            body={'filter': {'from': '{{from7d}}', 'to': '{{nowIso}}'}},
            desc='`filter.from` và `filter.to` **bắt buộc** (dù OpenAPI không đánh dấu required) — '
                 'thiếu là 400 `No filter provided`. Hai biến thời gian do pre-request script của '
                 'collection tự sinh, không phải điền tay.',
            tests=[OK]),
        req('Thống kê job toàn cục', 'GET',
            '{{camundaBase}}/v2/jobs/statistics/global?from={{from7d}}&to={{nowIso}}',
            verify=('GET', '/v2/jobs/statistics/global'),
            desc='`from` và `to` là **query param bắt buộc** (ISO date-time) — thiếu là 400 '
                 "`Required parameter 'from' is not present`.",
            tests=[OK]),
        req('Job lỗi', 'POST', '{{camundaBase}}/v2/jobs/statistics/errors',
            verify=('POST', '/v2/jobs/statistics/errors'),
            body={'filter': {'from': '{{from7d}}', 'to': '{{nowIso}}',
                             'jobType': 'io.camunda.zeebe:userTask'}},
            desc='Khác hai request trên: `jobType` cũng **bắt buộc**. Đổi sang job type cần soi.',
            tests=[OK]),
        req('⚠️ Activate job thủ công', 'POST', '{{camundaBase}}/v2/jobs/activation',
            verify=('POST', '/v2/jobs/activation'),
            body={'type': 'io.camunda.zeebe:userTask', 'maxJobsToActivate': 1, 'timeout': 10000},
            desc='**Cướp job khỏi worker thật.** Đổi `type` thành job type cần soi. Dùng để xem '
                 'payload engine đang đưa cho worker.',
            tests=[OK, "console.log(JSON.stringify(pm.response.json(), null, 2).slice(0, 1500));"]),
        req('Complete job thủ công', 'POST', '{{camundaBase}}/v2/jobs/{{jobKey}}/completion',
            verify=('POST', '/v2/jobs/{jobKey}/completion'), body={'variables': {}},
            desc='Gỡ kẹt khi worker chưa viết xong. Đặt `{{jobKey}}` từ kết quả activation.',
            tests=["console.log('Status', pm.response.code);"]),
    ])

# ------------------------------------------------------------- 07 variables
variables = folder(
    '07 · Biến & element instances',
    'Kiểm chứng nguyên tắc D3: Camunda **chỉ** giữ biến điều phối (`maHoSo`, `cap`…). Thấy dữ liệu '
    'nghiệp vụ ở đây là vi phạm kiến trúc, không phải tính năng.',
    [
        req('Search biến', 'POST', '{{camundaBase}}/v2/variables/search',
            verify=('POST', '/v2/variables/search'),
            body={'filter': {'processInstanceKey': '{{processInstanceKey}}'}, 'page': {'limit': 100}},
            tests=[OK,
                   "const it = pm.response.json().items || [];",
                   "it.forEach(v => console.log('  -', v.name, '=', String(v.value).slice(0, 120)));",
                   "pm.test('Không có biến nào chứa dữ liệu nghiệp vụ nặng (D3)', function () {",
                   "    const big = it.filter(v => String(v.value || '').length > 500);",
                   "    pm.expect(big.map(v => v.name), 'biến quá lớn ⇒ nghi ngờ nhồi business data').to.be.empty;",
                   "});"]),
        req('Element instances', 'POST', '{{camundaBase}}/v2/element-instances/search',
            verify=('POST', '/v2/element-instances/search'),
            body={'filter': {'processInstanceKey': '{{processInstanceKey}}'}, 'page': {'limit': 100}},
            tests=[OK,
                   "const it = pm.response.json().items || [];",
                   "it.forEach(e => console.log('  -', e.elementId, '|', e.type, '|', e.state));",
                   "if (it.length) pm.collectionVariables.set('elementInstanceKey', it[0].elementInstanceKey);"]),
        req('⚠️ Set biến trên element instance', 'PUT',
            '{{camundaBase}}/v2/element-instances/{{elementInstanceKey}}/variables',
            verify=('PUT', '/v2/element-instances/{elementInstanceKey}/variables'),
            body={'variables': {'cap': 'CAP_TAP_DOAN'}, 'local': False},
            desc='**Sửa biến của instance đang chạy.** Cách nhanh nhất để test nhánh routing mà '
                 'không phải chạy lại cả quy trình.',
            tests=["console.log('Status', pm.response.code);"]),
        req('Evaluate FEEL expression', 'POST', '{{camundaBase}}/v2/expression/evaluation',
            verify=('POST', '/v2/expression/evaluation'),
            body={'expression': '= cap = "CAP_VIEN"', 'variables': {'cap': 'CAP_VIEN'}},
            desc='Thử expression trên sequence flow TRƯỚC khi sửa BPMN. Sai cú pháp FEEL là '
                 'nguyên nhân routing hỏng phổ biến nhất.',
            tests=[OK, "console.log('Kết quả:', JSON.stringify(pm.response.json()));"]),
    ])

# ------------------------------------------------------ 08 message & signal
msg = folder(
    '08 · Message & signal',
    'Đánh thức instance đang chờ message/signal catch event.',
    [
        req('Publish message', 'POST', '{{camundaBase}}/v2/messages/publication',
            verify=('POST', '/v2/messages/publication'),
            body={'name': 'ten-message', 'correlationKey': '{{bpmnProcessId}}',
                  'timeToLive': 60000, 'variables': {}},
            desc='`correlationKey` phải khớp expression correlation trong BPMN.',
            tests=["console.log('Status', pm.response.code, pm.response.text().slice(0, 300));"]),
        req('Correlate message (chờ kết quả)', 'POST',
            '{{camundaBase}}/v2/messages/correlation',
            verify=('POST', '/v2/messages/correlation'),
            body={'name': 'ten-message', 'correlationKey': '{{bpmnProcessId}}', 'variables': {}},
            desc='Khác `publication`: đợi và trả về instance nào đã nhận.\n\n**404 `Expected to '
                 'find subscription` là câu trả lời HỢP LỆ** — không instance nào đang chờ message tên '
                 'đó. Chạy `Message subscriptions đang chờ` trước để lấy đúng tên thay cho `ten-message`.',
            tests=["console.log('Status', pm.response.code, pm.response.text().slice(0, 300));"]),
        req('Broadcast signal', 'POST', '{{camundaBase}}/v2/signals/broadcast',
            verify=('POST', '/v2/signals/broadcast'),
            body={'signalName': 'ten-signal', 'variables': {}},
            tests=["console.log('Status', pm.response.code);"]),
        req('Message subscriptions đang chờ', 'POST',
            '{{camundaBase}}/v2/message-subscriptions/search',
            verify=('POST', '/v2/message-subscriptions/search'), body={},
            desc='Instance đang chờ message NÀO — kiểm tra trước khi publish để khỏi bắn sai tên.',
            tests=[OK,
                   "const it = pm.response.json().items || [];",
                   "it.forEach(s => console.log('  - chờ message:', s.messageName, '| key', s.correlationKey));"]),
    ])

# --------------------------------------------------------- 09 QTKHCN backend
def app(name, method, path, body=None, tests=None, desc='', formdata=None, headers=None):
    return req(name, method, '{{appBase}}' + path, body=body, tests=tests, desc=desc,
               formdata=formdata, headers=headers)


app_sync = folder(
    'A · Quy trình & Đồng bộ',
    'Use case chính. Chạy 1 → 2 → 3 → 4 theo thứ tự.',
    [
        app('① Catalog TRƯỚC đồng bộ', 'GET', '/api/process-definitions',
            desc='Baseline. Thiếu header dev key ⇒ 401 (DevApiKeyFilter) — collection tự chèn.',
            tests=[OK,
                   "const b = pm.response.json();",
                   "pm.collectionVariables.set('catalogCountBefore', b.length);",
                   "console.log('Catalog trước:', b.length, 'quy trình');",
                   "if (b.length) { pm.collectionVariables.set('catalogBpmnProcessId', b[0].bpmnProcessId);",
                   "                pm.collectionVariables.set('catalogId', b[0].id); }"]),
        app('② ⚠️ ĐỒNG BỘ TỪ CAMUNDA (ghi dữ liệu)', 'POST',
            '/api/process-definitions/sync-from-camunda',
            headers=[{'key': 'X-QTKHCN-Actor', 'value': '{{actor}}',
                      'description': "RFC 5987: UTF-8''<percent-encoded>. Bỏ trống ⇒ importedBy = 'dev-api-key'."}],
            desc='**Request trung tâm.** Body rỗng.\n\n'
                 'Chạy lần 2 phải cho `imported = 0` — idempotency theo `camundaProcessDefinitionKey`.\n\n'
                 'Lỗi TỪNG quy trình nằm trong `failures[]` mà HTTP vẫn 200. Chỉ khi bước QUÉT engine '
                 'hỏng mới trả HTTP lỗi.',
            tests=[OK,
                   "const r = pm.response.json();",
                   "console.log('scanned      =', r.scanned);",
                   "console.log('imported     =', r.imported);",
                   "console.log('alreadyKnown =', r.alreadyKnown);",
                   "console.log('failures     =', JSON.stringify(r.failures));",
                   "console.log('warnings     =', JSON.stringify(r.warnings));",
                   "r.importedProcesses.forEach(p => console.log('  + nhập:', p.bpmnProcessId, 'v' + p.version, p.newCatalog ? '(catalog MỚI)' : '(version mới)'));",
                   "pm.test('Đủ 6 trường ProcessSyncResponse', () =>",
                   "    ['scanned','imported','alreadyKnown','importedProcesses','failures','warnings'].forEach(k => pm.expect(r).to.have.property(k)));",
                   "pm.test('scanned = imported + alreadyKnown + failures', () =>",
                   "    pm.expect(r.imported + r.alreadyKnown + r.failures.length).to.eql(r.scanned));",
                   "pm.test('Không quy trình nào nhập lỗi', () =>",
                   "    pm.expect(r.failures, JSON.stringify(r.failures)).to.be.an('array').that.is.empty);",
                   "if (r.importedProcesses.length) pm.collectionVariables.set('importedBpmnProcessId', r.importedProcesses[0].bpmnProcessId);"]),
        app('③ Catalog SAU đồng bộ', 'GET', '/api/process-definitions',
            tests=[OK,
                   "const after = pm.response.json();",
                   "const before = Number(pm.collectionVariables.get('catalogCountBefore'));",
                   "console.log('Catalog sau:', after.length, '(trước:', before + ')');",
                   "pm.test('Catalog không giảm', () => pm.expect(after.length).to.be.at.least(before));",
                   "const id = pm.collectionVariables.get('importedBpmnProcessId');",
                   "if (id) pm.test('Đã có trong catalog: ' + id, () => pm.expect(after.map(p => p.bpmnProcessId)).to.include(id));"]),
        app('④ Chọn được khi gửi duyệt chưa?', 'GET', '/api/process-definitions/selectable',
            desc='**Mục đích cuối của use case.** Hút về mà không chọn được thì coi như chưa xong.',
            tests=[OK,
                   "const l = pm.response.json();",
                   "console.log('Chọn được:', l.map(p => p.bpmnProcessId).join(', '));",
                   "const id = pm.collectionVariables.get('importedBpmnProcessId');",
                   "if (id) pm.test('Chọn được: ' + id, () => pm.expect(l.map(p => p.bpmnProcessId)).to.include(id));"]),
        app('Đối soát một quy trình (readiness)', 'GET',
            '/api/process-definitions/by-bpmn-process-id/{{catalogBpmnProcessId}}/readiness',
            desc='Quy trình nhập về thiếu form / thiếu luật / service task không worker — hiện ở đây. '
                 'Importer CỐ Ý không lint lúc nhập, chẩn đoán dồn về màn này.\n\n'
                 'Dùng `{{catalogBpmnProcessId}}` (lấy từ CATALOG của app) chứ **không** phải '
                 '`{{bpmnProcessId}}` (lấy từ ENGINE) — quy trình có trên engine mà chưa đồng bộ về '
                 'thì endpoint này trả 404, và đó là đúng.\n\n'
                 '## 404 mà body KHÔNG có trường `message`?\n\n'
                 'Đó là 404 của Spring vì **không khớp route**, nghĩa là backend đang chạy JAR CŨ chưa '
                 'có endpoint này — không phải quy trình thiếu dữ liệu. Phân biệt:\n\n'
                 '| Body | Nghĩa |\n'
                 '|---|---|\n'
                 '| `{"message":"Không tìm thấy…"}` | Route có, dữ liệu không có ⇒ lỗi nghiệp vụ thật |\n'
                 '| `{"timestamp":…,"error":"Not Found"}` | Route KHÔNG có ⇒ **JAR cũ, cần build + '
                 'restart backend** |\n\n'
                 'Kiểm nhanh: gọi thử một đường dẫn bịa (`.../khong-ton-tai`). Ra cùng hình dạng body '
                 'thì đúng là JAR cũ.',
            tests=[OK, "console.log(JSON.stringify(pm.response.json(), null, 2).slice(0, 2000));"]),
        app('Chi tiết theo bpmnProcessId', 'GET',
            '/api/process-definitions/by-bpmn-process-id/{{bpmnProcessId}}',
            tests=[OK, "const d = pm.response.json(); pm.collectionVariables.set('catalogId', d.id);"]),
        app('Các version của một quy trình', 'GET', '/api/process-definitions/{{catalogId}}/versions',
            desc='Kiểm `source`: `EXTERNAL` = hút từ Camunda, khác = deploy qua app.',
            tests=[OK,
                   "const v = pm.response.json();",
                   "v.forEach(x => console.log('  - v' + x.camundaVersion, '|', x.source, '|', x.status, '| by', x.importedBy));"]),
        app('Instance đang chạy (toàn bộ)', 'GET', '/api/process-definitions/running-instances',
            tests=[OK]),
        app('Import BPMN qua app (multipart)', 'POST', '/api/process-definitions/import',
            formdata=[{'key': 'file', 'type': 'file',
                       'src': REPO + '/backend/src/main/resources/processes/rd0101.bpmn'}],
            headers=[{'key': 'X-QTKHCN-Actor', 'value': '{{actor}}'}],
            desc='**Đường tạo BPMN thứ hai** (đối trọng với Đồng bộ). Ghi `source` khác `EXTERNAL`. '
                 'Field name là `file`.',
            tests=["console.log('Status', pm.response.code, pm.response.text().slice(0, 600));"]),
    ])

app_studio = folder(
    'B · Action Studio & Task',
    'Luật hiển thị nút. Sau khi đồng bộ, `DeployedProcessPolicyScaffolder` tự sinh luật AFTER_COMMIT '
    '— nhưng kết quả KHÔNG về response đồng bộ, phải xem ở đây.',
    [
        app('Cấu hình Action Studio', 'GET', '/api/action-studio', tests=[OK]),
        app('Đối soát BPMN ↔ luật', 'GET',
            '/api/action-studio/reconcile?processCode={{bpmnProcessId}}',
            desc='Chỗ nhìn ra quy trình vừa hút về đã có luật hành động chưa.\n\n'
                 '`processCode` là **bắt buộc** — thiếu là 400 Bad Request.',
            tests=[OK, "console.log(JSON.stringify(pm.response.json(), null, 2).slice(0, 2000));"]),
        app('Sinh luật còn thiếu từ BPMN', 'POST',
            '/api/action-studio/reconcile/{{bpmnProcessId}}/scaffold',
            headers=[{'key': 'X-QTKHCN-Actor', 'value': '{{actor}}'}],
            desc='Chạy lại thủ công khi scaffold tự động lúc đồng bộ thất bại. Tất định — chạy lại vô hại.',
            tests=[OK, "console.log('createdCount =', pm.response.json().createdCount);"]),
        app('Mô phỏng hành động', 'POST', '/api/action-studio/simulate',
            body={'surface': 'DOSSIER_DETAIL', 'processCode': '{{bpmnProcessId}}',
                  'taskDefinitionKey': 'Activity_XetDuyet', 'dossierStatus': 'processing',
                  'roleCodes': ['CQ_KHCN'], 'permissions': [], 'isAdmin': False},
            desc='**Cả 7 trường đều bắt buộc** (`SimulationRequest`): surface, processCode, '
                 'taskDefinitionKey, dossierStatus, roleCodes[], permissions[], isAdmin. Thiếu bất kỳ '
                 'trường nào là 400.\n\n**Giá trị hợp lệ (kiểm từ `ActionStudioService`):**\n\n'
                 '- `surface`: `DOSSIER_DETAIL` · `WORKLIST` · `MOBILE` · `ACTION_STUDIO`\n'
                 '- `dossierStatus`: `draft` · `processing` · `approved` · `rejected` '
                 '— **chữ thường**, không phải mã kiểu `CHO_DUYET`\n\n'
                 'Đổi `roleCodes` để xem cùng một bước thì vai trò khác nhau thấy nút gì — cách test '
                 'RBAC fail-closed mà không phải đăng nhập nhiều tài khoản.',
            tests=["console.log('Status', pm.response.code, pm.response.text().slice(0, 800));"]),
        app('Nút khả dụng của một task', 'GET', '/api/tasks/{{userTaskKey}}/available-actions',
            headers=[{'key': 'X-QTKHCN-User-Id', 'value': '{{userId}}'}],
            desc='**Bắt buộc header `X-QTKHCN-User-Id`** — thiếu là 400 `IDENTITY_REQUIRED`, KHÔNG '
                 'phải 401. Header này khác `X-QTKHCN-Actor` (chỉ dùng ghi audit).\n\n'
                 'RBAC fail-closed: danh sách rỗng = vai trò của user này không được bấm gì ở bước đó.',
            tests=[OK, "console.log(JSON.stringify(pm.response.json(), null, 2));"]),
        app('⚠️ Bấm nút trên task', 'POST', '/api/tasks/{{userTaskKey}}/actions',
            body={'requestId': '{{$guid}}', 'taskKey': '{{userTaskKey}}', 'actionCode': 'DONG_Y',
                  'comment': 'test qua Postman', 'formData': {}, 'expectedTaskState': 'CREATED'},
            headers=[{'key': 'X-QTKHCN-User-Id', 'value': '{{userId}}'},
                     {'key': 'X-QTKHCN-Actor', 'value': '{{actor}}'}],
            desc='**Đẩy hồ sơ sang bước sau qua app** — khác với complete thẳng ở folder 04: đường '
                 'này đi qua luật hành động và RBAC.\n\n`ExecuteActionRequest` bắt buộc: requestId '
                 '(UUID — `{{$guid}}` tự sinh mỗi lần bấm, dùng chống double-submit), taskKey, '
                 'actionCode, formData (object), expectedTaskState. Trả **202 Accepted**, không phải 200.',
            tests=["console.log('Status', pm.response.code, pm.response.text().slice(0, 500));"]),
    ])

app_other = folder(
    'C · Các phân hệ khác',
    'Không thuộc use case đồng bộ nhưng hay cần khi test end-to-end.',
    [
        app('Draft quy trình', 'GET', '/api/process-definition-drafts',
            desc='Tự lưu `{{draftId}}` cho request "Phiên test BPMN" phía dưới.',
            tests=[OK,
                   "const d = pm.response.json() || [];",
                   "console.log('Draft:', d.length);",
                   "if (d.length) { pm.collectionVariables.set('draftId', d[0].id);",
                   "                console.log('→ draftId =', d[0].id); }",
                   "else console.log('Chưa có draft ⇒ request Phiên test BPMN sẽ không chạy được.');"]),
        app('Ma trận phê duyệt — rules', 'GET', '/api/approval-matrix/rules', tests=[OK]),
        app('Ma trận phê duyệt — resolve', 'POST', '/api/approval-matrix/resolve',
            body={'slot': '{{slotCode}}', 'ngay': '2026-07-28',
                  'context': {'cap': 'CAP_VIEN', 'giaTri': 500000000}},
            desc='`slot` (không rỗng) và `context` (object, không null) **bắt buộc**; `ngay` tuỳ chọn '
                 '(`yyyy-MM-dd`, để lấy đúng version rule hiệu lực tại ngày đó).\n\n'
                 'Điều kiện nghiệp vụ nằm TRONG `context`, không phải ở cấp gốc.\n\n'
                 '`{{slotCode}}` do request `Slot phê duyệt` phía trên tự điền — slot không có thật là '
                 '404 `Không tìm thấy slot`.',
            tests=["console.log('Status', pm.response.code, pm.response.text().slice(0, 600));"]),
        app('Slot phê duyệt', 'GET', '/api/approval-matrix/slots',
            desc='Tự lưu `{{slotCode}}` cho request `resolve` phía dưới.',
            tests=[OK,
                   "const s = pm.response.json() || [];",
                   "console.log('Slot:', s.map(x => x.code).join(', '));",
                   "const active = s.find(x => x.trangThai === 'active') || s[0];",
                   "if (active) { pm.collectionVariables.set('slotCode', active.code);",
                   "              console.log('→ slotCode =', active.code); }"]),
        app('DMN rules', 'GET', '/api/dmn-rules', tests=[OK]),
        app('eForm — danh sách', 'GET', '/api/eform',
            desc='So `key` ở đây với `formKey` trong BPMN (folder 04) để soi bug binding eForm.',
            tests=[OK, "console.log('eForm keys:', (pm.response.json() || []).map(f => f.key).join(', '));"]),
        app('Service tasks', 'GET', '/api/service-tasks', tests=[OK]),
        app('Service task bindings', 'GET', '/api/service-tasks/bindings', tests=[OK]),
        app('Hệ thống tích hợp', 'GET', '/api/integration-systems', tests=[OK]),
        app('Giám sát quy trình', 'GET', '/api/process-monitor', tests=[OK]),
        app('Phiên test BPMN', 'POST', '/api/bpmn-tests',
            body={'draftId': '{{draftId}}', 'revision': 0, 'variables': {}, 'ttlSeconds': 600},
            headers=[{'key': 'X-QTKHCN-Actor', 'value': '{{actor}}'}],
            desc='Chạy quy trình trên engine phụ `bpmn-test-orchestration` (:8092), không đụng engine '
                 'dev chính.\n\n**Nhận `draftId` (UUID của DRAFT), không phải bpmnProcessId** — lấy từ '
                 'request "Draft quy trình" ngay phía trên (nó tự lưu vào `{{draftId}}`). Chưa có draft '
                 'nào thì request này không chạy được.',
            tests=["console.log('Status', pm.response.code, pm.response.text().slice(0, 500));"]),
    ])

backend = folder(
    '09 · QTKHCN backend (:8090)',
    'API của app. **Mọi request cần header `X-QTKHCN-Dev-Key`** — collection tự chèn qua pre-request '
    'script, chỉ cho request tới `{{appBase}}`, không rò key sang Camunda.',
    [app_sync, app_studio, app_other])

COLLECTION = {
    'info': {
        '_postman_id': '2ac5fade-267f-45cd-afd4-e6bfd0ca82c2',
        'name': 'Camunda',
        'description': (
            '# QTKHCN ↔ Camunda 8.9 — bộ test đầy đủ\n\n'
            'Sinh từ **OpenAPI spec sống** của engine (`http://localhost:8080/v3/api-docs`, 200 endpoint) '
            'nên không path nào là phỏng đoán. Phần backend đọc từ controller trong repo.\n\n'
            '## Dùng thế nào\n\n'
            '1. Import kèm environment `QTKHCN-local.postman_environment.json`, chọn nó ở góc phải.\n'
            '2. Chạy folder `00` trước — engine chưa sống thì mọi thứ khác vô nghĩa.\n'
            '3. Trong mỗi folder, request đánh số ① ② ③ phải chạy theo thứ tự: chúng **tự chuyền biến** '
            '(`processDefinitionKey`, `processInstanceKey`, `userTaskKey`…) cho nhau. Không cần copy tay key nào.\n\n'
            '## Quy ước\n\n'
            '- **⚠️** = request GHI DỮ LIỆU hoặc phá trạng thái. Đọc description trước khi bấm.\n'
            '- Request không có ⚠️ đều read-only.\n'
            '- Mở tab **Console** (Ctrl+Alt+C) — phần lớn thông tin hữu ích in ra đó, không phải ở body.\n\n'
            '## Kịch bản test use case "Đồng bộ quy trình từ Camunda"\n\n'
            '| Muốn kiểm | Làm gì |\n'
            '|---|---|\n'
            '| Đường hạnh phúc | `02 → Deploy BPMN` (đổi `<bpmn:process id>` thành id mới) rồi `09/A → ②` ⇒ `imported = 1`, `newCatalog = true` |\n'
            '| Idempotency | Chạy `09/A → ②` hai lần ⇒ lần 2 `imported = 0` |\n'
            '| Cảnh báo quét bị cắt | Đặt env `maxScan = 1`, chạy `09/A → ②` ⇒ `warnings[]` có nội dung |\n'
            '| Lỗi toàn lượt | `docker stop orchestration`, chạy `09/A → ②` ⇒ HTTP lỗi, KHÔNG phải 200 + `failures[]` |\n'
            '| Thiếu auth | Xoá header dev key ⇒ 401 kèm message tiếng Việt |\n'
            '| Scaffold luật | Sau đồng bộ, `09/B → Đối soát` xem quy trình mới đã có luật chưa |\n\n'
            'Tài liệu đầy đủ: `docs/arch/api-camunda-dong-bo-quy-trinh.md` và '
            '`docs/arch/sequence-dong-bo-quy-trinh-tu-camunda.md`.'),
        'schema': 'https://schema.getpostman.com/json/collection/v2.1.0/collection.json',
        '_exporter_id': '17277787',
    },
    'item': [health, procdef, deploy, instances, tasks, dmn, diag, variables, msg, backend],
    'event': [{
        'listen': 'prerequest',
        'script': {'type': 'text/javascript', 'exec': [
            "// Biến thời gian cho các request thống kê job (from/to là bắt buộc).",
            "const now = new Date();",
            "pm.collectionVariables.set('nowIso', now.toISOString());",
            "pm.collectionVariables.set('from7d', new Date(now.getTime() - 7 * 864e5).toISOString());",
            "",
            "// Dev API key CHỈ gửi cho backend app, không bao giờ rò sang Camunda.",
            "const raw = pm.request.url.toString();",
            "const appBase = pm.variables.replaceIn('{{appBase}}');",
            "if (raw.indexOf('{{appBase}}') === 0 || (appBase && raw.indexOf(appBase) === 0)) {",
            "    pm.request.headers.upsert({ key: 'X-QTKHCN-Dev-Key',",
            "                                value: pm.variables.replaceIn('{{devApiKey}}') });",
            "} else {",
            "    // Camunda: chỉ gắn Bearer khi đã bật OIDC và điền biến {{bearer}}.",
            "    const t = pm.variables.replaceIn('{{bearer}}');",
            "    if (t && t !== '{{bearer}}') pm.request.headers.upsert({ key: 'Authorization', value: 'Bearer ' + t });",
            "}"]}}],
    'variable': [
        {'key': 'processDefinitionKey', 'value': '', 'type': 'string'},
        {'key': 'bpmnProcessId', 'value': '', 'type': 'string'},
        {'key': 'processInstanceKey', 'value': '', 'type': 'string'},
        {'key': 'userTaskKey', 'value': '', 'type': 'string'},
        {'key': 'elementInstanceKey', 'value': '', 'type': 'string'},
        {'key': 'incidentKey', 'value': '', 'type': 'string'},
        {'key': 'jobKey', 'value': '', 'type': 'string'},
        {'key': 'decisionDefinitionKey', 'value': '', 'type': 'string'},
        {'key': 'decisionDefinitionId', 'value': '', 'type': 'string'},
        {'key': 'catalogId', 'value': '', 'type': 'string'},
        {'key': 'draftId', 'value': '', 'type': 'string'},
        {'key': 'slotCode', 'value': '', 'type': 'string'},
        {'key': 'catalogBpmnProcessId', 'value': '', 'type': 'string'},
        {'key': 'resourceKey', 'value': '', 'type': 'string'},
        {'key': 'nowIso', 'value': '', 'type': 'string'},
        {'key': 'from7d', 'value': '', 'type': 'string'},
        {'key': 'catalogCountBefore', 'value': '0', 'type': 'string'},
        {'key': 'importedBpmnProcessId', 'value': '', 'type': 'string'},
    ],
}

if errors:
    print('LOI — endpoint khong co trong spec:')
    for e in errors:
        print('  ', e)
    sys.exit(1)

os.makedirs(os.path.dirname(OUT), exist_ok=True)
with open(OUT, 'w', encoding='utf-8') as f:
    json.dump(COLLECTION, f, ensure_ascii=False, indent=2)


def count(items):
    n = 0
    for i in items:
        n += count(i['item']) if 'item' in i else 1
    return n


print('OK — da sinh', OUT)
print('Tong so request:', count(COLLECTION['item']))
for f_ in COLLECTION['item']:
    print('  %-40s %d request' % (f_['name'], count(f_['item'])))
