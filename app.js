// ===== SUPABASE SETUP =====
const SUPABASE_URL = 'https://0ec90b57d6e95fcbda19832f.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJib2x0IiwicmVmIjoiMGVjOTBiNTdkNmU5NWZjYmRhMTk4MzJmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg4ODE1NzQsImV4cCI6MTc1ODg4MTU3NH0.9I8-U0x86Ak8t2DGaIk0HfvTSLsAyzdnz-Nw00mMkKw';
const sb = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// ===== STATE =====
const state = {
  vendedores: [],
  clientes: [],
  pedidos: [],
  funil: [],
  visitas: [],
  metas: [],
  currentScreen: 'dashboard',
  calYear: new Date().getFullYear(),
  calMonth: new Date().getMonth(),
  calSelectedDay: null,
  recDays: 30,
};

// ===== FORMATTERS =====
const BRL = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 });
const BRLd = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });
const fmt = v => BRL.format(Number(v) || 0);
const fmtd = v => BRLd.format(Number(v) || 0);
const pct = v => (Number(v) || 0).toFixed(0) + '%';
const esc = s => String(s ?? '').replace(/[&<>"]/g, m => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[m]));
const today = () => new Date().toISOString().split('T')[0];
const MONTHS = ['Janeiro', 'Fevereiro', 'Marco', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
const MONTHS_SHORT = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];

// ===== TOAST =====
let toastTimer;
function showToast(msg, type) {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.className = 'toast show ' + (type || '');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.remove('show'), 3000);
}

// ===== MODAL =====
function openModal(id) { document.getElementById(id).classList.add('open'); }
function closeModal(id) { document.getElementById(id).classList.remove('open'); }

document.querySelectorAll('.modal-close, [data-modal]').forEach(btn => {
  btn.addEventListener('click', () => {
    const id = btn.dataset.modal || btn.closest('.modal-overlay').id;
    closeModal(id);
  });
});
document.querySelectorAll('.modal-overlay').forEach(overlay => {
  overlay.addEventListener('click', e => { if (e.target === overlay) closeModal(overlay.id); });
});

// ===== NAVIGATION =====
const screenMeta = {
  dashboard: { title: 'Dashboard', subtitle: 'Visao geral do negocio' },
  clientes: { title: 'Gestao de Clientes', subtitle: 'Cadastro e gestao de clientes' },
  recuperacao: { title: 'Recuperacao de Clientes', subtitle: 'Clientes sem compras recentes' },
  funil: { title: 'Funil Comercial', subtitle: 'Pipeline de negociacoes' },
  agenda: { title: 'Agenda de Visitas', subtitle: 'Calendario e check-in de visitas' },
  ranking: { title: 'Ranking de Vendedores', subtitle: 'Performance e metas' },
  ia: { title: 'IA Comercial', subtitle: 'Analise inteligente e plano de acao' },
  pedidos: { title: 'Pedidos', subtitle: 'Registro de faturamento' },
  config: { title: 'Configuracoes', subtitle: 'Vendedores e empresa' },
};

function navigate(screen) {
  document.querySelectorAll('.nav-item').forEach(b => b.classList.toggle('active', b.dataset.screen === screen));
  document.querySelectorAll('.screen').forEach(s => s.classList.toggle('active', s.id === screen));
  const m = screenMeta[screen] || { title: screen, subtitle: '' };
  document.getElementById('pageTitle').textContent = m.title;
  document.getElementById('pageSubtitle').textContent = m.subtitle;
  state.currentScreen = screen;
  renderScreen(screen);
  if (window.innerWidth < 768) closeSidebar();
}

document.querySelectorAll('.nav-item[data-screen]').forEach(btn => {
  btn.addEventListener('click', () => navigate(btn.dataset.screen));
});

// Mobile sidebar
function openSidebar() {
  document.getElementById('sidebar').classList.add('open');
  document.getElementById('sidebarOverlay').classList.add('show');
}
function closeSidebar() {
  document.getElementById('sidebar').classList.remove('open');
  document.getElementById('sidebarOverlay').classList.remove('show');
}

const overlayEl = document.createElement('div');
overlayEl.className = 'sidebar-overlay';
overlayEl.id = 'sidebarOverlay';
overlayEl.addEventListener('click', closeSidebar);
document.body.appendChild(overlayEl);

document.getElementById('menuToggle').addEventListener('click', openSidebar);
document.getElementById('sidebarClose').addEventListener('click', closeSidebar);

document.getElementById('btnNovoRegistro').addEventListener('click', () => {
  const actions = {
    clientes: () => openClienteModal(),
    funil: () => openNegociacaoModal(),
    agenda: () => openVisitaModal(),
    pedidos: () => openPedidoModal(),
    config: () => openVendedorModal(),
  };
  (actions[state.currentScreen] || (() => openClienteModal()))();
});

// ===== LOAD DATA =====
async function loadAll() {
  const [v, c, p, f, vis, m] = await Promise.all([
    sb.from('vendedores').select('*').order('nome'),
    sb.from('clientes').select('*, vendedores(nome)').order('nome'),
    sb.from('pedidos').select('*, clientes(nome), vendedores(nome)').order('data_pedido', { ascending: false }),
    sb.from('funil_negociacoes').select('*, clientes(nome), vendedores(nome)').order('created_at', { ascending: false }),
    sb.from('visitas').select('*, clientes(nome,cidade,estado), vendedores(nome)').order('data_visita'),
    sb.from('metas_vendedores').select('*'),
  ]);
  state.vendedores = v.data || [];
  state.clientes = c.data || [];
  state.pedidos = p.data || [];
  state.funil = f.data || [];
  state.visitas = vis.data || [];
  state.metas = m.data || [];
  populateSelects();
  renderScreen(state.currentScreen);
}

function populateSelects() {
  const vOpts = state.vendedores.map(v => `<option value="${v.id}">${esc(v.nome)}</option>`).join('');
  ['filtroVendedorClientes', 'filtroVendedorFunil', 'filtroPedidoVendedor'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.innerHTML = '<option value="">Todos os vendedores</option>' + vOpts;
  });
  ['clienteVendedor', 'negociacaoVendedor', 'visitaVendedor'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.innerHTML = '<option value="">Selecionar...</option>' + vOpts;
  });
  const cOpts = state.clientes.map(c => `<option value="${c.id}">${esc(c.nome)}</option>`).join('');
  ['negociacaoCliente', 'visitaCliente', 'pedidoCliente'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.innerHTML = '<option value="">Selecionar...</option>' + cOpts;
  });
}

function renderScreen(s) {
  if (s === 'dashboard') renderDashboard();
  else if (s === 'clientes') renderClientes();
  else if (s === 'recuperacao') renderRecuperacao();
  else if (s === 'funil') renderFunil();
  else if (s === 'agenda') renderAgenda();
  else if (s === 'ranking') renderRanking();
  else if (s === 'pedidos') renderPedidos();
  else if (s === 'config') renderConfig();
}

// ===== HELPERS =====
function lastPedido(cliId) {
  return state.pedidos.filter(p => p.cliente_id === cliId).sort((a, b) => new Date(b.data_pedido) - new Date(a.data_pedido))[0] || null;
}
function daysSince(dateStr) {
  if (!dateStr) return 9999;
  return Math.floor((Date.now() - new Date(dateStr)) / 86400000);
}
function riskScore(days) {
  if (days < 30) return { label: 'Verde', cls: 'score-green' };
  if (days < 60) return { label: 'Amarelo', cls: 'score-amber' };
  return { label: 'Vermelho', cls: 'score-red' };
}
function getMeta(vendedorId, mes, ano) {
  const m = state.metas.find(x => x.vendedor_id === vendedorId && x.mes === mes && x.ano === ano);
  return m ? Number(m.meta_valor) : 0;
}
function currentMes() { return new Date().getMonth() + 1; }
function currentAno() { return new Date().getFullYear(); }
function fatMes(mes, ano) {
  return state.pedidos.filter(p => p.mes === mes && p.ano === ano).reduce((s, p) => s + Number(p.valor), 0);
}
function pedidosMes(mes, ano) {
  return state.pedidos.filter(p => p.mes === mes && p.ano === ano);
}

// ===== DASHBOARD =====
function renderDashboard() {
  const mes = currentMes(), ano = currentAno();
  const prevMes = mes === 1 ? 12 : mes - 1;
  const prevAno = mes === 1 ? ano - 1 : ano;
  const fat = fatMes(mes, ano);
  const fatPrev = fatMes(prevMes, prevAno);
  const totalMeta = state.vendedores.reduce((s, v) => s + (getMeta(v.id, mes, ano) || Number(v.meta_mensal) || 0), 0);
  const metaPct = totalMeta > 0 ? (fat / totalMeta) * 100 : 0;
  const ativos = state.clientes.filter(c => { const lp = lastPedido(c.id); return lp && daysSince(lp.data_pedido) < 90; }).length;
  const inativos = state.clientes.filter(c => { const lp = lastPedido(c.id); return !lp || daysSince(lp.data_pedido) >= 90; }).length;
  const pedMes = pedidosMes(mes, ano);
  const ticket = pedMes.length ? fat / pedMes.length : 0;
  const crescPct = fatPrev > 0 ? ((fat - fatPrev) / fatPrev) * 100 : 0;

  document.getElementById('kpiFatMes').textContent = fmt(fat);
  document.getElementById('kpiFatMesDiff').innerHTML = fatPrev > 0 ? `<span class="${crescPct >= 0 ? 'positive' : 'negative'}">${crescPct >= 0 ? '+' : ''}${crescPct.toFixed(1)}% vs mes ant.</span>` : '';
  document.getElementById('kpiMetaReal').textContent = pct(metaPct);
  document.getElementById('kpiMetaDiff').innerHTML = `<span class="neutral">${totalMeta > 0 ? fmt(Math.max(0, totalMeta - fat)) + ' restante' : 'Meta nao definida'}</span>`;
  document.getElementById('kpiAtivos').textContent = ativos;
  document.getElementById('kpiAtivosDiff').innerHTML = `<span class="neutral">${state.clientes.length} cadastrados</span>`;
  document.getElementById('kpiInativos').textContent = inativos;
  document.getElementById('kpiInativosDiff').innerHTML = inativos > 0 ? `<span class="negative">Requerem atencao</span>` : '';
  document.getElementById('kpiTicket').textContent = fmt(ticket);
  document.getElementById('kpiTicketDiff').innerHTML = `<span class="neutral">${pedMes.length} pedidos</span>`;
  document.getElementById('kpiCrescimento').textContent = (crescPct >= 0 ? '+' : '') + crescPct.toFixed(1) + '%';
  document.getElementById('kpiCrescimentoDiff').innerHTML = `<span class="${crescPct >= 0 ? 'positive' : 'negative'}">${MONTHS_SHORT[prevMes - 1]}: ${fmt(fatPrev)}</span>`;

  drawFaturamentoChart();
  renderMetaVendedores(mes, ano);
  renderTopClientes(mes, ano);
  renderAlertasRisco();
  renderVisitasSemana();
}

function drawFaturamentoChart() {
  const canvas = document.getElementById('chartFaturamento');
  if (!canvas) return;
  const dpr = window.devicePixelRatio || 1;
  const W = canvas.clientWidth || 400;
  const H = 220;
  canvas.width = W * dpr;
  canvas.height = H * dpr;
  canvas.style.height = H + 'px';
  const ctx = canvas.getContext('2d');
  ctx.scale(dpr, dpr);
  const ano = currentAno();
  const monthlyData = [];
  for (let m = 1; m <= 12; m++) {
    monthlyData.push(state.pedidos.filter(p => p.mes === m && p.ano === ano).reduce((s, p) => s + Number(p.valor), 0));
  }
  const max = Math.max(...monthlyData, 1);
  const padL = 60, padR = 16, padT = 16, padB = 40;
  const w = W - padL - padR;
  const h = H - padT - padB;
  const barW = Math.max(6, (w / 12) - 6);
  ctx.clearRect(0, 0, W, H);

  for (let i = 0; i <= 4; i++) {
    const y = padT + (h / 4) * i;
    ctx.strokeStyle = '#e2e8f0'; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(padL, y); ctx.lineTo(W - padR, y); ctx.stroke();
    ctx.fillStyle = '#94a3b8'; ctx.font = '500 10px Inter, system-ui'; ctx.textAlign = 'right';
    ctx.fillText(fmt(max * (4 - i) / 4), padL - 6, y + 4);
  }

  const curMes = currentMes();
  monthlyData.forEach((val, i) => {
    const x = padL + (w / 12) * i + ((w / 12) - barW) / 2;
    const barH = val > 0 ? (val / max) * h : 0;
    const y = padT + h - barH;
    ctx.fillStyle = (i + 1) <= curMes ? '#2563eb' : '#bfdbfe';
    const r = 3;
    ctx.beginPath();
    if (barH > r * 2) {
      ctx.moveTo(x + r, y); ctx.lineTo(x + barW - r, y);
      ctx.quadraticCurveTo(x + barW, y, x + barW, y + r);
      ctx.lineTo(x + barW, y + barH); ctx.lineTo(x, y + barH);
      ctx.lineTo(x, y + r); ctx.quadraticCurveTo(x, y, x + r, y);
    } else {
      ctx.rect(x, y, barW, Math.max(barH, 2));
    }
    ctx.fill();
    ctx.fillStyle = '#475569'; ctx.font = '600 9px Inter, system-ui'; ctx.textAlign = 'center';
    ctx.fillText(MONTHS_SHORT[i], x + barW / 2, H - padB + 16);
  });
}

function renderMetaVendedores(mes, ano) {
  const el = document.getElementById('metaVendedores');
  const rows = state.vendedores.map(v => {
    const fat = state.pedidos.filter(p => p.vendedor_id === v.id && p.mes === mes && p.ano === ano).reduce((s, p) => s + Number(p.valor), 0);
    const meta = getMeta(v.id, mes, ano) || Number(v.meta_mensal) || 1;
    const pp = Math.min((fat / meta) * 100, 100);
    const color = pp >= 100 ? '#16a34a' : pp >= 70 ? '#d97706' : '#dc2626';
    return { nome: v.nome, fat, meta, pp, color };
  }).sort((a, b) => b.fat - a.fat);

  el.innerHTML = rows.map(r => `
    <div class="meta-item">
      <div class="meta-item-top"><span>${esc(r.nome)}</span><strong style="color:${r.color}">${pct(r.pp)}</strong></div>
      <div class="meta-bar-bg"><div class="meta-bar-fill" style="width:${r.pp}%;background:${r.color}"></div></div>
      <div class="meta-pct">${fmt(r.fat)} / ${fmt(r.meta)}</div>
    </div>`).join('') || '<div class="empty"><p>Nenhum dado</p></div>';
}

function renderTopClientes(mes, ano) {
  const el = document.getElementById('topClientes');
  const byCliente = {};
  pedidosMes(mes, ano).forEach(p => { byCliente[p.cliente_id] = (byCliente[p.cliente_id] || 0) + Number(p.valor); });
  const top = Object.entries(byCliente).sort((a, b) => b[1] - a[1]).slice(0, 6);
  const nums = ['gold', 'silver', 'bronze', '', '', ''];
  el.innerHTML = top.map(([id, val], i) => {
    const c = state.clientes.find(x => x.id === id);
    return `<div class="rank-item">
      <div class="rank-num ${nums[i] || ''}">${i + 1}</div>
      <div class="rank-info"><strong>${esc(c ? c.nome : '?')}</strong><span>${esc(c ? c.cidade : '')}</span></div>
      <div class="rank-value">${fmt(val)}</div>
    </div>`;
  }).join('') || '<div class="empty"><p>Sem pedidos no periodo</p></div>';
}

function renderAlertasRisco() {
  const el = document.getElementById('alertasRisco');
  const items = state.clientes.map(c => {
    const lp = lastPedido(c.id);
    return { c, days: daysSince(lp ? lp.data_pedido : null) };
  }).filter(x => x.days >= 30).sort((a, b) => b.days - a.days).slice(0, 6);

  el.innerHTML = items.map(({ c, days }) => {
    const score = riskScore(days);
    const cls = score.cls === 'score-red' ? 'red' : score.cls === 'score-amber' ? 'amber' : 'green';
    return `<div class="alert-item">
      <div class="alert-dot ${cls}"></div>
      <div class="alert-info"><strong>${esc(c.nome)}</strong><span>${esc(c.vendedores ? c.vendedores.nome : '-')}</span></div>
      <span class="alert-badge ${cls}">${days === 9999 ? 'Nunca comprou' : days + ' dias'}</span>
    </div>`;
  }).join('') || '<div class="empty"><p>Todos os clientes ativos</p></div>';
}

function renderVisitasSemana() {
  const el = document.getElementById('visitasSemana');
  const t = today();
  const upcoming = state.visitas.filter(v => v.data_visita >= t).sort((a, b) => a.data_visita.localeCompare(b.data_visita)).slice(0, 5);
  el.innerHTML = upcoming.map(v => {
    const d = new Date(v.data_visita + 'T00:00:00');
    const label = v.data_visita === t ? 'Hoje' : d.getDate() + '/' + (d.getMonth() + 1);
    return `<div class="visit-item">
      <span class="visit-time">${label} ${String(v.hora_visita || '').slice(0, 5)}</span>
      <div class="visit-info">
        <strong>${esc(v.clientes ? v.clientes.nome : '?')}</strong>
        <span>${esc(v.vendedores ? v.vendedores.nome : '-')}</span>
      </div>
    </div>`;
  }).join('') || '<div class="empty"><p>Nenhuma visita agendada</p></div>';
}

// ===== CLIENTES =====
function renderClientes() {
  const filtro = (document.getElementById('filtroClientes').value || '').toLowerCase();
  const vend = document.getElementById('filtroVendedorClientes').value || '';
  const seg = document.getElementById('filtroSegmento').value || '';
  const arr = state.clientes.filter(c => {
    return (c.nome + c.cidade + c.segmento + c.estado).toLowerCase().includes(filtro)
      && (!vend || c.vendedor_id === vend)
      && (!seg || c.segmento === seg);
  });
  document.getElementById('tbodyClientes').innerHTML = arr.map(c => {
    const lp = lastPedido(c.id);
    const days = daysSince(lp ? lp.data_pedido : null);
    const score = riskScore(days);
    const lpDate = lp ? new Date(lp.data_pedido + 'T00:00:00').toLocaleDateString('pt-BR') : 'Nunca';
    const waHref = c.whatsapp ? 'https://wa.me/55' + c.whatsapp.replace(/\D/g, '') + '?text=' + encodeURIComponent('Ola ' + c.nome + '! Temos novidades para voce.') : null;
    return `<tr>
      <td><strong>${esc(c.nome)}</strong><br><small style="color:#94a3b8">${esc(c.cnpj || '')}</small></td>
      <td>${esc(c.cidade)}${c.estado ? ', ' + esc(c.estado) : ''}</td>
      <td><span class="badge badge-slate">${esc(c.segmento)}</span></td>
      <td>${esc(c.vendedores ? c.vendedores.nome : '-')}</td>
      <td>${c.whatsapp ? `<a href="${waHref}" target="_blank" style="color:#16a34a;font-weight:700">${esc(c.whatsapp)}</a>` : '-'}</td>
      <td>${lpDate}</td>
      <td><span class="score ${score.cls}">${score.label}</span></td>
      <td class="td-actions">
        <button class="action-btn edit" onclick="openClienteModal('${c.id}')">Editar</button>
        <button class="action-btn delete" onclick="deleteCliente('${c.id}')">Excluir</button>
        ${waHref ? `<a href="${waHref}" target="_blank"><button class="action-btn whats">WA</button></a>` : ''}
      </td>
    </tr>`;
  }).join('') || `<tr><td colspan="8"><div class="empty"><p>Nenhum cliente encontrado</p></div></td></tr>`;
}

document.getElementById('filtroClientes').addEventListener('input', renderClientes);
document.getElementById('filtroVendedorClientes').addEventListener('change', renderClientes);
document.getElementById('filtroSegmento').addEventListener('change', renderClientes);
document.getElementById('btnAddCliente').addEventListener('click', () => openClienteModal());

function openClienteModal(id) {
  const c = id ? state.clientes.find(x => x.id === id) : null;
  document.getElementById('modalClienteTitle').textContent = c ? 'Editar Cliente' : 'Novo Cliente';
  document.getElementById('clienteId').value = c ? c.id : '';
  document.getElementById('clienteNome').value = c ? c.nome : '';
  document.getElementById('clienteCnpj').value = c ? c.cnpj : '';
  document.getElementById('clienteCidade').value = c ? c.cidade : '';
  document.getElementById('clienteEstado').value = c ? c.estado : '';
  document.getElementById('clienteSegmento').value = c ? c.segmento : 'Varejo';
  document.getElementById('clienteVendedor').value = c ? (c.vendedor_id || '') : '';
  document.getElementById('clienteTelefone').value = c ? c.telefone : '';
  document.getElementById('clienteWhatsapp').value = c ? c.whatsapp : '';
  document.getElementById('clienteEmail').value = c ? c.email : '';
  openModal('modalCliente');
}

document.getElementById('btnSalvarCliente').addEventListener('click', async () => {
  const nome = document.getElementById('clienteNome').value.trim();
  if (!nome) return showToast('Nome e obrigatorio', 'error');
  const id = document.getElementById('clienteId').value;
  const data = {
    nome, cnpj: document.getElementById('clienteCnpj').value,
    cidade: document.getElementById('clienteCidade').value,
    estado: document.getElementById('clienteEstado').value.toUpperCase(),
    segmento: document.getElementById('clienteSegmento').value,
    vendedor_id: document.getElementById('clienteVendedor').value || null,
    telefone: document.getElementById('clienteTelefone').value,
    whatsapp: document.getElementById('clienteWhatsapp').value,
    email: document.getElementById('clienteEmail').value,
    updated_at: new Date().toISOString(),
  };
  const { error } = id ? await sb.from('clientes').update(data).eq('id', id) : await sb.from('clientes').insert(data);
  if (error) return showToast('Erro ao salvar: ' + error.message, 'error');
  showToast(id ? 'Cliente atualizado!' : 'Cliente cadastrado!', 'success');
  closeModal('modalCliente');
  await loadAll();
});

window.deleteCliente = async function(id) {
  if (!confirm('Excluir este cliente? Os pedidos associados tambem serao removidos.')) return;
  const { error } = await sb.from('clientes').delete().eq('id', id);
  if (error) return showToast('Erro: ' + error.message, 'error');
  showToast('Cliente excluido', 'success');
  await loadAll();
};

// ===== RECUPERACAO =====
function renderRecuperacao() {
  const days = state.recDays;
  const rows = [];
  state.clientes.forEach(c => {
    const lp = lastPedido(c.id);
    const d = daysSince(lp ? lp.data_pedido : null);
    if (d >= days) {
      const fat12m = state.pedidos.filter(p => p.cliente_id === c.id && daysSince(p.data_pedido) <= 365).reduce((s, p) => s + Number(p.valor), 0);
      rows.push({ c, d, lp, fat12m });
    }
  });
  rows.sort((a, b) => b.d - a.d);

  const altaPerda = rows.filter(r => r.d >= 90).length;
  const potencial = rows.reduce((s, r) => s + r.fat12m / 12, 0);
  document.getElementById('recSummary').innerHTML = `
    <div class="rec-stat"><span>Clientes em risco</span><strong style="color:#dc2626">${rows.length}</strong></div>
    <div class="rec-stat"><span>Risco alto (90d+)</span><strong style="color:#d97706">${altaPerda}</strong></div>
    <div class="rec-stat"><span>Potencial/mes</span><strong style="color:#16a34a">${fmt(potencial)}</strong></div>`;

  document.getElementById('tbodyRecuperacao').innerHTML = rows.map(({ c, d, lp, fat12m }) => {
    const score = riskScore(d);
    const lpDate = lp ? new Date(lp.data_pedido + 'T00:00:00').toLocaleDateString('pt-BR') : 'Nunca';
    const wa = c.whatsapp ? 'https://wa.me/55' + c.whatsapp.replace(/\D/g, '') + '?text=' + encodeURIComponent('Ola ' + c.nome + '! Faz um tempo que nao nos falamos. Temos condicoes especiais de reposicao. Podemos conversar?') : null;
    return `<tr>
      <td><strong>${esc(c.nome)}</strong></td>
      <td>${esc(c.vendedores ? c.vendedores.nome : '-')}</td>
      <td>${esc(c.cidade)}${c.estado ? ', ' + esc(c.estado) : ''}</td>
      <td><strong>${d === 9999 ? 'Nunca' : d}</strong> dias</td>
      <td>${lpDate}</td>
      <td>${fmt(fat12m)}</td>
      <td><span class="score ${score.cls}">${score.label}</span></td>
      <td class="td-actions">
        ${wa ? `<a href="${wa}" target="_blank"><button class="action-btn whats">WhatsApp</button></a>` : ''}
        <button class="action-btn edit" onclick="openClienteModal('${c.id}')">Ver</button>
      </td>
    </tr>`;
  }).join('') || `<tr><td colspan="8"><div class="empty"><p>Nenhum cliente sem compras ha ${days} dias</p></div></td></tr>`;
}

document.querySelectorAll('.rec-tab').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.rec-tab').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    state.recDays = parseInt(btn.dataset.days);
    renderRecuperacao();
  });
});

// ===== FUNIL =====
const etapas = ['prospeccao', 'primeiro_contato', 'negociacao', 'proposta', 'fechamento'];
const etapaLabels = { prospeccao: 'Prospeccao', primeiro_contato: 'Primeiro Contato', negociacao: 'Negociacao', proposta: 'Proposta', fechamento: 'Fechamento' };

function renderFunil() {
  const vendFiltro = document.getElementById('filtroVendedorFunil').value || '';
  const filtered = state.funil.filter(n => !vendFiltro || n.vendedor_id === vendFiltro);
  const totalVal = filtered.reduce((s, n) => s + Number(n.valor_estimado), 0);
  const countByEtapa = {};
  etapas.forEach(e => { countByEtapa[e] = filtered.filter(n => n.etapa === e).length; });
  document.getElementById('funilStats').innerHTML = [
    { label: 'Total em negociacao', val: filtered.length + ' deals' },
    { label: 'Valor total do pipeline', val: fmt(totalVal) },
    { label: 'Em proposta', val: countByEtapa['proposta'] + ' deals' },
    { label: 'Pronto para fechar', val: countByEtapa['fechamento'] + ' deals' },
  ].map(s => `<div class="funil-stat"><span>${s.label}</span><strong>${s.val}</strong></div>`).join('');

  etapas.forEach(etapa => {
    const col = document.getElementById('col-' + etapa);
    const cnt = document.getElementById('cnt-' + etapa);
    const items = filtered.filter(n => n.etapa === etapa);
    cnt.textContent = items.length;
    col.innerHTML = items.map(n => {
      const dateStr = n.data_prevista ? new Date(n.data_prevista + 'T00:00:00').toLocaleDateString('pt-BR') : '';
      return `<div class="kanban-card" onclick="openNegociacaoModal('${n.id}')">
        <div class="kanban-card-title">${esc(n.clientes ? n.clientes.nome : '?')}</div>
        <div class="kanban-card-sub">${esc(n.vendedores ? n.vendedores.nome : '-')}</div>
        ${n.observacoes ? `<div style="font-size:11px;color:#64748b;margin-bottom:8px;line-height:1.4">${esc(n.observacoes.length > 60 ? n.observacoes.slice(0, 60) + '...' : n.observacoes)}</div>` : ''}
        <div class="kanban-card-footer">
          <span class="kanban-card-val">${Number(n.valor_estimado) > 0 ? fmt(n.valor_estimado) : '-'}</span>
          <span class="kanban-card-date">${dateStr}</span>
        </div>
        ${n.proxima_acao ? `<div style="font-size:11px;color:#2563eb;margin-top:6px;font-weight:600">${esc(n.proxima_acao)}</div>` : ''}
      </div>`;
    }).join('') || '<div style="padding:8px;font-size:12px;color:#94a3b8;text-align:center">Vazio</div>';
  });
}

document.getElementById('filtroVendedorFunil').addEventListener('change', renderFunil);
document.getElementById('btnAddNegociacao').addEventListener('click', () => openNegociacaoModal());

window.openNegociacaoModal = function(id) {
  const n = id ? state.funil.find(x => x.id === id) : null;
  document.getElementById('modalNegociacaoTitle').textContent = n ? 'Editar Negociacao' : 'Nova Negociacao';
  document.getElementById('negociacaoId').value = n ? n.id : '';
  document.getElementById('negociacaoCliente').value = n ? n.cliente_id : '';
  document.getElementById('negociacaoVendedor').value = n ? (n.vendedor_id || '') : '';
  document.getElementById('negociacaoEtapa').value = n ? n.etapa : 'prospeccao';
  document.getElementById('negociacaoValor').value = n ? n.valor_estimado : '';
  document.getElementById('negociacaoObs').value = n ? n.observacoes : '';
  document.getElementById('negociacaoProxima').value = n ? n.proxima_acao : '';
  document.getElementById('negociacaoData').value = n ? (n.data_prevista || '') : '';
  openModal('modalNegociacao');
};

document.getElementById('btnSalvarNegociacao').addEventListener('click', async () => {
  const cli = document.getElementById('negociacaoCliente').value;
  if (!cli) return showToast('Selecione um cliente', 'error');
  const id = document.getElementById('negociacaoId').value;
  const data = {
    cliente_id: cli,
    vendedor_id: document.getElementById('negociacaoVendedor').value || null,
    etapa: document.getElementById('negociacaoEtapa').value,
    valor_estimado: Number(document.getElementById('negociacaoValor').value) || 0,
    observacoes: document.getElementById('negociacaoObs').value,
    proxima_acao: document.getElementById('negociacaoProxima').value,
    data_prevista: document.getElementById('negociacaoData').value || null,
    updated_at: new Date().toISOString(),
  };
  const { error } = id ? await sb.from('funil_negociacoes').update(data).eq('id', id) : await sb.from('funil_negociacoes').insert(data);
  if (error) return showToast('Erro: ' + error.message, 'error');
  showToast('Negociacao salva!', 'success');
  closeModal('modalNegociacao');
  await loadAll();
});

// ===== AGENDA =====
function renderAgenda() {
  renderCalendar();
  renderAgendaDay(state.calSelectedDay || today());
  renderProximasVisitas();
}

function renderCalendar() {
  const year = state.calYear, month = state.calMonth;
  document.getElementById('mesAno').textContent = MONTHS[month] + ' ' + year;
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysInPrev = new Date(year, month, 0).getDate();
  const today_str = today();

  const visitasByDate = {};
  state.visitas.forEach(v => {
    if (!visitasByDate[v.data_visita]) visitasByDate[v.data_visita] = [];
    visitasByDate[v.data_visita].push(v);
  });

  let html = `<div class="cal-weekdays">${['Dom','Seg','Ter','Qua','Qui','Sex','Sab'].map(d => `<div class="cal-weekday">${d}</div>`).join('')}</div><div class="cal-days">`;

  for (let i = 0; i < firstDay; i++) {
    html += `<div class="cal-day other-month"><div class="cal-day-num">${daysInPrev - firstDay + i + 1}</div></div>`;
  }
  for (let d = 1; d <= daysInMonth; d++) {
    const dateStr = year + '-' + String(month + 1).padStart(2, '0') + '-' + String(d).padStart(2, '0');
    const isToday = dateStr === today_str;
    const isSel = dateStr === state.calSelectedDay;
    const visits = visitasByDate[dateStr] || [];
    const dots = visits.map(v => `<div class="cal-dot ${v.checkin_realizado ? 'done' : ''}"></div>`).join('');
    html += `<div class="cal-day ${isToday ? 'today' : ''} ${isSel ? 'selected' : ''}" onclick="selectCalDay('${dateStr}')">
      <div class="cal-day-num">${d}</div>
      <div class="cal-day-dots">${dots}</div>
    </div>`;
  }
  const totalCells = firstDay + daysInMonth;
  const rem = Math.ceil(totalCells / 7) * 7 - totalCells;
  for (let d = 1; d <= rem; d++) {
    html += `<div class="cal-day other-month"><div class="cal-day-num">${d}</div></div>`;
  }
  html += '</div>';
  document.getElementById('calGrid').innerHTML = html;
}

window.selectCalDay = function(dateStr) {
  state.calSelectedDay = dateStr;
  renderCalendar();
  renderAgendaDay(dateStr);
};

function renderAgendaDay(dateStr) {
  const d = new Date(dateStr + 'T00:00:00');
  document.getElementById('agendaDayTitle').textContent = dateStr === today() ? 'Visitas de Hoje' : 'Visitas em ' + d.getDate() + '/' + (d.getMonth() + 1);
  const dayVisitas = state.visitas.filter(v => v.data_visita === dateStr).sort((a, b) => (a.hora_visita || '').localeCompare(b.hora_visita || ''));
  document.getElementById('agendaDayList').innerHTML = dayVisitas.map(v => visitaCard(v)).join('') || '<div class="empty"><p>Nenhuma visita neste dia</p></div>';
}

function renderProximasVisitas() {
  const t = today();
  const upcoming = state.visitas.filter(v => v.data_visita >= t).sort((a, b) => a.data_visita.localeCompare(b.data_visita)).slice(0, 8);
  document.getElementById('proximasVisitas').innerHTML = upcoming.map(v => visitaCard(v)).join('') || '<div class="empty"><p>Nenhuma visita agendada</p></div>';
}

function visitaCard(v) {
  const d = new Date(v.data_visita + 'T00:00:00');
  const label = d.getDate() + '/' + (d.getMonth() + 1) + ' ' + String(v.hora_visita || '').slice(0, 5);
  return `<div class="visit-item">
    <span class="visit-time">${label}</span>
    <div class="visit-info">
      <strong>${esc(v.clientes ? v.clientes.nome : '?')} <span class="checkin-badge ${v.checkin_realizado ? 'done' : 'pending'}">${v.checkin_realizado ? 'Check-in OK' : 'Pendente'}</span></strong>
      <span>${esc(v.vendedores ? v.vendedores.nome : '-')}${v.clientes && v.clientes.cidade ? ' &bull; ' + esc(v.clientes.cidade) : ''}</span>
    </div>
    <button class="action-btn edit" onclick="openVisitaModal('${v.id}')" style="flex-shrink:0">Editar</button>
  </div>`;
}

document.getElementById('prevMes').addEventListener('click', () => {
  state.calMonth--; if (state.calMonth < 0) { state.calMonth = 11; state.calYear--; }
  renderCalendar();
});
document.getElementById('nextMes').addEventListener('click', () => {
  state.calMonth++; if (state.calMonth > 11) { state.calMonth = 0; state.calYear++; }
  renderCalendar();
});
document.getElementById('btnAddVisita').addEventListener('click', () => openVisitaModal());

window.openVisitaModal = function(id) {
  const v = id ? state.visitas.find(x => x.id === id) : null;
  document.getElementById('modalVisitaTitle').textContent = v ? 'Editar Visita' : 'Agendar Visita';
  document.getElementById('visitaId').value = v ? v.id : '';
  document.getElementById('visitaCliente').value = v ? v.cliente_id : '';
  document.getElementById('visitaVendedor').value = v ? (v.vendedor_id || '') : '';
  document.getElementById('visitaData').value = v ? v.data_visita : (state.calSelectedDay || today());
  document.getElementById('visitaHora').value = v ? String(v.hora_visita || '09:00').slice(0, 5) : '09:00';
  document.getElementById('visitaObs').value = v ? v.observacoes : '';
  document.getElementById('visitaProxima').value = v ? v.proxima_acao : '';
  document.getElementById('visitaCheckin').checked = v ? !!v.checkin_realizado : false;
  openModal('modalVisita');
};

document.getElementById('btnSalvarVisita').addEventListener('click', async () => {
  const cli = document.getElementById('visitaCliente').value;
  if (!cli) return showToast('Selecione um cliente', 'error');
  const id = document.getElementById('visitaId').value;
  const data = {
    cliente_id: cli,
    vendedor_id: document.getElementById('visitaVendedor').value || null,
    data_visita: document.getElementById('visitaData').value,
    hora_visita: document.getElementById('visitaHora').value,
    observacoes: document.getElementById('visitaObs').value,
    proxima_acao: document.getElementById('visitaProxima').value,
    checkin_realizado: document.getElementById('visitaCheckin').checked,
  };
  const { error } = id ? await sb.from('visitas').update(data).eq('id', id) : await sb.from('visitas').insert(data);
  if (error) return showToast('Erro: ' + error.message, 'error');
  showToast('Visita salva!', 'success');
  closeModal('modalVisita');
  await loadAll();
});

// ===== RANKING =====
function renderRanking() {
  const mes = parseInt(document.getElementById('rankingMes').value);
  const ano = currentAno();
  const rankData = state.vendedores.map(v => {
    const peds = state.pedidos.filter(p => p.vendedor_id === v.id && p.mes === mes && p.ano === ano);
    const fat = peds.reduce((s, p) => s + Number(p.valor), 0);
    const meta = getMeta(v.id, mes, ano) || Number(v.meta_mensal) || 0;
    const clientesAtivos = new Set(peds.map(p => p.cliente_id)).size;
    const ticket = peds.length > 0 ? fat / peds.length : 0;
    const metaPct = meta > 0 ? (fat / meta) * 100 : 0;
    return { v, fat, meta, metaPct, clientesAtivos, ticket };
  }).sort((a, b) => b.fat - a.fat);

  const top3 = rankData.slice(0, 3);
  const ordem = [1, 0, 2];
  const classes = ['second', 'first', 'third'];
  const medals = ['🥈', '🥇', '🥉'];
  document.getElementById('podium').innerHTML = ordem.map((idx, pos) => {
    const r = top3[idx];
    if (!r) return '';
    return `<div class="podium-item">
      <div class="podium-name">${esc(r.v.nome)}</div>
      <div class="podium-stand ${classes[pos]}">
        <div class="podium-medal">${medals[pos]}</div>
        <div class="podium-val">${fmt(r.fat)}</div>
      </div>
    </div>`;
  }).join('');

  document.getElementById('tbodyRanking').innerHTML = rankData.map((r, i) => {
    const color = r.metaPct >= 100 ? '#16a34a' : r.metaPct >= 70 ? '#d97706' : '#dc2626';
    return `<tr>
      <td><strong>${i + 1}</strong></td>
      <td><strong>${esc(r.v.nome)}</strong></td>
      <td>${fmt(r.fat)}</td>
      <td>${fmt(r.meta)}</td>
      <td><span style="font-weight:800;color:${color}">${pct(r.metaPct)}</span></td>
      <td>${r.clientesAtivos}</td>
      <td>${fmt(r.ticket)}</td>
    </tr>`;
  }).join('');
}

document.getElementById('rankingMes').addEventListener('change', renderRanking);

// ===== PEDIDOS =====
function renderPedidos() {
  const mes = document.getElementById('filtroPedidoMes').value;
  const vend = document.getElementById('filtroPedidoVendedor').value;
  const arr = state.pedidos.filter(p => (!mes || p.mes === parseInt(mes)) && (!vend || p.vendedor_id === vend));
  document.getElementById('tbodyPedidos').innerHTML = arr.map(p => {
    const d = new Date(p.data_pedido + 'T00:00:00').toLocaleDateString('pt-BR');
    return `<tr>
      <td>${d}</td>
      <td>${esc(p.clientes ? p.clientes.nome : '-')}</td>
      <td>${esc(p.vendedores ? p.vendedores.nome : '-')}</td>
      <td><strong>${fmtd(p.valor)}</strong></td>
      <td>${esc(p.descricao || '-')}</td>
      <td class="td-actions"><button class="action-btn delete" onclick="deletePedido('${p.id}')">Excluir</button></td>
    </tr>`;
  }).join('') || `<tr><td colspan="6"><div class="empty"><p>Nenhum pedido encontrado</p></div></td></tr>`;
}

document.getElementById('filtroPedidoMes').addEventListener('change', renderPedidos);
document.getElementById('filtroPedidoVendedor').addEventListener('change', renderPedidos);
document.getElementById('btnAddPedido').addEventListener('click', () => openPedidoModal());

function openPedidoModal() {
  document.getElementById('pedidoId').value = '';
  document.getElementById('pedidoCliente').value = '';
  document.getElementById('pedidoValor').value = '';
  document.getElementById('pedidoData').value = today();
  document.getElementById('pedidoDesc').value = '';
  openModal('modalPedido');
}

document.getElementById('btnSalvarPedido').addEventListener('click', async () => {
  const cli = document.getElementById('pedidoCliente').value;
  const val = Number(document.getElementById('pedidoValor').value);
  if (!cli) return showToast('Selecione um cliente', 'error');
  if (!val || val <= 0) return showToast('Valor deve ser maior que zero', 'error');
  const dt = document.getElementById('pedidoData').value || today();
  const d = new Date(dt + 'T00:00:00');
  const c = state.clientes.find(x => x.id === cli);
  const { error } = await sb.from('pedidos').insert({
    cliente_id: cli, vendedor_id: c ? c.vendedor_id : null,
    valor: val, data_pedido: dt,
    mes: d.getMonth() + 1, ano: d.getFullYear(),
    descricao: document.getElementById('pedidoDesc').value,
  });
  if (error) return showToast('Erro: ' + error.message, 'error');
  showToast('Pedido registrado!', 'success');
  closeModal('modalPedido');
  await loadAll();
});

window.deletePedido = async function(id) {
  if (!confirm('Excluir este pedido?')) return;
  await sb.from('pedidos').delete().eq('id', id);
  showToast('Pedido excluido', 'success');
  await loadAll();
};

// ===== CONFIG =====
function renderConfig() {
  document.getElementById('vendedoresList').innerHTML = state.vendedores.map(v => `
    <div class="vendedor-row">
      <div class="vendedor-avatar">${v.nome.substring(0, 2).toUpperCase()}</div>
      <div class="vendedor-info">
        <strong>${esc(v.nome)}</strong>
        <span>${esc(v.email || '')}${v.telefone ? ' &bull; ' + esc(v.telefone) : ''}</span>
      </div>
      <span class="vendedor-meta">Meta: ${fmt(v.meta_mensal)}</span>
      <button class="action-btn edit" onclick="openVendedorModal('${v.id}')">Editar</button>
      <button class="action-btn delete" onclick="deleteVendedor('${v.id}')">Excluir</button>
    </div>`).join('') || '<div class="empty"><p>Nenhum vendedor cadastrado</p></div>';
}

document.getElementById('btnAddVendedor').addEventListener('click', () => openVendedorModal());

window.openVendedorModal = function(id) {
  const v = id ? state.vendedores.find(x => x.id === id) : null;
  document.getElementById('modalVendedorTitle').textContent = v ? 'Editar Vendedor' : 'Novo Vendedor';
  document.getElementById('vendedorId').value = v ? v.id : '';
  document.getElementById('vendedorNome').value = v ? v.nome : '';
  document.getElementById('vendedorEmail').value = v ? (v.email || '') : '';
  document.getElementById('vendedorTel').value = v ? (v.telefone || '') : '';
  document.getElementById('vendedorMeta').value = v ? v.meta_mensal : '';
  openModal('modalVendedor');
};

document.getElementById('btnSalvarVendedor').addEventListener('click', async () => {
  const nome = document.getElementById('vendedorNome').value.trim();
  if (!nome) return showToast('Nome e obrigatorio', 'error');
  const id = document.getElementById('vendedorId').value;
  const data = {
    nome, email: document.getElementById('vendedorEmail').value,
    telefone: document.getElementById('vendedorTel').value,
    meta_mensal: Number(document.getElementById('vendedorMeta').value) || 0,
  };
  const { error } = id ? await sb.from('vendedores').update(data).eq('id', id) : await sb.from('vendedores').insert(data);
  if (error) return showToast('Erro: ' + error.message, 'error');
  showToast('Vendedor salvo!', 'success');
  closeModal('modalVendedor');
  await loadAll();
});

window.deleteVendedor = async function(id) {
  if (!confirm('Excluir este vendedor?')) return;
  await sb.from('vendedores').delete().eq('id', id);
  showToast('Vendedor excluido', 'success');
  await loadAll();
};

// ===== IA COMERCIAL =====
document.getElementById('btnGerarIA').addEventListener('click', gerarAnaliseIA);

function gerarAnaliseIA() {
  const container = document.getElementById('iaContent');
  container.innerHTML = `<div class="loading-pulse">
    <div class="pulse-dots"><div class="pulse-dot"></div><div class="pulse-dot"></div><div class="pulse-dot"></div></div>
    <span>Analisando carteira de clientes...</span>
  </div>`;

  setTimeout(() => {
    const mes = currentMes(), ano = currentAno();
    const inativos = state.clientes.map(c => {
      const lp = lastPedido(c.id);
      const d = daysSince(lp ? lp.data_pedido : null);
      const fat12 = state.pedidos.filter(p => p.cliente_id === c.id && daysSince(p.data_pedido) <= 365).reduce((s, p) => s + Number(p.valor), 0);
      return { c, d, fat12 };
    }).filter(x => x.d >= 30).sort((a, b) => b.fat12 - a.fat12).slice(0, 5);

    const abaixoMeta = state.vendedores.map(v => {
      const fat = state.pedidos.filter(p => p.vendedor_id === v.id && p.mes === mes && p.ano === ano).reduce((s, p) => s + Number(p.valor), 0);
      const meta = getMeta(v.id, mes, ano) || Number(v.meta_mensal) || 0;
      return { v, fat, meta, gap: meta - fat, pctMeta: meta > 0 ? (fat / meta) * 100 : 0 };
    }).filter(x => x.gap > 0 && x.meta > 0).sort((a, b) => b.gap - a.gap);

    const prontas = state.funil.filter(n => n.etapa === 'proposta' || n.etapa === 'fechamento').sort((a, b) => Number(b.valor_estimado) - Number(a.valor_estimado)).slice(0, 4);

    const crescimento = state.clientes.filter(c => {
      const fat12 = state.pedidos.filter(p => p.cliente_id === c.id && daysSince(p.data_pedido) <= 365).reduce((s, p) => s + Number(p.valor), 0);
      const fat6 = state.pedidos.filter(p => p.cliente_id === c.id && daysSince(p.data_pedido) <= 180).reduce((s, p) => s + Number(p.valor), 0);
      return fat6 > fat12 * 0.55 && fat12 > 0;
    }).slice(0, 4);

    const totalPot = inativos.reduce((s, x) => s + x.fat12 / 12, 0);
    const iSection = buildIASection('red', 'alert', `Clientes Prioritarios para Recuperacao (Potencial: ${fmt(totalPot)}/mes)`,
      inativos.length ? inativos.map((x, i) => ({
        num: i + 1,
        title: `${x.c.nome} — ${x.d === 9999 ? 'Nunca comprou' : x.d + ' dias sem comprar'}`,
        desc: `Historico 12 meses: ${fmt(x.fat12)} | Potencial mensal: ${fmt(x.fat12 / 12)} | Vendedor: ${x.c.vendedores ? x.c.vendedores.nome : '-'}`,
        action: 'Ligar hoje e enviar proposta de reposicao com condicao especial',
      })) : [{ num: 1, title: 'Todos os clientes estao ativos', desc: 'Sem clientes para recuperar no momento.', action: '' }]
    );
    const vSection = buildIASection('amber', 'chart', `Vendedores que Precisam de Apoio`,
      abaixoMeta.length ? abaixoMeta.map((x, i) => ({
        num: i + 1,
        title: `${x.v.nome} — ${pct(x.pctMeta)} da meta`,
        desc: `Realizado: ${fmt(x.fat)} | Meta: ${fmt(x.meta)} | Gap: ${fmt(x.gap)}`,
        action: 'Revisar carteira, priorizar inativos e acelerar fechamento de propostas',
      })) : [{ num: 1, title: 'Todos os vendedores acima da meta', desc: 'Excelente! Time atingindo as metas.', action: '' }]
    );
    const fSection = buildIASection('blue', 'funnel', 'Negociacoes Prontas para Fechar',
      prontas.length ? prontas.map((n, i) => ({
        num: i + 1,
        title: `${n.clientes ? n.clientes.nome : '?'} — ${etapaLabels[n.etapa]}`,
        desc: `Valor estimado: ${fmt(n.valor_estimado)} | Proxima acao: ${n.proxima_acao || 'Definir'} | Previsao: ${n.data_prevista || '-'}`,
        action: 'Contato imediato — oportunidade quente',
      })) : [{ num: 1, title: 'Nenhuma negociacao em proposta/fechamento', desc: 'Alimente o funil com novas negociacoes.', action: '' }]
    );
    const cSection = buildIASection('green', 'trend', 'Clientes com Tendencia de Crescimento',
      crescimento.length ? crescimento.map((c, i) => ({
        num: i + 1,
        title: `${c.nome} — ${c.cidade}, ${c.estado}`,
        desc: `Segmento: ${c.segmento} | Vendedor: ${c.vendedores ? c.vendedores.nome : '-'}`,
        action: 'Ampliar mix, oferecer produtos complementares e fidelizar com condicoes de volume',
      })) : [{ num: 1, title: 'Dados insuficientes para tendencias', desc: 'Continue alimentando os pedidos para gerar analises.', action: '' }]
    );

    container.innerHTML = iSection + vSection + fSection + cSection + buildPlanoSection();
  }, 1200);
}

function buildIASection(colorCls, icon, title, items) {
  const svgs = {
    alert: '<circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>',
    chart: '<polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/>',
    funnel: '<polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/>',
    trend: '<polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/>',
  };
  return `<div class="ia-section">
    <div class="ia-section-header">
      <div class="ia-section-icon ${colorCls}"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">${svgs[icon]}</svg></div>
      <h4>${esc(title)}</h4>
    </div>
    ${items.map(item => `<div class="ia-item">
      <div class="ia-item-num">${item.num}</div>
      <div class="ia-item-body">
        <strong>${esc(item.title)}</strong>
        <p>${esc(item.desc)}</p>
        ${item.action ? `<span class="ia-item-action">${esc(item.action)}</span>` : ''}
      </div>
    </div>`).join('')}
  </div>`;
}

function buildPlanoSection() {
  const plano = [
    { num: 1, title: 'Semana 1: Retomada de contatos inativos', desc: 'Vendedores devem contatar todos os clientes sem compra ha mais de 30 dias. Meta: reativar pelo menos 3 por vendedor.' },
    { num: 2, title: 'Semana 2: Acelerar funil em proposta', desc: 'Follow-up em todas as negociacoes abertas. Prazo maximo de resposta: 48 horas.' },
    { num: 3, title: 'Semana 3: Visitas presenciais prioritarias', desc: 'Agendar visitas para os 5 maiores clientes e os 5 maiores inativos de cada vendedor.' },
    { num: 4, title: 'Semana 4: Revisao e metas do proximo mes', desc: 'Reuniao de time: revisar resultados, definir meta do mes seguinte e atualizar funil.' },
  ];
  return `<div class="ia-section">
    <div class="ia-section-header">
      <div class="ia-section-icon blue"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg></div>
      <h4>Plano de Acao — Proximos 30 Dias</h4>
    </div>
    ${plano.map(p => `<div class="ia-item">
      <div class="ia-item-num">${p.num}</div>
      <div class="ia-item-body"><strong>${p.title}</strong><p>${p.desc}</p></div>
    </div>`).join('')}
  </div>`;
}

// ===== GLOBAL SEARCH =====
document.getElementById('globalSearch').addEventListener('input', function() {
  if (this.value.trim()) {
    navigate('clientes');
    document.getElementById('filtroClientes').value = this.value;
    renderClientes();
  }
});

// ===== PWA =====
let deferredPrompt;
window.addEventListener('beforeinstallprompt', e => {
  e.preventDefault();
  deferredPrompt = e;
  document.getElementById('installBtn').style.display = 'flex';
});
document.getElementById('installBtn').addEventListener('click', () => {
  if (deferredPrompt) { deferredPrompt.prompt(); deferredPrompt = null; document.getElementById('installBtn').style.display = 'none'; }
});
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('service-worker.js').catch(() => {});
}

window.addEventListener('resize', () => {
  if (state.currentScreen === 'dashboard') drawFaturamentoChart();
});

// ===== INIT =====
loadAll();
