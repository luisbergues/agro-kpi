import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  AreaChart, Area, LineChart, Line, BarChart, Bar,
  ComposedChart, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend, ReferenceLine, PieChart, Pie, Cell, RadarChart, Radar, PolarGrid, PolarAngleAxis
} from "recharts";

// ─── CONFIGURACIÓN Y ESTILOS ──────────────────────────────────────────────────
const FONT_IMPORT = `@import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;0,9..40,800&family=DM+Mono:wght@400;500&display=swap');`;

const T = {
  bg: "#F3F4F6", sidebar: "#1C2333", sidebarHover: "rgba(255,255,255,.07)",
  sidebarActive: "#2D3A50", surface: "#FFFFFF", surfaceHover: "#F9FAFB",
  border: "#E5E7EB", borderLight: "#F0F1F3", text: "#111827", textSub: "#6B7280",
  textMuted: "#9CA3AF", accent: "#F0A500", accentDark: "#C98900",
  green: "#10B981", greenLight: "#D1FAE5", yellow: "#F59E0B", yellowLight: "#FEF3C7",
  red: "#EF4444", redLight: "#FEE2E2", blue: "#3B82F6", blueLight: "#DBEAFE",
  purple: "#8B5CF6", purpleLight: "#EDE9FE", cyan: "#06B6D4", cyanLight: "#CFFAFE",
};

const SEM_C = { green: T.green, yellow: T.yellow, red: T.red, neutral: T.blue };
const SEM_BG = { green: T.greenLight, yellow: T.yellowLight, red: T.redLight, neutral: T.blueLight };

const SK = "campokpi_pbi_v3";

// ─── UTILIDADES Y GENERACIÓN DE DATOS ──────────────────────────────────────────
function generateHistory(months = 12) {
  const now = new Date();
  return Array.from({ length: months }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - (months - 1 - i), 1);
    const label = d.toLocaleDateString("es-AR", { month: "short", year: "2-digit" });
    const t = i / months;
    const r = () => 1 + (Math.random() - 0.5) * 0.12;
    return {
      label, month: i,
      kgCarneHa: Math.round((70 + t * 40 + (Math.random() - 0.5) * 15) * r()),
      cargaAnimal: parseFloat((0.85 + t * 0.25 + (Math.random() - 0.5) * 0.15).toFixed(2)),
      adg: Math.round((520 + t * 120 + (Math.random() - 0.5) * 80) * r()),
      tasaDestete: parseFloat((62 + t * 12 + (Math.random() - 0.5) * 5).toFixed(1)),
      mortalidad: parseFloat((1.8 - t * 0.6 + Math.random() * 0.4).toFixed(2)),
      margenBrutoHa: Math.round((28 + t * 30 + (Math.random() - 0.5) * 12) * r()),
      ingresoPorHa: Math.round(155 + t * 15 + (Math.random() - 0.5) * 10),
      vsMercado: parseFloat((88 + t * 8 + (Math.random() - 0.5) * 4).toFixed(1)),
      eficienciaCosecha: parseFloat((54 + t * 14 + (Math.random() - 0.5) * 8).toFixed(1)),
      balanceForrajero: Math.round((200 + t * 600 + (Math.random() - 0.5) * 200) * r()),
      msProducida: Math.round(7200 + t * 800 + (Math.random() - 0.5) * 500),
      usdHaTotal: Math.round((95 + t * 45 + (Math.random() - 0.5) * 20) * r()),
      stockTotal: Math.round(265 + t * 5 + (Math.random() - 0.5) * 8),
    };
  });
}

const HISTORY = generateHistory(24);

const defaultState = {
  config: {
    totalHa: 500,
    lots: [
      { id: "l1", name: "Lote Norte", ha: 150, use: "agricola", soil: "Franco arcilloso" },
      { id: "l2", name: "Lote Sur", ha: 200, use: "ganadero", soil: "Franco arenoso" },
      { id: "l3", name: "Potrero Central", ha: 150, use: "ganadero", soil: "Franco" },
    ],
  },
  agricola: {
    marketValueUSD_ha: 180,
    contracts: [{
      id: "c1", lotId: "l1", priceUSD_ha: 165,
      startDate: "2024-03-01", durationMonths: 12, paymentType: "Anual",
      payments: [
        { id: "p1", date: "2024-03-01", amount: 24750, status: "pagado" },
        { id: "p2", date: "2025-03-01", amount: 24750, status: "pendiente" },
      ],
    }],
  },
  ganadero: {
    assignedHa: 350,
    stock: [
      { id: "s1", category: "Vaca", count: 120, initialWeight: 430, currentWeight: 455, entryDate: "2024-07-01", ev: 1.0 },
      { id: "s2", category: "Novillo", count: 80, initialWeight: 280, currentWeight: 340, entryDate: "2024-07-01", ev: 0.85 },
      { id: "s3", category: "Ternero", count: 65, initialWeight: 120, currentWeight: 165, entryDate: "2024-10-01", ev: 0.3 },
      { id: "s4", category: "Toro", count: 5, initialWeight: 600, currentWeight: 610, entryDate: "2024-07-01", ev: 1.2 },
    ],
    births: 72, deaths: 3, calvesWeaned: 62, cowsBase: 120,
    feedingCostUSD_ha: 45, ingresos: 16800,
  },
  pasturas: {
    lots: [
      { id: "ps1", lotId: "l2", MS_kg_ha: 8500, occupationDays: 7, restDays: 45, consumedMS_kg_ha: 6200 },
      { id: "ps2", lotId: "l3", MS_kg_ha: 7200, occupationDays: 6, restDays: 42, consumedMS_kg_ha: 5100 },
    ],
  },
};

const f1 = (n, d = 1) => (isNaN(n) || n === undefined) ? "—" : Number(n).toLocaleString("es-AR", { maximumFractionDigits: d, minimumFractionDigits: d });
const f0 = n => (isNaN(n) || n === undefined) ? "—" : Number(n).toLocaleString("es-AR", { maximumFractionDigits: 0 });
const sem = (v, g, y) => v >= g ? "green" : v >= y ? "yellow" : "red";
const semInv = (v, g, y) => v <= g ? "green" : v <= y ? "yellow" : "red";

// ─── LÓGICA DE CÁLCULO (KPIs) ──────────────────────────────────────────────────
function calcKPIs(st) {
  const { config, agricola, ganadero, pasturas } = st;
  
  // Agrícola
  const agLots = config.lots.filter(l => l.use === "agricola");
  const agHa = agLots.reduce((s, l) => s + l.ha, 0);
  let agIngreso = 0, agPendiente = 0;
  agricola.contracts.forEach(c => {
    const lot = config.lots.find(l => l.id === c.lotId);
    if (lot) agIngreso += c.priceUSD_ha * lot.ha;
    c.payments.forEach(p => { if (p.status !== "pagado") agPendiente += p.amount; });
  });
  const agPorHa = agHa > 0 ? agIngreso / agHa : 0;
  const agVsMercado = agricola.marketValueUSD_ha > 0 ? (agPorHa / agricola.marketValueUSD_ha) * 100 : 0;

  // Ganadero
  const gHa = ganadero.assignedHa || 1;
  const totalEV = ganadero.stock.reduce((s, a) => s + a.count * (a.ev || 1), 0);
  const cargaAnimal = totalEV / gHa;
  const totalAnimals = ganadero.stock.reduce((s, a) => s + a.count, 0);
  
  const stockWithADG = ganadero.stock.map(a => {
    const days = Math.max(1, Math.round((Date.now() - new Date(a.entryDate).getTime()) / 86400000));
    const gain = a.currentWeight - a.initialWeight;
    return { ...a, adg: gain / days, days, totalGain: gain * a.count };
  });

  const avgADG = stockWithADG.reduce((s, a) => s + a.adg * a.count, 0) / Math.max(1, totalAnimals);
  const kgCarneHaAnio = gHa > 0 ? (stockWithADG.reduce((s, a) => s + a.totalGain, 0) / gHa) * (365 / 180) : 0; 
  const tasaDestete = ganadero.cowsBase > 0 ? (ganadero.calvesWeaned / ganadero.cowsBase) * 100 : 0;
  const mortalidad = totalAnimals > 0 ? (ganadero.deaths / totalAnimals) * 100 : 0;
  const margenBrutoHa = gHa > 0 ? (ganadero.ingresos - (ganadero.feedingCostUSD_ha * gHa)) / gHa : 0;

  // Pasturas
  const pStats = pasturas.lots.map(pl => ({
    ...pl,
    eficiencia: pl.MS_kg_ha > 0 ? (pl.consumedMS_kg_ha / pl.MS_kg_ha) * 100 : 0,
    balance: pl.MS_kg_ha - pl.consumedMS_kg_ha,
  }));
  const avgEficiencia = pStats.length > 0 ? pStats.reduce((s, p) => s + p.eficiencia, 0) / pStats.length : 0;

  return {
    ag: { ingresoTotal: agIngreso, ingresoPorHa: agPorHa, vsMercado: agVsMercado, haTotal: agHa, pagosPendientes: agPendiente },
    gan: { cargaAnimal, avgADG, kgCarneHaAnio, tasaDestete, mortalidad, margenBrutoHa, totalEV, stockWithADG, totalAnimals },
    past: { pStats, avgEficiencia },
    global: { usdHaTotal: (agIngreso + ganadero.ingresos) / config.totalHa }
  };
}

// ─── COMPONENTE PRINCIPAL ─────────────────────────────────────────────────────
export default function App() {
  const [state, setState] = useState(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem(SK);
      return saved ? JSON.parse(saved) : defaultState;
    }
    return defaultState;
  });

  const [page, setPage] = useState("overview");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [timeRange, setTimeRange] = useState(12);

  useEffect(() => {
    localStorage.setItem(SK, JSON.stringify(state));
  }, [state]);

  const kpis = useMemo(() => calcKPIs(state), [state]);
  const hist = useMemo(() => HISTORY.slice(-timeRange), [timeRange]);

  const update = (path, value) => {
    setState(prev => {
      const next = JSON.parse(JSON.stringify(prev));
      const parts = path.split(".");
      let curr = next;
      for (let i = 0; i < parts.length - 1; i++) curr = curr[parts[i]];
      curr[parts[parts.length - 1]] = value;
      return next;
    });
  };

  const navItems = [
    { id: "overview", icon: "⊞", label: "Dashboard" },
    { id: "ganadero", icon: "🐄", label: "Ganadería" },
    { id: "agricola", icon: "🌾", label: "Agrícola" },
    { id: "pasturas", icon: "🌿", label: "Pasturas" },
    { id: "config", icon: "⚙", label: "Config" },
  ];

  return (
    <div style={{ display: "flex", height: "100vh", background: T.bg, fontFamily: "'DM Sans', sans-serif", overflow: "hidden" }}>
      <style>{FONT_IMPORT}
        {`
          .nav-item { display: flex; align-items:center; gap:12px; padding:10px 14px; border-radius:8px; cursor:pointer; color:#9CA3AF; transition:all 0.2s; margin:2px 8px; }
          .nav-item:hover { background:${T.sidebarHover}; color:white; }
          .nav-item.active { background:${T.sidebarActive}; color:${T.accent}; font-weight:600; }
          .card { background:white; border:1px solid ${T.border}; border-radius:12px; box-shadow: 0 1px 3px rgba(0,0,0,0.02); }
          .inp { width:100%; border:1px solid ${T.border}; border-radius:6px; padding:8px; font-family:inherit; font-size:13px; }
          table { width:100%; border-collapse:collapse; }
          th { text-align:left; font-size:11px; color:${T.textMuted}; padding:12px; border-bottom:1px solid ${T.borderLight}; text-transform:uppercase; }
          td { padding:12px; border-bottom:1px solid ${T.borderLight}; font-size:13px; }
        `}
      </style>

      {/* SIDEBAR */}
      <aside style={{ width: sidebarCollapsed ? 64 : 220, background: T.sidebar, transition: "width 0.3s ease", display: "flex", flexDirection: "column" }}>
        <div style={{ padding: 20, color: T.accent, fontWeight: 800, fontSize: 18, display: "flex", alignItems: "center", gap: 10 }}>
          <span>🚜</span> {!sidebarCollapsed && "CAMPO KPI"}
        </div>
        <nav style={{ flex: 1 }}>
          {navItems.map(n => (
            <div key={n.id} className={`nav-item ${page === n.id ? "active" : ""}`} onClick={() => setPage(n.id)}>
              <span style={{ fontSize: 18 }}>{n.icon}</span> {!sidebarCollapsed && n.label}
            </div>
          ))}
        </nav>
        <div style={{ padding: 15, borderTop: "1px solid rgba(255,255,255,0.05)" }}>
            <button onClick={() => setSidebarCollapsed(!sidebarCollapsed)} style={{ background: "none", border: "none", color: "#6B7280", cursor: "pointer" }}>
                {sidebarCollapsed ? "→" : "← Colapsar"}
            </button>
        </div>
      </aside>

      {/* MAIN */}
      <main style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column" }}>
        <header style={{ height: 60, background: "white", borderBottom: `1px solid ${T.border}`, display: "flex", alignItems: "center", px: 20, padding: "0 20px", justifyContent: "space-between" }}>
          <h1 style={{ fontSize: 16, fontWeight: 700 }}>{navItems.find(n => n.id === page)?.label}</h1>
          <div style={{ display: "flex", gap: 10 }}>
            {[6, 12, 24].map(v => (
              <button key={v} onClick={() => setTimeRange(v)} style={{ padding: "4px 12px", borderRadius: 4, border: `1px solid ${timeRange === v ? T.accent : T.border}`, background: timeRange === v ? T.accent : "none", color: timeRange === v ? "white" : T.textSub, fontSize: 11, cursor: "pointer" }}>{v}M</button>
            ))}
          </div>
        </header>

        <div style={{ padding: 24 }}>
          {page === "overview" && <Overview kpis={kpis} hist={hist} />}
          {page === "ganadero" && <GanaderoPage state={state} setState={setState} kpis={kpis.gan} />}
          {page === "agricola" && <AgricolaPage state={state} setState={setState} kpis={kpis.ag} />}
          {page === "pasturas" && <PasturasPage state={state} kpis={kpis.past} />}
          {page === "config"   && <ConfigPage state={state} update={update} />}
        </div>
      </main>
    </div>
  );
}

// ─── COMPONENTES DE PÁGINA ─────────────────────────────────────────────────────

function Overview({ kpis, hist }) {
  return (
    <div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 20, marginBottom: 24 }}>
        <KPIBadge label="USD/HA TOTAL" value={f0(kpis.global.usdHaTotal)} unit="USD" s={sem(kpis.global.usdHaTotal, 140, 100)} />
        <KPIBadge label="CARGA ANIMAL" value={f1(kpis.gan.cargaAnimal, 2)} unit="EV/ha" s={semInv(kpis.gan.cargaAnimal, 1.1, 1.3)} />
        <KPIBadge label="PROD. CARNE" value={f0(kpis.gan.kgCarneHaAnio)} unit="kg/ha/año" s={sem(kpis.gan.kgCarneHaAnio, 120, 80)} />
        <KPIBadge label="DESTETE" value={f1(kpis.gan.tasaDestete, 0)} unit="%" s={sem(kpis.gan.tasaDestete, 75, 65)} />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 20 }}>
        <ChartCard title="Evolución Margen USD/ha">
          <ResponsiveContainer width="100%" height={250}>
            <AreaChart data={hist}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={T.borderLight} />
              <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fontSize: 10 }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10 }} />
              <Tooltip />
              <Area type="monotone" dataKey="usdHaTotal" stroke={T.accent} fill={T.accent} fillOpacity={0.1} strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>
        
        <div className="card" style={{ padding: 20 }}>
          <h3 style={{ fontSize: 12, fontWeight: 800, color: T.textMuted, marginBottom: 15 }}>ALERTAS</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {kpis.gan.mortalidad > 1.5 && <Alert type="red" text={`Mortalidad elevada: ${f1(kpis.gan.mortalidad)}%`} />}
            {kpis.past.avgEficiencia < 60 && <Alert type="yellow" text="Mejorar eficiencia de cosecha" />}
            <Alert type="green" text="Carga animal balanceada" />
          </div>
        </div>
      </div>
    </div>
  );
}

function GanaderoPage({ state, setState, kpis }) {
  const addStock = () => {
    const next = { ...state };
    next.ganadero.stock.push({ id: Date.now(), category: "Nuevo", count: 0, initialWeight: 0, currentWeight: 0, entryDate: new Date().toISOString().split('T')[0], ev: 0.8 });
    setState(next);
  };

  return (
    <div style={{ display: "grid", gap: 24 }}>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 15 }}>
        <KPIBadge label="ADG PROM" value={f0(kpis.avgADG * 1000)} unit="g/día" />
        <KPIBadge label="TOTAL EV" value={f0(kpis.totalEV)} unit="EV" />
        <KPIBadge label="CABEZAS" value={f0(kpis.totalAnimals)} unit="cab" />
        <KPIBadge label="MORTALIDAD" value={f1(kpis.mortalidad)} unit="%" s={semInv(kpis.mortalidad, 1.2, 2)} />
      </div>

      <div className="card">
        <div style={{ padding: 20, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h3 style={{ fontSize: 14, fontWeight: 700 }}>Inventario de Hacienda</h3>
          <button onClick={addStock} style={{ padding: "6px 12px", borderRadius: 6, background: T.sidebar, color: "white", fontSize: 11, cursor: "pointer", border: "none" }}>+ Agregar Categoría</button>
        </div>
        <table>
          <thead>
            <tr>
              <th>Categoría</th>
              <th>Cantidad</th>
              <th>P. Inicial</th>
              <th>P. Actual</th>
              <th>ADG (g)</th>
              <th>EV Unit</th>
            </tr>
          </thead>
          <tbody>
            {kpis.stockWithADG.map((s, idx) => (
              <tr key={s.id}>
                <td><input className="inp" value={s.category} onChange={e => {
                  const n = {...state}; n.ganadero.stock[idx].category = e.target.value; setState(n);
                }} /></td>
                <td><input className="inp" type="number" value={s.count} onChange={e => {
                   const n = {...state}; n.ganadero.stock[idx].count = parseInt(e.target.value); setState(n);
                }} /></td>
                <td>{s.initialWeight} kg</td>
                <td><input className="inp" type="number" value={s.currentWeight} onChange={e => {
                   const n = {...state}; n.ganadero.stock[idx].currentWeight = parseFloat(e.target.value); setState(n);
                }} /></td>
                <td style={{ fontWeight: 700, color: T.green }}>{f0(s.adg * 1000)}</td>
                <td>{s.ev}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function AgricolaPage({ state, setState, kpis }) {
  return (
    <div style={{ display: "grid", gap: 20 }}>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 20 }}>
        <KPIBadge label="INGRESO HA" value={f0(kpis.ingresoPorHa)} unit="USD/ha" />
        <KPIBadge label="CUMPLIMIENTO" value={f1(kpis.vsMercado)} unit="%" />
        <KPIBadge label="PEND. COBRO" value={f0(kpis.pagosPendientes)} unit="USD" s={kpis.pagosPendientes > 0 ? "yellow" : "green"} />
      </div>
      
      <div className="card" style={{ padding: 20 }}>
        <h3 style={{ marginBottom: 15 }}>Contratos de Alquiler</h3>
        {state.agricola.contracts.map(c => (
          <div key={c.id} style={{ padding: 15, border: `1px solid ${T.borderLight}`, borderRadius: 8, marginBottom: 10 }}>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ fontWeight: 700 }}>{state.config.lots.find(l => l.id === c.lotId)?.name}</span>
              <span style={{ color: T.green, fontWeight: 700 }}>USD {c.priceUSD_ha}/ha</span>
            </div>
            <div style={{ fontSize: 12, color: T.textSub, marginTop: 5 }}>Inicio: {c.startDate} | Duración: {c.durationMonths} meses</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function PasturasPage({ state, kpis }) {
  return (
    <div style={{ display: "grid", gap: 20 }}>
       <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
          <KPIBadge label="EFICIENCIA COSECHA" value={f1(kpis.avgEficiencia)} unit="%" s={sem(kpis.avgEficiencia, 70, 50)} />
          <ChartCard title="Uso de Pasturas (kg MS/ha)">
             <ResponsiveContainer width="100%" height={200}>
                <BarChart data={kpis.pStats}>
                   <XAxis dataKey="lotId" />
                   <YAxis />
                   <Tooltip />
                   <Bar dataKey="MS_kg_ha" fill={T.border} radius={[4, 4, 0, 0]} name="Oferta" />
                   <Bar dataKey="consumedMS_kg_ha" fill={T.green} radius={[4, 4, 0, 0]} name="Consumo" />
                </BarChart>
             </ResponsiveContainer>
          </ChartCard>
       </div>
    </div>
  );
}

function ConfigPage({ state, update }) {
  return (
    <div className="card" style={{ padding: 25, maxWidth: 600 }}>
      <h2 style={{ marginBottom: 20 }}>Configuración General</h2>
      <div style={{ display: "grid", gap: 20 }}>
        <div>
          <label style={{ display: "block", fontSize: 11, fontWeight: 800, color: T.textMuted, marginBottom: 8 }}>SUPERFICIE TOTAL (HA)</label>
          <input className="inp" type="number" value={state.config.totalHa} onChange={e => update("config.totalHa", parseFloat(e.target.value))} />
        </div>
        <div>
          <label style={{ display: "block", fontSize: 11, fontWeight: 800, color: T.textMuted, marginBottom: 8 }}>VALOR MERCADO ALQUILER (USD/HA)</label>
          <input className="inp" type="number" value={state.agricola.marketValueUSD_ha} onChange={e => update("agricola.marketValueUSD_ha", parseFloat(e.target.value))} />
        </div>
        <button onClick={() => { localStorage.removeItem(SK); window.location.reload(); }} style={{ marginTop: 20, padding: 10, background: T.redLight, color: T.red, border: "none", borderRadius: 6, cursor: "pointer", fontWeight: 700 }}>
          Resetear todos los datos
        </button>
      </div>
    </div>
  );
}

// ─── COMPONENTES COMPARTIDOS ───────────────────────────────────────────────────

function KPIBadge({ label, value, unit, s = "neutral" }) {
  const color = SEM_C[s] || T.blue;
  return (
    <div className="card" style={{ padding: 20, borderLeft: `4px solid ${color}` }}>
      <div style={{ fontSize: 10, fontWeight: 800, color: T.textMuted, marginBottom: 5 }}>{label}</div>
      <div style={{ fontSize: 24, fontWeight: 800, color: T.text }}>{value} <span style={{ fontSize: 12, color: T.textSub, fontWeight: 400 }}>{unit}</span></div>
    </div>
  );
}

function ChartCard({ title, children }) {
  return (
    <div className="card" style={{ padding: 20 }}>
      <h3 style={{ fontSize: 13, fontWeight: 700, marginBottom: 20, color: T.textSub }}>{title}</h3>
      {children}
    </div>
  );
}

function Alert({ type, text }) {
  const styles = {
    red: { bg: T.redLight, color: T.red },
    yellow: { bg: T.yellowLight, color: "#92400E" },
    green: { bg: T.greenLight, color: T.green }
  };
  const s = styles[type];
  return (
    <div style={{ padding: "8px 12px", borderRadius: 6, background: s.bg, color: s.color, fontSize: 12, fontWeight: 600 }}>
      {type === "red" ? "●" : "○"} {text}
    </div>
  );
}
