export const SOURCE_UPDATED_AT = "2026-08-14";

const registro = "https://docs.google.com/spreadsheets/d/1PwxvksoQBEMLqJz7YRI-le1V_5KGEyxTnWF1d4fFWxM/edit";
const reajustes = "https://docs.google.com/spreadsheets/d/1q9aTGZBxUk_YUcW5Rymf23i3wjjTNKQiB2NmL56Suzs/edit";
const base = "https://docs.google.com/spreadsheets/d/1oIcqBLC8_dulz5sROnp03ylfCXn_Qaa2yUucH_GC65g/edit";

const room = (number, tenant, rent, lastEvent, lastDate, nextAdjustment, extra = {}) => ({
  id: `sala-${String(number).padStart(2, "0")}`,
  code: `Sala ${String(number).padStart(2, "0")}`,
  shortCode: String(number).padStart(2, "0"),
  type: "Sala",
  group: "Espaço VIP",
  address: "Espaço VIP",
  tenant,
  occupancy: "Locado",
  rent,
  lastEvent,
  lastDate,
  nextAdjustment,
  source: registro,
  billing: "Mensal",
  charges: "Condomínio à parte",
  contractStatus: "Ativo",
  ...extra,
});

const external = (id, code, tenant, rent, lastEvent, lastDate, nextAdjustment, extra = {}) => ({
  id,
  code,
  shortCode: code,
  type: "Imóvel externo",
  group: "Casas e comerciais",
  address: code,
  tenant,
  occupancy: "Locado",
  rent,
  lastEvent,
  lastDate,
  nextAdjustment,
  source: reajustes,
  billing: "Mensal",
  charges: "Verificar IPTU",
  contractStatus: "Ativo",
  ...extra,
});

export const properties = [
  room(1, "Carol Malta", 1400, "Reajuste", "2025-09-01", "2026-09-01", {
    billing: "Semestral",
    source: registro,
    notes: "Aluguel equivalente a R$ 1.400/mês, pago semestralmente. A data contratual e o calendário operacional devem ser reconciliados.",
    history: [
      { date: "2025-08-01", title: "Mudança para a Sala 01", description: "Carol Malta deixou a Sala 09 e passou a ocupar a Sala 01." },
      { date: "2025-09-01", title: "Último reajuste registrado", description: "Data utilizada pelo calendário operacional." },
    ],
  }),
  room(2, "Maria Angélica", 900, "Reajuste", "2026-04-01", "2027-04-01", {
    billing: "Anual",
    referenceRent: 2050,
    source: reajustes,
    notes: "Valor equivalente do plano anual. Referência integral da notificação: R$ 2.050.",
  }),
  room(3, "Adrielle e Carol Dias", 850, "Data operacional", "2025-08-21", "2026-08-21", {
    notes: "O valor do reajuste de 2025 não está registrado com clareza.",
  }),
  room(4, "Vivian", 700, "Reajuste", "2025-09-05", "2026-09-05", { source: reajustes }),
  room(5, "Drielle", 800, "Início do contrato", "2026-06-08", "2027-06-08", {
    source: base,
    history: [
      { date: null, title: "Heliodoro ocupou a sala", description: "Primeiro registro histórico conhecido da Sala 05." },
      { date: null, title: "Moriza ocupou a sala", description: "Depois, Moriza mudou-se para a Sala 16." },
      { date: "2026-06-08", title: "Entrada de Drielle", description: "Início do contrato atual." },
    ],
  }),
  {
    ...room(6, "Karen", 0, "Uso interno", null, null),
    occupancy: "Uso interno",
    currentUse: "CEO da Espaço VIP",
    charges: "Não se aplica",
    contractStatus: "Não se aplica",
    notes: "Sala utilizada por Karen, CEO da Espaço VIP.",
  },
  room(7, "V4", 800, "Reajuste", "2026-04-23", "2027-04-23", {
    referenceRent: 1390,
    source: reajustes,
    notes: "Valor integral notificado: R$ 1.390; condomínio cobrado à parte.",
  }),
  room(8, "Iasmin Cristina", 750, "Início do contrato", "2025-12-10", "2026-12-10", {
    source: base,
    history: [
      { date: null, title: "Saída de Alessandra", description: "Alessandra deixou de ser inquilina da Sala 08." },
      { date: "2025-12-10", title: "Entrada de Iasmin", description: "Início da locação atual." },
    ],
  }),
  room(9, "Caroline Oliveira", 1000, "Início do contrato", "2025-08-26", "2026-08-26", {
    source: base,
    history: [
      { date: null, title: "Carol Malta ocupou a sala", description: "Carol mudou-se posteriormente para a Sala 01." },
      { date: "2025-08-26", title: "Entrada de Caroline", description: "Início da locação atual." },
    ],
  }),
  room(10, "Marcello", 850, "Notificação", "2026-04-20", "2027-04-10", {
    referenceRent: 1630,
    notes: "Revisar divergência: a planilha indica 10/04/2027, mas a notificação é de 20/04/2026 e menciona outro nome internamente.",
  }),
  room(11, "Rafaela Castro / Florindo", 850, "Início do contrato", "2025-09-22", "2026-09-22", { source: base }),
  room(12, "Danilo Alves", 650, "Reajuste", "2025-08-06", "2026-08-06", {
    source: reajustes,
    notes: "Reajuste anual vencido em relação à data-base de 14/08/2026.",
  }),
  room(13, "Miriam Leonart", 650, "Reajuste", "2025-11-15", "2026-11-15", {
    notes: "Data inferida pela observação de aumento em 15/11.",
  }),
  room(14, "Lauro / INVI", 700, "Reajuste", "2025-08-16", "2026-08-16", { source: reajustes }),
  room(15, "Kenia Karine", 920, "Reajuste", "2026-02-22", "2027-02-22", {
    billing: "Semestral",
    referenceRent: 1217,
    source: reajustes,
    notes: "Equivalente mensal do plano semestral de R$ 5.520. Referência integral: R$ 1.217.",
  }),
  room(16, "Moriza", 750, "Início do contrato", "2026-01-05", "2027-01-05", {
    source: base,
    history: [
      { date: null, title: "Marina e Vanessa ocuparam a sala", description: "Vanessa entregou a sala e Marina mudou-se para a Sala 17." },
      { date: "2026-01-05", title: "Entrada de Moriza", description: "Moriza mudou-se da Sala 05 para a Sala 16." },
    ],
  }),
  room(17, "Marina Arantes", 950, "Início do contrato", "2026-02-15", "2027-02-15", {
    source: base,
    history: [
      { date: null, title: "Lorena ocupou a sala", description: "Locação anterior à ocupação atual." },
      { date: "2026-02-15", title: "Entrada de Marina", description: "Marina mudou-se da Sala 16 para a Sala 17." },
    ],
  }),
  room(18, "Léa Gomes", 870, "Reajuste", "2025-06-25", "2026-06-25", {
    billing: "Semestral",
    notes: "Valor equivalente mensal. Não foi localizado reajuste posterior.",
  }),
  {
    ...room(19, "Espaço VIP", 0, "Uso eventual", null, null),
    occupancy: "Uso interno",
    currentUse: "Estúdio de podcast",
    charges: "Locação eventual por hora",
    contractStatus: "Não se aplica",
    notes: "Sala de podcast utilizada internamente e alugada por hora eventualmente.",
  },
  room(20, "Heliodoro", 750, "Data operacional", "2025-11-15", "2026-11-15", {
    notes: "Heliodoro chegou a ocupar as salas 05 e 20; atualmente permanece somente na Sala 20.",
    history: [
      { date: null, title: "Expansão para duas salas", description: "Heliodoro passou a ocupar as salas 05 e 20." },
      { date: null, title: "Devolução da Sala 05", description: "Permaneceu somente na Sala 20." },
    ],
  }),
  room(21, "Stone / CEM Soluções", 1775, "Reajuste", "2025-11-01", "2026-11-01", {
    billing: "Contrato conjunto 21/22",
    referenceRent: 2009,
    source: reajustes,
    notes: "Metade gerencial do contrato conjunto. Total mensal das salas 21/22: R$ 3.550.",
  }),
  room(22, "Stone / CEM Soluções", 1775, "Reajuste", "2025-11-01", "2026-11-01", {
    billing: "Contrato conjunto 21/22",
    referenceRent: 2009,
    source: reajustes,
    notes: "Metade gerencial do contrato conjunto. Total mensal das salas 21/22: R$ 3.550.",
  }),
  {
    ...room(23, "Espaço VIP", 0, "Uso interno", null, null),
    occupancy: "Uso interno",
    currentUse: "Administração e arquivo",
    charges: "Não se aplica",
    contractStatus: "Não se aplica",
    notes: "Pequena sala destinada aos documentos e à administração da Espaço VIP.",
  },

  external("av-paranaiba-3057", "Av. Paranaíba, 3.057", "Pedro Maia / Maia Móveis", 2100, "Reajuste", "2026-06-01", "2027-06-01", {
    referenceRent: 2343,
    iptu: 177.90,
    notes: "Aluguel com desconto. IPTU mensal registrado em R$ 177,90.",
  }),
  external("av29-r18-1449", "Av. 29/Rua 18, 1.449", "Maria Augusta", 1100, "Reajuste", "2026-04-02", "2027-04-02", {
    referenceRent: 1467,
    notes: "O título do arquivo diverge, mas o conteúdo indica vigência em 02/04/2026.",
  }),
  external("av29-r18-1451", "Av. 29/Rua 18, 1.451", "Ana Carolina", 1100, "Reajuste", "2026-06-05", "2027-06-05", {
    referenceRent: 1510,
    iptu: 129.64,
  }),
  external("av21-r32-1726", "Av. 21/Rua 32, 1.726", "Walisson", 1350, "Reajuste", "2026-06-05", "2027-06-05", {
    referenceRent: 1681,
    iptu: 137.87,
  }),
  external("av29-r18-1447", "Av. 29/Rua 18, 1.447", "Sandra / Kassandra", 1100, "Reajuste", "2025-11-10", "2026-11-10", {
    source: registro,
    notes: "Valor integral pós-reajuste não localizado com segurança.",
  }),
  external("av23-1981-ap402", "Av. 23, 1.981, ap. 402", "Helena", 1700, "Reajuste", "2026-06-10", "2027-06-10", { referenceRent: 1978 }),
  external("av-paranaiba-3389", "Av. Paranaíba, 3.389", "Carlos / Brena / Jaine", 1550, "Reajuste", "2025-12-10", "2026-12-10", { source: registro }),
  external("rua14-av29-781", "Rua 14/Av. 29, nº 781", "Onelzides", 1050, "Reajuste", "2026-06-14", "2027-06-14", { referenceRent: 1177 }),
  external("av21-r22-1415", "Av. 21/Rua 22, nº 1.415", "Paulo", 1800, "Reajuste", "2026-06-15", "2027-06-15", {
    referenceRent: 2827,
    iptu: 403.52,
    notes: "Endereço confirmado. IPTU mensal registrado em R$ 403,52.",
  }),
  external("rua14-av29-31-787", "Rua 14/Av. 29/31, nº 787", "Marlene", 1050, "Reajuste", "2026-06-17", "2027-06-17", {
    referenceRent: 1279,
    iptu: 101.10,
  }),
  external("rua14-av29-783", "Rua 14/Av. 29, nº 783", "Deila / Vanildo", 1190, "Início do contrato", "2025-08-21", "2026-08-21", { source: base }),
  external("av21-r32-863", "Av. 21/Rua 32, nº 863", "Joana", 1400, "Reajuste", "2025-11-30", "2026-11-30", { source: registro }),
  external("rua14-av29-31-785", "Rua 14/Av. 29/31, nº 785", "Letícia / Celda / Celso", 1300, "Início do contrato", "2026-06-15", "2027-06-15", {
    source: base,
    notes: "Contrato atual iniciado após a saída da Simone.",
    history: [
      { date: null, title: "Simone ocupou o imóvel", description: "Inquilina anterior do imóvel nº 785." },
      { date: "2026-06-15", title: "Entrada de Letícia / Celda / Celso", description: "Início do contrato atual." },
    ],
  }),
];

export const knownHistory = properties.flatMap((property) => {
  const items = property.history ? [...property.history] : [];
  if (property.lastDate && !items.some((item) => item.date === property.lastDate && item.title.includes(property.lastEvent))) {
    items.push({
      date: property.lastDate,
      title: property.lastEvent,
      description: `${property.lastEvent} registrado para ${property.tenant}.`,
    });
  }
  return items.map((item) => ({ ...item, propertyId: property.id, propertyCode: property.code }));
});

export const sourceLinks = { registro, reajustes, base };
