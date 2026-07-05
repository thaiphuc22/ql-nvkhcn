/* Mockup — Quản lý Danh mục quy trình (QTKHCN / Camunda)
 * Dữ liệu in-memory. Seed từ catalog RD01–RD10 (docs/req). Không gọi Camunda thật. */

// ---- Seed data ----------------------------------------------------------
const NHOM = {
  RD01: 'Xét duyệt Chủ trương',
  RD02: 'Xét duyệt NV KHCN',
  RD03: 'Thực hiện NV KHCN',
  RD04: 'Điều chỉnh NV KHCN',
  RD05: 'Nghiệm thu',
  RD06: 'Quyết toán',
  RD08: 'Sở hữu trí tuệ',
};

let PROCESSES = [
  { ma:'RD01.01', ten:'Xét duyệt Chủ trương cấp Cơ sở', nhom:'RD01', pha:1, trangThai:'active', instances:7, capNhat:'2026-06-28',
    moTa:'Khởi tạo → ký cấp TT/Khối → CQNV thẩm định → HĐ KHCN → TGĐ ban hành QĐ chủ trương.',
    versions:[ {v:'1.0',date:'2026-05-12',note:'Bản đầu tiên'}, {v:'1.1',date:'2026-06-10',note:'Bổ sung phiếu nhận xét CQNV'}, {v:'1.2',date:'2026-06-28',note:'Chuẩn hoá bước ký TGĐ'} ] },
  { ma:'RD01.02', ten:'Xét duyệt Chủ trương cấp Tập đoàn', nhom:'RD01', pha:1, trangThai:'active', instances:3, capNhat:'2026-06-25',
    moTa:'Kế thừa cấp CS + CQ KHCN TĐ, HĐ KHCN TĐ, TGĐ TĐ; hỗ trợ vai trò thay thế.',
    versions:[ {v:'1.0',date:'2026-05-20',note:'Bản đầu tiên'}, {v:'1.1',date:'2026-06-25',note:'Thêm act-on-behalf cho Tập đoàn'} ] },
  { ma:'RD02.01', ten:'Xét duyệt NV KHCN cấp Cơ sở', nhom:'RD02', pha:1, trangThai:'active', instances:5, capNhat:'2026-06-27',
    moTa:'Kế thừa chủ trương → chuyên quản Đạt/Chưa đạt → HĐXD (phiên 1&2) → TGĐ phê duyệt mở mới.',
    versions:[ {v:'1.0',date:'2026-05-22',note:'Bản đầu tiên'}, {v:'1.1',date:'2026-06-27',note:'Mô hình hoá phiên họp 1/2'} ] },
  { ma:'RD02.02', ten:'Xét duyệt NV KHCN cấp Tập đoàn', nhom:'RD02', pha:1, trangThai:'active', instances:2, capNhat:'2026-06-27',
    moTa:'HĐXD TĐ, HĐ KHCN TĐ, BTGĐ TĐ; CV đề nghị xét duyệt.',
    versions:[ {v:'1.0',date:'2026-05-25',note:'Bản đầu tiên'} ] },
  { ma:'RD03.01', ten:'Tương tác PM QLKHCN ↔ QLNS (nhân sự)', nhom:'RD03', pha:2, trangThai:'draft', instances:0, capNhat:'2026-06-15',
    moTa:'Đồng bộ danh sách nhân sự & chi phí lương (PL1) với phần mềm QLNS.',
    versions:[ {v:'0.1',date:'2026-06-15',note:'Nháp — chờ chốt mô hình đồng bộ (OQ-009)'} ] },
  { ma:'RD03.02', ten:'Tương tác PM QLKHCN ↔ Mua sắm (MS)', nhom:'RD03', pha:2, trangThai:'draft', instances:0, capNhat:'2026-06-15',
    moTa:'Đồng bộ cấu trúc sản phẩm, tờ trình/gói thầu/hợp đồng (PL2–PL5).',
    versions:[ {v:'0.1',date:'2026-06-15',note:'Nháp'} ] },
  { ma:'RD03.03', ten:'Tương tác PM QLKHCN ↔ SAP (chi phí)', nhom:'RD03', pha:2, trangThai:'draft', instances:0, capNhat:'2026-06-15',
    moTa:'Đồng bộ kinh phí thực hiện/quyết toán theo PL1–PL6.',
    versions:[ {v:'0.1',date:'2026-06-15',note:'Nháp'} ] },
  { ma:'RD03.06', ten:'Báo cáo tiến độ thực hiện đề tài', nhom:'RD03', pha:1, trangThai:'draft', instances:0, capNhat:'2026-06-18',
    moTa:'Khởi tạo/cập nhật/trình ký/xuất báo cáo tiến độ theo form mẫu.',
    versions:[ {v:'0.2',date:'2026-06-18',note:'Nháp — chờ AC'} ] },
  { ma:'RD04.01', ten:'Điều chỉnh Chủ nhiệm qua CQ KHCN (CS)', nhom:'RD04', pha:2, trangThai:'draft', instances:0, capNhat:'2026-06-12',
    moTa:'PM cũ → PM mới → CQ KHCN thẩm định → BTGĐ phê duyệt QĐ điều chỉnh CNĐT.',
    versions:[ {v:'0.1',date:'2026-06-12',note:'Nháp — chờ decision table định tuyến (OQ-008)'} ] },
  { ma:'RD04.03', ten:'Điều chỉnh qua HĐXD ĐC (CS)', nhom:'RD04', pha:2, trangThai:'draft', instances:0, capNhat:'2026-06-12',
    moTa:'Điều chỉnh mục tiêu/tăng dự toán không vượt chủ trương.',
    versions:[ {v:'0.1',date:'2026-06-12',note:'Nháp'} ] },
  { ma:'RD04.05', ten:'Dừng thực hiện NV KHCN (CS)', nhom:'RD04', pha:2, trangThai:'draft', instances:0, capNhat:'2026-06-12',
    moTa:'Qua HĐ Đánh giá hoàn thành (ĐGHT).',
    versions:[ {v:'0.1',date:'2026-06-12',note:'Nháp'} ] },
  { ma:'RD05.01', ten:'Nghiệm thu NV KHCN cấp Cơ sở', nhom:'RD05', pha:1, trangThai:'active', instances:4, capNhat:'2026-06-26',
    moTa:'Khởi tạo hồ sơ → QĐ TL HĐNT → HĐNT đánh giá → TGĐ công nhận kết quả.',
    versions:[ {v:'1.0',date:'2026-05-28',note:'Bản đầu tiên'}, {v:'1.1',date:'2026-06-26',note:'Ràng buộc RD03 hoàn thành'} ] },
  { ma:'RD05.02', ten:'Nghiệm thu NV KHCN cấp Tập đoàn', nhom:'RD05', pha:1, trangThai:'active', instances:1, capNhat:'2026-06-26',
    moTa:'HĐNT TĐ có Tổ KT; BTGĐ TĐ công nhận kết quả.',
    versions:[ {v:'1.0',date:'2026-05-30',note:'Bản đầu tiên'} ] },
  { ma:'RD06.01', ten:'Quyết toán NV KHCN cấp Cơ sở', nhom:'RD06', pha:1, trangThai:'planned', instances:0, capNhat:'—',
    moTa:'⚠ Tài liệu gốc bỏ trống tác nhân/luồng (OQ-010) — cần khảo sát bổ sung.',
    versions:[] },
  { ma:'RD06.02', ten:'Quyết toán NV KHCN cấp Tập đoàn', nhom:'RD06', pha:1, trangThai:'planned', instances:0, capNhat:'—',
    moTa:'⚠ Chưa đủ thông tin để mô hình hoá (OQ-010).',
    versions:[] },
  { ma:'RD08', ten:'Quản lý sở hữu trí tuệ', nhom:'RD08', pha:1, trangThai:'draft', instances:0, capNhat:'2026-06-14',
    moTa:'Đăng ký SHTT (bài báo, sáng chế), công nghệ lõi — thiếu luồng phê duyệt (OQ-014).',
    versions:[ {v:'0.1',date:'2026-06-14',note:'Nháp — thiếu tác nhân/luồng'} ] },
];

// ---- Status helpers -----------------------------------------------------
const STATUS = {
  active:  { label:'Đang chạy',       cls:'active' },
  draft:   { label:'Nháp',            cls:'draft' },
  stopped: { label:'Tạm ngừng',       cls:'stopped' },
  planned: { label:'Chưa triển khai', cls:'planned' },
};
const esc = s => String(s).replace(/[&<>"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const curVer = p => p.versions.length ? p.versions[p.versions.length-1].v : '—';

// ---- Elements -----------------------------------------------------------
const $ = id => document.getElementById(id);
const state = { q:'', nhom:'', pha:'', trangThai:'' };

// ---- Render -------------------------------------------------------------
function renderNhomFilter(){
  const sel = $('fNhom');
  sel.innerHTML = '<option value="">Tất cả nhóm</option>' +
    Object.entries(NHOM).map(([k,v]) => `<option value="${k}">${k} · ${esc(v)}</option>`).join('');
}

function renderKpis(){
  const total = PROCESSES.length;
  const active = PROCESSES.filter(p=>p.trangThai==='active').length;
  const draft = PROCESSES.filter(p=>p.trangThai==='draft').length;
  const inst = PROCESSES.reduce((s,p)=>s+p.instances,0);
  $('kpis').innerHTML = `
    <div class="kpi"><div class="label">Tổng quy trình</div><div class="value">${total}</div></div>
    <div class="kpi k-active"><div class="label">Đang chạy</div><div class="value">${active}</div></div>
    <div class="kpi k-draft"><div class="label">Nháp / chưa triển khai</div><div class="value">${draft + PROCESSES.filter(p=>p.trangThai==='planned').length}</div></div>
    <div class="kpi"><div class="label">Instance đang chạy</div><div class="value">${inst} <small>hồ sơ</small></div></div>`;
}

function filtered(){
  return PROCESSES.filter(p=>{
    if(state.nhom && p.nhom!==state.nhom) return false;
    if(state.pha && String(p.pha)!==state.pha) return false;
    if(state.trangThai && p.trangThai!==state.trangThai) return false;
    if(state.q){
      const q = state.q.toLowerCase();
      if(!(p.ma.toLowerCase().includes(q) || p.ten.toLowerCase().includes(q))) return false;
    }
    return true;
  });
}

function renderTable(){
  const rows = filtered();
  $('count').textContent = `${rows.length}/${PROCESSES.length} quy trình`;
  $('empty').hidden = rows.length>0;
  $('tbody').innerHTML = rows.map(p=>{
    const st = STATUS[p.trangThai];
    return `<tr data-ma="${p.ma}">
      <td class="mono">${p.ma}</td>
      <td class="ten">${esc(p.ten)}<small>${esc(NHOM[p.nhom]||'')}</small></td>
      <td><span class="tag">${p.nhom}</span></td>
      <td class="center">Pha ${p.pha}</td>
      <td class="center ver">v${curVer(p)}</td>
      <td class="center"><span class="pill ${st.cls}">${st.label}</span></td>
      <td class="right">${p.instances>0 ? p.instances : '—'}</td>
      <td>${esc(p.capNhat)}</td>
    </tr>`;
  }).join('');
  $('tbody').querySelectorAll('tr').forEach(tr=>{
    tr.addEventListener('click', ()=> openDrawer(tr.dataset.ma));
  });
}

// ---- Drawer -------------------------------------------------------------
function bpmnSvg(){
  return `<svg viewBox="0 0 420 70" role="img" aria-label="Sơ đồ BPMN minh hoạ">
    <circle cx="18" cy="35" r="12" fill="#fff" stroke="#17935a" stroke-width="2"/>
    <rect x="46" y="20" width="78" height="30" rx="6" fill="#eef4ff" stroke="#4c7fd6"/>
    <text x="85" y="39" font-size="10" text-anchor="middle" fill="#33506e">Khởi tạo</text>
    <rect x="150" y="20" width="78" height="30" rx="6" fill="#eef4ff" stroke="#4c7fd6"/>
    <text x="189" y="39" font-size="10" text-anchor="middle" fill="#33506e">Thẩm định</text>
    <path d="M262 35 l14 -14 l14 14 l-14 14 z" fill="#fff8e6" stroke="#b06f00"/>
    <text x="276" y="63" font-size="9" text-anchor="middle" fill="#b06f00">CS/TĐ?</text>
    <rect x="312" y="20" width="70" height="30" rx="6" fill="#eef4ff" stroke="#4c7fd6"/>
    <text x="347" y="39" font-size="10" text-anchor="middle" fill="#33506e">Phê duyệt</text>
    <circle cx="404" cy="35" r="12" fill="#fff" stroke="#b23b3b" stroke-width="2.5"/>
    <g stroke="#9aa6b4" stroke-width="1.4" fill="none">
      <path d="M30 35 H46" marker-end="url(#a)"/><path d="M124 35 H150" marker-end="url(#a)"/>
      <path d="M228 35 H262" marker-end="url(#a)"/><path d="M290 35 H312" marker-end="url(#a)"/>
      <path d="M382 35 H392" marker-end="url(#a)"/>
    </g>
    <defs><marker id="a" markerWidth="7" markerHeight="7" refX="6" refY="3.5" orient="auto"><path d="M0 0 L7 3.5 L0 7 z" fill="#9aa6b4"/></marker></defs>
  </svg>`;
}

function openDrawer(ma){
  const p = PROCESSES.find(x=>x.ma===ma); if(!p) return;
  const st = STATUS[p.trangThai];
  const canDeploy = p.trangThai!=='planned';
  const versions = p.versions.length ? p.versions.slice().reverse().map((v,i)=>`
    <li><span class="vtag">v${v.v}</span>
      <div class="vnote">${esc(v.note)}<div class="vdate">${esc(v.date)}</div></div>
      ${i===0 ? '<span class="badge-cur">HIỆN HÀNH</span>' : ''}</li>`).join('')
    : '<li class="vdate">Chưa có phiên bản nào được deploy.</li>';

  $('drawer').innerHTML = `
    <div class="drawer-head">
      <div><h2>${esc(p.ten)}</h2><div class="sub"><span class="mono">${p.ma}</span> · ${esc(NHOM[p.nhom]||'')}</div></div>
      <button class="x" id="drawerClose" aria-label="Đóng">×</button>
    </div>
    <div class="drawer-body">
      <dl class="kv">
        <dt>Trạng thái</dt><dd><span class="pill ${st.cls}">${st.label}</span></dd>
        <dt>Phiên bản hiện hành</dt><dd class="ver">v${curVer(p)}</dd>
        <dt>Pha phát triển</dt><dd>Pha ${p.pha}</dd>
        <dt>Instance đang chạy</dt><dd>${p.instances} hồ sơ</dd>
        <dt>Cập nhật</dt><dd>${esc(p.capNhat)}</dd>
      </dl>
      <div class="section-title">Mô tả luồng</div>
      <p style="margin:0;font-size:13px">${esc(p.moTa)}</p>
      <div class="section-title">Sơ đồ BPMN</div>
      <div class="bpmn">${bpmnSvg()}<div class="cap">Minh hoạ — sơ đồ thật quản lý trong Camunda Web Modeler</div></div>
      <div class="section-title">Lịch sử phiên bản</div>
      <ul class="versions">${versions}</ul>
    </div>
    <div class="drawer-foot">
      ${p.trangThai==='active'
        ? `<button class="btn btn-danger" id="btnToggle">⏸ Tạm ngừng</button>`
        : (canDeploy ? `<button class="btn" id="btnToggle">▶ Kích hoạt</button>` : `<button class="btn" disabled title="Cần khảo sát bổ sung">▶ Kích hoạt</button>`)}
      <button class="btn btn-primary" id="btnDeployVer" ${canDeploy?'':'disabled'}>⬆️ Deploy phiên bản mới</button>
    </div>`;
  $('drawer').hidden = false; $('drawerBackdrop').hidden = false;
  $('drawerClose').onclick = closeDrawer;
  $('btnToggle').onclick = ()=> toggleStatus(p.ma);
  const dv = $('btnDeployVer'); if(dv && !dv.disabled) dv.onclick = ()=> deployVersion(p.ma);
}
function closeDrawer(){ $('drawer').hidden = true; $('drawerBackdrop').hidden = true; }

function toggleStatus(ma){
  const p = PROCESSES.find(x=>x.ma===ma); if(!p) return;
  if(p.trangThai==='active'){ p.trangThai='stopped'; p.instances=0; toast(`Đã tạm ngừng ${p.ma}. Instance mới sẽ không khởi tạo.`); }
  else { p.trangThai='active'; toast(`Đã kích hoạt ${p.ma} (v${curVer(p)}).`); }
  renderKpis(); renderTable(); openDrawer(ma);
}

function deployVersion(ma){
  const p = PROCESSES.find(x=>x.ma===ma); if(!p) return;
  openModal({
    title:`Deploy phiên bản mới — ${p.ma}`,
    body:`<div class="field"><label>Tệp BPMN</label>
        <div class="dropzone" id="dz">📄 Kéo-thả hoặc bấm chọn tệp <b>.bpmn</b></div></div>
      <div class="field"><label>Ghi chú phiên bản</label>
        <input class="input" id="verNote" placeholder="VD: Bổ sung bước ký số cho HĐ" /></div>`,
    confirm:'Deploy',
    onConfirm:()=>{
      const note = ($('verNote').value||'').trim() || 'Cập nhật quy trình';
      const cur = curVer(p); const next = cur==='—' ? '1.0' : bump(cur);
      p.versions.push({ v:next, date:'2026-07-03', note });
      p.trangThai='active'; p.capNhat='2026-07-03';
      closeModal(); renderKpis(); renderTable(); openDrawer(ma);
      toast(`Đã deploy ${p.ma} v${next}. Instance đang chạy giữ nguyên phiên bản cũ.`);
    }
  });
  const dz = $('dz'); if(dz) dz.onclick = ()=>{ dz.classList.add('filled'); dz.innerHTML='✅ <b>quy-trinh.bpmn</b> đã chọn (mô phỏng)'; };
}
function bump(v){ const [a,b]=v.split('.').map(Number); return `${a}.${(b||0)+1}`; }

// ---- Deploy new process (toolbar) ---------------------------------------
function deployNew(){
  openModal({
    title:'Deploy quy trình mới',
    body:`<div class="field"><label>Tệp BPMN</label>
        <div class="dropzone" id="dz2">📄 Kéo-thả hoặc bấm chọn tệp <b>.bpmn</b></div></div>
      <div class="field"><label>Mã quy trình</label><input class="input" id="npMa" placeholder="VD: RD07.01"/></div>
      <div class="field"><label>Tên quy trình</label><input class="input" id="npTen" placeholder="VD: Quản lý danh mục SPDV"/></div>
      <div class="field"><label>Nhóm</label><select class="input" id="npNhom">${Object.entries(NHOM).map(([k,v])=>`<option value="${k}">${k} · ${esc(v)}</option>`).join('')}</select></div>`,
    confirm:'Deploy',
    onConfirm:()=>{
      const ma=($('npMa').value||'').trim(), ten=($('npTen').value||'').trim(), nhom=$('npNhom').value;
      if(!ma||!ten){ toast('Cần nhập Mã và Tên quy trình.', true); return; }
      if(PROCESSES.some(p=>p.ma.toLowerCase()===ma.toLowerCase())){ toast(`Mã ${ma} đã tồn tại.`, true); return; }
      PROCESSES.unshift({ ma, ten, nhom, pha:2, trangThai:'active', instances:0, capNhat:'2026-07-03',
        moTa:'Quy trình mới deploy từ mockup.', versions:[{v:'1.0',date:'2026-07-03',note:'Deploy lần đầu'}] });
      closeModal(); renderKpis(); renderTable();
      toast(`Đã deploy quy trình mới ${ma} v1.0.`);
    }
  });
  const dz = $('dz2'); if(dz) dz.onclick = ()=>{ dz.classList.add('filled'); dz.innerHTML='✅ <b>quy-trinh.bpmn</b> đã chọn (mô phỏng)'; };
}

// ---- Modal / Toast ------------------------------------------------------
function openModal({title, body, confirm, onConfirm}){
  $('modal').innerHTML = `<h3>${esc(title)}</h3>${body}
    <div class="modal-actions"><button class="btn" id="mCancel">Huỷ</button>
    <button class="btn btn-primary" id="mOk">${esc(confirm)}</button></div>`;
  $('modalBackdrop').hidden = false;
  $('mCancel').onclick = closeModal;
  $('mOk').onclick = onConfirm;
}
function closeModal(){ $('modalBackdrop').hidden = true; $('modal').innerHTML=''; }
let toastT;
function toast(msg, err){
  const t=$('toast'); t.textContent=msg; t.className='toast'+(err?' err':''); t.hidden=false;
  clearTimeout(toastT); toastT=setTimeout(()=>{ t.hidden=true; }, 3200);
}

// ---- Wire up ------------------------------------------------------------
$('q').addEventListener('input', e=>{ state.q=e.target.value; renderTable(); });
$('fNhom').addEventListener('change', e=>{ state.nhom=e.target.value; renderTable(); });
$('fPha').addEventListener('change', e=>{ state.pha=e.target.value; renderTable(); });
$('fTrangThai').addEventListener('change', e=>{ state.trangThai=e.target.value; renderTable(); });
$('btnDeployNew').addEventListener('click', deployNew);
$('drawerBackdrop').addEventListener('click', closeDrawer);
$('modalBackdrop').addEventListener('click', e=>{ if(e.target===$('modalBackdrop')) closeModal(); });
document.addEventListener('keydown', e=>{ if(e.key==='Escape'){ closeDrawer(); closeModal(); } });

renderNhomFilter(); renderKpis(); renderTable();
