const state = { dashboard:{}, clientes:[], vendedores:[], mensal:[], topQueda:[], topCrescimento:[] };
const BRL = new Intl.NumberFormat('pt-BR',{style:'currency',currency:'BRL'});
const PCT = new Intl.NumberFormat('pt-BR',{style:'percent',minimumFractionDigits:1,maximumFractionDigits:1});
const fmt = v => BRL.format(Number(v||0));
const pct = v => Number.isFinite(Number(v)) ? PCT.format(Number(v||0)) : '-';
const n = v => Number(String(v ?? 0).replace(',','.')) || 0;
const pick = (row, names) => names.map(x=>row[x]).find(v=>v!==undefined && v!==null && v!=='' );

function save(){ localStorage.setItem('vendafacil_crm_data', JSON.stringify(state)); }
function load(){ try{ const s=JSON.parse(localStorage.getItem('vendafacil_crm_data')); if(s && s.clientes){ Object.assign(state,s); return true; }}catch(e){} return false; }

function sheetRows(wb, name){ const ws = wb.Sheets[name]; return ws ? XLSX.utils.sheet_to_json(ws,{defval:''}) : []; }
function cell(ws, addr){ return ws?.[addr]?.v ?? ''; }

function parseWorkbook(wb){
  const dash = wb.Sheets['Dashboard'];
  state.dashboard = {
    fat2024:n(cell(dash,'B3')), fat2025:n(cell(dash,'D3')), fat2026:n(cell(dash,'F3')),
    var25x24:n(cell(dash,'B6')), var26x25:n(cell(dash,'D6')), ativos2026:n(cell(dash,'F6')),
    perdidos2026:n(cell(dash,'B9')), potencial:n(cell(dash,'D9'))
  };
  const ranking = sheetRows(wb,'Ranking_Clientes');
  state.clientes = ranking.map(r=>({
    vendedor: pick(r,['Vendedor_Atual','Vendedor']) || '-', chave: pick(r,['ClienteChave','Cliente Chave']) || '', cliente: pick(r,['Cliente']) || '',
    total2024:n(pick(r,['Total_2024'])), total2025:n(pick(r,['Total_2025'])), total2026:n(pick(r,['Total_2026'])),
    varR:n(pick(r,['Var_26x25_R$','Var_26x25_R'])), varPct:n(pick(r,['Var_26x25_%','Var_26x25'])) ,
    status: pick(r,['Status_2026_vs_2025','Status']) || 'Sem status', potencial:n(pick(r,['Potencial_Recuperacao_R$','Potencial_Recuperacao_R'])),
    projecao:n(pick(r,['Projecao_2026'])), gap:n(pick(r,['Gap_Proj_2026_vs_2025']))
  })).filter(x=>x.cliente);
  state.vendedores = sheetRows(wb,'Analise_Vendedores').map(r=>({
    vendedor: pick(r,['Vendedor']) || '-', total2024:n(r.Total_2024), total2025:n(r.Total_2025), total2026:n(r.Total_2026),
    varR:n(pick(r,['Var_26x25_R$','Var_26x25_R'])), varPct:n(pick(r,['Var_26x25_%','Var_26x25'])), clientes2026:n(r.Clientes_2026), ticket:n(r.Ticket_Medio_2026)
  })).filter(x=>x.vendedor);
  state.mensal = sheetRows(wb,'Resumo_Mensal').map(r=>({mes:r.Mes, y2024:n(r['2024']), y2025:n(r['2025']), y2026:n(r['2026'])})).filter(x=>x.mes);
  state.topQueda = sheetRows(wb,'Top_Queda').map(r=>rowCliente(r)).filter(x=>x.cliente).slice(0,15);
  state.topCrescimento = sheetRows(wb,'Top_Crescimento').map(r=>rowCliente(r)).filter(x=>x.cliente).slice(0,15);
  save(); render();
}
function rowCliente(r){ return {vendedor:pick(r,['Vendedor_Atual','Vendedor'])||'-', cliente:pick(r,['Cliente'])||'', total2026:n(r.Total_2026), varPct:n(pick(r,['Var_26x25_%','Var_26x25'])), status:pick(r,['Status_2026_vs_2025','Status'])||'', potencial:n(pick(r,['Potencial_Recuperacao_R$','Potencial_Recuperacao_R']))}; }

async function loadDefaultCRM(){
  try{ const res = await fetch('crm.xlsx',{cache:'no-store'}); if(!res.ok) throw new Error('crm.xlsx não encontrado'); const buf = await res.arrayBuffer(); parseWorkbook(XLSX.read(buf,{type:'array'})); }
  catch(e){ console.warn(e); render(); }
}

document.addEventListener('DOMContentLoaded',()=>{
  document.querySelectorAll('.nav').forEach(btn=>btn.onclick=()=>{ document.querySelectorAll('.nav,.screen').forEach(x=>x.classList.remove('active')); btn.classList.add('active'); document.getElementById(btn.dataset.screen).classList.add('active'); screenTitle.textContent=btn.textContent; render(); });
  xlsxFile.onchange = e => { const f=e.target.files[0]; if(!f) return; const reader=new FileReader(); reader.onload=()=>parseWorkbook(XLSX.read(reader.result,{type:'array'})); reader.readAsArrayBuffer(f); };
  buscaClientes.oninput=render; buscaVendedores.oninput=render; reloadDemo.onclick=loadDefaultCRM;
  btnLimpar.onclick=()=>{ if(confirm('Apagar dados salvos neste navegador?')){ localStorage.removeItem('vendafacil_crm_data'); location.reload(); }};
  btnExportar.onclick=exportCSV;
  if(!load()) loadDefaultCRM(); else render();
  setupPWA();
});

function render(){
  fat2024.textContent=fmt(state.dashboard.fat2024); fat2025.textContent=fmt(state.dashboard.fat2025); fat2026.textContent=fmt(state.dashboard.fat2026); potencialTotal.textContent=fmt(state.dashboard.potencial || sum(state.clientes,'potencial'));
  const queda=state.clientes.filter(c=>String(c.status).toLowerCase().includes('queda')).length; const perdidos=state.clientes.filter(c=>String(c.status).toLowerCase().includes('perdido')).length; const novos=state.clientes.filter(c=>/novo|recuperado/i.test(c.status)).length;
  clientesQueda.textContent=queda; clientesPerdidos.textContent=state.dashboard.perdidos2026 || perdidos; clientesNovos.textContent=novos; totalVendedores.textContent=state.vendedores.filter(v=>v.total2026>0).length;
  renderCards('topQueda', state.topQueda.length?state.topQueda:state.clientes.filter(c=>c.potencial>0).sort((a,b)=>b.potencial-a.potencial).slice(0,8), true);
  renderCards('topCrescimento', state.topCrescimento.length?state.topCrescimento:state.clientes.filter(c=>c.varPct>0).sort((a,b)=>b.varPct-a.varPct).slice(0,8), false);
  renderStatus(queda,perdidos,novos); renderClientes(); renderVendedores(); renderFunil(); renderPlano(); drawChart();
}
function sum(arr,key){ return arr.reduce((s,x)=>s+n(x[key]),0); }
function renderCards(id, arr, isQueda){ document.getElementById(id).innerHTML = arr.slice(0,8).map(c=>`<div class="clientCard"><strong>${escapeHtml(c.cliente)}</strong><span>${escapeHtml(c.vendedor||'-')}</span><div class="cardRow"><span class="badge ${isQueda?'red':'green'}">${pct(c.varPct)}</span><b>${fmt(isQueda?c.potencial:c.total2026)}</b></div></div>`).join('') || '<p class="hint">Importe a planilha para visualizar.</p>'; }
function renderStatus(q,p,nv){ statusCards.innerHTML = [['Queda',q,'red'],['Perdido',p,'red'],['Novo/Recuperado',nv,'green'],['Ativos 2026',state.dashboard.ativos2026||0,'amber']].map(x=>`<div class="statusItem"><span>${x[0]}</span><strong class="${x[2]==='red'?'negative':x[2]==='green'?'positive':''}">${x[1]}</strong></div>`).join(''); }
function renderClientes(){ const f=(buscaClientes?.value||'').toLowerCase(); const arr=state.clientes.filter(c=>(c.cliente+c.vendedor+c.status).toLowerCase().includes(f)).slice(0,1000); tbodyClientes.innerHTML=arr.map(c=>`<tr><td><b>${escapeHtml(c.cliente)}</b><br><small>${escapeHtml(c.chave)}</small></td><td>${escapeHtml(c.vendedor)}</td><td>${fmt(c.total2024)}</td><td>${fmt(c.total2025)}</td><td>${fmt(c.total2026)}</td><td class="${c.varPct<0?'negative':'positive'}">${pct(c.varPct)}</td><td><span class="badge ${badgeClass(c.status)}">${escapeHtml(c.status)}</span></td><td><b>${fmt(c.potencial)}</b></td><td><a target="_blank" href="${whats(c)}"><button class="miniBtn whats">WhatsApp</button></a></td></tr>`).join(''); }
function renderVendedores(){ const f=(buscaVendedores?.value||'').toLowerCase(); tbodyVendedores.innerHTML=state.vendedores.filter(v=>v.vendedor.toLowerCase().includes(f)).map(v=>`<tr><td><b>${escapeHtml(v.vendedor)}</b></td><td>${fmt(v.total2024)}</td><td>${fmt(v.total2025)}</td><td>${fmt(v.total2026)}</td><td class="${v.varPct<0?'negative':'positive'}">${pct(v.varPct)}</td><td>${v.clientes2026}</td><td>${fmt(v.ticket)}</td></tr>`).join(''); }
function renderFunil(){ const groups={kQueda:c=>/queda/i.test(c.status), kPerdido:c=>/perdido/i.test(c.status), kNegociacao:c=>c.potencial>50000 && /queda/i.test(c.status), kRecuperado:c=>/novo|recuperado|crescimento/i.test(c.status)}; Object.keys(groups).forEach(id=>{ document.getElementById(id).innerHTML=state.clientes.filter(groups[id]).sort((a,b)=>b.potencial-a.potencial).slice(0,25).map(c=>`<div class="clientCard"><strong>${escapeHtml(c.cliente)}</strong><span>${escapeHtml(c.vendedor)}</span><div class="cardRow"><span>${fmt(c.potencial)}</span><a target="_blank" href="${whats(c)}"><button class="miniBtn whats">Chamar</button></a></div></div>`).join(''); }); }
function renderPlano(){ const pot=sum(state.clientes,'potencial'); acoesPlano.innerHTML = `<div class="action red"><b>Prioridade 1:</b> atacar clientes com potencial acima de R$ 50 mil. Separar proposta de mix, prazo e condição em até 24h.</div><div class="action amber"><b>Prioridade 2:</b> vendedores com variação negativa em 2026 devem revisar carteira semanalmente pelo ranking de queda.</div><div class="action"><b>Meta sugerida:</b> recuperar 20% do potencial mapeado (${fmt(pot*0.2)}) nos próximos 90 dias.</div><div class="action"><b>Rotina:</b> contato por WhatsApp, ligação, proposta, registro no funil e follow-up em 3 dias.</div>`; }
function drawChart(){ const c=document.getElementById('chartMensal'); if(!c) return; const ctx=c.getContext('2d'), w=c.width=c.clientWidth*2, h=c.height=320; ctx.clearRect(0,0,w,h); if(!state.mensal.length){ctx.fillText('Importe o CRM para gerar o gráfico',20,40);return;} const max=Math.max(...state.mensal.flatMap(x=>[x.y2024,x.y2025,x.y2026])); const pad=42, gap=(w-pad*2)/(state.mensal.length-1); [[ 'y2024'],['y2025'],['y2026']].forEach((key,idx)=>{ ctx.beginPath(); state.mensal.forEach((m,i)=>{ const x=pad+i*gap, y=h-pad-(m[key]/max)*(h-pad*2); i?ctx.lineTo(x,y):ctx.moveTo(x,y); }); ctx.lineWidth=5-idx; ctx.stroke(); }); ctx.fillStyle='#64748b'; ctx.font='22px system-ui'; state.mensal.forEach((m,i)=>{if(i%2===0)ctx.fillText(String(m.mes).slice(0,3),pad+i*gap-14,h-10)}); }
function badgeClass(s){ return /queda|perdido/i.test(s)?'red':/crescimento|novo|recuperado/i.test(s)?'green':'amber'; }
function whats(c){ return 'https://wa.me/?text='+encodeURIComponent(`Olá! Notei uma oportunidade de melhorar o volume de compras da ${c.cliente}. Tenho uma condição/mix para reposição e queria entender como podemos ajudar. Podemos conversar?`); }
function exportCSV(){ const rows=[['Cliente','Vendedor','Total_2024','Total_2025','Total_2026','Status','Potencial']].concat(state.clientes.map(c=>[c.cliente,c.vendedor,c.total2024,c.total2025,c.total2026,c.status,c.potencial])); const csv=rows.map(r=>r.map(v=>`"${String(v).replaceAll('"','""')}"`).join(';')).join('\n'); const a=document.createElement('a'); a.href=URL.createObjectURL(new Blob([csv],{type:'text/csv;charset=utf-8'})); a.download='clientes_vendafacil.csv'; a.click(); }
function escapeHtml(s){ return String(s??'').replace(/[&<>"]/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[m])); }
function setupPWA(){ let deferredPrompt; window.addEventListener('beforeinstallprompt', e=>{ e.preventDefault(); deferredPrompt=e; installBtn.classList.remove('hidden'); }); installBtn.onclick=()=>deferredPrompt?.prompt(); if('serviceWorker' in navigator) navigator.serviceWorker.register('service-worker.js'); }
