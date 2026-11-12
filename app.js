'use strict';
const $ = s => document.querySelector(s);
const BN = {Home:'হোম','Salary & OT':'বেতন ও ওটি',Finance:'আয়-ব্যয়',Savings:'সঞ্চয়',More:'আরও',Income:'আয়',Expense:'ব্যয়',Balance:'অবশিষ্ট',Save:'সংরক্ষণ',Cancel:'বাতিল',Delete:'মুছুন',Edit:'সম্পাদনা',Date:'তারিখ',Amount:'পরিমাণ',Category:'ক্যাটাগরি',Description:'বিবরণ',Method:'পেমেন্ট',Hours:'ঘণ্টা','Your Personal Offline Assistant':'আপনার ব্যক্তিগত অফলাইন সহকারী','Base salary':'মূল বেতন','OT rate / hour':'ওটি রেট / ঘণ্টা','Other income':'অন্যান্য আয়','Estimated salary':'আনুমানিক মোট বেতন','Monthly OT':'মাসিক ওটি','Total OT income':'মোট ওটি আয়','Total savings':'মোট সঞ্চয়','Recent transactions':'সাম্প্রতিক লেনদেন','Recent OT':'সাম্প্রতিক ওটি',Budget:'বাজেট','Add income':'আয় যোগ','Add expense':'ব্যয় যোগ','Add OT':'ওটি যোগ','Edit OT':'ওটি সম্পাদনা','Salary settings':'বেতন সেটিংস','No transactions':'কোনো লেনদেন নেই','No OT entries':'কোনো ওটি নেই','No goals yet':'এখনো কোনো লক্ষ্য নেই','Invalid number':'সংখ্যা সঠিক নয়','Amount must be above 0':'পরিমাণ ০ এর বেশি হতে হবে','Max 24 hours':'সর্বোচ্চ ২৪ ঘণ্টা','OT already exists for this date':'এই তারিখে ওটি আগেই আছে','Delete this item?':'এটি মুছবেন?',Food:'খাবার',Transport:'যাতায়াত',Shopping:'কেনাকাটা',Family:'পরিবার',Mobile:'মোবাইল',Medical:'চিকিৎসা',Bills:'বিল',Education:'শিক্ষা',Other:'অন্যান্য',Salary:'বেতন',Overtime:'ওভারটাইম',Business:'ব্যবসা',Cash:'নগদ টাকা',Offline:'অফলাইন',Online:'অনলাইন','Savings goals':'সঞ্চয় লক্ষ্য','Add goal':'লক্ষ্য যোগ','Add deposit':'জমা যোগ','Goal name':'লক্ষ্যের নাম','Target amount':'লক্ষ্যমাত্রা','Starting amount':'শুরুর পরিমাণ','Monthly contribution':'মাসিক জমা','Target date':'লক্ষ্য তারিখ','DPS calculator (estimate only)':'ডিপিএস ক্যালকুলেটর (শুধু অনুমান)','Monthly installment':'মাসিক কিস্তি','Months':'মাস','Annual interest %':'বার্ষিক সুদ %',Language:'ভাষা',Theme:'থিম','Monthly budget':'মাসিক বাজেট','Export backup (JSON)':'ব্যাকআপ এক্সপোর্ট (JSON)','Import backup':'ব্যাকআপ ইমপোর্ট','Export finance CSV':'আয়-ব্যয় CSV','Export OT CSV':'ওটি CSV','Add category':'ক্যাটাগরি যোগ',Name:'নাম',Type:'ধরন',Search:'খুঁজুন'};
const IC = {home:'<path d="M3 11l9-8 9 8M5 10v10h14V10"/>',ot:'<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',fin:'<path d="M3 7h18v12H3zM3 7l3-4h12l3 4M16 13h2"/>',sav:'<path d="M12 3l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1L3.2 9.5l6.1-.9z"/>',more:'<path d="M4 6h16M4 12h16M4 18h16"/>'};
const NL = {home:'Home',ot:'Salary & OT',fin:'Finance',sav:'Savings',more:'More'};
let lang = localStorage.lang || 'bn', theme = localStorage.theme || 'dark', view = 'home';
const today = () => { const d = new Date(); return new Date(d - d.getTimezoneOffset() * 6e4).toISOString().slice(0, 10); };
let month = today().slice(0, 7), D = {}, saving = false;
const t = k => (lang === 'bn' && BN[k]) || k;
const nf = n => Number(n).toLocaleString(lang === 'bn' ? 'bn-BD' : 'en-US', { maximumFractionDigits: 2 });
const money = n => '৳' + nf(n);
const fd = d => new Date(d + 'T00:00').toLocaleDateString(lang === 'bn' ? 'bn-BD' : 'en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => '&#' + c.charCodeAt(0) + ';');
const sum = (a, f) => a.reduce((x, y) => x + f(y), 0);
const mo = d => d.slice(0, 7);
const toast = m => { const e = $('#toast'); e.textContent = m; e.className = 'show'; setTimeout(() => e.className = '', 2600); };
const busy = on => $('#busy').hidden = !on;
const cats = ty => (ty === 'inc' ? ['Salary', 'Overtime', 'Business', 'Other'] : ['Food', 'Transport', 'Shopping', 'Family', 'Mobile', 'Medical', 'Bills', 'Education', 'Other'])
  .concat(D.cats.filter(c => c.type === ty).map(c => c.name));
const curSal = m => D.salaries.find(s => s.month === m) ||
  D.salaries.filter(s => s.month < m).sort((a, b) => b.month.localeCompare(a.month))[0] || { base: 0, rate: 0, other: 0 };
const csv = rows => '\ufeff' + rows.map(r => r.map(c => '"' + String(c ?? '').replace(/"/g, '""') + '"').join(',')).join('\n');
const dl = (n, txt, type) => { const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([txt], { type })); a.download = n; a.click(); setTimeout(() => URL.revokeObjectURL(a.href), 4e3); };
const mp = () => `<input type="month" id="mp" value="${month}" aria-label="Month">`;

async function load() {
  busy(1);
  try { for (const s of DB.STORES) D[s] = await DB.all(s); }
  catch (e) { toast('Database error: ' + e.message); }
  busy(0); render();
}
function render() {
  document.documentElement.lang = lang; document.body.dataset.theme = theme;
  $('#tag').textContent = t('Your Personal Offline Assistant');
  $('#net').textContent = navigator.onLine ? t('Online') : t('Offline');
  $('#nav').innerHTML = Object.keys(NL).map(v => `<button data-go="${v}" class="${v === view ? 'on' : ''}" aria-label="${t(NL[v])}"><svg viewBox="0 0 24 24">${IC[v]}</svg>${t(NL[v])}</button>`).join('');
  $('#app').innerHTML = V[view]();
}

function form(title, fields, vals, onSave) {
  const d = $('#dlg');
  d.innerHTML = `<form id="f"><h3>${t(title)}</h3>${fields.map(f => `<label>${t(f.l)}${f.o ? `<select name="${f.n}">${f.o.map(o => `<option value="${esc(o)}" ${vals[f.n] === o ? 'selected' : ''}>${esc(t(o))}</option>`).join('')}</select>` : `<input name="${f.n}" type="${f.k || 'text'}" ${f.k === 'number' ? 'min="0" step="any" inputmode="decimal"' : ''} value="${esc(vals[f.n])}" ${f.r === 0 ? '' : 'required'}>`}</label>`).join('')}<p class="err" id="e"></p><div class="row"><button type="button" class="ghost" id="x">${t('Cancel')}</button><button>${t('Save')}</button></div></form>`;
  $('#x').onclick = () => d.close();
  $('#f').onsubmit = async e => {
    e.preventDefault(); if (saving) return;
    const o = {};
    for (const f of fields) {
      let v = e.target.elements[f.n].value.trim();
      if (f.k === 'number') { v = v === '' && f.r === 0 ? 0 : parseFloat(v); if (!isFinite(v) || v < 0) return $('#e').textContent = t('Invalid number'); }
      o[f.n] = v;
    }
    saving = true; busy(1);
    try { const err = await onSave(o); if (err) { $('#e').textContent = err; return; } d.close(); await load(); toast('✓'); }
    catch (x) { $('#e').textContent = x.message; }
    finally { saving = false; busy(0); }
  };
  d.showModal();
}
const row = (title, sub, amt, cls, a, id) => `<div class="item"><div><b>${title}</b><small>${sub}</small></div><div class="${cls}">${amt}</div><div class="acts"><button data-a="edit${a}" data-id="${id}" aria-label="${t('Edit')}">✎</button><button data-a="del${a}" data-id="${id}" aria-label="${t('Delete')}">🗑</button></div></div>`;

const V = {
  home() {
    const tm = D.tx.filter(x => mo(x.date) === month);
    const inc = sum(tm.filter(x => x.type === 'inc'), x => x.amount), exp = sum(tm.filter(x => x.type === 'exp'), x => x.amount);
    const otM = sum(D.ot.filter(e => mo(e.date) === month), e => e.hours * e.rate), otAll = sum(D.ot, e => e.hours * e.rate);
    const sav = sum(D.goals, g => g.start) + sum(D.deps, d => d.amount), bud = +localStorage.budget || 0, pct = bud ? Math.min(100, exp / bud * 100) : 0;
    const rt = [...D.tx].sort((a, b) => b.date.localeCompare(a.date) || b.id - a.id).slice(0, 5);
    const ro = [...D.ot].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 5);
    return `<div class="card"><b>${fd(today())}</b>${mp()}</div>
    <div class="grid"><div class="card"><small>${t('Income')}</small><b class="inc">${money(inc)}</b></div><div class="card"><small>${t('Expense')}</small><b class="exp">${money(exp)}</b></div>
    <div class="card"><small>${t('Balance')}</small><b>${money(inc - exp)}</b></div><div class="card"><small>${t('Total savings')}</small><b>${money(sav)}</b></div>
    <div class="card"><small>${t('Monthly OT')}</small><b>${money(otM)}</b></div><div class="card"><small>${t('Total OT income')}</small><b>${money(otAll)}</b></div></div>
    <div class="card"><small>${t('Budget')}: ${bud ? money(exp) + ' / ' + money(bud) : '—'}</small><div class="bar ${exp > bud && bud ? 'warn' : ''}"><i style="width:${pct}%"></i></div></div>
    <div class="row"><button data-a="addTx" data-v="inc">+ ${t('Income')}</button><button data-a="addTx" data-v="exp">+ ${t('Expense')}</button><button data-a="addOt">+ OT</button></div>
    <div class="card"><h3>${t('Recent transactions')}</h3>${rt.map(x => `<div class="item"><div><b>${esc(t(x.cat))}</b><small>${fd(x.date)}</small></div><div class="${x.type}">${x.type === 'inc' ? '+' : '-'}${money(x.amount)}</div><span></span></div>`).join('') || `<p class="empty">${t('No transactions')}</p>`}</div>
    <div class="card"><h3>${t('Recent OT')}</h3>${ro.map(e => `<div class="item"><div><b>${fd(e.date)}</b><small>${nf(e.hours)} h × ${money(e.rate)}</small></div><div>${money(e.hours * e.rate)}</div><span></span></div>`).join('') || `<p class="empty">${t('No OT entries')}</p>`}</div>`;
  },
  ot() {
    const s = curSal(month), l = D.ot.filter(e => mo(e.date) === month).sort((a, b) => b.date.localeCompare(a.date));
    const pay = sum(l, e => e.hours * e.rate);
    return `<div class="card">${mp()}<div class="row"><button data-a="salary">${t('Salary settings')}</button><button class="ghost" data-a="addOt">+ OT</button></div>
    <div class="item"><div>${t('Base salary')}</div><div>${money(s.base)}</div><span></span></div>
    <div class="item"><div>${t('OT rate / hour')}</div><div>${money(s.rate)}</div><span></span></div>
    <div class="item"><div>${t('Other income')}</div><div>${money(s.other)}</div><span></span></div>
    <div class="item"><div>${t('Hours')}</div><div>${nf(sum(l, e => e.hours))}</div><span></span></div>
    <div class="item"><div>${t('Monthly OT')}</div><div>${money(pay)}</div><span></span></div>
    <div class="item"><b>${t('Estimated salary')}</b><b>${money(s.base + pay + s.other)}</b><span></span></div></div>
    <div class="card">${l.map(e => row(fd(e.date), `${nf(e.hours)} h × ${money(e.rate)}`, money(e.hours * e.rate), '', 'Ot', e.id)).join('') || `<p class="empty">${t('No OT entries')}</p>`}</div>`;
  },
  fin() {
    const tm = D.tx.filter(x => mo(x.date) === month && x.type === 'exp'), by = {};
    tm.forEach(x => by[x.cat] = (by[x.cat] || 0) + x.amount);
    const mx = Math.max(1, ...Object.values(by));
    const inc = sum(D.tx.filter(x => x.type === 'inc'), x => x.amount), exp = sum(D.tx.filter(x => x.type === 'exp'), x => x.amount);
    return `<div class="card">${mp()}<div class="row"><button data-a="addTx" data-v="inc">+ ${t('Income')}</button><button data-a="addTx" data-v="exp">+ ${t('Expense')}</button><button class="ghost" data-a="addCat">${t('Add category')}</button></div>
    <small>${t('Income')} ${money(inc)} · ${t('Expense')} ${money(exp)} · ${t('Balance')} ${money(inc - exp)}</small>
    ${Object.entries(by).map(([k, v]) => `<div class="crow"><span>${esc(t(k))}</span><div class="bar"><i style="width:${v / mx * 100}%"></i></div><span>${money(v)}</span></div>`).join('')}</div>
    <div class="card"><div class="row"><input id="q" placeholder="${t('Search')}" aria-label="${t('Search')}"><select id="ft" aria-label="${t('Type')}"><option value="all">All</option><option value="inc">${t('Income')}</option><option value="exp">${t('Expense')}</option></select></div><div id="fl">${finList()}</div></div>`;
  },
  sav() {
    return `<div class="row"><button data-a="addGoal">+ ${t('Add goal')}</button></div>` +
      (D.goals.map(g => {
        const ds = D.deps.filter(d => d.goalId === g.id).sort((a, b) => b.date.localeCompare(a.date)), saved = g.start + sum(ds, d => d.amount);
        const rem = Math.max(0, g.target - saved), pct = Math.min(100, saved / g.target * 100);
        let eta = '✓';
        if (rem > 0) { if (g.monthly > 0) { const d = new Date(); d.setMonth(d.getMonth() + Math.ceil(rem / g.monthly)); eta = '≈ ' + d.toLocaleDateString(lang === 'bn' ? 'bn-BD' : 'en-GB', { month: 'long', year: 'numeric' }); } else eta = '—'; }
        return `<div class="card"><h3>${esc(g.name)}</h3><div class="bar"><i style="width:${pct}%"></i></div><small>${money(saved)} / ${money(g.target)} (${nf(pct.toFixed(1))}%) · ${money(rem)} left · ${eta}${g.date ? ' · ' + fd(g.date) : ''}</small>
        <div class="row"><button data-a="addDep" data-id="${g.id}">+ ${t('Add deposit')}</button><button class="ghost" data-a="editGoal" data-id="${g.id}">✎</button><button class="ghost" data-a="delGoal" data-id="${g.id}">🗑</button></div>
        ${ds.map(d => row(fd(d.date), '', money(d.amount), 'ok', 'Dep', d.id)).join('')}</div>`;
      }).join('') || `<p class="empty">${t('No goals yet')}</p>`) +
      `<div class="card"><h3>${t('DPS calculator (estimate only)')}</h3>
      <label>${t('Monthly installment')} (৳)<input id="d1" type="number" min="0" inputmode="decimal" oninput="dps()"></label>
      <label>${t('Months')}<input id="d2" type="number" min="1" inputmode="numeric" oninput="dps()"></label>
      <label>${t('Annual interest %')}<input id="d3" type="number" min="0" step="any" inputmode="decimal" oninput="dps()"></label>
      <div id="dr"></div><small>Estimate only (monthly compounding, deposits at month start). Not a guaranteed bank return; real banks may differ.</small></div>`;
  },
  more() {
    return `<div class="card"><div class="row"><button data-a="lang">${t('Language')}: ${lang === 'bn' ? 'বাংলা' : 'English'}</button><button data-a="theme" class="ghost">${t('Theme')}: ${theme}</button></div>
    <button data-a="budget" class="ghost" style="width:100%">${t('Monthly budget')}: ${money(+localStorage.budget || 0)}</button></div>
    <div class="card"><div class="row"><button data-a="exp">${t('Export backup (JSON)')}</button></div><label>${t('Import backup')}<input type="file" id="imp" accept=".json,application/json"></label>
    <div class="row"><button class="ghost" data-a="csvTx">${t('Export finance CSV')}</button><button class="ghost" data-a="csvOt">${t('Export OT CSV')}</button></div>
    <small>⚠ Backups are plain, unencrypted files with your financial data. Keep them private. All data stays on this device; nothing is uploaded.</small></div>`;
  }
};
function finList() {
  const q = ($('#q')?.value || '').toLowerCase(), ty = $('#ft')?.value || 'all';
  const l = D.tx.filter(x => mo(x.date) === month && (ty === 'all' || x.type === ty) && (!q || (x.desc + ' ' + x.cat).toLowerCase().includes(q))).sort((a, b) => b.date.localeCompare(a.date) || b.id - a.id);
  if (!l.length) return `<p class="empty">${t('No transactions')}</p>`;
  let last = '';
  return l.map(x => { const h = x.date !== last ? `<h4>${fd(x.date)}</h4>` : ''; last = x.date; return h + row(esc(t(x.cat)), esc(x.desc) + ' · ' + esc(t(x.method)), (x.type === 'inc' ? '+' : '-') + money(x.amount), x.type, 'Tx', x.id); }).join('');
}
window.dps = () => {
  const m = +$('#d1').value, n = +$('#d2').value, r = +$('#d3').value, i = r / 1200;
  if (!(m > 0 && n > 0) || r < 0) return $('#dr').innerHTML = '';
  const fv = i > 0 ? m * ((1 + i) ** n - 1) / i * (1 + i) : m * n;
  $('#dr').innerHTML = `<div class="item"><div>Total deposits</div><div>${money(m * n)}</div><span></span></div><div class="item"><div>Est. interest</div><div>${money(fv - m * n)}</div><span></span></div><div class="item"><b>Est. maturity</b><b>${money(fv)}</b><span></span></div>`;
};

const txForm = r => form(r.type === 'inc' ? 'Add income' : 'Add expense', [{ n: 'date', l: 'Date', k: 'date' }, { n: 'amount', l: 'Amount', k: 'number' }, { n: 'cat', l: 'Category', o: cats(r.type) }, { n: 'desc', l: 'Description', r: 0 }, { n: 'method', l: 'Method', o: ['Cash', 'bKash', 'Nagad', 'Bank', 'Card'] }], r,
  async o => { if (!(o.amount > 0)) return t('Amount must be above 0'); await DB.put('tx', { ...r, ...o }); });
const otForm = r => form(r.id ? 'Edit OT' : 'Add OT', [{ n: 'date', l: 'Date', k: 'date' }, { n: 'hours', l: 'Hours', k: 'number' }], r,
  async o => {
    if (o.hours > 24) return t('Max 24 hours');
    if (D.ot.some(e => e.date === o.date && e.id !== r.id)) return t('OT already exists for this date');
    await DB.put('ot', { ...r, ...o, rate: r.id ? r.rate : curSal(mo(o.date)).rate }); // rate snapshot keeps history safe
  });
const goalForm = r => form('Add goal', [{ n: 'name', l: 'Goal name' }, { n: 'target', l: 'Target amount', k: 'number' }, { n: 'start', l: 'Starting amount', k: 'number', r: 0 }, { n: 'monthly', l: 'Monthly contribution', k: 'number', r: 0 }, { n: 'date', l: 'Target date', k: 'date', r: 0 }], r,
  async o => { if (!(o.target > 0)) return t('Amount must be above 0'); await DB.put('goals', { ...r, ...o }); });
const depForm = r => form('Add deposit', [{ n: 'date', l: 'Date', k: 'date' }, { n: 'amount', l: 'Amount', k: 'number' }], r,
  async o => { if (!(o.amount > 0)) return t('Amount must be above 0'); await DB.put('deps', { ...r, ...o }); });
const del = (s, id, extra) => { if (confirm(t('Delete this item?'))) DB.del(s, id).then(async () => { if (extra) await extra(); load(); }).catch(e => toast(e.message)); };

const A = {
  addTx: ty => txForm({ type: ty, date: today(), amount: '', cat: cats(ty)[0], desc: '', method: 'Cash' }),
  editTx: id => txForm(D.tx.find(x => x.id === id)), delTx: id => del('tx', id),
  addOt: () => otForm({ date: today(), hours: '' }), editOt: id => otForm(D.ot.find(x => x.id === id)), delOt: id => del('ot', id),
  salary: () => { const s = curSal(month); form('Salary settings', [{ n: 'base', l: 'Base salary', k: 'number' }, { n: 'rate', l: 'OT rate / hour', k: 'number' }, { n: 'other', l: 'Other income', k: 'number', r: 0 }], s, async o => { await DB.put('salaries', { month, ...o }); }); },
  addCat: () => form('Add category', [{ n: 'name', l: 'Name' }, { n: 'type', l: 'Type', o: ['Income', 'Expense'] }], { type: 'Expense' }, async o => { if (cats(o.type === 'Income' ? 'inc' : 'exp').includes(o.name)) return 'Exists'; await DB.put('cats', { name: o.name, type: o.type === 'Income' ? 'inc' : 'exp' }); }),
  addGoal: () => goalForm({ name: '', target: '', start: 0, monthly: 0, date: '' }), editGoal: id => goalForm(D.goals.find(x => x.id === id)),
  delGoal: id => del('goals', id, async () => { for (const d of D.deps.filter(d => d.goalId === id)) await DB.del('deps', d.id); }),
  addDep: id => depForm({ goalId: id, date: today(), amount: '' }), editDep: id => depForm(D.deps.find(x => x.id === id)), delDep: id => del('deps', id),
  lang: () => { lang = lang === 'bn' ? 'en' : 'bn'; localStorage.lang = lang; render(); },
  theme: () => { theme = theme === 'dark' ? 'light' : 'dark'; localStorage.theme = theme; render(); },
  budget: () => form('Monthly budget', [{ n: 'v', l: 'Amount', k: 'number' }], { v: localStorage.budget || '' }, async o => { localStorage.budget = o.v; }),
  exp: async () => { if (confirm('This backup file is NOT encrypted and contains your personal financial data. Store it safely. Continue?')) dl('nirob-lifeos-backup-' + today() + '.json', JSON.stringify(await DB.dump(), null, 1), 'application/json'); },
  csvTx: () => dl('finance-' + today() + '.csv', csv([['Date', 'Type', 'Category', 'Amount', 'Description', 'Method'], ...D.tx.map(x => [x.date, x.type, x.cat, x.amount, x.desc, x.method])]), 'text/csv'),
  csvOt: () => dl('ot-' + today() + '.csv', csv([['Date', 'Hours', 'Rate', 'Pay'], ...D.ot.map(e => [e.date, e.hours, e.rate, e.hours * e.rate])]), 'text/csv')
};

document.addEventListener('click', e => {
  const b = e.target.closest('[data-go],[data-a]'); if (!b) return;
  if (b.dataset.go) { view = b.dataset.go; render(); scrollTo(0, 0); }
  else A[b.dataset.a]?.(b.dataset.id ? +b.dataset.id : b.dataset.v);
});
document.addEventListener('input', e => { if (e.target.id === 'q') $('#fl').innerHTML = finList(); });
document.addEventListener('change', async e => {
  if (e.target.id === 'mp' && e.target.value) { month = e.target.value; render(); }
  if (e.target.id === 'ft') $('#fl').innerHTML = finList();
  if (e.target.id === 'imp' && e.target.files[0]) {
    try {
      const o = JSON.parse(await e.target.files[0].text());
      const ok = o && o.app === 'nirob-lifeos' && DB.STORES.every(s => Array.isArray(o[s])) &&
        o.tx.every(x => isFinite(x.amount) && x.amount > 0 && /^\d{4}-\d\d-\d\d$/.test(x.date)) &&
        o.ot.every(x => isFinite(x.hours) && x.hours >= 0 && isFinite(x.rate) && /^\d{4}-\d\d-\d\d$/.test(x.date));
      if (!ok) throw new Error('Invalid backup file. Nothing was changed.');
      if (confirm(`Replace ALL current data with this backup? (${o.tx.length} transactions, ${o.ot.length} OT entries, ${o.goals.length} goals). Export a backup first if unsure.`)) { await DB.restore(o); await load(); toast('✓ Restored'); }
    } catch (x) { toast(x.message); }
    e.target.value = '';
  }
});
addEventListener('online', render); addEventListener('offline', render);
addEventListener('unhandledrejection', e => toast(String(e.reason?.message || e.reason)));
(async () => {
  try { await DB.open(); } catch (e) { $('#app').innerHTML = `<p class="card err">Database error: ${esc(e.message)}</p>`; return; }
  await load();
  if ('serviceWorker' in navigator) navigator.serviceWorker.register('service-worker.js').catch(() => {});
})();
