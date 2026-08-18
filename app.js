let properties = [];
let knownHistory = [];
let activities = [];
let SOURCE_UPDATED_AT = null;

const app = document.querySelector("#app");
const drawer = document.querySelector("#propertyDrawer");
const drawerBackdrop = document.querySelector("#drawerBackdrop");
const modalBackdrop = document.querySelector("#modalBackdrop");
const sidebar = document.querySelector("#sidebar");

function escapeHtml(value) {
  return String(value ?? "").replace(/[&<>'"]/g, (character) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;",
  })[character]);
}

function safeExternalUrl(value) {
  try {
    const url = new URL(value);
    return ["http:", "https:"].includes(url.protocol) ? escapeHtml(url.href) : "#";
  } catch {
    return "#";
  }
}

const icons = {
  dashboard: '<svg viewBox="0 0 24 24" fill="none"><path d="M4 4h6v6H4zM14 4h6v9h-6zM4 14h6v6H4zM14 17h6v3h-6z" stroke-width="1.8" stroke-linejoin="round"/></svg>',
  building: '<svg viewBox="0 0 24 24" fill="none"><path d="M5 20V4h10v16M15 9h4v11M3 20h18M8 8h4M8 12h4M8 16h4" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  home: '<svg viewBox="0 0 24 24" fill="none"><path d="m3 11 9-7 9 7M5 10v10h14V10M9 20v-6h6v6" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  calendar: '<svg viewBox="0 0 24 24" fill="none"><path d="M5 4v3M19 4v3M4 9h16M5 6h14a1 1 0 0 1 1 1v13H4V7a1 1 0 0 1 1-1Z" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  history: '<svg viewBox="0 0 24 24" fill="none"><path d="M4 12a8 8 0 1 0 2.34-5.66L4 8.68M4 4v4.68h4.68M12 8v5l3 2" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  folder: '<svg viewBox="0 0 24 24" fill="none"><path d="M3 6h7l2 2h9v11H3z" stroke-width="1.8" stroke-linejoin="round"/></svg>',
  settings: '<svg viewBox="0 0 24 24" fill="none"><path d="M12 15.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Z" stroke-width="1.8"/><path d="M19.4 15a1.7 1.7 0 0 0 .34 1.88l.06.06-2.83 2.83-.06-.06a1.7 1.7 0 0 0-1.88-.34 1.7 1.7 0 0 0-1.03 1.56V21h-4v-.08a1.7 1.7 0 0 0-1.03-1.56 1.7 1.7 0 0 0-1.88.34l-.06.06-2.83-2.83.06-.06A1.7 1.7 0 0 0 4.6 15 1.7 1.7 0 0 0 3 14H3v-4h.08A1.7 1.7 0 0 0 4.64 9a1.7 1.7 0 0 0-.34-1.88l-.06-.06 2.83-2.83.06.06A1.7 1.7 0 0 0 9 4.63 1.7 1.7 0 0 0 10 3.07V3h4v.08A1.7 1.7 0 0 0 15 4.64a1.7 1.7 0 0 0 1.88-.34l.06-.06 2.83 2.83-.06.06A1.7 1.7 0 0 0 19.37 9 1.7 1.7 0 0 0 20.93 10H21v4h-.08A1.7 1.7 0 0 0 19.4 15Z" stroke-width="1.35" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  search: '<svg viewBox="0 0 24 24" fill="none"><circle cx="11" cy="11" r="7" stroke-width="1.8"/><path d="m16.3 16.3 4 4" stroke-width="1.8" stroke-linecap="round"/></svg>',
  bell: '<svg viewBox="0 0 24 24" fill="none"><path d="M18 9a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9ZM10 21h4" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  menu: '<svg viewBox="0 0 24 24" fill="none"><path d="M4 7h16M4 12h16M4 17h16" stroke-width="1.8" stroke-linecap="round"/></svg>',
  close: '<svg viewBox="0 0 24 24" fill="none"><path d="m6 6 12 12M18 6 6 18" stroke-width="1.8" stroke-linecap="round"/></svg>',
  chevron: '<svg viewBox="0 0 24 24" fill="none"><path d="m9 6 6 6-6 6" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  plus: '<svg viewBox="0 0 24 24" fill="none"><path d="M12 5v14M5 12h14" stroke-width="1.8" stroke-linecap="round"/></svg>',
  download: '<svg viewBox="0 0 24 24" fill="none"><path d="M12 3v12m0 0 4-4m-4 4-4-4M5 20h14" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  grid: '<svg viewBox="0 0 24 24" fill="none"><path d="M4 4h6v6H4zM14 4h6v6h-6zM4 14h6v6H4zM14 14h6v6h-6z" stroke-width="1.8"/></svg>',
  list: '<svg viewBox="0 0 24 24" fill="none"><path d="M8 6h12M8 12h12M8 18h12M4 6h.01M4 12h.01M4 18h.01" stroke-width="2" stroke-linecap="round"/></svg>',
  alert: '<svg viewBox="0 0 24 24" fill="none"><path d="M12 4 3 20h18L12 4Z" stroke-width="1.8" stroke-linejoin="round"/><path d="M12 9v5M12 17h.01" stroke-width="1.8" stroke-linecap="round"/></svg>',
  money: '<svg viewBox="0 0 24 24" fill="none"><path d="M4 6h16v12H4z" stroke-width="1.8"/><path d="M8 12h.01M16 12h.01M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z" stroke-width="1.8" stroke-linecap="round"/></svg>',
  users: '<svg viewBox="0 0 24 24" fill="none"><path d="M16 20v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M9 10a4 4 0 1 0 0-8 4 4 0 0 0 0 8ZM22 20v-2a4 4 0 0 0-3-3.87M16 2.13a4 4 0 0 1 0 7.75" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  file: '<svg viewBox="0 0 24 24" fill="none"><path d="M6 3h8l4 4v14H6zM14 3v5h5M9 13h6M9 17h6" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  check: '<svg viewBox="0 0 24 24" fill="none"><path d="m5 12 4 4L19 6" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  arrow: '<svg viewBox="0 0 24 24" fill="none"><path d="M5 12h14m-5-5 5 5-5 5" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  filter: '<svg viewBox="0 0 24 24" fill="none"><path d="M4 6h16M7 12h10M10 18h4" stroke-width="1.8" stroke-linecap="round"/></svg>',
  info: '<svg viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="9" stroke-width="1.8"/><path d="M12 11v6M12 7h.01" stroke-width="1.8" stroke-linecap="round"/></svg>',
  external: '<svg viewBox="0 0 24 24" fill="none"><path d="M14 4h6v6M20 4l-9 9M19 13v7H4V5h7" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>',
};

function hydrateIcons(root = document) {
  root.querySelectorAll("[data-icon]").forEach((node) => {
    const icon = icons[node.dataset.icon];
    if (icon) node.innerHTML = icon;
  });
}

const state = {
  view: "dashboard",
  propertyLayout: "table",
  query: "",
  type: "Todos",
  occupancy: "Todos",
  adjustment: "Todos",
  paymentPropertyId: null,
  paymentMonth: `${todayYear()}-${String(todayMonth()).padStart(2, "0")}-01`,
  payments: [],
  paymentsLoadedFor: null,
  paymentsLoading: false,
  paymentLoadToken: 0,
  paymentSelectionStart: null,
  paymentSelectionEnd: null,
};

function todayYear() { return new Date().getFullYear(); }
function todayMonth() { return new Date().getMonth() + 1; }

async function apiRequest(path, options = {}) {
  const response = await fetch(path, {
    headers: { "Content-Type": "application/json", ...(options.headers || {}) },
    ...options,
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(payload.error || "Não foi possível acessar o servidor.");
  return payload;
}

async function loadApplicationData() {
  const data = await apiRequest("./api/bootstrap.php");
  properties = data.properties || [];
  knownHistory = data.history || [];
  activities = data.activities || [];
  SOURCE_UPDATED_AT = data.sourceUpdatedAt || null;
}

const today = new Date();
today.setHours(12, 0, 0, 0);

const currency = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 });
const fullCurrency = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL", minimumFractionDigits: 2 });
const dateFormatter = new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric" });
const shortDateFormatter = new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "short" });

function parseDate(value) {
  if (!value) return null;
  return new Date(`${value}T12:00:00`);
}

function formatDate(value) {
  const date = parseDate(value);
  return date ? dateFormatter.format(date) : "Não se aplica";
}

function daysUntil(value) {
  const date = parseDate(value);
  if (!date) return null;
  return Math.round((date - today) / 86400000);
}

function adjustmentMeta(property) {
  const days = daysUntil(property.nextAdjustment);
  if (days === null) return { key: "internal", label: "Não se aplica", className: "status-internal", days };
  if (days < 0) return { key: "overdue", label: "Atrasado", className: "status-overdue", days };
  if (days <= 30) return { key: "soon", label: "Próximo", className: "status-soon", days };
  if (days <= 60) return { key: "attention", label: "Atenção", className: "status-attention", days };
  return { key: "regular", label: "Regular", className: "status-regular", days };
}

function relativeDays(days) {
  if (days === null) return "Sem data";
  if (days < 0) return `${Math.abs(days)} dias atrasado`;
  if (days === 0) return "Hoje";
  if (days === 1) return "Amanhã";
  return `Em ${days} dias`;
}

function statusPill(meta) {
  return `<span class="status-pill ${meta.className}">${meta.label}</span>`;
}

function heading(eyebrow, title, text, actions = "") {
  return `<section class="page-heading">
    <div><span class="eyebrow">${eyebrow}</span><h1>${title}</h1><p>${text}</p></div>
    <div class="heading-actions">${actions}</div>
  </section>`;
}

function getPriorityProperties(limit = Infinity) {
  return properties
    .map((property) => ({ property, meta: adjustmentMeta(property) }))
    .filter(({ meta }) => ["overdue", "soon", "attention"].includes(meta.key))
    .sort((a, b) => a.meta.days - b.meta.days)
    .slice(0, limit);
}

function getNextSteps(property) {
  const meta = adjustmentMeta(property);
  if (meta.key === "internal") {
    return [
      ["Revisar finalidade da unidade", "Mantenha registrado o uso interno e o responsável pela sala."],
      ["Organizar documentos", "Associe fotos, inventário ou documentos administrativos à unidade."],
    ];
  }
  if (meta.key === "overdue") {
    return [
      ["Conferir cláusula de reajuste", "Validar índice, aniversário e condições previstas no contrato atual."],
      ["Calcular o novo valor", "Registrar valor integral, desconto praticado e vigência."],
      ["Emitir e enviar a notificação", "Gerar documento e registrar data/canal de envio ao inquilino."],
    ];
  }
  if (meta.key === "soon" || meta.key === "attention") {
    return [
      ["Revisar contrato e índice", `O reajuste está previsto para ${formatDate(property.nextAdjustment)}.`],
      ["Preparar simulação", "Calcular antecipadamente o novo valor integral e as opções de desconto."],
      ["Programar comunicação", "Preparar a notificação para envio antes da vigência."],
    ];
  }
  return [
    ["Manter acompanhamento", `Próxima revisão prevista para ${formatDate(property.nextAdjustment)}.`],
    ["Completar documentos", "Anexar contrato, comprovantes e notificações ao cadastro."],
  ];
}

function renderDashboard() {
  const rented = properties.filter((p) => p.occupancy === "Locado").length;
  const monthlyRevenue = properties.reduce((sum, p) => sum + p.rent, 0);
  const overdue = properties.filter((p) => adjustmentMeta(p).key === "overdue").length;
  const priorities = getPriorityProperties();
  const roomsRevenue = properties.filter((p) => p.type === "Sala").reduce((sum, p) => sum + p.rent, 0);
  const roomShare = ((roomsRevenue / monthlyRevenue) * 100).toFixed(1);
  const todayLabel = new Intl.DateTimeFormat("pt-BR", { weekday: "long", day: "2-digit", month: "long", year: "numeric" }).format(today);

  const metric = (label, value, foot, icon, tone = "") => `<article class="metric-card ${tone}">
    <div class="metric-top"><span class="metric-label">${label}</span><span class="metric-icon" data-icon="${icon}"></span></div>
    <strong class="metric-value">${value}</strong><div class="metric-foot">${foot}</div>
  </article>`;

  const priorityRows = priorities.slice(0, 6).map(({ property, meta }) => {
    const date = parseDate(property.nextAdjustment);
    return `<button class="alert-row clickable-row" data-property-id="${escapeHtml(property.id)}">
      <span class="alert-date"><strong>${String(date.getDate()).padStart(2, "0")}</strong><span>${date.toLocaleDateString("pt-BR", { month: "short" }).replace(".", "")}</span></span>
      <span><strong class="item-title">${escapeHtml(property.code)}</strong><span class="item-subtitle">${escapeHtml(property.type)}</span></span>
      <span><strong class="item-title">${escapeHtml(property.tenant)}</strong><span class="item-subtitle">${escapeHtml(property.billing)}</span></span>
      <span>${statusPill(meta)}</span><span class="money">${currency.format(property.rent)}</span><span data-icon="chevron"></span>
    </button>`;
  }).join("");

  const roomCells = properties.filter((p) => p.type === "Sala").map((property) => {
    const meta = adjustmentMeta(property);
    const className = property.occupancy === "Uso interno" ? "internal" : meta.key === "overdue" ? "risk" : meta.key === "soon" ? "soon" : "";
    return `<button class="room-cell ${className}" data-property-id="${escapeHtml(property.id)}" title="${escapeHtml(`${property.code} — ${property.tenant}`)}"><strong>${escapeHtml(property.shortCode)}</strong><span>${escapeHtml(property.tenant.split(" /")[0])}</span></button>`;
  }).join("");

  app.innerHTML = `${heading("Painel administrativo", "Olá, Espaço VIP", `Acompanhe sua operação em um só lugar. ${todayLabel.charAt(0).toUpperCase() + todayLabel.slice(1)}.`, `
    <button class="button secondary" data-action="export"><span data-icon="download"></span> Exportar CSV</button>
    <button class="button primary" data-view-jump="properties"><span data-icon="building"></span> Ver imóveis</button>`)}
    <section class="metrics-grid">
      ${metric("Total de unidades", properties.length, `<strong>${rented}</strong> locadas e ${properties.length - rented} de uso interno`, "building")}
      ${metric("Receita base mensal", currency.format(monthlyRevenue), "Aluguel vigente, sem condomínio e IPTU", "money")}
      ${metric("Ações em até 60 dias", priorities.length, `${priorities.filter((x) => x.meta.key === "soon").length} em até 30 dias`, "calendar", "warning")}
      ${metric("Reajustes atrasados", overdue, overdue ? "Exigem ação imediata" : "Nenhuma pendência", "alert", "danger")}
    </section>
    <section class="dashboard-grid">
      <div class="stack">
        <article class="panel">
          <header class="panel-header"><div><h2>Agenda de reajustes</h2><p>Itens vencidos ou previstos nos próximos 60 dias</p></div><button class="panel-link" data-view-jump="agenda">Ver agenda <span data-icon="arrow"></span></button></header>
          <div class="alert-list">${priorityRows}</div>
        </article>
        <article class="panel">
          <header class="panel-header"><div><h2>Mapa de ocupação — Espaço VIP</h2><p>Clique em uma sala para abrir o cadastro completo</p></div><button class="panel-link" data-view-jump="properties">Todos os imóveis <span data-icon="arrow"></span></button></header>
          <div class="panel-body occupancy-layout">
            <div class="room-grid">${roomCells}</div>
            <div class="donut-wrap">
              <div class="donut" style="--rooms:${roomShare}%"><div class="donut-center"><strong>${currency.format(monthlyRevenue)}</strong><span>base mensal</span></div></div>
              <div class="legend">
                <div class="legend-row"><span class="legend-label"><i class="legend-dot" style="background:var(--blue-600)"></i>Salas</span><strong>${currency.format(roomsRevenue)}</strong></div>
                <div class="legend-row"><span class="legend-label"><i class="legend-dot" style="background:#72c9a0"></i>Externos</span><strong>${currency.format(monthlyRevenue - roomsRevenue)}</strong></div>
              </div>
            </div>
          </div>
        </article>
      </div>
      <div class="stack">
        <article class="panel">
          <header class="panel-header"><div><h2>Próximas ações</h2><p>Fluxo sugerido para a operação atual</p></div></header>
          <div class="panel-body task-list">
            <div class="task-item"><span class="task-number">1</span><div><strong>Regularizar reajustes vencidos</strong><p>Conferir contrato, calcular índice e notificar Léa e Danilo.</p></div><span class="task-count">2 imóveis</span></div>
            <div class="task-item"><span class="task-number">2</span><div><strong>Preparar reajustes de agosto</strong><p>INVI, Adrielle, imóvel 783 e Caroline vencem em seguida.</p></div><span class="task-count">4 imóveis</span></div>
            <div class="task-item"><span class="task-number">3</span><div><strong>Revisar divergências</strong><p>Conferir os documentos de Carol, Adrielle, Heliodoro e Marcello.</p></div><span class="task-count">4 cadastros</span></div>
            <div class="task-item"><span class="task-number">4</span><div><strong>Centralizar documentos</strong><p>Vincular contratos, comprovantes e notificações por imóvel.</p></div><span class="task-count">Próxima fase</span></div>
          </div>
        </article>
        <article class="panel">
          <header class="panel-header"><div><h2>Qualidade da base</h2><p>Preparação para automações futuras</p></div></header>
          <div class="panel-body">
            <div class="legend">
              <div class="legend-row"><span class="legend-label"><i class="legend-dot" style="background:#72c9a0"></i>Imóveis identificados</span><strong>36/36</strong></div>
              <div class="legend-row"><span class="legend-label"><i class="legend-dot" style="background:var(--blue-600)"></i>Inquilinos atuais</span><strong>33/33</strong></div>
              <div class="legend-row"><span class="legend-label"><i class="legend-dot" style="background:#f4b54b"></i>Cadastros a revisar</span><strong>4</strong></div>
            </div>
          </div>
        </article>
      </div>
    </section>`;
}

function filteredProperties() {
  const term = state.query.trim().toLocaleLowerCase("pt-BR");
  return properties.filter((property) => {
    const meta = adjustmentMeta(property);
    const matchTerm = !term || [property.code, property.tenant, property.type, property.notes].filter(Boolean).join(" ").toLocaleLowerCase("pt-BR").includes(term);
    const matchType = state.type === "Todos" || property.type === state.type;
    const matchOccupancy = state.occupancy === "Todos" || property.occupancy === state.occupancy;
    const matchAdjustment = state.adjustment === "Todos" || meta.key === state.adjustment;
    return matchTerm && matchType && matchOccupancy && matchAdjustment;
  });
}

function propertiesContent(items) {
  if (!items.length) return `<div class="empty-state"><div class="empty-state-icon" data-icon="search"></div><h3>Nenhum imóvel encontrado</h3><p>Ajuste os filtros ou pesquise por outro termo.</p></div>`;
  if (state.propertyLayout === "cards") {
    return `<div class="property-cards">${items.map((property) => {
      const meta = adjustmentMeta(property);
      return `<button class="property-card" data-property-id="${escapeHtml(property.id)}">
        <div class="property-card-head"><span class="property-icon" data-icon="${property.type === "Sala" ? "building" : "home"}"></span>${statusPill(meta)}</div>
        <h3>${escapeHtml(property.code)}</h3><div class="tenant">${escapeHtml(property.tenant)}</div>
        <div class="property-card-stats"><div class="small-stat"><span>Aluguel</span><strong>${property.rent ? currency.format(property.rent) : "Uso interno"}</strong></div><div class="small-stat"><span>Próximo reajuste</span><strong>${property.nextAdjustment ? formatDate(property.nextAdjustment) : "—"}</strong></div></div>
      </button>`;
    }).join("")}</div>`;
  }
  return `<div class="data-table-wrap"><table class="data-table"><thead><tr><th>Imóvel</th><th>Inquilino / uso</th><th>Tipo</th><th>Aluguel</th><th>Próximo reajuste</th><th>Situação</th><th></th></tr></thead><tbody>${items.map((property) => {
    const meta = adjustmentMeta(property);
    return `<tr class="clickable-row" data-property-id="${escapeHtml(property.id)}"><td><strong class="item-title">${escapeHtml(property.code)}</strong><span class="item-subtitle">${escapeHtml(property.group)}</span></td><td><strong class="item-title">${escapeHtml(property.tenant)}</strong><span class="item-subtitle">${escapeHtml(property.currentUse || property.contractStatus)}</span></td><td><span class="type-badge"><span data-icon="${property.type === "Sala" ? "building" : "home"}"></span>${escapeHtml(property.type)}</span></td><td class="money">${property.rent ? currency.format(property.rent) : "—"}</td><td class="date-cell"><strong>${property.nextAdjustment ? formatDate(property.nextAdjustment) : "Não se aplica"}</strong><span>${relativeDays(meta.days)}</span></td><td>${statusPill(meta)}</td><td><span data-icon="chevron"></span></td></tr>`;
  }).join("")}</tbody></table></div>`;
}

function renderProperties() {
  const items = filteredProperties();
  app.innerHTML = `${heading("Portfólio", "Imóveis e salas", "Consulte ocupação, valores, reajustes, histórico e próximos passos de cada unidade.", `<button class="button secondary" data-action="export"><span data-icon="download"></span> Exportar CSV</button>`)}
    <section class="panel">
      <div class="toolbar">
        <label class="toolbar-search"><span data-icon="search"></span><input id="propertySearch" value="${escapeHtml(state.query)}" placeholder="Buscar imóvel ou inquilino..." /></label>
        <select class="select" id="typeFilter"><option>Todos</option><option ${state.type === "Sala" ? "selected" : ""}>Sala</option><option ${state.type === "Imóvel externo" ? "selected" : ""}>Imóvel externo</option></select>
        <select class="select" id="occupancyFilter"><option>Todos</option><option ${state.occupancy === "Locado" ? "selected" : ""}>Locado</option><option ${state.occupancy === "Uso interno" ? "selected" : ""}>Uso interno</option></select>
        <select class="select" id="adjustmentFilter"><option value="Todos">Todos os reajustes</option><option value="overdue" ${state.adjustment === "overdue" ? "selected" : ""}>Atrasados</option><option value="soon" ${state.adjustment === "soon" ? "selected" : ""}>Até 30 dias</option><option value="attention" ${state.adjustment === "attention" ? "selected" : ""}>31 a 60 dias</option><option value="regular" ${state.adjustment === "regular" ? "selected" : ""}>Regulares</option></select>
        <div class="view-toggle"><button class="${state.propertyLayout === "table" ? "active" : ""}" data-layout="table" aria-label="Exibir tabela"><span data-icon="list"></span></button><button class="${state.propertyLayout === "cards" ? "active" : ""}" data-layout="cards" aria-label="Exibir cartões"><span data-icon="grid"></span></button></div>
      </div>
      <div id="propertiesResults">${propertiesContent(items)}</div>
    </section>`;
}

function renderAgenda() {
  const mapped = properties.map((property) => ({ property, meta: adjustmentMeta(property) })).filter(({ meta }) => meta.key !== "internal").sort((a, b) => a.meta.days - b.meta.days);
  const groups = [
    ["overdue", "Atrasados", "Ação imediata"],
    ["soon", "Próximos 30 dias", "Preparar cálculo e comunicação"],
    ["attention", "Entre 31 e 60 dias", "Antecipar conferência do contrato"],
    ["regular", "Próximos depois de 60 dias", "Acompanhamento programado"],
  ];
  const sections = groups.map(([key, title, subtitle]) => {
    const items = mapped.filter(({ meta }) => meta.key === key);
    return `<section><header class="agenda-section-header"><h2>${title}</h2><span>${items.length} ${items.length === 1 ? "imóvel" : "imóveis"} · ${subtitle}</span></header><div class="agenda-cards">${items.map(({ property, meta }) => {
      const date = parseDate(property.nextAdjustment);
      return `<button class="agenda-card" data-property-id="${escapeHtml(property.id)}"><span class="agenda-calendar"><strong>${String(date.getDate()).padStart(2, "0")}</strong><span>${date.toLocaleDateString("pt-BR", { month: "short" }).replace(".", "")}</span></span><span><h3>${escapeHtml(property.code)}</h3><p>${escapeHtml(property.tenant)}</p>${statusPill(meta)} <span class="item-subtitle" style="display:inline;margin-left:5px">${relativeDays(meta.days)}</span></span></button>`;
    }).join("")}</div></section>`;
  }).join("");
  app.innerHTML = `${heading("Calendário operacional", "Agenda de reajustes", "Prioridades ordenadas pela próxima data prevista. Abra um imóvel para ver a sequência sugerida de ações.", `<button class="button secondary" data-action="export"><span data-icon="download"></span> Exportar agenda</button>`)}<div class="agenda-sections">${sections}</div>`;
}

const paymentPalette = {
  blue: { label: "Azul", hex: "#dcecff" },
  green: { label: "Verde", hex: "#dff4e8" },
  purple: { label: "Roxo", hex: "#ebe2f8" },
  yellow: { label: "Amarelo", hex: "#fff1c9" },
  pink: { label: "Rosa", hex: "#f8dfeb" },
  peach: { label: "Pêssego", hex: "#fde5d6" },
  teal: { label: "Turquesa", hex: "#d9f1ef" },
};

function isoDate(date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

function ensurePaymentProperty() {
  const eligible = properties.filter((property) => property.occupancy === "Locado" && property.leaseId);
  if (!eligible.some((property) => property.id === state.paymentPropertyId)) {
    state.paymentPropertyId = eligible[0]?.id || null;
  }
  return eligible;
}

async function loadPayments(propertyId = state.paymentPropertyId) {
  if (!propertyId) return;
  const loadToken = ++state.paymentLoadToken;
  state.paymentsLoading = true;
  if (state.view === "payments") renderPayments();
  try {
    const result = await apiRequest(`./api/payments.php?propertyId=${encodeURIComponent(propertyId)}`);
    if (state.paymentPropertyId !== propertyId || loadToken !== state.paymentLoadToken) return;
    state.payments = result.payments || [];
    state.paymentsLoadedFor = propertyId;
  } catch (error) {
    if (state.paymentPropertyId === propertyId && loadToken === state.paymentLoadToken) {
      state.payments = [];
      toast("Não foi possível carregar", error.message);
    }
  } finally {
    if (loadToken === state.paymentLoadToken) {
      state.paymentsLoading = false;
      if (state.view === "payments") renderPayments();
    }
  }
}

function renderPayments() {
  const eligible = ensurePaymentProperty();
  const selectedProperty = properties.find((property) => property.id === state.paymentPropertyId);
  const month = parseDate(state.paymentMonth) || new Date(today.getFullYear(), today.getMonth(), 1, 12);
  const monthLabel = month.toLocaleDateString("pt-BR", { month: "long", year: "numeric" });
  const firstDay = new Date(month.getFullYear(), month.getMonth(), 1, 12);
  const offset = (firstDay.getDay() + 6) % 7;
  const gridStart = new Date(firstDay);
  gridStart.setDate(gridStart.getDate() - offset);
  const selectionEnd = state.paymentSelectionEnd || state.paymentSelectionStart;
  const weekdays = ["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"];

  const cells = Array.from({ length: 42 }, (_, index) => {
    const date = new Date(gridStart);
    date.setDate(gridStart.getDate() + index);
    const value = isoDate(date);
    const payment = state.payments.find((item) => item.periodStart <= value && item.periodEnd >= value);
    const inSelection = state.paymentSelectionStart && value >= state.paymentSelectionStart && value <= selectionEnd;
    const classes = [
      "payment-day",
      date.getMonth() !== month.getMonth() ? "outside" : "",
      payment ? `payment-${payment.color}` : "",
      inSelection ? "selecting" : "",
      value === isoDate(today) ? "today" : "",
    ].filter(Boolean).join(" ");
    return `<button type="button" class="${classes}" data-calendar-date="${value}" aria-label="${formatDate(value)}">
      <span class="payment-day-number">${date.getDate()}</span>
      ${payment && payment.periodStart === value ? `<span class="payment-day-amount">${currency.format(payment.amountPaid)}</span>` : ""}
    </button>`;
  }).join("");

  const paymentRows = state.payments.map((payment) => {
    const color = paymentPalette[payment.color] || paymentPalette.blue;
    return `<article class="payment-history-item">
      <span class="payment-history-color" style="--payment-color:${color.hex}"></span>
      <div><strong>${formatDate(payment.periodStart)} a ${formatDate(payment.periodEnd)}</strong><span>${escapeHtml(selectedProperty?.tenant || payment.tenant)} · ${color.label} pastel</span></div>
      <strong class="payment-history-amount">${fullCurrency.format(payment.amountPaid)}</strong>
    </article>`;
  }).join("");
  const totalPaid = state.payments.reduce((sum, payment) => sum + payment.amountPaid, 0);
  const hasCompleteSelection = state.paymentSelectionStart && state.paymentSelectionEnd;

  app.innerHTML = `${heading("Controle financeiro", "Histórico de pagamentos", "Selecione o imóvel e marque no calendário o primeiro e o último dia do período pago.")}
    <section class="payment-toolbar panel">
      <label><span>Imóvel / unidade</span><select class="select" id="paymentProperty">${eligible.map((property) => `<option value="${escapeHtml(property.id)}" ${property.id === state.paymentPropertyId ? "selected" : ""}>${escapeHtml(property.code)} — ${escapeHtml(property.tenant)}</option>`).join("")}</select></label>
      <div class="payment-toolbar-summary"><span>Total registrado</span><strong>${fullCurrency.format(totalPaid)}</strong></div>
    </section>
    <section class="payment-layout">
      <article class="panel payment-calendar-panel">
        <header class="payment-calendar-header">
          <div><h2>${monthLabel.charAt(0).toUpperCase() + monthLabel.slice(1)}</h2><p>${state.paymentSelectionStart ? (state.paymentSelectionEnd ? `${formatDate(state.paymentSelectionStart)} a ${formatDate(state.paymentSelectionEnd)}` : `Início em ${formatDate(state.paymentSelectionStart)} — selecione o último dia`) : "Clique no primeiro dia do período pago"}</p></div>
          <div class="calendar-navigation"><button type="button" class="icon-button" data-calendar-shift="-1" aria-label="Mês anterior">←</button><button type="button" class="button ghost" data-calendar-today>Hoje</button><button type="button" class="icon-button" data-calendar-shift="1" aria-label="Próximo mês">→</button></div>
        </header>
        <div class="payment-weekdays">${weekdays.map((day) => `<span>${day}</span>`).join("")}</div>
        <div class="payment-calendar">${cells}</div>
        <div class="payment-calendar-legend">${Object.entries(paymentPalette).map(([key, color]) => `<span><i class="payment-${key}"></i>${color.label}</span>`).join("")}</div>
      </article>
      <aside class="payment-side">
        <section class="panel payment-entry-card">
          <header><span class="eyebrow">Novo pagamento</span><h2>Registrar período pago</h2></header>
          ${hasCompleteSelection ? `<form id="paymentForm" class="payment-form">
            <div class="selected-payment-period"><span>Período selecionado</span><strong>${formatDate(state.paymentSelectionStart)} a ${formatDate(state.paymentSelectionEnd)}</strong></div>
            <label><span>Valor pago</span><input id="paymentAmount" name="amountPaid" type="number" min="0.01" max="99999999.99" step="0.01" placeholder="0,00" required /></label>
            <fieldset><legend>Cor do período</legend><div class="payment-color-options">${Object.entries(paymentPalette).map(([key, color], index) => `<label title="${color.label} pastel"><input type="radio" name="paymentColor" value="${key}" ${index === 0 ? "checked" : ""}/><span style="--payment-color:${color.hex}"></span><small>${color.label}</small></label>`).join("")}</div></fieldset>
            <div class="payment-form-actions"><button type="button" class="button secondary" data-clear-payment-selection>Limpar</button><button type="submit" class="button primary"><span data-icon="check"></span> Salvar pagamento</button></div>
          </form>` : `<div class="payment-entry-empty"><span data-icon="calendar"></span><p>${state.paymentSelectionStart ? "Agora selecione o último dia do período." : "Escolha dois dias no calendário para definir o período pago."}</p></div>`}
        </section>
      </aside>
    </section>
    <section class="panel payment-history-panel">
      <header class="panel-header"><div><h2>Períodos registrados</h2><p>${selectedProperty ? `${escapeHtml(selectedProperty.code)} · ${escapeHtml(selectedProperty.tenant)}` : "Nenhum imóvel selecionado"}</p></div><strong>${state.payments.length} ${state.payments.length === 1 ? "pagamento" : "pagamentos"}</strong></header>
      <div class="payment-history-list">${state.paymentsLoading ? `<div class="empty-state"><p>Carregando pagamentos…</p></div>` : paymentRows || `<div class="empty-state"><h3>Nenhum pagamento registrado</h3><p>Selecione um período no calendário para começar.</p></div>`}</div>
    </section>`;
  hydrateIcons(app);
}

function renderHistory() {
  const saved = activities.map((activity) => {
    const property = properties.find((p) => p.id === activity.propertyId);
    return { date: activity.createdAt.slice(0, 10), title: activity.type, description: activity.description, propertyId: activity.propertyId, propertyCode: property?.code || "Imóvel" };
  });
  const items = [...saved, ...knownHistory].sort((a, b) => {
    if (!a.date) return 1;
    if (!b.date) return -1;
    return b.date.localeCompare(a.date);
  });
  app.innerHTML = `${heading("Linha do tempo", "Histórico de imóveis e inquilinos", "Mudanças de sala, entradas, saídas, reajustes e acompanhamentos ficam vinculados ao cadastro do imóvel.")}
    <section class="panel"><div class="panel-body" style="padding-top:16px"><div class="timeline">${items.map((item) => `<div class="timeline-item"><span class="timeline-dot"></span><span class="timeline-date">${item.date ? formatDate(item.date) : "Data anterior"}</span><div class="timeline-content"><strong>${escapeHtml(item.title)} · ${escapeHtml(item.propertyCode)}</strong><p>${escapeHtml(item.description)}</p></div><button class="button ghost" data-property-id="${escapeHtml(item.propertyId)}">Ver imóvel</button></div>`).join("")}</div></div></section>`;
}

function renderDocuments() {
  const categories = [
    ["file", "Contratos", "Contratos atuais e versões anteriores por inquilino.", "Estrutura pronta"],
    ["money", "Comprovantes", "PDFs, fotos e recibos vinculados ao mês de referência.", "Próxima fase"],
    ["alert", "Notificações", "Reajustes, cobranças e comunicações enviadas.", "Próxima fase"],
    ["home", "IPTU", "Guias, valores anuais e notificações vinculadas ao imóvel.", "5 valores mapeados"],
  ];
  app.innerHTML = `${heading("Central de arquivos", "Documentos", "Esta área será a biblioteca de contratos, comprovantes, notificações e IPTU. A organização já está definida para a próxima integração.", `<button class="button primary" data-action="coming"><span data-icon="plus"></span> Adicionar documento</button>`)}
    <section class="document-grid">${categories.map(([icon, title, text, foot]) => `<article class="document-category"><span class="doc-icon" data-icon="${icon}"></span><h3>${title}</h3><p>${text}</p><div class="doc-foot"><span>${foot}</span><span data-icon="chevron" style="width:13px"></span></div></article>`).join("")}</section>
    <section class="panel" style="margin-top:18px"><header class="panel-header"><div><h2>Padrão de organização recomendado</h2><p>Cada arquivo será associado a um imóvel, inquilino, competência e tipo</p></div></header><div class="panel-body roadmap">
      <div class="roadmap-item"><span class="roadmap-step">01</span><div><strong>Vincular Google Drive</strong><p>Usar a pasta Contratos Atuais como origem, sem duplicar arquivos.</p></div><span class="roadmap-status">Próximo</span></div>
      <div class="roadmap-item"><span class="roadmap-step">02</span><div><strong>Classificar documentos</strong><p>Contrato, aditivo, comprovante, notificação ou IPTU.</p></div><span class="roadmap-status">Planejado</span></div>
      <div class="roadmap-item"><span class="roadmap-step">03</span><div><strong>Busca e visualização</strong><p>Localizar documentos pelo imóvel, inquilino, data ou competência.</p></div><span class="roadmap-status">Planejado</span></div>
    </div></section>`;
}

function renderSettings() {
  app.innerHTML = `${heading("Evolução do sistema", "Configurações e próximos módulos", "O painel foi estruturado para crescer gradualmente, mantendo os dados atuais como ponto de partida.")}
    <section class="panel"><header class="panel-header"><div><h2>Roteiro de implementação</h2><p>Sequência recomendada para transformar o protótipo em sistema operacional</p></div></header><div class="panel-body roadmap">
      <div class="roadmap-item"><span class="roadmap-step">01</span><div><strong>Base de imóveis e reajustes</strong><p>Painel, busca, filtros, histórico e próximos passos.</p></div><span class="roadmap-status" style="color:var(--green-700);background:var(--green-100)">Concluído</span></div>
      <div class="roadmap-item"><span class="roadmap-step">02</span><div><strong>Banco de dados e autenticação</strong><p>Salvar alterações de forma centralizada e controlar usuários.</p></div><span class="roadmap-status">Recomendado</span></div>
      <div class="roadmap-item"><span class="roadmap-step">03</span><div><strong>Pagamentos e documentos</strong><p>Competências mensais, comprovantes e arquivos do Google Drive.</p></div><span class="roadmap-status">Planejado</span></div>
      <div class="roadmap-item"><span class="roadmap-step">04</span><div><strong>WhatsApp e chave PIX</strong><p>Lembretes automáticos com mensagem revisável e registro de envio.</p></div><span class="roadmap-status">Planejado</span></div>
      <div class="roadmap-item"><span class="roadmap-step">05</span><div><strong>Contratos e reajustes automáticos</strong><p>Formulários, modelos, índice oficial e geração de documentos.</p></div><span class="roadmap-status">Futuro</span></div>
      <div class="roadmap-item"><span class="roadmap-step">06</span><div><strong>Consulta e notificação de IPTU</strong><p>Busca por imóvel, geração do PDF e envio ao inquilino.</p></div><span class="roadmap-status">Futuro</span></div>
    </div></section>
    <section class="panel" style="margin-top:18px"><header class="panel-header"><div><h2>Fonte dos dados</h2><p>Base central utilizada por esta versão</p></div></header><div class="panel-body"><div class="info-grid"><div class="info-item"><span>Última consolidação</span><strong>${formatDate(SOURCE_UPDATED_AT)}</strong></div><div class="info-item"><span>Unidades cadastradas</span><strong>${properties.length}</strong></div><div class="info-item"><span>Persistência desta versão</span><strong>MySQL centralizado</strong></div><div class="info-item"><span>Estrutura preparada</span><strong>Contratos, pagamentos e documentos</strong></div></div></div></section>`;
}

function render() {
  document.querySelectorAll(".nav-item[data-view]").forEach((button) => button.classList.toggle("active", button.dataset.view === state.view));
  if (state.view === "dashboard") renderDashboard();
  if (state.view === "properties") renderProperties();
  if (state.view === "payments") renderPayments();
  if (state.view === "agenda") renderAgenda();
  if (state.view === "history") renderHistory();
  if (state.view === "documents") renderDocuments();
  if (state.view === "settings") renderSettings();
  hydrateIcons(app);
  window.scrollTo({ top: 0, behavior: "auto" });
}

function propertyHistory(property) {
  const saved = activities.filter((a) => a.propertyId === property.id).map((a) => ({ date: a.createdAt.slice(0, 10), title: a.type, description: a.description }));
  const baseItems = knownHistory.filter((item) => item.propertyId === property.id);
  return [...saved, ...baseItems].sort((a, b) => {
    if (!a.date) return 1;
    if (!b.date) return -1;
    return b.date.localeCompare(a.date);
  });
}

function openProperty(propertyId) {
  const property = properties.find((item) => item.id === propertyId);
  if (!property) return;
  const meta = adjustmentMeta(property);
  const history = propertyHistory(property);
  const steps = getNextSteps(property);
  drawer.innerHTML = `<header class="drawer-header"><div class="drawer-top"><div><span class="eyebrow">${escapeHtml(property.type)} · ${escapeHtml(property.occupancy)}</span><h2>${escapeHtml(property.code)}</h2><p>${escapeHtml(property.tenant)}${property.currentUse ? ` · ${escapeHtml(property.currentUse)}` : ""}</p></div><button class="icon-button" data-close-drawer aria-label="Fechar"><span data-icon="close"></span></button></div>
    <div class="drawer-summary"><div class="drawer-stat"><span>Aluguel vigente</span><strong>${property.rent ? fullCurrency.format(property.rent) : "Não se aplica"}</strong></div><div class="drawer-stat"><span>Próximo reajuste</span><strong>${property.nextAdjustment ? formatDate(property.nextAdjustment) : "Não se aplica"}</strong></div><div class="drawer-stat"><span>Situação</span><strong>${meta.label}</strong></div></div></header>
    <div class="drawer-body">
      <section class="drawer-section"><div class="drawer-section-title"><h3>Informações atuais</h3>${statusPill(meta)}</div><div class="info-grid">
        <div class="info-item"><span>Inquilino / responsável</span><strong>${escapeHtml(property.tenant)}</strong></div><div class="info-item"><span>Status de ocupação</span><strong>${escapeHtml(property.occupancy)}</strong></div>
        <div class="info-item"><span>Forma de cobrança</span><strong>${escapeHtml(property.billing)}</strong></div><div class="info-item"><span>Encargos</span><strong>${escapeHtml(property.charges)}</strong></div>
        <div class="info-item"><span>Último evento</span><strong>${escapeHtml(property.lastEvent)}</strong></div><div class="info-item"><span>Data do evento</span><strong>${formatDate(property.lastDate)}</strong></div>
        ${property.referenceRent ? `<div class="info-item"><span>Valor integral / referência</span><strong>${fullCurrency.format(property.referenceRent)}</strong></div>` : ""}
        ${property.iptu ? `<div class="info-item"><span>IPTU mensal registrado</span><strong>${fullCurrency.format(property.iptu)}</strong></div>` : ""}
      </div></section>
      <section class="drawer-section"><div class="drawer-section-title"><h3>Próximos passos</h3><button class="button ghost" data-add-activity="${escapeHtml(property.id)}"><span data-icon="plus"></span> Registrar andamento</button></div><div class="next-step-list">${steps.map(([title, text]) => `<div class="next-step"><span class="next-step-check"></span><div><strong>${escapeHtml(title)}</strong><p>${escapeHtml(text)}</p></div></div>`).join("")}</div></section>
      ${property.notes ? `<section class="drawer-section"><div class="drawer-section-title"><h3>Observações importantes</h3></div><div class="notes-box">${escapeHtml(property.notes)}</div></section>` : ""}
      <section class="drawer-section"><div class="drawer-section-title"><h3>Histórico</h3><span class="item-subtitle">${history.length} registros</span></div>${history.length ? `<div class="timeline">${history.map((item) => `<div class="timeline-item" style="grid-template-columns:32px 80px 1fr"><span class="timeline-dot"></span><span class="timeline-date">${item.date ? formatDate(item.date) : "Anterior"}</span><div class="timeline-content"><strong>${escapeHtml(item.title)}</strong><p>${escapeHtml(item.description)}</p></div></div>`).join("")}</div>` : `<div class="empty-state" style="padding:20px"><p>Nenhum evento histórico registrado.</p></div>`}</section>
      <section class="drawer-section"><div class="drawer-section-title"><h3>Fonte e documentos</h3></div><a class="source-link" href="${safeExternalUrl(property.source)}" target="_blank" rel="noreferrer">Abrir fonte no Google Planilhas <span data-icon="external" style="display:inline-block;width:13px;vertical-align:middle"></span></a><p class="item-subtitle" style="white-space:normal;margin-top:8px">Contratos, comprovantes e notificações serão exibidos aqui após a conexão com o Google Drive.</p></section>
    </div>`;
  hydrateIcons(drawer);
  drawerBackdrop.hidden = false;
  drawer.classList.add("open");
  drawer.setAttribute("aria-hidden", "false");
}

function closeDrawer() {
  drawer.classList.remove("open");
  drawer.setAttribute("aria-hidden", "true");
  setTimeout(() => { drawerBackdrop.hidden = true; }, 220);
}

function openActivityModal(propertyId) {
  document.querySelector("#activityPropertyId").value = propertyId;
  document.querySelector("#activityDescription").value = "";
  modalBackdrop.hidden = false;
  setTimeout(() => document.querySelector("#activityDescription").focus(), 40);
}

function closeModal() { modalBackdrop.hidden = true; }

function toast(title, message) {
  const node = document.createElement("div");
  node.className = "toast";
  node.innerHTML = `<span data-icon="check"></span><div><strong>${escapeHtml(title)}</strong><span>${escapeHtml(message)}</span></div>`;
  document.querySelector("#toastRegion").append(node);
  hydrateIcons(node);
  setTimeout(() => node.remove(), 4200);
}

function exportCsv() {
  const header = ["Imóvel", "Tipo", "Inquilino", "Ocupação", "Aluguel", "Último evento", "Data do último evento", "Próximo reajuste", "Situação", "Dias restantes"];
  const rows = properties.map((p) => {
    const meta = adjustmentMeta(p);
    return [p.code, p.type, p.tenant, p.occupancy, p.rent, p.lastEvent, p.lastDate || "", p.nextAdjustment || "", meta.label, meta.days ?? ""];
  });
  const csv = [header, ...rows].map((row) => row.map((value) => `"${String(value).replaceAll('"', '""')}"`).join(";")).join("\n");
  const blob = new Blob(["\ufeff" + csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "gestao_imoveis_espaco_vip.csv";
  link.click();
  URL.revokeObjectURL(url);
  toast("Exportação concluída", "O arquivo CSV foi gerado com os 36 imóveis cadastrados.");
}

function setView(view) {
  state.view = view;
  history.replaceState(null, "", `#${view}`);
  render();
  if (view === "payments" && state.paymentPropertyId && state.paymentsLoadedFor !== state.paymentPropertyId) loadPayments();
  sidebar.classList.remove("open");
}

document.addEventListener("click", (event) => {
  const nav = event.target.closest("[data-view]");
  if (nav) setView(nav.dataset.view);
  const jump = event.target.closest("[data-view-jump]");
  if (jump) setView(jump.dataset.viewJump);
  const propertyTrigger = event.target.closest("[data-property-id]");
  if (propertyTrigger) openProperty(propertyTrigger.dataset.propertyId);
  if (event.target.closest("[data-close-drawer]")) closeDrawer();
  const activity = event.target.closest("[data-add-activity]");
  if (activity) openActivityModal(activity.dataset.addActivity);
  const layout = event.target.closest("[data-layout]");
  if (layout) { state.propertyLayout = layout.dataset.layout; renderProperties(); hydrateIcons(app); }
  const action = event.target.closest("[data-action]")?.dataset.action;
  if (action === "export") exportCsv();
  if (action === "coming") toast("Módulo preparado", "O envio de arquivos será ativado na integração com o Google Drive.");
  if (event.target.closest("[data-open-agenda]")) setView("agenda");
  const calendarDay = event.target.closest("[data-calendar-date]");
  if (calendarDay) {
    const value = calendarDay.dataset.calendarDate;
    if (!state.paymentSelectionStart || state.paymentSelectionEnd) {
      state.paymentSelectionStart = value;
      state.paymentSelectionEnd = null;
    } else if (value < state.paymentSelectionStart) {
      state.paymentSelectionEnd = state.paymentSelectionStart;
      state.paymentSelectionStart = value;
    } else {
      state.paymentSelectionEnd = value;
    }
    renderPayments();
  }
  const monthShift = event.target.closest("[data-calendar-shift]");
  if (monthShift) {
    const month = parseDate(state.paymentMonth);
    month.setMonth(month.getMonth() + Number(monthShift.dataset.calendarShift));
    state.paymentMonth = isoDate(new Date(month.getFullYear(), month.getMonth(), 1, 12));
    renderPayments();
  }
  if (event.target.closest("[data-calendar-today]")) {
    state.paymentMonth = isoDate(new Date(today.getFullYear(), today.getMonth(), 1, 12));
    renderPayments();
  }
  if (event.target.closest("[data-clear-payment-selection]")) {
    state.paymentSelectionStart = null;
    state.paymentSelectionEnd = null;
    renderPayments();
  }
});

document.querySelector("#mobileMenu").addEventListener("click", () => sidebar.classList.toggle("open"));
drawerBackdrop.addEventListener("click", closeDrawer);
document.querySelector("#closeModal").addEventListener("click", closeModal);
document.querySelector("#cancelModal").addEventListener("click", closeModal);
modalBackdrop.addEventListener("click", (event) => { if (event.target === modalBackdrop) closeModal(); });

document.querySelector("#activityForm").addEventListener("submit", async (event) => {
  event.preventDefault();
  const propertyId = document.querySelector("#activityPropertyId").value;
  const type = document.querySelector("#activityType").value;
  const description = document.querySelector("#activityDescription").value.trim();
  const submitButton = event.submitter;
  if (submitButton) submitButton.disabled = true;
  try {
    const result = await apiRequest("./api/activities.php", {
      method: "POST",
      body: JSON.stringify({ propertyId, type, description }),
    });
    activities.unshift(result.activity);
    closeModal();
    openProperty(propertyId);
    toast("Registro salvo", "O acompanhamento foi adicionado ao histórico deste imóvel.");
  } catch (error) {
    toast("Não foi possível salvar", error.message);
  } finally {
    if (submitButton) submitButton.disabled = false;
  }
});

app.addEventListener("submit", async (event) => {
  if (event.target.id !== "paymentForm") return;
  event.preventDefault();
  const submitButton = event.submitter;
  const amountPaid = document.querySelector("#paymentAmount").value;
  const color = new FormData(event.target).get("paymentColor");
  if (submitButton) submitButton.disabled = true;
  try {
    await apiRequest("./api/payments.php", {
      method: "POST",
      body: JSON.stringify({
        propertyId: state.paymentPropertyId,
        periodStart: state.paymentSelectionStart,
        periodEnd: state.paymentSelectionEnd,
        amountPaid,
        color,
      }),
    });
    state.paymentSelectionStart = null;
    state.paymentSelectionEnd = null;
    state.paymentsLoadedFor = null;
    toast("Pagamento registrado", "O período pago foi salvo no calendário deste imóvel.");
    await loadPayments();
  } catch (error) {
    toast("Não foi possível salvar", error.message);
    if (submitButton) submitButton.disabled = false;
  }
});

app.addEventListener("input", (event) => {
  if (event.target.id === "propertySearch") {
    state.query = event.target.value;
    document.querySelector("#propertiesResults").innerHTML = propertiesContent(filteredProperties());
    hydrateIcons(document.querySelector("#propertiesResults"));
  }
});

app.addEventListener("change", (event) => {
  if (event.target.id === "paymentProperty") {
    state.paymentPropertyId = event.target.value;
    state.payments = [];
    state.paymentsLoadedFor = null;
    state.paymentSelectionStart = null;
    state.paymentSelectionEnd = null;
    renderPayments();
    loadPayments();
    return;
  }
  if (event.target.id === "typeFilter") state.type = event.target.value;
  if (event.target.id === "occupancyFilter") state.occupancy = event.target.value;
  if (event.target.id === "adjustmentFilter") state.adjustment = event.target.value;
  if (["typeFilter", "occupancyFilter", "adjustmentFilter"].includes(event.target.id)) {
    document.querySelector("#propertiesResults").innerHTML = propertiesContent(filteredProperties());
    hydrateIcons(document.querySelector("#propertiesResults"));
  }
});

const globalSearch = document.querySelector("#globalSearch");
globalSearch.addEventListener("keydown", (event) => {
  if (event.key === "Enter" && globalSearch.value.trim()) {
    state.query = globalSearch.value;
    setView("properties");
  }
});
document.addEventListener("keydown", (event) => {
  if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") { event.preventDefault(); globalSearch.focus(); }
  if (event.key === "Escape") { closeDrawer(); closeModal(); sidebar.classList.remove("open"); }
});

async function startApplication() {
  const initialView = location.hash.slice(1);
  if (["dashboard", "properties", "payments", "agenda", "history", "documents", "settings"].includes(initialView)) state.view = initialView;
  app.innerHTML = '<div class="empty-state"><h3>Carregando dados…</h3><p>Conectando ao banco de dados.</p></div>';
  hydrateIcons();
  try {
    await loadApplicationData();
    document.querySelector("#propertyNavCount").textContent = properties.length;
    document.querySelector("#agendaNavCount").textContent = getPriorityProperties().length;
    render();
    if (state.view === "payments" && state.paymentPropertyId) loadPayments();
  } catch (error) {
    app.innerHTML = `<div class="empty-state"><h3>Banco de dados indisponível</h3><p>${escapeHtml(error.message)}</p><p>Confira o arquivo .env e execute a migração inicial.</p></div>`;
  }
}

startApplication();
